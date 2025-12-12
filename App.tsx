
import React, { useState, useEffect } from 'react';
import { Machine, User, ProductReference, SystemConfig, MachineStatus, CustomZoneNames, MachineType } from './types';
import { INITIAL_MACHINES, INITIAL_REFERENCES, INITIAL_ADMIN_USER, DEFAULT_LOGO_URL, DEFAULT_SYSTEM_NAME, MACHINE_BRANDS, MACHINE_TYPE_OPTIONS } from './constants';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FactoryMap } from './components/FactoryMap';
import { MachineList } from './components/MachineList';
import { ProductionBatch } from './components/ProductionBatch';
import { SettingsScreen } from './components/SettingsScreen';
import { UserList } from './components/UserList';
import { Menu } from 'lucide-react';

// Chaves para LocalStorage
const STORAGE_KEYS = {
    MACHINES: 'dl_machines_v1',
    USERS: 'dl_users_v1',
    REFS: 'dl_refs_v1',
    ZONES: 'dl_zones_v1',
    CONFIG: 'dl_config_v1',
    THEME: 'dl_theme_v1',
    TYPES: 'dl_types_v1',
    BRANDS: 'dl_brands_v1'
};

// Auxiliar para carregar dados com fallback
const loadData = <T,>(key: string, fallback: T): T => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
        console.error(`Erro ao carregar dados para ${key}`, e);
        return fallback;
    }
};

