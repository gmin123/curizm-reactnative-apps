import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';

export default function MyStorageScreen() {
  const router = useRouter();

  const navigateToMyLists = () => {
    router.push('/(MyStroage)/MyLists');
  };

  const navigateToMySetting = () => {
    router.push('/(MyStroage)/MySetting');
  };

  const navigateToQuriNotices = () => {
    router.push('/(MyStroage)/QuriNotices');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: '마이 스토리지',
          headerShown: true 
        }} 
      />
      
      <Text style={styles.title}>마이 스토리지</Text>
      
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={navigateToMyLists}>
          <Text style={styles.menuText}>내 리스트</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={navigateToMySetting}>
          <Text style={styles.menuText}>설정</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={navigateToQuriNotices}>
          <Text style={styles.menuText}>Quri 공지사항</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  menuContainer: {
    gap: 15,
  },
  menuItem: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  menuText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
  },
});
