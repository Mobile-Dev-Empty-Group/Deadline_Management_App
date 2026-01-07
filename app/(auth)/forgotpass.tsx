import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const router = useRouter();

  // Lấy màu sắc từ hệ thống Theme của bạn
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const inputBg = useThemeColor({}, 'inputBackground');
  const primaryColor = useThemeColor({}, 'primary');

  const validateEmail = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (text.length > 0 && !emailRegex.test(text)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  const handleResetPassword = () => {
    Keyboard.dismiss();
    if (!email || emailError) {
      setEmailError(emailError || 'Please enter your email');
      return;
    }
    router.push({
      pathname: '/verifycode',
      params: { email: email }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView safe style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          {/* Nút Back */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <View style={[styles.backIconCircle, { backgroundColor: '#F0F0F0' }]}>
              <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
            </View>
          </TouchableOpacity>

          <View style={styles.content}>
            {/* Header Text */}
            <Text style={[styles.title, { color: textColor }]}>Forgot password</Text>
            <Text style={[styles.subtitle, { color: textSecondary }]}>
              Please enter your email to reset the password
            </Text>

            {/* Input Field */}
            <Text style={[styles.label, { color: textColor }]}>Your Email</Text>
            <View style={[
              styles.inputWrapper, 
              { borderColor, backgroundColor: inputBg },
              !!emailError && styles.inputError
            ]}>
              <TextInput
                style={[styles.input, { color: textColor }]}
                value={email}
                onChangeText={validateEmail}
                placeholder="Enter your email"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
              />
            </View>

            {/* Error Message */}
            <View style={styles.errorSpace}>
              {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: primaryColor },
                (!email || !!emailError) && { opacity: 0.5 }
              ]}
              onPress={handleResetPassword}
              disabled={!email || !!emailError}
            >
              <Text style={styles.primaryButtonText}>Reset Password</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  backButton: {
    marginTop: 20,
    marginLeft: 20,
    width: 40,
    height: 40,
  },
  backIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 25,
    marginTop: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 40,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  inputWrapper: {
    height: 55,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    flex: 1,
  },
  inputError: {
    borderColor: '#FF7D7D',
  },
  errorSpace: {
    height: 25,
    marginTop: 5,
  },
  errorText: {
    color: '#FF7D7D',
    fontSize: 13,
  },
  primaryButton: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});