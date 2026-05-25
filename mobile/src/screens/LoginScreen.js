import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Title, Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
      if (error.code === 'ECONNABORTED') {
        Alert.alert(
          'Connection Timeout',
          'The server is taking longer than usual to respond. This may be due to server startup. Please try again in a moment.',
          [{ text: 'OK' }]
        );
      } else if (errorData?.status === 'PENDING_APPROVAL') {
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
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerOverlay} />
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Icon name="barn" size={40} color="white" />
            </View>
            <Title style={styles.title}>FarmTime</Title>
            <Text style={styles.subtitle}>Poultry Farm Management System</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.welcomeText}>Welcome Back!</Text>
              <Text style={styles.loginSubtext}>Sign in to continue</Text>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Icon name="account" size={20} color="#4CAF50" style={styles.inputIcon} />
                  <TextInput
                    label="Username"
                    value={username}
                    onChangeText={setUsername}
                    mode="outlined"
                    style={styles.input}
                    autoCapitalize="none"
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#4CAF50"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Icon name="lock" size={20} color="#4CAF50" style={styles.inputIcon} />
                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    outlineColor="#E0E0E0"
                    activeOutlineColor="#4CAF50"
                  />
                </View>

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  buttonColor="#4CAF50"
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Button
                  mode="text"
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={styles.linkButton}
                  textColor="#4CAF50"
                >
                  Forgot Password?
                </Button>
              </View>
            </Card.Content>
          </Card>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              textColor="#4CAF50"
              labelStyle={styles.registerButtonLabel}
            >
              Register Now
            </Button>
          </View>

          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 40,
    paddingBottom: 35,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  logoContainer: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
  },
  card: {
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    padding: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  loginSubtext: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 20,
    zIndex: 1,
  },
  input: {
    backgroundColor: 'white',
    paddingLeft: 40,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  linkButton: {
    marginTop: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 15,
    color: '#666',
  },
  registerButtonLabel: {
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 20,
  },
});
