import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function VerifyOtpScreen() {
  const router = useRouter();
  // Lấy email từ trang trước truyền sang (nếu có)
  const { email } = useLocalSearchParams<{ email: string }>();
  
  // State cho 5 ô OTP
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const otpInputs = useRef<TextInput[]>([]);

  // Colors từ Theme
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const inputBg = useThemeColor({}, 'inputBackground');
  const primaryColor = useThemeColor({}, 'primary');

  // Xử lý logic nhập OTP
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động nhảy sang ô tiếp theo nếu có giá trị
    if (value !== '' && index < 4) {
      otpInputs.current[index + 1].focus();
    }
  };

  // Xử lý khi nhấn nút xóa (Backspace) để quay lại ô trước
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 5) return;
    console.log('Verifying code:', code);
    router.push('/passreset');
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
            <Text style={[styles.title, { color: textColor }]}>Check your email</Text>
            
            <Text style={[styles.subtitle, { color: textSecondary }]}>
              We sent a reset link to <Text style={{fontWeight: 'bold', color: textColor}}>{email || 'your email'}</Text>
              {'\n'}enter 5 digit code that mentioned in the email
            </Text>

            {/* Container các ô nhập OTP */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.otpBox, 
                    { 
                      borderColor: digit ? primaryColor : borderColor, 
                      backgroundColor: inputBg 
                    }
                  ]}
                >
                  <TextInput
                    ref={(ref) => { if (ref) otpInputs.current[index] = ref; }}
                    style={[styles.otpInput, { color: textColor }]}
                    value={digit}
                    onChangeText={(v) => handleOtpChange(v, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                </View>
              ))}
            </View>

            {/* Nút Verify */}
            <TouchableOpacity 
              style={[
                styles.primaryButton, 
                { backgroundColor: primaryColor, opacity: otp.join('').length === 5 ? 1 : 0.6 }
              ]}
              onPress={handleVerify}
              disabled={otp.join('').length < 5}
            >
              <Text style={styles.primaryButtonText}>Verify Code</Text>
            </TouchableOpacity>

            {/* Resend link */}
            <View style={styles.footer}>
              <Text style={{ color: textSecondary }}>Haven't got the email yet? </Text>
              <TouchableOpacity onPress={() => console.log('Resending...')}>
                <Text style={[styles.linkText, { color: primaryColor }]}>Resend email</Text>
              </TouchableOpacity>
            </View>
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
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  otpBox: { width: '18%', height: 65, borderWidth: 1.5, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  otpInput: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', width: '100%' },
  primaryButton: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 35 },
  linkText: { fontWeight: '700', textDecorationLine: 'underline' },
});