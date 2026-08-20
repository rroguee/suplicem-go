import LoadingOverlay from "@/components/LoadingOverlay";
import { AlertProvider } from "@/context/alertContext";
import { ApprovedOrdersProvider } from "@/context/approvedOrderContext";
import { AuthProvider } from "@/context/authContext";
import { CartProvider } from "@/context/cartContext";
import { LoadingProvider, useLoading } from "@/context/loadingContext";
import { OrdersProvider } from "@/context/orderContext";
import { AcceptedTripProvider } from "@/context/TripContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

export default function RootLayout() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <AlertProvider> 
          <CartProvider>
            <OrdersProvider>
              <AcceptedTripProvider>
                <ApprovedOrdersProvider>
                  <StatusBar style="auto" />
                  <AppContent />
                </ApprovedOrdersProvider>
              </AcceptedTripProvider>
            </OrdersProvider>
          </CartProvider>
        </AlertProvider>
      </LoadingProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { isLoading } = useLoading();
  return (
    <>
      <Stack>
        <Stack.Screen
          name="(protected)"
          options={{ headerShown: false, animation: "none" }}
        />
        <Stack.Screen
          name="login"
          options={{ headerShown: false, animation: "none" }}
        />
        <Stack.Screen
          name="register"
          options={{ headerShown: true, animation: "none", title: "Registrar" }}
        />
        <Stack.Screen
          name="terms"
          options={{
            headerShown: true,
            animation: "none",
            title: "Términos de Uso",
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{
            headerShown: true,
            animation: "none",
            title: "Política de Privacidad",
          }}
        />
      </Stack>
      <LoadingOverlay visible={isLoading} />
    </>
  );
}