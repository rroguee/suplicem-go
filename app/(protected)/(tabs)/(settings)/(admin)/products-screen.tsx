import { useLoading } from "@/context/loadingContext";
import { useMountEffect } from "@/hooks/lifeCicle";
import { getProducts } from "@/services/productService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  unit: string;
  createdAt?: string;
};

const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const { show, hide } = useLoading();
  const router = useRouter();

  useMountEffect(async () => {
    show();
    const productsResponse = await getProducts();
    hide();
    setProducts(productsResponse?.products || []);
  });

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.price.toString().includes(search)
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Gestión de productos</Text>
        <TouchableOpacity onPress={() => router.push("/create-product")}>
          <Ionicons name="add-circle" size={32} color="#E31E24" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre o precio..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
      />

      {filteredProducts.map((product) => (
        <View key={product.id} style={styles.productCard}>
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            resizeMode="contain"
          />

          <Text style={styles.productName}>{product.name}</Text>
          <Text>Precio: RD$ {product.price}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default ProductsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#ffffff",
    flexGrow: 1,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  productCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  productImage: {
    width: "100%", // ocupa todo el ancho del card disponible
    height: 140, // igual que en ClientHomeScreen
    marginBottom: 8,
    alignSelf: "center",
    resizeMode: "contain", // asegúrate de que sea 'contain'
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
});
