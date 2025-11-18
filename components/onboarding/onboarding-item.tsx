import { StyleSheet, Text, View, Image, useWindowDimensions } from 'react-native'
import React from 'react'

import { Slide } from '@/types/slide'

const OnboardingItem = ({ slide }: { slide: Slide }) => {
  const { width } = useWindowDimensions();
  return (
    <View style={[styles.container, { width }]}>
      <Image source={slide.image} style={[styles.image, { width, resizeMode: 'contain' }]} />
      <View style={{ flex: 0.4, justifyContent: 'center' }}>
        <Text style={styles.description}>{slide.description}</Text>
      </View>
    </View>
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
    fontSize: 30,
    textAlign: 'center',
    color: '#1a1a1a',
    lineHeight: 34,
    paddingHorizontal: 8,
  },
});