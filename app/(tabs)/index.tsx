import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { DailyChallengeCard } from '@/components/home/DailyChallengeCard';
import { FeaturedTaskCard } from '@/components/home/FeaturedTaskCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { QuickActionRow } from '@/components/home/QuickActionRow';
import { TabSelector } from '@/components/home/TabSelector';
import { TaskList } from '@/components/home/TaskList';
import { challenge, featuredTask, homeTabs, quickActions, tasksByTab } from '@/components/home/data';
import type { HomeTabId } from '@/components/home/types';
import { resetOnboarding } from '@/utils/onboarding';


export default function HomeTab() {
  const [activeTab, setActiveTab] = useState<HomeTabId>('inProgress');
  const router = useRouter();

  const handleResetOnboarding = async () => {
    await resetOnboarding();
    Alert.alert('Reset thành công', 'Onboarding sẽ xuất hiện lại ngay.', [
      {
        text: 'OK',
        onPress: () => router.replace('/onboarding'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HomeHeader userName="Đăng Khoa" />
        <TabSelector tabs={homeTabs} activeTab={activeTab} onChange={setActiveTab} />
        <FeaturedTaskCard task={featuredTask} />
        <QuickActionRow
          actions={quickActions}
          onActionPress={() => Alert.alert('Action', 'Feature coming soon in the next sprint.')}
        />
        <DailyChallengeCard
          {...challenge}
          onAction={() => Alert.alert('Nice!', 'Daily challenge completed.')}
          onDismiss={() => Alert.alert('Hidden', 'Challenge dismissed for now.')}
        />
        <TaskList
          title={homeTabs.find(tab => tab.id === activeTab)?.label ?? 'Tasks'}
          tasks={tasksByTab[activeTab]}
          onViewAll={() => Alert.alert('See more', 'Navigate to the dedicated list.')}
        />
        <TouchableOpacity style={styles.testButton} onPress={handleResetOnboarding}>
          <Text style={styles.testButtonText}>Test lại Onboarding</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6fb',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    gap: 18,
  },
  testButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
