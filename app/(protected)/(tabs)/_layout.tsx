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
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(orders)"
        options={{
          title: authContext?.user?.userType === ROLE.DRIVER ? "Viajes" : "Ordenes",
          tabBarIcon: ({ color }) => (
            <Ionicons name="paper-plane" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          title: "Configuración",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
