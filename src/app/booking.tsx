
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../../firebase/firebaseConfig';

export default function BookingScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    address?: string;
    city?: string;
  }>();

  const propertyId = String(params.id || '');
  const propertyName = String(params.name || 'Selected Property');
  const propertyAddress = String(params.address || '');
  const propertyCity = String(params.city || 'Goa');

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [loading, setLoading] = useState(false);

  const parseDate = (value: string): Date | null => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return null;
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  };

  const getDayNumber = (date: Date) =>
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ) / 86400000;

  const startDate = parseDate(checkIn);
  const endDate = parseDate(checkOut);

  const nights =
    startDate && endDate
      ? getDayNumber(endDate) - getDayNumber(startDate)
      : 0;

  const handleBooking = async () => {
    if (!auth.currentUser) {
      Alert.alert('Login Required', 'Please log in before booking.');
      return;
    }

    if (!propertyId) {
      Alert.alert(
        'Property Missing',
        'Please go back and select a property again.'
      );
      return;
    }

    const start = parseDate(checkIn);
    const end = parseDate(checkOut);

    if (!start || !end) {
      Alert.alert(
        'Invalid Dates',
        'Enter dates in YYYY-MM-DD format.'
      );
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      Alert.alert('Invalid Check-in', 'Check-in cannot be in the past.');
      return;
    }

    const calculatedNights = getDayNumber(end) - getDayNumber(start);

    if (calculatedNights <= 0) {
      Alert.alert(
        'Invalid Check-out',
        'Check-out must be after check-in.'
      );
      return;
    }

    const guestCount = Number(guests);

    if (
      !Number.isInteger(guestCount) ||
      guestCount < 1 ||
      guestCount > 20
    ) {
      Alert.alert(
        'Invalid Guests',
        'Enter between 1 and 20 guests.'
      );
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, 'bookings'), {
        userId: auth.currentUser.uid,
        propertyId,
        propertyName,
        propertyAddress,
        propertyCity,
        checkIn,
        checkOut,
        guests: guestCount,
        nights: calculatedNights,
        price: null,
        total: null,
        priceStatus: 'Not available',
        status: 'Pending',
        bookingType: 'Booking Request',
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        'Request Submitted!',
        'Your booking request has been saved. Availability and price must still be confirmed.',
        [
          {
            text: 'View My Bookings',
            onPress: () => router.replace('/my-bookings'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Booking error:', error);

      Alert.alert(
        'Booking Failed',
        error?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Booking Request</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.propertyCard}>
          <Text style={styles.smallLabel}>YOUR SELECTED STAY</Text>

          <Text style={styles.propertyName}>{propertyName}</Text>

          <Text style={styles.address}>
            {propertyAddress
              ? `${propertyAddress}, ${propertyCity}`
              : propertyCity}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price per night</Text>
            <Text style={styles.price}>To be confirmed</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Dates</Text>

          <Text style={styles.label}>Check-in date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
            value={checkIn}
            onChangeText={setCheckIn}
            maxLength={10}
          />

          <Text style={styles.label}>Check-out date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
            value={checkOut}
            onChangeText={setCheckOut}
            maxLength={10}
          />

          <Text style={styles.hint}>Example: 2026-12-20</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guests</Text>

          <Text style={styles.label}>Number of guests</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter number of guests"
            placeholderTextColor="#999"
            value={guests}
            onChangeText={setGuests}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-in</Text>
            <Text style={styles.summaryValue}>
              {checkIn || 'Not selected'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-out</Text>
            <Text style={styles.summaryValue}>
              {checkOut || 'Not selected'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Guests</Text>
            <Text style={styles.summaryValue}>{guests}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total nights</Text>
            <Text style={styles.summaryValue}>
              {nights > 0 ? nights : '—'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalPrice}>To be confirmed</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Important Information</Text>
          <Text style={styles.infoText}>
            This is a booking request, not a confirmed reservation.
            Property availability and pricing must be verified separately.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.bookButton, loading && styles.disabledButton]}
          onPress={handleBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.bookButtonText}>
              Submit Booking Request
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Find your perfect stay with Nestora.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 32,
    color: '#222222',
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
  },
  propertyCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    marginBottom: 25,
    elevation: 2,
  },
  smallLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5A5F',
    letterSpacing: 1,
    marginBottom: 10,
  },
  propertyName: {
    fontSize: 21,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 7,
  },
  address: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 20,
  },
  priceRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 14,
    color: '#777777',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF5A5F',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#222222',
    marginBottom: 18,
  },
  hint: {
    fontSize: 12,
    color: '#888888',
    marginTop: -10,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#777777',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF5A5F',
  },
  infoBox: {
    backgroundColor: '#FFF3E8',
    padding: 17,
    borderRadius: 14,
    marginBottom: 22,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9A5A20',
    marginBottom: 7,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#79532F',
  },
  bookButton: {
    height: 56,
    backgroundColor: '#FF5A5F',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 12,
    marginTop: 25,
  },
});
