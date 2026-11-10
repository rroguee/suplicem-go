import React, { useContext } from "react";
import { useLocalSearchParams, Redirect } from "expo-router";
import { OrderApprovalScreen } from "@/features/admin-orders/screens/OrderApprovalScreen";
import { AuthContext } from "@/context/authContext";
import { ROLE } from "@/constants/UserConstants";

export default function OrderApprovalRoute() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { user } = useContext(AuthContext);

  if (user?.userType !== ROLE.ADMIN) {
    return <Redirect href={{ pathname: "/client-order-detail", params: { orderId } } as any} />;
  }

  return <OrderApprovalScreen orderId={orderId || ""} />;
}