import { useThemeColor } from '@/hooks/use-theme-color';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const NextButton = ({
  percentage,
  onPress,
}: {
  percentage: number;
  onPress?: () => void;
}) => {

  // 'tint' thường dùng cho các nút nhấn nổi bật, 'text' dùng cho icon để tương phản
  const activeStrokeColor = useThemeColor({}, 'tint'); 
  const buttonBgColor = useThemeColor({}, 'tint'); 
  const iconColor = useThemeColor({}, 'background'); // Màu icon ngược với màu nền
  const backgroundStrokeColor = useThemeColor({}, 'tabIconDefault'); // Màu vòng nền mờ

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
            stroke={backgroundStrokeColor}
            strokeOpacity={0.2}
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />

          {/* Vòng progress animated */}
          <AnimatedCircle
            stroke={activeStrokeColor}
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
      <TouchableOpacity style={[styles.button, { backgroundColor: buttonBgColor }]} onPress={onPress}>
        <Ionicons name="arrow-forward" size={32} color={iconColor} />
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
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
