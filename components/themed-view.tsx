import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { SafeAreaView } from 'react-native-safe-area-context';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  safe?: boolean;
};

export function ThemedView({ style, lightColor, darkColor, safe, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  
  // Nếu safe=true thì dùng SafeAreaView, ngược lại dùng View thường
  const Component = safe ? SafeAreaView : View;

  return <Component style={[{ backgroundColor }, style]} {...otherProps} />;
}
