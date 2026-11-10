export type VehicleData = {
  brand: string;
  model: string;
  year: string;
  tons: string;
  plateNumber?: string;
};

export interface Address {
  id?: string;
  placeId?: string;
  description: string;
  latitude: number;
  longitude: number;
  additionalInfo?: string;
  recipientName?: string;
  recipientDocument?: string;
  recipientDocumentType?: string;
  userUid?: string; 
}

export type User = {
  uid?: string;
  identificationType: "Cedula" | "Pasaporte" | string;
  identification: string;
  email: string;
  names: string;
  lastNames: string;
  phone: string;
  userType: "client" | "driver" | "admin" | "seller";
  personType?: "fisica" | "juridica";
  companyRnc?: string;
  companyName?: string;
  driverCode?: string;
  sellerCode?: string;
  sellerId?: string;
  sellerName?: string;
  sellerPhone?: string;
  addresses?: Address[];
  vehicle?: VehicleData;
  status?: string;
  aiRiskFlag?: boolean;
  aiRiskScore?: number;
  aiRiskReason?: string;
};

export interface RegisterFormData extends User {
  password: string;
  confirmPassword: string;
}
