
export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message?: string;
  data?: T;
}

export async function safeRequest<T = any>(
  request: () => Promise<any>
): Promise<ApiResponse<T>> {
  try {
    const response = await request();
    return {
      success: true,
      status: response.status,
      data: response.data,
    };
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || "Error inesperado del servidor";

    return {
      success: false,
      status,
      message,
      data: error.response?.data,
    };
  }
}
