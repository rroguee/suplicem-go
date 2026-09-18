import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { InfoRow } from "@/components/InfoRow";
import { Palette } from "@/constants/theme";
import { ORDER_PREFIX } from "@/constants/UserConstants";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { AcceptedTripContext } from "@/context/TripContext";
import { aceptedTrip, getTripDetail } from "@/services/tripsService";
import { formatRD } from "@/utils/currencyUtils";

export default function DriverTripPreviewScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();
  const { trip: activeTrip, saveTrip } = useContext(AcceptedTripContext);
  const hasOtherActiveTrip = Boolean(activeTrip && activeTrip.id !== tripId);

  const [trip, setTrip] = useState<any>(null);
  const [loadingTrip, setLoadingTrip] = useState(true);

  useEffect(() => {
    if (!tripId) return;

    const fetchDetail = async () => {
      try {
        setLoadingTrip(true);
        const response = await getTripDetail(tripId);
        if (response?.success && response?.trip) {
          setTrip(response.trip);
        } else {
          showAlert({
            message: "No se pudieron cargar los detalles del viaje.",
            type: "error",
          });
        }
      } catch (error) {
        console.error("Error al obtener detalle del viaje:", error);
        showAlert({
          message: "Error de red al consultar el viaje.",
          type: "error",
        });
      } finally {
        setLoadingTrip(false);
      }
    };

       fetchDetail();
  }, [tripId, showAlert]);

  const handleCallClient = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsapp = (phone: string) => {
    if (!phone) return;
    const formattedPhone = phone.startsWith("+") ? phone : `+1${phone}`;
    Linking.openURL(`whatsapp://send?phone=${formattedPhone}`);
  };

  const handleAccept = async () => {
    if (!tripId) return;

    if (hasOtherActiveTrip) {
      showAlert({
        message: "Ya tienes un viaje activo. Debes completarlo antes de aceptar uno nuevo.",
        type: "warning",
      });
      return;
    }

    try {
      // Solicitar permisos de ubicación
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Ubicación no concedida al aceptar el viaje");
        }
      } catch (e) {
        console.warn("Aviso de permisos de ubicación:", e);
      }

      show();
      const acceptResponse = await aceptedTrip(tripId);

      if (acceptResponse.success) {
        const updatedTrip = { ...trip, status: "accepted" };
        saveTrip(updatedTrip);
        showAlert({
          message: "¡Viaje aceptado con éxito! Ahora puedes iniciar tu ruta.",
          type: "success",
        });
        // Redirigir a la pantalla de ruta en curso
        router.replace("/driver-order");
      } else {
        showAlert({
          message: acceptResponse?.message || "No se pudo aceptar el viaje.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error aceptando viaje:", error);
      showAlert({
        message: "Ocurrió un error al aceptar el viaje.",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  if (loadingTrip) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Cargando información del viaje...</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.headerContainer}>
          <ScreenHeader title="Detalle del Viaje" showBack={true} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={56} color="#94A3B8" />
          <Text style={styles.emptyText}>No se encontró el viaje solicitado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.headerContainer}>
        <ScreenHeader
          title="Detalle del Viaje"
          subtitle={`Viaje #${trip.tripNumber || ""}`}
          showBack={true}
        />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Resumen General del Viaje (Hero Card) */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.tripIconCircle}>
              <Ionicons name="cube-outline" size={22} color="#E31E24" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryTitle}>Carga del Viaje</Text>
              <Text style={styles.summarySubtitle}>
                {trip.orders?.length || 0}{" "}
                {trip.orders?.length === 1 ? "orden a entregar" : "órdenes a entregar"}
              </Text>
            </View>
            <View style={styles.tonsBadge}>
              <Text style={styles.tonsBadgeText}>
                {trip.totalTons || 0} Toneladas
              </Text>
            </View>
          </View>

          {Boolean(trip.comments) && (
            <View style={styles.tripCommentsBox}>
              <Ionicons name="chatbox-ellipses-outline" size={16} color="#475569" />
              <Text style={styles.tripCommentsText}>{trip.comments}</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>
          Órdenes del Viaje ({trip.orders?.length || 0})
        </Text>

        {/* Listado de Órdenes (Abiertas por defecto, sin flecha desplegable) */}
        {trip.orders?.map((order: any, index: number) => (
          <View key={order.id || index} style={styles.orderCard}>
            {/* Cabecera de la Orden */}
            <View style={styles.orderHeaderRow}>
              <View style={styles.orderBadge}>
                <Ionicons name="receipt-outline" size={16} color="#0F294A" />
                <Text style={styles.orderBadgeText}>
                  {ORDER_PREFIX.ORD}{order.orderNumber}
                </Text>
              </View>
              <Text style={styles.orderIndexText}>Parada #{index + 1}</Text>
            </View>

            {/* Datos del Cliente */}
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Datos del Cliente</Text>
              <InfoRow
                icon="person-outline"
                label="Cliente"
                value={`${order.userNames || ""} ${order.userLastNames || ""}`.trim() || "No especificado"}
              />
              <InfoRow
                icon="call-outline"
                label="Teléfono"
                value={order.userPhone || "No registrado"}
              />

              {Boolean(order.userPhone) && (
                <View style={styles.clientContactButtons}>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCallClient(order.userPhone)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={15} color="#fff" />
                    <Text style={styles.contactButtonText}>Llamar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={() => handleWhatsapp(order.userPhone)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                    <Text style={styles.contactButtonText}>WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Productos a entregar */}
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Materiales a Entregar</Text>
              {order.items?.map((item: any, iIdx: number) => (
                <View key={iIdx} style={styles.productRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productQuantity}>
                      Cantidad: {item.quantity} {item.unit}
                    </Text>
                  </View>
                  {Boolean(item.subtotal) && (
                    <Text style={styles.productPrice}>
                      {formatRD(item.subtotal)}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* Destinos y direcciones de entrega */}
            <View style={[styles.subSection, { borderBottomWidth: 0 }]}>
              <Text style={styles.subSectionTitle}>Dirección de Entrega</Text>
              {order.deliveries?.map((delivery: any, dIdx: number) => (
                <View key={dIdx} style={styles.deliveryRow}>
                  <Ionicons name="location-sharp" size={18} color="#E31E24" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.deliveryAddressText}>
                      {delivery.address?.description || "Dirección no especificada"}
                    </Text>
                    {Boolean(delivery.address?.additionalInfo) && (
                      <Text style={styles.deliveryExtraText}>
                        Ref: {delivery.address.additionalInfo}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Botón inferior fijo para Aceptar el Viaje */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.acceptButton,
            hasOtherActiveTrip && styles.disabledAcceptButton,
          ]}
          onPress={handleAccept}
          disabled={hasOtherActiveTrip}
          activeOpacity={0.88}
        >
          <Ionicons
            name={hasOtherActiveTrip ? "lock-closed-outline" : "checkmark-circle-outline"}
            size={22}
            color={hasOtherActiveTrip ? "#94A3B8" : "#fff"}
          />
          <Text
            style={[
              styles.acceptButtonText,
              hasOtherActiveTrip && styles.disabledAcceptButtonText,
            ]}
          >
            {hasOtherActiveTrip
              ? "Ya tienes un viaje activo"
              : "Aceptar este Viaje"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    color: "#64748B",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tripIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
  },
  summarySubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  tonsBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tonsBadgeText: {
    color: "#E31E24",
    fontWeight: "bold",
    fontSize: 13,
  },
  tripCommentsBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F1F5F9",
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  tripCommentsText: {
    fontSize: 13,
    color: "#334155",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 10,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  orderHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  orderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  orderBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F294A",
  },
  orderIndexText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  subSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  clientContactButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    borderRadius: 8,
  },
  whatsappButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#16A34A",
    paddingVertical: 8,
    borderRadius: 8,
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  productQuantity: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0F294A",
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF1F2",
    padding: 10,
    borderRadius: 8,
  },
  deliveryAddressText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1E293B",
  },
  deliveryExtraText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Palette.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledAcceptButton: {
    backgroundColor: "#E2E8F0",
  },
  disabledAcceptButtonText: {
    color: "#94A3B8",
  },
});