import { StyleSheet, Text, View } from 'react-native';

type UserProfileBadgeProps = {
  initials: string;
  xp: number;
};

export function UserProfileBadge({ initials, xp }: UserProfileBadgeProps) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.xpText}>{xp} xp</Text>
      <View style={styles.profileCircle}>
        <Text style={styles.profileText}>{initials}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  xpText: {
    color: '#f9eeee',
    fontFamily: 'Alata_400Regular',
    fontSize: 15,
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
});
