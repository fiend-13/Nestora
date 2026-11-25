
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';

import { auth } from '../../firebase/firebaseConfig';
import { useRouter } from 'expo-router';

const CORAL = '#FF5A5F';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = async () => {
    setMessage('');
    setSuccess(false);

    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      router.replace('/home');
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';

      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        errorMessage = 'Incorrect email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Check your internet connection.';
      }

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setMessage('');
    setSuccess(false);

    if (!email.trim()) {
      setMessage('Please enter your email address first.');
      return;
    }

    try {
      setResetLoading(true);

      await sendPasswordResetEmail(auth, email.trim());

      setSuccess(true);
      setMessage('Password reset email sent. Check your inbox.');
    } catch (error: any) {
      setMessage('Unable to send reset email. Check your email address.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>N</Text>
          </View>

          <Text style={styles.brandName}>Nestora</Text>
          <Text style={styles.tagline}>
            Find your perfect stay in Goa
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back!</Text>

          <Text style={styles.subtitle}>
            Login to continue your journey.
          </Text>

          <Text style={styles.label}>Email Address</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading && !resetLoading}
          />

          <Text style={styles.label}>Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading && !resetLoading}
            />

            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showButton}
            >
              <Text style={styles.showText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.forgotButton}
            onPress={handleForgotPassword}
            disabled={loading || resetLoading}
          >
            {resetLoading ? (
              <ActivityIndicator color={CORAL} size="small" />
            ) : (
              <Text style={styles.forgotText}>
                Forgot Password?
              </Text>
            )}
          </Pressable>

          {/* Message */}
          {message !== '' && (
            <View
              style={[
                styles.messageBox,
                success ? styles.successBox : styles.errorBox,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  success ? styles.successText : styles.errorText,
                ]}
              >
                {message}
              </Text>
            </View>
          )}

          {/* Login Button */}
          <Pressable
            style={[
              styles.button,
              loading && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={loading || resetLoading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </Pressable>

          {/* Register */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Don't have an account?
            </Text>

            <Pressable
              onPress={() => router.push('/register')}
              disabled={loading}
            >
              <Text style={styles.registerLink}> Register</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.footer}>
          Your next getaway starts with Nestora.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 35,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: CORAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: 'bold',
  },
  brandName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#222222',
    marginTop: 12,
  },
  tagline: {
    color: '#777777',
    fontSize: 14,
    marginTop: 5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222222',
  },
  subtitle: {
    color: '#777777',
    fontSize: 14,
    marginTop: 7,
    marginBottom: 27,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 9,
  },
  input: {
    height: 53,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 11,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#222222',
    marginBottom: 21,
    backgroundColor: '#FAFAFA',
  },
  passwordContainer: {
    height: 53,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#222222',
  },
  showButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  showText: {
    color: CORAL,
    fontWeight: 'bold',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 15,
    marginBottom: 20,
    minHeight: 22,
    justifyContent: 'center',
  },
  forgotText: {
    color: CORAL,
    fontSize: 13,
    fontWeight: '600',
  },
  messageBox: {
    padding: 12,
    borderRadius: 9,
    marginBottom: 15,
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
  },
  successBox: {
    backgroundColor: '#EAF8EF',
  },
  messageText: {
    fontSize: 13,
  },
  errorText: {
    color: '#C62828',
  },
  successText: {
    color: '#267A43',
  },
  button: {
    height: 53,
    backgroundColor: CORAL,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  registerText: {
    color: '#666666',
    fontSize: 14,
  },
  registerLink: {
    color: CORAL,
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 12,
    marginTop: 25,
  },
});
