// src/screens/LoginScreen.js
// Step 1: Enter email → Step 2: Pick account card → Enter password
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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { colors } = useTheme();

  const [step, setStep] = useState("email"); // 'email' | 'pick'
  const [email, setEmail] = useState("");
  const [accounts, setAccounts] = useState([]); // [{_id,username,userId,avatar}]
  const [selected, setSelected] = useState(null); // chosen account
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Universal alert to handle React Native Web issues
  const showAlert = (title, msg) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  // ── Step 1: Fetch accounts for email ──────────────────────
  const handleLookup = async () => {
    if (!email.trim()) return showAlert("Required", "Enter your email");
    try {
      setLoading(true);
      console.log("Looking up accounts for:", email.trim());
      const res = await api.post("/auth/accounts", { email: email.trim() });
      setAccounts(res.data);
      setStep("pick");
    } catch (err) {
      showAlert("Not found", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Login with selected account ───────────────────
  const handleLogin = async () => {
    if (!selected) return showAlert("Select", "Please pick an account");
    if (!password.trim()) return showAlert("Required", "Enter your password");
    try {
      setLoading(true);
      await login(selected._id, password);
    } catch (err) {
      console.error("Login Error:", err);
      showAlert("Login failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const s = styles(colors);

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
          {/* Logo */}
          <View style={s.hero}>
            <View style={s.logoCircle}>
              <Text style={s.logoEmoji}>💬</Text>
            </View>
            <Text style={s.appName}>Chattr</Text>
            <Text style={s.tagline}>Fast · Private · Real-time</Text>
          </View>

          {/* ── STEP 1: Email ──────────────────────────────── */}
          {step === "email" && (
            <View style={s.form}>
              <Text style={s.label}>Your Email</Text>
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLookup}
              />
              <TouchableOpacity
                style={[s.btn, loading && s.btnOff]}
                onPress={handleLookup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.btnText}>Find My Accounts →</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={s.linkRow}
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={s.linkText}>
                  No account? <Text style={s.linkBold}>Create one</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── STEP 2: Pick account ────────────────────────── */}
          {step === "pick" && (
            <View style={s.form}>
              {/* Back to email */}
              <TouchableOpacity
                style={s.backRow}
                onPress={() => {
                  setStep("email");
                  setSelected(null);
                  setPassword("");
                }}
              >
                <Text style={s.backText}>← Change email</Text>
              </TouchableOpacity>

              <Text style={s.sectionTitle}>
                {accounts.length} account{accounts.length > 1 ? "s" : ""} found
                for
              </Text>
              <Text style={s.emailDisplay}>{email}</Text>
              <Text style={s.sectionTitle}>Pick an account to sign in:</Text>

              {/* Account cards */}
              {accounts.map((acc) => {
                const isSelected = selected?._id === acc._id;
                return (
                  <TouchableOpacity
                    key={acc._id}
                    style={[s.accountCard, isSelected && s.accountCardSelected]}
                    onPress={() => setSelected(acc)}
                    activeOpacity={0.75}
                  >
                    {/* Avatar */}
                    <View style={s.accAvatarWrap}>
                      {acc.avatar?.url ? (
                        <Image
                          source={{ uri: acc.avatar.url }}
                          style={s.accAvatar}
                        />
                      ) : (
                        <View style={[s.accAvatar, s.accAvatarFb]}>
                          <Text style={s.accAvatarLetter}>
                            {acc.username[0].toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={s.accInfo}>
                      <Text
                        style={[s.accName, isSelected && s.accNameSelected]}
                      >
                        @{acc.username}
                      </Text>
                      <Text style={s.accId}>ID: {acc.userId}</Text>
                    </View>
                    {isSelected && <Text style={s.checkMark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}

              {/* Password field */}
              {selected && (
                <>
                  <Text style={[s.label, { marginTop: 20 }]}>
                    Password for @{selected.username}
                  </Text>
                  <TextInput
                    style={s.input}
                    placeholder="Enter password"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoFocus
                    onSubmitEditing={handleLogin}
                    returnKeyType="done"
                  />
                </>
              )}

              <TouchableOpacity
                style={[
                  s.btn,
                  (!selected || !password.trim() || loading) && s.btnOff,
                ]}
                onPress={handleLogin}
                disabled={!selected || !password.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.btnText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={s.linkRow}
                onPress={() => navigation.navigate("Register")}
              >
                <Text style={s.linkText}>
                  Add another account? <Text style={s.linkBold}>Register</Text>
                </Text>
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
    scroll: { flexGrow: 1, padding: 24 },

    hero: { alignItems: "center", marginBottom: 36, marginTop: 12 },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    logoEmoji: { fontSize: 36 },
    appName: {
      fontSize: 34,
      fontWeight: "800",
      color: c.primary,
      letterSpacing: -1,
    },
    tagline: { fontSize: 13, color: c.textMuted, marginTop: 4 },

    form: { gap: 4 },
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
    btn: {
      backgroundColor: c.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 20,
    },
    btnOff: { opacity: 0.5 },
    btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    linkRow: { alignItems: "center", marginTop: 16 },
    linkText: { color: c.textSecondary, fontSize: 14 },
    linkBold: { color: c.primary, fontWeight: "700" },

    backRow: { marginBottom: 12 },
    backText: { color: c.primary, fontSize: 14, fontWeight: "600" },
    sectionTitle: { fontSize: 13, color: c.textSecondary, marginBottom: 4 },
    emailDisplay: {
      fontSize: 15,
      fontWeight: "700",
      color: c.primary,
      marginBottom: 16,
    },

    // Account card
    accountCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 2,
      borderColor: c.border,
    },
    accountCardSelected: {
      borderColor: c.primary,
      backgroundColor: c.primaryLight,
    },
    accAvatarWrap: { marginRight: 12 },
    accAvatar: { width: 48, height: 48, borderRadius: 24 },
    accAvatarFb: {
      backgroundColor: c.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    accAvatarLetter: { color: "#fff", fontSize: 20, fontWeight: "700" },
    accInfo: { flex: 1 },
    accName: { fontSize: 16, fontWeight: "600", color: c.text },
    accNameSelected: { color: c.primary },
    accId: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 2,
      fontFamily: "monospace",
    },
    checkMark: { fontSize: 22, color: c.primary, fontWeight: "700" },
  });
