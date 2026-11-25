import { StyleSheet } from "react-native";
import { Palette } from "@/constants/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Palette.background,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0F294A",
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  productTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F294A",
    marginBottom: 6,
  },
  productLine: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
    color: "#1E293B",
  },
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  deliveryAddress: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F294A",
    marginBottom: 4,
  },
  deliveryValue: {
    fontSize: 13,
    color: "#64748B",
  },
  commentsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
  },
  commentsValue: {
    fontSize: 14,
    color: "#1E293B",
  },
  navigationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#0284C7",
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  navigationButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  pickupCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 16,
    marginVertical: 12,
  },
  pickupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  pickupTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F294A",
  },
  pickupText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
});
