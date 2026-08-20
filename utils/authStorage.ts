import * as SecureStore from "expo-secure-store";

export async function saveAuthSession(data: {
  token: string;
  refreshToken: string;
  expiresAt: number;
}) {
  await SecureStore.setItemAsync("auth", JSON.stringify(data));
}

export async function getAuthSession() {
  const value = await SecureStore.getItemAsync("auth");
  return value ? JSON.parse(value) : null;
}

export async function clearAuthSession() {
  await SecureStore.deleteItemAsync("auth");
}
