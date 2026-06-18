import { File } from 'expo-file-system';
import { Platform } from 'react-native';

type GoogleSpeechAlternative = {
  transcript?: string;
};

type GoogleSpeechResult = {
  alternatives?: GoogleSpeechAlternative[];
};

type GoogleSpeechResponse = {
  error?: {
    message?: string;
  };
  results?: GoogleSpeechResult[];
};

const GOOGLE_SPEECH_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY;

function getRecognitionConfig() {
  if (Platform.OS === 'web') {
    return {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
    };
  }

  if (Platform.OS === 'android') {
    return {
      encoding: 'AMR',
      sampleRateHertz: 8000,
    };
  }

  return {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
  };
}

export async function transcribeWithGoogleSpeech(recordingUri: string) {
  if (!GOOGLE_SPEECH_API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY in your Expo environment.');
  }

  const recordingFile = new File(recordingUri);
  const audioContent = await recordingFile.base64();

  const response = await fetch(
    `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_SPEECH_API_KEY}`,
    {
      body: JSON.stringify({
        audio: {
          content: audioContent,
        },
        config: {
          ...getRecognitionConfig(),
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          model: 'latest_long',
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }
  );

  const result = (await response.json()) as GoogleSpeechResponse;

  if (!response.ok) {
    throw new Error(result.error?.message ?? 'Google could not transcribe this recording.');
  }

  const transcript = result.results
    ?.map((speechResult) => speechResult.alternatives?.[0]?.transcript)
    .filter(Boolean)
    .join(' ')
    .trim();

  if (!transcript) {
    throw new Error('Google did not return any transcript text.');
  }

  return transcript;
}
