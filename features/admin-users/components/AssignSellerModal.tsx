import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getUsers, assignSellerToClient } from "@/services/userService";
import { User } from "@/types/users";
import { SearchBar } from "@/components/common/SearchBar";
import { ActionSuccessModal } from "@/components/common/ActionSuccessModal";

interface AssignSellerModalProps {
  visible: boolean;
  onClose: () => void;
  clientId: string;
  currentSellerId?: string;
  onSuccess: () => void;
}

export const AssignSellerModal: React.FC<AssignSellerModalProps> = ({
  visible,
  onClose,
  clientId,
  currentSellerId,
  onSuccess,
}) => {
  const [sellers, setSellers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSellerId, setSelectedSellerId] = useState<string>(currentSellerId || "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedSellerId(currentSellerId || "");
      setSearch("");
      fetchSellers();
    }
  }, [visible, currentSellerId]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await getUsers({ userType: "seller" });
      if (res?.users) {
        // Orden alfabético por nombre
        const sorted = (res.users as User[]).sort((a, b) =>
          (a.names || "").localeCompare(b.names || "", "es", { sensitivity: "base" })
        );
        setSellers(sorted);
      }
    } catch (e) {
      console.error("Error al cargar vendedores:", e);
      Alert.alert("Error", "No se pudo cargar la lista de vendedores.");
    } finally {
      setLoading(false);
    }
  };

  // Filtro en tiempo real por Nombre o por Código de Vendedor
  const filteredSellers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return sellers;
    return sellers.filter((s) => {
      const fullName = `${s.names || ""} ${s.lastNames || ""}`.toLowerCase();
      const code = (s.sellerCode || "").toLowerCase();
      return fullName.includes(q) || code.includes(q);
    });
  }, [sellers, search]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await assignSellerToClient(clientId, selectedSellerId ? selectedSellerId : null);
      setShowSuccess(true);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "No se pudo asignar el vendedor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Cabecera */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Asignar Cartera de Vendedor</Text>
              <Text style={styles.subtitle}>Selecciona el vendedor asignado a este cliente</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Buscador Reutilizable */}
          <View style={styles.searchBox}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nombre o código (ej. VEND-)..."
            />
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#E31E24" />
            </View>
          ) : (
            <FlatList
              data={filteredSellers}
              keyExtractor={(item) => item.uid || item.identification}
              ListHeaderComponent={
                <TouchableOpacity
                  style={[styles.unassignedCard, !selectedSellerId && styles.selectedCard]}
                  onPress={() => setSelectedSellerId("")}
                >
                  <Ionicons name="people-outline" size={20} color={!selectedSellerId ? "#0F294A" : "#64748B"} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.unassignedText, !selectedSellerId && styles.selectedBold]}>
                      Sin Vendedor Asignado
                    </Text>
                    <Text style={styles.unassignedSub}>Cartera libre general (sin comisiones asignadas)</Text>
                  </View>
                  <Ionicons
                    name={!selectedSellerId ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={!selectedSellerId ? "#0F294A" : "#94A3B8"}
                  />
                </TouchableOpacity>
              }
              renderItem={({ item }) => {
                const isSelected = selectedSellerId === item.uid;
                const code = item.sellerCode || (item.uid ? `VEND-${item.uid.slice(0, 5).toUpperCase()}` : "VEND-XXXX");
                return (
                  <TouchableOpacity
                    style={[styles.sellerCard, isSelected && styles.selectedCard]}
                    onPress={() => setSelectedSellerId(item.uid || "")}
                  >
                    <Ionicons name="person-circle-outline" size={24} color="#0F294A" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.sellerName, isSelected && styles.selectedBold]}>
                        [{code}] {item.names} {item.lastNames}
                      </Text>
                      {item.phone ? <Text style={styles.sellerPhone}>📞 {item.phone}</Text> : null}
                    </View>
                    <Ionicons
                      name={isSelected ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={isSelected ? "#0F294A" : "#94A3B8"}
                    />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No se encontraron vendedores con ese criterio.</Text>
              }
            />
          )}

          {/* Botones de Acción */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose} disabled={saving}>
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={saving}>
              <Text style={styles.btnSaveText}>{saving ? "Guardando..." : "Guardar Asignación"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal de Confirmación de Éxito */}
      <ActionSuccessModal
        visible={showSuccess}
        title="¡Cartera Actualizada!"
        message="El cliente ha sido asignado al vendedor correctamente."
        onClose={() => {
          setShowSuccess(false);
          onSuccess();
          onClose();
        }}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  container: { backgroundColor: "#FFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%", padding: 18 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  title: { fontSize: 17, fontWeight: "700", color: "#0F294A" },
  subtitle: { fontSize: 12, color: "#64748B", marginTop: 2 },
  searchBox: { marginBottom: 12 },
  loaderContainer: { padding: 40, alignItems: "center" },
  unassignedCard: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 8 },
  unassignedText: { fontSize: 14, color: "#0F294A" },
  unassignedSub: { fontSize: 11, color: "#64748B" },
  sellerCard: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 8 },
  selectedCard: { borderColor: "#0F294A", backgroundColor: "#F0F4F8" },
  sellerName: { fontSize: 14, color: "#0F294A" },
  sellerPhone: { fontSize: 11, color: "#64748B", marginTop: 2 },
  selectedBold: { fontWeight: "700", color: "#0F294A" },
  emptyText: { textAlign: "center", color: "#94A3B8", marginVertical: 20, fontSize: 13 },
  footer: { flexDirection: "row", gap: 10, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  btnCancel: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: "#F1F5F9", alignItems: "center" },
  btnCancelText: { color: "#64748B", fontWeight: "600" },
  btnSave: { flex: 2, paddingVertical: 12, borderRadius: 10, backgroundColor: "#0F294A", alignItems: "center" },
  btnSaveText: { color: "#FFF", fontWeight: "700" },
});
