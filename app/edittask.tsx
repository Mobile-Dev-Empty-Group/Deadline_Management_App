import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { createProject, getMe, getProjectAdapter, getProjects, getTasks, updateTask, type Project, type Task, type TaskCategory } from '@/services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function EditTaskScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams<{ taskId?: string }>();
  
  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const secTextColor = useThemeColor({}, 'textSecondary');
  const inputBg = useThemeColor({}, 'inputBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  // State
  const [task, setTask] = useState<Task | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [category, setCategory] = useState<TaskCategory | null>(null);
  const [status, setStatus] = useState('TO_DO');
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<number>(0);
  const [breakTime, setBreakTime] = useState<number>(0);
  const [repeatDay, setRepeatDay] = useState<string[]>([]);
  const [showRepeatDayPicker, setShowRepeatDayPicker] = useState(false);

  // Date/Time pickers
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.taskId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const userData = await getMe();
      setUser(userData);

      // Load projects
      const projectsData = await getProjects({ uid: userData.id });
      setProjects(projectsData);

      // Load projects from adapter
      try {
        const adapterData = await getProjectAdapter({ uid: userData.id });
        if (adapterData && Array.isArray(adapterData) && adapterData.length > 0) {
          const projectsFromAdapter: Project[] = adapterData.map(item => ({
            id: item.label, // label contains projectId
            name: item.value, // value contains project name
            userId: userData.id,
          }));
          setAvailableProjects(projectsFromAdapter);
        } else {
          // Fallback to projects from getProjects
          setAvailableProjects(projectsData);
        }
      } catch (error) {
        // Fallback to projects from getProjects
        setAvailableProjects(projectsData);
      }

      // Load task nếu có taskId
      if (params.taskId) {
        const tasksData = await getTasks({ uid: userData.id, id: params.taskId });
        if (tasksData.length > 0) {
          const taskData = tasksData[0];
          setTask(taskData);

          // Populate form fields
          setTitle(taskData.title || '');
          setDescription(typeof taskData.description === 'string' ? taskData.description : '');
          setStatus(taskData.status || 'TO_DO');
          setProgress(taskData.progress || 0);
          setIsStarred(taskData.isStarred || false);
          setDuration(taskData.duration || 0);
          setBreakTime(taskData.breakTime || 0);
          // Parse repeatDay - có thể là string hoặc array
          if (Array.isArray(taskData.repeatDay)) {
            setRepeatDay(taskData.repeatDay);
          } else if (typeof taskData.repeatDay === 'string' && taskData.repeatDay) {
            setRepeatDay([taskData.repeatDay]);
          } else {
            setRepeatDay([]);
          }

          // Parse date
          if (taskData.date) {
            try {
              const dateObj = typeof taskData.date === 'string' ? new Date(taskData.date) : new Date(taskData.date);
              if (!isNaN(dateObj.getTime())) {
                setDate(dateObj);
              }
            } catch { }
          }

          // Parse startTime
          if (taskData.startTime) {
            try {
              const timeObj = typeof taskData.startTime === 'string' ? new Date(taskData.startTime) : new Date(taskData.startTime);
              if (!isNaN(timeObj.getTime())) {
                setStartTime(timeObj);
              }
            } catch { }
          }

          // Parse endTime
          if (taskData.endTime) {
            try {
              const timeObj = typeof taskData.endTime === 'string' ? new Date(taskData.endTime) : new Date(taskData.endTime);
              if (!isNaN(timeObj.getTime())) {
                setEndTime(timeObj);
              }
            } catch { }
          }

          // Set project - cần set sau khi projects đã load
          if (taskData.projectId && projectsData.length > 0) {
            const project = projectsData.find(p => p.id === taskData.projectId);
            if (project) {
              setSelectedProject(project);
            }
          }

          // Set category (có thể cần load từ categoryId)
          // Tạm thời để null, có thể cải thiện sau
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load task data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !task) return;

    try {
      setIsSaving(true);

      // Build update request
      const updateData: any = {
        uid: user.id,
        id: task.id,
      };

      if (title.trim()) updateData.title = title.trim();
      if (description.trim()) updateData.description = description.trim();
      if (status) updateData.status = status;
      if (progress !== undefined) updateData.progress = progress;
      updateData.isStarred = isStarred;
      if (duration !== undefined) updateData.duration = duration;
      if (breakTime !== undefined) updateData.breakTime = breakTime;
      if (repeatDay && repeatDay.length > 0) {
        // Gửi dạng string nếu chỉ có 1 ngày, array nếu nhiều ngày
        updateData.repeatDay = repeatDay.length === 1 ? repeatDay[0] : repeatDay.join(',');
      }

      // Date
      if (date) {
        updateData.date = date.toISOString();
      }

      // Start time
      if (startTime) {
        updateData.startTime = startTime.toISOString();
      }

      // End time
      if (endTime) {
        updateData.endTime = endTime.toISOString();
      }

      // Project
      if (selectedProject) {
        updateData.projectId = selectedProject.id;
      }

      // Category
      if (category) {
        updateData.category = category;
      }

      await updateTask(updateData);
      Alert.alert('Success', 'Task updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.back();
    }
  };

  // Format helpers
  const formatDate = (d: Date | null) => {
    if (!d) return 'Select date';
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (t: Date | null) => {
    if (!t) return 'Select time';
    return t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.iconButton, { borderColor }]}
            onPress={handleBackPress}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Edit Task</Text>
          <View style={[styles.iconButton, { borderColor, opacity: 0 }]} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.iconButton, { borderColor }]} 
          onPress={handleBackPress}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Edit Task</Text>
        <TouchableOpacity style={[styles.iconButton, { borderColor }]}>
          <MaterialCommunityIcons name="cog-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        
          {/* Title Input */}
          <View style={[styles.inputGroup, { backgroundColor: inputBg, flexDirection: 'column', alignItems: 'flex-start' }]}>
            <Text style={[styles.labelSmall, { color: secTextColor }]}>Task Title</Text>
            <TextInput
              style={[styles.valueText, { color: textColor, width: '100%' }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor={secTextColor}
            />
          </View>

          {/* Project Name Selector */}
          <TouchableOpacity
            style={[styles.inputGroup, { backgroundColor: inputBg }]}
            onPress={() => setShowProjectModal(true)}
          >
          <View style={styles.rowCenter}>
            <View style={[styles.iconSquare, { backgroundColor: '#FCE7F3' }]}>
              <MaterialCommunityIcons name="briefcase" size={20} color="#DB2777" />
            </View>
            <View style={styles.ml12}>
                <Text style={[styles.labelSmall, { color: secTextColor }]}>Project</Text>
                <Text style={[styles.valueText, { color: textColor }]}>
                  {selectedProject?.name || 'No Project'}
                </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-down" size={24} color={textColor} />
        </TouchableOpacity>

          {/* Project Picker Modal */}
          {showProjectModal && (
            <View style={styles.modalOverlay}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
              >
                <View style={[styles.modalContent, { backgroundColor: inputBg }]}>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: textColor }]}>Select Project</Text>
                    <TouchableOpacity onPress={() => {
                      setShowProjectModal(false);
                      setNewProjectName('');
                    }}>
                      <MaterialCommunityIcons name="close" size={24} color={textColor} />
                    </TouchableOpacity>
        </View>

                  {/* Project List */}
                  <ScrollView style={styles.projectList} showsVerticalScrollIndicator={false}>
                    {/* Option: No Project */}
                    <TouchableOpacity
                      style={[
                        styles.projectItem,
                        { backgroundColor: !selectedProject ? primaryColor : 'transparent', borderColor: borderColor }
                      ]}
                      onPress={() => {
                        setSelectedProject(null);
                        setShowProjectModal(false);
                      }}
                    >
                      <Text style={[styles.projectItemText, { color: !selectedProject ? '#fff' : textColor }]}>
                        No Project
                      </Text>
                      {!selectedProject && (
                        <MaterialCommunityIcons name="check" size={20} color="#fff" />
                      )}
                    </TouchableOpacity>

                    {/* Available Projects */}
                    {availableProjects.map((proj) => (
                      <TouchableOpacity
                        key={proj.id}
                        style={[
                          styles.projectItem,
                          { backgroundColor: selectedProject?.id === proj.id ? primaryColor : 'transparent', borderColor: borderColor }
                        ]}
                        onPress={() => {
                          setSelectedProject(proj);
                          setShowProjectModal(false);
                        }}
                      >
                        <Text style={[styles.projectItemText, { color: selectedProject?.id === proj.id ? '#fff' : textColor }]}>
                          {proj.name}
                        </Text>
                        {selectedProject?.id === proj.id && (
                          <MaterialCommunityIcons name="check" size={20} color="#fff" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Add New Project Section */}
                  <View style={styles.addProjectSection}>
                    <View style={styles.addProjectDivider} />
                    <TextInput
                      placeholder="Enter project name"
                      placeholderTextColor={secTextColor}
                      value={newProjectName}
                      onChangeText={setNewProjectName}
                      style={[styles.valueText, { backgroundColor: '#fff', color: textColor, borderWidth: 1, borderColor: borderColor, padding: 12, borderRadius: 12, marginBottom: 12 }]}
                    />
                    <TouchableOpacity
                      style={[styles.createCategoryBtn, { backgroundColor: primaryColor, opacity: newProjectName.trim() ? 1 : 0.5 }]}
                      onPress={async () => {
                        if (newProjectName.trim() && user) {
                          try {
                            // Tạo project mới
                            const newProject = await createProject({
                              uid: user.id,
                              name: newProjectName.trim(),
                            });
                            setSelectedProject(newProject);
                            // Reload projects để cập nhật danh sách
                            const projectsData = await getProjects({ uid: user.id });
                            setProjects(projectsData);
                            const adapterData = await getProjectAdapter({ uid: user.id });
                            if (adapterData && Array.isArray(adapterData) && adapterData.length > 0) {
                              const projectsFromAdapter: Project[] = adapterData.map(item => ({
                                id: item.label,
                                name: item.value,
                                userId: user.id,
                              }));
                              setAvailableProjects(projectsFromAdapter);
                            }
                            setNewProjectName('');
                            setShowProjectModal(false);
                          } catch (error) {
                            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create project');
                          }
                        }
                      }}
                      disabled={!newProjectName.trim()}
                    >
                      <Text style={styles.createCategoryBtnText}>Add Project</Text>
          </TouchableOpacity>
        </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          )}

        {/* Description */}
        <View style={[styles.inputGroup, { backgroundColor: inputBg, flexDirection: 'column', alignItems: 'flex-start', height: 'auto', minHeight: 120 }]}>
          <Text style={[styles.labelSmall, { color: secTextColor }]}>Description</Text>
          <TextInput 
            multiline
            style={[styles.descriptionInput, { color: textColor }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              placeholderTextColor={secTextColor}
          />
        </View>

        {/* Start Date */}
          <TouchableOpacity
            style={[styles.inputGroup, { backgroundColor: inputBg }]}
            onPress={() => setDatePickerVisibility(true)}
          >
          <View style={styles.rowCenter}>
            <View style={[styles.iconSquare, { backgroundColor: '#E0E7FF' }]}>
              <MaterialCommunityIcons name="calendar-range" size={20} color="#4F46E5" />
            </View>
            <View style={styles.ml12}>
                <Text style={[styles.labelSmall, { color: secTextColor }]}>Date</Text>
                <Text style={[styles.valueText, { color: textColor }]}>{formatDate(date)}</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-down" size={24} color={textColor} />
          </TouchableOpacity>

          {/* Start Time */}
          <TouchableOpacity
            style={[styles.inputGroup, { backgroundColor: inputBg }]}
            onPress={() => setStartTimePickerVisibility(true)}
          >
            <View style={styles.rowCenter}>
              <View style={[styles.iconSquare, { backgroundColor: '#E0E7FF' }]}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#4F46E5" />
              </View>
              <View style={styles.ml12}>
                <Text style={[styles.labelSmall, { color: secTextColor }]}>Start Time</Text>
                <Text style={[styles.valueText, { color: textColor }]}>{formatTime(startTime)}</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-down" size={24} color={textColor} />
          </TouchableOpacity>

          {/* End Time */}
          <TouchableOpacity
            style={[styles.inputGroup, { backgroundColor: inputBg }]}
            onPress={() => setEndTimePickerVisibility(true)}
          >
            <View style={styles.rowCenter}>
              <View style={[styles.iconSquare, { backgroundColor: '#E0E7FF' }]}>
                <MaterialCommunityIcons name="clock-check-outline" size={20} color="#4F46E5" />
              </View>
              <View style={styles.ml12}>
                <Text style={[styles.labelSmall, { color: secTextColor }]}>End Time</Text>
                <Text style={[styles.valueText, { color: textColor }]}>{formatTime(endTime)}</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-down" size={24} color={textColor} />
        </TouchableOpacity>

          {/* Progress */}
          <View style={[styles.inputGroup, { backgroundColor: inputBg, flexDirection: 'column', alignItems: 'flex-start', height: 'auto', paddingVertical: 16 }]}>
            <Text style={[styles.labelSmall, { color: secTextColor, marginBottom: 8 }]}>Progress</Text>
            <View style={styles.rowCenter}>
              <TextInput
                style={[styles.valueText, { color: textColor, width: 80, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: borderColor, paddingBottom: 4 }]}
                value={progress.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  setProgress(Math.min(100, Math.max(0, num)));
                }}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={secTextColor}
              />
              <Text style={[styles.valueText, { color: textColor, marginLeft: 8 }]}>%</Text>
            </View>
            <View style={[styles.progressBar, { marginTop: 12 }]}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: primaryColor }]} />
            </View>
          </View>

          {/* Duration */}
          <View style={[styles.inputGroup, { backgroundColor: inputBg }]}>
            <View style={styles.rowCenter}>
              <View style={[styles.iconSquare, { backgroundColor: '#E0E7FF' }]}>
                <MaterialCommunityIcons name="timer-outline" size={20} color="#4F46E5" />
              </View>
              <View style={styles.ml12}>
                <Text style={[styles.labelSmall, { color: secTextColor }]}>Duration</Text>
                <TextInput
                  style={[styles.valueText, { color: textColor }]}
                  value={duration.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    setDuration(num);
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={secTextColor}
                />
              </View>
            </View>
            <Text style={[styles.labelSmall, { color: secTextColor }]}>minutes</Text>
          </View>

          {/* Break Time */}
          <View style={[styles.inputGroup, { backgroundColor: inputBg }]}>
            <View style={styles.rowCenter}>
              <View style={[styles.iconSquare, { backgroundColor: '#E0E7FF' }]}>
                <MaterialCommunityIcons name="coffee-outline" size={20} color="#4F46E5" />
              </View>
              <View style={styles.ml12}>
                <Text style={[styles.labelSmall, { color: secTextColor }]}>Break Time</Text>
                <TextInput
                  style={[styles.valueText, { color: textColor }]}
                  value={breakTime.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    setBreakTime(num);
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={secTextColor}
                />
              </View>
            </View>
            <Text style={[styles.labelSmall, { color: secTextColor }]}>minutes</Text>
          </View>

          {/* Repeat Day */}
          <TouchableOpacity
            style={[styles.inputGroup, { backgroundColor: inputBg }]}
            onPress={() => setShowRepeatDayPicker(true)}
          >
          <View style={styles.rowCenter}>
            <View style={[styles.iconSquare, { backgroundColor: '#E0E7FF' }]}>
                <MaterialCommunityIcons name="repeat" size={20} color="#4F46E5" />
            </View>
            <View style={styles.ml12}>
                <Text style={[styles.labelSmall, { color: secTextColor }]}>Repeat Day</Text>
                <Text style={[styles.valueText, { color: textColor }]}>
                  {repeatDay.length > 0 ? repeatDay.join(', ') : 'None'}
                </Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-down" size={24} color={textColor} />
        </TouchableOpacity>

          {/* Repeat Day Picker Modal */}
          {showRepeatDayPicker && (
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: inputBg }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: textColor }]}>Select Repeat Days</Text>
                  <TouchableOpacity onPress={() => setShowRepeatDayPicker(false)}>
                    <MaterialCommunityIcons name="close" size={24} color={textColor} />
                  </TouchableOpacity>
                </View>
                <View style={styles.repeatDayList}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const isSelected = repeatDay.includes(day);
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.repeatDayItem,
                          { backgroundColor: isSelected ? primaryColor : 'transparent', borderColor: borderColor }
                        ]}
                        onPress={() => {
                          if (isSelected) {
                            setRepeatDay(repeatDay.filter(d => d !== day));
                          } else {
                            setRepeatDay([...repeatDay, day]);
                          }
                        }}
                      >
                        <Text style={[styles.repeatDayText, { color: isSelected ? '#FFF' : textColor }]}>
                          {day}
                        </Text>
                        {isSelected && (
                          <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#F1F5F9' }]}
                    onPress={() => {
                      setRepeatDay([]);
                      setShowRepeatDayPicker(false);
                    }}
                  >
                    <Text style={[styles.modalButtonText, { color: '#1E293B' }]}>Clear All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: primaryColor }]}
                    onPress={() => setShowRepeatDayPicker(false)}
                  >
                    <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Date/Time Pickers */}
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={(selectedDate) => {
              setDate(selectedDate);
              setDatePickerVisibility(false);
            }}
            onCancel={() => setDatePickerVisibility(false)}
          />
          <DateTimePickerModal
            isVisible={isStartTimePickerVisible}
            mode="time"
            onConfirm={(selectedTime) => {
              setStartTime(selectedTime);
              setStartTimePickerVisibility(false);
            }}
            onCancel={() => setStartTimePickerVisibility(false)}
          />
          <DateTimePickerModal
            isVisible={isEndTimePickerVisible}
            mode="time"
            onConfirm={(selectedTime) => {
              setEndTime(selectedTime);
              setEndTimePickerVisibility(false);
            }}
            onCancel={() => setEndTimePickerVisibility(false)}
          />

        {/* Bottom Buttons */}
        <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btnAction, { backgroundColor: '#F1F5F9' }]}
              onPress={handleBackPress}
              disabled={isSaving}
            >
            <MaterialCommunityIcons name="close-circle-outline" size={20} color="#1E293B" />
            <Text style={[styles.btnText, { color: '#1E293B' }]}>Cancel</Text>
          </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnAction, { backgroundColor: '#1E293B', opacity: isSaving ? 0.6 : 1 }]}
              onPress={handleSave}
              disabled={isSaving || !task}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
            <MaterialCommunityIcons name="check-circle-outline" size={20} color="#FFF" />
            <Text style={[styles.btnText, { color: '#FFF' }]}>Done</Text>
                </>
              )}
          </TouchableOpacity>
        </View>

      </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
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
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
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
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  repeatDayList: {
    gap: 12,
    marginBottom: 20,
  },
  repeatDayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  repeatDayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  createCategoryBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createCategoryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  projectList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  projectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  projectItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addProjectSection: {
    marginTop: 8,
  },
  addProjectDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
});