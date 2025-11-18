import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const NextButton = ({
  percentage,
  onPress,
}: {
  percentage: number;
  onPress?: () => void;
}) => {
  const size = 128;
  const strokeWidth = 6;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progressAnimation = useRef(new Animated.Value(0)).current;

  const strokeDashoffset = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: percentage,
      duration: 300,
      useNativeDriver: false, // phải false vì strokeDashoffset không hỗ trợ native driver
    }).start();
  }, [percentage]);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G rotate="-90" origin={`${center}, ${center}`}>
          {/* Vòng nền */}
          <Circle
            stroke="#E0E0E0"
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />

          {/* Vòng progress animated */}
          <AnimatedCircle
            stroke="#333"
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Nút chính giữa */}
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Ionicons name="arrow-forward" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default NextButton;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, 
  },
});
