
import React, { useRef, useState } from 'react';
import { User, SystemConfig } from '../types';
import { User as UserIcon, Save, Image, Type, Database, Download, Upload, AlertTriangle, RefreshCw, List, Plus, X, Tag, Edit2 } from 'lucide-react';

interface SettingsScreenProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  systemConfig: SystemConfig;
  onUpdateSystemConfig: (config: SystemConfig) => void;
  availableMachineTypes: string[];
  setAvailableMachineTypes: (types: string[]) => void;
  availableMachineBrands: string[];
  setAvailableMachineBrands: (brands: string[]) => void;
  onExportData: () => void;
  onImportData: (data: any) => void;
  onFactoryReset?: () => void;
  onRenameType?: (oldName: string, newName: string) => void;
  onRenameBrand?: (oldName: string, newName: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
    user, 
    onUpdateUser, 
    systemConfig, 
    onUpdateSystemConfig,
    availableMachineTypes,
    setAvailableMachineTypes,
    availableMachineBrands,
    setAvailableMachineBrands,
    onExportData,
    onImportData,
    onFactoryReset,
    onRenameType,
    onRenameBrand
}) => {
  const [userName, setUserName] = React.useState(user.name);
  const [userAvatar, setUserAvatar] = React.useState(user.avatarUrl || '');
  const [userRegistration, setUserRegistration] = React.useState(user.registration || '');
  const [newPassword, setNewPassword] = React.useState('');
  
  const [sysName, setSysName] = React.useState(systemConfig.systemName);
  const [sysLogo, setSysLogo] = React.useState(systemConfig.logoUrl);

  const [newType, setNewType] = useState('');
  const [newBrand, setNewBrand] = useState('');

  // Estado de edição para listas
  const [editingItem, setEditingItem] = useState<{ type: 'TYPE' | 'BRAND', oldName: string } | null>(null);
  const [editItemValue, setEditItemValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = () => {
    onUpdateUser({
        ...user,
        name: userName,
        registration: userRegistration,
        avatarUrl: userAvatar,
        ...(newPassword ? { password: newPassword } : {})
    });
    alert('Perfil atualizado com sucesso!');
    setNewPassword('');
  };

  const handleSaveSystem = () => {
      onUpdateSystemConfig({
          systemName: sysName,
          logoUrl: sysLogo
      });
      alert('Configurações do sistema atualizadas!');
  };

  const handleAddType = () => {
      if (newType && !availableMachineTypes.includes(newType)) {
          setAvailableMachineTypes([...availableMachineTypes, newType]);
          setNewType('');
      }
  };

  const handleRemoveType = (type: string) => {
      if (window.confirm(`Remover o tipo de máquina "${type}" da lista de opções?`)) {
          setAvailableMachineTypes(availableMachineTypes.filter(t => t !== type));
      }
  };

  const handleAddBrand = () => {
      if (newBrand && !availableMachineBrands.includes(newBrand)) {
          setAvailableMachineBrands([...availableMachineBrands, newBrand]);
          setNewBrand('');
      }
  };

  const handleRemoveBrand = (brand: string) => {
      if (window.confirm(`Remover a marca "${brand}" da lista de opções?`)) {
          setAvailableMachineBrands(availableMachineBrands.filter(b => b !== brand));
      }
  };

  const startEdit = (type: 'TYPE' | 'BRAND', oldName: string) => {
      setEditingItem({ type, oldName });
      setEditItemValue(oldName);
  };

  const saveEdit = () => {
      if (!editingItem || !editItemValue.trim()) return;
      
      if (editingItem.type === 'TYPE' && onRenameType) {
          onRenameType(editingItem.oldName, editItemValue.trim());
      } else if (editingItem.type === 'BRAND' && onRenameBrand) {
          onRenameBrand(editingItem.oldName, editItemValue.trim());
      }
      setEditingItem(null);
      setEditItemValue('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target?.result as string);
            if (window.confirm("ATENÇÃO: Isso substituirá todos os dados atuais pelos dados do arquivo. Deseja continuar?")) {
                onImportData(json);
            }
        } catch (error) {
            alert("Erro ao ler o arquivo. Verifique se é um backup válido.");
            console.error(error);
        }
    };
    reader.readAsText(file);
    // Resetar valor do input para que o mesmo arquivo possa ser selecionado novamente se necessário
    event.target.value = '';
  };

  const confirmReset = () => {
      if (window.confirm("CUIDADO: Isso apagará TODOS os dados, incluindo máquinas criadas, usuários e históricos. O sistema voltará ao estado original. Tem certeza absoluta?")) {
          if (onFactoryReset) onFactoryReset();
      }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 h-full p-6 overflow-y-auto animate-fade-in-up transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Configurações</h2>
        
        {/* Seção de Backup e Restauração */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-blue-100 dark:border-blue-900 p-6 mb-8">
            <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                <Database size={20} /> Backup e Restauração de Dados
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Salve todos os dados do sistema (máquinas, histórico, usuários) em um arquivo local ou restaure de um backup anterior.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={onExportData}
                    className="flex-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 flex items-center justify-center gap-2 transition-colors"
                >
                    <Download size={18} />
                    <div className="text-left">
                        <div className="font-bold text-sm">Exportar Dados</div>
                        <div className="text-xs opacity-75">Salvar arquivo no dispositivo</div>
                    </div>
                </button>

                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-4 py-3 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center justify-center gap-2 transition-colors"
                >
                    <Upload size={18} />
                    <div className="text-left">
                        <div className="font-bold text-sm">Restaurar Backup</div>
                        <div className="text-xs opacity-75">Carregar arquivo do dispositivo</div>
                    </div>
                </button>
                <input 
                    type="file" 
                    accept=".json" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                />
            </div>
        </div>

        {/* Seção de Perfil */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 mb-8">
            <h3 className="text-lg font-bold text-brand-600 dark:text-brand-400 mb-4 flex items-center gap-2">
                <UserIcon size={20} /> Meu Perfil
            </h3>
            
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex items-center justify-center border-2 border-gray-100 dark:border-gray-500 shadow-inner">
                        {userAvatar ? (
                            <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-gray-400 dark:text-gray-300">{userName.charAt(0)}</span>
                        )}
                    </div>
                    <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-xs font-bold rounded-full uppercase">
                        {user.role}
                    </span>
                </div>
                
                <div className="flex-1 space-y-4 max-w-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome de Exibição</label>
                        <input type="text" value={userName} onChange={e => setUserName(e.target.value)} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Matrícula / Registro</label>
                        <input type="text" value={userRegistration} onChange={e => setUserRegistration(e.target.value)} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md" placeholder="Ex: 8576" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL da Foto de Perfil</label>
                        <input type="text" value={userAvatar} onChange={e => setUserAvatar(e.target.value)} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md" placeholder="https://exemplo.com/minha-foto.png" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova Senha</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md" placeholder="Digite para alterar..." />
                    </div>
                    
                    <div className="pt-2">
                         <button onClick={handleSaveProfile} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 text-sm font-medium">
                            <Save size={16} /> Salvar Perfil
                         </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Gerenciamento do Sistema (Apenas Admin) */}
        {user.role === 'ADMIN' && (
            <>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 mb-8">
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <List size={20} /> Gerenciar Listas de Opções
                    </h3>
                    
                    {editingItem && (
                         <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-3 rounded-lg flex items-center gap-3">
                             <div className="flex-1">
                                 <label className="block text-xs font-bold text-yellow-800 dark:text-yellow-400 uppercase mb-1">
                                     Editando {editingItem.type === 'TYPE' ? 'Tipo' : 'Marca'}: {editingItem.oldName}
                                 </label>
                                 <input 
                                    autoFocus
                                    type="text" 
                                    className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-1.5 rounded"
                                    value={editItemValue}
                                    onChange={e => setEditItemValue(e.target.value)}
                                 />
                             </div>
                             <div className="flex gap-2 self-end">
                                 <button onClick={saveEdit} className="bg-green-600 text-white p-2 rounded hover:bg-green-700"><Save size={16}/></button>
                                 <button onClick={() => setEditingItem(null)} className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500"><X size={16}/></button>
                             </div>
                         </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Gerenciamento de Tipos de Máquina */}
                        <div>
                            <h4 className="font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Type size={16} /> Tipos de Máquina
                            </h4>
                            <div className="flex gap-2 mb-3">
                                <input 
                                    type="text" 
                                    placeholder="Novo Tipo..." 
                                    className="flex-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1 text-sm"
                                    value={newType}
                                    onChange={e => setNewType(e.target.value)}
                                />
                                <button onClick={handleAddType} className="bg-green-600 text-white p-1 rounded hover:bg-green-700"><Plus size={18}/></button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availableMachineTypes.map(t => (
                                    <span key={t} className="bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-full text-xs flex items-center gap-1 group">
                                        {t}
                                        <button onClick={() => startEdit('TYPE', t)} className="text-gray-400 hover:text-blue-500 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={12}/></button>
                                        <button onClick={() => handleRemoveType(t)} className="text-gray-400 hover:text-red-500"><X size={12}/></button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Gerenciamento de Marcas de Máquina */}
                        <div>
                            <h4 className="font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Tag size={16} /> Marcas de Máquina
                            </h4>
                             <div className="flex gap-2 mb-3">
                                <input 
                                    type="text" 
                                    placeholder="Nova Marca..." 
                                    className="flex-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1 text-sm"
                                    value={newBrand}
                                    onChange={e => setNewBrand(e.target.value)}
                                />
                                <button onClick={handleAddBrand} className="bg-green-600 text-white p-1 rounded hover:bg-green-700"><Plus size={18}/></button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availableMachineBrands.map(b => (
                                    <span key={b} className="bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-full text-xs flex items-center gap-1 group">
                                        {b}
                                        <button onClick={() => startEdit('BRAND', b)} className="text-gray-400 hover:text-blue-500 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={12}/></button>
                                        <button onClick={() => handleRemoveBrand(b)} className="text-gray-400 hover:text-red-500"><X size={12}/></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 mb-8">
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <Image size={20} /> Aparência do Sistema
                    </h3>
                    
                    <div className="space-y-4 max-w-xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                <Type size={16} className="text-gray-400" /> Nome do Sistema
                            </label>
                            <input type="text" value={sysName} onChange={e => setSysName(e.target.value)} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                <Image size={16} className="text-gray-400" /> URL do Logo
                            </label>
                            <div className="flex gap-4 items-center">
                                <input type="text" value={sysLogo} onChange={e => setSysLogo(e.target.value)} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md" />
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded border dark:border-gray-600 flex items-center justify-center overflow-hidden shrink-0">
                                    {sysLogo && <img src={sysLogo} className="w-full h-full object-contain" />}
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-2 flex justify-end">
                            <button onClick={handleSaveSystem} className="bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-900 dark:hover:bg-gray-600 flex items-center gap-2 text-sm font-medium shadow-sm">
                                <Save size={16} /> Salvar Aparência
                            </button>
                        </div>
                    </div>
                </div>
            </>
        )}

        {/* Zona de Perigo */}
        <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/30 p-6 mt-10">
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                <AlertTriangle size={20} /> Zona de Perigo
            </h3>
            <p className="text-sm text-red-600 dark:text-red-300/70 mb-4">
                Ações irreversíveis que afetam todos os dados do sistema local.
            </p>
            <button 
                onClick={confirmReset}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
            >
                <RefreshCw size={16} /> Resetar Fábrica (Apagar Tudo)
            </button>
        </div>
    </div>
  );
};
