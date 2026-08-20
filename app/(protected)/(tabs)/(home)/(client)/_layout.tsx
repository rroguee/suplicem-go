import { Stack } from "expo-router";
import React from "react";

export default function ClientLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Client Home", headerShown: false }} />
      <Stack.Screen name="client-cart" options={{ title: "Client Cart", headerShown: false }} />
    </Stack>
  );
}
