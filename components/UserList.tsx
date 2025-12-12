
import React, { useState } from 'react';
import { User } from '../types';
import { Search, User as UserIcon, Trash2, Edit, Save, Plus, Shield, ShieldAlert, X } from 'lucide-react';

interface UserListProps {
  users: User[];
  onUpdateUser: (user: User) => void;
  onDeleteUser: (username: string) => void;
  currentUser: User;
}

export const UserList: React.FC<UserListProps> = ({ users, onUpdateUser, onDeleteUser, currentUser }) => {
  const [filterText, setFilterText] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(filterText.toLowerCase()) ||
    u.username.toLowerCase().includes(filterText.toLowerCase()) ||
    (u.registration && u.registration.includes(filterText))
  );

  const handleEdit = (user: User) => {
      setEditingUser({ ...user });
      setIsPasswordChanged(false);
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingUser) {
          onUpdateUser(editingUser);
          setEditingUser(null);
      }
  };

  const handleDelete = (username: string) => {
      if (username === currentUser.username) {
          alert("Você não pode excluir sua própria conta.");
          return;
      }
      if (confirm(`Tem certeza que deseja excluir o usuário ${username}?`)) {
          onDeleteUser(username);
      }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full flex flex-col animate-fade-in-up transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <div className="p-2 bg-brand-100 dark:bg-brand-900 rounded-lg text-brand-600 dark:text-brand-300">
                    <UserIcon size={24} />
                </div>
                Gestão de Usuários
            </h2>
        </div>

        {/* Busca */}
        <div className="mb-6 relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
             <input
                aria-label="Buscar usuários"
                type="text"
                placeholder="Buscar por nome, usuário ou matrícula..."
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
             />
        </div>

        {/* Lista */}
        <div className="overflow-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuário</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registro</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cargo</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map(u => (
                        <tr key={u.username} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 font-bold overflow-hidden border dark:border-gray-500">
                                        {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover"/> : u.name.charAt(0)}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">@{u.username}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {u.registration || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    u.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
                                    u.role === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                }`}>
                                    {u.role === 'ADMIN' ? 'Administrador' : u.role === 'PENDING' ? 'Pendente' : 'Usuário'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        aria-label="Editar usuário"
                                        onClick={() => handleEdit(u)} 
                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
                                        title="Editar"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button 
                                        aria-label="Excluir usuário"
                                        onClick={() => handleDelete(u.username)} 
                                        className={`p-2 rounded ${u.username === currentUser.username ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30'}`}
                                        disabled={u.username === currentUser.username}
                                        title={u.username === currentUser.username ? "Você não pode se excluir" : "Excluir"}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Modal de Edição */}
        {editingUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-2">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Editar Usuário</h3>
                        <button aria-label="Fechar" onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                            <input 
                                aria-label="Nome completo"
                                type="text" 
                                value={editingUser.name} 
                                onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Matrícula</label>
                            <input 
                                aria-label="Matrícula"
                                type="text" 
                                value={editingUser.registration || ''} 
                                onChange={e => setEditingUser({...editingUser, registration: e.target.value})}
                                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cargo / Permissão</label>
                            <select 
                                aria-label="Cargo"
                                value={editingUser.role} 
                                onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}
                                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md"
                            >
                                <option value="USER">Usuário Padrão</option>
                                <option value="ADMIN">Administrador</option>
                                <option value="PENDING">Pendente</option>
                            </select>
                        </div>
                        
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-100 dark:border-yellow-800 mt-2">
                             <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400 font-bold text-xs mb-2">
                                 <Shield size={14} /> Área Sensível
                             </div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova Senha (Opcional)</label>
                             <input 
                                aria-label="Nova senha"
                                type="password" 
                                placeholder="Deixe em branco para manter a atual"
                                value={isPasswordChanged ? editingUser.password : ''}
                                onChange={e => {
                                    setEditingUser({...editingUser, password: e.target.value});
                                    setIsPasswordChanged(true);
                                }}
                                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md"
                             />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button 
                                type="button" 
                                onClick={() => setEditingUser(null)} 
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 flex items-center gap-2"
                            >
                                <Save size={18} /> Salvar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};
