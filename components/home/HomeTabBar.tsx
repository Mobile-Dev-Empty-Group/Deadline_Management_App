import React from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

const iconMap: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  index: 'home',
  calendar: 'calendar',
  tasks: 'check-square',
  profile: 'user',
};

export function HomeTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const icon = iconMap[route.name] ?? 'circle';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.name}
              accessibilityRole="button"
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              style={[styles.tabButton, isFocused && styles.tabButtonActive]}
              onPress={onPress}>
              <Feather name={icon} size={22} color={isFocused ? '#6C63FF' : '#8E90A2'} />
            </Pressable>
          );
        })}
      </View>
      <Pressable style={styles.fab} onPress={() => Alert.alert('Create', 'Add a new task.')}>
        <Feather name="plus" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    alignItems: 'center',
    paddingBottom: 12,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 36,
    paddingHorizontal: 32,
    paddingVertical: 18,
    gap: 24,
    shadowColor: '#1A1A2E',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    justifyContent: 'space-between',
    width: '88%',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabButtonActive: {},
  fab: {
    position: 'absolute',
    top: -36,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
});

