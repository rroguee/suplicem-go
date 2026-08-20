import { Stack } from "expo-router";
import React from "react";

export default function ClientSettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Configuración", headerShown: false }}
      />
      <Stack.Screen
        name="user-management"
        options={{ title: "Crear usuario", headerShown: false }}
      />
      <Stack.Screen
        name="create-product"
        options={{ title: "Crear producto", headerShown: false }}
      />
      <Stack.Screen
        name="create-trip"
        options={{ title: "Crear viaje", headerShown: false }}
      />
      <Stack.Screen
        name="products-screen"
        options={{ title: "lista  de productos", headerShown: false }}
      />
      <Stack.Screen
        name="trips-screen"
        options={{ title: "lista  de  viajes", headerShown: false }}
      />
      <Stack.Screen
        name="trip-detail-screen"
        options={{ title: "lista  de  viajes", headerShown: false }}
      />
    </Stack>
  );
}
