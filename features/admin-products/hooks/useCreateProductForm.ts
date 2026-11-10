import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useLoading } from "@/context/loadingContext";
import { createProduct, updateProduct, getProducts } from "@/services/productService";
import { pickAndCompressImage } from "@/utils/imageUtils";
import { parseNumberWithCommas, formatNumberWithCommas } from "@/utils/currencyUtils";

export const useCreateProductForm = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("fundas");
  const [weightKg, setWeightKg] = useState("42.5");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [manualLotPrices, setManualLotPrices] = useState<Record<string, number>>({});

  const { show, hide } = useLoading();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      show();
      getProducts().then((res: any) => {
        hide();
        const prod = (res.products || []).find((p: any) => String(p.id) === String(id));
        if (prod) {
          setName(prod.name || "");
          setPrice(prod.price ? formatNumberWithCommas(prod.price) : "");
          setUnit(prod.unit || "fundas");
          setWeightKg(prod.weightKg !== undefined ? String(prod.weightKg) : "42.5");
          setImageUri(prod.imageUrl || null);

          const baseNum = Number(prod.price) || 0;
          const realManual: Record<string, number> = {};
          if (prod.manualLotPrices) {
            for (const [k, v] of Object.entries(prod.manualLotPrices)) {
              if (Math.abs(Number(v) - baseNum * Number(k)) > 0.01) {
                realManual[k] = Number(v);
              }
            }
          }
          setManualLotPrices(realManual);
        }
      });
    }
  }, [id]);

  const handlePickImage = async () => {
    const res = await pickAndCompressImage({ useCamera: false, maxWidth: 800, quality: 0.7 });
    if (res.success && res.uri) setImageUri(res.uri);
    else if (res.errorMessage) Alert.alert("Permiso", res.errorMessage);
  };

  const handleTakePhoto = async () => {
    const res = await pickAndCompressImage({ useCamera: true, maxWidth: 800, quality: 0.7 });
    if (res.success && res.uri) setImageUri(res.uri);
    else if (res.errorMessage) Alert.alert("Permiso", res.errorMessage);
  };

  const handleSubmit = async () => {
    const numPrice = parseNumberWithCommas(price);
    if (!name.trim() || numPrice <= 0) {
      Alert.alert("Campos requeridos", "Ingresa un nombre y precio válido.");
      return;
    }

    const payload = {
      name: name.trim(),
      price: numPrice,
      unit: unit.trim() || "fundas",
      weightKg: parseFloat(weightKg) || 42.5,
      manualLotPrices: Object.keys(manualLotPrices).length > 0 ? manualLotPrices : undefined,
      imageUri: imageUri || undefined,
    };

    try {
      show();
      let res: any;
      if (isEditing && id) {
        res = await updateProduct(id, payload as any);
      } else {
        res = await createProduct(payload as any);
      }
      hide();

      if (res && res.success === false) {
        Alert.alert("Error", res.message || "No se pudo guardar el producto.");
        return;
      }
      Alert.alert("Éxito", isEditing ? "Producto actualizado correctamente." : "Producto creado correctamente.");
      router.back();
    } catch (err: any) {
      hide();
      Alert.alert("Error", err?.message || "Ocurrió un error.");
    }
  };

  return {
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
    numericPrice: parseNumberWithCommas(price),
    handlePickImage,
    handleTakePhoto,
    handleSubmit,
    goBack: () => router.back(),
  };
};
