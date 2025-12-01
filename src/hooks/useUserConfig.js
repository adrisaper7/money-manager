import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { initialConfig } from '../constants';
import { useFirestoreStatus } from './useFirestoreStatus';

export const useUserConfig = (currentUserId) => {
    const [config, setConfig] = useState(initialConfig);
    const [isLoading, setIsLoading] = useState(true);
    const { isFirestoreAvailable } = useFirestoreStatus(currentUserId);

    // Get user document reference
    const getUserDocRef = () => {
        if (!currentUserId) return null;
        return doc(db, 'users', currentUserId);
    };

    // Load user configuration
    useEffect(() => {
        if (!currentUserId) {
            console.log('⏸️ No current user, using default config');
            setIsLoading(false);
            return;
        }

        console.log('🔄 Loading user config for:', currentUserId);
        setIsLoading(true);

        // If Firestore is available, try to use it
        if (isFirestoreAvailable === true) {
            const userDocRef = getUserDocRef();
            if (!userDocRef) {
                console.log('❌ No user doc ref available');
                setIsLoading(false);
                return;
            }

            console.log('📡 Loading config from Firestore for user:', currentUserId);
            const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
                console.log('📡 Firestore config snapshot received:', docSnapshot.exists());
                if (docSnapshot.exists()) {
                    const firestoreData = docSnapshot.data();
                    const userConfig = firestoreData.config || initialConfig;
                    console.log('✅ Config loaded from Firestore:', userConfig);
                    setConfig(userConfig);
                    
                    // Also save to localStorage as backup
                    const storageKey = `fireConfig_${currentUserId}_v1`;
                    try {
                        localStorage.setItem(storageKey, JSON.stringify(userConfig));
                        console.log('✅ Config backed up to localStorage');
                    } catch (err) {
                        console.error('❌ Error backing up config to localStorage:', err);
                    }
                } else {
                    console.log('⚠️ No config in Firestore, checking localStorage...');
                    // Check localStorage first
                    const storageKey = `fireConfig_${currentUserId}_v1`;
                    const savedConfig = localStorage.getItem(storageKey);
                    if (savedConfig) {
                        try {
                            const parsedConfig = JSON.parse(savedConfig);
                            console.log('✅ Found config in localStorage:', parsedConfig);
                            setConfig(parsedConfig);
                            // Save to Firestore
                            setDoc(userDocRef, { config: parsedConfig }, { merge: true })
                                .then(() => console.log('✅ Local config migrated to Firestore'))
                                .catch(error => console.error('❌ Error migrating config to Firestore:', error));
                        } catch (err) {
                            console.error('❌ Error parsing config from localStorage:', err);
                            setConfig(initialConfig);
                        }
                    } else {
                        console.log('⚠️ No config found anywhere, using default...');
                        // Use default config and save it
                        setConfig(initialConfig);
                        setDoc(userDocRef, { config: initialConfig }, { merge: true })
                            .then(() => console.log('✅ Default config saved to Firestore'))
                            .catch(error => console.error('❌ Error saving default config to Firestore:', error));
                    }
                }
                setIsLoading(false);
            }, (error) => {
                console.error('❌ Error loading config from Firestore:', error);
                console.log('🔄 Falling back to localStorage due to Firestore error');
                // Fallback to localStorage
                const storageKey = `fireConfig_${currentUserId}_v1`;
                const savedConfig = localStorage.getItem(storageKey);
                if (savedConfig) {
                    try {
                        const parsedConfig = JSON.parse(savedConfig);
                        console.log('✅ Loaded config from localStorage fallback:', parsedConfig);
                        setConfig(parsedConfig);
                    } catch (err) {
                        console.error('❌ Error parsing config from localStorage:', err);
                        setConfig(initialConfig);
                    }
                } else {
                    console.log('⚠️ No config in localStorage, using default');
                    setConfig(initialConfig);
                }
                setIsLoading(false);
            });

            return () => unsubscribe();
        } else {
            console.log('📱 Firestore not available, using localStorage only');
            // Fallback to localStorage only
            const storageKey = currentUserId ? `fireConfig_${currentUserId}_v1` : 'fireConfig_es_v1';
            try {
                const savedConfig = localStorage.getItem(storageKey);
                if (savedConfig) {
                    const parsedConfig = JSON.parse(savedConfig);
                    console.log('✅ Config loaded from localStorage:', parsedConfig);
                    setConfig(parsedConfig);
                } else {
                    console.log('⚠️ No config in localStorage, using default');
                    setConfig(initialConfig);
                }
            } catch (err) {
                console.error('❌ Error loading config from localStorage:', err);
                setConfig(initialConfig);
            }
            setIsLoading(false);
        }
    }, [currentUserId, isFirestoreAvailable]);

    // Save config to Firestore on change
    useEffect(() => {
        if (!isLoading && currentUserId) {
            console.log('☁️ Saving config to Firebase only for user:', currentUserId);
            console.log('☁️ Config to save:', config);
            const userDocRef = getUserDocRef();
            if (userDocRef && isFirestoreAvailable === true) {
                // Save to Firestore only
                setDoc(userDocRef, { config }, { merge: true })
                    .then(() => console.log('☁️ Config saved successfully to Firebase'))
                    .catch(error => {
                        console.error('❌ Error saving config to Firebase:', error);
                        console.log('⚠️ Config not saved - Firebase unavailable');
                    });
            } else {
                console.log('⚠️ Firebase not available - config not saved');
            }
        } else {
            console.log('⏸️ Not saving config - loading:', isLoading, 'userId:', currentUserId);
        }
    }, [config, currentUserId, isLoading, isFirestoreAvailable]);

    const updateConfig = (newConfig) => {
        console.log('🔄 Updating config:', newConfig);
        setConfig(newConfig);
    };

    return {
        config,
        isLoading,
        updateConfig
    };
};
