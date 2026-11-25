import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StepConfig {
  key: string;
  label: string;
  description: string;
}

const TRACKING_STEPS: StepConfig[] = [
  {
    key: "accepted",
    label: "Iniciado",
    description: "Conductor asignado y carga en preparación",
  },
  {
    key: "in_progress",
    label: "En camino",
    description: "Camión en trayecto hacia tu dirección de entrega",
  },
  {
    key: "completed",
    label: "Completado",
    description: "Entrega verificada y confirmada con código PIN",
  },
];

interface ClientOrderTrackingStepsProps {
  tripStatus?: string;
}

export const ClientOrderTrackingSteps: React.FC<
  ClientOrderTrackingStepsProps
> = ({ tripStatus }) => {
  const getStepStatus = (index: number) => {
    const currentStepIndex =
      tripStatus === "accepted"
        ? 0
        : tripStatus === "started" || tripStatus === "in_progress"
        ? 1
        : tripStatus === "completed"
        ? 2
        : -1;

    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "upcoming";
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="git-commit-outline" size={18} color="#0284C7" />
        <Text style={styles.sectionTitle}>Seguimiento del pedido</Text>
      </View>

      <View style={styles.card}>
        {TRACKING_STEPS.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === TRACKING_STEPS.length - 1;

          return (
            <View key={step.key} style={styles.stepItem}>
              {/* Columna Izquierda: Punto e Indicador de Línea */}
              <View style={styles.indicatorColumn}>
                <View
                  style={[
                    styles.node,
                    status === "completed" && styles.nodeCompleted,
                    status === "current" && styles.nodeCurrent,
                    status === "upcoming" && styles.nodeUpcoming,
                  ]}
                >
                  {status === "completed" ? (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  ) : status === "current" ? (
                    <View style={styles.nodeInnerDot} />
                  ) : (
                    <View style={styles.nodeUpcomingDot} />
                  )}
                </View>

                {!isLast && (
                  <View
                    style={[
                      styles.connectorLine,
                      status === "completed" && styles.connectorLineDone,
                    ]}
                  />
                )}
              </View>

              {/* Columna Derecha: Información del Paso */}
              <View style={[styles.contentColumn, !isLast && { paddingBottom: 18 }]}>
                <Text
                  style={[
                    styles.stepLabel,
                    status === "current" && styles.stepLabelCurrent,
                    status === "completed" && styles.stepLabelCompleted,
                  ]}
                >
                  {step.label}
                </Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F294A",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  stepItem: {
    flexDirection: "row",
  },
  indicatorColumn: {
    alignItems: "center",
    width: 28,
  },
  node: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  nodeCompleted: {
    backgroundColor: "#16A34A",
  },
  nodeCurrent: {
    backgroundColor: "#0284C7",
    borderWidth: 3,
    borderColor: "#BAE6FD",
  },
  nodeInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  nodeUpcoming: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
  },
  nodeUpcomingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 3,
  },
  connectorLineDone: {
    backgroundColor: "#16A34A",
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: "flex-start",
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#94A3B8",
  },
  stepLabelCurrent: {
    color: "#0284C7",
    fontWeight: "700",
  },
  stepLabelCompleted: {
    color: "#0F294A",
    fontWeight: "600",
  },
  stepDescription: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 16,
  },
});

