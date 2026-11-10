import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { deleteProduct, getProducts } from "@/services/productService";

export type AdminProduct = {
  id: string;
  name: string;
  price: number;
  lotSize?: number;
  lotPrice?: number;
  lotPrices?: Record<string, number>;
  imageUrl: string;
  unit: string;
  weightKg?: number;
  createdAt?: string;
};

export const useAdminProducts = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState("");

  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  const fetchProductList = useCallback(async () => {
    try {
      show();
      const productsResponse = await getProducts();
      setProducts(productsResponse?.products || []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      showAlert({
        message: "No se pudieron obtener los productos.",
        type: "error",
      });
    } finally {
      hide();
    }
  }, [show, hide, showAlert]);

  useFocusEffect(
    useCallback(() => {
      fetchProductList();
    }, [fetchProductList])
  );

  const handleDeleteProduct = (product: AdminProduct) => {
    Alert.alert(
      "Eliminar producto",
      `¿Estás seguro de que deseas eliminar "${product.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              show();
              await deleteProduct(product.id);
              showAlert({
                message: "Producto eliminado correctamente.",
                type: "success",
              });
              fetchProductList();
            } catch (error) {
              console.error("Error al eliminar producto:", error);
              showAlert({
                message: "No se pudo eliminar el producto.",
                type: "error",
              });
            } finally {
              hide();
            }
          },
        },
      ]
    );
  };

  const filteredProducts = products.filter((p) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      p.name.toLowerCase().includes(term) ||
      p.price.toString().includes(term)
    );
  });

  return {
    products,
    filteredProducts,
    search,
    setSearch,
    handleDeleteProduct,
    fetchProductList,
  };
};
