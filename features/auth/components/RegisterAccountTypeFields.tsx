import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Control, Controller } from "react-hook-form";
import CustomPickerModal from "@/components/CustomPickerModal";
import { RegisterFormData } from "@/types/users";

interface RegisterAccountTypeFieldsProps {
  control: Control<RegisterFormData>;
  registerMethod?: "email" | "phone";
}

export const RegisterAccountTypeFields: React.FC<
  RegisterAccountTypeFieldsProps
> = ({ control, registerMethod }) => {
  return (
    <View>
      <Controller
        control={control}
        name="registerMethod"
        render={({ field: { value, onChange } }) => (
          <CustomPickerModal
            label="Método de registro"
            selectedValue={value}
            onValueChange={onChange}
            options={[
              { label: "Correo electrónico", value: "email" },
              { label: "Número de teléfono (SMS)", value: "phone" },
            ]}
          />
        )}
      />
      {registerMethod === "phone" && (
        <Text style={styles.hint}>
          No necesitas correo. Verificaremos tu número con un código SMS.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  hint: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 10,
  },
});
