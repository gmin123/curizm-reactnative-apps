import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginIndexScreen() {
  const router = useRouter();

  const goToLoginForm = () => {
    router.push('/(Login)/LoginFormScreen');
  };

  const goToCreateAccount = () => {
    router.push('/(Login)/CreateAccountModal');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: '로그인',
          headerShown: true 
        }} 
      />
      
      <Text style={styles.title}>Qurizm에 오신 것을 환영합니다</Text>
      <Text style={styles.subtitle}>아름다운 전시회를 경험해보세요</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={goToLoginForm}>
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.signupButton} onPress={goToCreateAccount}>
          <Text style={styles.signupButtonText}>회원가입</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 50,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#f8f9fa',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  signupButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
