import { Stack } from "expo-router";
import React from "react";

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Admin Home", headerShown: true }}
      />
      <Stack.Screen
        name="admin-orders"
        options={{ title: "Admin orders", headerShown: false }}
      />
      <Stack.Screen
        name="admin-order-detail"
        options={{ title: "Detalle de Orden", headerShown: false }}
      />
    </Stack>
  );
}
