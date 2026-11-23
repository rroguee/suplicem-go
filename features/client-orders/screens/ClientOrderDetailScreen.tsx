import React, { useContext, useState, useEffect } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/components/ScreenHeader";
import { AuthContext } from "@/context/authContext";
import { useOrders } from "@/context/orderContext";
import { Palette } from "@/constants/theme";
import { getOrderDetail } from "@/services/orderService";
import { useClientOrderTracking } from "../hooks/useClientOrderTracking";
import { useRepeatOrder } from "../hooks/useRepeatOrder";
import { ClientOrderSummaryCard } from "../components/ClientOrderSummaryCard";
import { ClientOrderReceiptCard } from "../components/ClientOrderReceiptCard";
import { ClientOrderReorderBanner } from "../components/ClientOrderReorderBanner";
import { ClientOrderTrackingSteps } from "../components/ClientOrderTrackingSteps";
import { ClientOrderMap } from "../components/ClientOrderMap";
import { ClientDeliveryPinCard } from "../components/ClientDeliveryPinCard";
import { ClientDeliveryProgressBar } from "../components/ClientDeliveryProgressBar";
import { ClientTripCard } from "../components/ClientTripCard";
import { ClientTripTrackingModal } from "../components/ClientTripTrackingModal";
import { ClientOrderProductList } from "../components/ClientOrderProductList";
import { ClientOrderDeliveriesList } from "../components/ClientOrderDeliveriesList";
import { styles } from "../styles/clientOrderDetail.styles";

interface ClientOrderDetailScreenProps {
  orderId?: string;
}

