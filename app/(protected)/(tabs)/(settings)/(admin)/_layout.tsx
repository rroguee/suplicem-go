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
        name="user-requests"
        options={{ title: "Solicitudes de Registro", headerShown: false }}
      />
      <Stack.Screen
        name="user-management"
        options={{ title: "Crear usuario", headerShown: false }}
      />
      <Stack.Screen
        name="create-user"
        options={{ title: "Crear usuario en servidor", headerShown: false }}
      />
      <Stack.Screen
        name="create-product"
        options={{ title: "Crear producto", headerShown: false }}
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
      <Stack.Screen
        name="user-detail"
        options={{ title: "Detalle de Usuario", headerShown: false }}
      />
      <Stack.Screen
        name="bank-accounts-screen"
        options={{ title: "Cuentas Bancarias", headerShown: false }}
      />
    </Stack>
  );
}
