import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingScreen({ navigation }: any) {
  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const secTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  // States cho các nút Switch
  const [pushEnabled, setPushEnabled] = useState(false);
  const [darkEnabled, setDarkEnabled] = useState(false);

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
        <Text style={[styles.headerTitle, { color: textColor }]}>Setting</Text>
        <View style={{ width: 45 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: 'https://i.pravatar.cc/150?img=11' }} 
            style={styles.avatar} 
          />
          <Text style={[styles.userName, { color: textColor }]}>Thanh Tâm</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* Account Section */}
        <View style={styles.section}>
          <SettingRow 
            label="Change password" 
            iconRight="chevron-right" 
            onPress={() => {}} 
          />
          
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: textColor }]}>Push notifications</Text>
            <Switch
              trackColor={{ false: '#E2E8F0', true: primaryColor }}
              thumbColor={'#FFF'}
              onValueChange={() => setPushEnabled(prev => !prev)}
              value={pushEnabled}
            />
          </View>

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: textColor }]}>Dark mode</Text>
            <Switch
              trackColor={{ false: '#E2E8F0', true: primaryColor }}
              thumbColor={'#FFF'}
              onValueChange={() => setDarkEnabled(prev => !prev)}
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
            onPress={() => {}} 
          />
          
          <SettingRow 
            label="Terms and conditions" 
            iconRight="chevron-right" 
            onPress={() => {}} 
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
});