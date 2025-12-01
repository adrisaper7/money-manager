import { auth } from '../firebase';

// Función para verificar el estado de autenticación
export const checkAuthStatus = () => {
    const user = auth.currentUser;
    console.log('🔍 Auth Status Check:');
    console.log('- Current User:', user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        isAnonymous: user.isAnonymous
    } : 'No user');
    
    // Verificar persistencia
    console.log('- Auth Persistence:', auth.persistence);
    
    // Verificar si hay token
    if (user) {
        user.getIdToken().then(token => {
            console.log('- ID Token exists:', !!token);
            console.log('- Token length:', token.length);
        }).catch(error => {
            console.error('- Error getting token:', error);
        });
    }
    
    return user;
};

// Función para forzar la recarga del estado de autenticación
export const reloadAuthState = async () => {
    console.log('🔄 Reloading auth state...');
    try {
        const user = auth.currentUser;
        if (user) {
            await user.reload();
            console.log('✅ User reloaded successfully');
            return true;
        } else {
            console.log('⚠️ No user to reload');
            return false;
        }
    } catch (error) {
        console.error('❌ Error reloading user:', error);
        return false;
    }
};

// Función para verificar la sincronización de datos
export const checkDataSync = (userId, data) => {
    console.log('📊 Data Sync Check:');
    console.log('- User ID:', userId);
    console.log('- Data exists:', !!data);
    console.log('- Data length:', data?.length || 0);
    
    if (data && data.length > 0) {
        const latestMonth = data[data.length - 1];
        console.log('- Latest month:', latestMonth.monthLabel);
        console.log('- Latest month ID:', latestMonth.id);
        
        // Verificar integridad de datos
        const hasAssets = Object.keys(latestMonth.assets || {}).length > 0;
        const hasLiabilities = Object.keys(latestMonth.liabilities || {}).length > 0;
        const hasIncome = Object.keys(latestMonth.income || {}).length > 0;
        const hasExpenses = Object.keys(latestMonth.expenses || {}).length > 0;
        
        console.log('- Data integrity:', {
            hasAssets,
            hasLiabilities,
            hasIncome,
            hasExpenses
        });
    }
    
    return {
        hasUser: !!userId,
        hasData: data && data.length > 0,
        dataLength: data?.length || 0
    };
};

// Hacer funciones disponibles globalmente para debugging
if (typeof window !== 'undefined') {
    window.checkAuthStatus = checkAuthStatus;
    window.reloadAuthState = reloadAuthState;
    window.checkDataSync = checkDataSync;
    
    console.log('🔧 Auth debugging tools available:');
    console.log('- checkAuthStatus() - Check authentication status');
    console.log('- reloadAuthState() - Force reload user data');
    console.log('- checkDataSync(userId, data) - Check data synchronization');
}
