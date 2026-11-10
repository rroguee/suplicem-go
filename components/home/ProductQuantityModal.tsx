import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { formatRD } from "@/utils/currencyUtils";
import { AuthContext } from "@/context/authContext";
import { CartContext } from "@/context/cartContext";
import { Product } from "./ProductCatalogCard";
import { WholesaleQuantitySelector } from "./WholesaleQuantitySelector";

import {
  TON_OPTIONS as QUANTITY_OPTIONS,
  getTonOptions,
  calculateProductSubtotal,
  getTonsPerBag,
} from "@/constants/cartConstants";
export { QUANTITY_OPTIONS };

type ProductQuantityModalProps = {
  product: Product | null;
  quantity: string;
  setQuantity: (qty: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export const ProductQuantityModal: React.FC<ProductQuantityModalProps> = ({
  product,
  quantity,
  setQuantity,
  onClose,
  onConfirm,
}) => {
  const { user } = useContext(AuthContext);
  const { assistedClient } = useContext(CartContext);
  const parsedQty = parseInt(quantity, 10);
  const currentQtyNum = isNaN(parsedQty) ? 0 : parsedQty;

  const [tabMode, setTabMode] = useState<"standard" | "wholesale">(
    currentQtyNum > 1000 ? "wholesale" : "standard"
  );

  useEffect(() => {
    if (parseInt(quantity, 10) > 1000) {
      setTabMode("wholesale");
    }
  }, [quantity]);

  if (!product) return null;

  const isWholesaleAllowed =
    user?.userType === "admin" ||
    user?.userType === "seller" ||
    Boolean(assistedClient);

  const lotSize = product.lotSize || 500;
  const lotPrice =
    product.lotPrices?.[String(currentQtyNum)] ||
    product.lotPrice ||
    product.price * lotSize;
  const subtotal = calculateProductSubtotal(
    currentQtyNum,
    product.price,
    lotSize,
    lotPrice,
    product.lotPrices
  );
  const productOptions = getTonOptions(product.name, product.weightKg, product.unit);
  const tonsPerBag = getTonsPerBag(product.name, product.weightKg);
  const isMultipleOf50 = currentQtyNum > 0 && currentQtyNum % 50 === 0;

  return (
    <Modal
      visible={product !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
            <Ionicons name="close-circle" size={24} color="#94A3B8" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Seleccionar Cantidad</Text>
          <Text style={styles.modalProductName}>{product.name}</Text>

          {isWholesaleAllowed && (
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  tabMode === "standard" && styles.tabButtonActive,
                ]}
                onPress={() => {
                  setTabMode("standard");
                  if (currentQtyNum > 1000) setQuantity("500");
                }}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    tabMode === "standard" && styles.tabButtonTextActive,
                  ]}
                >
                  Estándar (≤ 1,000)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  tabMode === "wholesale" && styles.tabButtonActive,
                ]}
                onPress={() => {
                  setTabMode("wholesale");
                  if (currentQtyNum <= 1000) setQuantity("1500");
                }}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    tabMode === "wholesale" && styles.tabButtonTextActive,
                  ]}
                >
                  Mayorista (+1,000)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {tabMode === "wholesale" && isWholesaleAllowed ? (
            <WholesaleQuantitySelector
              quantity={currentQtyNum}
              onChangeQuantity={(qty) => setQuantity(String(qty))}
              tonsPerBag={tonsPerBag}
              unit={product.unit || "fundas"}
            />
          ) : (
            <>
              <Text style={styles.optionsSectionTitle}>Cantidad / Toneladas:</Text>
              <ScrollView
                style={{ width: "100%", maxHeight: 210, marginBottom: 18 }}
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.optionsGrid}>
                  {productOptions.map((opt) => {
                    const isSelected = parseInt(quantity, 10) === opt.fundas;
                    return (
                      <TouchableOpacity
                        key={opt.fundas}
                        style={[
                          styles.fixedOptionChip,
                          isSelected && styles.fixedOptionChipSelected,
                        ]}
                        onPress={() => setQuantity(String(opt.fundas))}
                      >
                        <Text
                          style={[
                            styles.fixedOptionText,
                            isSelected && styles.fixedOptionTextSelected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </>
          )}

          <Text style={styles.subtotalText}>
            Subtotal:{" "}
            <Text style={{ color: Palette.primary, fontWeight: "bold" }}>
              {formatRD(subtotal)}
            </Text>
          </Text>

          <TouchableOpacity
            style={[
              styles.confirmAddBtn,
              !isMultipleOf50 && { opacity: 0.5 },
            ]}
            disabled={!isMultipleOf50}
            onPress={onConfirm}
          >
            <Ionicons
              name="cart-sharp"
              size={18}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.confirmAddBtnText}>Agregar al Carrito</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ProductQuantityModal;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 41, 74, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  closeModalBtn: {
    position: "absolute",
    top: 14,
    right: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Palette.primaryDark,
    marginBottom: 6,
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
    marginBottom: 2,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 3,
    width: "100%",
    marginVertical: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  tabButtonTextActive: {
    color: Palette.primaryDark,
    fontWeight: "700",
  },
  modalProductPrice: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  optionsSectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Palette.primaryDark,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    rowGap: 10,
    marginBottom: 18,
  },
  fixedOptionChip: {
    width: "48%",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  fixedOptionChipSelected: {
    backgroundColor: Palette.primaryDark,
    borderColor: Palette.primaryDark,
    shadowColor: Palette.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  fixedOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
  },
  fixedOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  subtotalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 18,
  },
  confirmAddBtn: {
    backgroundColor: Palette.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
  },
  confirmAddBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
