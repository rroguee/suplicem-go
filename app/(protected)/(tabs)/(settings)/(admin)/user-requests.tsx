import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { activeOrInactiveUser, getUsers } from "@/services/userService";
import { User } from "@/types/users";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const UserRequestsScreen: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [aiAlertUsers, setAiAlertUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "ai_alerts">("pending");
  const [selectedIdImage, setSelectedIdImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  const fetchUsers = useCallback(async () => {
    try {
      setRefreshing(true);
      const [pendingRes, aiRes] = await Promise.all([
        getUsers({ status: "pending" }),
        getUsers({ aiRiskFlag: true }),
      ]);

      if (pendingRes?.success && pendingRes.users) {
        setPendingUsers(pendingRes.users);
      }
      if (aiRes?.success && aiRes.users) {
        setAiAlertUsers(aiRes.users);
      }
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
      showAlert({
        message: "Error al obtener solicitudes de registro",
        type: "error",
      });
    } finally {
      setRefreshing(false);
    }
  }, [showAlert]);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  const handleUpdateStatus = async (uid: string, status: string) => {
    try {
      show();
      const res = await activeOrInactiveUser(uid, status);
      if (res?.message) {
        showAlert({
          message: `Estado actualizado a "${status === "active" ? "Aprobado" : "Rechazado"}"`,
          type: status === "active" ? "success" : "info",
        });
        setPendingUsers((prev) => prev.filter((u) => u.uid !== uid));
        setAiAlertUsers((prev) =>
          prev.map((u) => (u.uid === uid ? { ...u, status } : u))
        );
      }
    } catch (error) {
      console.error(error);
      showAlert({
        message: "No se pudo actualizar el estado del usuario",
        type: "error",
      });
    } finally {
      hide();
    }
  };

  const currentList = activeTab === "pending" ? pendingUsers : aiAlertUsers;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={fetchUsers}
          colors={["#E31E24"]}
          tintColor="#E31E24"
        />
      }
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Solicitudes de Registro</Text>
        <TouchableOpacity onPress={fetchUsers} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#0F294A" />
        </TouchableOpacity>
      </View>

      {/* Selector de pestañas */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "pending" && styles.tabButtonActive]}
          onPress={() => setActiveTab("pending")}
        >
          <Text style={[styles.tabText, activeTab === "pending" && styles.tabTextActive]}>
            Pendientes ({pendingUsers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "ai_alerts" && styles.tabButtonActiveAi]}
          onPress={() => setActiveTab("ai_alerts")}
        >
          <Ionicons name="warning-outline" size={16} color={activeTab === "ai_alerts" ? "#fff" : "#D32F2F"} />
          <Text style={[styles.tabText, activeTab === "ai_alerts" && styles.tabTextActive]}>
            Alertas IA ({aiAlertUsers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {currentList.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="checkmark-circle-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyText}>
            {activeTab === "pending"
              ? "No hay solicitudes pendientes de aprobación"
              : "No hay cuentas marcadas con alteración de IA por SynthID"}
          </Text>
        </View>
      ) : (
        currentList.map((user, idx) => {
          const isAiRisk = (user as any).aiRiskFlag;
          const aiReason = (user as any).aiRiskReason;

          return (
            <View key={user.uid || idx} style={[styles.card, isAiRisk && styles.cardAiRisk]}>
              {isAiRisk && (
                <View style={styles.aiAlertBanner}>
                  <Ionicons name="warning-outline" size={20} color="#991B1B" />
                  <Text style={styles.aiAlertText}>
                    Alerta de Seguridad: Contenido posiblemente alterado con inteligencia artificial{aiReason ? ` (${aiReason})` : ""}
                  </Text>
                </View>
              )}

              <View style={styles.userInfoRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>
                    👤 {user.names} {user.lastNames}
                  </Text>
                  <Text style={styles.userRole}>
                    Rol: <Text style={{ fontWeight: "bold" }}>{user.userType === "client" ? "Cliente" : user.userType === "driver" ? "Conductor" : user.userType === "seller" ? "Vendedor" : "Admin"}</Text>
                  </Text>
                  <Text style={styles.userDetailHighlight}>
                    🪪 {user.identificationType}: {user.identification}
                  </Text>
                  <Text style={styles.userDetail}>📧 Correo: {user.email}</Text>
                  <Text style={styles.userDetail}>📞 Teléfono: {user.phone}</Text>

                  {/* Direcciones registradas (si es cliente) */}
                  {user.addresses && user.addresses.length > 0 && (
                    <View style={styles.subDetailBox}>
                      <Text style={styles.subDetailTitle}>📍 Direcciones ({user.addresses.length}):</Text>
                      {user.addresses.map((addr, aIdx) => (
                        <Text key={aIdx} style={styles.subDetailText}>
                          • {addr.description} {addr.additionalInfo ? `(${addr.additionalInfo})` : ""}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Detalles del vehículo (si es conductor) */}
                  {user.vehicle && (
                    <View style={styles.subDetailBox}>
                      <Text style={styles.subDetailTitle}>🚛 Vehículo:</Text>
                      <Text style={styles.subDetailText}>
                        • {user.vehicle.brand} {user.vehicle.model} ({user.vehicle.year}) - {user.vehicle.tons} Ton
                      </Text>
                      {user.vehicle.plateNumber && (
                        <Text style={styles.subDetailText}>
                          • Placa: {user.vehicle.plateNumber}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>

              {/* Muestra de Imagen de Cédula Adjuntada por la Persona */}
              {(user as any).identificationImage ? (
                <View style={styles.idPhotoContainer}>
                  <Text style={styles.idPhotoTitle}>
                    Comprobante de Cédula Adjuntado (No. {user.identification}):
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedIdImage((user as any).identificationImage)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: (user as any).identificationImage }}
                      style={styles.idPhotoThumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.tapToViewOverlay}>
                      <Ionicons name="scan-outline" size={18} color="#fff" />
                      <Text style={styles.tapToViewText}>Ampliar foto</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (user as any).personType === "juridica" || (user as any).companyRnc ? null : (
                <View style={styles.noPhotoContainer}>
                  <Ionicons name="image-outline" size={20} color="#94A3B8" />
                  <Text style={styles.noPhotoText}>Sin foto de cédula adjunta</Text>
                </View>
              )}

              {/* Botones de Aprobación */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleUpdateStatus(user.uid!, "inactive")}
                >
                  <Text style={styles.rejectButtonText}>Rechazar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleUpdateStatus(user.uid!, "active")}
                >
                  <Text style={styles.approveButtonText}>Aprobar Cuenta</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {/* Modal Visor de Cédula a Pantalla Completa */}
      <Modal
        visible={!!selectedIdImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedIdImage(null)}
      >
        <View style={styles.modalViewerOverlay}>
          <TouchableOpacity
            style={styles.closeViewerButton}
            onPress={() => setSelectedIdImage(null)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {selectedIdImage && (
            <Image
              source={{ uri: selectedIdImage }}
              style={styles.fullViewerImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

export default UserRequestsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F294A",
  },
  refreshButton: {
    padding: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: "#0F294A",
    borderColor: "#0F294A",
  },
  tabButtonActiveAi: {
    backgroundColor: "#D32F2F",
    borderColor: "#D32F2F",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#475569",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 30,
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  cardAiRisk: {
    borderColor: "#EF4444",
    borderWidth: 1.5,
  },
  aiAlertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    padding: 10,
    borderRadius: 4,
    marginBottom: 12,
  },
  aiAlertText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#991B1B",
    flex: 1,
  },
  userInfoRow: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: "#E31E24",
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 2,
  },
  userDetailHighlight: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  subDetailBox: {
    marginTop: 8,
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
  },
  subDetailTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 4,
  },
  subDetailText: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 2,
  },
  idPhotoContainer: {
    marginTop: 8,
    marginBottom: 14,
    backgroundColor: "#F1F5F9",
    padding: 10,
    borderRadius: 6,
  },
  idPhotoTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 6,
  },
  idPhotoThumbnail: {
    width: "100%",
    height: 150,
    borderRadius: 4,
  },
  tapToViewOverlay: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(15, 41, 74, 0.8)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tapToViewText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  noPhotoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    marginBottom: 14,
  },
  noPhotoText: {
    fontSize: 13,
    color: "#64748B",
    fontStyle: "italic",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderColor: "#EF4444",
    borderWidth: 1,
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: "center",
  },
  rejectButtonText: {
    color: "#EF4444",
    fontWeight: "bold",
    fontSize: 14,
  },
  approveButton: {
    flex: 1,
    backgroundColor: "#0F294A",
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: "center",
  },
  approveButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalViewerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeViewerButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullViewerImage: {
    width: "94%",
    height: "80%",
  },
});
