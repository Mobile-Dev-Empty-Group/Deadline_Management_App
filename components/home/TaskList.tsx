import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { Task } from './types';

type Props = {
  title: string;
  tasks: Task[];
  onViewAll?: () => void;
  onTaskPress?: (taskId: string) => void;
  onStatusChange?: (taskId: string, currentStatus: string) => void;
};

export function TaskList({ title, tasks, onViewAll, onTaskPress, onStatusChange }: Props) {
  const handleCheckboxPress = (task: Task, e: any) => {
    e.stopPropagation();
    if (onStatusChange) {
      // Map completed status sang API status
      const currentStatus = task.completed ? 'COMPLETED' : 'TO_DO';
      onStatusChange(task.id, currentStatus);
    }
  };

  const handleTaskItemPress = (task: Task) => {
    if (onTaskPress) {
      onTaskPress(task.id);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.link} onPress={onViewAll}>
          View All
        </Text>
      </View>
      <View style={styles.list}>
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TouchableOpacity
              key={task.id}
              style={styles.item}
              onPress={() => handleTaskItemPress(task)}
              activeOpacity={0.7}
            >
              <TouchableOpacity
                onPress={(e) => handleCheckboxPress(task, e)}
                style={[
                  styles.checkbox,
                  task.completed ? styles.checkboxCompleted : styles.checkboxPending,
                ]}
              >
                {task.completed ? <Feather name="check" size={12} color="#fff" /> : null}
              </TouchableOpacity>
              <View style={styles.itemContent}>
                <View style={styles.itemTitleRow}>
                  <Text style={[styles.itemTitle, task.completed && styles.itemTitleCompleted]}>
                    {task.title}
                  </Text>
                  {task.tag ? (
                    <View style={[styles.tag, { backgroundColor: task.tagColor ?? '#EAEAEA' }]}>
                      <Text style={styles.tagLabel}>{task.tag}</Text>
                    </View>
                  ) : null}
                </View>
                {task.time && <Text style={styles.itemTime}>{task.time}</Text>}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks found</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B1B33',
  },
  link: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  list: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    gap: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  checkboxCompleted: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  checkboxPending: {
    borderColor: '#D0D0DA',
    backgroundColor: '#F7F7FB',
  },
  itemContent: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B1B33',
    flex: 1,
  },
  tag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2B2B43',
  },
  itemTime: {
    fontSize: 13,
    color: '#8E8E93',
  },
  itemTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

