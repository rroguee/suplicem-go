import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { ROLE } from "@/constants/UserConstants";
import { AuthContext } from "@/context/authContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useContext } from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const authContext = useContext(AuthContext);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          popToTopOnBlur: true,
          title:
            authContext?.user?.userType === ROLE.DRIVER
              ? "Disponibles"
              : authContext?.user?.userType === ROLE.SELLER
              ? "Ventas"
              : "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons
              size={26}
              name={
                authContext?.user?.userType === ROLE.SELLER
                  ? "cart-outline"
                  : "home-outline"
              }
              color={color}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate("(home)", { screen: "index" });
          },
        })}
      />
      <Tabs.Screen
        name="(orders)"
        options={{
          popToTopOnBlur: true,
          title:
            authContext?.user?.userType === ROLE.DRIVER
              ? "Historial"
              : authContext?.user?.userType === ROLE.ADMIN
              ? "Verificaciones"
              : authContext?.user?.userType === ROLE.SELLER
              ? "Mis Clientes"
              : "Ordenes",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name={
                authContext?.user?.userType === ROLE.ADMIN
                  ? "shield-checkmark-outline"
                  : authContext?.user?.userType === ROLE.DRIVER
                  ? "time-outline"
                  : authContext?.user?.userType === ROLE.SELLER
                  ? "people-outline"
                  : "paper-plane"
              }
              size={28}
              color={color}
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate("(orders)", { screen: "index" });
          },
        })}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          title:
            authContext?.user?.userType === ROLE.DRIVER
              ? "Cuenta"
              : authContext?.user?.userType === ROLE.SELLER
              ? "Ajustes"
              : "Configuración",
          popToTopOnBlur: true,
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={26} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate("(settings)", { screen: "index" });
          },
        })}
      />
    </Tabs>
  );
}
