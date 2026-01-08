import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DailyChallengeCard } from '@/components/home/DailyChallengeCard';
import { FeaturedTaskCard } from '@/components/home/FeaturedTaskCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import NewTaskModal from '@/components/home/NewTaskModal';
import { QuickActionRow } from '@/components/home/QuickActionRow';
import { TabSelector } from '@/components/home/TabSelector';
import { TaskList } from '@/components/home/TaskList';
import { challenge, homeTabs, quickActions } from '@/components/home/data';
import type { FeaturedTask, HomeTabId, Task as HomeTask } from '@/components/home/types';
import { getMe, getNotifications, getProjects, getTasks, updateTask, type Task as ApiTask, type Notification, type User } from '@/services/api';

// Helper để format date
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

// Map API Task sang Home Task format
const mapApiTaskToHomeTask = (apiTask: ApiTask, projectName: string): HomeTask => {
  const timeStr = apiTask.startTime
    ? new Date(apiTask.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '';

  const dateStr = formatTaskDate(apiTask.date || apiTask.startTime);
  const timeWithDate = dateStr ? `${dateStr} • ${timeStr}` : timeStr;

  return {
    id: apiTask.id,
    title: apiTask.title,
    time: timeWithDate,
    completed: apiTask.status === 'COMPLETED',
    tag: projectName !== 'No Project' ? projectName : undefined,
    tagColor: '#C7D2FE', // Default color
  };
};

export default function HomeTab() {
  const [activeTab, setActiveTab] = useState<HomeTabId>('inProgress');
  const router = useRouter();
  const [tasks, setTasks] = useState<HomeTask[]>([]);
  const [apiTasks, setApiTasks] = useState<ApiTask[]>([]); // Lưu API tasks để có thể lấy taskId
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [morningTask, setMorningTask] = useState<ApiTask | null>(null);
  const [newTaskModalVisible, setNewTaskModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      loadTasks();
      loadMorningTask();
    }
  }, [user, activeTab]);

  // Reload tasks khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      // Chỉ reload khi user đã có, nhưng không đưa user vào dependency để tránh vòng lặp
      const currentUser = user;
      if (currentUser) {
        loadTasks();
        loadMorningTask();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]) // Loại bỏ user khỏi dependency để tránh vòng lặp
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      const userData = await getMe();
      setUser(userData);

      const projectsData = await getProjects({ uid: userData.id });
      setProjects(projectsData);
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
      // Map activeTab sang status
      let status: string | undefined;
      switch (activeTab) {
        case 'inProgress':
          status = 'IN_PROGRESS';
          break;
        case 'daily':
        case 'weekly':
        case 'team':
          // Lấy tất cả tasks cho các tab khác
          status = undefined;
          break;
      }

      const tasksData = await getTasks({
        uid: user.id,
        status,
      });

      // Map API tasks sang Home tasks format
      const mappedTasks = tasksData.map(task => {
        const projectName = task.projectId
          ? projects.find(p => p.id === task.projectId)?.name || 'No Project'
          : 'No Project';
        return mapApiTaskToHomeTask(task, projectName);
      });

      // Sắp xếp tasks theo thời gian tăng dần
      const sortedApiTasks = tasksData.sort((a, b) => {
        const getSortTime = (task: ApiTask): number => {
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
        if (timeA === 0 && timeB === 0) return 0;
        if (timeA === 0) return 1;
        if (timeB === 0) return -1;
        return timeA - timeB;
      });

      // Map lại sau khi sort
      const sortedMappedTasks = sortedApiTasks.map(task => {
        const projectName = task.projectId
          ? projects.find(p => p.id === task.projectId)?.name || 'No Project'
          : 'No Project';
        return mapApiTaskToHomeTask(task, projectName);
      });

      setApiTasks(sortedApiTasks);
      setTasks(sortedMappedTasks);
    } catch (error) {
      // Xử lý lỗi
    } finally {
      setIsLoading(false);
    }
  };

  // Load morning task: ưu tiên IN_PROGRESS, sau đó TO_DO, lấy task gần nhất theo thời gian
  const loadMorningTask = async () => {
    if (!user) return;

    try {
      // Thử lấy IN_PROGRESS tasks trước
      let tasksData = await getTasks({
        uid: user.id,
        status: 'IN_PROGRESS',
      });

      // Nếu không có IN_PROGRESS, lấy TO_DO
      if (tasksData.length === 0) {
        tasksData = await getTasks({
          uid: user.id,
          status: 'TO_DO',
        });
      }

      if (tasksData.length === 0) {
        setMorningTask(null);
        return;
      }

      // Helper function để lấy thời gian sort
      const getSortTime = (task: ApiTask): number => {
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

      // Sắp xếp theo thời gian gần nhất (tăng dần)
      const sortedTasks = tasksData.sort((a, b) => {
        const timeA = getSortTime(a);
        const timeB = getSortTime(b);
        if (timeA === 0 && timeB === 0) return 0;
        if (timeA === 0) return 1;
        if (timeB === 0) return -1;
        return timeA - timeB;
      });

      // Lấy task đầu tiên (gần nhất)
      setMorningTask(sortedTasks[0]);
    } catch (error) {
      setMorningTask(null);
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
      nextStatus = 'TO_DO';
    }

    // Optimistic update
    const previousTasks = [...tasks];
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: nextStatus === 'COMPLETED' } : task
      )
    );

    try {
      await updateTask({
        uid: user.id,
        id: taskId,
        status: nextStatus,
      });
      // Reload để sync với server
      loadTasks();
    } catch (error) {
      setTasks(previousTasks);
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const handleTaskPress = (taskId: string) => {
    router.push({ pathname: '/edittask', params: { taskId } });
  };

  // Map API task sang FeaturedTask format
  const mapApiTaskToFeaturedTask = (task: ApiTask | null): FeaturedTask | null => {
    if (!task) return null;

    // Format date
    let dateStr = '';
    if (task.date) {
      try {
        const dateObj = typeof task.date === 'string' ? new Date(task.date) : new Date(task.date);
        if (!isNaN(dateObj.getTime())) {
          dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      } catch {
        // Ignore error
      }
    }
    if (!dateStr && task.startTime) {
      try {
        const dateObj = typeof task.startTime === 'string' ? new Date(task.startTime) : new Date(task.startTime);
        if (!isNaN(dateObj.getTime())) {
          dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      } catch {
        // Ignore error
      }
    }

    // Format duration
    let durationStr = '';
    if (task.startTime && task.endTime) {
      try {
        const start = typeof task.startTime === 'string' ? new Date(task.startTime) : new Date(task.startTime);
        const end = typeof task.endTime === 'string' ? new Date(task.endTime) : new Date(task.endTime);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const diffMs = end.getTime() - start.getTime();
          const diffHours = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
          durationStr = `${diffHours} ${diffHours === 1 ? 'Hour' : 'Hours'}`;
        }
      } catch {
        // Ignore error
      }
    }
    if (!durationStr && task.duration) {
      durationStr = `${task.duration} ${task.duration === 1 ? 'Hour' : 'Hours'}`;
    }

    return {
      title: task.title || 'Untitled Task',
      description: 'Morning Task',
      date: dateStr || 'No date',
      duration: durationStr || 'No duration',
      breakTime: task.breakTime ? `${task.breakTime} min break` : 'No break',
      progress: task.progress || 0,
    };
  };

  // Hàm xử lý pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (user) {
        // Reload user data để cập nhật avatar
        const userData = await getMe();
        setUser(userData);

        // Reload projects
        const projectsData = await getProjects({ uid: userData.id });
        setProjects(projectsData);

        // Reload tasks và morning task (không set isLoading để tránh xung đột)
        // Tạo các hàm reload riêng không set isLoading
        const reloadTasks = async () => {
          if (!userData) return;
          let status: string | undefined;
          switch (activeTab) {
            case 'inProgress':
              status = 'IN_PROGRESS';
              break;
            case 'daily':
            case 'weekly':
            case 'team':
              status = undefined;
              break;
          }
          const tasksData = await getTasks({ uid: userData.id, status });
          const mappedTasks = tasksData.map(task => {
            const projectName = task.projectId
              ? projectsData.find(p => p.id === task.projectId)?.name || 'No Project'
              : 'No Project';
            return mapApiTaskToHomeTask(task, projectName);
          });
          const sortedApiTasks = tasksData.sort((a, b) => {
            const getSortTime = (task: ApiTask): number => {
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
            if (timeA === 0 && timeB === 0) return 0;
            if (timeA === 0) return 1;
            if (timeB === 0) return -1;
            return timeA - timeB;
          });
          const sortedMappedTasks = sortedApiTasks.map(task => {
            const projectName = task.projectId
              ? projectsData.find(p => p.id === task.projectId)?.name || 'No Project'
              : 'No Project';
            return mapApiTaskToHomeTask(task, projectName);
          });
          setApiTasks(sortedApiTasks);
          setTasks(sortedMappedTasks);
        };

        const reloadMorningTask = async () => {
          if (!userData) return;
          let tasksData = await getTasks({ uid: userData.id, status: 'IN_PROGRESS' });
          if (tasksData.length === 0) {
            tasksData = await getTasks({ uid: userData.id, status: 'TO_DO' });
          }
          if (tasksData.length === 0) {
            setMorningTask(null);
            return;
          }
          const getSortTime = (task: ApiTask): number => {
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
          const sortedTasks = tasksData.sort((a, b) => {
            const timeA = getSortTime(a);
            const timeB = getSortTime(b);
            if (timeA === 0 && timeB === 0) return 0;
            if (timeA === 0) return 1;
            if (timeB === 0) return -1;
            return timeA - timeB;
          });
          setMorningTask(sortedTasks[0]);
        };

        await Promise.all([reloadTasks(), reloadMorningTask()]);
      }
    } catch (error) {
      // Xử lý lỗi nếu cần
    } finally {
      setRefreshing(false);
    }
  }, [user, activeTab]);

  // Hàm load notifications
  const loadNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load notifications');
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Hàm xử lý khi click vào chuông
  const handleBellPress = () => {
    setNotificationsModalVisible(true);
    loadNotifications();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6C63FF"
            colors={['#6C63FF']}
          />
        }
      >
        <HomeHeader userName={user?.name || 'User'} avatarUrl={user?.avatar} onBellPress={handleBellPress} />
        <TabSelector tabs={homeTabs} activeTab={activeTab} onChange={setActiveTab} />
        {morningTask ? (
          <FeaturedTaskCard task={mapApiTaskToFeaturedTask(morningTask)!} />
        ) : (
          <View style={styles.emptyMorningTaskCard}>
            <View style={styles.emptyIllustration}>
              <View style={styles.sunContainer}>
                <Ionicons name="sunny" size={56} color="#F7B500" />
              </View>
              <View style={styles.cloudContainer}>
                <Ionicons name="cloud-outline" size={32} color="#E0E0E0" />
              </View>
              <View style={styles.cloudContainer2}>
                <Ionicons name="cloud-outline" size={24} color="#F0F0F0" />
              </View>
            </View>
            <View style={styles.emptyContent}>
              <Text style={styles.emptyTitle}>Good Morning! ☀️</Text>
              <Text style={styles.emptyDescription}>
                Your day is a blank canvas.{'\n'}Add your first task to start painting your success.
              </Text>
              <View style={styles.emptyDivider} />
              <View style={styles.emptyTips}>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#4361EE" />
                  <Text style={styles.tipText}>Plan your priorities</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#4361EE" />
                  <Text style={styles.tipText}>Stay focused</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#4361EE" />
                  <Text style={styles.tipText}>Achieve your goals</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        <QuickActionRow
          actions={quickActions}
          onActionPress={() => Alert.alert('Action', 'Feature coming soon in the next sprint.')}
        />
        <DailyChallengeCard
          {...challenge}
          onAction={() => Alert.alert('Nice!', 'Daily challenge completed.')}
          onDismiss={() => Alert.alert('Hidden', 'Challenge dismissed for now.')}
        />
        {isLoading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#6C63FF" />
          </View>
        ) : (
          <TaskList
            title={homeTabs.find(tab => tab.id === activeTab)?.label ?? 'Tasks'}
            tasks={tasks}
            onViewAll={() => router.push('/(tabs)/tasks')}
            onTaskPress={handleTaskPress}
            onStatusChange={handleStatusChange}
          />
        )}
      </ScrollView>

      {/* New Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={newTaskModalVisible}
        onRequestClose={() => setNewTaskModalVisible(false)}
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={() => setNewTaskModalVisible(false)}
        >
          <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', flex: 1 }} />
        </Pressable>
        <View style={styles.modalContent}>
          <NewTaskModal
            onClose={() => setNewTaskModalVisible(false)}
            onTaskCreated={() => {
              setNewTaskModalVisible(false);
              loadMorningTask();
              loadTasks();
            }}
          />
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={notificationsModalVisible}
        onRequestClose={() => setNotificationsModalVisible(false)}
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={() => setNotificationsModalVisible(false)}
        >
          <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', flex: 1 }} />
        </Pressable>
        <View style={styles.notificationsModalContent}>
          <View style={styles.notificationsModalHeader}>
            <Text style={styles.notificationsModalTitle}>Notifications</Text>
            <Pressable onPress={() => setNotificationsModalVisible(false)}>
              <Text style={styles.notificationsModalClose}>✕</Text>
            </Pressable>
          </View>
          {isLoadingNotifications ? (
            <View style={styles.notificationsLoadingContainer}>
              <ActivityIndicator size="large" color="#6C63FF" />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.notificationsEmptyContainer}>
              <Text style={styles.notificationsEmptyText}>No notifications</Text>
            </View>
          ) : (
            <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
              {notifications.map((notification) => (
                <View key={notification.id} style={styles.notificationItem}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6fb',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    gap: 18,
  },
  emptyMorningTaskCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#3C4F7C',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  emptyIllustration: {
    height: 140,
    backgroundColor: '#FFF8E1',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunContainer: {
    position: 'absolute',
    top: 20,
    left: '50%',
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF59D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F7B500',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cloudContainer: {
    position: 'absolute',
    top: 40,
    right: 30,
  },
  cloudContainer2: {
    position: 'absolute',
    top: 60,
    left: 30,
  },
  emptyContent: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B1B33',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  emptyDivider: {
    width: 40,
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 20,
  },
  emptyTips: {
    width: '100%',
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    fontSize: 13,
    color: '#7A7A7A',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  notificationsModalContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 100,
    paddingTop: 20,
  },
  notificationsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECF5',
  },
  notificationsModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B1B33',
  },
  notificationsModalClose: {
    fontSize: 28,
    color: '#8E8E93',
    lineHeight: 28,
  },
  notificationsLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  notificationsEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  notificationsEmptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B1B33',
    marginBottom: 6,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});
