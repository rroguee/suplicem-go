import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";

// NUEVA INTERFAZ `Address` agregada aquí
export interface Address {
  id: string;
  description: string;
  latitude: number;
  longitude: number;
  additionalInfo?: string | null; // El campo `additionalInfo` es opcional
}

// Tipos para los detalles del viaje aceptado
export type Delivery = {
  productId: string;
  address: Address;
  quantity: number;
  unit: string;
  status: string;
  imageUrl: string; // ✅ Propiedad corregida a 'images' con un array de objetos
};

export type Item = {
  productId: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Order = {
  id: string;
  orderNumber: number;
  userId: string;
  deliveryType: string;
  deliveries: Delivery[];
  items: Item[];
  comments: string;
  status: string;
  createdAt: string;
  userNames: string;
  userLastNames: string;
  userPhone: string;
};

export type AcceptedTrip = {
  id: string;
  tripNumber: string;
  orderIds: string[];
  comments: string;
  totalTons: number;
  createdAt: string;
  assignedDriverId: string;
  status: string;
  orders: Order[];
  userNames: string;
  userLastNames: string;
  userPhone: string;
  driver?: any;
};

// Estado del contexto
type AcceptedTripState = {
  trip: AcceptedTrip | null;
  saveTrip: (trip: AcceptedTrip) => void;
  clearTrip: () => void;
};

// Storage key
const acceptedTripStorageKey = "accepted-trip-key";

// Context base
export const AcceptedTripContext = createContext<AcceptedTripState>({
  trip: null,
  saveTrip: () => {},
  clearTrip: () => {},
});

// Provider
export const AcceptedTripProvider = ({ children }: PropsWithChildren) => {
  const [trip, setTrip] = useState<AcceptedTrip | null>(null);

  useEffect(() => {
    const loadTrip = async () => {
      try {
        const value = await AsyncStorage.getItem(acceptedTripStorageKey);
        if (value) {
          const parsed = JSON.parse(value);
          setTrip(parsed);
        }
      } catch (error) {
        console.error("❌ Error cargando el viaje aceptado:", error);
      }
    };
    loadTrip();
  }, []);

  const saveTrip = async (newTrip: AcceptedTrip) => {
    try {
      setTrip(newTrip);
      await AsyncStorage.setItem(
        acceptedTripStorageKey,
        JSON.stringify(newTrip)
      );
    } catch (error) {
      console.error("❌ Error guardando el viaje aceptado:", error);
    }
  };

  const clearTrip = async () => {
    try {
      setTrip(null);
      await AsyncStorage.removeItem(acceptedTripStorageKey);
    } catch (error) {
      console.error("❌ Error limpiando el viaje aceptado:", error);
    }
  };

  return (
    <AcceptedTripContext.Provider
      value={{
        trip,
        saveTrip,
        clearTrip,
      }}
    >
      {children}
    </AcceptedTripContext.Provider>
  );
};
