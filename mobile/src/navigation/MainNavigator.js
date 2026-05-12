import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/HomeScreen';
import EmployeesScreen from '../screens/EmployeesScreen';
import AddEmployeeScreen from '../screens/AddEmployeeScreen';
import EmployeeDetailScreen from '../screens/EmployeeDetailScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import MarkAttendanceScreen from '../screens/MarkAttendanceScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import AddPaymentScreen from '../screens/AddPaymentScreen';
import TimeOffScreen from '../screens/TimeOffScreen';
import AddTimeOffScreen from '../screens/AddTimeOffScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function EmployeesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="EmployeesList" 
        component={EmployeesScreen}
        options={{ title: 'Employees' }}
      />
      <Stack.Screen 
        name="AddEmployee" 
        component={AddEmployeeScreen}
        options={{ title: 'Add Employee' }}
      />
      <Stack.Screen 
        name="EmployeeDetail" 
        component={EmployeeDetailScreen}
        options={{ title: 'Employee Details' }}
      />
    </Stack.Navigator>
  );
}

function AttendanceStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AttendanceList" 
        component={AttendanceScreen}
        options={{ title: 'Attendance' }}
      />
      <Stack.Screen 
        name="MarkAttendance" 
        component={MarkAttendanceScreen}
        options={{ title: 'Mark Attendance' }}
      />
    </Stack.Navigator>
  );
}

function PaymentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="PaymentsList" 
        component={PaymentsScreen}
        options={{ title: 'Payments' }}
      />
      <Stack.Screen 
        name="AddPayment" 
        component={AddPaymentScreen}
        options={{ title: 'Add Payment' }}
      />
    </Stack.Navigator>
  );
}

function TimeOffStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TimeOffList" 
        component={TimeOffScreen}
        options={{ title: 'Time Off' }}
      />
      <Stack.Screen 
        name="AddTimeOff" 
        component={AddTimeOffScreen}
        options={{ title: 'Add Time Off' }}
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Employees') {
            iconName = 'account-group';
          } else if (route.name === 'Attendance') {
            iconName = 'calendar-check';
          } else if (route.name === 'Payments') {
            iconName = 'currency-inr';
          } else if (route.name === 'TimeOff') {
            iconName = 'calendar-remove';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Employees" component={EmployeesStack} />
      <Tab.Screen name="Attendance" component={AttendanceStack} />
      <Tab.Screen name="Payments" component={PaymentsStack} />
      <Tab.Screen name="TimeOff" component={TimeOffStack} />
    </Tab.Navigator>
  );
}
