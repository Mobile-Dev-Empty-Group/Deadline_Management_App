import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAnalytics, getMe, type AnalyticsResponse } from '@/services/api';

export default function AnalyticScreen({ navigation }: any) {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const secTextColor = useThemeColor({}, 'textSecondary');
  const cardBg = useThemeColor({}, 'inputBackground');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const [analyticsType, setAnalyticsType] = useState<'week' | 'month'>('week');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, analyticsType]);

  const loadData = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      // Xử lý lỗi
    }
  };

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      const data = await getAnalytics({
        uid: user.id,
        type: analyticsType,
      });
      setAnalyticsData(data);
    } catch (error) {
      // Xử lý lỗi
    }
  };

  // Map day name sang short form
  const getDayShort = (day: string): string => {
    const dayMap: Record<string, string> = {
      'Monday': 'Mo',
      'Tuesday': 'Tu',
      'Wednesday': 'We',
      'Thursday': 'Th',
      'Friday': 'Fr',
      'Saturday': 'Sa',
      'Sunday': 'Su',
    };
    return dayMap[day] || day.substring(0, 2);
  };

  // Tính completion percentage
  const getCompletionPercentage = (): number => {
    if (!analyticsData || analyticsData.summary.total === 0) return 0;
    return Math.round((analyticsData.summary.completed / analyticsData.summary.total) * 100);
  };

  // Tìm peak day (ngày có total cao nhất)
  const getPeakDay = (): string | null => {
    if (!analyticsData) return null;
    const peak = analyticsData.byWeekday.reduce((max, day) => 
      day.total > max.total ? day : max
    , analyticsData.byWeekday[0]);
    return peak.total > 0 ? peak.day : null;
  };

  // Tính progress cho Morning, Noon, Night dựa trên summary data
  const getTodayStats = () => {
    if (!analyticsData || analyticsData.summary.total === 0) {
      return { morning: 0.7, noon: 0.4, night: 0.6 }; // Fallback to mock data
    }

    const total = analyticsData.summary.total;
    const completed = analyticsData.summary.completed;
    const planned = analyticsData.summary.planned;
    
    // Tính completion rate
    const completionRate = completed / total;
    
    // Phân bổ cho morning, noon, night dựa trên completion rate và planned rate
    const morning = Math.min(completionRate * 1.2, 1); // Morning thường hoàn thành tốt hơn
    const noon = Math.min((planned / total) * 0.8, 1); // Noon dựa trên planned
    const night = Math.min(completionRate * 0.9, 1); // Night dựa trên completion rate
    
    return {
      morning: Math.max(0, Math.min(1, morning)),
      noon: Math.max(0, Math.min(1, noon)),
      night: Math.max(0, Math.min(1, night)),
    };
  };

  // Get weekday data cho bar chart
  const getWeekdayData = (dayShort: string) => {
    if (!analyticsData) return { planned: 0, completed: 0, total: 0, completedCount: 0 };
    
    const dayMap: Record<string, string> = {
      'Su': 'Sunday',
      'Mo': 'Monday',
      'Tu': 'Tuesday',
      'We': 'Wednesday',
      'Th': 'Thursday',
      'Fr': 'Friday',
      'Sa': 'Saturday',
    };
    
    const fullDayName = dayMap[dayShort];
    const dayData = analyticsData.byWeekday.find(d => d.day === fullDayName);
    
    if (!dayData) return { planned: 0, completed: 0, total: 0, completedCount: 0 };
    
    // Tính height dựa trên max total trong week
    const maxTotal = Math.max(...analyticsData.byWeekday.map(d => d.total), 1);
    const plannedHeight = dayData.total > 0 ? (dayData.total / maxTotal) * 100 : 0;
    const completedHeight = dayData.total > 0 ? (dayData.completed / dayData.total) * 100 : 0;
    
    return {
      planned: plannedHeight,
      completed: completedHeight,
      total: dayData.total,
      completedCount: dayData.completed,
    };
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.iconButton, { borderColor }]} 
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Analytic</Text>
        <TouchableOpacity 
          style={[styles.iconButton, { borderColor }]}
          onPress={() => router.push('/setting')}
        >
          <MaterialCommunityIcons name="cog-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.subGreeting, { color: secTextColor }]}>Great work</Text>
        <Text style={[styles.mainGreeting, { color: textColor }]}>
          Your daily challenge almost done 🔥
        </Text>

        {/* Overall Bar Chart Card */}
        <View style={[styles.chartCard, { backgroundColor: cardBg }]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.chartTitle, { color: textColor }]}>Overall</Text>
              <Text style={[styles.chartPercentage, { color: primaryColor }]}>
                {analyticsData ? getCompletionPercentage() : 89}%
              </Text>
            </View>
            <View style={styles.legendContainer}>
              <LegendItem label="Planned" color="#E2E8F0" />
              <LegendItem label="Completed" color="#818CF8" />
            </View>
          </View>

          {/* Custom Bar Chart */}
          <View style={styles.barChartContainer}>
            {analyticsData ? (
              // Sử dụng data từ API
              analyticsData.byWeekday.map((dayData) => {
                const dayShort = getDayShort(dayData.day);
                const peakDay = getPeakDay();
                const isPeak = peakDay === dayData.day && dayData.total > 0;
                
                // Tính height dựa trên max total trong week
                const maxTotal = Math.max(...analyticsData.byWeekday.map(d => d.total), 1);
                const plannedHeight = dayData.total > 0 ? (dayData.total / maxTotal) * 100 : 0;
                // completed là percentage của completed/total (để tính height của completed bar bên trong)
                const completedPercentage = dayData.total > 0 ? (dayData.completed / dayData.total) * 100 : 0;

                return (
                  <BarColumn
                    key={dayData.day}
                    day={dayShort}
                    planned={plannedHeight}
                    completed={completedPercentage}
                    isPeak={isPeak}
                  />
                );
              })
            ) : (
              // Fallback to mock data
              <>
                <BarColumn day="Su" planned={60} completed={40} />
                <BarColumn day="Mo" planned={80} completed={70} />
                <BarColumn day="Tu" planned={70} completed={50} />
                <BarColumn day="We" planned={100} completed={95} isPeak />
                <BarColumn day="Th" planned={65} completed={55} />
                <BarColumn day="Fr" planned={75} completed={60} />
                <BarColumn day="Sa" planned={85} completed={75} />
              </>
            )}
          </View>
        </View>

        {/* Toggle Weekly/Monthly */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => setAnalyticsType('week')}
            style={[styles.toggleBtn, { backgroundColor: analyticsType === 'week' ? primaryColor : 'transparent' }]}
          >
            <MaterialCommunityIcons name="chart-bar" size={18} color={analyticsType === 'week' ? '#FFF' : secTextColor} />
            <Text style={analyticsType === 'week' ? styles.toggleTextActive : [styles.toggleTextInactive, { color: secTextColor }]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setAnalyticsType('month')}
            style={[styles.toggleBtn, { backgroundColor: analyticsType === 'month' ? primaryColor : 'transparent' }]}
          >
            <MaterialCommunityIcons name="calendar-month" size={18} color={analyticsType === 'month' ? '#FFF' : secTextColor} />
            <Text style={analyticsType === 'month' ? styles.toggleTextActive : [styles.toggleTextInactive, { color: secTextColor }]}>
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today Stats Section */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>Today Stats</Text>
        
        <View style={styles.todayStatsRow}>
          {/* Progress Bars */}
          <View style={styles.progressSection}>
            {(() => {
              const stats = getTodayStats();
              return (
                <>
                  <StatRow label="Morning" progress={stats.morning} color={primaryColor} />
                  <StatRow label="Noon" progress={stats.noon} color={primaryColor} />
                  <StatRow label="Night" progress={stats.night} color={primaryColor} />
                </>
              );
            })()}
          </View>

          {/* Donut Chart placeholder */}
          <View style={styles.donutContainer}>
             <View style={[styles.donutInner, { borderColor: primaryColor }]}>
                <Text style={[styles.donutText, { color: primaryColor }]}>
                  {analyticsData ? getCompletionPercentage() : 80}%
                </Text>
             </View>
          </View>
        </View>

      </ScrollView>
    </ThemedView>
  );
}

