import { useState, useEffect, useCallback } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import { useLanguage } from './useLanguage';

const formatUsernameEmail = (username = '') => {
    const normalized = username.trim().toLowerCase();
    if (!normalized) return '';
    return `${normalized}@fireapp.local`;
};

const getFriendlyMessage = (code, fallbackMessage, t) => {
    const messages = {
        'auth/email-already-in-use': t('auth.messages.userAlreadyExists'),
        'auth/weak-password': t('auth.messages.passwordMinLength'),
        'auth/user-not-found': t('auth.messages.userNotFound'),
        'auth/wrong-password': t('auth.messages.incorrectPassword'),
        'auth/too-many-requests': 'Too many requests. Try again later',
        'auth/invalid-email': 'Email format is invalid',
        'auth/network-request-failed': 'Could not contact server. Check your connection.',
        'auth/internal-error': 'The server had a problem. Try again in a few seconds.'
    };
    return messages[code] || fallbackMessage || t('auth.messages.loginSuccess');
};

export const useUser = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser({
                    id: user.uid,
                    name: user.displayName || user.email?.split('@')[0] || 'Usuario'
                });
            } else {
                setCurrentUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const registerUser = useCallback(async (username, password) => {
        if (!username || username.trim() === '') {
            return { success: false, message: t('auth.messages.usernameRequired') };
        }

        if (!password || password.length < 6) {
            return { success: false, message: t('auth.messages.passwordMinLength') };
        }

        try {
            const email = formatUsernameEmail(username);
            const credentials = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(credentials.user, { displayName: username.trim() });

            return { success: true, message: t('auth.messages.registerSuccess') };
        } catch (error) {
            return { success: false, message: getFriendlyMessage(error.code, error.message, t) };
        }
    }, [t]);

    const loginUser = useCallback(async (username, password) => {
        if (!username || username.trim() === '') {
            return { success: false, message: t('auth.messages.usernameRequired') };
        }

        if (!password) {
            return { success: false, message: t('auth.messages.passwordRequired') };
        }

        try {
            const email = formatUsernameEmail(username);
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true, message: t('auth.messages.loginSuccess') };
        } catch (error) {
            return { success: false, message: getFriendlyMessage(error.code, error.message, t) };
        }
    }, [t]);

    const logoutUser = useCallback(async () => {
        await signOut(auth);
    }, []);

    return {
        currentUser,
        isLoading,
        loginUser,
        registerUser,
        logoutUser
    };
};
