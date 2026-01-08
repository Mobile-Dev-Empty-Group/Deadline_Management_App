import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { deleteTask, getMe, getProjectAdapter, getProjects, getTasks, updateTask, type Project, type Task } from '@/services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Tạo calendar từ ngày thực tế (7 ngày từ hôm nay)
const generateCalendarDays = () => {
  const days = [];
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      id: date.toISOString().split('T')[0], // YYYY-MM-DD format
      date: date.getDate().toString(),
      day: dayNames[date.getDay()],
      month: monthNames[date.getMonth()],
      dateObj: date,
    });
  }
  return days;
};

const CALENDAR_DAYS = generateCalendarDays();

const FILTERS = ['All', 'To do', 'In Progress', 'Completed'];

// Map status từ API sang UI
const mapStatusToUI = (status: string): string => {
  const statusMap: Record<string, string> = {
    'TO_DO': 'To do',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'ACTIVE': 'In Progress',
  };
  return statusMap[status] || status;
};

// Map status từ UI sang API
const mapStatusToAPI = (status: string): string | undefined => {
  if (status === 'All') return undefined;
  const statusMap: Record<string, string> = {
    'To do': 'TO_DO',
    'In Progress': 'IN_PROGRESS',
    'Completed': 'COMPLETED',
  };
  return statusMap[status];
};

