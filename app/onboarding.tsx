import { StyleSheet, Text, View, FlatList, Animated, TouchableOpacity } from 'react-native';
import React, { useState, useRef } from 'react';
import { useRouter } from 'expo-router';

import Paginator from '@/components/onboarding/paginator';
import OnboardingItem from '@/components/onboarding/onboarding-item';
import NextButton from '@/components/onboarding/next-button';
import { completeOnboarding } from '@/utils/onboarding';
import { Slide } from '@/types/slide';

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
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkipPress}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      <Text style={styles.title}>DineLex</Text>
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
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