export const ClientOrderDetailScreen: React.FC<ClientOrderDetailScreenProps> = ({ orderId }) => {
  const { user } = useContext(AuthContext);
  const { orders, updateOrder } = useOrders();
  const [fetchedOrder, setFetchedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const orderFromContext = orders.find((order) => order.id === orderId);
  const selectedOrder = orderFromContext || fetchedOrder;

  useEffect(() => {
    if (!orderFromContext && orderId) {
      setLoading(true);
      getOrderDetail(orderId)
        .then((res: any) => {
          if (res?.order) setFetchedOrder(res.order);
        })
        .finally(() => setLoading(false));
    }
  }, [orderFromContext, orderId]);

  const {
    trip,
    trips,
    tonsInfo,
    driverLocation,
    handleCallDriver,
    handleWhatsapp,
  } = useClientOrderTracking(selectedOrder);

  const isMultiTrip = trips.length > 1;
  const [trackingTripId, setTrackingTripId] = useState<string | null>(null);
  const activeModalTrip =
    trips.find((t: any, idx: number) => (t.id || `trip-${idx}`) === trackingTripId) || null;
  const activeModalTripIndex = trips.findIndex(
    (t: any, idx: number) => (t.id || `trip-${idx}`) === trackingTripId
  );
  const isCement = selectedOrder?.items?.some(
    (i: any) => i.unit === "fundas" || i.name?.toLowerCase().includes("cemento")
  );

  const { handleRepeatOrder } = useRepeatOrder(selectedOrder);

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={[styles.emptyText, { marginTop: 12 }]}>Cargando detalle del pedido...</Text>
      </View>
    );
  }

  if (!selectedOrder) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No se encontró información de la orden.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <ScreenHeader title="Detalle de Orden" showBack={true} />

      {/* 1. Resumen de la Orden y Datos de Entrega */}
      <ClientOrderSummaryCard
        selectedOrder={selectedOrder}
        userPhone={user?.phone}
        trip={trip}
        onCallDriver={handleCallDriver}
        onWhatsappDriver={handleWhatsapp}
      />

      {/* 1.1 Progreso General de Entrega */}
      {(isMultiTrip || (tonsInfo.deliveredTons > 0 && tonsInfo.totalTons > 0)) && (
        <ClientDeliveryProgressBar
          deliveredTons={tonsInfo.deliveredTons || selectedOrder.deliveredTons || 0}
          totalTons={tonsInfo.totalTons || selectedOrder.totalTons || 0}
          items={selectedOrder.items}
        />
      )}

      {selectedOrder.deliveryType === "domicilio" ? (
        <>
          {isMultiTrip ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚚 Camiones en Ruta ({trips.length})</Text>
              {trips.map((t: any, idx: number) => (
                <ClientTripCard
                  key={t.id || idx}
                  trip={t}
                  index={idx}
                  onCallDriver={handleCallDriver}
                  onWhatsappDriver={handleWhatsapp}
                  onTrackTrip={() => setTrackingTripId(t.id || `trip-${idx}`)}
                  isCementOrder={isCement}
                  cementProductName={
                    selectedOrder.items?.find(
                      (i: any) => i.unit === "fundas" || i.name?.toLowerCase().includes("cemento")
                    )?.name
                  }
                  destination={selectedOrder.deliveries?.[0]?.address}
                />
              ))}
            </View>
          ) : (
            <ClientDeliveryPinCard pin={trip?.deliveryPin} tripStatus={trip?.status} />
          )}
        </>
      ) : (
        /* Tarjeta Informativa para Retiro en Almacén */
        <View style={styles.pickupCard}>
          <View style={styles.pickupHeader}>
            <Ionicons name="storefront-outline" size={24} color="#0F294A" />
            <Text style={styles.pickupTitle}>Retiro en Almacén / Planta</Text>
          </View>
          <Text style={styles.pickupText}>
            {selectedOrder.status === "pending"
              ? "Tu pedido está registrado y pendiente de confirmación. Una vez aprobado por administración, podrás pasar a retirarlo."
              : selectedOrder.status === "completed"
              ? "Este pedido ya fue retirado en almacén."
              : selectedOrder.status === "rejected" || selectedOrder.status === "canceled"
              ? "Este pedido fue cancelado."
              : "¡Tu pedido está listo para retiro! Presenta tu número de orden en el almacén para retirar tus materiales."}
          </Text>
        </View>
      )}

      {/* 1.5. Comprobante de Pago */}
      <ClientOrderReceiptCard
        order={selectedOrder}
        canUploadReceipt={user?.userType !== "seller"}
        onReceiptUpdated={(newReceiptUrl) => {
          if (selectedOrder.id) {
            updateOrder(selectedOrder.id, { receiptImage: newReceiptUrl });
          }
        }}
      />

      {/* 2. Banner de Repetir Pedido */}
      {user?.userType !== "seller" && (
        <ClientOrderReorderBanner
          itemsCount={selectedOrder.items?.length || 0}
          onRepeatOrder={handleRepeatOrder}
        />
      )}

      {/* 3. Lista de Productos (Atómica) */}
      <ClientOrderProductList items={selectedOrder.items} />

      {/* 4. Lista de Entregas por Destino (Atómica) */}
      <ClientOrderDeliveriesList
        deliveries={selectedOrder.deliveries}
        items={selectedOrder.items}
      />

      {/* 5. Comentarios */}
      {selectedOrder.comments ? (
        <View style={styles.section}>
          <Text style={styles.commentsLabel}>Comentarios:</Text>
          <Text style={styles.commentsValue}>{selectedOrder.comments}</Text>
        </View>
      ) : null}

      {/* 6. Seguimiento de Pasos */}
      {selectedOrder.deliveryType === "domicilio" && (
        <ClientOrderTrackingSteps tripStatus={trip?.status} />
      )}

      {/* 7. Mapa de Seguimiento en Vivo */}
      {selectedOrder.deliveryType === "domicilio" && !isMultiTrip && (
        <ClientOrderMap
          driverLocation={driverLocation}
          trip={trip}
          deliveries={selectedOrder.deliveries}
          orderId={selectedOrder.id}
        />
      )}

      {/* 8. Modal de Seguimiento por Camión Individual */}
      <ClientTripTrackingModal
        visible={Boolean(activeModalTrip)}
        trip={activeModalTrip}
        tripIndex={activeModalTripIndex >= 0 ? activeModalTripIndex : 0}
        deliveries={selectedOrder.deliveries}
        orderId={selectedOrder.id}
        onClose={() => setTrackingTripId(null)}
        onCallDriver={handleCallDriver}
        onWhatsappDriver={handleWhatsapp}
      />
    </ScrollView>
  );
};
