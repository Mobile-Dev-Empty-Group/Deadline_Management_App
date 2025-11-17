import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'has_completed_onboarding';

export const completeOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (error) {
    console.error('Error saving onboarding status:', error);
  }
};

export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error reading onboarding status:', error);
    return false;
  }
};

export const resetOnboarding = async (): Promise<void> => {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
};