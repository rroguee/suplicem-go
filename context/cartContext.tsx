import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { useAlert } from "./alertContext";
import { AuthContext } from "./authContext";
import { User } from "@/types/users";

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
  setCartItems: (items: Product[], type?: DeliveryType) => void;
  assistedClient: User | null;
  setAssistedClient: (client: User | null) => void;
};

const getCartStorageKey = (uid?: string) => (uid ? `cart-key-${uid}` : "cart-key-guest");

export const CartContext = createContext<CartState>({
  cart: [],
  deliveryType: "domicilio",
  updateDeliveryType: () => {},
  updateProductInCart: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  setCartItems: () => {},
  assistedClient: null,
  setAssistedClient: () => {},
});

export const CartProvider = ({ children }: PropsWithChildren) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState<Product[]>([]);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("domicilio");
  const [assistedClient, setAssistedClient] = useState<User | null>(null);

  const { showAlert } = useAlert();

  useEffect(() => {
    const loadCart = async () => {
      try {
        const key = getCartStorageKey(user?.uid);
        const value = await AsyncStorage.getItem(key);
        if (value) {
          const parsed = JSON.parse(value);
          setCart(parsed.cart || []);
          setDeliveryType(parsed.deliveryType || "almacen");
        } else {
          setCart([]);
          setDeliveryType("almacen");
        }
      } catch (error) {
        console.error("❌ Error cargando el carrito:", error);
        setCart([]);
      }
    };
    loadCart();
  }, [user?.uid]);

  const saveCart = async (
    updatedCart: Product[],
    updatedType: DeliveryType
  ) => {
    try {

      const key = getCartStorageKey(user?.uid);
      await AsyncStorage.setItem(
        key,
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
    const key = getCartStorageKey(user?.uid);
    AsyncStorage.removeItem(key);
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

  const setCartItems = (items: Product[], newType?: DeliveryType) => {
    const finalType = newType || deliveryType;
    setCart(items);
    if (newType) setDeliveryType(newType);
    saveCart(items, finalType);
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
        setCartItems,
        assistedClient,
        setAssistedClient,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
