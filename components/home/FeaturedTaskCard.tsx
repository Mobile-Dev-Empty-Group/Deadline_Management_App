import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { FeaturedTask } from './types';

type Props = {
  task: FeaturedTask;
};

export function FeaturedTaskCard({ task }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>{task.description}</Text>
        <Ionicons name="star" size={18} color="#F7B500" />
      </View>
      <Text style={styles.title}>{task.title}</Text>
      <View style={styles.metaRow}>
        <Meta icon="calendar-outline" label={task.date} />
        <Meta icon="time-outline" label={task.duration} />
        <Meta icon="cafe-outline" label={task.breakTime} />
      </View>
      <View style={styles.progressRow}>
        <Text style={styles.progressValue}>{task.progress}%</Text>
        <Text style={styles.progressLabel}>Progress</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${task.progress}%` }]} />
      </View>
    </View>
  );
}

function Meta({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={16} color="#7A7A7A" />
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#3C4F7C',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B1B33',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    color: '#7A7A7A',
    fontSize: 13,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4361EE',
  },
  progressLabel: {
    fontSize: 14,
    color: '#A0A0B2',
  },
  track: {
    height: 8,
    borderRadius: 8,
    backgroundColor: '#E6E9F6',
    marginTop: 8,
  },
  trackFill: {
    height: 8,
    borderRadius: 8,
    backgroundColor: '#4361EE',
  },
});

