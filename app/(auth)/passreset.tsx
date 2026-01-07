import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ResetSuccessScreen() {
  const router = useRouter();

  // Lấy màu từ Theme
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <ThemedView safe style={styles.container}>
      {/* Nút Back */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <View style={[styles.backIconCircle, { backgroundColor: '#F0F2F5' }]}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>Password reset</Text>
        
        <Text style={[styles.subtitle, { color: textSecondary }]}>
          Your password has been successfully reset.{"\n"}
          click confirm to set a new password
        </Text>

        {/* Nút Confirm */}
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: primaryColor }]}
          onPress={() => router.replace('/newpass')}
        >
          <Text style={styles.primaryButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginTop: 20,
    marginLeft: 25,
    width: 45,
    height: 45,
  },
  backIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 25,
    marginTop: 35,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 40,
  },
  primaryButton: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});