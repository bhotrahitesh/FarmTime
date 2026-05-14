import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Divider, Text, Badge, Appbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getPendingAdmins, getAllAdmins, approveAdmin, rejectAdmin, deactivateAdmin, activateAdmin } from '../services/api';

export default function AdminManagementScreen({ navigation }) {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPending, setShowPending] = useState(true);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const [pendingResponse, allResponse] = await Promise.all([
        getPendingAdmins(),
        getAllAdmins()
      ]);
      setPendingAdmins(pendingResponse.data);
      setAllAdmins(allResponse.data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdmins();
    setRefreshing(false);
  };

  const handleApprove = (admin) => {
    Alert.alert(
      'Approve Admin',
      `Approve ${admin.name} (${admin.username})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve as Admin',
          onPress: () => approveAdminWithRole(admin.id, 'ADMIN')
        },
        {
          text: 'Approve as Super Admin',
          onPress: () => approveAdminWithRole(admin.id, 'SUPER_ADMIN'),
          style: 'destructive'
        }
      ]
    );
  };

  const approveAdminWithRole = async (adminId, role) => {
    try {
      await approveAdmin(adminId, role);
      Alert.alert('Success', 'Admin approved successfully');
      loadAdmins();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to approve admin');
    }
  };

  const handleReject = (admin) => {
    Alert.alert(
      'Reject Admin',
      `Are you sure you want to reject ${admin.name} (${admin.username})? This will delete their account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectAdmin(admin.id);
              Alert.alert('Success', 'Admin rejected and deleted');
              loadAdmins();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to reject admin');
            }
          }
        }
      ]
    );
  };

  const handleToggleActive = async (admin) => {
    const action = admin.isActive ? 'deactivate' : 'activate';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Admin`,
      `Are you sure you want to ${action} ${admin.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: admin.isActive ? 'destructive' : 'default',
          onPress: async () => {
            try {
              if (admin.isActive) {
                await deactivateAdmin(admin.id);
              } else {
                await activateAdmin(admin.id);
              }
              Alert.alert('Success', `Admin ${action}d successfully`);
              loadAdmins();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || `Failed to ${action} admin`);
            }
          }
        }
      ]
    );
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return '#F44336';
      case 'ADMIN': return '#4CAF50';
      case 'PENDING': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const renderAdminCard = (admin, isPending = false) => (
    <Card key={admin.id} style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.adminInfo}>
            <Title style={styles.adminName}>{admin.name}</Title>
            <Paragraph style={styles.username}>@{admin.username}</Paragraph>
          </View>
          <View style={styles.badges}>
            <Chip 
              style={[styles.roleChip, { backgroundColor: getRoleColor(admin.role) }]}
              textStyle={styles.chipText}
            >
              {admin.role}
            </Chip>
            {!admin.isActive && (
              <Chip style={styles.inactiveChip} textStyle={styles.chipText}>
                INACTIVE
              </Chip>
            )}
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={16} color="#666" />
            <Text style={styles.detailText}>
              Registered: {new Date(admin.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {admin.approvedAt && (
            <View style={styles.detailRow}>
              <Icon name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.detailText}>
                Approved: {new Date(admin.approvedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {isPending ? (
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => handleApprove(admin)}
              style={[styles.actionButton, styles.approveButton]}
              buttonColor="#4CAF50"
            >
              Approve
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleReject(admin)}
              style={styles.actionButton}
              textColor="#F44336"
            >
              Reject
            </Button>
          </View>
        ) : (
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => handleToggleActive(admin)}
              style={styles.actionButton}
              textColor={admin.isActive ? '#F44336' : '#4CAF50'}
            >
              {admin.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="white" />
        <Appbar.Content title="Admin Management" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <View style={styles.header}>
        <Paragraph style={styles.headerSubtitle}>Manage user access and permissions</Paragraph>
      </View>

      <View style={styles.tabs}>
        <Button
          mode={showPending ? 'contained' : 'outlined'}
          onPress={() => setShowPending(true)}
          style={styles.tabButton}
          buttonColor={showPending ? '#FF9800' : undefined}
        >
          Pending ({pendingAdmins.length})
        </Button>
        <Button
          mode={!showPending ? 'contained' : 'outlined'}
          onPress={() => setShowPending(false)}
          style={styles.tabButton}
          buttonColor={!showPending ? '#4CAF50' : undefined}
        >
          All Admins ({allAdmins.length})
        </Button>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {showPending ? (
          pendingAdmins.length > 0 ? (
            pendingAdmins.map(admin => renderAdminCard(admin, true))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Icon name="check-all" size={64} color="#4CAF50" />
                <Title style={styles.emptyTitle}>No Pending Approvals</Title>
                <Paragraph style={styles.emptyText}>
                  All admin registrations have been reviewed
                </Paragraph>
              </Card.Content>
            </Card>
          )
        ) : (
          allAdmins.map(admin => renderAdminCard(admin, false))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  appbar: {
    backgroundColor: '#4CAF50',
  },
  appbarTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#4CAF50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
  },
  tabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 20,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  badges: {
    alignItems: 'flex-end',
    gap: 8,
  },
  roleChip: {
    height: 28,
  },
  inactiveChip: {
    height: 28,
    backgroundColor: '#9E9E9E',
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  approveButton: {
    flex: 1,
  },
  emptyCard: {
    marginTop: 40,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
});
