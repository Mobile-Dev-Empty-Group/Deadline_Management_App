import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EditTaskScreen() {
  const navigation = useNavigation();
  
  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const secTextColor = useThemeColor({}, 'textSecondary');
  const inputBg = useThemeColor({}, 'inputBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack(); // Quay lại màn hình trước đó nếu có trong stack
    } else {
      // Xử lý nếu không có màn hình để quay lại (ví dụ: thông báo thoát)
      console.log("No screen to go back");
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.iconButton, { borderColor }]} 
          onPress={() => handleBackPress()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Edit Task</Text>
        <TouchableOpacity style={[styles.iconButton, { borderColor }]}>
          <MaterialCommunityIcons name="cog-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Task Group Selector */}
        <TouchableOpacity style={[styles.inputGroup, { backgroundColor: inputBg }]}>
          <View style={styles.rowCenter}>
            <View style={[styles.iconSquare, { backgroundColor: '#FCE7F3' }]}>
              <MaterialCommunityIcons name="briefcase" size={20} color="#DB2777" />
            </View>
            <View style={styles.ml12}>
              <Text style={[styles.labelSmall, { color: secTextColor }]}>Task Group</Text>
              <Text style={[styles.valueText, { color: textColor }]}>Work</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-down" size={24} color={textColor} />
        </TouchableOpacity>

        {/* Project Name Input */}
        <View style={[styles.inputGroup, { backgroundColor: inputBg, flexDirection: 'column', alignItems: 'flex-start' }]}>
          <Text style={[styles.labelSmall, { color: secTextColor }]}>Project Name</Text>
          <TextInput 
            style={[styles.valueText, { color: textColor, width: '100%'}]}
            defaultValue="Grocery Shopping App"
          />
        </View>

        {/* Snooze every */}
        <View style={[styles.inputGroup, { backgroundColor: inputBg }]}>
          <Text style={[styles.valueText, { color: textColor }]}>Snooze every</Text>
          <TouchableOpacity style={styles.chipButton}>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#111827" />
            <Text style={styles.chipText}>Thursday</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={[styles.inputGroup, { backgroundColor: inputBg, flexDirection: 'column', alignItems: 'flex-start', height: 'auto', minHeight: 120 }]}>
          <Text style={[styles.labelSmall, { color: secTextColor }]}>Description</Text>
          <TextInput 
            multiline
            style={[styles.descriptionInput, { color: textColor }]}
            defaultValue="This application is designed for super shops. By using this application they can enlist all their products in one place and can deliver."
          />
        </View>

        {/* Start Date */}
        <TouchableOpacity style={[styles.inputGroup, { backgroundColor: inputBg }]}>
          <View style={styles.rowCenter}>
            <View style={[styles.iconSquare, { backgroundColor: '#E0E7FF' }]}>
              <MaterialCommunityIcons name="calendar-range" size={20} color="#4F46E5" />
            </View>
            <View style={styles.ml12}>
              <Text style={[styles.labelSmall, { color: secTextColor }]}>Start Date</Text>
              <Text style={[styles.valueText, { color: textColor }]}>01 May, 2022</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-down" size={24} color={textColor} />
        </TouchableOpacity>

        {/* End Date */}
        <TouchableOpacity style={[styles.inputGroup, { backgroundColor: inputBg }]}>
          <View style={styles.rowCenter}>
            <View style={[styles.iconSquare, { backgroundColor: '#E0E7FF' }]}>
              <MaterialCommunityIcons name="calendar-check" size={20} color="#4F46E5" />
            </View>
            <View style={styles.ml12}>
              <Text style={[styles.labelSmall, { color: secTextColor }]}>End Date</Text>
              <Text style={[styles.valueText, { color: textColor }]}>30 June, 2022</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-down" size={24} color={textColor} />
        </TouchableOpacity>

        {/* Bottom Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.btnAction, { backgroundColor: '#F1F5F9' }]}>
            <MaterialCommunityIcons name="close-circle-outline" size={20} color="#1E293B" />
            <Text style={[styles.btnText, { color: '#1E293B' }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnAction, { backgroundColor: '#1E293B' }]}>
            <MaterialCommunityIcons name="check-circle-outline" size={20} color="#FFF" />
            <Text style={[styles.btnText, { color: '#FFF' }]}>Done</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ThemedView>
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
    paddingBottom: 40,
    gap: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    height: 72,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSquare: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ml12: {
    marginLeft: 12,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '500',
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chipButton: {
    flexDirection: 'row-reverse',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    gap: 4,
  },
  chipText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
  },
  descriptionInput: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginTop: 8,
    textAlignVertical: 'top',
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  btnAction: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});