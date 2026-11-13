import { useState, useCallback } from "react";
import { FeedbackModalProps, FeedbackModalType } from "@/components/common/FeedbackModal";

export interface FeedbackModalOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useFeedbackModal() {
  const [modalState, setModalState] = useState<FeedbackModalProps>({
    visible: false,
    type: "info",
    title: "",
    message: "",
    onClose: () => {},
  });

  const showSuccess = useCallback((options: FeedbackModalOptions) => {
    setModalState({
      ...options,
      visible: true,
      type: "success",
      onClose: () => setModalState((prev) => ({ ...prev, visible: false })),
    });
  }, []);

  const showError = useCallback((options: FeedbackModalOptions) => {
    setModalState({
      ...options,
      visible: true,
      type: "error",
      onClose: () => setModalState((prev) => ({ ...prev, visible: false })),
    });
  }, []);

  const showConfirm = useCallback((options: FeedbackModalOptions) => {
    setModalState({
      ...options,
      visible: true,
      type: "confirm",
      onClose: () => setModalState((prev) => ({ ...prev, visible: false })),
    });
  }, []);

  const showWarning = useCallback((options: FeedbackModalOptions) => {
    setModalState({
      ...options,
      visible: true,
      type: "warning",
      onClose: () => setModalState((prev) => ({ ...prev, visible: false })),
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    modalState,
    showSuccess,
    showError,
    showConfirm,
    showWarning,
    closeModal,
  };
}
