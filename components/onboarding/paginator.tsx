import { useThemeColor } from '@/hooks/use-theme-color';
import { Slide } from '@/types/slide';
import React from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';

const Paginator = ({
  data,
  scrollX,
}: {
  data: Slide[];
  scrollX: Animated.Value;
}) => {
  const { width } = useWindowDimensions();
  const activeDotColor = useThemeColor({}, 'tint');
  const inactiveDotColor = useThemeColor({}, 'icon');

  return (
    <View style={styles.container}>
      {data.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 30, 10],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        const backgroundColor = scrollX.interpolate({
          inputRange,
          outputRange: [inactiveDotColor, activeDotColor, inactiveDotColor],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.dot, 
              { 
                width: dotWidth, 
                opacity,
                backgroundColor: backgroundColor // Sử dụng màu đã interpolate
              }
            ]}
          />
        );
      })}
    </View>
  );
};

export default Paginator;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 16, 
    marginBottom: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
})

