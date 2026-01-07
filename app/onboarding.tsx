import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

// Component theo Theme
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

// Onboarding Components
import NextButton from '@/components/onboarding/next-button';
import OnboardingItem from '@/components/onboarding/onboarding-item';
import Paginator from '@/components/onboarding/paginator';

import { Slide } from '@/types/slide';
import { completeOnboarding } from '@/utils/onboarding';

const slides: Slide[] = [
  {
    id: '1',
    description: 'Manage your study, work, and life in one place',
    image: require('@/assets/images/onboarding1.png'),
  },
  {
    id: '2',
    description: 'All-in-One: Tasks, Scheduling, Notes, and Well-Being',
    image: require('@/assets/images/onboarding2.jpg'),
  },
  {
    id: '3',
    description: 'Achieve More Together with Efficient Team Task Management',
    image: require('@/assets/images/onboarding3.jpg'),
  },
];

const Onboarding = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Theo dõi vị trí scroll ngang (dùng cho hiệu ứng Paginator và NextButton)
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList<Slide>>(null);

  // Màu sắc động cho nút Skip
  const skipBgColor = useThemeColor({ light: 'rgba(0,0,0,0.05)', dark: 'rgba(255,255,255,0.1)' }, 'background');

  /**
   * Callback khi FlatList thay đổi các item đang hiển thị
   * Dùng để cập nhật currentIndex khi người dùng vuốt
   */
  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  /**
   * Cấu hình để xác định khi nào một item được coi là "đang hiển thị"
   * 50% diện tích item phải nằm trong viewport
   */
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNextPress = async () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await completeOnboarding(); // Lưu trạng thái
      router.replace('/'); // Chuyển về trang chính
    }
  };

  const handleSkipPress = async () => {
    await completeOnboarding(); 
    router.replace('/');        
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={[styles.skipButton, { backgroundColor: skipBgColor }]}
        onPress={handleSkipPress}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.skipText}>Skip</ThemedText>
      </TouchableOpacity>
      {/* Tiêu đề App */}
      <ThemedText style={styles.title}>DineLex</ThemedText>
      <View style={{ flex: 0.9 }}>
        <FlatList
          data={slides}
          renderItem={({ item }) => <OnboardingItem slide={item} />}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          scrollEventThrottle={32}
          ref={slidesRef}
        />
      </View>

      <Paginator data={slides} scrollX={scrollX} />

      <NextButton
        percentage={((currentIndex + 1) / slides.length) * 100}
        onPress={handleNextPress}
      />
    </ThemedView>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
  },
  skipButton: {
    position: 'absolute',
    top: 60,        
    right: 20,      
    zIndex: 10,     
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)', 
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

