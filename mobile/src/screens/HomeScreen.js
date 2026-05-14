import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { signOut } = useContext(AuthContext);
  const [userRole, setUserRole] = useState('ADMIN');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadUserInfo();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const loadUserInfo = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      const name = await AsyncStorage.getItem('userName');
      setUserRole(role || 'ADMIN');
      setUserName(name || '');
    } catch (error) {
      // Silently fail - user info will use defaults
    }
  };

  const menuItems = [
    {
      title: 'Employees',
      description: 'Manage employee information',
      icon: 'account-group',
      color: '#2196F3',
      onPress: () => navigation.navigate('Employees'),
    },
    {
      title: 'Attendance',
      description: 'Track daily attendance',
      icon: 'calendar-check',
      color: '#4CAF50',
      onPress: () => navigation.navigate('Attendance'),
    },
    {
      title: 'Payments',
      description: 'Manage salary and advances',
      icon: 'currency-inr',
      color: '#FF9800',
      onPress: () => navigation.navigate('Payments'),
    },
    {
      title: 'Time Off',
      description: 'Track holidays and leaves',
      icon: 'calendar-remove',
      color: '#F44336',
      onPress: () => navigation.navigate('TimeOff'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>FarmTime Dashboard</Title>
        <Paragraph style={styles.subtitle}>
          {userName ? `${getGreeting()}, ${userName}!` : getGreeting()}
        </Paragraph>
        {userRole === 'SUPER_ADMIN' && (
          <Paragraph style={styles.roleTag}>Super Admin</Paragraph>
        )}
      </View>

      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <Card key={index} style={styles.card} onPress={item.onPress}>
            <Card.Content style={styles.cardContent}>
              <Icon name={item.icon} size={48} color={item.color} />
              <Title style={styles.cardTitle}>{item.title}</Title>
              <Paragraph style={styles.cardDescription}>{item.description}</Paragraph>
            </Card.Content>
          </Card>
        ))}
      </View>

      {userRole === 'SUPER_ADMIN' && (
        <Button
          mode="contained"
          onPress={() => navigation.navigate('AdminManagement')}
          style={styles.adminManagementButton}
          buttonColor="#9C27B0"
          icon="shield-account"
        >
          Admin Management
        </Button>
      )}

      <Button
        mode="outlined"
        onPress={signOut}
        style={styles.logoutButton}
        textColor="#F44336"
      >
        Logout
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 4,
  },
  roleTag: {
    fontSize: 12,
    color: '#FFD700',
    marginTop: 8,
    fontWeight: 'bold',
  },
  grid: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardContent: {
    alignItems: 'center',
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    marginTop: 12,
  },
  cardDescription: {
    textAlign: 'center',
    color: '#666',
  },
  adminManagementButton: {
    margin: 16,
    marginBottom: 8,
  },
  logoutButton: {
    margin: 16,
    marginTop: 0,
    borderColor: '#F44336',
  },
});
