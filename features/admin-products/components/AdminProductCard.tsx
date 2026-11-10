import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatRD } from "@/utils/currencyUtils";
import { AdminProduct } from "../hooks/useAdminProducts";

type AdminProductCardProps = {
  product: AdminProduct;
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
};

export const AdminProductCard: React.FC<AdminProductCardProps> = ({
  product,
  onEdit,
  onDelete,
}) => {
  const isCement =
    product.unit === "fundas" || product.name.toLowerCase().includes("cemento");
  const lotSize = product.lotSize || 500;
  const lotPrice = product.lotPrice || product.price * lotSize;

  return (
    <View style={styles.productCard}>
      {product.imageUrl ? (
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.productImage}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Ionicons name="cube-sharp" size={40} color="#94A3B8" />
        </View>
      )}

      <View style={styles.productContent}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPriceText}>
          Precio unitario:{" "}
          <Text style={styles.productPriceHighlight}>
            {formatRD(product.price)}
          </Text>{" "}
          / {product.unit || "funda"}
        </Text>
        {isCement && (
          <Text style={styles.lotPriceText}>
            Precio Lote ({lotSize} fundas):{" "}
            <Text style={styles.lotPriceHighlight}>{formatRD(lotPrice)}</Text>
          </Text>
        )}
      </View>

      <View style={styles.cardActionsRow}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => onEdit(product)}
        >
          <Ionicons name="create-outline" size={18} color="#0F294A" />
          <Text style={styles.editBtnText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(product)}
        >
          <Ionicons name="trash-outline" size={18} color="#E31E24" />
          <Text style={styles.deleteBtnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 140,
    marginBottom: 10,
    alignSelf: "center",
  },
  productImagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  productContent: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 4,
  },
  productPriceText: {
    fontSize: 14,
    color: "#64748B",
  },
  productPriceHighlight: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E31E24",
  },
  lotPriceText: {
    fontSize: 14,
    color: "#475569",
    marginTop: 4,
  },
  lotPriceHighlight: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F294A",
  },
  cardActionsRow: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#0F294A",
    borderRadius: 8,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: "#F8FAFC",
  },
  editBtnText: {
    color: "#0F294A",
    fontWeight: "bold",
    fontSize: 14,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: "#FEF2F2",
  },
  deleteBtnText: {
    color: "#E31E24",
    fontWeight: "bold",
    fontSize: 14,
  },
});
