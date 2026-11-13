import { useState, useEffect, useMemo, useRef } from "react";
import { getTripDirections } from "@/services/tripsService";

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface RoadEstimate {
  formattedDuration: string;
  formattedDistance: string;
}

interface UseTripRouteProps {
  originCoords: LatLng;
  destCoords: LatLng | null;
}

export const useTripRoute = ({ originCoords, destCoords }: UseTripRouteProps) => {
  const [fullRoutePoints, setFullRoutePoints] = useState<LatLng[]>([]);
  const [roadEstimate, setRoadEstimate] = useState<RoadEstimate | null>(null);
  const lastFetchedOrigin = useRef<LatLng | null>(null);

  useEffect(() => {
    if (
      !destCoords?.latitude ||
      !destCoords?.longitude ||
      !originCoords?.latitude ||
      !originCoords?.longitude
    ) {
      setFullRoutePoints([]);
      setRoadEstimate(null);
      return;
    }

    // Evitar llamadas redundantes si el camión sigue en el trayecto (<1km de desviación)
    if (fullRoutePoints.length > 0 && lastFetchedOrigin.current) {
      const dist = Math.hypot(
        originCoords.latitude - lastFetchedOrigin.current.latitude,
        originCoords.longitude - lastFetchedOrigin.current.longitude
      );
      if (dist < 0.01) return;
    }

    let isMounted = true;
    const fetchDirections = async () => {
      try {
        const response = await getTripDirections(
          originCoords.latitude,
          originCoords.longitude,
          destCoords.latitude,
          destCoords.longitude
        );

        if (isMounted && response?.data?.success && response?.data?.data) {
          const { points, formattedDuration, formattedDistance } = response.data.data;
          if (Array.isArray(points) && points.length > 0) {
            const mapped: LatLng[] = points.map((p: any) => ({
              latitude: p.latitude,
              longitude: p.longitude,
            }));
            setFullRoutePoints(mapped);
            setRoadEstimate({ formattedDuration, formattedDistance });
            lastFetchedOrigin.current = { ...originCoords };
          }
        }
      } catch (error) {
        console.warn("[useTripRoute mobile] Fallback:", error);
      }
    };

    fetchDirections();

    return () => {
      isMounted = false;
    };
  }, [originCoords.latitude, originCoords.longitude, destCoords?.latitude, destCoords?.longitude, fullRoutePoints.length]);

  // Recorte dinámico instantáneo a medida que avanza el GPS
  const routeCoordinates = useMemo(() => {
    if (fullRoutePoints.length === 0) return [];
    if (!originCoords?.latitude || !originCoords?.longitude) return fullRoutePoints;

    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < fullRoutePoints.length; i++) {
      const pt = fullRoutePoints[i];
      const dist = Math.hypot(
        pt.latitude - originCoords.latitude,
        pt.longitude - originCoords.longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    return [originCoords, ...fullRoutePoints.slice(closestIndex)];
  }, [fullRoutePoints, originCoords.latitude, originCoords.longitude]);

  return { routeCoordinates, roadEstimate };
};
