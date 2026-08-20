import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { useAlert } from "./alertContext";

export type Product = {
  id: string;
  name: string;
  price: number;
  ton?: number;
  fundas?: number;
};

type DeliveryType = "almacen" | "domicilio" | string;

type CartState = {
  cart: Product[];
  deliveryType: DeliveryType;
  updateDeliveryType: (type: DeliveryType) => void;
  updateProductInCart: (productId: string, changes: Partial<Product>) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
};

const cartStorageKey = "cart-key";

export const CartContext = createContext<CartState>({
  cart: [],
  deliveryType: "almacen",
  updateDeliveryType: () => {},
  updateProductInCart: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

export const CartProvider = ({ children }: PropsWithChildren) => {
  const [cart, setCart] = useState<Product[]>([]);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("almacen");


  const { showAlert } = useAlert();

  useEffect(() => {
    const loadCart = async () => {
      try {
        const value = await AsyncStorage.getItem(cartStorageKey);
        if (value) {
          const parsed = JSON.parse(value);
          setCart(parsed.cart || []);
          setDeliveryType(parsed.deliveryType || "almacen");
        }
      } catch (error) {
        console.error("❌ Error cargando el carrito:", error);
      }
    };
    loadCart();
  }, []);

  const saveCart = async (
    updatedCart: Product[],
    updatedType: DeliveryType
  ) => {
    try {
      await AsyncStorage.setItem(
        cartStorageKey,
        JSON.stringify({ cart: updatedCart, deliveryType: updatedType })
      );
    } catch (error) {
      console.error("❌ Error guardando el carrito:", error);
    }
  };

  const addToCart = (product: Product): boolean => {
    const exists = cart.some((item) => item.id === product.id);
    if (exists) {
      showAlert({
        message: "Este producto ya está agregado al carrito.",
        type: "warning",
      });
      return false;
    }

    const updatedCart = [...cart, product];
    setCart(updatedCart);
    saveCart(updatedCart, deliveryType);

    showAlert({
      message: `Se agregó ${product.name} al carrito.`,
      type: "success",
    });

    return true;
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    saveCart(updatedCart, deliveryType);
  };

  const clearCart = () => {
    setCart([]);
    setDeliveryType("almacen");
    AsyncStorage.removeItem(cartStorageKey);
  };

  const updateProductInCart = (
    productId: string,
    changes: Partial<Product>
  ) => {
    const updatedCart = cart.map((product) =>
      product.id === productId ? { ...product, ...changes } : product
    );
    setCart(updatedCart);
    saveCart(updatedCart, deliveryType);
  };

  const updateDeliveryType = (type: DeliveryType) => {
    setDeliveryType(type);
    saveCart(cart, type);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        deliveryType,
        updateDeliveryType,
        updateProductInCart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
