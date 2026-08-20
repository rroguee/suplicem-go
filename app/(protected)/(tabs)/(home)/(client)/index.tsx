import { useAlert } from "@/context/alertContext";
import { CartContext } from "@/context/cartContext";
import { useLoading } from "@/context/loadingContext";
import { useMountEffect } from "@/hooks/lifeCicle";
import { getProducts } from "@/services/productService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
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
};

const ClientHomeScreen: React.FC = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();
  const { show, hide } = useLoading();
  const { addToCart, cart } = useContext(CartContext);
  const { showAlert } = useAlert();
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
    });
  };

  const goToCart = () => {
    if (cart.length === 0) {
      showAlert({
        message: "Agrega productos antes de ir al carrito.",
        type: "warning", 
      });
      return;
    }

    router.push("/client-cart");
  };

  const totalItems = cart.length;

  useMountEffect(async () => {
    show();
    const productsResponse = await getProducts();
    hide();
    setProducts(productsResponse?.products || []);
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={styles.topLogoContainer}>
        <Image
          source={require("@/assets/images/logo2.png")}
          style={styles.topLogo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.header}>
        <TextInput
          placeholder="Buscar producto..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

        <TouchableOpacity style={styles.cartIcon} onPress={goToCart}>
          <Ionicons name="cart-outline" size={28} color="#E31E24" />
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {filteredProducts?.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>RD$ {item.price}</Text>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addButtonText}>Agregar al carrito</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ClientHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 30,
  },
  topLogoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  topLogo: {
    width: 180,
    height: 60,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 45,
    backgroundColor: "#FAFAFA",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  cartIcon: {
    marginLeft: 12,
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#E31E24",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cartBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderColor: "#eee",
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 140,
    alignSelf: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
    color: "#0F294A",
  },
  price: {
    textAlign: "center",
    color: "#E31E24",
    fontWeight: "600",
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: "#E31E24",
    paddingVertical: 10,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});
