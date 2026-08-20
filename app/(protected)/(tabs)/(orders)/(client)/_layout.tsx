import { Stack } from "expo-router";
import React from "react";

export default function ClientOrdersLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Ordenes", headerShown: false }} />
      <Stack.Screen name="client-order-detail" options={{ title: "Detalle de Orden", headerShown: false }} />
      <Stack.Screen name="admin-order-detail" options={{ title: "Detalle de Orden", headerShown: false }} />
    </Stack>
  );
}
