import { Stack } from "expo-router";
import React from "react";

export default function DriverLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Driver Home", headerShown: true }}
      />
      <Stack.Screen
        name="driver-order"
        options={{ title: "Driver order", headerShown: false }}
      />
    </Stack>
  );
}
