import { Address, VehicleData } from "@/types/users";
import { clearAuthSession } from "@/utils/authStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import { createContext, useContext, PropsWithChildren, useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync();

type User = {
  uid: string; // Ya corregimos esto, ahora es obligatorio
  identificationType: "Cedula" | "Pasaporte";
  identification: string;
  email: string;
  names: string;
  lastNames: string;
  phone: string;
  userType: "client" | "driver" | "admin" | "seller";
  driverCode?: string;
  sellerCode?: string;
  sellerId?: string;
  addresses: Address[];
  vehicle?: VehicleData;
  status?: string;
};

type AuthState = {
  isLoggedIn: boolean;
  isReady: boolean;
  user: User | null;
  logIn: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  logOut: () => void;
};

const authStorageKey = "auth-key";

export const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  isReady: false,
  user: null,
  logIn: () => {},
  updateUser: () => {},
  logOut: () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  const storeAuthState = async (state: {
    isLoggedIn: boolean;
    user: User | null;
  }) => {
    try {
      const jsonValue = JSON.stringify(state);
      await AsyncStorage.setItem(authStorageKey, jsonValue);
    } catch (error) {
      console.log("Error saving auth state", error);
    }
  };

  const logIn = (userData: User) => {
    setIsLoggedIn(true);
    setUser(userData);
    storeAuthState({ isLoggedIn: true, user: userData });
    router.replace("/");
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      storeAuthState({ isLoggedIn: true, user: updated });
      return updated;
    });
  };

  const logOut = async () => {
    const prevUid = user?.uid;
    setIsLoggedIn(false);
    setUser(null);
    storeAuthState({ isLoggedIn: false, user: null });

    await clearAuthSession();

    try {
      await AsyncStorage.removeItem("accepted-trip-key");
      if (prevUid) {
        await AsyncStorage.removeItem(`accepted-trip-${prevUid}`);
      }
    } catch (e) {
      console.log("Error clearing cached trip on logout:", e);
    }

    router.replace("/login");
  };

  useEffect(() => {
    const getAuthFromStorage = async () => {
      try {
        const value = await AsyncStorage.getItem(authStorageKey);
        if (value !== null) {
          const auth = JSON.parse(value);
          setIsLoggedIn(auth.isLoggedIn);
          setUser(auth.user || null);
        }
      } catch (error) {
        console.log("Error fetching auth state", error);
      }
      setIsReady(true);
    };

    getAuthFromStorage();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isReady, user, logIn, updateUser, logOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
