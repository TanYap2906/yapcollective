import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type UserProfileBadgeProps = {
  initials: string;
  profileImageUri?: string;
  xp: number;
};

export function UserProfileBadge({ initials, profileImageUri, xp }: UserProfileBadgeProps) {
  const router = useRouter();

  return (
    <View style={styles.profileRow}>
      <View style={styles.xpPill}>
        <Text style={styles.xpText}>{xp} xp</Text>
      </View>
      <TouchableOpacity
        accessibilityLabel="Open settings"
        activeOpacity={0.82}
        style={styles.profileCircle}
        onPress={() => router.push('/settings')}
      >
        {profileImageUri ? (
          <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
        ) : (
          <Text style={styles.profileText}>{initials}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  xpPill: {
    alignItems: 'center',
    backgroundColor: '#64385c',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 34,
    minWidth: 78,
    paddingHorizontal: 14,
  },
  xpText: {
    color: '#eab8b9',
    fontFamily: 'Alata_400Regular',
    fontSize: 18,
  },
  profileCircle: {
    alignItems: 'center',
    backgroundColor: '#eab8b9',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 52,
  },
  profileImage: {
    height: '100%',
    width: '100%',
  },
  profileText: {
    color: '#3a2b3e',
    fontFamily: 'Alata_400Regular',
    fontSize: 18,
  },
});
