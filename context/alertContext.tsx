import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import CustomAlert from "../components/CustomAlert"; // Importa el componente de alerta
import { AlertOptions, AlertState } from "../types/alert"; // Importa las interfaces

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    isVisible: false,
    message: "",
    type: "info",
    duration: 3000,
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      ...options,
      isVisible: true,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState((prevState) => ({ ...prevState, isVisible: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert
        message={alertState.message}
        type={alertState.type}
        duration={alertState.duration}
        onPress={alertState.onPress}
        isVisible={alertState.isVisible}
        onClose={hideAlert}
        // El prop 'icon' ya no existe en CustomAlert, así que no se pasa
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