const App: React.FC = () => {
  // Carregar estado inicial do LocalStorage ou usar Constantes
  const [user, setUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>(() => 
      loadData(STORAGE_KEYS.USERS, [INITIAL_ADMIN_USER])
  );
  
  const [machines, setMachines] = useState<Machine[]>(() => 
      loadData(STORAGE_KEYS.MACHINES, INITIAL_MACHINES)
  );
  
  const [references, setReferences] = useState<ProductReference[]>(() => 
      loadData(STORAGE_KEYS.REFS, INITIAL_REFERENCES)
  );
  
  const [customZoneNames, setCustomZoneNames] = useState<CustomZoneNames>(() => 
      loadData(STORAGE_KEYS.ZONES, {})
  );

  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => 
      loadData(STORAGE_KEYS.CONFIG, {
          systemName: DEFAULT_SYSTEM_NAME,
          logoUrl: DEFAULT_LOGO_URL
      })
  );

  // Listas Dinâmicas para Tipos e Marcas
  const [availableMachineTypes, setAvailableMachineTypes] = useState<string[]>(() => 
      loadData(STORAGE_KEYS.TYPES, MACHINE_TYPE_OPTIONS)
  );

  const [availableMachineBrands, setAvailableMachineBrands] = useState<string[]>(() => 
      loadData(STORAGE_KEYS.BRANDS, MACHINE_BRANDS)
  );

  const [activePage, setActivePage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [highlightedMachineId, setHighlightedMachineId] = useState<string | null>(null);
  
  // Estado do Tema
  const [isDarkMode, setIsDarkMode] = useState(() => {
      return localStorage.getItem(STORAGE_KEYS.THEME) === 'true';
  });

  // --- EFEITOS DE PERSISTÊNCIA ---
  // Sempre que esses estados mudarem, salvar no LocalStorage automaticamente
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(machines)); }, [machines]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.REFS, JSON.stringify(references)); }, [references]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(customZoneNames)); }, [customZoneNames]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(systemConfig)); }, [systemConfig]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TYPES, JSON.stringify(availableMachineTypes)); }, [availableMachineTypes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(availableMachineBrands)); }, [availableMachineBrands]);
  
  useEffect(() => {
      localStorage.setItem(STORAGE_KEYS.THEME, String(isDarkMode));
      if (isDarkMode) {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Estatísticas para barra lateral
  const maintenanceCount = machines.filter(m => m.status === MachineStatus.MANUTENCAO || m.status === MachineStatus.INDISPONIVEL).length;

  const handleLogin = (u: User) => setUser(u);
  const handleRegister = (u: User) => setUsers([...users, u]);
  const handleLogout = () => setUser(null);

  // Manipuladores para Operações de Máquinas
  const handleCreateMachine = (newMachine: Machine) => {
      // Se a nova máquina tiver um tipo ou marca não listado, adicionar automaticamente
      if (newMachine.type && !availableMachineTypes.includes(newMachine.type)) {
          setAvailableMachineTypes(prev => [...prev, newMachine.type].sort());
      }
      if (newMachine.brand && !availableMachineBrands.includes(newMachine.brand)) {
          setAvailableMachineBrands(prev => [...prev, newMachine.brand].sort());
      }
      setMachines([...machines, newMachine]);
      alert('Máquina criada com sucesso!');
  };

  const handleUpdateMachine = (updatedMachine: Machine) => {
       // Se atualizando para um tipo/marca não listado, adicionar automaticamente
       if (updatedMachine.type && !availableMachineTypes.includes(updatedMachine.type)) {
        setAvailableMachineTypes(prev => [...prev, updatedMachine.type].sort());
       }
       if (updatedMachine.brand && !availableMachineBrands.includes(updatedMachine.brand)) {
        setAvailableMachineBrands(prev => [...prev, updatedMachine.brand].sort());
       }
      setMachines(machines.map(m => m.id === updatedMachine.id ? updatedMachine : m));
  };

  const handleDeleteMachine = (id: string) => {
      setMachines(machines.filter(m => m.id !== id));
  };

  const handleLocateMachine = (machine: Machine) => {
      setActivePage('map');
      setHighlightedMachineId(machine.id);
      setTimeout(() => setHighlightedMachineId(null), 5000); 
  };

  // Manipuladores para Gerenciamento de Lista (Renomear/Excluir)
  const handleRenameType = (oldName: string, newName: string) => {
      if (!newName.trim() || availableMachineTypes.includes(newName)) return;
      
      // 1. Atualizar Lista
      setAvailableMachineTypes(prev => prev.map(t => t === oldName ? newName : t).sort());
      
      // 2. Atualizar Máquinas
      setMachines(prev => prev.map(m => m.type === oldName ? { ...m, type: newName } : m));
      
      // 3. Atualizar Referências (Requisitos)
      setReferences(prev => prev.map(ref => ({
        ...ref,
        requirements: ref.requirements.map(req => req.machineType === oldName ? { ...req, machineType: newName } : req)
      })));
  };

  const handleRenameBrand = (oldName: string, newName: string) => {
      if (!newName.trim() || availableMachineBrands.includes(newName)) return;

      // 1. Atualizar Lista
      setAvailableMachineBrands(prev => prev.map(b => b === oldName ? newName : b).sort());

      // 2. Atualizar Máquinas
      setMachines(prev => prev.map(m => m.brand === oldName ? { ...m, brand: newName } : m));
  };


  // Manipuladores para Operações de Referência
  const handleSaveReference = (ref: ProductReference) => {
      const exists = references.find(r => r.id === ref.id);
      if (exists) {
          setReferences(references.map(r => r.id === ref.id ? ref : r));
      } else {
          setReferences([...references, ref]);
      }
  };

  const handleDeleteReference = (id: string) => {
      setReferences(references.filter(r => r.id !== id));
  };

  // Manipuladores para Atualizações de Usuário/Config
  const handleUpdateUser = (updatedUser: User) => {
      setUsers(users.map(u => u.username === updatedUser.username ? updatedUser : u));
      if (user && user.username === updatedUser.username) {
          setUser(updatedUser);
      }
  };

  const handleDeleteUser = (username: string) => {
      setUsers(users.filter(u => u.username !== username));
  };

  const handleUpdateZoneName = (teamId: string, newName: string) => {
      setCustomZoneNames(prev => ({
          ...prev,
          [teamId]: newName
      }));
  };

  // --- LÓGICA DE EXPORTAÇÃO/IMPORTAÇÃO DE DADOS ---
  const handleExportData = () => {
      const dataToSave = {
          machines,
          users,
          references,
          customZoneNames,
          systemConfig,
          availableMachineTypes,
          availableMachineBrands,
          exportDate: new Date().toISOString(),
          version: '1.1'
      };

      const jsonString = JSON.stringify(dataToSave, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_${systemConfig.systemName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const handleImportData = (data: any) => {
      if (!data) return;
      
      if (data.machines) setMachines(data.machines);
      if (data.users) setUsers(data.users);
      if (data.references) setReferences(data.references);
      if (data.customZoneNames) setCustomZoneNames(data.customZoneNames);
      if (data.systemConfig) setSystemConfig(data.systemConfig);
      if (data.availableMachineTypes) setAvailableMachineTypes(data.availableMachineTypes);
      if (data.availableMachineBrands) setAvailableMachineBrands(data.availableMachineBrands);

      if (user) {
          const updatedCurrentUser = data.users?.find((u: User) => u.username === user.username);
          if (updatedCurrentUser) {
              setUser(updatedCurrentUser);
          }
      }

      alert('Dados importados com sucesso!');
  };

  // Forçar Reset de Fábrica / Limpar Tudo
  const handleFactoryReset = () => {
      // Definir explicitamente arrays vazios para "Zerarmos" o sistema
      const cleanMachines: Machine[] = []; 
      const cleanUsers: User[] = [INITIAL_ADMIN_USER]; 
      const cleanRefs: ProductReference[] = []; 
      
      localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(cleanMachines));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(cleanUsers));
      localStorage.setItem(STORAGE_KEYS.REFS, JSON.stringify(cleanRefs));
      localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify({}));
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({
           systemName: DEFAULT_SYSTEM_NAME,
           logoUrl: DEFAULT_LOGO_URL
      }));
      // Resetar listas para constantes padrão
      localStorage.setItem(STORAGE_KEYS.TYPES, JSON.stringify(MACHINE_TYPE_OPTIONS));
      localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(MACHINE_BRANDS));
      
      window.location.reload();
  };

  if (!user) {
      return (
          <LoginScreen 
            users={users} 
            onLogin={handleLogin} 
            onRegister={handleRegister} 
            systemName={systemConfig.systemName}
            logoUrl={systemConfig.logoUrl}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
            onFactoryReset={handleFactoryReset}
          />
      );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-300">
        {/* Barra Lateral Desktop */}
        <div className="hidden md:flex h-full">
            <Sidebar 
                activePage={activePage} 
                onNavigate={setActivePage} 
                user={user} 
                onLogout={handleLogout}
                systemConfig={systemConfig}
                maintenanceCount={maintenanceCount}
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
            />
        </div>

        {/* Cabeçalho Mobile */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-30 p-4 flex justify-between items-center shadow-sm">
             <div className="font-bold text-gray-800 dark:text-white">{systemConfig.systemName}</div>
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-800 dark:text-white">
                 <Menu size={20}/>
             </button>
        </div>

        {/* Sobreposição da Barra Lateral Mobile */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-64 h-full bg-white dark:bg-gray-800 shadow-xl" onClick={e => e.stopPropagation()}>
                    <Sidebar 
                        activePage={activePage} 
                        onNavigate={(p) => { setActivePage(p); setMobileMenuOpen(false); }} 
                        user={user} 
                        onLogout={handleLogout}
                        systemConfig={systemConfig}
                        maintenanceCount={maintenanceCount}
                        isDarkMode={isDarkMode}
                        onToggleTheme={toggleTheme}
                    />
                </div>
            </div>
        )}

        {/* Área Principal de Conteúdo */}
        <main className="flex-1 h-full overflow-hidden relative md:pt-0 pt-16">
            <div className="h-full w-full">
                {activePage === 'dashboard' && (
                    <Dashboard 
                        machines={machines} 
                        availableMachineTypes={availableMachineTypes}
                        availableMachineBrands={availableMachineBrands}
                        onNavigate={setActivePage} 
                    />
                )}
                {activePage === 'map' && (
                    <FactoryMap 
                        machines={machines} 
                        highlightedMachineId={highlightedMachineId}
                        customZoneNames={customZoneNames}
                        onUpdateZoneName={handleUpdateZoneName}
                    />
                )}
                {activePage === 'inventory' && (
                    <MachineList 
                        machines={machines} 
                        availableMachineTypes={availableMachineTypes}
                        availableMachineBrands={availableMachineBrands}
                        onCreateMachine={handleCreateMachine} 
                        onUpdateMachine={handleUpdateMachine}
                        onDeleteMachine={handleDeleteMachine}
                        onLocate={handleLocateMachine}
                        customZoneNames={customZoneNames}
                    />
                )}
                {activePage === 'maintenance' && (
                    <MachineList 
                        machines={machines} 
                        availableMachineTypes={availableMachineTypes}
                        availableMachineBrands={availableMachineBrands}
                        onCreateMachine={handleCreateMachine} 
                        onUpdateMachine={handleUpdateMachine}
                        onDeleteMachine={handleDeleteMachine}
                        onLocate={handleLocateMachine}
                        title="Máquinas Indisponíveis / Manutenção"
                        defaultStatusFilter={MachineStatus.MANUTENCAO}
                        customZoneNames={customZoneNames}
                    />
                )}
                {activePage === 'references' && (
                    <ProductionBatch 
                        machines={machines} 
                        availableMachineTypes={availableMachineTypes}
                        onSelectMachine={handleLocateMachine}
                        references={references}
                        onSaveReference={handleSaveReference}
                        onDeleteReference={handleDeleteReference}
                    />
                )}
                {activePage === 'users' && user.role === 'ADMIN' && (
                    <UserList 
                        users={users}
                        onUpdateUser={handleUpdateUser}
                        onDeleteUser={handleDeleteUser}
                        currentUser={user}
                    />
                )}
                {activePage === 'settings' && (
                    <SettingsScreen 
                        user={user} 
                        onUpdateUser={handleUpdateUser} 
                        systemConfig={systemConfig} 
                        onUpdateSystemConfig={setSystemConfig}
                        availableMachineTypes={availableMachineTypes}
                        setAvailableMachineTypes={setAvailableMachineTypes}
                        availableMachineBrands={availableMachineBrands}
                        setAvailableMachineBrands={setAvailableMachineBrands}
                        onExportData={handleExportData}
                        onImportData={handleImportData}
                        onFactoryReset={handleFactoryReset}
                        onRenameType={handleRenameType}
                        onRenameBrand={handleRenameBrand}
                    />
                )}
            </div>
        </main>
    </div>
  );
};

export default App;
