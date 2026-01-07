import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
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

export default function SetNewPasswordScreen() {
  const router = useRouter();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [isInputError, setIsInputError] = useState(false);

  const confirmPassRef = useRef<TextInput>(null);

  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const inputBg = useThemeColor({}, 'inputBackground');
  const primaryColor = useThemeColor({}, 'primary');

  const handleUpdatePassword = () => {
    Keyboard.dismiss();
    
    // Kiểm tra độ dài
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      setIsInputError(true);
      return;
    }
    
    // Kiểm tra khớp nhau
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsInputError(true);
      return;
    }

    // Nếu mọi thứ ổn
    console.log('Password updated successfully');
    router.replace('/login'); 
  };

  // Hàm xóa trạng thái lỗi khi người dùng bắt đầu nhập lại
  const onTextChange = (type: 'pass' | 'confirm', value: string) => {
    if (type === 'pass') setPassword(value);
    else setConfirmPassword(value);
    
    if (isInputError) {
      setIsInputError(false);
      setErrorMessage('');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView safe style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Nút Back */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <View style={[styles.backIconCircle, { backgroundColor: '#F0F2F5' }]}>
              <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
            </View>
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={[styles.title, { color: textColor }]}>Set a new password</Text>
            <Text style={[styles.subtitle, { color: textSecondary }]}>
              Create a new password. Ensure it differs from previous ones for security
            </Text>

            {/* Input Password */}
            <Text style={[styles.label, { color: textColor }]}>Password</Text>
            <View style={[
                styles.inputWrapper, 
                { borderColor, backgroundColor: inputBg },
                isInputError && styles.inputError 
            ]}>
              <TextInput
                style={[styles.input, { color: textColor }]}
                value={password}
                onChangeText={(text) => onTextChange('pass', text)}
                placeholder="Enter your new password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry={secureText}
                returnKeyType="next"
                onSubmitEditing={() => confirmPassRef.current?.focus()}
              />
              <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                <MaterialCommunityIcons 
                  name={secureText ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#D0D0D0" 
                />
              </TouchableOpacity>
            </View>

            {/* Input Confirm Password */}
            <Text style={[styles.label, { color: textColor, marginTop: 20 }]}>Confirm Password</Text>
            <View style={[
              styles.inputWrapper, 
              { borderColor, backgroundColor: inputBg },
              isInputError && styles.inputError
            ]}>
              <TextInput
                ref={confirmPassRef}
                style={[styles.input, { color: textColor }]}
                value={confirmPassword}
                onChangeText={(text) => onTextChange('confirm', text)}
                placeholder="Re-enter password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry={secureText}
                returnKeyType="done"
                onSubmitEditing={handleUpdatePassword}
              />
              <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                <MaterialCommunityIcons 
                  name={secureText ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#D0D0D0" 
                />
              </TouchableOpacity>
            </View>

            {/* Thông báo lỗi */}
            <View style={styles.errorSpace}>
              {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
            </View>

            {/* Nút Update Password */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: primaryColor },
                (!password || !confirmPassword) && { opacity: 0.5 }
              ]}
              onPress={handleUpdatePassword}
              disabled={!password || !confirmPassword}
            >
              <Text style={styles.primaryButtonText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { marginTop: 20, marginLeft: 25, width: 45, height: 45 },
  backIconCircle: { width: 45, height: 45, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 25, marginTop: 35 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 35 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 10 },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    height: 55, 
    borderWidth: 1.5, 
    borderRadius: 12, 
    paddingHorizontal: 15 
  },
  input: { flex: 1, fontSize: 16 },
  inputError: { borderColor: '#FF7D7D' },
  errorSpace: { height: 25, marginTop: 5 },
  errorText: { color: '#FF7D7D', fontSize: 13 },
  primaryButton: { 
    height: 55, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10 
  },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});