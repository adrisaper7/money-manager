# Configuración de Firestore para Money Manager

## Pasos para configurar Firestore:

### 1. Ir a la consola de Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `moneymanager-daddf`

### 2. Configurar Firestore Database
1. En el menú izquierdo, ve a **Firestore Database**
2. Si no está creado, haz clic en "Crear base de datos"
3. Elige "Iniciar en modo de prueba" (luego cambiaremos las reglas)
4. Selecciona una ubicación para la base de datos
5. Haz clic en "Habilitar"

### 3. Configurar Reglas de Seguridad
1. En Firestore Database, ve a la pestaña **Reglas**
2. Reemplaza el contenido con:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to authenticated users for their own data
    match /users/{userId}/financialData/{document} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Haz clic en **Publicar**

### 4. (Opcional) Usar Firebase CLI
Si prefieres usar la línea de comandos:

1. Instala Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Inicia sesión:
```bash
firebase login
```

3. Inicializa Firebase en tu proyecto:
```bash
firebase init firestore
```

4. Despliega las reglas:
```bash
firebase deploy --only firestore:rules
```

## Estructura de Datos

Los datos se guardarán en la siguiente estructura:

```
users/
  {userId}/
    financialData/
      main/
        data: [
          {
            id: "2024-11",
            monthLabel: "nov 2024",
            income: {...},
            taxes: {...},
            expenses: {...},
            assets: {...},
            liabilities: {...},
            collaboratesInDebt: false,
            debtCollaboration: {...}
          }
        ]
```

## Verificación

Una vez configurado, la aplicación debería:
- Mostrar "Datos guardados en la nube" cuando Firestore está disponible
- Sincronizar datos automáticamente entre dispositivos
- Guardar datos localmente como respaldo

## Solución de Problemas

### Error "permission-denied"
- Verifica que las reglas de seguridad estén configuradas correctamente
- Asegúrate de que el usuario esté autenticado

### Error "unavailable"
- Verifica tu conexión a internet
- Revisa que Firestore esté habilitado en tu proyecto

### Datos no se sincronizan
- Revisa la consola del navegador para ver errores
- Verifica que el usuario tenga el UID correcto
