import { StyleSheet, View } from "react-native";

import CheckRender from "@/components/CheckRender";
import { ROLE } from "@/constants/UserConstants";
import { AuthContext } from "@/context/authContext";
import { useContext } from "react";
import AdminSettingsMainScreen from "./(admin)";
import ClientSettingsMainScreen from "./(client)";
import DriverSettingsMainScreen from "./(driver)";

const SettingsScreen: React.FC = () => {
  const authContext = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <CheckRender allowed={authContext?.user?.userType === ROLE.ADMIN}>
        <AdminSettingsMainScreen />
      </CheckRender>

      <CheckRender allowed={authContext?.user?.userType === ROLE.CLIENT}>
        <ClientSettingsMainScreen />
      </CheckRender>

      <CheckRender allowed={authContext?.user?.userType === ROLE.DRIVER}>
        <DriverSettingsMainScreen />
      </CheckRender>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    backgroundColor: "#FAFAFA",
  },
  searchInput: {
    height: 45,
    backgroundColor: "#ffffff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  list: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderColor: "#eee",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    marginBottom: 8,
    alignSelf: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  price: {
    textAlign: "center",
    color: "#555",
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: "#0F294A", // Azul Marino Suplicem
    paddingVertical: 10,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  orderButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#E31E24", // Rojo Suplicem
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
