import React from "react";
import { ScrollView, View, Image, Text, StyleSheet } from "react-native";
import { usePendingApproval } from "@/features/auth/hooks/usePendingApproval";
import { PendingApprovalCard } from "@/features/auth/components/PendingApprovalCard";

export default function PendingApprovalRoute() {
  const { userName, isRefreshing, handleCheckStatus, handleLogout } = usePendingApproval();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Image
          source={require("../assets/images/logo2.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <PendingApprovalCard
        userName={userName}
        isRefreshing={isRefreshing}
        onCheckStatus={handleCheckStatus}
        onLogout={handleLogout}
      />

      <Text style={styles.footerNote}>
        Suplicem Logística & Distribución • Sistema de Aprobación de Cuentas
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20, paddingTop: 50, paddingBottom: 40, alignItems: "center" },
  header: { marginBottom: 20, alignItems: "center" },
  logo: { width: 180, height: 70 },
  footerNote: { marginTop: 24, fontSize: 12, color: "#94A3B8", textAlign: "center" },
});
