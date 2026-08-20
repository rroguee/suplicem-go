import { Address, VehicleData } from "@/types/users";
import { clearAuthSession } from "@/utils/authStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import { createContext, PropsWithChildren, useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync();

type User = {
  uid: string; // Ya corregimos esto, ahora es obligatorio
  identificationType: "Cedula" | "Pasaporte";
  identification: string;
  email: string;
  names: string;
  lastNames: string;
  phone: string;
  userType: "client" | "driver";
  addresses: Address[];
  vehicle?: VehicleData;
};

type AuthState = {
  isLoggedIn: boolean;
  isReady: boolean;
  user: User | null;
  logIn: (user: User) => void;
  logOut: () => void;
};

const authStorageKey = "auth-key";

export const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  isReady: false,
  user: null,
  logIn: () => {},
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

  const logOut = async () => {
    setIsLoggedIn(false);
    setUser(null);
    storeAuthState({ isLoggedIn: false, user: null });

    await clearAuthSession();

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
    <AuthContext.Provider value={{ isLoggedIn, isReady, user, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
