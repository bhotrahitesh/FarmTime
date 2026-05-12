import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your computer's IP address when testing on physical device
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

export const register = (username, password, name) => {
  return api.post('/auth/register', { username, password, name });
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

export default api;
