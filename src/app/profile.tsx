
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useRouter } from 'expo-router';

const CORAL = '#FF5A5F';

export default function ProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const user = auth.currentUser;

  const handleLogout = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setErrorMessage('');

      await signOut(auth);

      // Clear navigation history and return to login.
      router.replace('/');
    } catch (error: any) {
      setErrorMessage(
        error?.message || 'Unable to logout. Please try again.'
      );
      setLoading(false);
      setConfirmLogout(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      <Text style={styles.heading}>My Profile</Text>

      <Text style={styles.subtitle}>
        Manage your Nestora account
      </Text>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase() || 'G'}
          </Text>
        </View>

        <Text style={styles.name}>Welcome to Nestora!</Text>

        <Text style={styles.email}>
          {user?.email || 'Guest User'}
        </Text>

        <View style={styles.memberBadge}>
          <Text style={styles.memberText}>
            Nestora Member
          </Text>
        </View>
      </View>

      {/* Account Section */}
      <Text style={styles.sectionTitle}>Your Account</Text>

      <Pressable
        style={styles.menuItem}
        onPress={() => router.push('/my-bookings')}
      >
        <Text style={styles.menuIcon}>📅</Text>

        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>My Bookings</Text>
          <Text style={styles.menuSubtitle}>
            View your stays
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </Pressable>

      <Pressable
        style={styles.menuItem}
        onPress={() => router.push('/wishlist')}
      >
        <Text style={styles.menuIcon}>❤️</Text>

        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>My Wishlist</Text>
          <Text style={styles.menuSubtitle}>
            Your saved properties
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </Pressable>

      <Pressable
        style={styles.menuItem}
        onPress={() => router.push('/explore')}
      >
        <Text style={styles.menuIcon}>🔍</Text>

        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>Explore Stays</Text>
          <Text style={styles.menuSubtitle}>
            Discover places in Goa
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </Pressable>

      {/* Support Section */}
      <Text style={styles.sectionTitle}>Support</Text>

      <View style={styles.menuItem}>
        <Text style={styles.menuIcon}>ℹ️</Text>

        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>About Nestora</Text>
          <Text style={styles.menuSubtitle}>
            Your Goa stay booking companion
          </Text>
        </View>
      </View>

      {/* Error Message */}
      {errorMessage !== '' && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        </View>
      )}

      {/* Logout Confirmation */}
      {confirmLogout ? (
        <View style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>
            Confirm Logout
          </Text>

          <Text style={styles.confirmSubtitle}>
            Are you sure you want to logout from Nestora?
          </Text>

          <Pressable
            style={styles.confirmLogoutButton}
            onPress={handleLogout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmLogoutText}>
                Yes, Logout
              </Text>
            )}
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() => setConfirmLogout(false)}
            disabled={loading}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={styles.logoutButton}
          onPress={() => {
            setErrorMessage('');
            setConfirmLogout(true);
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      )}

      <Text style={styles.version}>
        NESTORA · Version 1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 17,
    fontWeight: '600',
    color: CORAL,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222222',
  },
  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginTop: 6,
    marginBottom: 25,
  },
  profileCard: {
    backgroundColor: '#FFF3F3',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 45,
    backgroundColor: CORAL,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#222222',
  },
  email: {
    fontSize: 14,
    color: '#666666',
    marginTop: 7,
  },
  memberBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 14,
  },
  memberText: {
    color: CORAL,
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuIcon: {
    fontSize: 23,
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222222',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  arrow: {
    fontSize: 25,
    color: '#999999',
  },
  logoutButton: {
    backgroundColor: '#FFF0F0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
  },
  logoutText: {
    color: CORAL,
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmBox: {
    backgroundColor: '#FFF8F8',
    borderWidth: 1,
    borderColor: '#FFDADA',
    borderRadius: 14,
    padding: 18,
    marginTop: 20,
  },
  confirmTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
  },
  confirmSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  confirmLogoutButton: {
    backgroundColor: CORAL,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmLogoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  cancelText: {
    color: '#555555',
    fontSize: 15,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
  },
  version: {
    textAlign: 'center',
    color: '#AAAAAA',
    fontSize: 11,
    marginTop: 25,
  },
});
