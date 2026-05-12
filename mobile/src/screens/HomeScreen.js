import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { signOut } = useContext(AuthContext);

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
        <Paragraph style={styles.subtitle}>Poultry Farm Management System</Paragraph>
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
  logoutButton: {
    margin: 16,
    borderColor: '#F44336',
  },
});
