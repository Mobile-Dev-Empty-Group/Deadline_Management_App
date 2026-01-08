import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getMe, updateSettings, changePassword, getMediaUrl, type User } from '@/services/api';
import { clearAllUserData } from '@/utils/auth';
import { resetOnboarding } from '@/utils/onboarding';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingScreen({ navigation }: any) {
  const router = useRouter();
  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const secTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'inputBackground');

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // States cho các nút Switch
  const [pushEnabled, setPushEnabled] = useState(false);
  const [darkEnabled, setDarkEnabled] = useState(false);
  
  // States cho change password
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const userData = await getMe();
      setUser(userData);
      setPushEnabled(userData.pushNotifications);
      setDarkEnabled(userData.darkMode);
    } catch (error) {
      // Xử lý lỗi nếu cần
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushNotificationChange = async (value: boolean) => {
    setPushEnabled(value);
    try {
      const updatedUser = await updateSettings({ pushNotifications: value });
      setUser(updatedUser);
    } catch (error) {
      // Revert nếu lỗi
      setPushEnabled(!value);
    }
  };

  const handleDarkModeChange = async (value: boolean) => {
    setDarkEnabled(value);
    try {
      const updatedUser = await updateSettings({ darkMode: value });
      setUser(updatedUser);
    } catch (error) {
      // Revert nếu lỗi
      setDarkEnabled(!value);
    }
  };

  const handleChangePassword = () => {
    setShowChangePassword(true);
  };

  const handleSavePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await changePassword({
        oldPassword: currentPassword,
        newPassword: newPassword,
      });
      Alert.alert('Success', 'Password changed successfully!');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to change password');
    }
  };

  const handleCancelPassword = () => {
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePrivacyPolicy = () => {
    router.push('/privacy');
  };

  const handleTermsAndConditions = () => {
    router.push('/terms');
  };

  const handleTestOnboarding = async () => {
    Alert.alert(
      'Test Onboarding',
      'This will reset the onboarding status. You will see the onboarding screens again.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: async () => {
            await resetOnboarding();
            Alert.alert('Success', 'Onboarding has been reset. The app will restart.', [
              {
                text: 'OK',
                onPress: () => router.replace('/onboarding'),
              },
            ]);
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.iconButton, { borderColor }]}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Setting</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {isLoading ? (
            <ActivityIndicator size="small" color={primaryColor} />
          ) : (
            <>
              <Image
                source={{
                  uri: getMediaUrl(user?.avatar)
                }}
                style={styles.avatar}
              />
              <Text style={[styles.userName, { color: textColor }]}>
                {user?.name || 'Loading...'}
              </Text>
            </>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* Account Section */}
        <View style={styles.section}>
          {showChangePassword ? (
            <View style={[styles.passwordChangeContainer, { backgroundColor: cardBg }]}>
              <Text style={[styles.passwordLabel, { color: textColor }]}>Current Password</Text>
              <TextInput
                style={[styles.passwordInput, { color: textColor, borderColor }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={secTextColor}
                secureTextEntry
              />
              <Text style={[styles.passwordLabel, { color: textColor, marginTop: 12 }]}>New Password</Text>
              <TextInput
                style={[styles.passwordInput, { color: textColor, borderColor }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={secTextColor}
                secureTextEntry
              />
              <Text style={[styles.passwordLabel, { color: textColor, marginTop: 12 }]}>Confirm Password</Text>
              <TextInput
                style={[styles.passwordInput, { color: textColor, borderColor }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={secTextColor}
                secureTextEntry
              />
              <View style={styles.passwordButtons}>
                <TouchableOpacity
                  style={[styles.passwordButton, { backgroundColor: cardBg, borderColor }]}
                  onPress={handleCancelPassword}
                >
                  <Text style={[styles.passwordButtonText, { color: textColor }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.passwordButton, { backgroundColor: primaryColor }]}
                  onPress={handleSavePassword}
                >
                  <Text style={[styles.passwordButtonText, { color: '#FFF' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <SettingRow
              label="Change password"
              iconRight="chevron-right"
              onPress={handleChangePassword}
            />
          )}

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: textColor }]}>Push notifications</Text>
            <Switch
              trackColor={{ false: '#E2E8F0', true: primaryColor }}
              thumbColor={'#FFF'}
              onValueChange={handlePushNotificationChange}
              value={pushEnabled}
            />
          </View>

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: textColor }]}>Dark mode</Text>
            <Switch
              trackColor={{ false: '#E2E8F0', true: primaryColor }}
              thumbColor={'#FFF'}
              onValueChange={handleDarkModeChange}
              value={darkEnabled}
            />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: borderColor, marginVertical: 10 }]} />

        {/* More Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: secTextColor }]}>More</Text>

          <SettingRow
            label="Privacy policy"
            iconRight="chevron-right"
            onPress={handlePrivacyPolicy}
          />

          <SettingRow
            label="Terms and conditions"
            iconRight="chevron-right"
            onPress={handleTermsAndConditions}
          />

          <SettingRow
            label="Test Onboarding"
            iconRight="chevron-right"
            onPress={handleTestOnboarding}
          />
        </View>

      </ScrollView>
    </ThemedView>
  );
}

// --- Sub-component cho từng hàng Setting ---
function SettingRow({ label, iconRight, onPress }: any) {
  const textColor = useThemeColor({}, 'text');
  const secTextColor = useThemeColor({}, 'textSecondary');

  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Text style={[styles.rowLabel, { color: textColor }]}>{label}</Text>
      {iconRight && (
        <MaterialCommunityIcons name={iconRight} size={24} color={secTextColor} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  iconButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 20,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  rowLabel: {
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
  },
  passwordChangeContainer: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  passwordLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  passwordButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  passwordButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  passwordButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});