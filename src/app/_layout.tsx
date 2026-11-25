
import { useEffect, useState } from 'react';

import {
  Stack,
  useRouter,
  usePathname,
} from 'expo-router';

import {
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as SplashScreen from 'expo-splash-screen';

import { auth } from '../../firebase/firebaseConfig';

// Keep the native splash screen visible.
// The browser will use our custom React splash screen instead.
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false);

  // Keep splash screen visible for at least 1.2 seconds.
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumTimeElapsed(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Firebase authentication listener.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // Check whether navigation is required.
  const needsRedirect =
    !loading &&
    (
      (user && (pathname === '/' || pathname === '/register')) ||
      (!user && pathname === '/home')
    );

  // Redirect according to authentication status.
  useEffect(() => {
    if (loading || !needsRedirect) return;

    if (user) {
      router.replace('/home');
    } else {
      router.replace('/');
    }
  }, [loading, needsRedirect, user, router]);

  // Hide native splash only when everything is ready.
  const isReady = !loading && !needsRedirect && minimumTimeElapsed;

  useEffect(() => {
    if (isReady && Platform.OS !== 'web') {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  // Custom splash screen for web.
  const showSplash = Platform.OS === 'web' && !isReady;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#FFFFFF',
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="home" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="property-details" />
        <Stack.Screen name="booking" />
        <Stack.Screen name="wishlist" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="my-bookings" />
      </Stack>

      {showSplash && (
        <View style={styles.splashContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>N</Text>
          </View>

          <Text style={styles.appName}>
            Nestora
          </Text>

          <Text style={styles.tagline}>
            Find your perfect stay
          </Text>

          <ActivityIndicator
            size="large"
            color="#FFFFFF"
            style={styles.loader}
          />

          <Text style={styles.loadingText}>
            Loading your experience...
          </Text>

          <Text style={styles.footer}>
            YOUR STAY, YOUR WAY
          </Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#208AEF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },

  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
  },

  logoText: {
    fontSize: 65,
    fontWeight: 'bold',
    color: '#208AEF',
  },

  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  tagline: {
    fontSize: 15,
    color: '#EAF5FF',
    marginTop: 8,
  },

  loader: {
    marginTop: 45,
  },

  loadingText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 12,
  },

  footer: {
    position: 'absolute',
    bottom: 40,
    color: '#EAF5FF',
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '600',
  },
});
