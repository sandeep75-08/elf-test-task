import { useQuery, useQueryClient } from "@tanstack/react-query";
import { breweryApi } from "../utils/api";
import { FilterState, LocationCoords } from "../types/brewery";

export const useBreweries = (
  filters: FilterState,
  page: number,
  perPage: number
) => {
  return useQuery({
    queryKey: ["breweries", filters, page, perPage],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = {
        page: page,
        per_page: perPage,
      };

      if (filters.search.trim()) {
        params.by_name = filters.search;
      }

      if (filters.city.trim()) {
        params.by_city = filters.city;
      }

      if (filters.state.trim()) {
        params.by_state = filters.state;
      }

      if (filters.distance && filters.userLocation) {
        params.distance = filters.distance;
        params.userLocation = filters.userLocation;
        console.log(
          "Distance filter applied:",
          filters.distance,
          "miles from",
          filters.userLocation
        );
      }

      return breweryApi.getBreweries(params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};

export const useBrewery = (id: string) => {
  return useQuery({
    queryKey: ["brewery", id],
    queryFn: () => breweryApi.getBreweryById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useBrewerySearch = (query: string) => {
  return useQuery({
    queryKey: ["brewery-search", query],
    queryFn: () => breweryApi.searchBreweries(query),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useRandomBrewery = (location?: LocationCoords) => {
  return useQuery({
    queryKey: ["random-brewery", location],
    queryFn: () => breweryApi.getRandomBrewery(location),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};

export const usePrefetchBrewery = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ["brewery", id],
      queryFn: () => breweryApi.getBreweryById(id),
      staleTime: 10 * 60 * 1000,
    });
  };
};
