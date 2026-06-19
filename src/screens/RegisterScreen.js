// src/screens/RegisterScreen.js
// Step 1: Enter email → Step 2: Enter OTP → Step 3: Pick username + password
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

const STEPS = ["email", "otp", "details"];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { colors } = useTheme();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // Universal alert to handle React Native Web issues
  const showAlert = (title, msg) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  // ── Step 1: Send OTP ───────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email.trim())
      return showAlert("Required", "Enter your email address");
    try {
      setLoading(true);
      await api.post("/auth/send-otp", { email: email.trim() });
      setStep("otp");
      showAlert("OTP Sent", `A 6-digit code was sent to ${email}`);
    } catch (err) {
      showAlert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────
  const handleVerifyOtp = () => {
    if (otp.trim().length !== 6)
      return showAlert("Invalid", "Enter the 6-digit OTP");
    setStep("details");
  };

  // ── Step 3: Create account ─────────────────────────────────
  const handleRegister = async () => {
    if (!username.trim() || !password || !confirm)
      return showAlert("Required", "Fill in all fields");
    if (password !== confirm)
      return showAlert("Mismatch", "Passwords do not match");
    if (password.length < 6)
      return showAlert("Weak", "Password must be at least 6 characters");
    try {
      setLoading(true);
      const user = await register(
        email.trim(),
        otp.trim(),
        username.trim(),
        password,
      );
      showAlert(
        "🎉 Account Created!",
        `Welcome ${user.username}!\nYour User ID: ${user.userId}\n\nShare this ID so friends can find you.`,
      );
    } catch (err) {
      showAlert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const s = styles(colors);

  // ── Step indicator ─────────────────────────────────────────
  const StepDot = ({ active, done }) => (
    <View style={[s.dot, active && s.dotActive, done && s.dotDone]} />
  );

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Step indicator */}
          <View style={s.steps}>
            <StepDot active={step === "email"} done={step !== "email"} />
            <View style={s.stepLine} />
            <StepDot active={step === "otp"} done={step === "details"} />
            <View style={s.stepLine} />
            <StepDot active={step === "details"} done={false} />
          </View>
          <Text style={s.stepLabel}>
            {step === "email"
              ? "Step 1 of 3 — Enter your email"
              : step === "otp"
                ? "Step 2 of 3 — Verify your email"
                : "Step 3 of 3 — Create your account"}
          </Text>

          {/* ── STEP 1: Email ──────────────────────────────── */}
          {step === "email" && (
            <View style={s.form}>
              <Text style={s.title}>Create Account</Text>
              <Text style={s.sub}>
                You can create up to 3 accounts with one email.
              </Text>
              <Text style={s.label}>Email Address</Text>
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[s.btn, loading && s.btnOff]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.btnText}>Send OTP →</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={s.linkRow}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={s.linkText}>
                  Already have an account?{" "}
                  <Text style={s.linkBold}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── STEP 2: OTP ────────────────────────────────── */}
          {step === "otp" && (
            <View style={s.form}>
              <Text style={s.title}>Check your email</Text>
              <Text style={s.sub}>
                We sent a 6-digit code to{"\n"}
                <Text style={{ color: colors.primary, fontWeight: "700" }}>
                  {email}
                </Text>
              </Text>
              <Text style={s.label}>6-Digit OTP</Text>
              <TextInput
                style={[s.input, s.otpInput]}
                placeholder="000000"
                placeholderTextColor={colors.textMuted}
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity style={s.btn} onPress={handleVerifyOtp}>
                <Text style={s.btnText}>Verify OTP →</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.resend}
                onPress={handleSendOtp}
                disabled={loading}
              >
                <Text style={s.resendText}>
                  {loading ? "Resending..." : "Resend OTP"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── STEP 3: Username + Password ────────────────── */}
          {step === "details" && (
            <View style={s.form}>
              <Text style={s.title}>Almost done!</Text>
              <Text style={s.sub}>
                Choose a username and password for this account.
              </Text>

              <Text style={s.label}>Username</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. john_doe"
                placeholderTextColor={colors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={s.hint}>
                Letters, numbers and underscores only. 3-30 characters.
              </Text>

              <Text style={s.label}>Password</Text>
              <TextInput
                style={s.input}
                placeholder="Min 6 characters"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Text style={s.label}>Confirm Password</Text>
              <TextInput
                style={s.input}
                placeholder="Re-enter password"
                placeholderTextColor={colors.textMuted}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                onSubmitEditing={handleRegister}
              />

              <TouchableOpacity
                style={[s.btn, loading && s.btnOff]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.btnText}>Create Account ✓</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (c) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    scroll: { flexGrow: 1, padding: 24, paddingTop: 12 },
    back: { marginBottom: 8 },
    backText: { color: c.primary, fontSize: 15, fontWeight: "600" },

    steps: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: c.border },
    dotActive: {
      backgroundColor: c.primary,
      width: 16,
      height: 16,
      borderRadius: 8,
    },
    dotDone: { backgroundColor: c.primaryDark || "#017561" },
    stepLine: {
      flex: 1,
      height: 2,
      backgroundColor: c.border,
      marginHorizontal: 4,
    },
    stepLabel: { fontSize: 12, color: c.textMuted, marginBottom: 20 },

    form: { gap: 4 },
    title: { fontSize: 28, fontWeight: "800", color: c.text, marginBottom: 6 },
    sub: {
      fontSize: 14,
      color: c.textSecondary,
      lineHeight: 21,
      marginBottom: 16,
    },
    label: {
      fontSize: 11,
      fontWeight: "700",
      color: c.textSecondary,
      marginTop: 14,
      marginBottom: 5,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: c.inputBg,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: c.text,
      borderWidth: 1,
      borderColor: c.border,
    },
    otpInput: {
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
      letterSpacing: 10,
    },
    hint: { fontSize: 11, color: c.textMuted, marginTop: 4 },
    btn: {
      backgroundColor: c.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 22,
    },
    btnOff: { opacity: 0.65 },
    btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    linkRow: { alignItems: "center", marginTop: 18 },
    linkText: { color: c.textSecondary, fontSize: 14 },
    linkBold: { color: c.primary, fontWeight: "700" },
    resend: { alignItems: "center", marginTop: 14 },
    resendText: { color: c.primary, fontSize: 14, fontWeight: "600" },
  });
