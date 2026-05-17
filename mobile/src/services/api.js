import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API URL configuration
// Set USE_LOCAL_API to true for local development/testing
// Set USE_LOCAL_API to false to use production server (EC2 or Render)
const USE_LOCAL_API = false;

// Production API URLs - CURRENTLY USING EC2
const EC2_API_URL = 'http://13.127.116.232:8080/api';
const RENDER_API_URL = 'https://farmtime-backend-xzj0.onrender.com/api';

// ACTIVE: Using EC2 backend
const PRODUCTION_API_URL = EC2_API_URL;

// Local API URL configuration for different platforms
// iOS Simulator: localhost works
// Android Emulator: Use 10.0.2.2 (special alias to host machine's localhost)
// Physical Device: Use your computer's IP address (find with: ifconfig | grep "inet ")
const getLocalApiUrl = () => {
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    return 'http://10.0.2.2:8080/api';
  }
  // iOS simulator and default
  return 'http://localhost:8080/api';
};

const API_BASE_URL = USE_LOCAL_API ? getLocalApiUrl() : PRODUCTION_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds to handle cold starts
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = (username, password) => {
  return api.post('/auth/login', { username, password });
};

export const register = (data) => {
  return api.post('/auth/register', data);
};

export const forgotPassword = (username) => {
  return api.post('/auth/forgot-password', { username });
};

export const changePassword = (username, oldPassword, newPassword) => {
  return api.post('/auth/change-password', { username, oldPassword, newPassword });
};

// Admin Management APIs
export const getAllAdmins = () => {
  return api.get('/admin-management/admins');
};

export const getPendingAdmins = () => {
  return api.get('/admin-management/admins/pending');
};

export const approveAdmin = (adminId, role) => {
  return api.post(`/admin-management/admins/${adminId}/approve`, { role });
};

export const rejectAdmin = (adminId) => {
  return api.delete(`/admin-management/admins/${adminId}/reject`);
};

export const deactivateAdmin = (adminId) => {
  return api.put(`/admin-management/admins/${adminId}/deactivate`);
};

export const activateAdmin = (adminId) => {
  return api.put(`/admin-management/admins/${adminId}/activate`);
};

export const changeAdminRole = (adminId, role) => {
  return api.put(`/admin-management/admins/${adminId}/role`, { role });
};

// Employee APIs
export const getEmployees = () => {
  return api.get('/employees');
};

export const getActiveEmployees = () => {
  return api.get('/employees/active');
};

export const getEmployeeById = (id) => {
  return api.get(`/employees/${id}`);
};

export const createEmployee = (employee) => {
  return api.post('/employees', employee);
};

export const updateEmployee = (id, employee) => {
  return api.put(`/employees/${id}`, employee);
};

export const deleteEmployee = (id) => {
  return api.delete(`/employees/${id}`);
};

// Attendance APIs
export const getAttendanceByDateRange = (startDate, endDate) => {
  return api.get('/attendance', {
    params: { startDate, endDate },
  });
};

export const getAttendanceByEmployee = (employeeId, startDate, endDate) => {
  return api.get(`/attendance/employee/${employeeId}`, {
    params: { startDate, endDate },
  });
};

export const markAttendance = (attendance) => {
  return api.post('/attendance', attendance);
};

export const updateAttendance = (id, attendance) => {
  return api.put(`/attendance/${id}`, attendance);
};

export const deleteAttendance = (id) => {
  return api.delete(`/attendance/${id}`);
};

// Payment APIs
export const getPaymentsByDateRange = (startDate, endDate) => {
  return api.get('/payments', {
    params: { startDate, endDate },
  });
};

export const getPaymentsByEmployee = (employeeId) => {
  return api.get(`/payments/employee/${employeeId}`);
};

export const createPayment = (payment) => {
  return api.post('/payments', payment);
};

export const updatePayment = (id, payment) => {
  return api.put(`/payments/${id}`, payment);
};

export const deletePayment = (id) => {
  return api.delete(`/payments/${id}`);
};

// Time Off APIs
export const getTimeOffByEmployee = (employeeId) => {
  return api.get(`/timeoff/employee/${employeeId}`);
};

export const getTimeOffByDateRange = (startDate, endDate) => {
  return api.get('/timeoff', {
    params: { startDate, endDate },
  });
};

export const createTimeOff = (timeOff) => {
  return api.post('/timeoff', timeOff);
};

export const updateTimeOff = (id, timeOff) => {
  return api.put(`/timeoff/${id}`, timeOff);
};

export const deleteTimeOff = (id) => {
  return api.delete(`/timeoff/${id}`);
};

// Report APIs
export const exportAttendanceReport = (employeeIds, startDate, endDate) => {
  const params = { startDate, endDate };
  if (employeeIds && employeeIds.length > 0) {
    params.employeeIds = employeeIds;
  }
  return api.get('/reports/attendance/export', {
    params,
    responseType: 'blob',
  });
};

export const exportPaymentReport = (employeeIds, startDate, endDate) => {
  const params = { startDate, endDate };
  if (employeeIds && employeeIds.length > 0) {
    params.employeeIds = employeeIds;
  }
  return api.get('/reports/payments/export', {
    params,
    responseType: 'blob',
  });
};

export default api;
