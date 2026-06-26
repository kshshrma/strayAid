import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/components/useColorScheme';
import { SocketProvider } from '../src/context/SocketContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  // Load onboarding completion state on mount
  useEffect(() => {
    AsyncStorage.getItem('hasCompletedOnboarding')
      .then((val) => {
        setHasOnboarded(val === 'true');
      })
      .catch((err) => {
        console.error('Failed to read onboarding state:', err);
        setHasOnboarded(false); // fallback to showing onboarding
      });
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && hasOnboarded !== null) {
      SplashScreen.hideAsync();
    }
  }, [loaded, hasOnboarded]);

  if (!loaded || hasOnboarded === null) {
    return null;
  }

  return <RootLayoutNav initialHasOnboarded={hasOnboarded} />;
}

interface RootLayoutNavProps {
  initialHasOnboarded: boolean;
}

function RootLayoutNav({ initialHasOnboarded }: RootLayoutNavProps) {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [hasOnboarded, setHasOnboarded] = useState(initialHasOnboarded);

  // Setup layout guard routing to redirect to onboarding if missing completion key
  useEffect(() => {
    const checkState = async () => {
      try {
        const val = await AsyncStorage.getItem('hasCompletedOnboarding');
        const completed = val === 'true';
        setHasOnboarded(completed);

        const inTabsGroup = segments[0] === '(tabs)';
        const inOnboarding = segments[0] === 'onboarding';

        if (!completed && !inOnboarding) {
          // If not completed onboarding and not currently on the onboarding screen, redirect there
          router.replace('/onboarding');
        } else if (completed && inOnboarding) {
          // If already completed onboarding but trying to access the onboarding page, redirect to dashboard tabs
          router.replace('/(tabs)');
        }
      } catch (err) {
        console.warn(err);
      }
    };

    checkState();
  }, [segments]);

  return (
    <SocketProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="incident/[id]" options={{ title: 'Operations Room', headerBackTitle: 'Feed' }} />
        </Stack>
      </ThemeProvider>
    </SocketProvider>
  );
}
