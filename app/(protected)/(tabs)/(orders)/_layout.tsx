import { Stack } from "expo-router";
import React from "react";

export default function ClientOrdersLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Ordenes", headerShown: false }}
      />
      <Stack.Screen
        name="(client)"
        options={{ title: "Ordenes", headerShown: true }}
      />
      <Stack.Screen
        name="(driver)"
        options={{ title: "Ordenes", headerShown: true }}
      />
    </Stack>
  );
}
