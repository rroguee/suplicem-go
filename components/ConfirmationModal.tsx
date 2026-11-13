import React from "react";
import { FeedbackModal } from "./common/FeedbackModal";

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Sí",
  cancelText = "No",
  confirmButtonColor = "#E31E24",
}) => {
  return (
    <FeedbackModal
      visible={visible}
      type="confirm"
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
      confirmButtonColor={confirmButtonColor}
      onConfirm={onConfirm}
      onCancel={onCancel}
      onClose={onCancel}
    />
  );
};

export default ConfirmationModal;
