import { Alata_400Regular, useFonts } from '@expo-google-fonts/alata';
import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Alata_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#f9eeee" size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3a2b3e',
  },
});
