import { Stack } from "expo-router";
import React from "react";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Home", headerShown: false }}
      />
      <Stack.Screen
        name="(client)"
        options={{ headerShown: true, title: "Cliente" }}
      />
      <Stack.Screen
        name="(driver)"
        options={{ headerShown: true, title: "Conductor" }}
      />
      <Stack.Screen
        name="(settings)"
        options={{ headerShown: true, title: "Configuración" }}
      />
    </Stack>
  );
}
