import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAdminProducts } from "../hooks/useAdminProducts";
import { AdminProductCard } from "../components/AdminProductCard";

export const AdminProductsScreen: React.FC = () => {
  const router = useRouter();
  const {
    filteredProducts,
    search,
    setSearch,
    handleDeleteProduct,
  } = useAdminProducts();

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Gestión de productos</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/create-product")}
          >
            <Ionicons
              name="add-circle"
              size={24}
              color="#ffffff"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.addButtonText}>Nuevo</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o precio..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              No se encontraron productos disponibles.
            </Text>
          </View>
        ) : (
          filteredProducts.map((product) => (
            <AdminProductCard
              key={product.id}
              product={product}
              onEdit={(prod) =>
                router.push({
                  pathname: "/create-product",
                  params: { id: prod.id },
                })
              }
              onDelete={handleDeleteProduct}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#ffffff",
    flexGrow: 1,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F294A",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F97316",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    elevation: 2,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
    fontSize: 15,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    color: "#64748B",
    fontSize: 15,
  },
});
