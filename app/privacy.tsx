import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacyPolicyScreen() {
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
        <Text style={[styles.headerTitle, { color: textColor }]}>Privacy Policy</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.contentCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.title, { color: textColor }]}>Privacy Policy</Text>
          <Text style={[styles.lastUpdated, { color: secTextColor }]}>Last updated: January 2026</Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>1. Information We Collect</Text>
          <Text style={[styles.text, { color: secTextColor }]}>
            We collect information that you provide directly to us, including your name, email address, 
            and any other information you choose to provide when using our services.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>2. How We Use Your Information</Text>
          <Text style={[styles.text, { color: secTextColor }]}>
            We use the information we collect to provide, maintain, and improve our services, 
            process your requests, and communicate with you about our services.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>3. Information Sharing</Text>
          <Text style={[styles.text, { color: secTextColor }]}>
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except as described in this policy.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>4. Data Security</Text>
          <Text style={[styles.text, { color: secTextColor }]}>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>5. Your Rights</Text>
          <Text style={[styles.text, { color: secTextColor }]}>
            You have the right to access, update, or delete your personal information at any time. 
            You can do this through your account settings or by contacting us directly.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>6. Contact Us</Text>
          <Text style={[styles.text, { color: secTextColor }]}>
            If you have any questions about this Privacy Policy, please contact us at privacy@example.com.
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

