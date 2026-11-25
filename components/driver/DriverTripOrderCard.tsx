import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CheckRender from "@/components/CheckRender";
import { InfoRow } from "@/components/InfoRow";
import { StatusBadge } from "@/components/StatusBadge";
import { ORDER_PREFIX } from "@/constants/UserConstants";
import { Palette } from "@/constants/theme";
import { formatRD } from "@/utils/currencyUtils";
import { openExternalNavigation } from "@/utils/navigationUtils";
import { ContactButtonsRow } from "@/components/ContactButtonsRow";

type DriverTripOrderCardProps = {
  order: any;
  isExpanded: boolean;
  onToggle: () => void;
  onCall: (phone: string) => void;
  onWhatsapp: (phone: string) => void;
  tripStatus: string;
  onOpenDeliveryModal?: (orderId: string, deliveryIndex: number) => void;
};

const hasValidGPS = (address?: any): boolean => {
  if (!address?.latitude || !address?.longitude) return false;
  const lat = Number(address.latitude);
  const lng = Number(address.longitude);
  return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
};

export const DriverTripOrderCard: React.FC<DriverTripOrderCardProps> = ({
  order,
  isExpanded,
  onToggle,
  onCall,
  onWhatsapp,
  tripStatus,
  onOpenDeliveryModal,
}) => {
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        onPress={onToggle}
        style={styles.headerRow}
        activeOpacity={0.7}
      >
        <View style={styles.orderLabelContainer}>
          <Ionicons name="document-text-outline" size={18} color="#0F294A" />
          <Text style={styles.orderLabel}>
            {`${ORDER_PREFIX.ORD}${order?.orderNumber}`}
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos del cliente</Text>
            <InfoRow
              icon="person-outline"
              label="Cliente"
              value={`${order.userNames} ${order.userLastNames}`}
            />
            <InfoRow
              icon="call-outline"
              label="Teléfono"
              value={order.userPhone}
            />
          </View>

          <ContactButtonsRow
            onCall={() => onCall(order.userPhone)}
            onWhatsapp={() => onWhatsapp(order.userPhone)}
            callLabel="Llamar"
            whatsappLabel="WhatsApp"
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productos</Text>
            {order.items.map((item: any, index: number) => (
              <View key={index} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <Ionicons name="cube-outline" size={17} color="#0284C7" />
                  <Text style={styles.productTitle}>Producto {index + 1}</Text>
                </View>
                <InfoRow
                  icon="document-text-outline"
                  label="Descripción"
                  value={item.name}
                />
                <InfoRow
                  icon="speedometer-outline"
                  label="Carga en este viaje"
                  value={order.tripTons ? `${order.tripTons} t` : `${item.quantity} ${item.unit}`}
                />
                <InfoRow
                  icon="layers-outline"
                  label="Total de la orden"
                  value={`${item.quantity} ${item.unit}`}
                />
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Direcciones de entrega</Text>
            {order?.deliveries?.map((delivery: any, index: number) => (
              <View key={delivery.productId || index} style={styles.deliveryCard}>
                <View style={styles.deliveryAddressRow}>
                  <Ionicons name="location" size={18} color="#DC2626" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.deliveryAddressText}>
                      {delivery.address?.description}
                      {delivery.address?.additionalInfo
                        ? `, ${delivery.address.additionalInfo}`
                        : ""}
                    </Text>
                  </View>
                </View>

                <View style={styles.deliveryQuantityRow}>
                  <Ionicons name="layers-outline" size={15} color="#64748B" />
                  <Text style={styles.deliveryQuantityText}>
                    {order?.items?.find((o: any) => o.productId === delivery.productId)?.name || "Producto"}{" "}
                    - {delivery.quantity} {delivery.unit}
                  </Text>
                </View>

                {hasValidGPS(delivery?.address) ? (
                  <TouchableOpacity
                    style={styles.navigationButton}
                    onPress={() =>
                      openExternalNavigation({
                        latitude: Number(delivery.address.latitude),
                        longitude: Number(delivery.address.longitude),
                        label: `${order.userNames || ""} ${order.userLastNames || ""} - ${delivery.address?.description || "Destino"}`,
                      })
                    }
                    activeOpacity={0.85}
                  >
                    <Ionicons name="navigate" size={16} color="#FFFFFF" />
                    <Text style={styles.navigationButtonText}>
                      Navegar con GPS (Maps / Waze)
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.noGpsNotice}>
                    <Ionicons name="information-circle-outline" size={16} color="#B45309" />
                    <Text style={styles.noGpsNoticeText}>
                      Sin ubicación GPS fijada. Guiarse por la dirección y referencias.
                    </Text>
                  </View>
                )}

                <CheckRender allowed={delivery.status === "delivered"}>
                  <View style={{ marginTop: 8 }}>
                    <StatusBadge status="delivered" size="small" />
                  </View>
                </CheckRender>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default DriverTripOrderCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  orderLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F294A",
  },
  expandedContent: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },
  section: {
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    color: Palette.primaryDark,
  },
  contactButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#16A34A",
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    shadowColor: "#25D366",
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  productCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  deliveryCard: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  deliveryAddressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 6,
  },
  deliveryAddressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    lineHeight: 20,
  },
  deliveryQuantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
    paddingLeft: 2,
  },
  deliveryQuantityText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  deliverButton: {
    backgroundColor: "#FF7F32",
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  deliverButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  navigationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#0284C7",
    marginTop: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navigationButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  noGpsNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  noGpsNoticeText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "500",
    flex: 1,
  },
});
