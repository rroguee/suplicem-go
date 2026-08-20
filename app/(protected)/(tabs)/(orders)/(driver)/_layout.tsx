import { Stack } from "expo-router";
import React from "react";

export default function DriverOrdersLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Ordenes", headerShown: false }} />
    </Stack>
  );
}
