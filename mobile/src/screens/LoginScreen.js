import React, { useState, useContext } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Title, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { login } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await login(username, password);
      // Save username and role for password change and access control
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('userRole', response.data.role || 'ADMIN');
      await AsyncStorage.setItem('userName', response.data.name || username);
      await signIn(response.data.token);
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.status === 'PENDING_APPROVAL') {
        Alert.alert(
          'Account Pending Approval',
          errorData.message,
          [{ text: 'OK' }]
        );
      } else if (errorData?.status === 'DEACTIVATED') {
        Alert.alert(
          'Account Deactivated',
          errorData.message,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Login Failed', errorData?.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>FarmTime</Title>
          <Text style={styles.subtitle}>Poultry Farm Management</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor="#4CAF50"
          >
            Login
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.linkButton}
          >
            Forgot Password?
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Register')}
            style={styles.linkButton}
          >
            Don't have an account? Register
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 12,
  },
});
