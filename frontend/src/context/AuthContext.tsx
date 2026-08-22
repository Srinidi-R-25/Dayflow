'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Employee, UserRole } from '@/lib/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role: UserRole) => Promise<boolean>;
  signup: (employeeId: string, email: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUser = () => {
    const currentUser = api.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setRole(currentUser.role);
      const emp = api.getEmployeeById(currentUser.employeeId);
      setEmployee(emp || null);
    } else {
      setUser(null);
      setEmployee(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email: string, selectedRole: UserRole): Promise<boolean> => {
    setIsLoading(true);
    // Find matching employee or create demo record
    let emp = api.getEmployees().find(e => e.email.toLowerCase() === email.toLowerCase());
    
    if (!emp) {
      // Demo login fallback
      emp = api.getEmployeeById(selectedRole === 'ADMIN' ? 'EMP002' : 'EMP001');
    }

    if (emp) {
      const newUser: User = {
        id: emp.id,
        employeeId: emp.employeeId,
        email: emp.email,
        role: selectedRole,
        isVerified: true,
      };
      api.setCurrentUser(newUser);
      setUser(newUser);
      setEmployee(emp);
      setRole(selectedRole);
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const signup = async (employeeId: string, email: string, selectedRole: UserRole): Promise<boolean> => {
    setIsLoading(true);
    const existing = api.getEmployeeById(employeeId);
    let emp: Employee;
    
    if (existing) {
      emp = existing;
    } else {
      emp = api.addEmployee({
        employeeId,
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email,
        role: selectedRole,
        department: 'General',
        designation: selectedRole === 'ADMIN' ? 'HR Manager' : 'Team Member',
        joiningDate: new Date().toISOString().split('T')[0],
        phone: '+1 (555) 000-0000',
        address: '123 Enterprise Way, City, State',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        status: 'ACTIVE',
        salary: { basicPay: 5000, hra: 2000, allowances: 1000, deductions: 500, netSalary: 7500 }
      });
    }

    const newUser: User = {
      id: emp.id,
      employeeId: emp.employeeId,
      email,
      role: selectedRole,
      isVerified: true,
    };

    api.setCurrentUser(newUser);
    setUser(newUser);
    setEmployee(emp);
    setRole(selectedRole);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    api.setCurrentUser(null);
    setUser(null);
    setEmployee(null);
  };

  const switchRole = (newRole: UserRole) => {
    let targetEmp = employee;
    if (newRole === 'ADMIN') {
      targetEmp = api.getEmployeeById('EMP002') || employee;
    } else {
      targetEmp = api.getEmployeeById('EMP001') || employee;
    }

    if (targetEmp) {
      const updatedUser: User = {
        id: targetEmp.id,
        employeeId: targetEmp.employeeId,
        email: targetEmp.email,
        role: newRole,
        isVerified: true,
      };
      api.setCurrentUser(updatedUser);
      setUser(updatedUser);
      setEmployee(targetEmp);
      setRole(newRole);
    }
  };

  const refreshUserData = () => {
    loadUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        role,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        switchRole,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
