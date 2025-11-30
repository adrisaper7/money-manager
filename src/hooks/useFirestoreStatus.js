import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const useFirestoreStatus = (currentUserId) => {
    const [isFirestoreAvailable, setIsFirestoreAvailable] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!currentUserId) {
            setIsFirestoreAvailable(false);
            setErrorMessage('No user authenticated');
            return;
        }

        const checkFirestoreAccess = async () => {
            try {
                const testDoc = doc(db, 'users', currentUserId, 'financialData', 'main');
                await getDoc(testDoc);
                setIsFirestoreAvailable(true);
                setErrorMessage('');
                console.log('Firestore is accessible');
            } catch (error) {
                console.error('Firestore access error:', error);
                setIsFirestoreAvailable(false);
                let errorMsg = '';
                if (error.code === 'permission-denied') {
                    errorMsg = 'Firestore rules not configured. Data will be saved locally only.';
                } else if (error.code === 'unavailable') {
                    errorMsg = 'Firestore unavailable. Check your connection.';
                } else {
                    errorMsg = `Firestore error: ${error.message}`;
                }
                setErrorMessage(errorMsg);
            }
        };

        checkFirestoreAccess();
    }, [currentUserId]);

    return { isFirestoreAvailable, errorMessage };
};
