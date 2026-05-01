// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const { login }  = useAuth();
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      return Alert.alert('Missing fields', 'Please enter your username and password.');
    }
    try {
      setLoading(true);
      await login(username.trim(), password);
    } catch (err) {
      Alert.alert('Login failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const s = styles(colors);
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={s.hero}>
            <View style={s.logoCircle}>
              <Text style={s.logoEmoji}>💬</Text>
            </View>
            <Text style={s.appName}>APNA</Text>
            <Text style={s.tagline}>Fast · Private · Real-time</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            <Text style={s.label}>Username</Text>
            <TextInput
              style={s.input}
              placeholder="Enter your username"
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Text style={s.label}>Password</Text>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnText}>Sign In</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={s.linkRow}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={s.linkText}>
                Don't have an account?{'  '}
                <Text style={s.linkBold}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (c) => StyleSheet.create({
  safe:      { flex: 1, backgroundColor: c.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  hero:      { alignItems: 'center', marginBottom: 44 },
  logoCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: c.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 40 },
  appName:   { fontSize: 34, fontWeight: '800', color: c.primary, letterSpacing: -1 },
  tagline:   { fontSize: 13, color: c.textMuted, marginTop: 6 },
  form:      { gap: 4 },
  label: {
    fontSize: 12, fontWeight: '700', color: c.textSecondary,
    marginTop: 14, marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  input: {
    backgroundColor: c.inputBg, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: c.text,
    borderWidth: 1, borderColor: c.border,
  },
  btn: {
    backgroundColor: c.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 22,
  },
  btnDisabled: { opacity: 0.65 },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkRow:     { alignItems: 'center', marginTop: 18 },
  linkText:    { color: c.textSecondary, fontSize: 14 },
  linkBold:    { color: c.primary, fontWeight: '700' },
});