import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AnalyticScreen({ navigation }: any) {
  const textColor = useThemeColor({}, 'text');
  const secTextColor = useThemeColor({}, 'textSecondary');
  const cardBg = useThemeColor({}, 'inputBackground');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.iconButton, { borderColor }]} 
          onPress={() => navigation?.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Analytic</Text>
        <TouchableOpacity style={[styles.iconButton, { borderColor }]}>
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
              <Text style={[styles.chartPercentage, { color: primaryColor }]}>89%</Text>
            </View>
            <View style={styles.legendContainer}>
              <LegendItem label="Planned" color="#E2E8F0" />
              <LegendItem label="Completed" color="#818CF8" />
            </View>
          </View>

          {/* Custom Bar Chart */}
          <View style={styles.barChartContainer}>
            <BarColumn day="Su" planned={60} completed={40} />
            <BarColumn day="Mo" planned={80} completed={70} />
            <BarColumn day="Tu" planned={70} completed={50} />
            <BarColumn day="We" planned={100} completed={95} isPeak />
            <BarColumn day="Th" planned={65} completed={55} />
            <BarColumn day="Fr" planned={75} completed={60} />
            <BarColumn day="Sa" planned={85} completed={75} />
          </View>
        </View>

        {/* Toggle Weekly/Monthly */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity style={[styles.toggleBtn, { backgroundColor: primaryColor }]}>
            <MaterialCommunityIcons name="chart-bar" size={18} color="#FFF" />
            <Text style={styles.toggleTextActive}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleBtnInactive}>
            <MaterialCommunityIcons name="calendar-month" size={18} color={secTextColor} />
            <Text style={[styles.toggleTextInactive, { color: secTextColor }]}>Monthly</Text>
          </TouchableOpacity>
        </View>

        {/* Today Stats Section */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>Today Stats</Text>
        
        <View style={styles.todayStatsRow}>
          {/* Progress Bars */}
          <View style={styles.progressSection}>
            <StatRow label="Morning" progress={0.7} color={primaryColor} />
            <StatRow label="Noon" progress={0.4} color={primaryColor} />
            <StatRow label="Night" progress={0.6} color={primaryColor} />
          </View>

          {/* Donut Chart placeholder */}
          <View style={styles.donutContainer}>
             <View style={[styles.donutInner, { borderColor: primaryColor }]}>
                <Text style={[styles.donutText, { color: primaryColor }]}>80%</Text>
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