import { useState, useEffect } from 'react';

export const useUser = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize user from localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem('fireApp_currentUser');
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    // Get all registered users
    const getAllUsers = () => {
        const usersJson = localStorage.getItem('fireApp_users');
        return usersJson ? JSON.parse(usersJson) : {};
    };

    // Save users to localStorage
    const saveUsers = (users) => {
        localStorage.setItem('fireApp_users', JSON.stringify(users));
    };

    // Register a new user
    const registerUser = (username, password) => {
        if (!username || username.trim() === '') {
            return { success: false, message: 'Por favor ingresa un nombre de usuario' };
        }
        
        if (!password || password.length < 4) {
            return { success: false, message: 'La contraseña debe tener al menos 4 caracteres' };
        }

        const users = getAllUsers();
        const usernameLower = username.toLowerCase().trim();

        if (users[usernameLower]) {
            return { success: false, message: 'Este usuario ya existe' };
        }

        // Store user with hashed password (simple hash for demo)
        users[usernameLower] = {
            username: username,
            password: btoa(password) // Simple base64 encoding (not secure for production)
        };

        saveUsers(users);
        return { success: true, message: 'Usuario registrado exitosamente' };
    };

    // Login user
    const loginUser = (username, password) => {
        if (!username || username.trim() === '') {
            return { success: false, message: 'Por favor ingresa un nombre de usuario' };
        }

        if (!password) {
            return { success: false, message: 'Por favor ingresa una contraseña' };
        }

        const users = getAllUsers();
        const usernameLower = username.toLowerCase().trim();

        if (!users[usernameLower]) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        const storedPassword = users[usernameLower].password;
        const providedPassword = btoa(password);

        if (storedPassword !== providedPassword) {
            return { success: false, message: 'Contraseña incorrecta' };
        }

        const user = { 
            id: usernameLower, 
            name: users[usernameLower].username
        };

        setCurrentUser(user);
        localStorage.setItem('fireApp_currentUser', JSON.stringify(user));
        return { success: true, message: 'Sesión iniciada' };
    };

    // Logout user
    const logoutUser = () => {
        setCurrentUser(null);
        localStorage.removeItem('fireApp_currentUser');
    };

    return {
        currentUser,
        isLoading,
        loginUser,
        registerUser,
        logoutUser
    };
};
