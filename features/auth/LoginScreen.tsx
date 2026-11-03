import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useLogin } from "./hooks/useLogin";
import { usePhoneLogin } from "./hooks/usePhoneLogin";
import { PhoneLoginModal } from "./components/PhoneLoginModal";
import { LoginHeader } from "./components/LoginHeader";
import { LoginForm } from "./components/LoginForm";
import { ForgotPasswordModal } from "./components/ForgotPasswordModal";
import { ResendVerificationModal } from "./components/ResendVerificationModal";

export const LoginScreen: React.FC = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    modalVisible,
    setModalVisible,
    recoveryEmail,
    setRecoveryEmail,
    resendModalVisible,
    setResendModalVisible,
    resendEmail,
    setResendEmail,
    handleLogin,
    handlePasswordReset,
    handleResendVerification,
  } = useLogin();

  const phoneLogin = usePhoneLogin();

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LoginHeader />

        <LoginForm
          email={email}
          onChangeEmail={setEmail}
          password={password}
          onChangePassword={setPassword}
          showPassword={showPassword}
          onToggleShowPassword={() => setShowPassword(!showPassword)}
          onLogin={handleLogin}
          onOpenForgotPassword={() => setModalVisible(true)}
          onOpenResendVerification={() => {
            setResendEmail(email || "");
            setResendModalVisible(true);
          }}
        />

        <TouchableOpacity style={styles.phoneButton} onPress={phoneLogin.open}>
          <Text style={styles.phoneButtonText}>Ingresar con teléfono (SMS)</Text>
        </TouchableOpacity>

        <PhoneLoginModal
          visible={phoneLogin.visible}
          step={phoneLogin.step}
          phone={phoneLogin.phone}
          onChangePhone={phoneLogin.setPhone}
          code={phoneLogin.code}
          onChangeCode={phoneLogin.setCode}
          isSubmitting={phoneLogin.isSubmitting}
          onRequestCode={phoneLogin.requestCode}
          onConfirmCode={phoneLogin.confirmCode}
          onBackToPhone={phoneLogin.backToPhone}
          onClose={phoneLogin.close}
        />

        <ForgotPasswordModal
          visible={modalVisible}
          email={recoveryEmail}
          onChangeEmail={setRecoveryEmail}
          onSubmit={handlePasswordReset}
          onClose={() => setModalVisible(false)}
        />

        <ResendVerificationModal
          visible={resendModalVisible}
          email={resendEmail}
          onChangeEmail={setResendEmail}
          onSubmit={handleResendVerification}
          onClose={() => setResendModalVisible(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  phoneButton: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0F294A",
  },
  phoneButtonText: {
    color: "#0F294A",
    fontWeight: "600",
    fontSize: 14,
  },
});
