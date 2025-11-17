import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { QuickAction } from './types';

type Props = {
  actions: QuickAction[];
  onActionPress?: (action: QuickAction) => void;
};

export function QuickActionRow({ actions, onActionPress }: Props) {
  return (
    <View style={styles.row}>
      {actions.map(action => (
        <Pressable
          key={action.id}
          style={[styles.card, { backgroundColor: action.accent }]}
          onPress={() => onActionPress?.(action)}
          android_ripple={{ color: '#000', borderless: false }}>
          <View style={styles.icon}>
            <Feather name={action.icon} size={18} color="#272742" />
          </View>
            <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 18,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  label: {
    fontWeight: '600',
    color: '#272742',
  },
});

