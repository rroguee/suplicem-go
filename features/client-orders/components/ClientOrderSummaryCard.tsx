import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import InfoRow from "@/components/InfoRow";
import StatusBadge from "@/components/StatusBadge";
import CheckRender from "@/components/CheckRender";
import { ORDER_PREFIX } from "@/constants/UserConstants";
import { AuthContext } from "@/context/authContext";
import { ClientOrderDriverCard } from "./ClientOrderDriverCard";

interface ClientOrderSummaryCardProps {
  selectedOrder: any;
  userPhone?: string;
  trip: any;
  onCallDriver: () => void;
  onWhatsappDriver: (phone?: string) => void;
}

export const ClientOrderSummaryCard: React.FC<ClientOrderSummaryCardProps> = ({
  selectedOrder,
  userPhone,
  trip,
  onCallDriver,
  onWhatsappDriver,
}) => {
  const { user } = useContext(AuthContext);
  const isSeller = user?.userType === "seller";
  const clientPhone =
    selectedOrder.userPhone || userPhone || selectedOrder.phone || selectedOrder.recipientPhone;

  const deliveryAddress =
    selectedOrder.deliveryAddress || selectedOrder.deliveries?.[0]?.address;

  return (
    <View style={styles.container}>
      <InfoRow
        icon="receipt-outline"
        label="Número de Orden"
        value={`${ORDER_PREFIX.ORD}${selectedOrder.orderNumber}`}
      />
      <InfoRow icon="shield-checkmark-outline" label="Estado">
        <StatusBadge status={selectedOrder.status} size="small" />
      </InfoRow>

      {Boolean(selectedOrder.userNames) && (
        <InfoRow
          icon="person-outline"
          label="Cliente"
          value={`${selectedOrder.userNames} ${selectedOrder.userLastNames || ""}`.trim()}
        />
      )}

      {/* Botones de Contacto Exclusivos para el Vendedor */}
      {isSeller && Boolean(clientPhone) && (
        <View style={styles.sellerContactContainer}>
          <Text style={styles.sellerContactHeader}>Contactar Cliente:</Text>
          <View style={styles.sellerContactRow}>
            <TouchableOpacity
              style={styles.sellerContactCallBtn}
              onPress={() => Linking.openURL(`tel:${clientPhone}`)}
            >
              <Ionicons name="call" size={15} color="#0284C7" />
              <Text style={styles.sellerContactCallText}>Llamar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sellerContactWaBtn}
              onPress={() => {
                const clean = String(clientPhone).replace(/[^0-9]/g, "");
                const wa = clean.startsWith("1") ? clean : `1${clean}`;
                Linking.openURL(`https://wa.me/${wa}`);
              }}
            >
              <Ionicons name="logo-whatsapp" size={15} color="#16A34A" />
              <Text style={styles.sellerContactWaText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {Boolean(selectedOrder.paymentMethod) && (
        <InfoRow
          icon="card-outline"
          label="Método de Pago"
          value={
            selectedOrder.paymentMethod === "credit"
              ? "Pago a Crédito"
              : "Transferencia Bancaria"
          }
        />
      )}

        {/* Banner de Orden Rechazada */}
      {selectedOrder.status === "rejected" && (
        <View style={styles.rejectedBanner}>
          <View style={styles.rejectedBannerIcon}>
            <Ionicons name="close-circle" size={24} color="#DC2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rejectedBannerTitle}>Pedido Rechazado</Text>
            <Text style={styles.rejectedBannerText}>
              {selectedOrder.rejectionReason ||
                selectedOrder.declineReason ||
                "Este pedido fue rechazado por la administración."}
            </Text>
          </View>
        </View>
      )}

      {Boolean(selectedOrder.userPhone || userPhone) && (
        <InfoRow
          icon="call-outline"
          label="Teléfono de Contacto"
          value={selectedOrder.userPhone || userPhone || "No registrado"}
        />
      )}

      <InfoRow
        icon="cube-outline"
        label="Tipo de Entrega"
        value={
          selectedOrder.deliveryType === "domicilio"
            ? "Entrega a Domicilio / Obra"
            : "Retiro en Almacén"
        }
      />

      {/* Nueva Tarjeta Estilizada de Dirección de Entrega */}
      {selectedOrder.deliveryType === "domicilio" && Boolean(deliveryAddress) && (
        <View style={styles.addressCard}>
          <View style={styles.addressHeaderRow}>
            <Ionicons name="location-outline" size={16} color="#64748B" />
            <Text style={styles.addressLabel}>Dirección de Entrega</Text>
          </View>

          <Text style={styles.addressText}>
            {deliveryAddress.description || "Dirección no especificada"}
          </Text>

          {Boolean(deliveryAddress.additionalInfo) && (
            <View style={styles.addressRefBadge}>
              <Ionicons
                name="flag-outline"
                size={14}
                color="#D97706"
                style={{ marginTop: 2 }}
              />
              <Text style={styles.addressRefText}>
                <Text style={{ fontWeight: "700", color: "#92400E" }}>
                  Referencia:{" "}
                </Text>
                {deliveryAddress.additionalInfo}
              </Text>
            </View>
          )}
        </View>
      )}

      {trip && (
        <InfoRow icon="car-outline" label="Estado del Viaje">
          <StatusBadge status={trip.status || "available"} size="small" />
        </InfoRow>
      )}

      {/* Banner de Estado del Viaje Aceptado */}
      {trip?.status === "accepted" && (
        <View style={styles.acceptedBanner}>
          <View style={styles.acceptedBannerIcon}>
            <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.acceptedBannerTitle}>
              ¡Viaje Aceptado por el Conductor!
            </Text>
            <Text style={styles.acceptedBannerText}>
              {trip?.driver?.names
                ? `${trip.driver.names} aceptó tu pedido y está preparando la carga para iniciar ruta.`
                : "Tu pedido ya fue aceptado por el conductor y se está preparando para salir."}
            </Text>
          </View>
        </View>
      )}

      {/* Banner de Estado del Viaje En camino */}
      {(trip?.status === "started" || trip?.status === "in_progress") && (
        <View
          style={[
            styles.acceptedBanner,
            { backgroundColor: "#EFF6FF", borderColor: "#93C5FD" },
          ]}
        >
          <View
            style={[
              styles.acceptedBannerIcon,
              { backgroundColor: "#DBEAFE" },
            ]}
          >
            <Ionicons name="navigate" size={24} color="#1D4ED8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.acceptedBannerTitle, { color: "#1E40AF" }]}>
              ¡Pedido en Camino!
            </Text>
            <Text style={[styles.acceptedBannerText, { color: "#1E3A8A" }]}>
              {trip?.driver?.names
                ? `${trip.driver.names} va en camino con tu entrega. Puedes ver su avance en el mapa.`
                : "El conductor ha iniciado la ruta de entrega hacia tu dirección."}
            </Text>
          </View>
        </View>
      )}

      <CheckRender allowed={trip !== null}>
        <InfoRow
          icon="navigate-outline"
          label="Número de Viaje"
          value={trip?.tripNumber}
        />
      </CheckRender>

      {/* Tarjeta de Conductor y Vehículo */}
      <CheckRender allowed={Boolean(trip?.assignedDriverId || trip?.driver)}>
        <ClientOrderDriverCard
          driver={trip?.driver}
          onCallDriver={onCallDriver}
          onWhatsappDriver={onWhatsappDriver}
        />
      </CheckRender>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  addressCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  addressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  addressLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 14,
    color: "#0F294A",
    fontWeight: "500",
    lineHeight: 20,
  },
  addressRefBadge: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  addressRefText: {
    fontSize: 13,
    color: "#92400E",
    flex: 1,
    lineHeight: 18,
  },
  acceptedBanner: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    alignItems: "center",
    gap: 12,
  },
  acceptedBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  acceptedBannerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E40AF",
  },
  acceptedBannerText: {
    fontSize: 12,
    color: "#1E3A8A",
    marginTop: 2,
    lineHeight: 16,
  },

    rejectedBanner: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    alignItems: "center",
    gap: 12,
  },
  rejectedBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  rejectedBannerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#DC2626",
  },
  rejectedBannerText: {
    fontSize: 12,
    color: "#991B1B",
    marginTop: 2,
    lineHeight: 16,
  },
  sellerContactContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sellerContactHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 6,
  },
  sellerContactRow: {
    flexDirection: "row",
    gap: 8,
  },
  sellerContactCallBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#E0F2FE",
    paddingVertical: 8,
    borderRadius: 6,
  },
  sellerContactCallText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0284C7",
  },
  sellerContactWaBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    paddingVertical: 8,
    borderRadius: 6,
  },
  sellerContactWaText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
  },
});
