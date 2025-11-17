import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { HomeTab, HomeTabId } from './types';

type Props = {
  tabs: HomeTab[];
  activeTab: HomeTabId;
  onChange: (tab: HomeTabId) => void;
};

export function TabSelector({ tabs, activeTab, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.wrapper}>
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={[styles.chip, isActive && styles.activeChip]}>
            <Text style={[styles.chipLabel, isActive && styles.activeLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 0,
  },
  content: {
    gap: 12,
    paddingBottom: 4,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E7F1',
  },
  activeChip: {
    backgroundColor: '#E4EBFF',
    borderColor: '#C0D4FF',
  },
  chipLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#4361EE',
  },
});

