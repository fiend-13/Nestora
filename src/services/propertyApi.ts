
// ==========================================
// NESTORA - GEOAPIFY PROPERTY API
// ==========================================

// Paste your Geoapify API key here
const GEOAPIFY_API_KEY = 'ceab4494f8c04fea91eb791a3835d38a';

const GEOAPIFY_URL = 'https://api.geoapify.com/v2/places';

// Default location: Goa
const GOA_LOCATION = {
  latitude: 15.4909,
  longitude: 73.8278,
};

// ==========================================
// PROPERTY INTERFACE
// ==========================================

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  categories: string[];
  type: string;
  website?: string;
  phone?: string;
  openingHours?: string;
  imageUrl?: string;
}

interface GeoapifyFeature {
  properties: {
    place_id?: string;
    name?: string;
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    lat?: number;
    lon?: number;
    categories?: string[];
    website?: string;
    phone?: string;
    opening_hours?: string;
  };
}

interface GeoapifyResponse {
  features?: GeoapifyFeature[];
}

// ==========================================
// PROPERTY TYPE
// ==========================================

function getPropertyType(categories: string[]): string {
  const category = categories.find((item) =>
    item.startsWith('accommodation.')
  );

  if (!category) {
    return 'Accommodation';
  }

  const type = category.split('.')[1];

  return type
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// ==========================================
// CONVERT API DATA INTO PROPERTY OBJECT
// ==========================================

function mapProperty(feature: GeoapifyFeature): Property {
  const data = feature.properties;
  const categories = data.categories ?? [];

  const city =
    data.city ||
    data.town ||
    data.village ||
    data.state ||
    'Goa';

  return {
    id:
      data.place_id ||
      `${data.lat ?? 0}-${data.lon ?? 0}`,

    name: data.name || 'Unnamed Accommodation',

    address:
      data.formatted ||
      data.address_line1 ||
      'Address unavailable',

    city,

    latitude: data.lat ?? 0,
    longitude: data.lon ?? 0,

    categories,

    type: getPropertyType(categories),

    website: data.website,
    phone: data.phone,
    openingHours: data.opening_hours,
  };
}

// ==========================================
// SEARCH OPTIONS
// ==========================================

export interface PropertySearchOptions {
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
  category?: string;
  name?: string;
}

// ==========================================
// MAIN API FUNCTION
// ==========================================

export async function searchAccommodations(
  options: PropertySearchOptions = {}
): Promise<Property[]> {

  if (
    !GEOAPIFY_API_KEY ||
    GEOAPIFY_API_KEY === 'PASTE_YOUR_GEOAPIFY_API_KEY_HERE'
  ) {
    throw new Error(
      'Geoapify API key is missing. Add your key at the top of propertyApi.ts.'
    );
  }

  const {
    latitude = GOA_LOCATION.latitude,
    longitude = GOA_LOCATION.longitude,
    radius = 60000,
    limit = 30,
    category = 'accommodation',
    name,
  } = options;

  const params = new URLSearchParams({
    categories: category,
    filter: `circle:${longitude},${latitude},${radius}`,
    bias: `proximity:${longitude},${latitude}`,
    limit: String(limit),
    lang: 'en',
    apiKey: GEOAPIFY_API_KEY,
  });

  if (name?.trim()) {
    params.set('name', name.trim());
  }

  const response = await fetch(
    `${GEOAPIFY_URL}?${params.toString()}`
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Geoapify API error (${response.status}): ${errorText}`
    );
  }

  const data: GeoapifyResponse = await response.json();

  return (data.features ?? [])
    .map(mapProperty)
    .filter(
      (property) =>
        property.latitude !== 0 &&
        property.longitude !== 0
    );
}

// ==========================================
// GET HOTELS
// ==========================================

export async function getHotels(): Promise<Property[]> {
  return searchAccommodations({
    category: 'accommodation.hotel',
  });
}

// ==========================================
// GET APARTMENTS
// ==========================================

export async function getApartments(): Promise<Property[]> {
  return searchAccommodations({
    category: 'accommodation.apartment',
  });
}

// ==========================================
// GET GUEST HOUSES
// ==========================================

export async function getGuestHouses(): Promise<Property[]> {
  return searchAccommodations({
    category: 'accommodation.guest_house',
  });
}

// ==========================================
// GET HOSTELS
// ==========================================

export async function getHostels(): Promise<Property[]> {
  return searchAccommodations({
    category: 'accommodation.hostel',
  });
}

// ==========================================
// SEARCH PROPERTY BY NAME
// ==========================================

export async function searchPropertyByName(
  name: string
): Promise<Property[]> {
  return searchAccommodations({
    name,
  });
}

// ==========================================
// SEARCH PROPERTY BY LOCATION
// ==========================================

export async function searchPropertiesByLocation(
  latitude: number,
  longitude: number,
  radius: number = 30000
): Promise<Property[]> {
  return searchAccommodations({
    latitude,
    longitude,
    radius,
  });
}
