import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'access_token';

/**
 * Lưu access token vào AsyncStorage
 */
export const saveAccessToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving access token:', error);
    throw error;
  }
};

/**
 * Lấy access token từ AsyncStorage
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Xóa access token khỏi AsyncStorage (logout)
 */
export const removeAccessToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing access token:', error);
    throw error;
  }
};

/**
 * Xóa tất cả dữ liệu người dùng (logout hoàn toàn)
 * Xóa token, onboarding status, và các dữ liệu khác
 */
export const clearAllUserData = async (): Promise<void> => {
  try {
    // Xóa tất cả keys liên quan đến user
    await AsyncStorage.multiRemove([
      ACCESS_TOKEN_KEY,
      'has_completed_onboarding', // Có thể giữ lại hoặc xóa tùy yêu cầu
    ]);
  } catch (error) {
    console.error('Error clearing user data:', error);
    // Nếu multiRemove fail, thử xóa từng cái
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem('has_completed_onboarding');
    } catch (fallbackError) {
      console.error('Error in fallback clear:', fallbackError);
      throw fallbackError;
    }
  }
};

