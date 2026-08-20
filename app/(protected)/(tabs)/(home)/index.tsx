import { StyleSheet, View } from "react-native";

import CheckRender from "@/components/CheckRender";
import { ROLE } from "@/constants/UserConstants";
import { AuthContext } from "@/context/authContext";
import { useContext } from "react";
import AdminHomeScreen from "./(admin)";
import ClientHomeScreen from "./(client)";
import DriverHomeScreen from "./(driver)";

const HomeScreen: React.FC = () => {
  const authContext = useContext(AuthContext);

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
});
