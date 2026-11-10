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
        name="(admin)"
        options={{ headerShown: false, title: "Administración" }}
      />
      <Stack.Screen
        name="(client)"
        options={{ headerShown: false, title: "Cliente" }}
      />
      <Stack.Screen
        name="(driver)"
        options={{ headerShown: false, title: "Conductor" }}
      />
      <Stack.Screen
        name="seller-order-detail"
        options={{ headerShown: false, title: "Detalle de Orden" }}
      />
    </Stack>
  );
}
