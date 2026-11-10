import { Stack } from "expo-router";
import React from "react";

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Configuración", headerShown: false }}
      />
      <Stack.Screen
        name="(admin)"
        options={{ title: "Administrar", headerShown: false }}
      />
      <Stack.Screen
        name="(client)"
        options={{ title: "Cliente", headerShown: false }}
      />
      <Stack.Screen
        name="(driver)"
        options={{ title: "Chofer", headerShown: false }}
      />
    </Stack>
  );
}
