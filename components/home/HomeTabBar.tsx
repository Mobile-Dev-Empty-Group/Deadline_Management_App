import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import NewTaskModal from './NewTaskModal';

export function HomeTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const bgColor = useThemeColor({}, 'tabBarBackground');
  const activeColor = useThemeColor({}, 'tabBarActive');
  const inactiveColor = useThemeColor({}, 'tabBarInactive');
  const fabColor = useThemeColor({}, 'fabBackground');
  const fabBorderColor = useThemeColor({}, 'fabBorder');
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ThemedView safe style={styles.outerWrapper}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={() => setModalVisible(false)}
        >
          <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', flex: 1 }} />
        </Pressable>

        <View style={styles.modalContent}>
          <NewTaskModal
            onClose={() => setModalVisible(false)}
            onTaskCreated={() => {
              setModalVisible(false);
              // Có thể emit event để reload tasks nếu cần
            }}
          />
        </View>
      </Modal>

      <View style={styles.container}>
        <View style={[styles.bar, { backgroundColor: bgColor }]}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const icon = iconMap[route.name] ?? 'circle-outline';

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
              <React.Fragment key={route.name}>
                {index === 2 && <View style={{ width: 60 }} />}
                <Pressable style={styles.tabButton} onPress={onPress}>
                  <MaterialCommunityIcons
                    name={iconMap[route.name] ?? 'circle-outline'}
                    size={28}
                    color={isFocused ? activeColor : inactiveColor}
                  />
                </Pressable>
              </React.Fragment>
            );
          })}
        </View>

        {/* Nút FAB với viền (border) tự đổi màu theo theme để tách biệt với bar */}
        <Pressable
          style={[styles.fab, { backgroundColor: fabBorderColor }]}
          onPress={() => setModalVisible(true)}>
          <View style={[styles.fabInner, { backgroundColor: fabColor }]}>
            <MaterialCommunityIcons name="plus" size={32} color="#fff" />
          </View>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const iconMap: Record<string, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  index: 'home-variant-outline',
  tasks: 'clipboard-list-outline',
  analytic: 'chart-arc',
  profile: 'account-circle-outline',
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Làm tối nền khi mở modal
  },
  modalContent: {
    marginTop: 'auto', // Đẩy modal xuống đáy màn hình
    backgroundColor: 'transparent',
  },
  outerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent', // Để ThemedView safe không che nội dung phía sau
  },
  container: {
    alignItems: 'center',
    paddingTop: 25, // Tạo khoảng trống cho nút FAB nhô lên
    paddingBottom: 10, // Khoảng cách từ Bar đến vạch an toàn
  },
  bar: {
    flexDirection: 'row',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: '92%',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    top: 0, // Nằm trên cùng của container để nhô cao hơn Bar
    padding: 6,
    borderRadius: 35,
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});