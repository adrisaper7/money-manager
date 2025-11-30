import React, { useState } from 'react';
import { LogOut } from 'lucide-react';

export const LoginView = ({ currentUser, onLogin, onRegister, onLogout, t }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        if (isRegistering) {
            const result = onRegister(username, password);
            if (result.success) {
                setIsError(false);
                setMessage(t('auth.messages.registerSuccess'));
                setIsRegistering(false);
                setUsername('');
                setPassword('');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setIsError(true);
                setMessage(result.message);
            }
        } else {
            const result = onLogin(username, password);
            if (result.success) {
                setIsError(false);
                setMessage(result.message);
                setUsername('');
                setPassword('');
                setTimeout(() => setMessage(''), 2000);
            } else {
                setIsError(true);
                setMessage(result.message);
            }
        }
    };

    if (currentUser) {
        return (
            <div className="flex items-center gap-4 px-4">
                <div className="flex flex-col items-end">
                    <p className="text-sm text-slate-500">{t('navigation.user')}</p>
                    <p className="font-semibold text-slate-800">{currentUser.name}</p>
                </div>
                <button
                    onClick={onLogout}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    title={t('navigation.logout')}
                >
                    <LogOut size={20} className="text-slate-600" />
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('auth.username')}
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={t('auth.usernamePlaceholder')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('auth.password')}
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('auth.passwordPlaceholder')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-sm ${
                        isError 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    {isRegistering ? t('auth.register') : t('auth.login')}
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-slate-600">O</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setIsRegistering(!isRegistering);
                        setMessage('');
                        setUsername('');
                        setPassword('');
                    }}
                    className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                    {isRegistering ? t('auth.toggleLogin') : t('auth.toggleRegister')}
                </button>
            </form>
        </div>
    );
};
