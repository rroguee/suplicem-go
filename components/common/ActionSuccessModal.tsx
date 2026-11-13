import React from "react";
import { FeedbackModal } from "./FeedbackModal";

export interface ActionSuccessModalProps {
  visible: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export const ActionSuccessModal: React.FC<ActionSuccessModalProps> = ({
  visible,
  title = "¡Operación Exitosa!",
  message,
  buttonText = "Entendido",
  onClose,
}) => {
  return (
    <FeedbackModal
      visible={visible}
      type="success"
      title={title}
      message={message}
      confirmText={buttonText}
      onClose={onClose}
    />
  );
};

export default ActionSuccessModal;
