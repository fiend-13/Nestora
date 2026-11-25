
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

// ==========================================
// REPRESENTATIVE PROPERTY IMAGES
// ==========================================

const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
];

function getPropertyImage(id: string) {
  const hash = id
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return PROPERTY_IMAGES[hash % PROPERTY_IMAGES.length];
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getParam(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] || '';
  }

  return value || '';
}

function formatCoordinate(value: string): string {
  const number = Number(value);

  if (!value || !Number.isFinite(number)) {
    return 'Not available';
  }

  return number.toFixed(5);
}

// ==========================================
// PROPERTY DETAILS SCREEN
// ==========================================

export default function PropertyDetailsScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id?: string | string[];
    name?: string | string[];
    address?: string | string[];
    city?: string | string[];
    latitude?: string | string[];
    longitude?: string | string[];
    type?: string | string[];
    website?: string | string[];
    phone?: string | string[];
    openingHours?: string | string[];
    imageUrl?: string | string[];
  }>();

  // Read property information passed from Home or Explore.
  const id = getParam(params.id);
  const name = getParam(params.name);
  const address = getParam(params.address);
  const city = getParam(params.city);
  const latitude = getParam(params.latitude);
  const longitude = getParam(params.longitude);
  const type = getParam(params.type);
  const website = getParam(params.website);
  const phone = getParam(params.phone);
  const openingHours = getParam(params.openingHours);
  const imageUrl = getParam(params.imageUrl);

  const propertyName = name || 'Accommodation';
  const propertyAddress = address || 'Address not available';
  const propertyType = type || 'Accommodation';

  const propertyImage = imageUrl || getPropertyImage(id || propertyName);

  // ========================================
  // OPEN WEBSITE
  // ========================================

  const openWebsite = async () => {
    if (!website) {
      return;
    }

    const url = website.startsWith('http')
      ? website
      : `https://${website}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'Unable to open website',
        'Please try again later.'
      );
    }
  };

  // ========================================
  // CALL PROPERTY
  // ========================================

  const callProperty = async () => {
    if (!phone) {
      return;
    }

    try {
      await Linking.openURL(`tel:${phone}`);
    } catch {
      Alert.alert(
        'Unable to make a call',
        'Calling is not supported on this device.'
      );
    }
  };

  // ========================================
  // BOOKING NAVIGATION
  // ========================================

  const handleBooking = () => {
    router.push({
      pathname: '/booking',
      params: {
        id,
        name: propertyName,
        address: propertyAddress,
        city,
        price: '',
      },
    });
  };

  // ========================================
  // UI
  // ========================================

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* PROPERTY IMAGE */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: propertyImage }}
            style={styles.propertyImage}
            resizeMode="cover"
          />

          {/* BACK BUTTON */}
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          {/* IMAGE LABEL */}
          <View style={styles.imageLabel}>
            <Text style={styles.imageLabelText}>
              {propertyType}
            </Text>
          </View>

          {/* IMAGE DISCLAIMER */}
          {!imageUrl && (
            <View style={styles.imageNote}>
              <Text style={styles.imageNoteText}>
                Representative photo
              </Text>
            </View>
          )}
        </View>

        {/* PROPERTY INFORMATION */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.propertyName}>
                {propertyName}
              </Text>

              <Text style={styles.propertyType}>
                {propertyType}
              </Text>
            </View>

            <View style={styles.typeIcon}>
              <Text style={styles.typeIconText}>⌂</Text>
            </View>
          </View>

          {/* ADDRESS */}
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>

            <View style={styles.locationTextContainer}>
              <Text style={styles.location}>
                {propertyAddress}
              </Text>

              {!!city && (
                <Text style={styles.city}>
                  {city}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* PROPERTY OVERVIEW */}
          <Text style={styles.sectionTitle}>
            About this property
          </Text>

          <Text style={styles.description}>
            Explore this accommodation in Goa. Check the
            property location and available contact information
            before making your travel arrangements.
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>🏡</Text>
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Accommodation
              </Text>

              <Text style={styles.infoSubtitle}>
                Listed through Geoapify Places API
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* CONTACT INFORMATION */}
          <Text style={styles.sectionTitle}>
            Contact Information
          </Text>

          {!!phone ? (
            <Pressable
              style={styles.contactCard}
              onPress={callProperty}
            >
              <Text style={styles.contactIcon}>📞</Text>

              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>
                  Phone Number
                </Text>

                <Text style={styles.contactValue}>
                  {phone}
                </Text>
              </View>

              <Text style={styles.contactArrow}>›</Text>
            </Pressable>
          ) : (
            <View style={styles.contactCard}>
              <Text style={styles.contactIcon}>📞</Text>

              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>
                  Phone Number
                </Text>

                <Text style={styles.unavailableText}>
                  Not available
                </Text>
              </View>
            </View>
          )}

          {!!website ? (
            <Pressable
              style={styles.contactCard}
              onPress={openWebsite}
            >
              <Text style={styles.contactIcon}>🌐</Text>

              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>
                  Official Website
                </Text>

                <Text
                  style={styles.contactValue}
                  numberOfLines={1}
                >
                  {website}
                </Text>
              </View>

              <Text style={styles.contactArrow}>›</Text>
            </Pressable>
          ) : (
            <View style={styles.contactCard}>
              <Text style={styles.contactIcon}>🌐</Text>

              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>
                  Official Website
                </Text>

                <Text style={styles.unavailableText}>
                  Not available
                </Text>
              </View>
            </View>
          )}

          {!!openingHours && (
            <View style={styles.contactCard}>
              <Text style={styles.contactIcon}>🕒</Text>

              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>
                  Opening Hours
                </Text>

                <Text style={styles.contactValue}>
                  {openingHours}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* LOCATION DETAILS */}
          <Text style={styles.sectionTitle}>
            Location Details
          </Text>

          <View style={styles.coordinateCard}>
            <View style={styles.coordinateItem}>
              <Text style={styles.coordinateLabel}>
                Latitude
              </Text>

              <Text style={styles.coordinateValue}>
                {formatCoordinate(latitude)}
              </Text>
            </View>

            <View style={styles.coordinateDivider} />

            <View style={styles.coordinateItem}>
              <Text style={styles.coordinateLabel}>
                Longitude
              </Text>

              <Text style={styles.coordinateValue}>
                {formatCoordinate(longitude)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* API INFORMATION */}
          <View style={styles.apiNote}>
            <Text style={styles.apiNoteTitle}>
              About this listing
            </Text>

            <Text style={styles.apiNoteText}>
              Property information is retrieved from Geoapify.
              Prices, room availability, guest capacity, reviews
              and amenities are not supplied by this API and
              have therefore not been displayed as verified
              information.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* BOOKING FOOTER */}
      <View style={styles.bookingFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            Price unavailable
          </Text>

          <Text style={styles.priceSubtitle}>
            Contact the property for rates
          </Text>
        </View>

        <Pressable
          style={styles.bookButton}
          onPress={handleBooking}
        >
          <Text style={styles.bookButtonText}>
            Continue
          </Text>
        </Pressable>
      </View>
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

  scrollContent: {
    paddingBottom: 20,
  },

  imageContainer: {
    position: 'relative',
  },

  propertyImage: {
    width: '100%',
    height: 310,
    backgroundColor: '#EEEEEE',
  },

  backButton: {
    position: 'absolute',
    top: 48,
    left: 20,
    width: 43,
    height: 43,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  backIcon: {
    fontSize: 34,
    color: '#222222',
    marginTop: -5,
  },

  imageLabel: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  imageLabelText: {
    fontSize: 12,
    color: '#222222',
    fontWeight: 'bold',
  },

  imageNote: {
    position: 'absolute',
    bottom: 16,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  imageNoteText: {
    fontSize: 10,
    color: '#FFFFFF',
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 30,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  titleContainer: {
    flex: 1,
    paddingRight: 12,
  },

  propertyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
    lineHeight: 32,
  },

  propertyType: {
    fontSize: 12,
    color: '#FF5A5F',
    fontWeight: 'bold',
    marginTop: 7,
  },

  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 25,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  typeIconText: {
    fontSize: 27,
    color: '#FF5A5F',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 19,
  },

  locationIcon: {
    fontSize: 17,
    marginRight: 9,
  },

  locationTextContainer: {
    flex: 1,
  },

  location: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 21,
  },

  city: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 23,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 15,
  },

  description: {
    fontSize: 14,
    lineHeight: 23,
    color: '#777777',
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 13,
    padding: 15,
    marginTop: 20,
  },

  infoIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoIconText: {
    fontSize: 21,
  },

  infoContent: {
    marginLeft: 13,
    flex: 1,
  },

  infoTitle: {
    fontSize: 14,
    color: '#222222',
    fontWeight: 'bold',
  },

  infoSubtitle: {
    fontSize: 11,
    color: '#888888',
    marginTop: 5,
  },

  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 11,
  },

  contactIcon: {
    fontSize: 21,
    marginRight: 13,
  },

  contactContent: {
    flex: 1,
  },

  contactTitle: {
    fontSize: 12,
    color: '#888888',
  },

  contactValue: {
    fontSize: 13,
    color: '#222222',
    fontWeight: '600',
    marginTop: 5,
  },

  unavailableText: {
    fontSize: 13,
    color: '#AAAAAA',
    marginTop: 5,
  },

  contactArrow: {
    fontSize: 25,
    color: '#FF5A5F',
  },

  coordinateCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 13,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },

  coordinateItem: {
    flex: 1,
  },

  coordinateLabel: {
    fontSize: 11,
    color: '#999999',
  },

  coordinateValue: {
    fontSize: 14,
    color: '#222222',
    fontWeight: 'bold',
    marginTop: 7,
  },

  coordinateDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#DDDDDD',
    marginHorizontal: 15,
  },

  apiNote: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
  },

  apiNoteTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FF5A5F',
  },

  apiNoteText: {
    fontSize: 11,
    color: '#777777',
    lineHeight: 19,
    marginTop: 8,
  },

  bookingFooter: {
    minHeight: 82,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  priceContainer: {
    flex: 1,
    paddingRight: 8,
  },

  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222222',
  },

  priceSubtitle: {
    fontSize: 10,
    color: '#888888',
    marginTop: 5,
  },

  bookButton: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 11,
  },

  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
