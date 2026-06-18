export type JudgeSide = 'opposition' | 'proposition';

export type DebateJudgeInput = {
  argument: string;
  infoSlide: string;
  motion: string;
  side: JudgeSide;
  userId: string;
};

export type DebateJudgeResult = {
  feedback: string;
  score: number;
};

type OpenAIResponse = {
  error?: {
    message?: string;
  };
  output?: {
    content?: {
      text?: string;
      type?: string;
    }[];
    type?: string;
  }[];
  output_text?: string;
};

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL ?? 'gpt-4.1-mini';
const RETRYABLE_STATUS_CODES = [408, 409, 429, 500, 502, 503, 504];

const JUDGE_PROMPT = `You are a debating judge giving feedback on a primary schooler's argument on debating. You need to assign a score upon 100xp for the argument that they give. You will be given the motion and infoslide, as well as the side they intend to support. I want you to judge their arguments based on content and structure. Do intend to be strict when doing so.

0-10 xp: argument is irrelevant/does not make sense. E.g supporting the wrong side/ not relevant to the motion/incoherent

10-30 xp: argument is relevant but poorly explained. Argument lacks mechanisation and does not follow a coherent structure/does not have enough material to convince a judge. Impacting is minimal/nonexistent.

30-50 xp: argument is fair at supporting the side. Arguments should clearly be aligned to the stance and have some explanation. However the argument might not be very convincing or entirely fleshed out, could use more mechanisation. E.g. argument does not consider/mention important stakeholders in the debate, or lacks a comparative and only has positive/negative material. Arguments also have fair structure to clearly show different substantives. Impacting is minimal/not enough.

50-75 xp: argument is well thought out but not perfect. Argument is clearly supporting the side and characterises multiple stakeholders clearly. Argument makes use of clear mechanisation and a flow of logic that a judge can understand. Signposting is prevalent throughout the argument and the debater is clear when demonstrating their understanding of the motion and its implications. Impacting is well fleshed out and tells the judge why they need to care clearly through their arguments. Arguments could use more weighing/demonstrate the comparative and how it is better on their side. Arguments need a clearer balance of positive and negative material.

75-95 xp: Argument is very good. Argument strongly defends the side it needs to be on and the main stakeholders and their incentives/capacity are clearly explained. Argument breaks down logical flow of their substantives to the judge, even using emotional rhetoric and real world examples to support their claims. Assertions are all clearly based in reality and well explained. Signposting is extremely clear (e.g. "I have 3 structural reasons for this). Impacting is included at the end of each substantive and the debater weighs their impacts vs. those on the other side. Arguments have both positive and negative material such that what is presented is well rounded and the judge is convinced of their case.

This is the criterion by which the score is decided. Feedback is given this way:

Score: xx/100 xp

What you have done well: Refer to the rubrics for feedback points

What you can do to improve: Refer to the rubrics for feedback points

Maintain a clear and neutral tone such that the language is understandable by a pre-teen with a good command of the English language. Remain professional and formal at all times. Be strict when marking their arguments such that they always know how to improve.

Return only the feedback in the required format.
The first line must be exactly: Score: xx/100 xp
Only write the score once.
Use exactly these two section headings after the score:
What you have done well:
What you can do to improve:
Do not use markdown headings or bullet symbols.`;

export async function judgeDebateArgument(input: DebateJudgeInput): Promise<DebateJudgeResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OpenAI setup. Add EXPO_PUBLIC_OPENAI_API_KEY to your Expo environment.');
  }

  const result = await createJudgeResponse(input);

  const feedback = getOpenAIText(result);
  const score = extractScore(feedback);

  return {
    feedback,
    score,
  };
}

async function createJudgeResponse(input: DebateJudgeInput) {
  let lastError = 'OpenAI could not judge this argument.';

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch('https://api.openai.com/v1/responses', {
      body: JSON.stringify({
        input: buildJudgeRequest(input),
        instructions: JUDGE_PROMPT,
        max_output_tokens: 500,
        model: OPENAI_MODEL,
        temperature: 0.2,
      }),
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const result = (await response.json()) as OpenAIResponse;

    if (response.ok) {
      return result;
    }

    lastError = result.error?.message ?? lastError;

    if (!RETRYABLE_STATUS_CODES.includes(response.status) || attempt === 2) {
      throw new Error(getOpenAIErrorMessage(lastError, response.status));
    }

    await delay(800 * (attempt + 1));
  }

  throw new Error(getOpenAIErrorMessage(lastError));
}

function delay(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function getOpenAIErrorMessage(message: string, status?: number) {
  if (status && RETRYABLE_STATUS_CODES.includes(status)) {
    return `${message} The app tried again automatically, but OpenAI still could not complete the judging request. Please submit again in a moment.`;
  }

  return message;
}

function buildJudgeRequest(input: DebateJudgeInput) {
  return `Motion: ${input.motion}

Info slide: ${input.infoSlide}

Student side: ${input.side === 'proposition' ? 'Proposition' : 'Opposition'}

Student argument:
${input.argument}`;
}

function getOpenAIText(result: OpenAIResponse) {
  const feedback =
    result.output_text?.trim() ||
    result.output
      ?.flatMap((outputItem) => outputItem.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join('\n')
      .trim();

  if (!feedback) {
    throw new Error('OpenAI did not return judge feedback.');
  }

  return feedback;
}

function extractScore(feedback: string) {
  const scoreMatch = feedback.match(/score:\s*(\d{1,3})\s*\/\s*100\s*xp/i);
  const fallbackMatch = feedback.match(/\b(\d{1,3})\s*(?:\/\s*100)?\s*xp\b/i);
  const score = Number(scoreMatch?.[1] ?? fallbackMatch?.[1]);

  if (!Number.isFinite(score)) {
    throw new Error('OpenAI feedback did not include a valid XP score.');
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
