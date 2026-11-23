import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/types/users";
import { Trip } from "@/types/trips";
import { Order } from "@/types/orders";
import { DriverSelectionModal } from "./DriverSelectionModal";
import { TripPlannerItemCard } from "./TripPlannerItemCard";
import { styles } from "../styles/orderTripPlannerModal.styles";

export interface PlannedTripItem {
  totalTons: number;
  driverId: string;
  comments?: string;
}

interface OrderTripPlannerModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order;
  totalAvailableTons: number;
  drivers: User[];
  allTrips: Trip[];
  existingOrderTrips?: Trip[];
  onConfirmPlan: (trips: PlannedTripItem[]) => void;
  isSaving?: boolean;
  title?: string;
  isSingleTripSplit?: boolean;
  initialDriverId?: string;
}

const EMPTY_TRIPS: Trip[] = [];

export const OrderTripPlannerModal: React.FC<OrderTripPlannerModalProps> = ({
  visible,
  onClose,
  order,
  totalAvailableTons,
  drivers,
  allTrips,
  existingOrderTrips = EMPTY_TRIPS,
  onConfirmPlan,
  isSaving = false,
  title,
  isSingleTripSplit = false,
  initialDriverId,
}) => {
  const isAllCement =
    (order.items || []).length > 0 &&
    (order.items || []).every(
      (item: any) =>
        item.unit === "fundas" && (item.name || "").toLowerCase().includes("cemento")
    );

  const totalBagsInOrder = (order.items || []).reduce((sum: number, item: any) => {
    const isCement = item.unit === "fundas" || !item.unit || item.name?.toLowerCase().includes("cemento");
    return sum + (isCement ? (Number(item.quantity) || 0) : 0);
  }, 0);

  const orderTotalTons = totalAvailableTons > 0 ? totalAvailableTons : (Number(order.totalTons || order.pendingBalance) || 0);
  const avgFactor = totalBagsInOrder > 0 && orderTotalTons > 0 && isAllCement ? orderTotalTons / totalBagsInOrder : 0.0425;
  const tonsToBags = (t: number) => Math.round(t / avgFactor);

  const minTrips = isSingleTripSplit ? 2 : 1;
  const maxTrips = Math.min(25, Math.max(6, Math.ceil(orderTotalTons / 15)));
  const [tripCount, setTripCount] = useState<number>(isSingleTripSplit ? 2 : (orderTotalTons > 25 ? 2 : 1));
  const [trips, setTrips] = useState<PlannedTripItem[]>([]);
  const [activeDriverPickerIndex, setActiveDriverPickerIndex] = useState<number | null>(null);

  // Inicializar o cargar los viajes existentes solo cuando se abre el modal
  useEffect(() => {
    if (!visible || orderTotalTons <= 0) return;

    if (existingOrderTrips && existingOrderTrips.length > 0 && !isSingleTripSplit) {
      setTripCount(existingOrderTrips.length);
      setTrips(
        existingOrderTrips.map((t) => ({
          totalTons: Number(t.totalTons) || Number((orderTotalTons / existingOrderTrips.length).toFixed(2)),
          driverId: t.assignedDriverId || t.driverId || "",
          comments: t.comments,
        }))
      );
    } else {
      const initialCount = isSingleTripSplit ? 2 : (orderTotalTons > 25 ? 2 : 1);
      setTripCount(initialCount);
      const tonsPerTrip = Number((orderTotalTons / initialCount).toFixed(2));
      const newTrips: PlannedTripItem[] = [];
      let allocated = 0;

      for (let i = 0; i < initialCount; i++) {
        const tons = i === initialCount - 1 ? Number((orderTotalTons - allocated).toFixed(2)) : tonsPerTrip;
        allocated += tons;
        newTrips.push({
          totalTons: tons,
          driverId: i === 0 && initialDriverId ? initialDriverId : "",
        });
      }
      setTrips(newTrips);
    }
  }, [visible]);

  const recalculateTrips = (count: number, total: number) => {
    const tonsPerTrip = Number((total / count).toFixed(2));
    const newTrips: PlannedTripItem[] = [];
    let allocated = 0;

    for (let i = 0; i < count; i++) {
      const tons = i === count - 1 ? Number((total - allocated).toFixed(2)) : tonsPerTrip;
      allocated += tons;
      const existingDriver =
        trips[i]?.driverId ||
        (i === 0 && initialDriverId ? initialDriverId : "") ||
        existingOrderTrips[i]?.assignedDriverId ||
        existingOrderTrips[i]?.driverId ||
        "";
      newTrips.push({
        totalTons: tons,
        driverId: existingDriver,
      });
    }
    setTrips(newTrips);
  };

  const handleTripCountChange = (newCount: number) => {
    if (newCount < minTrips || newCount > maxTrips) return;
    setTripCount(newCount);
    recalculateTrips(newCount, orderTotalTons);
  };

  const handleUpdateTripTons = (index: number, val: string) => {
    const num = parseFloat(val) || 0;
    setTrips((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], totalTons: num };
      return copy;
    });
  };

  const handleSelectDriverForTrip = (driverId: string) => {
    if (activeDriverPickerIndex !== null) {
      setTrips((prev) => {
        const copy = [...prev];
        copy[activeDriverPickerIndex] = {
          ...copy[activeDriverPickerIndex],
          driverId,
        };
        return copy;
      });
      setActiveDriverPickerIndex(null);
    }
  };

  const sumTons = trips.reduce((sum, t) => sum + (Number(t.totalTons) || 0), 0);
  const isDiffSignificant = Math.abs(sumTons - orderTotalTons) > 0.05;

  const handleConfirm = () => {
    if (trips.some((t) => t.totalTons <= 0)) {
      Alert.alert("Error", "Todos los viajes deben tener un tonelaje mayor a 0.");
      return;
    }
    if (isDiffSignificant) {
      Alert.alert(
        "Ajuste de Carga",
        `La suma de los viajes (${sumTons.toFixed(2)} t) no coincide con el total a transportar (${orderTotalTons.toFixed(2)} t).`
      );
      return;
    }
    onConfirmPlan(trips);
  };

  const activeTripForDriverPicker = activeDriverPickerIndex !== null ? trips[activeDriverPickerIndex] : null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{title || "Planificar y Fraccionar Viajes"}</Text>
              <Text style={styles.subtitle}>
                Total: {orderTotalTons.toFixed(2)} t{isAllCement ? ` (${tonsToBags(orderTotalTons).toLocaleString()} fundas)` : ""}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={isSaving}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Selector de número de viajes */}
          <View style={styles.countRow}>
            <Text style={styles.countLabel}>Número de viajes / camiones:</Text>
            <View style={styles.counterControl}>
              <TouchableOpacity
                style={[styles.counterBtn, tripCount <= minTrips && styles.counterBtnDisabled]}
                onPress={() => handleTripCountChange(tripCount - 1)}
                disabled={tripCount <= minTrips || isSaving}
              >
                <Ionicons name="remove" size={18} color={tripCount <= minTrips ? "#94A3B8" : "#0F294A"} />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{tripCount}</Text>
              <TouchableOpacity
                style={[styles.counterBtn, tripCount >= maxTrips && styles.counterBtnDisabled]}
                onPress={() => handleTripCountChange(tripCount + 1)}
                disabled={tripCount >= maxTrips || isSaving}
              >
                <Ionicons name="add" size={18} color={tripCount >= maxTrips ? "#94A3B8" : "#0F294A"} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista de viajes a planificar */}
          <ScrollView style={styles.tripsList} showsVerticalScrollIndicator={false}>
            {trips.map((item, idx) => (
              <TripPlannerItemCard
                key={idx}
                index={idx}
                item={item}
                isAllCement={isAllCement}
                tonsToBags={tonsToBags}
                assignedDriver={drivers.find((d) => d.uid === item.driverId)}
                onUpdateTons={handleUpdateTripTons}
                onOpenDriverPicker={setActiveDriverPickerIndex}
              />
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitBtn, isSaving && styles.btnDisabled]}
            onPress={handleConfirm}
            disabled={isSaving}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>
              {isSaving ? "Guardando viajes..." : `Confirmar Planificación (${tripCount} Viajes)`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de selección de conductor para el viaje específico */}
      {activeTripForDriverPicker && (
        <DriverSelectionModal
          visible={activeDriverPickerIndex !== null}
          onClose={() => setActiveDriverPickerIndex(null)}
          order={order}
          targetTons={activeTripForDriverPicker.totalTons}
          drivers={drivers}
          allTrips={allTrips}
          selectedDriverId={activeTripForDriverPicker.driverId}
          onSelectDriver={handleSelectDriverForTrip}
        />
      )}
    </Modal>
  );
};
