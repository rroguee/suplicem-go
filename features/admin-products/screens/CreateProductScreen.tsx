import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCreateProductForm } from "../hooks/useCreateProductForm";
import { ProductGeneralInfoCard } from "../components/ProductGeneralInfoCard";
import { ProductImagePickerCard } from "../components/ProductImagePickerCard";
import { MobileLotPricingSection } from "../components/MobileLotPricingSection";

export const CreateProductScreen: React.FC = () => {
  const {
    isEditing,
    name,
    setName,
    price,
    setPrice,
    unit,
    setUnit,
    weightKg,
    setWeightKg,
    imageUri,
    manualLotPrices,
    setManualLotPrices,
    numericPrice,
    handlePickImage,
    handleTakePhoto,
    handleSubmit,
    goBack,
  } = useCreateProductForm();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
          <Ionicons name="arrow-back" size={20} color="#0F294A" />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? "Editar Producto" : "Crear Producto"}</Text>
      </View>

      <ProductGeneralInfoCard
        name={name}
        onChangeName={setName}
        price={price}
        onChangePrice={setPrice}
        unit={unit}
        onChangeUnit={setUnit}
        weightKg={weightKg}
        onChangeWeightKg={setWeightKg}
      />

      <MobileLotPricingSection
        basePrice={numericPrice}
        manualLotPrices={manualLotPrices}
        onUpdateManualLotPrices={setManualLotPrices}
      />

      <ProductImagePickerCard
        imageUri={imageUri}
        onPickGallery={handlePickImage}
        onTakePhoto={handleTakePhoto}
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>{isEditing ? "Actualizar Producto" : "Guardar Producto"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={goBack}>
        <Text style={styles.cancelBtnText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#F8FAFC", flexGrow: 1, paddingBottom: 50 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16, marginTop: 6, gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold", color: "#0F294A" },
  submitBtn: { backgroundColor: "#F97316", height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 10, marginTop: 6, elevation: 2 },
  submitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  cancelBtn: { height: 44, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#CBD5E1", alignItems: "center", justifyContent: "center" },
  cancelBtnText: { color: "#64748B", fontWeight: "600", fontSize: 14 },
});
