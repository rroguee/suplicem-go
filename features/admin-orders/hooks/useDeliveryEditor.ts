import { useState } from "react";
import { useAlert } from "@/context/alertContext";
import { useLoading } from "@/context/loadingContext";
import { updateOrderDeliveries } from "@/services/orderService";
import { updateUserAddresses } from "@/services/userService";
import { Address, User } from "@/types/users";
import { Order, DeliveryDetail as OrderDelivery } from "@/types/orders";
import { useNewDeliveryAddress } from "./useNewDeliveryAddress";

const generateTempDeliveryId = () => Math.random().toString(36).substring(2, 9);

export const useDeliveryEditor = (
  order: Order | null | undefined,
  users: User[],
  onOrderUpdated: (updated: Partial<Order>) => void,
  onFreshOrderSet: (order: Order) => void
) => {
  const { show, hide } = useLoading();
  const { showAlert } = useAlert();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedDeliveryType, setEditedDeliveryType] = useState("");
  const [editedDeliveries, setEditedDeliveries] = useState<OrderDelivery[]>([]);

  // Sub-hook especializado en nueva dirección
  const {
    isAddingNewAddress,
    setIsAddingNewAddress,
    newAddressData,
    setNewAddressData,
    handleAddNewAddress,
    documentTypeOptions,
  } = useNewDeliveryAddress(
    (createdAddress) => {
      const targetUserUid = order?.userId || "";
      const newAddress: Address = {
        ...createdAddress,
        userUid: targetUserUid,
      };

      if (createdAddress.saveToProfile !== false && targetUserUid) {
        const clientUser = users.find((u) => u.uid === targetUserUid);
        const existingClientAddrs = clientUser?.addresses || order?.clientAddresses || [];
        const addrExists = existingClientAddrs.some((a) => a.placeId === newAddress.placeId);
        const updatedClientAddrs = addrExists ? existingClientAddrs : [...existingClientAddrs, newAddress];
        updateUserAddresses(targetUserUid, updatedClientAddrs).catch((err) => {
          console.error("Error al guardar dirección en el perfil del cliente:", err);
        });
      }

      setEditedDeliveries((prev) => {
        if (prev.length === 0) {
          const defaultProduct = order?.items?.[0];
          return [
            {
              id: generateTempDeliveryId(),
              productId: defaultProduct?.productId || "",
              quantity: defaultProduct?.quantity || 0,
              unit: defaultProduct?.unit || "fundas",
              address: newAddress,
              availableAddresses: [newAddress],
            },
          ];
        }

        return prev.map((del) => {
          const currentAvailable = del.availableAddresses || [];
          const exists = currentAvailable.some(
            (addr) => addr.placeId === newAddress.placeId
          );
          const updatedAddresses = exists
            ? currentAvailable
            : [newAddress, ...currentAvailable];

          return {
            ...del,
            address: newAddress,
            availableAddresses: updatedAddresses,
          };
        });
      });
    },
    {
      recipientName: `${order?.userNames || ""} ${order?.userLastNames || ""}`.trim(),
      recipientDocument: (order as any)?.userDocument || "",
      recipientDocumentType: (order as any)?.identificationType || "Cédula",
      userUid: order?.userId || "",
    }
  );

  const handleEdit = () => {
    if (!order) {
      showAlert({
        message: "No se pudo encontrar la orden.",
        type: "error",
      });
      return;
    }
    setIsEditing(true);
    setEditedDeliveryType(order.deliveryType || "");

    const clientSavedAddresses =
      order.clientAddresses || order.userAddresses || [];

    const newEditedDeliveries = (order.deliveries || []).map((delivery) => {
      const deliveryUserUid = delivery.address?.userUid || order.userId;
      const userForThisDelivery = users.find((u) => u.uid === deliveryUserUid);
      let availableAddresses: Address[] = [
        ...(userForThisDelivery?.addresses || clientSavedAddresses),
      ];

      let addressWithUserUid: Address = delivery.address || {
        placeId: "",
        description: "",
        latitude: 0,
        longitude: 0,
      };

      if (delivery.address?.placeId) {
        const addressExists = availableAddresses.some(
          (addr) => addr.placeId === delivery.address?.placeId
        );
        if (!addressExists) {
          availableAddresses = [delivery.address, ...availableAddresses];
        }
      }

      addressWithUserUid = {
        ...addressWithUserUid,
        userUid: deliveryUserUid,
      };

      return {
        ...delivery,
        address: addressWithUserUid,
        availableAddresses,
      };
    });

    setEditedDeliveries(newEditedDeliveries);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedDeliveryType(order?.deliveryType || "");
    if (order) {
      const clientSavedAddresses =
        order.clientAddresses || (order as any).userAddresses || [];
      const original = (order.deliveries || []).map((delivery) => {
        const deliveryUserUid = delivery.address?.userUid || order.userId;
        const userForThisDelivery = users.find((u) => u.uid === deliveryUserUid);
        let availableAddresses: Address[] = [
          ...(userForThisDelivery?.addresses || clientSavedAddresses),
        ];
        let addressWithUserUid: Address = delivery.address || {
          placeId: "",
          description: "",
          latitude: 0,
          longitude: 0,
        };
        if (delivery.address?.placeId) {
          const addressExists = availableAddresses.some(
            (addr) => addr.placeId === delivery.address?.placeId
          );
          if (!addressExists) {
            availableAddresses = [delivery.address, ...availableAddresses];
          }
        }
        addressWithUserUid = {
          ...addressWithUserUid,
          userUid: deliveryUserUid,
        };
        return {
          ...delivery,
          address: addressWithUserUid,
          availableAddresses,
        };
      });
      setEditedDeliveries(original);
    }
  };

  const handleSave = async (options?: { silent?: boolean }): Promise<boolean> => {
    const hasEmptyProduct = editedDeliveries.some(
      (delivery) => !delivery.productId || delivery.productId.length === 0
    );

    if (hasEmptyProduct) {
      showAlert({
        message: "Por favor, selecciona un producto para todas las entregas antes de guardar.",
        type: "error",
      });
      return false;
    }

    if (!order?.id || isSaving) return false;

    show();
    setIsSaving(true);

    try {
      const cleanDeliveries = editedDeliveries.map(
        ({ availableAddresses, ...rest }: any) => rest
      );

      const response = await updateOrderDeliveries(
        order.id,
        editedDeliveryType,
        cleanDeliveries
      );

      if (response?.success) {
        onOrderUpdated({
          deliveryType: editedDeliveryType,
          deliveries: cleanDeliveries,
        });

        if (response.order) {
          onFreshOrderSet(response.order);
        }

        if (!options?.silent) {
          showAlert({
            message: response.message || "Cambios guardados correctamente.",
            type: "success",
          });
        }

        setIsEditing(false);
        return true;
      } else {
        showAlert({
          message: response?.message || "Ocurrió un error al guardar los cambios.",
          type: "error",
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error al guardar entregas en el servidor:", error);
      showAlert({
        message: error.message || "Ocurrió un error al guardar los cambios.",
        type: "error",
      });
      return false;
    } finally {
      setIsSaving(false);
      hide();
    }
  };

  const updateDelivery = (id: string, values: Partial<OrderDelivery>) => {
    setEditedDeliveries((prev) =>
      prev.map((del) => (del.id === id ? { ...del, ...values } : del))
    );
  };

  const handleUserSelection = (userId: string, deliveryId: string) => {
    const selectedUser = users.find((user) => user.uid === userId);
    if (!selectedUser) return;

    setEditedDeliveries((prev) =>
      prev.map((del) => {
        if (del.id !== deliveryId) return del;

        const updatedAddresses = selectedUser.addresses || [];
        const firstAddress = updatedAddresses[0] || {
          placeId: "",
          description: "",
          latitude: 0,
          longitude: 0,
          additionalInfo: "",
          recipientName: `${selectedUser.names} ${selectedUser.lastNames}`,
          recipientDocument: selectedUser.identification || "",
          recipientDocumentType: selectedUser.identificationType || "Cédula",
          userUid: selectedUser.uid,
        };

        return {
          ...del,
          address: {
            ...firstAddress,
            userUid: selectedUser.uid,
          },
          availableAddresses: updatedAddresses,
        };
      })
    );
  };

  const productOptions =
    order?.items.map((item) => ({
      label: `${item.name}`,
      value: item.productId,
    })) || [];

  return {
    isEditing,
    isSaving,
    editedDeliveryType,
    setEditedDeliveryType,
    editedDeliveries,
    setEditedDeliveries,
    handleEdit,
    handleSave,
    handleCancel,
    updateDelivery,
    handleUserSelection,
    isAddingNewAddress,
    setIsAddingNewAddress,
    newAddressData,
    setNewAddressData,
    handleAddNewAddress,
    productOptions,
    documentTypeOptions,
  };
};
