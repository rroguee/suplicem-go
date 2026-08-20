export type AlertType = "success" | "error" | "info" | "warning";

export interface AlertOptions {
  message: string;
  type?: AlertType;
  duration?: number;
  onPress?: () => void;
}

export interface AlertState extends AlertOptions {
  isVisible: boolean;
}
