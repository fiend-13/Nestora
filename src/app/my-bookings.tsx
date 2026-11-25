
import { useCallback, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';

import { useRouter, useFocusEffect } from 'expo-router';

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../../firebase/firebaseConfig';

const CORAL = '#FF5A5F';

type Booking = {
  id: string;
  propertyName: string;
  propertyAddress: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  price: number | null;
  total: number | null;
  status: string;
  createdAt?: any;
};

export default function MyBookingsScreen() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // ==========================================
  // FETCH BOOKINGS FROM FIREBASE
  // ==========================================

  const fetchBookings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setMessage('');

      const user = auth.currentUser;

      if (!user) {
        setBookings([]);
        setMessage('Please log in to view your booking requests.');
        return;
      }

      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(bookingsQuery);

      const bookingList: Booking[] = snapshot.docs.map((item) => {
        const data = item.data();

        return {
          id: item.id,

          propertyName: data.propertyName || 'Goa Property',

          propertyAddress: data.propertyAddress || '',

          checkIn: data.checkIn || '',

          checkOut: data.checkOut || '',

          guests: Number(data.guests || 1),

          nights: Number(data.nights || 0),

          price:
            typeof data.price === 'number'
              ? data.price
              : null,

          total:
            typeof data.total === 'number'
              ? data.total
              : null,

          status: data.status || 'Pending',

          createdAt: data.createdAt,
        };
      });

      // Sort newest bookings first.
      bookingList.sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || 0;
        const dateB = b.createdAt?.toMillis?.() || 0;

        return dateB - dateA;
      });

      setBookings(bookingList);

    } catch (error: any) {
      console.error('Fetch Bookings Error:', error);

      setMessage(
        error?.message ||
        'Unable to load bookings. Please try again.'
      );

      setMessageType('error');

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Automatically refresh when the screen is focused.
  useFocusEffect(
    useCallback(() => {
      fetchBookings();

      return undefined;
    }, [fetchBookings])
  );

  // ==========================================
  // BACK BUTTON
  // ==========================================

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  // ==========================================
  // CANCEL BOOKING REQUEST
  // ==========================================

  const cancelBooking = async (bookingId: string) => {
    if (cancelingId) return;

    try {
      const user = auth.currentUser;

      if (!user) {
        setMessage('Please log in to cancel a booking.');
        setMessageType('error');
        return;
      }

      setCancelingId(bookingId);
      setMessage('');

      // Check that the booking belongs to this user.
      const selectedBooking = bookings.find(
        (booking) => booking.id === bookingId
      );

      if (!selectedBooking) {
        throw new Error('Booking not found.');
      }

      if (selectedBooking.status === 'Cancelled') {
        setMessage('This booking is already cancelled.');
        setMessageType('error');
        return;
      }

      // Update status instead of deleting the document.
      await updateDoc(
        doc(db, 'bookings', bookingId),
        {
          status: 'Cancelled',
          cancelledAt: serverTimestamp(),
        }
      );

      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: 'Cancelled' }
            : booking
        )
      );

      setMessage('Booking request cancelled successfully.');
      setMessageType('success');

    } catch (error: any) {
      console.error('Cancel Booking Error:', error);

      setMessage(
        error?.message ||
        'Unable to cancel booking. Please try again.'
      );

      setMessageType('error');

    } finally {
      setCancelingId(null);
    }
  };

  // ==========================================
  // STATUS COLOURS
  // ==========================================

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return styles.confirmedStatus;

      case 'cancelled':
        return styles.cancelledStatus;

      default:
        return styles.pendingStatus;
    }
  };

  // ==========================================
  // FORMAT PRICE
  // ==========================================

  const formatPrice = (amount: number | null) => {
    if (amount === null || !Number.isFinite(amount)) {
      return 'To be confirmed';
    }

    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // ==========================================
  // SCREEN UI
  // ==========================================

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchBookings(true)}
            tintColor={CORAL}
          />
        }
      >

        {/* BACK BUTTON */}
        <Pressable
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        {/* HEADER */}
        <Text style={styles.heading}>
          My Bookings
        </Text>

        <Text style={styles.subtitle}>
          Manage your Goa stays and booking requests.
        </Text>

        {/* BOOKING COUNT */}
        <View style={styles.countCard}>
          <View>
            <Text style={styles.countNumber}>
              {bookings.length}
            </Text>

            <Text style={styles.countLabel}>
              Total Booking Requests
            </Text>
          </View>

          <Text style={styles.countIcon}>🏡</Text>
        </View>

        {/* REFRESH BUTTON */}
        <Pressable
          style={[
            styles.refreshButton,
            loading && styles.disabledButton,
          ]}
          onPress={() => fetchBookings(true)}
          disabled={loading || refreshing}
        >
          <Text style={styles.refreshText}>
            ↻ Refresh Bookings
          </Text>
        </Pressable>

        {/* MESSAGE */}
        {message !== '' && (
          <View
            style={[
              styles.messageBox,
              messageType === 'success'
                ? styles.successBox
                : styles.errorBox,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                messageType === 'success'
                  ? styles.successText
                  : styles.errorText,
              ]}
            >
              {message}
            </Text>
          </View>
        )}

        {/* LOADING */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color={CORAL}
            />

            <Text style={styles.loadingText}>
              Loading your bookings...
            </Text>
          </View>

        ) : bookings.length === 0 ? (

          /* EMPTY STATE */
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🏡
            </Text>

            <Text style={styles.emptyTitle}>
              No Bookings Yet
            </Text>

            <Text style={styles.emptyDescription}>
              Your booking requests will appear here
              after you submit a request for a property.
            </Text>

            <Pressable
              style={styles.exploreButton}
              onPress={() => router.push('/explore')}
            >
              <Text style={styles.exploreButtonText}>
                Explore Properties
              </Text>
            </Pressable>
          </View>

        ) : (

          /* BOOKING LIST */
          <>
            <Text style={styles.sectionTitle}>
              Your Booking Requests
            </Text>

            {bookings.map((booking) => (

              <View
                key={booking.id}
                style={styles.bookingCard}
              >

                {/* CARD HEADER */}
                <View style={styles.cardHeader}>
                  <View style={styles.propertyHeading}>
                    <Text style={styles.propertyName}>
                      {booking.propertyName}
                    </Text>

                    {!!booking.propertyAddress && (
                      <Text style={styles.propertyAddress}>
                        📍 {booking.propertyAddress}
                      </Text>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.status,
                      getStatusStyle(booking.status),
                    ]}
                  >
                    {booking.status}
                  </Text>
                </View>

                <View style={styles.separator} />

                {/* CHECK-IN */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Check-in
                  </Text>

                  <Text style={styles.detailValue}>
                    {booking.checkIn || 'Not available'}
                  </Text>
                </View>

                {/* CHECK-OUT */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Check-out
                  </Text>

                  <Text style={styles.detailValue}>
                    {booking.checkOut || 'Not available'}
                  </Text>
                </View>

                {/* GUESTS */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Guests
                  </Text>

                  <Text style={styles.detailValue}>
                    {booking.guests}
                  </Text>
                </View>

                {/* NIGHTS */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Number of Nights
                  </Text>

                  <Text style={styles.detailValue}>
                    {booking.nights}
                  </Text>
                </View>

                <View style={styles.separator} />

                {/* TOTAL */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    Total Amount
                  </Text>

                  <Text style={styles.totalAmount}>
                    {formatPrice(booking.total)}
                  </Text>
                </View>

                {/* PRICE NOTE */}
                {booking.total === null && (
                  <Text style={styles.priceNote}>
                    Final price and availability must be
                    confirmed by the property.
                  </Text>
                )}

                {/* CANCEL BUTTON */}
                {booking.status.toLowerCase() !== 'cancelled' && (
                  <Pressable
                    style={[
                      styles.cancelButton,
                      cancelingId === booking.id &&
                        styles.disabledButton,
                    ]}
                    onPress={() => cancelBooking(booking.id)}
                    disabled={cancelingId !== null}
                  >
                    {cancelingId === booking.id ? (
                      <ActivityIndicator color={CORAL} />
                    ) : (
                      <Text style={styles.cancelButtonText}>
                        Cancel Booking Request
                      </Text>
                    )}
                  </Pressable>
                )}

                {booking.status.toLowerCase() === 'cancelled' && (
                  <View style={styles.cancelledInfo}>
                    <Text style={styles.cancelledInfoText}>
                      This booking request has been cancelled.
                    </Text>
                  </View>
                )}

              </View>
            ))}
          </>
        )}

      </ScrollView>
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  backButton: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 20,
  },

  backText: {
    color: CORAL,
    fontSize: 17,
    fontWeight: '600',
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222222',
  },

  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginTop: 8,
    marginBottom: 22,
    lineHeight: 21,
  },

  countCard: {
    backgroundColor: '#FFF3F3',
    borderRadius: 15,
    padding: 18,
    marginBottom: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  countNumber: {
    fontSize: 29,
    fontWeight: 'bold',
    color: CORAL,
  },

  countLabel: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },

  countIcon: {
    fontSize: 35,
  },

  refreshButton: {
    backgroundColor: '#FFF0F0',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },

  refreshText: {
    color: CORAL,
    fontWeight: 'bold',
    fontSize: 14,
  },

  disabledButton: {
    opacity: 0.6,
  },

  messageBox: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
    borderWidth: 1,
  },

  successBox: {
    backgroundColor: '#EAF8EF',
    borderColor: '#A5D6B2',
  },

  errorBox: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FFB3B3',
  },

  messageText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },

  successText: {
    color: '#18733A',
  },

  errorText: {
    color: '#C62828',
  },

  center: {
    alignItems: 'center',
    marginTop: 65,
  },

  loadingText: {
    color: '#777777',
    marginTop: 12,
    fontSize: 13,
  },

  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 30,
    marginTop: 20,
  },

  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#222222',
  },

  emptyDescription: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 21,
  },

  exploreButton: {
    backgroundColor: CORAL,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 10,
    marginTop: 22,
  },

  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 16,
  },

  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 15,
    padding: 17,
    marginBottom: 18,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },

  propertyHeading: {
    flex: 1,
  },

  propertyName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222222',
  },

  propertyAddress: {
    fontSize: 11,
    color: '#888888',
    marginTop: 6,
    lineHeight: 17,
  },

  status: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 'bold',
    overflow: 'hidden',
  },

  pendingStatus: {
    color: '#946200',
    backgroundColor: '#FFF4D6',
  },

  confirmedStatus: {
    color: '#18733A',
    backgroundColor: '#EAF8EF',
  },

  cancelledStatus: {
    color: '#B3261E',
    backgroundColor: '#FFF0F0',
  },

  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 15,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
    gap: 10,
  },

  detailLabel: {
    color: '#777777',
    fontSize: 13,
  },

  detailValue: {
    color: '#222222',
    fontSize: 13,
    fontWeight: '600',
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222222',
  },

  totalAmount: {
    color: CORAL,
    fontSize: 15,
    fontWeight: 'bold',
    flexShrink: 1,
    textAlign: 'right',
  },

  priceNote: {
    fontSize: 11,
    color: '#888888',
    marginTop: 9,
    lineHeight: 17,
  },

  cancelButton: {
    borderWidth: 1,
    borderColor: CORAL,
    borderRadius: 9,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 43,
  },

  cancelButtonText: {
    color: CORAL,
    fontSize: 13,
    fontWeight: 'bold',
  },

  cancelledInfo: {
    backgroundColor: '#FFF0F0',
    borderRadius: 9,
    padding: 12,
    marginTop: 17,
  },

  cancelledInfoText: {
    color: '#B3261E',
    fontSize: 12,
    textAlign: 'center',
  },
});
