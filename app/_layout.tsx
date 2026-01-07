import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { hasCompletedOnboarding } from '@/utils/onboarding';
import * as Sentry from '@sentry/react-native';
import { Stack } from "expo-router";
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

Sentry.init({
  dsn: "https://6dbaf618bbf4cd125d13d9183ea04457@o4510502727909376.ingest.de.sentry.io/4510502825033808",
  debug: true, // Bật debug để thấy log Sentry trong console khi chạy dev
  tracesSampleRate: 1.0,
  // Tự động đo lường hiệu năng của React Navigation (chuyển trang)
  integrations: [
    Sentry.reactNativeTracingIntegration(),
  ],
});


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await hasCompletedOnboarding();
      setInitialRoute(completed ? '(tabs)' : 'onboarding');
    };
    checkOnboarding();
  }, []);

  // Hiển thị loading trong lúc kiểm tra
  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <Stack initialRouteName={initialRoute}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
