import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen({ navigation }: any) {
  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const secTextColor = useThemeColor({}, 'textSecondary');
  const cardBg = useThemeColor({}, 'inputBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

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
          onPress={() => navigation?.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>My Profile</Text>
        <TouchableOpacity style={[styles.iconButton, { borderColor }]}>
          <MaterialCommunityIcons name="cog-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Avatar Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/300' }}
              style={styles.avatar} 
            />
            <TouchableOpacity style={[styles.editBadge, { backgroundColor: primaryColor }]}>
              <MaterialCommunityIcons name="pencil" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: textColor }]}>Thanh Tâm</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuItem, { backgroundColor: 'transparent' }]}
              onPress={() => item.route && navigation?.navigate(item.route)}
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
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
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
});