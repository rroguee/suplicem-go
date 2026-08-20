import protectedApi from "./protectedApi";

export const createProduct = async (product: {
  name: string;
  price: number;
  unit: string;
  imageUrl?: string;
}) => {
  const response = await protectedApi.post("/products", product);
  return response.data;
};

export const getProducts = async () => {
  const response = await protectedApi.get("/products");
  return response.data;
};
