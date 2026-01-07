import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function NewTaskModal({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState('Personal');
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  
  // Lấy màu từ theme
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const inputBg = useThemeColor({}, 'inputBackground');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

  // --- Date/Time Logic ---
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirmDate = (selectedDate: Date) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);

  const handleConfirmTime = (selectedTime: Date) => {
    setTime(selectedTime);
    hideTimePicker();
  };

  // Hàm định dạng hiển thị
  const formatDate = (d: Date | null) => d ? d.toLocaleDateString('vi-VN') : "dd/mm/yy";
  const formatTime = (t: Date | null) => t ? t.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : "hh:mm";

  // --- Logic Swipe down ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Chỉ bắt sự kiện nếu người dùng vuốt xuống (dy > 0)
        return gestureState.dy > 5;
      },
      onPanResponderRelease: (_, gestureState) => {
        // Nếu vuốt xuống hơn 50 pixel thì đóng modal
        if (gestureState.dy > 50) {
          onClose();
        }
      },
    })
  ).current;

  return (
    <ThemedView style={styles.container}>
      {/* Handle bar trên cùng của modal */}
      <View {...panResponder.panHandlers} style={styles.handleWrapper}>
        <View style={[styles.handle, { backgroundColor: borderColor }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: textColor }]}>New Task todo</Text>

        {/* Task Title */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Task Title</Text>
          <TextInput
            placeholder="Add task name"
            placeholderTextColor={secondaryTextColor}
            style={[styles.input, { backgroundColor: inputBg, color: textColor, borderWidth: 2, borderColor: borderColor }]}
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Category</Text>
          <View style={styles.categoryRow}>
            <CategoryItem 
              label="Personal" 
              icon="account" 
              isActive={category === 'Personal'} 
              onPress={() => setCategory('Personal')}
            />
            <CategoryItem 
              label="Homework" 
              icon="account-group" 
              isActive={category === 'Homework'} 
              onPress={() => setCategory('Homework')}
            />
            <TouchableOpacity style={[styles.addCategory, { backgroundColor: inputBg, borderWidth: 2, borderColor: borderColor }]}>
              <MaterialCommunityIcons name="account-plus-outline" size={20} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Description</Text>
          <TextInput
            placeholder="Add description"
            multiline
            numberOfLines={4}
            placeholderTextColor={secondaryTextColor}
            style={[styles.input, styles.textArea, { backgroundColor: inputBg, color: textColor, borderWidth: 2, borderColor: borderColor }]}
          />
        </View>

        {/* Date & Time Row */}
        <View style={styles.dateTimeRow}>
          <View style={[styles.section, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, { color: textColor }]}>Date</Text>
            <TouchableOpacity 
              onPress={showDatePicker}
              style={[styles.inputRow, { backgroundColor: inputBg, borderWidth: 1, borderColor: borderColor }]}
            >
              <MaterialCommunityIcons name="calendar-month-outline" size={18} color={primaryColor} />
              <Text style={{ color: date ? textColor : secondaryTextColor, marginLeft: 8 }}>{formatDate(date)}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.section, { flex: 1 }]}>
            <Text style={[styles.label, { color: textColor }]}>Time</Text>
            <TouchableOpacity 
              onPress={showTimePicker}
              style={[styles.inputRow, { backgroundColor: inputBg, borderWidth: 1, borderColor: borderColor }]}
            >
              <MaterialCommunityIcons name="clock-outline" size={18} color={primaryColor} />
              <Text style={{ color: time ? textColor : secondaryTextColor, marginLeft: 8 }}>{formatTime(time)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal Pickers */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
        />
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleConfirmTime}
          onCancel={hideTimePicker}
        />

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.btn, styles.btnCancel, { backgroundColor: inputBg, borderWidth: 2, borderColor: borderColor }]} onPress={onClose}>
            <MaterialCommunityIcons name="close-circle-outline" size={20} color={textColor} />
            <Text style={[styles.btnText, { color: textColor }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: primaryColor }]} onPress={() => {
            // Logic lưu task ở đây...
            onClose(); // Đóng modal sau khi tạo thành công
          }}>
            <MaterialCommunityIcons name="check-circle-outline" size={20} color="#fff" />
            <Text style={[styles.btnText, { color: '#fff' }]}>Create</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function CategoryItem({ label, icon, isActive, onPress }: any) {
  // Lấy màu từ theme
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const inputBg = useThemeColor({}, 'inputBackground');
  const borderColor = useThemeColor({}, 'border');

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        styles.categoryItem, 
        { 
          backgroundColor: isActive ? primaryColor : inputBg,
          borderWidth: 2,
          borderColor: isActive ? primaryColor : borderColor
        }
      ]}>
      <MaterialCommunityIcons 
        name={icon} 
        size={18} 
        color={isActive ? '#fff' : textColor} 
      />
      <Text style={[
        styles.categoryText, 
        { color: isActive ? '#fff' : textColor }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    width: '100%',
  },
  handleWrapper: {
    paddingVertical: 10,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
  },
  handle: {
    width: 150,
    height: 6,
    borderRadius: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  addCategory: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  btnCancel: {},
  btnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});