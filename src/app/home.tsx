
import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useRouter } from 'expo-router';

import {
  searchAccommodations,
  type Property,
} from '../services/propertyApi';

const categories = [
  { name: 'All', icon: '⌂' },
  { name: 'Hotels', icon: '🏨' },
  { name: 'Apartments', icon: '🏢' },
  { name: 'Guest Houses', icon: '🏡' },
  { name: 'Hostels', icon: '🛏️' },
];

// Different representative accommodation photos for each card.
// Geoapify Places results do not normally include property photos.
const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1000&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1000&q=80&auto=format&fit=crop',
];

function getPropertyImage(index: number): string {
  // The first 20 property cards each receive a different image.
  return PROPERTY_IMAGES[index % PROPERTY_IMAGES.length];
}

export default function HomeScreen() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Fetch real accommodation listings from Geoapify
  const loadProperties = async () => {
    try {
      setError('');

      const result = await searchAccommodations({
        latitude: 15.4909,
        longitude: 73.8278,
        radius: 60000,
        limit: 30,
      });

      setProperties(result);
    } catch (err: any) {
      console.error('Property API error:', err);
      setError(err.message || 'Unable to load properties.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProperties();
  };

  // Category filtering
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        property.name.toLowerCase().includes(searchText) ||
        property.address.toLowerCase().includes(searchText) ||
        property.city.toLowerCase().includes(searchText);

      let matchesCategory = true;

      if (selectedCategory === 'Hotels') {
        matchesCategory = property.categories.some((item) =>
          item.includes('accommodation.hotel')
        );
      } else if (selectedCategory === 'Apartments') {
        matchesCategory = property.categories.some((item) =>
          item.includes('accommodation.apartment')
        );
      } else if (selectedCategory === 'Guest Houses') {
        matchesCategory = property.categories.some((item) =>
          item.includes('accommodation.guest_house')
        );
      } else if (selectedCategory === 'Hostels') {
        matchesCategory = property.categories.some((item) =>
          item.includes('accommodation.hostel')
        );
      }

      return matchesSearch && matchesCategory;
    });
  }, [properties, search, selectedCategory]);

  const toggleFavorite = (id: string) => {
    setFavorites((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const openProperty = (property: Property) => {
    router.push({
      pathname: '/property-details',
      params: {
        id: property.id,
        name: property.name,
        address: property.address,
        city: property.city,
        latitude: String(property.latitude),
        longitude: String(property.longitude),
        type: property.type,
        website: property.website || '',
        phone: property.phone || '',
      },
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/');
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF5A5F']}
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>
              nestora<Text style={styles.logoDot}>.</Text>
            </Text>
            <Text style={styles.tagline}>
              Find your perfect stay
            </Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </Pressable>
        </View>

        {/* GREETING */}
        <View style={styles.greeting}>
          <Text style={styles.welcome}>
            Hello, Traveller! 👋
          </Text>
          <Text style={styles.subtitle}>
            Discover beautiful stays in Goa.
          </Text>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search properties in Goa..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />

          <Pressable
            style={styles.searchButton}
            onPress={() => router.push('/explore')}
          >
            <Text style={styles.searchButtonText}>↗</Text>
          </Pressable>
        </View>

        {/* DESTINATION BANNER */}
        <View style={styles.banner}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1000',
            }}
            style={styles.bannerImage}
          />

          <View style={styles.bannerOverlay} />

          <View style={styles.bannerContent}>
            <Text style={styles.bannerSmall}>
              EXPLORE INDIA
            </Text>
            <Text style={styles.bannerTitle}>
              Experience the magic of Goa
            </Text>
            <Text style={styles.bannerDescription}>
              Beaches, sunsets and unforgettable stays.
            </Text>
          </View>
        </View>

        {/* CATEGORIES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Explore Categories
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map((category) => (
              <Pressable
                key={category.name}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.name &&
                    styles.categorySelected,
                ]}
                onPress={() =>
                  setSelectedCategory(category.name)
                }
              >
                <Text style={styles.categoryIcon}>
                  {category.icon}
                </Text>

                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.name &&
                      styles.categoryTextSelected,
                  ]}
                >
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* POPULAR PROPERTIES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Popular Stays
              </Text>
              <Text style={styles.sectionSubtitle}>
                Real accommodation listings in Goa
              </Text>
            </View>

            <Pressable
              onPress={() => router.push('/explore')}
            >
              <Text style={styles.seeAll}>See all →</Text>
            </Pressable>
          </View>

          {/* LOADING */}
          {loading && (
            <View style={styles.statusContainer}>
              <ActivityIndicator
                size="large"
                color="#FF5A5F"
              />
              <Text style={styles.statusText}>
                Finding beautiful stays in Goa...
              </Text>
            </View>
          )}

          {/* ERROR */}
          {!loading && error !== '' && (
            <View style={styles.statusContainer}>
              <Text style={styles.errorText}>
                {error}
              </Text>

              <Pressable
                style={styles.retryButton}
                onPress={loadProperties}
              >
                <Text style={styles.retryText}>
                  Try Again
                </Text>
              </Pressable>
            </View>
          )}

          {/* EMPTY RESULT */}
          {!loading &&
            !error &&
            filteredProperties.length === 0 && (
              <View style={styles.statusContainer}>
                <Text style={styles.emptyText}>
                  No properties found.
                </Text>
                <Text style={styles.statusText}>
                  Try another search or category.
                </Text>
              </View>
            )}

          {/* API RESULTS */}
          {!loading &&
            !error &&
            filteredProperties.map((property, index) => (
              <Pressable
                key={property.id}
                style={styles.propertyCard}
                onPress={() => openProperty(property)}
              >
                <View>
                  <Image
                    source={{
                      uri: property.imageUrl || getPropertyImage(index),
                    }}
                    style={styles.propertyImage}
                  />

                  <Pressable
                    style={styles.favoriteButton}
                    onPress={(event) => {
                      event.stopPropagation();
                      toggleFavorite(property.id);
                    }}
                  >
                    <Text style={styles.favoriteIcon}>
                      {favorites.includes(property.id)
                        ? '❤️'
                        : '♡'}
                    </Text>
                  </Pressable>

                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>
                      {property.type}
                    </Text>
                  </View>
                </View>

                <View style={styles.propertyInfo}>
                  <Text
                    style={styles.propertyName}
                    numberOfLines={2}
                  >
                    {property.name}
                  </Text>

                  <Text
                    style={styles.propertyLocation}
                    numberOfLines={2}
                  >
                    📍 {property.address}
                  </Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.propertyPrice}>
                      Price not listed
                    </Text>
                  </View>

                  {property.phone ? (
                    <Text style={styles.contactText}>
                      Phone: {property.phone}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            ))}
        </View>

        {/* API INFORMATION */}
        <View style={styles.apiNote}>
          <Text style={styles.apiNoteTitle}>
            Powered by Geoapify
          </Text>
          <Text style={styles.apiNoteText}>
            Accommodation listings are retrieved from the
            Geoapify Places API. Prices and room availability
            are not provided by this API.
          </Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>nestora.</Text>
          <Text style={styles.footerText}>
            Your journey begins with the perfect stay.
          </Text>

          <Pressable onPress={handleLogout}>
            <Text style={styles.logoutText}>
              ↪ Logout
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIconActive}>⌂</Text>
          <Text style={styles.navTextActive}>Home</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push('/explore')}
        >
          <Text style={styles.navIcon}>⌕</Text>
          <Text style={styles.navText}>Explore</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push('/wishlist')}
        >
          <Text style={styles.navIcon}>♡</Text>
          <Text style={styles.navText}>Wishlist</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push('/my-bookings')}
        >
          <Text style={styles.navIcon}>▤</Text>
          <Text style={styles.navText}>Bookings</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.navIcon}>♙</Text>
          <Text style={styles.navText}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222222',
    letterSpacing: -1,
  },

  logoDot: {
    color: '#FF5A5F',
  },

  tagline: {
    color: '#888888',
    fontSize: 12,
    marginTop: -2,
  },

  profileButton: {
    backgroundColor: '#FFF0F0',
    height: 45,
    width: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileIcon: {
    fontSize: 22,
  },

  greeting: {
    paddingHorizontal: 22,
    marginTop: 15,
  },

  welcome: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#222222',
  },

  subtitle: {
    fontSize: 14,
    color: '#888888',
    marginTop: 6,
  },

  searchBox: {
    marginHorizontal: 22,
    marginTop: 22,
    height: 55,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  searchIcon: {
    fontSize: 27,
    color: '#FF5A5F',
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#222222',
  },

  searchButton: {
    backgroundColor: '#FF5A5F',
    height: 37,
    width: 37,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
  },

  banner: {
    height: 185,
    marginHorizontal: 22,
    marginTop: 25,
    borderRadius: 17,
    overflow: 'hidden',
  },

  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.43)',
  },

  bannerContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },

  bannerSmall: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
  },

  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },

  bannerDescription: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
  },

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#222222',
  },

  sectionSubtitle: {
    color: '#999999',
    fontSize: 12,
    marginTop: 5,
  },

  categoryContainer: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 5,
    gap: 12,
  },

  categoryItem: {
    width: 85,
    height: 82,
    borderRadius: 13,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  categorySelected: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FF5A5F',
  },

  categoryIcon: {
    fontSize: 23,
    marginBottom: 6,
  },

  categoryText: {
    fontSize: 11,
    color: '#777777',
    fontWeight: '500',
  },

  categoryTextSelected: {
    color: '#FF5A5F',
    fontWeight: 'bold',
  },

  sectionHeader: {
    paddingHorizontal: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  seeAll: {
    color: '#FF5A5F',
    fontSize: 13,
    fontWeight: 'bold',
  },

  propertyCard: {
    marginHorizontal: 22,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },

  propertyImage: {
    width: '100%',
    height: 220,
    borderRadius: 15,
    backgroundColor: '#EEEEEE',
  },

  favoriteButton: {
    position: 'absolute',
    top: 13,
    right: 13,
    height: 38,
    width: 38,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  favoriteIcon: {
    fontSize: 21,
    color: '#FF5A5F',
  },

  ratingBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#222222',
  },

  propertyInfo: {
    paddingTop: 12,
  },

  propertyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222222',
  },

  propertyLocation: {
    fontSize: 13,
    color: '#888888',
    marginTop: 6,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },

  propertyPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555555',
  },

  contactText: {
    fontSize: 12,
    color: '#777777',
    marginTop: 6,
  },

  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 35,
  },

  statusText: {
    fontSize: 13,
    color: '#888888',
    marginTop: 12,
    textAlign: 'center',
  },

  errorText: {
    fontSize: 14,
    color: '#D9363E',
    textAlign: 'center',
  },

  retryButton: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 25,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 15,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  emptyText: {
    textAlign: 'center',
    color: '#888888',
    marginTop: 15,
  },

  apiNote: {
    marginHorizontal: 22,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
  },

  apiNoteTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FF5A5F',
  },

  apiNoteText: {
    fontSize: 11,
    color: '#777777',
    lineHeight: 17,
    marginTop: 5,
  },

  footer: {
    backgroundColor: '#FFF5F5',
    padding: 25,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },

  footerLogo: {
    color: '#FF5A5F',
    fontSize: 25,
    fontWeight: 'bold',
  },

  footerText: {
    color: '#888888',
    fontSize: 12,
    marginTop: 7,
  },

  logoutText: {
    color: '#E63946',
    fontWeight: 'bold',
    marginTop: 20,
    fontSize: 14,
  },

  bottomNav: {
    height: 65,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  navIcon: {
    fontSize: 23,
    color: '#999999',
  },

  navIconActive: {
    fontSize: 23,
    color: '#FF5A5F',
  },

  navText: {
    fontSize: 10,
    color: '#999999',
    marginTop: 3,
  },

  navTextActive: {
    fontSize: 10,
    color: '#FF5A5F',
    fontWeight: 'bold',
    marginTop: 3,
  },
});
