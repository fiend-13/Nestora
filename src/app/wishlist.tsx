
import React, { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { auth, db } from '../../firebase/firebaseConfig';

// --------------------------------------------------
// PROPERTY TYPE
// --------------------------------------------------

type Property = {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
};

type WishlistItem = Property & {
  documentId: string;
};

// --------------------------------------------------
// SAMPLE PROPERTIES
// --------------------------------------------------

const availableProperties: Property[] = [
  {
    id: 'property_1',
    name: 'Luxury Beach Villa',
    location: 'Candolim, Goa',
    price: 4500,
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
  },
  {
    id: 'property_2',
    name: 'Cozy Beach Apartment',
    location: 'Calangute, Goa',
    price: 2800,
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
  },
  {
    id: 'property_3',
    name: 'Private Pool Resort',
    location: 'Anjuna, Goa',
    price: 6000,
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  },
];

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

export default function WishlistScreen() {
  const router = useRouter();

  const [properties, setProperties] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // --------------------------------------------------
  // LOAD WISHLIST FROM FIRESTORE
  // --------------------------------------------------

  const loadWishlist = useCallback(async () => {
    const user = auth.currentUser;

    if (!user) {
      setProperties([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const wishlistQuery = query(
        collection(db, 'wishlists'),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(wishlistQuery);

      const wishlistData: WishlistItem[] = snapshot.docs.map(
        (wishlistDoc) => {
          const data = wishlistDoc.data();

          return {
            documentId: wishlistDoc.id,
            id: data.propertyId,
            name: data.name,
            location: data.location,
            price: Number(data.price || 0),
            rating: Number(data.rating || 0),
            image: data.image || '',
          };
        }
      );

      setProperties(wishlistData);
    } catch (error) {
      console.error('Wishlist loading error:', error);

      Alert.alert(
        'Wishlist Error',
        'Unable to load your wishlist. Please check your internet connection and Firebase rules.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh wishlist whenever this screen opens
  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, [loadWishlist])
  );

  // --------------------------------------------------
  // ADD PROPERTY TO WISHLIST
  // --------------------------------------------------

  const addToWishlist = async (property: Property) => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Login Required', 'Please log in to save properties.');
      return;
    }

    if (addingId) {
      return;
    }

    try {
      setAddingId(property.id);

      // Check whether this property is already saved
      const existingQuery = query(
        collection(db, 'wishlists'),
        where('userId', '==', user.uid),
        where('propertyId', '==', property.id)
      );

      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        Alert.alert(
          'Already Saved',
          'This property is already in your wishlist.'
        );

        await loadWishlist();
        return;
      }

      // Add property to Firestore
      await addDoc(collection(db, 'wishlists'), {
        userId: user.uid,
        propertyId: property.id,
        name: property.name,
        location: property.location,
        price: property.price,
        rating: property.rating,
        image: property.image,
        createdAt: serverTimestamp(),
      });

      await loadWishlist();

      Alert.alert('Success', 'Property added to your wishlist!');
    } catch (error) {
      console.error('Wishlist add error:', error);

      Alert.alert(
        'Error',
        'Could not add this property. Please try again.'
      );
    } finally {
      setAddingId(null);
    }
  };

  // --------------------------------------------------
  // REMOVE PROPERTY FROM WISHLIST
  // --------------------------------------------------

  const removeFromWishlist = async (documentId: string) => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Login Required', 'Please log in again.');
      return;
    }

    if (removingId) {
      return;
    }

    try {
      setRemovingId(documentId);

      // Find the exact Firestore document
      const selectedProperty = properties.find(
        (item) => item.documentId === documentId
      );

      if (!selectedProperty) {
        Alert.alert('Error', 'Wishlist property could not be found.');
        return;
      }

      // Verify that this document belongs to the current user
      const wishlistRef = doc(db, 'wishlists', documentId);

      // Delete the Firestore document
      await deleteDoc(wishlistRef);

      // Immediately update the screen
      setProperties((previousProperties) =>
        previousProperties.filter(
          (item) => item.documentId !== documentId
        )
      );

      Alert.alert('Removed', 'Property removed from your wishlist.');
    } catch (error) {
      console.error('Wishlist removal error:', error);

      Alert.alert(
        'Removal Failed',
        'Could not remove this property. Check your Firestore permissions.'
      );
    } finally {
      setRemovingId(null);
    }
  };

  // --------------------------------------------------
  // OPEN PROPERTY DETAILS
  // --------------------------------------------------

  const openProperty = (property: Property) => {
    router.push({
      pathname: '/property-details',
      params: {
        id: property.id,
        name: property.name,
      },
    });
  };

  // --------------------------------------------------
  // PROPERTY CARD
  // --------------------------------------------------

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => {
    const isRemoving = removingId === item.documentId;

    return (
      <View style={styles.card}>
        <Pressable onPress={() => openProperty(item)}>
          <Image
            source={{ uri: item.image }}
            style={styles.propertyImage}
          />
        </Pressable>

        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyName}>{item.name}</Text>

              <Text style={styles.location}>
                <Text style={styles.locationIcon}>⌖ </Text>
                {item.location}
              </Text>

              <Text style={styles.rating}>
                ★ {item.rating.toFixed(1)}
              </Text>
            </View>

            <Pressable
              style={styles.heartButton}
              disabled={isRemoving}
              onPress={() => removeFromWishlist(item.documentId)}
            >
              {isRemoving ? (
                <ActivityIndicator color="#FF5A5F" />
              ) : (
                <Text style={styles.heartIcon}>♥</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.cardBottom}>
            <Text style={styles.price}>
              ₹{item.price.toLocaleString('en-IN')}
              <Text style={styles.perNight}> / night</Text>
            </Text>

            <Pressable
              style={styles.viewButton}
              onPress={() => openProperty(item)}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  // --------------------------------------------------
  // SCREEN UI
  // --------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Nestora</Text>
          <Text style={styles.tagline}>Find your perfect stay</Text>
        </View>

        <Text style={styles.headerHeart}>♥</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>My Wishlist</Text>

          <Text style={styles.subtitle}>
            Your favourite stays, all in one place.
          </Text>

          <Text style={styles.savedCount}>
            {properties.length} saved properties
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#FF5A5F" />
            <Text style={styles.loadingText}>Loading wishlist...</Text>
          </View>
        ) : properties.length > 0 ? (
          <FlatList
            data={properties}
            keyExtractor={(item) => item.documentId}
            renderItem={renderWishlistItem}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyHeart}>♡</Text>

            <Text style={styles.emptyTitle}>
              Your wishlist is empty
            </Text>

            <Text style={styles.emptyDescription}>
              Save your favourite properties and find them here whenever
              you need them.
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
        )}

        {/* PROPERTY SUGGESTIONS */}

        <View style={styles.suggestionsSection}>
          <Text style={styles.suggestionsTitle}>
            Discover More Stays
          </Text>

          <Text style={styles.suggestionsSubtitle}>
            Save a property you like.
          </Text>

          {availableProperties.map((property) => {
            const alreadySaved = properties.some(
              (item) => item.id === property.id
            );

            return (
              <View key={property.id} style={styles.suggestionCard}>
                <Image
                  source={{ uri: property.image }}
                  style={styles.suggestionImage}
                />

                <View style={styles.suggestionInfo}>
                  <Text style={styles.suggestionName}>
                    {property.name}
                  </Text>

                  <Text style={styles.suggestionLocation}>
                    {property.location}
                  </Text>

                  <Text style={styles.suggestionPrice}>
                    ₹{property.price.toLocaleString('en-IN')} / night
                  </Text>

                  <Pressable
                    style={[
                      styles.addButton,
                      alreadySaved && styles.savedButton,
                    ]}
                    disabled={alreadySaved || addingId === property.id}
                    onPress={() => addToWishlist(property)}
                  >
                    {addingId === property.id ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.addButtonText}>
                        {alreadySaved ? '♥ Saved' : '+ Add to Wishlist'}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
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

        <Pressable
          style={styles.navItem}
          onPress={() => router.replace('/explore')}
        >
          <Text style={styles.navIcon}>⌕</Text>
          <Text style={styles.navText}>Explore</Text>
        </Pressable>

        <Pressable style={styles.navItem}>
          <Text style={[styles.navIcon, styles.activeNav]}>♥</Text>
          <Text style={[styles.navText, styles.activeNav]}>
            Wishlist
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.replace('/my-bookings')}
        >
          <Text style={styles.navIcon}>▤</Text>
          <Text style={styles.navText}>Bookings</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.replace('/profile')}
        >
          <Text style={styles.navIcon}>♙</Text>
          <Text style={styles.navText}>Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  logo: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FF5A5F',
  },

  tagline: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },

  headerHeart: {
    fontSize: 28,
    color: '#FF5A5F',
  },

  titleSection: {
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 15,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#222222',
  },

  subtitle: {
    fontSize: 14,
    color: '#888888',
    marginTop: 6,
  },

  savedCount: {
    color: '#FF5A5F',
    fontWeight: '700',
    marginTop: 13,
    fontSize: 13,
  },

  centerContent: {
    padding: 50,
    alignItems: 'center',
  },

  loadingText: {
    color: '#888888',
    marginTop: 12,
  },

  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 10,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    elevation: 3,
  },

  propertyImage: {
    width: '100%',
    height: 190,
    backgroundColor: '#EEEEEE',
  },

  cardContent: {
    padding: 15,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  propertyInfo: {
    flex: 1,
  },

  propertyName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222222',
  },

  location: {
    fontSize: 13,
    color: '#888888',
    marginTop: 7,
  },

  locationIcon: {
    color: '#FF5A5F',
  },

  rating: {
    color: '#E6A400',
    fontSize: 13,
    marginTop: 7,
    fontWeight: '700',
  },

  heartButton: {
    width: 42,
    height: 42,
    borderRadius: 22,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  heartIcon: {
    color: '#FF5A5F',
    fontSize: 23,
  },

  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },

  price: {
    fontSize: 17,
    fontWeight: '800',
    color: '#222222',
  },

  perNight: {
    fontSize: 12,
    fontWeight: '400',
    color: '#888888',
  },

  viewButton: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9,
  },

  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 45,
  },

  emptyHeart: {
    fontSize: 75,
    color: '#FFB4B6',
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#222222',
    marginTop: 12,
  },

  emptyDescription: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
  },

  exploreButton: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 22,
  },

  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  suggestionsSection: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 25,
  },

  suggestionsTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#222222',
  },

  suggestionsSubtitle: {
    fontSize: 13,
    color: '#888888',
    marginTop: 5,
    marginBottom: 15,
  },

  suggestionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    padding: 10,
    marginBottom: 13,
  },

  suggestionImage: {
    width: 105,
    height: 125,
    borderRadius: 10,
    backgroundColor: '#EEEEEE',
  },

  suggestionInfo: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },

  suggestionName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
  },

  suggestionLocation: {
    fontSize: 12,
    color: '#888888',
    marginTop: 5,
  },

  suggestionPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222222',
    marginTop: 7,
  },

  addButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 10,
  },

  savedButton: {
    backgroundColor: '#777777',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
    paddingBottom: 8,
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  navIcon: {
    fontSize: 21,
    color: '#888888',
  },

  navText: {
    fontSize: 10,
    color: '#888888',
    marginTop: 4,
  },

  activeNav: {
    color: '#FF5A5F',
    fontWeight: '800',
  },
});
