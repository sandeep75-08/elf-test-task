import { Brewery, LocationCoords } from "../types/brewery";

const BASE_URL = "https://api.openbrewerydb.org/v1/breweries";

// Helper function to calculate distance between two points
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const breweryApi = {
  async getBreweries(
    params: {
      page?: number;
      per_page?: number;
      by_city?: string;
      by_state?: string;
      by_name?: string;
      distance?: number;
      userLocation?: LocationCoords;
    } = {}
  ): Promise<Brewery[]> {
    const searchParams = new URLSearchParams();

    const { distance, userLocation, ...apiParams } = params;

    Object.entries(apiParams).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.append(key, value.toString());
      }
    });

    if (distance && userLocation) {
      searchParams.set("per_page", "200"); // Get more results for filtering
    }

    const url = `${BASE_URL}?${searchParams.toString()}`;
    console.log("API Request URL:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch breweries: ${response.statusText}`);
    }

    let breweries = await response.json();
    console.log(breweries,'brewww');
    console.log("API Response count:", breweries.length);

    // Distance filtering
    if (distance && userLocation && breweries.length > 0) {
      console.log(
        "Applying distance filter:",
        distance,
        "miles from",
        userLocation
      );

      breweries = breweries
        .map((brewery: Brewery) => {
          if (!brewery.latitude || !brewery.longitude) {
            return { ...brewery, distance: Infinity };
          }

          const breweryDistance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            parseFloat(brewery.latitude),
            parseFloat(brewery.longitude)
          );


          console.log(userLocation.latitude, brewery.latitude,'latttiii');

          return { ...brewery, distance: breweryDistance };
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((brewery: any) => brewery.distance <= distance)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => a.distance - b.distance);

      console.log(
        "Filtered breweries within",
        distance,
        "miles:",
        breweries.length
      );

      const page = params.page || 1;
      const perPage = params.per_page || 20;
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;

      breweries = breweries.slice(startIndex, endIndex);
    }

    return breweries;
  },

  async getBreweryById(id: string): Promise<Brewery> {
    const response = await fetch(`${BASE_URL}/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch brewery: ${response.statusText}`);
    }

    return response.json();
  },

  async searchBreweries(query: string): Promise<Brewery[]> {
    if (!query.trim()) return [];

    const response = await fetch(
      `${BASE_URL}/search?query=${encodeURIComponent(query)}&per_page=10`
    );

    if (!response.ok) {
      throw new Error(`Failed to search breweries: ${response.statusText}`);
    }

    return response.json();
  },

  async getRandomBrewery(location?: LocationCoords): Promise<Brewery | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = { per_page: 100 };

      const breweries = await this.getBreweries(params);

      if (breweries.length === 0) return null;

      if (location) {
        const breweriesWithDistance = breweries
          .map((brewery) => {
            if (!brewery.latitude || !brewery.longitude) {
              return { ...brewery, distance: Infinity };
            }

            const distance = calculateDistance(
              location.latitude,
              location.longitude,
              parseFloat(brewery.latitude),
              parseFloat(brewery.longitude)
            );

            return { ...brewery, distance };
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((brewery: any) => brewery.distance <= 50) // Within 50 miles
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .sort((a: any, b: any) => a.distance - b.distance);

        if (breweriesWithDistance.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * Math.min(breweriesWithDistance.length, 10)
          );
          return breweriesWithDistance[randomIndex];
        }
      }

      // Fallback to any random brewery if no location or no nearby breweries
      const randomIndex = Math.floor(Math.random() * breweries.length);
      return breweries[randomIndex];
    } catch (error) {
      console.error("Failed to get random brewery:", error);
      return null;
    }
  },
};
