export type VehicleData = {
  brand: string;
  model: string;
  year: string;
  tons: string;
  plateNumber?: string;
};

export interface Address {
  placeId: string;
  description: string;
  latitude: number;
  longitude: number;
  additionalInfo?: string;
  recipientName?: string;
  recipientDocument?: string;
  recipientDocumentType?: string;
  // Agrega esta línea para que TypeScript reconozca userUid
  userUid?: string; 
}

export type User = {
  uid?: string;
  identificationType: "Cedula" | "Pasaporte";
  identification: string;
  email: string;
  names: string;
  lastNames: string;
  phone: string;
  userType: "client" | "driver";
  addresses: Address[];
  vehicle?: VehicleData;
};

export interface RegisterFormData extends User {
  password: string;
  confirmPassword: string;
}
