import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { FAB, Card, Title, Paragraph, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getAttendanceByDateRange } from '../services/api';

export default function AttendanceScreen({ navigation }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, [])
  );

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const response = await getAttendanceByDateRange(startDate, endDate);
      setAttendance(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const renderAttendance = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title>{item.employeeName}</Title>
          <Chip
            mode="flat"
            style={[styles.chip, item.isPresent ? styles.present : styles.absent]}
          >
            {item.isPresent ? 'Present' : 'Absent'}
          </Chip>
        </View>
        <Paragraph>Date: {new Date(item.attendanceDate).toLocaleDateString('en-IN')}</Paragraph>
        <Paragraph>Check In: {item.checkInTime}</Paragraph>
        {item.checkOutTime && (
          <Paragraph>Check Out: {item.checkOutTime}</Paragraph>
        )}
        {item.notes && <Paragraph>Notes: {item.notes}</Paragraph>}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={attendance}
        renderItem={renderAttendance}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadAttendance}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('MarkAttendance')}
        color="white"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chip: {
    minWidth: 80,
  },
  present: {
    backgroundColor: '#4CAF50',
  },
  absent: {
    backgroundColor: '#F44336',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});
