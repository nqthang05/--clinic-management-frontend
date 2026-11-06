import React, { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Khôi phục user từ LocalStorage khi F5 trình duyệt
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const data = await axiosClient.post('/auth/login', { username, password });
            // data trả về gồm: token, username, role
            localStorage.setItem('token', data.token);
            
            // TRONG AuthContext.jsx, SỬA LẠI DÒNG NÀY:
            const userInfo = { username: data.username || username, role: data.role };
            localStorage.setItem('user', JSON.stringify(userInfo));
            setUser(userInfo);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};