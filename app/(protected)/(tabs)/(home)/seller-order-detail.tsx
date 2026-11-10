import React from "react";
import { useLocalSearchParams } from "expo-router";
import { ClientOrderDetailScreen } from "@/features/client-orders/screens/ClientOrderDetailScreen";

export default function SellerOrderDetailRoute() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  return <ClientOrderDetailScreen orderId={orderId} />;
}
