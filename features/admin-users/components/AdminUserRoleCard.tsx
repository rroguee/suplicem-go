import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EditDriverVehicleModal } from "./EditDriverVehicleModal";
import { AssignSellerModal } from "./AssignSellerModal";

interface AdminUserRoleCardProps {
  user: any;
  onRefresh?: () => void;
}

export const AdminUserRoleCard: React.FC<AdminUserRoleCardProps> = ({ user, onRefresh }) => {
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);

  if (user?.userType === "driver") {
    const driverCode =
      user?.driverCode || (user?.uid ? `COND-${user.uid.slice(0, 5).toUpperCase()}` : "COND-XXXX");
    const v = user?.vehicle;

    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Información de Conductor</Text>
        <View style={styles.badgeRow}>
          <Text style={styles.label}>Código de Chofer:</Text>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{driverCode}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <Text style={styles.sectionSubtitle}>Vehículo Asignado</Text>
          <TouchableOpacity onPress={() => setShowVehicleModal(true)}>
            <Text style={{ fontSize: 13, color: "#E31E24", fontWeight: "700" }}>
              {v ? "Editar" : "+ Asignar"}
            </Text>
          </TouchableOpacity>
        </View>

        {v ? (
          <View style={styles.vehicleBox}>
            <View style={styles.vehicleRow}>
              <Ionicons name="car-sport-outline" size={18} color="#0F294A" />
              <Text style={styles.vehicleText}>
                {v.brand} {v.model} ({v.year || "Año N/A"})
              </Text>
            </View>
            <View style={styles.vehicleRow}>
              <Ionicons name="pricetag-outline" size={18} color="#0F294A" />
              <Text style={styles.vehicleText}>
                Placa: <Text style={{ fontWeight: "700" }}>{v.plateNumber || "N/A"}</Text>
              </Text>
            </View>
            <View style={styles.vehicleRow}>
              <Ionicons name="speedometer-outline" size={18} color="#0F294A" />
              <Text style={styles.vehicleText}>Capacidad: {v.tons ? `${v.tons} Tons` : "N/A"}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>Sin datos de vehículo registrados.</Text>
        )}

        <EditDriverVehicleModal
          visible={showVehicleModal}
          onClose={() => setShowVehicleModal(false)}
          userId={user.uid || user.id}
          initialVehicle={v}
          onSuccess={() => onRefresh && onRefresh()}
        />
      </View>
    );
  }

  if (user?.userType === "client") {
    const addresses = user?.addresses || [];
    const hasSeller = Boolean(user.sellerId);
    const sellerDisplay = user.sellerName
      ? `[${user.sellerCode || "VEND-XXXX"}] ${user.sellerName}`
      : user.sellerId
      ? `ID: ${user.sellerId}`
      : null;

    return (
      <View style={styles.card}>
        {/* Sección: Vendedor Asignado */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Text style={styles.sectionSubtitle}>Vendedor Asignado</Text>
          <TouchableOpacity onPress={() => setShowSellerModal(true)}>
            <Text style={{ fontSize: 13, color: "#E31E24", fontWeight: "700" }}>
              {hasSeller ? "Cambiar" : "+ Asignar"}
            </Text>
          </TouchableOpacity>
        </View>

        {hasSeller ? (
          <View style={[styles.vehicleBox, { backgroundColor: "#F0F9FF", borderColor: "#BAE6FD" }]}>
            <View style={styles.vehicleRow}>
              <Ionicons name="briefcase-outline" size={18} color="#0284C7" />
              <Text style={[styles.vehicleText, { color: "#0369A1", fontWeight: "700" }]}>
                {sellerDisplay}
              </Text>
            </View>
            {user.sellerPhone ? (
              <View style={styles.vehicleRow}>
                <Ionicons name="call-outline" size={18} color="#0284C7" />
                <Text style={[styles.vehicleText, { color: "#0369A1" }]}>
                  Tel: {user.sellerPhone}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <Text style={styles.emptyText}>Sin vendedor asignado (cartera general libre).</Text>
        )}

        {/* Separador visual */}
        <View style={{ height: 1, backgroundColor: "#F1F5F9", marginVertical: 14 }} />

        {/* Sección: Direcciones Registradas */}
        <Text style={styles.sectionTitle}>Direcciones Registradas ({addresses.length})</Text>
        {addresses.length === 0 ? (
          <Text style={styles.emptyText}>El cliente aún no tiene direcciones registradas.</Text>
        ) : (
          addresses.map((addr: any, idx: number) => (
            <View key={addr.placeId || idx} style={styles.addressBox}>
              <Ionicons name="location-outline" size={18} color="#E31E24" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressDesc}>{addr.description}</Text>
                {addr.additionalInfo ? (
                  <Text style={styles.addressNotes}>Ref: {addr.additionalInfo}</Text>
                ) : null}
              </View>
            </View>
          ))
        )}

        {/* Modal de Asignación */}
        <AssignSellerModal
          visible={showSellerModal}
          onClose={() => setShowSellerModal(false)}
          clientId={user.uid || user.id}
          currentSellerId={user.sellerId}
          onSuccess={() => onRefresh && onRefresh()}
        />
      </View>
    );
  }

  if (user?.userType === "seller") {
    const sellerCode =
      user?.sellerCode || (user?.uid ? `VEND-${user.uid.slice(0, 5).toUpperCase()}` : "VEND-XXXX");
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Información de Vendedor</Text>
        <View style={styles.badgeRow}>
          <Text style={styles.label}>Código Comercial:</Text>
          <View style={[styles.codeBadge, { backgroundColor: "#E0F2FE", borderColor: "#BAE6FD" }]}>
            <Text style={[styles.codeText, { color: "#0369A1" }]}>{sellerCode}</Text>
          </View>
        </View>
        <View style={[styles.adminBox, { backgroundColor: "#F0F9FF", borderColor: "#BAE6FD", marginTop: 12 }]}>
          <Ionicons name="pricetag" size={20} color="#0284C7" />
          <Text style={[styles.adminText, { color: "#0369A1" }]}>
            Cuenta comercial con permisos para gestión de cartera de clientes y ventas asistidas.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Privilegios Administrativos</Text>
      <View style={styles.adminBox}>
        <Ionicons name="shield-checkmark" size={20} color="#16A34A" />
        <Text style={styles.adminText}>
          Este usuario cuenta con permisos de administrador en Suplicem.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F294A",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: "#64748B",
  },
  codeBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  codeText: {
    color: "#E31E24",
    fontWeight: "700",
    fontSize: 12,
  },
  vehicleBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vehicleText: {
    fontSize: 13,
    color: "#334155",
  },
  addressBox: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  addressDesc: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  addressNotes: {
    fontSize: 12,
    color: "#A04A0E",
    marginTop: 2,
  },
  adminBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 8,
  },
  adminText: {
    fontSize: 13,
    color: "#166534",
    fontWeight: "500",
    flex: 1,
  },
  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
    fontStyle: "italic",
  },
});
