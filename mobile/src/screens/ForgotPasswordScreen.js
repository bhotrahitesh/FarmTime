import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Title, Text } from 'react-native-paper';
import { forgotPassword } from '../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!username) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(username);
      const tempPassword = response.data.temporaryPassword;
      
      Alert.alert(
        'Password Reset Successful',
        `Your temporary password is: ${tempPassword}\n\nPlease save this password and change it after login.`,
        [
          {
            text: 'Copy & Go to Login',
            onPress: () => {
              // In a real app, you'd copy to clipboard here
              navigation.navigate('Login');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Reset Failed', 
        error.response?.data?.message || 'Username not found'
      );
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
          <Title style={styles.title}>Forgot Password</Title>
          <Text style={styles.subtitle}>Enter your username to reset password</Text>
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
          
          <Button
            mode="contained"
            onPress={handleForgotPassword}
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor="#4CAF50"
          >
            Reset Password
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.linkButton}
          >
            Back to Login
          </Button>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ You will receive a temporary password that you can use to login. 
            Please change it immediately after logging in.
          </Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
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
    marginTop: 16,
  },
  infoBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});
