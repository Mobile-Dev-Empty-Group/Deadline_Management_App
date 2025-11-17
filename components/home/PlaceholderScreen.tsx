import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  message: string;
};

export function PlaceholderScreen({ title, message }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f6fb',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B1B33',
  },
  message: {
    textAlign: 'center',
    color: '#7A7A8C',
    fontSize: 16,
  },
});

