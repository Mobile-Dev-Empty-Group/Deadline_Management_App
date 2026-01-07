import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { register } from '@/services/api';
import { saveAccessToken } from '@/utils/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dùng ref để chuyển focus tự động
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Hàm xử lý đóng bàn phím
  const dismissKeyboard = () => Keyboard.dismiss();

  const router = useRouter();
  const navigateToLogin = () => {
    router.replace('/login');
  };

  // Lấy màu sắc từ Theme
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const inputBg = useThemeColor({}, 'inputBackground');
  const tabInactiveColor = useThemeColor({}, 'tabInactive');
  const primaryColor = useThemeColor({}, 'primary');

  // Hàm kiểm tra định dạng Email bằng Regex
  const validateEmailFormat = (text: string) => {
    if (text.length === 0) return ''; // Không báo lỗi khi chưa nhập gì
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      return 'Invalid email format';
    }
    return '';
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Tự động kiểm tra định dạng khi người dùng gõ
    const formatError = validateEmailFormat(text);
    setEmailError(formatError);
  };

  // Hàm gọi API đăng ký
  const handleSignUp = async () => {
    dismissKeyboard();
    // Re-validate email format trước khi gửi API
    const formatError = validateEmailFormat(email);
    if (formatError || email === '') {
      setEmailError(formatError || 'Email is required');
      return;
    }

    // Kiểm tra mật khẩu khớp nhau
    if (password !== confirmPassword) {
      setPassError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setPassError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setEmailError('');
    setPassError('');

    try {
      // Tạo name từ email (lấy phần trước @) hoặc dùng "User" làm mặc định
      const name = email.split('@')[0] || 'User';

      const response = await register({
        email,
        password,
        name,
      });

      // Lưu access token
      await saveAccessToken(response.access_token);

      // Chuyển đến màn hình chính hoặc login
      router.replace('/(tabs)');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';

      // Kiểm tra nếu lỗi liên quan đến email
      const lowerMessage = errorMessage.toLowerCase();
      if (lowerMessage.includes('email') || lowerMessage.includes('already') || lowerMessage.includes('exists')) {
        setEmailError(errorMessage);
      } else {
        setPassError(errorMessage);
      }

      // Chỉ hiển thị Alert nếu không phải lỗi email hoặc password (đã hiển thị trên UI)
      if (!lowerMessage.includes('email') && !lowerMessage.includes('already') && !lowerMessage.includes('exists') && !lowerMessage.includes('password')) {
        Alert.alert('Registration Failed', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
      <ThemedView safe style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Tab Header */}
          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tab, { borderBottomColor: tabInactiveColor }]} onPress={navigateToLogin}>
              <Text style={[styles.tabText, { color: tabInactiveColor }]}>Log in</Text>
            </TouchableOpacity>
            <View style={[styles.tab, { borderBottomColor: primaryColor }]}>
              <Text style={[styles.tabText, { color: primaryColor }]}>Sign up</Text>
            </View>
          </View>

          <View style={styles.content}>
            {/* Email Field */}
            <Text style={[styles.label, { color: textColor }]}>Your Email</Text>
            <View style={[
              styles.inputWrapper,
              { borderColor: borderColor, backgroundColor: inputBg },
              !!emailError && styles.inputError
            ]}>
              <TextInput
                style={[styles.input, { color: textColor }]}
                value={email}
                onChangeText={handleEmailChange}
                placeholder="Enter your email"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()} // Nhấn Next nhảy sang Pass
              />
            </View>
            <View style={styles.errorSpace}>
              {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
            </View>

            {/* Password Field */}
            <Text style={[styles.label, { color: textColor, marginTop: 10 }]}>Password</Text>
            <View style={[
              styles.inputWrapper,
              { borderColor: borderColor, backgroundColor: inputBg },
              passError && styles.inputError
            ]}>
              <TextInput
                ref={passwordRef}
                style={[styles.input, { color: textColor }]}
                secureTextEntry={secureText}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPassError('');
                }}
                placeholder="Enter your password"
                placeholderTextColor="#A0A0A0"
                returnKeyType="done"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
              <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                <MaterialCommunityIcons name={secureText ? "eye-off-outline" : "eye-outline"} size={22} color={textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.errorSpace} />

            {/* Confirm Password Field */}
            <Text style={[styles.label, { color: textColor, marginTop: 10 }]}>Confirm Password</Text>
            <View style={[styles.inputWrapper, { borderColor, backgroundColor: inputBg }, !!passError && styles.inputError]}>
              <TextInput
                ref={confirmPasswordRef}
                style={[styles.input, { color: textColor }]}
                secureTextEntry={secureText}
                value={confirmPassword}
                onChangeText={(text) => { setConfirmPassword(text); setPassError(''); }}
                placeholder="Confirm your password"
                placeholderTextColor="#A0A0A0"
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />
              <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                <MaterialCommunityIcons name={secureText ? "eye-off-outline" : "eye-outline"} size={22} color={textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.errorSpace}>
              {!!passError && <Text style={styles.errorText}>{passError}</Text>}
            </View>

            {/* Nút Sign Up */}
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: primaryColor }, (!email || !password || !confirmPassword || isLoading) && { opacity: 0.6 }]}
              onPress={handleSignUp}
              disabled={!email || !password || !confirmPassword || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Divider "Or" */}
            <View style={styles.divider}>
              <View style={[styles.line, { backgroundColor: borderColor }]} />
              <Text style={{ marginHorizontal: 15, color: textSecondary }}>Or</Text>
              <View style={[styles.line, { backgroundColor: borderColor }]} />
            </View>

            {/* Social Buttons */}
            <TouchableOpacity style={[styles.socialButton, { borderColor: borderColor }]}>
              <MaterialCommunityIcons name="facebook" size={24} color="#1877F2" />
              <Text style={[styles.socialText, { color: textColor }]}>Login with Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialButton, { borderColor: borderColor }]}>
              <MaterialCommunityIcons name="google" size={22} color="#EA4335" />
              <Text style={[styles.socialText, { color: textColor }]}>Login with Google</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={{ color: textSecondary }}>Already have an account? </Text>
              <TouchableOpacity>
                <Link href="/login" style={[styles.linkText, { color: primaryColor }]}>Log in</Link>
              </TouchableOpacity>
            </View>
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
  content: {
    paddingHorizontal: 25,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 40,
  },
  tab: { flex: 1, alignItems: 'center', borderBottomWidth: 2, paddingBottom: 15 },
  tabText: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 15, height: 55 },
  inputError: {
    borderColor: '#FF7D7D',
  },
  input: { flex: 1, fontSize: 16 },
  errorSpace: { height: 20, marginTop: 4, justifyContent: 'center' },
  errorText: { color: '#FF7D7D', fontSize: 13 },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  linkText: {
    fontWeight: '700',
    fontSize: 14,
  },
  primaryButton: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 40,
  },
  line: {
    flex: 1,
    height: 1,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 55,
    marginBottom: 15,
  },
  socialText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
});