
import React from 'react';
import { LayoutDashboard, Map, List, AlertTriangle, Settings, LogOut, Users, Moon, Sun } from 'lucide-react';
import { User, SystemConfig } from '../types';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  user: User;
  onLogout: () => void;
  systemConfig: SystemConfig;
  maintenanceCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    activePage, 
    onNavigate, 
    user, 
    onLogout, 
    systemConfig, 
    maintenanceCount,
    isDarkMode,
    onToggleTheme
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Localização', icon: Map },
    { id: 'inventory', label: 'Inventário', icon: List },
    { id: 'maintenance', label: 'Manutenção', icon: AlertTriangle, badge: maintenanceCount },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  // Adicionar aba Usuários apenas se usuário for ADMIN
  if (user.role === 'ADMIN') {
    // Inserir antes de Configurações
    menuItems.splice(4, 0, { id: 'users', label: 'Usuários', icon: Users });
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col shadow-lg z-20 transition-colors duration-300">
        {/* Cabeçalho */}
        <div className="p-6 flex flex-col items-center gap-3 border-b border-gray-100 dark:border-gray-700 text-center">
            <div className="w-24 h-24 rounded-lg flex items-center justify-center overflow-hidden mb-2">
                {systemConfig.logoUrl ? (
                    <img src={systemConfig.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                    <div className="w-full h-full bg-brand-600 text-white flex items-center justify-center font-bold text-3xl rounded-lg">
                        {systemConfig.systemName[0]}
                    </div>
                )}
            </div>
            <h1 className="font-bold text-gray-800 dark:text-gray-100 text-lg tracking-tight leading-none">{systemConfig.systemName}</h1>
        </div>

        {/* Cartão do Usuário */}
        <div className="p-4">
             <div className="bg-brand-50 dark:bg-gray-700/50 p-3 rounded-lg flex items-center gap-3 border border-brand-100 dark:border-gray-600">
                <div className="w-10 h-10 rounded-full bg-brand-200 dark:bg-gray-600 flex items-center justify-center text-brand-700 dark:text-gray-200 font-bold border-2 border-white dark:border-gray-500 shadow-sm overflow-hidden shrink-0">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                    ) : (
                         user.name.charAt(0)
                    )}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate" title={`${user.name} ${user.registration ? `(${user.registration})` : ''}`}>
                        {user.name} {user.registration && <span className="text-gray-500 dark:text-gray-400 font-normal">({user.registration})</span>}
                    </p>
                    <p className="text-xs text-brand-600 dark:text-brand-400 font-medium uppercase">{user.role}</p>
                </div>
             </div>
             <button onClick={() => onNavigate('settings')} className="w-full mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center justify-center gap-1 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                <Settings size={12} /> Editar Perfil
             </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        activePage === item.id 
                        ? 'bg-brand-50 dark:bg-gray-700 text-brand-700 dark:text-white shadow-sm border border-brand-100 dark:border-gray-600' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200 border border-transparent'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <item.icon size={20} className={activePage === item.id ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'} />
                        {item.label}
                    </div>
                    {item.badge && item.badge > 0 && (
                        <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                            {item.badge}
                        </span>
                    )}
                </button>
            ))}
        </nav>

        {/* Rodapé e Alternância de Tema */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
            <button
                onClick={onToggleTheme}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
            </button>
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
                <LogOut size={18} /> Sair
            </button>
        </div>
    </div>
  );
};
