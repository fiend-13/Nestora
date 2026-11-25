
import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  searchAccommodations,
  type Property,
} from '../services/propertyApi';

// ==========================================
// CATEGORIES
// ==========================================

const categories = [
  { name: 'All', icon: '⌂' },
  { name: 'Hotels', icon: '🏨' },
  { name: 'Apartments', icon: '🏢' },
  { name: 'Guest Houses', icon: '🏡' },
  { name: 'Hostels', icon: '🛏️' },
];

// ==========================================
// PROPERTY IMAGES
// Representative accommodation photos
// ==========================================

const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000&q=80',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1000&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1000&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&q=80',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1000&q=80',
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1000&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1000&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&q=80',
];

function getPropertyImage(property: Property, index: number) {
  if (property.imageUrl) {
    return property.imageUrl;
  }

  // Select an image consistently for each property ID.
  const hash = property.id
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return PROPERTY_IMAGES[
    (hash + index) % PROPERTY_IMAGES.length
  ];
}

// ==========================================
// CATEGORY FILTER
// ==========================================

function matchesCategory(
  property: Property,
  selectedCategory: string
): boolean {
  if (selectedCategory === 'All') {
    return true;
  }

  const categoryMap: Record<string, string> = {
    Hotels: 'accommodation.hotel',
    Apartments: 'accommodation.apartment',
    'Guest Houses': 'accommodation.guest_house',
    Hostels: 'accommodation.hostel',
  };

  const requiredCategory = categoryMap[selectedCategory];

  if (!requiredCategory) {
    return true;
  }

  return property.categories.some((item) =>
    item.includes(requiredCategory)
  );
}

// ==========================================
// EXPLORE SCREEN
// ==========================================

