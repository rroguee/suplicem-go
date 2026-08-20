import CheckRender from "@/components/CheckRender";
import ConfirmationModal from "@/components/ConfirmationModal";
import { ROLE } from "@/constants/UserConstants";
import { useAlert } from "@/context/alertContext";
import { AuthContext } from "@/context/authContext";
import { useLoading } from "@/context/loadingContext";
import { updateDriverProfile } from "@/services/userService";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";


type InfoRowProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => (
  <View style={styles.infoRow}>
    {icon && <View style={styles.iconWrapper}>{icon}</View>}
    <View style={styles.infoTextWrapper}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

type InputRowProps = {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
};

const InputRow: React.FC<InputRowProps> = ({
  label,
  value,
  onChange,
  placeholder,
  icon,
}) => (
  <View style={styles.infoRow}>
    {icon && <View style={styles.iconWrapper}>{icon}</View>}
    <View style={styles.infoTextWrapper}>
      <Text style={styles.infoLabel}>{label}</Text>
      <TextInput
        style={styles.inputField}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#AAA"
      />
    </View>
  </View>
);

const DriverSettingsMainScreen: React.FC = () => {
  const { user, logOut, logIn } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { show, hide } = useLoading();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);


  const [phone, setPhone] = useState(user?.phone || "");
  const [vehicleBrand, setVehicleBrand] = useState(user?.vehicle?.brand || "");
  const [vehicleModel, setVehicleModel] = useState(user?.vehicle?.model || "");


  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setVehicleBrand(user.vehicle?.brand || "");
      setVehicleModel(user.vehicle?.model || "");
    }
  }, [user]);

  const handleLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalVisible(false);
    logOut();
  };

  const handleEdit = async () => {
    if (isEditing) {
      if (!user) {
        showAlert({
          message: "No se puede guardar, el usuario no está disponible.",
          type: "error",
        });
        return;
      }
      try {
        show();

        console.log("➡️ Datos a enviar al servicio:", {
          uid: user.uid,
          phone,
          vehicleBrand,
          vehicleModel,
        });

        await updateDriverProfile(user.uid, phone, vehicleBrand, vehicleModel);

        console.log("✅ Servicio llamado con éxito.");
        const newUser = {
          ...user,
          phone: phone,
          vehicle: {
            ...(user.vehicle || {}),
            brand: vehicleBrand,
            model: vehicleModel,
            year: user.vehicle?.year || "",
            tons: user.vehicle?.tons || "",
          },
        };

        console.log("🔄 Nuevo objeto de usuario para el contexto:", newUser);

        logIn(newUser);

        showAlert({
          message: "¡Perfil actualizado con éxito!",
          type: "success",
        });
        setIsEditing(false);
      } catch (error) {
        console.error("❌ Error en la actualización del perfil:", error);
        showAlert({
          message: "No se pudo actualizar el perfil. Inténtelo de nuevo.",
          type: "error",
        });
      } finally {
        hide();
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setPhone(user.phone || "");
      setVehicleBrand(user.vehicle?.brand || "");
      setVehicleModel(user.vehicle?.model || "");
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
      </View>
    );
  }

  const fullName = `${user.names} ${user.lastNames}`;
  const avatarUri = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.role}>
          {user.userType === "client" ? "Cliente" : "Conductor"}
        </Text>
      </View>

      <View style={styles.card}>
        <InfoRow
          label="Tipo de identificación"
          value={user.identificationType}
          icon={<Feather name="credit-card" size={22} color="#E31E24" />}
        />
        <InfoRow
          label="Número de identificación"
          value={user.identification}
          icon={<Feather name="hash" size={22} color="#E31E24" />}
        />
        <InfoRow
          label="Correo electrónico"
          value={user.email}
          icon={<Feather name="mail" size={22} color="#E31E24" />}
        />

        {isEditing ? (
          <InputRow
            label="Teléfono"
            value={phone}
            onChange={setPhone}
            placeholder="Introduce el nuevo teléfono"
            icon={<Feather name="phone" size={22} color="#E31E24" />}
          />
        ) : (
          <InfoRow
            label="Teléfono"
            value={user.phone}
            icon={<Feather name="phone" size={22} color="#E31E24" />}
          />
        )}
      </View>

      <CheckRender allowed={user?.userType === ROLE.CLIENT}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Direcciones</Text>
          {user.addresses.length > 0 ? (
            user.addresses.map((address, i) => (
              <View key={i} style={styles.addressItem}>
                <Ionicons
                  name="location-sharp"
                  size={20}
                  color="#E31E24"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.addressText}>{address?.description}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay direcciones registradas</Text>
          )}
        </View>
      </CheckRender>

      <CheckRender allowed={user?.userType === ROLE.DRIVER}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Vehículo</Text>
          {user.vehicle ? (
            <>
              {isEditing ? (
                <InputRow
                  label="Marca"
                  value={vehicleBrand}
                  onChange={setVehicleBrand}
                  placeholder="Ej: Ford"
                  icon={
                    <MaterialIcons
                      name="directions-car"
                      size={22}
                      color="#E31E24"
                    />
                  }
                />
              ) : (
                <InfoRow
                  label="Marca"
                  value={user.vehicle.brand}
                  icon={
                    <MaterialIcons
                      name="directions-car"
                      size={22}
                      color="#E31E24"
                    />
                  }
                />
              )}
              {isEditing ? (
                <InputRow
                  label="Modelo"
                  value={vehicleModel}
                  onChange={setVehicleModel}
                  placeholder="Ej: F-150"
                  icon={<Feather name="tag" size={22} color="#E31E24" />}
                />
              ) : (
                <InfoRow
                  label="Modelo"
                  value={user.vehicle.model}
                  icon={<Feather name="tag" size={22} color="#E31E24" />}
                />
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>No registrado</Text>
          )}
        </View>
      </CheckRender>

      {isEditing && (
        <TouchableOpacity
          style={[styles.editButton, styles.cancelButton]}
          onPress={handleCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.editText}>Cancelar</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.editButton}
        onPress={handleEdit}
        activeOpacity={0.8}
      >
        <Text style={styles.editText}>{isEditing ? "Guardar" : "Editar"}</Text>
      </TouchableOpacity>

      {!isEditing && (
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      )}

      <ConfirmationModal
        visible={isLogoutModalVisible}
        title="Cerrar sesión"
        message="¿Estás seguro que deseas cerrar sesión?"
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutModalVisible(false)}
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
      />
    </ScrollView>
  );
};

export default DriverSettingsMainScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60,
    backgroundColor: "#FAFAFA",
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#AAA",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#E31E24",
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F294A",
  },
  role: {
    fontSize: 16,
    color: "#E31E24",
    marginTop: 4,
    fontStyle: "italic",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 18,
    width: "100%",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  iconWrapper: {
    marginRight: 14,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E31E24",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 16,
    color: "#0F294A",
  },
  inputField: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E31E24",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F294A",
    marginBottom: 12,
    borderBottomColor: "#E31E24",
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  addressItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  emptyText: {
    fontStyle: "italic",
    color: "#AAA",
    fontSize: 15,
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: "#E31E24",
    paddingVertical: 14,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  logoutText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 18,
  },
  editButton: {
    marginTop: 20,
    backgroundColor: "#0F294A",
    paddingVertical: 14,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    shadowColor: "#0F294A",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 7,
  },
  editText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 18,
  },
  cancelButton: {
    backgroundColor: "#E31E24",
  },
});
