import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
import "react-native-reanimated";

import { AuthContext } from "@/context/authContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useContext } from "react";

export default function ProtectedLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const authState = useContext(AuthContext);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  if (!authState.isReady) {
    return null;
  }

  if (!authState.isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
