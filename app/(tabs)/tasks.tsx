import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// Mock Data
const CALENDAR_DAYS = [
  { id: '1', date: '23', day: 'Fri', month: 'May' },
  { id: '2', date: '24', day: 'Sat', month: 'May' },
  { id: '3', date: '25', day: 'Sun', month: 'May' },
  { id: '4', date: '26', day: 'Mon', month: 'May' },
  { id: '5', date: '27', day: 'Tue', month: 'May' },
  { id: '6', date: '28', day: 'Wed', month: 'May' },
  { id: '7', date: '29', day: 'Thu', month: 'May' },
  { id: '8', date: '30', day: 'Fri', month: 'May' },
];

const FILTERS = ['All', 'To do', 'In Progress', 'Completed'];

const TASKS = [
  {
    id: '1',
    project: 'Grocery shopping app design',
    title: 'Market Research',
    time: '10:00 AM',
    dayId: '1',
    status: 'Completed',
    icon: 'shopping',
    color: '#F472B6',
  },
  {
    id: '2',
    project: 'Grocery shopping app design',
    title: 'Competitive Analysis',
    time: '12:00 PM',
    dayId: '1',
    status: 'In Progress',
    icon: 'shopping',
    color: '#F472B6',
  },
  {
    id: '3',
    project: 'Uber Eats redesign challenge',
    title: 'Create Low-fidelity Wireframe',
    time: '07:00 PM',
    dayId: '2',
    status: 'To do',
    icon: 'account',
    color: '#818CF8',
  },
  {
    id: '4',
    project: 'Uber Eats redesign challenge',
    title: 'User Flow Diagram',
    time: '09:00 PM',
    dayId: '2',
    status: 'To do',
    icon: 'account',
    color: '#818CF8',
  },
  {
    id: '5',
    project: 'Fitness app UI design',
    title: 'Moodboard Creation',
    time: '11:00 AM',
    dayId: '3',
    status: 'Completed',
    icon: 'heart-pulse',
    color: '#34D399',
  },  
  {
    id: '6',
    project: 'Fitness app UI design',
    title: 'Color Palette Selection',
    time: '01:00 PM',
    dayId: '3',
    status: 'In Progress',
    icon: 'heart-pulse',
    color: '#34D399',
  },
];

export default function MyTaskScreen() {
  const [selectedDate, setSelectedDate] = useState('3');
  const [activeFilter, setActiveFilter] = useState('All');
  const navigation = useNavigation();

  const filteredTasks = TASKS.filter(task => {
    // 1. Kiểm tra ngày (so khớp ID ngày)
    const matchesDate = task.dayId === selectedDate;
    
    // 2. Kiểm tra trạng thái
    const matchesStatus = activeFilter === 'All' || task.status === activeFilter;

    return matchesDate && matchesStatus;
  });

  const handleEditTask = () => {
    // Xử lý chỉnh sửa task
    router.push('/edittask');  
  };

  const navigateSetting = () => {
    router.push('/setting');  
  }

  // Tìm tên ngày đang chọn để hiển thị thông báo khi trống
  const currentDayLabel = CALENDAR_DAYS.find(d => d.id === selectedDate);
  const dateString = currentDayLabel 
    ? `${currentDayLabel.day}, ${currentDayLabel.date} ${currentDayLabel.month}` 
    : "";

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
                  onPress={() => setSelectedDate(item.id)}
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
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onPress={handleEditTask} />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="calendar-blank" size={60} color={borderColor} />
              <Text style={[styles.emptyText, { color: secTextColor }]}>
                No tasks for {dateString}
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

// Sub-component for Task Card
function TaskCard({ task, onPress }: { task: any; onPress?: () => void }) {
  const textColor = useThemeColor({}, 'text');
  const secTextColor = useThemeColor({}, 'textSecondary');
  const cardBg = useThemeColor({}, 'inputBackground');

  const getStatusStyle = (status: string) => {
    switch (status) {
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

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.taskCard, { backgroundColor: cardBg }]}>
      <View style={styles.taskContent}>
        <Text style={[styles.projectTitle, { color: secTextColor }]}>{task.project}</Text>
        <Text style={[styles.taskTitle, { color: textColor }]}>{task.title}</Text>
        <View style={styles.taskFooter}>
          <MaterialCommunityIcons name="clock-outline" size={14} color="#6188D9" />
          <Text style={[styles.timeText, { color: '#6188D9' }]}>{task.time}</Text>
        </View>
      </View>
      
      <View style={styles.taskRightSide}>
        <View style={[styles.iconWrapper, { backgroundColor: task.color + '20' }]}>
          <MaterialCommunityIcons name={task.icon} size={20} color={task.color} />
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {task.status}
          </Text>
        </View>
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
    // Shadow cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Elevation cho Android
    elevation: 2,
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