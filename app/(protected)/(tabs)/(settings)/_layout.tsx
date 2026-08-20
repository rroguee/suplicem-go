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
        options={{ title: "Administrar", headerShown: true }}
      />
    </Stack>
  );
}
