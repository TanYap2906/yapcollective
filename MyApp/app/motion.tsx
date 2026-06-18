import { Ionicons } from '@expo/vector-icons';
import {
  AudioQuality,
  AudioModule,
  IOSOutputFormat,
  RecordingOptions,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { UserProfileBadge } from '@/components/UserProfileBadge';
import { XpPopup } from '@/components/XpPopup';
import { judgeDebateArgument } from '@/services/openaiJudge';
import { transcribeWithGoogleSpeech } from '@/services/googleSpeech';
import {
  awardXpOnce,
  getCurrentUser,
  getMotionArgument,
  getMotionFeedback,
  hasSubmittedMotion,
  markMotionSubmitted,
  MotionFeedback,
  saveMotionFeedback,
  saveMotionArgument,
  UserProfile,
} from '@/storage/database';

const infoSlideText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse in lacus sit amet dui viverra volutpat quis nec augue. Mauris viverra pharetra lorem sed maximus.';
const practiceMotion = 'THS amnesty for dictators';
const MOTION_ID = 'ths-amnesty-for-dictators';
const PROPOSITION_SUBMISSION_ID = `${MOTION_ID}-proposition`;
const OPPOSITION_SUBMISSION_ID = `${MOTION_ID}-opposition`;
type ArgumentSide = 'opposition' | 'proposition';
const SPEECH_RECORDING_OPTIONS: RecordingOptions = {
  android: {
    audioEncoder: 'amr_nb',
    audioSource: 'voice_recognition',
    extension: '.3gp',
    outputFormat: '3gp',
    sampleRate: 8000,
  },
  bitRate: 12800,
  extension: Platform.OS === 'web' ? '.webm' : Platform.OS === 'android' ? '.3gp' : '.wav',
  ios: {
    audioQuality: AudioQuality.HIGH,
    extension: '.wav',
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
    outputFormat: IOSOutputFormat.LINEARPCM,
    sampleRate: 16000,
  },
  numberOfChannels: 1,
  sampleRate: Platform.OS === 'android' ? 8000 : 16000,
  web: {
    bitsPerSecond: 128000,
    mimeType: 'audio/webm;codecs=opus',
  },
};

export default function WeeklyMotionScreen() {
  const router = useRouter();
  const audioRecorder = useAudioRecorder(SPEECH_RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [proposition, setProposition] = useState('');
  const [opposition, setOpposition] = useState('');
  const [recordingSide, setRecordingSide] = useState<ArgumentSide | null>(null);
  const [transcribingSide, setTranscribingSide] = useState<ArgumentSide | null>(null);
  const [judgingSide, setJudgingSide] = useState<ArgumentSide | null>(null);
  const [feedbackBySide, setFeedbackBySide] = useState<Record<ArgumentSide, MotionFeedback | null>>({
    opposition: null,
    proposition: null,
  });
  const [submittedSides, setSubmittedSides] = useState({
    opposition: false,
    proposition: false,
  });
  const [xpPopup, setXpPopup] = useState<{ amount: number; message: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      const savedUser = await getCurrentUser();

      if (savedUser) {
        setUser(savedUser);
        setSubmittedSides({
          opposition: await hasSubmittedMotion(savedUser.uid, OPPOSITION_SUBMISSION_ID),
          proposition: await hasSubmittedMotion(savedUser.uid, PROPOSITION_SUBMISSION_ID),
        });
        setProposition(await getMotionArgument(savedUser.uid, PROPOSITION_SUBMISSION_ID));
        setOpposition(await getMotionArgument(savedUser.uid, OPPOSITION_SUBMISSION_ID));
        setFeedbackBySide({
          opposition: await getMotionFeedback(savedUser.uid, OPPOSITION_SUBMISSION_ID),
          proposition: await getMotionFeedback(savedUser.uid, PROPOSITION_SUBMISSION_ID),
        });
      } else {
        router.replace('/login');
      }
    }

    loadUser();
  }, [router]);

  useEffect(() => {
    async function prepareRecorder() {
      const permission = await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Microphone permission',
          'Please allow microphone access if you want to speak your debate arguments.'
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
    }

    prepareRecorder();
  }, []);

  const initials = getInitials(user?.fullName);

  const handleSubmit = async (side: ArgumentSide, text: string) => {
    if (!user) {
      return;
    }

    if (submittedSides[side]) {
      return;
    }

    if (!text.trim()) {
      Alert.alert('Add an argument', `Please write your ${side} argument first.`);
      return;
    }

    const submissionId = side === 'proposition' ? PROPOSITION_SUBMISSION_ID : OPPOSITION_SUBMISSION_ID;

    try {
      setJudgingSide(side);
      const judgeResult = await judgeDebateArgument({
        argument: text,
        infoSlide: infoSlideText,
        motion: practiceMotion,
        side,
        userId: user.uid,
      });

      await saveMotionArgument(user.uid, submissionId, text);
      await saveMotionFeedback(user.uid, submissionId, judgeResult);
      await markMotionSubmitted(user.uid, submissionId);
      setFeedbackBySide((currentFeedback) => ({ ...currentFeedback, [side]: judgeResult }));
      setSubmittedSides((currentSides) => ({ ...currentSides, [side]: true }));

      const result = await awardXpOnce(user.uid, `motion-submit-${submissionId}`, judgeResult.score);

      if (result.user) {
        setUser(result.user);
      }

      if (result.awarded) {
        setXpPopup({
          amount: judgeResult.score,
          message: `Your ${side} case was judged!`,
        });
      }
    } catch (error) {
      Alert.alert(
        'AI judge',
        error instanceof Error ? error.message : 'The AI judge could not review this argument.'
      );
    } finally {
      setJudgingSide(null);
    }
  };

  const appendTranscript = (side: ArgumentSide, transcript: string) => {
    const updateText = side === 'proposition' ? setProposition : setOpposition;

    updateText((currentText) => {
      const trimmedText = currentText.trim();

      if (!trimmedText) {
        return transcript;
      }

      return `${trimmedText}\n${transcript}`;
    });
  };

  const handleSpeechToText = async (side: ArgumentSide) => {
    if (submittedSides[side] || transcribingSide) {
      return;
    }

    try {
      if (recordingSide) {
        const sideToUpdate = recordingSide;
        await audioRecorder.stop();
        setRecordingSide(null);

        if (!audioRecorder.uri) {
          throw new Error('No recording file was created. Please try again.');
        }

        setTranscribingSide(sideToUpdate);
        const transcript = await transcribeWithGoogleSpeech(audioRecorder.uri);
        appendTranscript(sideToUpdate, transcript);
        return;
      }

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setRecordingSide(side);
    } catch (error) {
      setRecordingSide(null);
      Alert.alert(
        'Speech to text',
        error instanceof Error ? error.message : 'Could not turn this recording into text.'
      );
    } finally {
      setTranscribingSide(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={34} color="#cb8ba6" />
            </TouchableOpacity>

            <UserProfileBadge initials={initials} profileImageUri={user?.profileImageUri} xp={user?.xp ?? 0} />
          </View>

          <View style={styles.motionCard}>
            <Text style={styles.motionHeading}>{"This week's practice motion is:"}</Text>
            <View style={styles.motionBox}>
              <Text style={styles.motionText}>{practiceMotion}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Info Slide:</Text>
            <Text style={styles.infoText}>{infoSlideText}</Text>
          </View>

          <ArgumentInput
            title="Input your Proposition arguments:"
            value={proposition}
            onChangeText={setProposition}
            onSubmit={() => handleSubmit('proposition', proposition)}
            onSpeechPress={() => handleSpeechToText('proposition')}
            isRecording={recordingSide === 'proposition' && recorderState.isRecording}
            isSpeechDisabled={Boolean(transcribingSide) || Boolean(recordingSide && recordingSide !== 'proposition')}
            isTranscribing={transcribingSide === 'proposition'}
            isJudging={judgingSide === 'proposition'}
            feedback={feedbackBySide.proposition}
            submitted={submittedSides.proposition}
          />

          <ArgumentInput
            darker
            title="Input your Opposition arguments:"
            value={opposition}
            onChangeText={setOpposition}
            onSubmit={() => handleSubmit('opposition', opposition)}
            onSpeechPress={() => handleSpeechToText('opposition')}
            isRecording={recordingSide === 'opposition' && recorderState.isRecording}
            isSpeechDisabled={Boolean(transcribingSide) || Boolean(recordingSide && recordingSide !== 'opposition')}
            isTranscribing={transcribingSide === 'opposition'}
            isJudging={judgingSide === 'opposition'}
            feedback={feedbackBySide.opposition}
            submitted={submittedSides.opposition}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      <XpPopup
        amount={xpPopup?.amount ?? 0}
        message={xpPopup?.message ?? ''}
        visible={Boolean(xpPopup)}
        onClose={() => setXpPopup(null)}
      />
    </SafeAreaView>
  );
}

type ArgumentInputProps = {
  darker?: boolean;
  feedback: MotionFeedback | null;
  isJudging: boolean;
  isRecording: boolean;
  isSpeechDisabled: boolean;
  isTranscribing: boolean;
  onChangeText: (text: string) => void;
  onSpeechPress: () => void;
  onSubmit: () => void;
  submitted: boolean;
  title: string;
  value: string;
};

function ArgumentInput({
  darker,
  feedback,
  isJudging,
  isRecording,
  isSpeechDisabled,
  isTranscribing,
  onChangeText,
  onSpeechPress,
  onSubmit,
  submitted,
  title,
  value,
}: ArgumentInputProps) {
  const speechLabel = isTranscribing ? 'Transcribing...' : isRecording ? 'Stop' : 'Speak';
  const submitLabel = isJudging ? 'Judging...' : 'Submit';

  return (
    <View style={[styles.inputCard, darker && styles.inputCardDark]}>
      <Text style={styles.inputTitle}>{title}</Text>
      {submitted ? (
        <>
          <TextInput
            editable={false}
            multiline
            style={styles.textInput}
            textAlignVertical="top"
            value={value}
          />
          <Text style={styles.submittedText}>You have already submitted your arguments.</Text>
          {feedback ? <JudgeFeedback feedback={feedback} /> : null}
        </>
      ) : (
        <>
          <TextInput
            multiline
            placeholder="Start brainstorming..."
            placeholderTextColor="#eab8b9"
            style={styles.textInput}
            textAlignVertical="top"
            value={value}
            onChangeText={onChangeText}
          />
          <View style={styles.inputActionRow}>
            <TouchableOpacity
              style={[
                styles.speechButton,
                isRecording && styles.speechButtonRecording,
                isSpeechDisabled && !isRecording && styles.speechButtonDisabled,
              ]}
              activeOpacity={0.85}
              disabled={isSpeechDisabled && !isRecording}
              onPress={onSpeechPress}
            >
              <Ionicons name={isRecording ? 'stop' : 'mic'} size={15} color="#f9eeee" />
              <Text style={styles.speechText}>{speechLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, isJudging && styles.submitButtonDisabled]}
              activeOpacity={0.85}
              disabled={isJudging}
              onPress={onSubmit}
            >
              <Text style={styles.submitText}>{submitLabel}</Text>
              <Ionicons name="arrow-forward" size={15} color="#f9eeee" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

function JudgeFeedback({ feedback }: { feedback: MotionFeedback }) {
  const sections = parseJudgeFeedback(feedback.feedback);

  return (
    <View style={styles.feedbackContainer}>
      <Text style={styles.feedbackScore}>Score: {feedback.score}/100 xp</Text>

      <View style={styles.feedbackCard}>
        <Text style={styles.feedbackTitle}>What you did well</Text>
        <Text style={styles.feedbackText}>{sections.doneWell}</Text>
      </View>

      <View style={styles.feedbackCard}>
        <Text style={styles.feedbackTitle}>What you can do better</Text>
        <Text style={styles.feedbackText}>{sections.improve}</Text>
      </View>
    </View>
  );
}

function parseJudgeFeedback(feedbackText: string) {
  const withoutScore = feedbackText
    .replace(/score:\s*\d{1,3}\s*\/\s*100\s*xp/gi, '')
    .trim();

  const doneWellMatch = withoutScore.match(
    /what you (?:have done well|did well):\s*([\s\S]*?)(?=what you (?:can do to improve|can do better|could improve):|$)/i
  );
  const improveMatch = withoutScore.match(
    /what you (?:can do to improve|can do better|could improve):\s*([\s\S]*)/i
  );

  const doneWell = cleanFeedbackSection(doneWellMatch?.[1]);
  const improve = cleanFeedbackSection(improveMatch?.[1]);

  return {
    doneWell: doneWell || 'Your argument has been submitted for judging.',
    improve: improve || cleanFeedbackSection(withoutScore) || 'Keep developing clearer structure and stronger impacts.',
  };
}

function cleanFeedbackSection(text?: string) {
  if (!text) {
    return '';
  }

  return text
    .replace(/what you (?:have done well|did well|can do to improve|can do better|could improve):/gi, '')
    .replace(/^[\s*-]+/gm, '')
    .trim();
}

function getInitials(name?: string) {
  if (!name) {
    return '';
  }

  return name
    .split(' ')
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3a2b3e' },
  keyboardView: { flex: 1 },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    maxWidth: 430,
    paddingBottom: 24,
    paddingHorizontal: 22,
    paddingTop: 34,
    width: '100%',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 44,
  },
  iconButton: {
    height: 48,
    justifyContent: 'center',
    width: 52,
  },
  profileCircle: {
    alignItems: 'center',
    backgroundColor: '#eab8b9',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  profileText: {
    color: '#3a2b3e',
    fontFamily: 'Alata_400Regular',
    fontSize: 18,
  },
  motionCard: {
    backgroundColor: '#64385c',
    borderRadius: 22,
    marginBottom: 13,
    padding: 12,
  },
  motionHeading: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  motionBox: {
    alignItems: 'center',
    backgroundColor: '#cb8ba6',
    borderRadius: 13,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: 10,
  },
  motionText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 24,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#cb8ba6',
    borderRadius: 16,
    marginBottom: 17,
    padding: 16,
  },
  infoTitle: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 20,
    textAlign: 'center',
  },
  infoText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 4,
  },
  inputCard: {
    backgroundColor: '#eab8b9',
    borderRadius: 22,
    marginBottom: 14,
    padding: 12,
  },
  inputCardDark: {
    backgroundColor: '#cb8ba6',
  },
  inputTitle: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 19,
    marginBottom: 10,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#f9eeee',
    borderRadius: 15,
    color: '#3a2b3e',
    fontFamily: 'Alata_400Regular',
    fontSize: 15,
    minHeight: 74,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputActionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  speechButton: {
    alignItems: 'center',
    backgroundColor: '#64385c',
    borderRadius: 15,
    flexDirection: 'row',
    gap: 5,
    minHeight: 25,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  speechButtonDisabled: {
    opacity: 0.55,
  },
  speechButtonRecording: {
    backgroundColor: '#3a2b3e',
  },
  speechText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 14,
  },
  submitButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#64385c',
    borderRadius: 15,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 14,
  },
  submittedText: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'right',
  },
  feedbackContainer: {
    backgroundColor: '#64385c',
    borderRadius: 16,
    marginTop: 12,
    padding: 12,
  },
  feedbackScore: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  feedbackCard: {
    backgroundColor: '#cb8ba6',
    borderRadius: 13,
    marginTop: 8,
    padding: 11,
  },
  feedbackTitle: {
    color: '#64385c',
    fontFamily: 'Alata_400Regular',
    fontSize: 15,
    marginBottom: 5,
  },
  feedbackText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
});