export default function ExploreScreen() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [properties, setProperties] = useState<Property[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // ========================================
  // FETCH PROPERTIES FROM GEOAPIFY
  // ========================================

  const loadProperties = async (isRefresh = false) => {
    try {
      setError('');

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await searchAccommodations({
        latitude: 15.4909,
        longitude: 73.8278,
        radius: 60000,
        limit: 30,
      });

      setProperties(result);
    } catch (err: any) {
      console.error('Explore API Error:', err);

      setError(
        err.message || 'Unable to load accommodation listings.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // ========================================
  // SEARCH AND CATEGORY FILTERING
  // ========================================

  const filteredProperties = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesSearch =
        property.name.toLowerCase().includes(searchText) ||
        property.address.toLowerCase().includes(searchText) ||
        property.city.toLowerCase().includes(searchText) ||
        property.type.toLowerCase().includes(searchText);

      const categoryMatch = matchesCategory(
        property,
        selectedCategory
      );

      return matchesSearch && categoryMatch;
    });
  }, [properties, search, selectedCategory]);

  // ========================================
  // OPEN PROPERTY DETAILS
  // ========================================

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

  // ========================================
  // CLEAR SEARCH
  // ========================================

  const clearSearch = () => {
    setSearch('');
    setSelectedCategory('All');
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

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>
            nestora<Text style={styles.logoDot}>.</Text>
          </Text>

          <Text style={styles.subtitle}>
            Explore amazing stays
          </Text>
        </View>

        <Pressable
          style={styles.profileButton}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </Pressable>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search properties in Goa..."
          placeholderTextColor="#999999"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />

        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* CATEGORY FILTERS */}
      <View style={styles.categorySection}>
        <View style={styles.categoryHeading}>
          <Text style={styles.sectionTitle}>
            Explore Categories
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <Pressable
              key={category.name}
              style={[
                styles.categoryButton,
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

      {/* PROPERTY LIST */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProperties(true)}
            colors={['#FF5A5F']}
          />
        }
      >
        {/* LIST HEADER */}
        <View style={styles.listHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Stays in Goa
            </Text>

            <Text style={styles.listSubtitle}>
              Find your perfect accommodation
            </Text>
          </View>

          {!loading && !error && (
            <View style={styles.countBadge}>
              <Text style={styles.resultCount}>
                {filteredProperties.length} stays
              </Text>
            </View>
          )}
        </View>

        {/* LOADING */}
        {loading && (
          <View style={styles.statusContainer}>
            <ActivityIndicator
              size="large"
              color="#FF5A5F"
            />

            <Text style={styles.statusText}>
              Discovering beautiful stays...
            </Text>
          </View>
        )}

        {/* ERROR */}
        {!loading && error !== '' && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>⚠️</Text>

            <Text style={styles.emptyTitle}>
              Something went wrong
            </Text>

            <Text style={styles.statusText}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => loadProperties()}
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </Pressable>
          </View>
        )}

        {/* EMPTY RESULTS */}
        {!loading &&
          !error &&
          filteredProperties.length === 0 && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusIcon}>⌕</Text>

              <Text style={styles.emptyTitle}>
                No stays found
              </Text>

              <Text style={styles.statusText}>
                Try another search or select a different category.
              </Text>

              <Pressable
                style={styles.retryButton}
                onPress={clearSearch}
              >
                <Text style={styles.retryText}>
                  Clear Filters
                </Text>
              </Pressable>
            </View>
          )}

        {/* PROPERTY CARDS */}
        {!loading &&
          !error &&
          filteredProperties.map((property, index) => (
            <Pressable
              key={property.id}
              style={styles.propertyCard}
              onPress={() => openProperty(property)}
            >
              {/* PROPERTY IMAGE */}
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri: getPropertyImage(property, index),
                  }}
                  style={styles.propertyImage}
                />

                {/* CATEGORY BADGE */}
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {property.type}
                  </Text>
                </View>

                {/* IMAGE CAPTION */}
                {!property.imageUrl && (
                  <View style={styles.photoNote}>
                    <Text style={styles.photoNoteText}>
                      Representative photo
                    </Text>
                  </View>
                )}
              </View>

              {/* PROPERTY INFORMATION */}
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

                <View style={styles.propertyBottom}>
                  <Text style={styles.propertyPrice}>
                    Price not listed
                  </Text>

                  <Text style={styles.viewDetails}>
                    View details →
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}

        {/* API INFORMATION */}
        {!loading && !error && properties.length > 0 && (
          <View style={styles.apiNote}>
            <Text style={styles.apiNoteTitle}>
              Powered by Geoapify
            </Text>

            <Text style={styles.apiNoteText}>
              Accommodation information is retrieved from
              Geoapify Places API. Photos are representative
              images. Live prices and room availability are
              not provided by this API.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.navIcon}>⌂</Text>
          <Text style={styles.navText}>Home</Text>
        </Pressable>

        <Pressable style={styles.navItem}>
          <Text style={styles.navIconActive}>⌕</Text>
          <Text style={styles.navTextActive}>Explore</Text>
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

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logo: {
    fontSize: 31,
    fontWeight: 'bold',
    color: '#222222',
    letterSpacing: -1,
  },

  logoDot: {
    color: '#FF5A5F',
  },

  subtitle: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 23,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIcon: {
    fontSize: 21,
  },

  searchBox: {
    marginHorizontal: 22,
    height: 54,
    backgroundColor: '#F7F7F7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  searchIcon: {
    fontSize: 26,
    color: '#FF5A5F',
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#222222',
  },

  clearIcon: {
    color: '#888888',
    fontSize: 17,
    padding: 5,
  },

  categorySection: {
    marginTop: 25,
  },

  categoryHeading: {
    paddingHorizontal: 22,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
  },

  categoryContainer: {
    paddingHorizontal: 22,
    paddingTop: 15,
    paddingBottom: 5,
    gap: 10,
  },

  categoryButton: {
    minWidth: 91,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    gap: 6,
  },

  categorySelected: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
  },

  categoryIcon: {
    fontSize: 15,
  },

  categoryText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
  },

  categoryTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  listContainer: {
    paddingHorizontal: 22,
    paddingTop: 23,
    paddingBottom: 30,
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  listSubtitle: {
    color: '#999999',
    fontSize: 12,
    marginTop: 5,
  },

  countBadge: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  resultCount: {
    color: '#FF5A5F',
    fontSize: 11,
    fontWeight: 'bold',
  },

  propertyCard: {
    marginBottom: 25,
    backgroundColor: '#FFFFFF',
  },

  imageContainer: {
    position: 'relative',
  },

  propertyImage: {
    width: '100%',
    height: 215,
    borderRadius: 16,
    backgroundColor: '#EEEEEE',
  },

  categoryBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
  },

  categoryBadgeText: {
    fontSize: 11,
    color: '#222222',
    fontWeight: 'bold',
  },

  photoNote: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },

  photoNoteText: {
    color: '#FFFFFF',
    fontSize: 9,
  },

  propertyInfo: {
    paddingTop: 12,
  },

  propertyName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222222',
  },

  propertyLocation: {
    fontSize: 13,
    color: '#888888',
    marginTop: 7,
    lineHeight: 19,
  },

  propertyBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  propertyPrice: {
    fontSize: 13,
    color: '#777777',
    fontWeight: '600',
  },

  viewDetails: {
    fontSize: 12,
    color: '#FF5A5F',
    fontWeight: 'bold',
  },

  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },

  statusIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  statusText: {
    fontSize: 13,
    color: '#888888',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginTop: 8,
  },

  retryButton: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },

  apiNote: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 15,
    marginTop: 5,
    marginBottom: 15,
  },

  apiNoteTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FF5A5F',
  },

  apiNoteText: {
    color: '#777777',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 6,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
