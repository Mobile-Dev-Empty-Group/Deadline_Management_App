import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Challenge } from './types';

type Props = Challenge & {
  onDismiss?: () => void;
  onAction?: () => void;
};

export function DailyChallengeCard({ title, description, ctaLabel, onDismiss, onAction }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={onDismiss}>
          <Feather name="x" size={18} color="#fff" />
        </Pressable>
      </View>
      <Text style={styles.body}>{description}</Text>
      <Pressable style={styles.button} onPress={onAction}>
        <Text style={styles.buttonLabel}>{ctaLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#8EC5FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    color: '#f7f8ff',
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#5A8DEE',
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '700',
  },
});

