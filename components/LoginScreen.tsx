
import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, LogIn, AlertCircle, Hash, Moon, Sun, RefreshCw } from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  systemName: string;
  logoUrl: string;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onFactoryReset: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
    users, 
    onLogin, 
    onRegister, 
    systemName, 
    logoUrl, 
    isDarkMode, 
    onToggleTheme,
    onFactoryReset
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [registration, setRegistration] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isRegistering) {
       if (password !== confirmPassword) {
           setError('As senhas não coincidem.');
           return;
       }

       if (users.find(u => u.username === username)) {
           setError('Usuário já existe.');
           return;
       }
       const newUser: User = {
           username,
           password,
           name,
           registration,
           role: 'PENDING',
           avatarUrl: ''
       };
       onRegister(newUser);
       setSuccessMsg('Cadastro solicitado! Aguarde aprovação do administrador.');
       setIsRegistering(false);
       setUsername('');
       setPassword('');
       setConfirmPassword('');
       setName('');
       setRegistration('');
    } else {
       const user = users.find(u => u.username === username && u.password === password);
       if (user) {
           if (user.role === 'PENDING') {
               setError('Seu cadastro ainda está pendente de aprovação.');
           } else {
               onLogin(user);
           }
       } else {
           setError('Usuário ou senha incorretos.');
       }
    }
  };

  const toggleMode = () => {
      setIsRegistering(!isRegistering);
      setError('');
      setSuccessMsg('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setRegistration('');
  }
  
  const handleResetClick = () => {
      if(window.confirm("Isso apagará todos os dados salvos e restaurará o login padrão. Confirmar?")) {
          onFactoryReset();
      }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300 relative">
        
        {/* Botão de Alternar Tema - Absoluto Canto Superior Direito */}
        <button
            onClick={onToggleTheme}
            className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-md transition-colors"
            title={isDarkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
        >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="bg-brand-600 dark:bg-brand-800 p-8 flex flex-col items-center justify-center text-white">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 p-2 shadow-lg">
                    {logoUrl ? (
                         <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                         <span className="text-brand-600 font-bold text-4xl">{systemName[0]}</span>
                    )}
                </div>
                <h1 className="text-3xl font-bold">{systemName}</h1>
                <p className="text-brand-100 dark:text-brand-200 mt-2 text-center">Gestão Inteligente de Produção</p>
            </div>

            <div className="p-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
                    {isRegistering ? 'Criar Nova Conta' : 'Acesse sua Conta'}
                </h2>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
                {successMsg && (
                    <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                        <AlertCircle size={16} /> {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                                        placeholder="Seu nome"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Matrícula / Registro</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        value={registration}
                                        onChange={e => setRegistration(e.target.value)}
                                        className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                                        placeholder="Ex: 8576"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuário</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="Login"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="password" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="Senha"
                                required
                            />
                        </div>
                    </div>

                    {isRegistering && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="Confirme sua senha"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
                        {isRegistering ? 'Solicitar Acesso' : 'Entrar'} <LogIn size={20} />
                    </button>
                </form>

                <div className="mt-6 text-center space-y-4">
                    <button 
                        onClick={toggleMode}
                        className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 font-medium hover:underline block w-full"
                    >
                        {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem acesso? Cadastre-se'}
                    </button>
                    
                    <button 
                        onClick={handleResetClick}
                        className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center gap-1 w-full transition-colors"
                        title="Corrige o erro de senha inválida restaurando o usuário padrão"
                    >
                        <RefreshCw size={12} /> Resetar Banco de Dados
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
