import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { createProject, createTask, getCategoryAdapter, getMe, getProjectAdapter, type Project, type TaskCategory } from '@/services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function NewTaskModal({ onClose, onTaskCreated }: { onClose: () => void; onTaskCreated?: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>(['Personal', 'Homework']); // Default categories
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadCategories();
      loadProjects();
    }
  }, [user]);

  const loadUser = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      // Xử lý lỗi
    }
  };

  const loadCategories = async () => {
    if (!user) return;

    try {
      const adapterData = await getCategoryAdapter({
        uid: user.id,
      });

      // Extract category names from adapter (value field contains category name)
      if (adapterData && Array.isArray(adapterData) && adapterData.length > 0) {
        const categories = adapterData
          .map(item => item?.value)
          .filter((value): value is string => Boolean(value) && typeof value === 'string');

        if (categories.length > 0) {
          setAvailableCategories(categories);
          // Set first category as default if current is default
          if (category === 'Personal' || category === 'Homework') {
            setCategory(categories[0]);
          }
        }
      }
    } catch (error) {
      // Nếu lỗi, giữ nguyên default categories
      console.log('Failed to load categories, using defaults:', error);
    }
  };

  const loadProjects = async () => {
    if (!user) return;

    try {
      const adapterData = await getProjectAdapter({
        uid: user.id,
      });

      // Convert adapter items to Project objects
      if (adapterData && Array.isArray(adapterData) && adapterData.length > 0) {
        const projects: Project[] = adapterData.map(item => ({
          id: item.label, // label contains projectId
          name: item.value, // value contains project name
          userId: user.id,
        }));
        setAvailableProjects(projects);
      }
    } catch (error) {
      console.log('Failed to load projects:', error);
    }
  };
  
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

  // Hàm tạo task
  const handleCreateTask = async () => {
    if (!title.trim() || !user) return;

    try {
      setIsLoading(true);

      // Tạo date và time strings
      let dateStr: string | undefined;
      let startTimeStr: string | undefined;
      let endTimeStr: string | undefined;

      if (date) {
        dateStr = date.toISOString();

        if (time) {
          // Combine date và time
          const combinedDateTime = new Date(date);
          combinedDateTime.setHours(time.getHours());
          combinedDateTime.setMinutes(time.getMinutes());
          startTimeStr = combinedDateTime.toISOString();

          // End time có thể là start time + 1 hour (hoặc để user chọn sau)
          const endTime = new Date(combinedDateTime);
          endTime.setHours(endTime.getHours() + 1);
          endTimeStr = endTime.toISOString();
        }
      } else if (time) {
        // Nếu chỉ có time, dùng hôm nay
        const today = new Date();
        today.setHours(time.getHours());
        today.setMinutes(time.getMinutes());
        startTimeStr = today.toISOString();
        dateStr = today.toISOString();
      }

      // Tạo category object
      const categoryObj: TaskCategory = {
        new: true,
        name: category,
        icon: 'briefcase', // Default icon
      };

      await createTask({
        uid: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        status: 'TO_DO',
        date: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        category: categoryObj,
        projectId: selectedProject?.id,
      });

      // Gọi callback để reload tasks
      if (onTaskCreated) {
        onTaskCreated();
      }

      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { backgroundColor: inputBg, color: textColor, borderWidth: 2, borderColor: borderColor }]}
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Category</Text>
          <View style={styles.categoryRow}>
            {(() => {
              // Combine availableCategories and customCategories, remove duplicates
              const allCategories = [...new Set([...availableCategories, ...customCategories])];
              return allCategories.map((cat, index) => (
            <CategoryItem 
                  key={`category-${cat}-${index}`}
                  label={cat}
                  icon={cat === 'Personal' ? 'account' : cat === 'Homework' ? 'account-group' : 'briefcase'}
                  isActive={category === cat}
                  onPress={() => setCategory(cat)}
                />
              ));
            })()}
            <TouchableOpacity
              style={[styles.addCategory, { backgroundColor: inputBg, borderWidth: 2, borderColor: borderColor }]}
              onPress={() => setShowCategoryModal(true)}
            >
              <MaterialCommunityIcons name="plus" size={20} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Project */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor }]}>Project</Text>
          <View style={styles.categoryRow}>
            {availableProjects.map((proj) => (
            <CategoryItem 
                key={`project-${proj.id}`}
                label={proj.name}
                icon="briefcase"
                isActive={selectedProject?.id === proj.id}
                onPress={() => setSelectedProject(proj)}
            />
            ))}
            <TouchableOpacity
              style={[styles.addCategory, { backgroundColor: inputBg, borderWidth: 2, borderColor: borderColor }]}
              onPress={() => setShowProjectModal(true)}
            >
              <MaterialCommunityIcons name="plus" size={20} color={textColor} />
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
            value={description}
            onChangeText={setDescription}
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

        {/* Category Picker Modal */}
        {showCategoryModal && (
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
              <View style={[styles.modalContent, { backgroundColor: inputBg }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: textColor }]}>Category Name</Text>
                  <TouchableOpacity onPress={() => {
                    setShowCategoryModal(false);
                    setNewCategoryName('');
                  }}>
                    <MaterialCommunityIcons name="close" size={24} color={textColor} />
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Enter category name"
                  placeholderTextColor={secondaryTextColor}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  style={[styles.input, { backgroundColor: '#fff', color: textColor, borderWidth: 1, borderColor: borderColor, marginBottom: 20 }]}
                  autoFocus
                />

                <TouchableOpacity
                  style={[styles.createCategoryBtn, { backgroundColor: primaryColor, opacity: newCategoryName.trim() ? 1 : 0.5 }]}
                  onPress={() => {
                    if (newCategoryName.trim()) {
                      const newCat = newCategoryName.trim();
                      setCategory(newCat);
                      // Thêm vào danh sách custom categories nếu chưa có trong availableCategories
                      if (!availableCategories.includes(newCat) && !customCategories.includes(newCat)) {
                        setCustomCategories([...customCategories, newCat]);
                      }
                      setShowCategoryModal(false);
                      setNewCategoryName('');
                    }
                  }}
                  disabled={!newCategoryName.trim()}
                >
                  <Text style={styles.createCategoryBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        )}

        {/* Project Picker Modal */}
        {showProjectModal && (
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
              <View style={[styles.modalContent, { backgroundColor: inputBg }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: textColor }]}>Project Name</Text>
                  <TouchableOpacity onPress={() => {
                    setShowProjectModal(false);
                    setNewProjectName('');
                  }}>
                    <MaterialCommunityIcons name="close" size={24} color={textColor} />
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Enter project name"
                  placeholderTextColor={secondaryTextColor}
                  value={newProjectName}
                  onChangeText={setNewProjectName}
                  style={[styles.input, { backgroundColor: '#fff', color: textColor, borderWidth: 1, borderColor: borderColor, marginBottom: 20 }]}
                  autoFocus
                />

                <TouchableOpacity
                  style={[styles.createCategoryBtn, { backgroundColor: primaryColor, opacity: newProjectName.trim() ? 1 : 0.5 }]}
                  onPress={async () => {
                    if (newProjectName.trim() && user) {
                      try {
                        const newProj = await createProject({ uid: user.id, name: newProjectName.trim() });
                        setAvailableProjects(prev => [...prev, newProj]);
                        setSelectedProject(newProj);
                        setShowProjectModal(false);
                        setNewProjectName('');
                      } catch (error) {
                        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create project.');
                      }
                    }
                  }}
                  disabled={!newProjectName.trim() || !user}
                >
                  <Text style={styles.createCategoryBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, styles.btnCancel, { backgroundColor: inputBg, borderWidth: 2, borderColor: borderColor }]}
            onPress={onClose}
            disabled={isLoading}
          >
            <MaterialCommunityIcons name="close-circle-outline" size={20} color={textColor} />
            <Text style={[styles.btnText, { color: textColor }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.btn,
              { backgroundColor: primaryColor },
              (!title || isLoading) && { opacity: 0.6 }
            ]}
            onPress={handleCreateTask}
            disabled={!title || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
            <MaterialCommunityIcons name="check-circle-outline" size={20} color="#fff" />
            <Text style={[styles.btnText, { color: '#fff' }]}>Create</Text>
              </>
            )}
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  createCategoryBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  createCategoryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});