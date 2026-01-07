import React from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';

// Import các thành phần theo Theme
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { Slide } from '@/types/slide';

const OnboardingItem = ({ slide }: { slide: Slide }) => {
  const { width } = useWindowDimensions();
  return (
    <ThemedView style={[styles.container, { width }]}>
      <Image source={slide.image} style={[styles.image, { width, resizeMode: 'contain' }]} />
      <View style={{ flex: 0.4, justifyContent: 'center' }}>
        <ThemedText style={styles.description}>{slide.description}</ThemedText>
      </View>
    </ThemedView>
  )
}

export default OnboardingItem

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  image: {
    flex: 0.6,
  },
  description: {
    fontWeight: '800',
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 34,
    paddingHorizontal: 8,
  },
});