// --- Sub-components ---

function LegendItem({ label, color }: { label: string; color: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function BarColumn({ day, planned, completed, isPeak }: any) {
  return (
    <View style={styles.barColumn}>
      {isPeak && <Text style={styles.peakLabel}>10/10</Text>}
      <View style={styles.barBackground}>
        <View style={[styles.barPlanned, { height: `${planned}%` }]}>
          <View style={[styles.barCompleted, { height: `${(completed / planned) * 100}%` }]} />
        </View>
      </View>
      <Text style={styles.barDay}>{day}</Text>
    </View>
  );
}

function StatRow({ label, progress, color }: any) {
  const secTextColor = useThemeColor({}, 'textSecondary');
  return (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { color: secTextColor }]}>{label}</Text>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  iconButton: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 200 },
  subGreeting: { fontSize: 16, textAlign: 'center', fontStyle: 'italic' },
  mainGreeting: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 8, marginBottom: 30 },
  chartCard: { padding: 20, borderRadius: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  chartTitle: { fontSize: 18, fontWeight: 'bold' },
  chartPercentage: { fontSize: 14, fontWeight: 'bold' },
  legendContainer: { flexDirection: 'row', gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, color: '#94A3B8' },
  barChartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 180 },
  barColumn: { alignItems: 'center', width: 30 },
  barBackground: { height: 120, width: 14, backgroundColor: '#F1F5F9', borderRadius: 7, overflow: 'hidden', justifyContent: 'flex-end' },
  barPlanned: { width: '100%', backgroundColor: '#E2E8F0', borderRadius: 7, justifyContent: 'flex-end' },
  barCompleted: { width: '100%', backgroundColor: '#818CF8', borderRadius: 7 },
  barDay: { marginTop: 8, fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  peakLabel: { fontSize: 10, fontWeight: 'bold', color: '#6366F1', marginBottom: 4 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 6, borderRadius: 16, marginTop: 25, alignSelf: 'center' },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, gap: 8 },
  toggleBtnInactive: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 8 },
  toggleTextActive: { color: '#FFF', fontWeight: 'bold' },
  toggleTextInactive: { fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 30, marginBottom: 20 },
  todayStatsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressSection: { flex: 1, gap: 15 },
  statRow: { gap: 6 },
  statLabel: { fontSize: 14, fontWeight: '500' },
  progressBarBg: { height: 12, backgroundColor: '#E2E8F0', borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 6 },
  donutContainer: { width: 140, alignItems: 'center', justifyContent: 'center' },
  donutInner: { width: 100, height: 100, borderRadius: 50, borderWidth: 10, alignItems: 'center', justifyContent: 'center' },
  donutText: { fontSize: 20, fontWeight: 'bold' }
});