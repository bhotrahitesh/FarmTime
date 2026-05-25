import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import AnimatedCard from '../components/AnimatedCard';

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
      description: 'Manage salary, advances & deductions',
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
        <View style={styles.headerOverlay} />
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Title style={styles.title}>
                {userName || 'FarmTime Dashboard'}
              </Title>
            </View>
            {userRole === 'SUPER_ADMIN' && (
              <View style={styles.badge}>
                <Icon name="shield-star" size={16} color="#FFD700" />
                <Text style={styles.badgeText}>SUPER</Text>
              </View>
            )}
          </View>
          <Paragraph style={styles.subtitle}>
            Manage your farm workforce efficiently
          </Paragraph>
        </View>
      </View>

      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <AnimatedCard key={index} style={styles.card} onPress={item.onPress} index={index}>
            <Card.Content style={styles.cardContent}>
              <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                <Icon name={item.icon} size={40} color={item.color} />
              </View>
              <Title style={styles.cardTitle}>{item.title}</Title>
              <Paragraph style={styles.cardDescription}>{item.description}</Paragraph>
            </Card.Content>
          </AnimatedCard>
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
    backgroundColor: '#4CAF50',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerContent: {
    gap: 8,
    position: 'relative',
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  grid: {
    padding: 20,
    paddingTop: 24,
  },
  card: {
    marginBottom: 16,
    elevation: 3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    marginTop: 8,
    fontWeight: '600',
  },
  cardDescription: {
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
    marginTop: 4,
  },
  adminManagementButton: {
    margin: 20,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  logoutButton: {
    margin: 20,
    marginTop: 0,
    marginBottom: 30,
    borderColor: '#F44336',
    borderRadius: 12,
    borderWidth: 2,
  },
});
