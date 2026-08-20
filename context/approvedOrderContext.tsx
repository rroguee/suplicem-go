import React, { createContext, useContext, useState } from "react";

type ApprovedOrder = {
  trackingEnabled: any;
  id: string;
  orderNumber: string;
  userNames: string;
  userLastNames: string;
  userId: string;
  deliveryType: string;
  deliveries: any[];
  items: any[];
  comments: string;
  status: string;
  createdAt: string;
};

type ApprovedOrdersContextType = {
  approvedOrders: ApprovedOrder[];
  setApprovedOrders: React.Dispatch<React.SetStateAction<ApprovedOrder[]>>;
  selectedApprovedOrder: ApprovedOrder | null;
  setSelectedApprovedOrder: React.Dispatch<React.SetStateAction<ApprovedOrder | null>>;
};

const ApprovedOrdersContext = createContext<ApprovedOrdersContextType | undefined>(undefined);

export const ApprovedOrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [approvedOrders, setApprovedOrders] = useState<ApprovedOrder[]>([]);
  const [selectedApprovedOrder, setSelectedApprovedOrder] = useState<ApprovedOrder | null>(null);

  return (
    <ApprovedOrdersContext.Provider
      value={{
        approvedOrders,
        setApprovedOrders,
        selectedApprovedOrder,
        setSelectedApprovedOrder,
      }}
    >
      {children}
    </ApprovedOrdersContext.Provider>
  );
};

export const useApprovedOrders = () => {
  const context = useContext(ApprovedOrdersContext);
  if (!context) throw new Error("useApprovedOrders must be used inside ApprovedOrdersProvider");
  return context;
};
