import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getMe, updateProfile, uploadMedia, getMediaUrl, type User } from '@/services/api';
import { clearAllUserData } from '@/utils/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen({ navigation }: any) {
  const router = useRouter();
  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const secTextColor = useThemeColor({}, 'textSecondary');
  const cardBg = useThemeColor({}, 'inputBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      // Xử lý lỗi nếu cần
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditName = () => {
    if (user) {
      setEditedName(user.name);
      setIsEditingName(true);
    }
  };

  const handleSaveName = async () => {
    if (!user || !editedName.trim()) {
      setIsEditingName(false);
      return;
    }

    if (editedName.trim() === user.name) {
      setIsEditingName(false);
      return;
    }

    try {
      setIsSavingName(true);
      const updatedUser = await updateProfile({ name: editedName.trim() });
      setUser(updatedUser);
      setIsEditingName(false);
      Alert.alert('Success', 'Name updated successfully!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update name');
      setEditedName(user.name); // Revert on error
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    if (user) {
      setEditedName(user.name);
    }
  };

  const handleMenuPress = async (item: typeof MENU_ITEMS[0]) => {
    if (item.id === '4') {
      // Log out
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: async () => {
              try {
                await clearAllUserData();
                router.replace('/(auth)/login');
              } catch (error) {
                Alert.alert('Error', 'Failed to log out');
              }
            },
          },
        ]
      );
    } else if (item.id === '1') {
      // My Task
      router.push('/(tabs)/tasks');
    } else if (item.id === '2') {
      // Report/Analytics
      router.push('/(tabs)/analytic');
    } else if (item.id === '3') {
      // About us
      Alert.alert('About Us', 'This is a deadline management app.');
    }
  };

  const handleUploadAvatar = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload avatar!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const imageUri = result.assets[0].uri;
      setIsUploading(true);

      // Upload image
      const uploadResult = await uploadMedia(imageUri);
      console.log('Upload result from API:', uploadResult);
      
      // uploadResult.url đã được xử lý trong uploadMedia function
      const avatarUrl = uploadResult.url;
      console.log('Avatar URL to save to profile:', avatarUrl);
      
      // Update profile with new avatar URL - lưu cả relative path và full URL
      // Backend có thể cần relative path hoặc full URL tùy cách implement
      const updatedUser = await updateProfile({ avatar: avatarUrl });
      console.log('Updated user from API:', updatedUser);
      console.log('User avatar after update:', updatedUser.avatar);
      setUser(updatedUser);
      
      // Reload profile để đảm bảo có data mới nhất
      await loadProfile();

      Alert.alert('Success', 'Avatar updated successfully!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  // Danh sách các tùy chọn Menu
  const MENU_ITEMS = [
    { id: '1', title: 'My Task', icon: 'account-outline', color: '#818CF8', route: 'MyTask' },
    { id: '2', title: 'Report/Analytics', icon: 'chart-bar', color: '#F472B6', route: 'Analytic' },
    { id: '3', title: 'About us', icon: 'heart-outline', color: '#FB7185', route: 'About' },
    { id: '4', title: 'Log out', icon: 'logout', color: '#94A3B8', route: 'Login' },
  ];

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
        <Text style={[styles.headerTitle, { color: textColor }]}>My Profile</Text>
        <TouchableOpacity 
          style={[styles.iconButton, { borderColor }]}
          onPress={() => router.push('/setting')}
        >
          <MaterialCommunityIcons name="cog-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Avatar Section */}
        <View style={styles.profileSection}>
          {isLoading ? (
            <ActivityIndicator size="large" color={primaryColor} />
          ) : (
            <>
              <View style={styles.avatarWrapper}>
                <TouchableOpacity 
                  onPress={() => setShowImageModal(true)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{
                      uri: getMediaUrl(user?.avatar)
                    }}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.editBadge, { backgroundColor: primaryColor }]}
                  onPress={handleUploadAvatar}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <MaterialCommunityIcons name="pencil" size={14} color="#FFF" />
                  )}
                </TouchableOpacity>
              </View>
              {isEditingName ? (
                <View style={styles.nameEditContainer}>
                  <TextInput
                    style={[styles.nameInput, { color: textColor, borderColor, backgroundColor: cardBg }]}
                    value={editedName}
                    onChangeText={setEditedName}
                    autoFocus
                    placeholder="Enter name"
                    placeholderTextColor={secTextColor}
                  />
                  <View style={styles.nameEditButtons}>
                    <TouchableOpacity
                      style={[styles.nameEditButton, { backgroundColor: cardBg, borderColor }]}
                      onPress={handleCancelEditName}
                      disabled={isSavingName}
                    >
                      <MaterialCommunityIcons name="close" size={18} color={textColor} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.nameEditButton, { backgroundColor: primaryColor }]}
                      onPress={handleSaveName}
                      disabled={isSavingName || !editedName.trim()}
                    >
                      {isSavingName ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <MaterialCommunityIcons name="check" size={18} color="#FFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.nameWrapper}>
                  <View style={styles.nameWithIcon}>
                    <Text style={[styles.userName, { color: textColor }]}>
                      {user?.name || 'Loading...'}
                    </Text>
                    <TouchableOpacity
                      onPress={handleEditName}
                      activeOpacity={0.7}
                      style={styles.editNameButton}
                    >
                      <MaterialCommunityIcons name="pencil" size={16} color={secTextColor} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { backgroundColor: 'transparent' }]}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconWrapper, { backgroundColor: item.color + '15' }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={[styles.menuTitle, { color: textColor }]}>{item.title}</Text>
              </View>
              <MaterialCommunityIcons name="arrow-right" size={20} color={textColor} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Image View Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <Pressable
          style={styles.imageModalOverlay}
          onPress={() => setShowImageModal(false)}
        >
          <View style={styles.imageModalContent}>
            <TouchableOpacity
              style={styles.imageModalCloseButton}
              onPress={() => setShowImageModal(false)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <Image
                source={{ uri: getMediaUrl(user?.avatar) }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
    paddingBottom: 140, // Khoảng trống để không bị Nav Bar che
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F5F9',
  },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  editNameButton: {
    padding: 4,
  },
  nameEditContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  nameInput: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 200,
  },
  nameEditButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  nameEditButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  menuContainer: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuIconWrapper: {
    width: 45,
    height: 45,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});