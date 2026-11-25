
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

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useRouter } from 'expo-router';

const CORAL = '#FF5A5F';

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    setMessage('');
    setSuccess(false);

    const cleanEmail = email.trim();

    if (!cleanEmail || !password || !confirmPassword) {
      setMessage('Please fill in all fields.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      setSuccess(true);
      setMessage('Account created successfully!');

      router.replace('/home');
    } catch (error: any) {
      let errorMessage = 'Registration failed. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Please choose a stronger password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Check your internet connection.';
      }

      setMessage(errorMessage);
    } finally {
      setLoading(false);
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

        {/* Registration Form */}
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>

          <Text style={styles.subtitle}>
            Join Nestora and discover amazing stays.
          </Text>

          <Text style={styles.label}>Email Address</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={styles.label}>Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Create a password"
              placeholderTextColor="#999999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />

            <Pressable
              style={styles.showButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>
            Minimum 6 characters
          </Text>

          <Text style={styles.label}>Confirm Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Re-enter your password"
              placeholderTextColor="#999999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              editable={!loading}
            />

            <Pressable
              style={styles.showButton}
              onPress={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              <Text style={styles.showText}>
                {showConfirmPassword ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
          </View>

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

          {/* Register Button */}
          <Pressable
            style={[
              styles.button,
              loading && styles.disabledButton,
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                Create Account
              </Text>
            )}
          </Pressable>

          {/* Login Navigation */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <Pressable
              onPress={() => router.replace('/')}
              disabled={loading}
            >
              <Text style={styles.loginLink}> Login</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.footer}>
          Start your next adventure with Nestora.
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
  hint: {
    fontSize: 12,
    color: '#999999',
    marginTop: 7,
    marginBottom: 21,
  },
  messageBox: {
    padding: 12,
    borderRadius: 9,
    marginTop: 18,
    marginBottom: 10,
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
    marginTop: 15,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  loginText: {
    color: '#666666',
    fontSize: 14,
  },
  loginLink: {
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
