import React, { useContext } from "react";
import { useLocalSearchParams, Redirect } from "expo-router";
import { AdminOrderDetailScreen } from "@/features/admin-orders/AdminOrderDetailScreen";
import { AuthContext } from "@/context/authContext";
import { ROLE } from "@/constants/UserConstants";

export default function AdminOrderDetailRoute() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { user } = useContext(AuthContext);

  if (user?.userType !== ROLE.ADMIN) {
    return <Redirect href={{ pathname: "/client-order-detail", params: { orderId } } as any} />;
  }

  return <AdminOrderDetailScreen orderId={orderId} />;
}
