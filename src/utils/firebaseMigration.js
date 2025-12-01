import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Función para migrar todos los datos de Firebase a localStorage
export const migrateFirebaseToLocalStorage = async (userId) => {
    if (!userId) {
        console.error('❌ No se puede migrar sin userId');
        return false;
    }

    console.log('🔄 Iniciando migración de Firebase a localStorage para usuario:', userId);

    try {
        // 1. Migrar datos financieros (data)
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Guardar datos financieros
            if (userData.data) {
                const storageKey = `fireData_${userId}_v1`;
                localStorage.setItem(storageKey, JSON.stringify(userData.data));
                console.log('✅ Datos financieros migrados a localStorage:', userData.data.length, 'meses');
            }
            
            // Guardar configuración
            if (userData.config) {
                const configKey = `fireConfig_${userId}_v1`;
                localStorage.setItem(configKey, JSON.stringify(userData.config));
                console.log('✅ Configuración migrada a localStorage:', userData.config);
            }
        } else {
            console.log('⚠️ No se encontraron datos en Firebase para el usuario:', userId);
        }

        // 2. Verificar que los datos se guardaron correctamente
        const dataKey = `fireData_${userId}_v1`;
        const configKey = `fireConfig_${userId}_v1`;
        
        const savedData = localStorage.getItem(dataKey);
        const savedConfig = localStorage.getItem(configKey);
        
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            console.log('✅ Verificación - Datos en localStorage:', parsedData.length, 'meses');
        }
        
        if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig);
            console.log('✅ Verificación - Config en localStorage:', parsedConfig);
        }

        console.log('🎉 Migración completada con éxito');
        return true;

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        return false;
    }
};

// Función para verificar el estado de la migración
export const checkMigrationStatus = (userId) => {
    if (!userId) return { hasData: false, hasConfig: false };
    
    const dataKey = `fireData_${userId}_v1`;
    const configKey = `fireConfig_${userId}_v1`;
    
    const hasData = !!localStorage.getItem(dataKey);
    const hasConfig = !!localStorage.getItem(configKey);
    
    return {
        hasData,
        hasConfig,
        dataCount: hasData ? JSON.parse(localStorage.getItem(dataKey)).length : 0
    };
};

// Función para forzar la migración desde el navegador
const forceMigration = async () => {
    // Obtener el userId del localStorage actual
    const currentUserKey = Object.keys(localStorage).find(key => key.startsWith('fireApp_user_'));
    
    if (!currentUserKey) {
        console.error('❌ No se encontró usuario actual en localStorage');
        alert('No se encontró usuario actual. Por favor, inicia sesión primero.');
        return false;
    }
    
    try {
        const userData = JSON.parse(localStorage.getItem(currentUserKey));
        const userId = userData.uid;
        
        if (!userId) {
            console.error('❌ No se encontró userId en los datos del usuario');
            return false;
        }
        
        console.log('🔄 Forzando migración para usuario:', userId);
        const success = await migrateFirebaseToLocalStorage(userId);
        
        if (success) {
            alert('✅ Migración completada con éxito. Los datos ahora están guardados localmente.');
            // Recargar la página para que los cambios surtan efecto
            window.location.reload();
        } else {
            alert('❌ Error durante la migración. Revisa la consola para más detalles.');
        }
        
        return success;
    } catch (error) {
        console.error('❌ Error al forzar migración:', error);
        alert('❌ Error al forzar migración. Revisa la consola para más detalles.');
        return false;
    }
};

// Función para verificar el estado desde el navegador
const checkStatus = (userId) => {
    if (!userId) return { hasData: false, hasConfig: false };
    
    const dataKey = `fireData_${userId}_v1`;
    const configKey = `fireConfig_${userId}_v1`;
    
    const hasData = !!localStorage.getItem(dataKey);
    const hasConfig = !!localStorage.getItem(configKey);
    
    return {
        hasData,
        hasConfig,
        dataCount: hasData ? JSON.parse(localStorage.getItem(dataKey)).length : 0
    };
};

// Exportar las funciones
export { forceMigration as forceFirebaseMigration };
