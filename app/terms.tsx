import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TermsAndConditionsScreen() {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const secTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const cardBg = useThemeColor({}, 'inputBackground');

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
        <Text style={[styles.headerTitle, { color: textColor }]}>Terms & Conditions</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.contentCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.title, { color: textColor }]}>Terms and Conditions</Text>
          <Text style={[styles.lastUpdated, { color: secTextColor }]}>Last updated: January 2026</Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>1. Acceptance of Terms</Text>
          <Text style={[styles.text, { color: secTextColor }]}>
            By accessing and using this application, you accept and agree to be bound by the terms 
            and provision of this agreement.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>2. Use License</Text>
          <Text style={[styles.text, { color: secTextColor }]}>
            Permission is granted to temporarily use this application for personal, non-commercial 
            transitory viewing only. This is the grant of a license, not a transfer of title.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>3. User Account</Text>
          <Text style={[styles.text, { color: secTextColor }]}>
            You are responsible for maintaining the confidentiality of your account and password. 
            You agree to accept responsibility for all activities that occur under your account.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>4. Prohibited Uses</Text>
          <Text style={[styles.text, { color: secTextColor }]}>
            You may not use our service for any unlawful purpose or to solicit others to perform 
            or participate in any unlawful acts. You may not violate any local, state, national, 
            or international law or regulation.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>5. Limitation of Liability</Text>
          <Text style={[styles.text, { color: secTextColor }]}>
            In no event shall our company or its suppliers be liable for any damages arising out 
            of the use or inability to use the materials on our application.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>6. Modifications</Text>
          <Text style={[styles.text, { color: secTextColor }]}>
            We reserve the right to revise these terms at any time without notice. By using this 
            application you are agreeing to be bound by the then current version of these terms.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>7. Contact Information</Text>
          <Text style={[styles.text, { color: secTextColor }]}>
            If you have any questions about these Terms and Conditions, please contact us at 
            support@example.com.
          </Text>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  contentCard: {
    padding: 24,
    borderRadius: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
});

