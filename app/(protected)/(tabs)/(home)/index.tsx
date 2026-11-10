import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import CheckRender from "@/components/CheckRender";
import { ROLE } from "@/constants/UserConstants";
import { AuthContext } from "@/context/authContext";
import { CartContext } from "@/context/cartContext";
import { useContext } from "react";
import AdminHomeScreen from "./(admin)";
import ClientHomeScreen from "./(client)";
import DriverHomeScreen from "./(driver)";
import { SellerOrdersScreen } from "@/features/seller/screens/SellerOrdersScreen";

const HomeScreen: React.FC = () => {
  const authContext = useContext(AuthContext);
  const { assistedClient, setAssistedClient } = useContext(CartContext);

  return (
    <View style={styles.container}>
      <CheckRender allowed={authContext?.user?.userType === ROLE.ADMIN}>
        <AdminHomeScreen />
      </CheckRender>

      <CheckRender allowed={authContext?.user?.userType === ROLE.CLIENT}>
        <ClientHomeScreen />
      </CheckRender>

      <CheckRender allowed={authContext?.user?.userType === ROLE.DRIVER}>
        <DriverHomeScreen />
      </CheckRender>

      <CheckRender allowed={authContext?.user?.userType === ROLE.SELLER && !assistedClient}>
        <SellerOrdersScreen />
      </CheckRender>

      <CheckRender allowed={authContext?.user?.userType === ROLE.SELLER && Boolean(assistedClient)}>
        <View style={styles.assistedTopBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.assistedTopTitle}>Venta Asistida en Curso</Text>
            <Text style={styles.assistedTopSubtitle} numberOfLines={1}>
              Cliente: {assistedClient?.names} {assistedClient?.lastNames || ""}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.assistedExitBtn}
            onPress={() => setAssistedClient(null)}
          >
            <Text style={styles.assistedExitBtnText}>Salir</Text>
          </TouchableOpacity>
        </View>
        <ClientHomeScreen />
      </CheckRender>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    backgroundColor: "#fff8f3",
  },
  assistedTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#DBEAFE",
    borderWidth: 1,
    borderColor: "#93C5FD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  assistedTopTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1E40AF",
    textTransform: "uppercase",
  },
  assistedTopSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E3A8A",
    marginTop: 1,
  },
  assistedExitBtn: {
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  assistedExitBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});