// Helper để format time từ startTime
const formatTime = (startTime: any): string => {
  if (!startTime) return '';
  try {
    const date = new Date(startTime);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
};

export default function MyTaskScreen() {
  // Chọn ngày đầu tiên (hôm nay) làm mặc định
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // null = hiển thị tất cả
  const [activeFilter, setActiveFilter] = useState('All');
  const navigation = useNavigation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user, activeFilter, selectedDate]);

  // Reload tasks khi màn hình được focus (khi quay lại từ màn hình khác)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadTasks();
        // Reload projects để đảm bảo project names được cập nhật
        const reloadProjects = async () => {
          try {
            const adapterData = await getProjectAdapter({ uid: user.id });
            if (adapterData && Array.isArray(adapterData) && adapterData.length > 0) {
              const projectsFromAdapter: Project[] = adapterData.map(item => ({
                id: item.label,
                name: item.value,
                userId: user.id,
              }));
              setProjects(projectsFromAdapter);
            }
          } catch (error) {
            // Ignore error
          }
        };
        reloadProjects();
      }
    }, [user])
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      const userData = await getMe();
      setUser(userData);

      // Load projects để map projectId -> project name
      // Dùng getProjectAdapter để đảm bảo có đầy đủ projects
      try {
        const adapterData = await getProjectAdapter({ uid: userData.id });
        if (adapterData && Array.isArray(adapterData) && adapterData.length > 0) {
          const projectsFromAdapter: Project[] = adapterData.map(item => ({
            id: item.label, // label contains projectId
            name: item.value, // value contains project name
            userId: userData.id,
          }));
          setProjects(projectsFromAdapter);
        } else {
          // Fallback to getProjects
          const projectsData = await getProjects({ uid: userData.id });
          setProjects(projectsData);
        }
      } catch (error) {
        // Fallback to getProjects
        const projectsData = await getProjects({ uid: userData.id });
        setProjects(projectsData);
      }
    } catch (error) {
      // Xử lý lỗi
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const status = mapStatusToAPI(activeFilter);
      const tasksData = await getTasks({
        uid: user.id,
        status,
      });
      setTasks(tasksData);
    } catch (error) {
      // Xử lý lỗi
    } finally {
      setIsLoading(false);
    }
  };

  // Helper để lấy project name từ projectId
  const getProjectName = (projectId: any): string => {
    if (!projectId) return 'No Project';
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  // Helper để check task có match với selected date không
  const matchesDate = (task: Task): boolean => {
    // Nếu selectedDate là null, hiển thị tất cả tasks
    if (!selectedDate) return true;

    if (!task.date) return true;

    try {
      // task.date có thể là string hoặc object, cần parse
      let taskDateStr = '';
      if (typeof task.date === 'string') {
        taskDateStr = task.date.split('T')[0]; // Lấy phần YYYY-MM-DD
      } else if (task.date && typeof task.date === 'object') {
        // Nếu là object, thử lấy ISO string
        const date = new Date(task.date);
        taskDateStr = date.toISOString().split('T')[0];
      }

      return taskDateStr === selectedDate;
    } catch {
      return true; // Nếu lỗi thì hiển thị tất cả
    }
  };

  const filteredTasks = tasks.filter(task => {
    // 1. Kiểm tra ngày
    const dateMatch = matchesDate(task);

    // 2. Kiểm tra trạng thái
    const statusMatch = activeFilter === 'All' || mapStatusToUI(task.status) === activeFilter;

    return dateMatch && statusMatch;
  }).sort((a, b) => {
    // Sắp xếp theo thời gian tăng dần
    // Ưu tiên startTime, nếu không có thì dùng date, nếu không có thì để sau
    const getSortTime = (task: Task): number => {
      if (task.startTime) {
        try {
          const date = typeof task.startTime === 'string' ? new Date(task.startTime) : new Date(task.startTime);
          return isNaN(date.getTime()) ? 0 : date.getTime();
        } catch {
          return 0;
        }
      }
      if (task.date) {
        try {
          const date = typeof task.date === 'string' ? new Date(task.date) : new Date(task.date);
          return isNaN(date.getTime()) ? 0 : date.getTime();
        } catch {
          return 0;
        }
      }
      return 0;
    };

    const timeA = getSortTime(a);
    const timeB = getSortTime(b);

    // Nếu cả hai đều không có thời gian, giữ nguyên thứ tự
    if (timeA === 0 && timeB === 0) return 0;
    // Nếu một trong hai không có thời gian, đặt nó xuống cuối
    if (timeA === 0) return 1;
    if (timeB === 0) return -1;
    // Sắp xếp tăng dần
    return timeA - timeB;
  });

  const handleEditTask = (taskId?: string) => {
    // Xử lý chỉnh sửa task
    if (taskId) {
      router.push({ pathname: '/edittask', params: { taskId } });
    } else {
    router.push('/edittask');
    }
  };

  const handleStatusChange = async (taskId: string, currentStatus: string) => {
    if (!user) return;

    // Xác định status tiếp theo
    let nextStatus: string;
    if (currentStatus === 'TO_DO') {
      nextStatus = 'IN_PROGRESS';
    } else if (currentStatus === 'IN_PROGRESS') {
      nextStatus = 'COMPLETED';
    } else {
      // COMPLETED -> TO_DO
      nextStatus = 'TO_DO';
    }

    // Optimistic update - update UI ngay lập tức
    const previousTasks = [...tasks];
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: nextStatus } : task
      )
    );

    try {
      // Gọi API update
      await updateTask({
        uid: user.id,
        id: taskId,
        status: nextStatus,
      });
      // Reload projects để đảm bảo project name được cập nhật
      try {
        const adapterData = await getProjectAdapter({ uid: user.id });
        if (adapterData && Array.isArray(adapterData) && adapterData.length > 0) {
          const projectsFromAdapter: Project[] = adapterData.map(item => ({
            id: item.label,
            name: item.value,
            userId: user.id,
          }));
          setProjects(projectsFromAdapter);
        }
      } catch (error) {
        // Ignore error, keep current projects
      }
    } catch (error) {
      // Revert nếu API fail
      setTasks(previousTasks);
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;

    // Confirm trước khi xóa
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Optimistic update - xóa task ngay trên UI
            const previousTasks = [...tasks];
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

            try {
              // Gọi API delete
              await deleteTask({
                uid: user.id,
                id: taskId,
              });
            } catch (error) {
              // Revert nếu API fail
              setTasks(previousTasks);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const navigateSetting = () => {
    router.push('/setting');
  }

  // Tìm tên ngày đang chọn để hiển thị thông báo khi trống
  const currentDayLabel = selectedDate ? CALENDAR_DAYS.find(d => d.id === selectedDate) : null;
  const dateString = currentDayLabel
    ? `${currentDayLabel.day}, ${currentDayLabel.date} ${currentDayLabel.month}`
    : "All Tasks";

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack(); // Quay lại màn hình trước đó nếu có trong stack
    } else {
      // Xử lý nếu không có màn hình để quay lại (ví dụ: thông báo thoát)
      console.log("No screen to go back");
    }
  };

  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const secTextColor = useThemeColor({}, 'textSecondary');
  const bgColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'inputBackground');
  const borderColor = useThemeColor({}, 'border');
  const inactiveFilterBg = useThemeColor({}, 'inputBackground');

  return (
    <ThemedView style={styles.container}>
      {/* Header Area */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.iconButton, { borderColor }]} onPress={handleBackPress}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>My Task</Text>
        <TouchableOpacity style={[styles.iconButton, { borderColor }]} onPress={navigateSetting}>
          <MaterialCommunityIcons name="cog-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Weekly Calendar */}
        <View style={styles.calendarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarScrollContent}
            snapToAlignment="start"
            decelerationRate="fast"
          >
            {CALENDAR_DAYS.map((item) => {
              const isActive = item.id === selectedDate;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    // Nếu đang chọn ngày này, ấn lại sẽ bỏ chọn (hiển thị tất cả)
                    if (isActive) {
                      setSelectedDate(null);
                    } else {
                      setSelectedDate(item.id);
                    }
                  }}
                  style={[
                    styles.dateCard,
                    { backgroundColor: isActive ? primaryColor : cardBg },
                    !isActive && { borderWidth: 1, borderColor }
                  ]}
                >
                  <Text style={[styles.dateMonth, { color: isActive ? '#fff' : secTextColor }]}>{item.month}</Text>
                  <Text style={[styles.dateNumber, { color: isActive ? '#fff' : textColor }]}>{item.date}</Text>
                  <Text style={[styles.dateDay, { color: isActive ? '#fff' : secTextColor }]}>{item.day}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 2. Filters dạng Carousel */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {FILTERS.map((filter) => {
              const isActive = filter === activeFilter;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={[
                    styles.filterItem,
                    {
                      backgroundColor: isActive ? primaryColor : cardBg,
                      borderWidth: isActive ? 0 : 1,
                      borderColor: borderColor
                    }
                  ]}
                >
                  <Text style={[
                    styles.filterText,
                    { color: isActive ? '#fff' : secTextColor }
                  ]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Task List - Hiển thị danh sách sau khi lọc */}
        <View style={[styles.taskList, { paddingHorizontal: 20 }]}>
          {isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={primaryColor} />
            </View>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projectName={getProjectName(task.projectId)}
                onPress={() => handleEditTask(task.id)}
                showDate={!selectedDate}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="calendar-blank" size={60} color={borderColor} />
              <Text style={[styles.emptyText, { color: secTextColor }]}>
                {selectedDate ? `No tasks for ${dateString}` : 'No tasks found'}
              </Text>
              {activeFilter !== 'All' && (
                <Text style={{ color: secTextColor, fontSize: 12 }}>
                  with status: {activeFilter}
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// Helper để format date từ task
const formatTaskDate = (date: any): string => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
};

// Sub-component for Task Card
function TaskCard({ task, projectName, onPress, showDate = false, onStatusChange, onDelete }: { task: Task; projectName: string; onPress?: () => void; showDate?: boolean; onStatusChange?: (taskId: string, currentStatus: string) => void; onDelete?: (taskId: string) => void }) {
  const textColor = useThemeColor({}, 'text');
  const secTextColor = useThemeColor({}, 'textSecondary');
  const cardBg = useThemeColor({}, 'inputBackground');

  const getStatusStyle = (status: string) => {
    const uiStatus = mapStatusToUI(status);
    switch (uiStatus) {
      case 'Completed':
        return { bg: '#DCFCE7', text: '#166534' };
      case 'In Progress':
        return { bg: '#FEF9C3', text: '#854d0e' };
      case 'To do':
        return { bg: '#DBEAFE', text: '#1e40af' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const statusStyle = getStatusStyle(task.status);
  const displayStatus = mapStatusToUI(task.status);
  const taskTime = task.startTime ? formatTime(task.startTime) : '';
  const taskDate = showDate ? formatTaskDate(task.date || task.startTime) : '';

  // Default icon và color (có thể cải thiện sau với category)
  const defaultIcon = 'check-circle-outline';
  const defaultColor = '#6188D9';

  const handleStatusToggle = (e: any) => {
    e.stopPropagation(); // Ngăn không cho trigger onPress của parent
    if (onStatusChange) {
      onStatusChange(task.id, task.status);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.taskCard, { backgroundColor: cardBg }]}>
      {/* Checkbox để toggle status */}
      <TouchableOpacity
        onPress={handleStatusToggle}
        style={[
          styles.statusCheckbox,
          {
            backgroundColor: task.status === 'COMPLETED' ? '#10B981' : 'transparent',
            borderColor: task.status === 'COMPLETED' ? '#10B981' : '#D1D5DB',
          }
        ]}
      >
        {task.status === 'COMPLETED' && (
          <MaterialCommunityIcons name="check" size={16} color="#fff" />
        )}
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <Text style={[styles.projectTitle, { color: secTextColor }]}>{projectName}</Text>
        <Text style={[styles.taskTitle, { color: textColor }]}>{task.title}</Text>
        {(taskTime || taskDate) && (
        <View style={styles.taskFooter}>
            {taskDate && (
              <>
                <MaterialCommunityIcons name="calendar-outline" size={14} color="#6188D9" />
                <Text style={[styles.timeText, { color: '#6188D9' }]}>{taskDate}</Text>
                {taskTime && <Text style={[styles.timeText, { color: '#6188D9', marginLeft: 8 }]}>•</Text>}
              </>
            )}
            {taskTime && (
              <>
          <MaterialCommunityIcons name="clock-outline" size={14} color="#6188D9" />
                <Text style={[styles.timeText, { color: '#6188D9' }]}>{taskTime}</Text>
              </>
            )}
        </View>
        )}
      </View>

      <View style={styles.taskRightSide}>
        <View style={[styles.iconWrapper, { backgroundColor: defaultColor + '20' }]}>
          <MaterialCommunityIcons name={defaultIcon} size={20} color={defaultColor} />
        </View>
        <TouchableOpacity
          onPress={handleStatusToggle}
          style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
        >
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {displayStatus}
          </Text>
        </TouchableOpacity>
        {onDelete && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            style={styles.deleteButton}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  calendarWrapper: {
    marginBottom: 25,
  },
  calendarScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterWrapper: {
    marginBottom: 25,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
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
  dateCard: {
    width: 60,
    height: 90,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dateMonth: { fontSize: 12 },
  dateNumber: { fontSize: 18, fontWeight: 'bold' },
  dateDay: { fontSize: 12 },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  filterItem: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  filterText: {
    fontWeight: '600',
  },
  taskList: {
    gap: 16,
  },
  taskCard: {
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    // Shadow cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Elevation cho Android
    elevation: 2,
  },
  statusCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContent: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskRightSide: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});