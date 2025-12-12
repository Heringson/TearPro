
import React, { useState, useMemo } from 'react';
import { Machine, MachineStatus, MachineType, MaintenanceRecord, CustomZoneNames } from '../types';
import { STATUS_OPTIONS, FACTORY_MODULES, TEAMS_PER_MODULE } from '../constants';
import { Search, Filter, Edit, MapPin, History, Save, AlertTriangle, Plus, Download, Clock, X, Trash2 } from 'lucide-react';
import { MaintenanceHistoryModal } from './MaintenanceHistoryModal';

interface MachineListProps {
  machines: Machine[];
  availableMachineTypes: string[];
  availableMachineBrands: string[];
  onUpdateMachine: (machine: Machine) => void;
  onCreateMachine: (machine: Machine) => void;
  onLocate: (machine: Machine) => void;
  onDeleteMachine: (id: string) => void;
  title?: string;
  defaultStatusFilter?: string;
  customZoneNames?: CustomZoneNames;
}

export const MachineList: React.FC<MachineListProps> = ({ 
    machines, 
    availableMachineTypes,
    availableMachineBrands,
    onUpdateMachine, 
    onCreateMachine, 
    onLocate, 
    onDeleteMachine, 
    title = "Inventário de Máquinas", 
    defaultStatusFilter = '',
    customZoneNames = {}
}) => {
  const [filterText, setFilterText] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>(defaultStatusFilter);
  const [filterModule, setFilterModule] = useState<string>('');
  const [filterTeam, setFilterTeam] = useState<string>('');
  const [filterPreparation, setFilterPreparation] = useState<string>('');
  
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewHistoryMachine, setViewHistoryMachine] = useState<Machine | null>(null);
  
  // Estado do Modal de Confirmação Personalizado
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [machineToSave, setMachineToSave] = useState<Machine | null>(null);
  
  // Estados para lógica de manutenção dentro do Modal de Edição
  const [maintenanceReason, setMaintenanceReason] = useState('');
  const [maintenanceStartDate, setMaintenanceStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [maintenanceEndDate, setMaintenanceEndDate] = useState('');

  // Extrair preparações únicas com contagens para melhor UX
  const preparationOptions = useMemo(() => {
    const counts = new Map<string, number>();
    machines.forEach(m => {
        if (m.preparation) {
            counts.set(m.preparation, (counts.get(m.preparation) || 0) + 1);
        }
    });
    return Array.from(counts.entries()).sort((a,b) => a[0].localeCompare(b[0]));
  }, [machines]);

  // Calcular contagens para Tipos de Máquina
  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    machines.forEach(m => {
        counts.set(m.type, (counts.get(m.type) || 0) + 1);
    });
    return counts;
  }, [machines]);

  const teamOptions = useMemo(() => Array.from({ length: TEAMS_PER_MODULE }, (_, i) => i + 1), []);

  const filteredMachines = useMemo(() => {
    return machines.filter(m => {
      // Filtrar estritamente por Patrimônio conforme solicitado
      const matchesText = m.patrimonio.toLowerCase().includes(filterText.toLowerCase());
      
      const matchesBrand = filterBrand ? m.brand === filterBrand : true;
      const matchesType = filterType ? m.type === filterType : true;
      const matchesStatus = filterStatus ? m.status === filterStatus : true;
      const matchesModule = filterModule ? m.moduleId === filterModule : true;
      const matchesTeam = filterTeam ? m.teamId === filterTeam : true;
      const matchesPreparation = filterPreparation ? m.preparation === filterPreparation : true;
      
      return matchesText && matchesBrand && matchesType && matchesStatus && matchesModule && matchesTeam && matchesPreparation;
    });
  }, [machines, filterText, filterBrand, filterType, filterStatus, filterModule, filterTeam, filterPreparation]);

  const handleExportCSV = () => {
    if (filteredMachines.length === 0) {
      alert("Não há dados para exportar com os filtros atuais.");
      return;
    }

    const headers = ["Patrimônio", "Marca/Modelo", "Tipo", "Preparação", "Status", "Módulo", "Time", "Observações"];
    
    const csvRows = filteredMachines.map(m => {
      // Escapar aspas e envolver campos em aspas para lidar com vírgulas dentro dos campos
      const safe = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
      
      return [
        safe(m.patrimonio),
        safe(m.brand),
        safe(m.type),
        safe(m.preparation),
        safe(m.status),
        safe(m.moduleId),
        safe(m.teamId),
        safe(m.notes || '')
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventario_maquinas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openCreateModal = () => {
    setIsCreating(true);
    setEditingMachine({
        id: `M-${Date.now()}`,
        patrimonio: '',
        brand: '',
        type: availableMachineTypes[0] || MachineType.RETA,
        preparation: 'Padrão',
        status: MachineStatus.DISPONIVEL,
        moduleId: FACTORY_MODULES[0],
        teamId: '1',
        notes: '',
        maintenanceLog: []
    });
    setMaintenanceReason('');
    setMaintenanceStartDate(new Date().toISOString().split('T')[0]);
    setMaintenanceEndDate('');
  };

  const openEditModal = (machine: Machine) => {
      setIsCreating(false);
      setEditingMachine({...machine}); // Create copy
      setMaintenanceReason('');
      setMaintenanceStartDate(new Date().toISOString().split('T')[0]);
      setMaintenanceEndDate('');
  };

  const handlePreSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMachine) {
      if (!editingMachine.patrimonio.trim()) { alert("Erro: O campo 'Patrimônio' é obrigatório."); return; }
      if (!editingMachine.type) { alert("Erro: O campo 'Tipo' é obrigatório."); return; }
      if (!editingMachine.preparation.trim()) { alert("Erro: O campo 'Preparação' é obrigatório."); return; }
      if (!editingMachine.moduleId) { alert("Erro: O campo 'Módulo' é obrigatório."); return; }
      if (!editingMachine.teamId) { alert("Erro: O campo 'Time' é obrigatório."); return; }
      
      // Verificação básica de duplicatas na Criação
      if (isCreating) {
          const exists = machines.some(m => m.patrimonio === editingMachine.patrimonio);
          if (exists) { alert("Erro: Já existe uma máquina com este Patrimônio."); return; }
      }

      // Lógica para adicionar registro de manutenção
      let updatedMachine = { ...editingMachine };
      
      // Se adicionando um novo registro de manutenção explicitamente
      if (maintenanceReason.trim()) {
          const newRecord: MaintenanceRecord = {
              id: Date.now().toString(),
              startDate: maintenanceStartDate,
              endDate: maintenanceEndDate || undefined,
              reason: maintenanceReason
          };
          updatedMachine.maintenanceLog = [...(updatedMachine.maintenanceLog || []), newRecord];
          
          // Atualizar status automaticamente se manutenção
          if (updatedMachine.status === MachineStatus.DISPONIVEL || updatedMachine.status === MachineStatus.EM_USO) {
             updatedMachine.status = MachineStatus.MANUTENCAO;
          }
      } 
      
      // Fechar automaticamente registro de manutenção aberto se status mudar de Manutenção/Indisponível para Disponível
      const originalMachine = isCreating ? null : machines.find(m => m.id === editingMachine.id);
      if (originalMachine) {
          const wasMaintenance = originalMachine.status === MachineStatus.MANUTENCAO || originalMachine.status === MachineStatus.INDISPONIVEL;
          const isNowAvailable = editingMachine.status === MachineStatus.DISPONIVEL || editingMachine.status === MachineStatus.EM_USO || editingMachine.status === MachineStatus.EM_ESPERA;
          
          if (wasMaintenance && isNowAvailable) {
              // Encontrar o último registro aberto e fechá-lo
              const logs = [...(updatedMachine.maintenanceLog || [])];
              const lastLogIndex = logs.length - 1;
              if (lastLogIndex >= 0 && !logs[lastLogIndex].endDate) {
                  logs[lastLogIndex].endDate = new Date().toISOString().split('T')[0];
                  updatedMachine.maintenanceLog = logs;
              }
          }
      }

      // Acionar modal de confirmação personalizado
      setMachineToSave(updatedMachine);
      setShowConfirmModal(true);
    }
  };

  const executeSave = () => {
    if (machineToSave) {
        if (isCreating) {
            onCreateMachine(machineToSave);
        } else {
            onUpdateMachine(machineToSave);
        }
        setEditingMachine(null);
        setIsCreating(false);
        setMachineToSave(null);
        setShowConfirmModal(false);
    }
  };

  const handleDeleteClick = (machine: Machine) => {
      if(window.confirm(`Tem certeza que deseja excluir a máquina ${machine.patrimonio}?`)) {
          onDeleteMachine(machine.id);
      }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full flex flex-col relative animate-fade-in-up transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <div className="p-2 bg-brand-100 dark:bg-brand-900 rounded-lg text-brand-600 dark:text-brand-300">
              <Filter size={24} />
            </div>
            {title}
          </h2>
          <div className="flex gap-2">
            <button onClick={handleExportCSV} aria-label="Exportar CSV" className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm transition-colors">
                <Download size={20} /> Exportar CSV
            </button>
            <button onClick={openCreateModal} aria-label="Nova Máquina" className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-700 shadow-sm transition-colors">
                <Plus size={20} /> Nova Máquina
            </button>
          </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 mb-6">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar Patrimônio..."
            aria-label="Buscar por patrimônio"
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          {filterText && (
            <button 
              onClick={() => setFilterText('')}
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <select
          aria-label="Filtrar por Marca"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
        >
          <option value="">Marca/Modelo</option>
          {availableMachineBrands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        
        <select
          aria-label="Filtrar por Tipo"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Tipos</option>
          {availableMachineTypes.map(t => (
            <option key={t} value={t}>{t} ({typeCounts.get(t) || 0})</option>
          ))}
        </select>

        <select
          aria-label="Filtrar por Preparação"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          value={filterPreparation}
          onChange={(e) => setFilterPreparation(e.target.value)}
        >
          <option value="">Preparação</option>
          {preparationOptions.map(([prep, count]) => (
            <option key={prep} value={prep}>{prep} ({count})</option>
          ))}
        </select>

        <select
          aria-label="Filtrar por Status"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          aria-label="Filtrar por Módulo"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
        >
          <option value="">Módulo</option>
          {FACTORY_MODULES.map(m => (
            <option key={m} value={m}>{m === 'OUTROS' ? 'OUTROS' : m === 'TREINAMENTO' ? 'TREINAMENTO' : `Módulo ${m}`}</option>
          ))}
        </select>

        <select
          aria-label="Filtrar por Time"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
        >
          <option value="">Time</option>
          {teamOptions.map(t => (
            <option key={t} value={t.toString()}>Time {t}</option>
          ))}
        </select>

        <div className="flex items-center justify-end lg:col-span-7">
             <button 
                onClick={() => {
                    setFilterText(''); setFilterBrand(''); setFilterType(''); setFilterStatus('');
                    setFilterModule(''); setFilterTeam(''); setFilterPreparation('');
                }}
                className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 underline"
             >
                Limpar Filtros
             </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-auto flex-1">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patrimônio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Marca/Modelo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preparação</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Local</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredMachines.map((machine) => {
              const isOthers = machine.moduleId === 'OUTROS';
              const isTraining = machine.moduleId === 'TREINAMENTO';
              const customZone = isOthers ? customZoneNames[machine.teamId] : undefined;
              const localDisplay = isOthers 
                ? (customZone ? `OUTROS - ${customZone}` : `OUTROS - Prat. ${machine.teamId}`)
                : isTraining
                    ? `TREINAMENTO - Time ${machine.teamId}`
                    : `Mód ${machine.moduleId} - Time ${machine.teamId}`;

              return (
              <tr key={machine.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {machine.patrimonio}
                    {machine.notes && <div className="text-xs text-gray-400 mt-1 truncate max-w-[150px]">{machine.notes}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{machine.brand || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{machine.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{machine.preparation}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {localDisplay}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full 
                    ${machine.status === MachineStatus.DISPONIVEL ? 'bg-green-100 text-green-800' : 
                      machine.status === MachineStatus.MANUTENCAO ? 'bg-red-100 text-red-800' : 
                      machine.status === MachineStatus.EM_USO ? 'bg-blue-100 text-blue-800' :
                      machine.status === MachineStatus.EM_ESPERA ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {(machine.status === MachineStatus.MANUTENCAO || machine.status === MachineStatus.INDISPONIVEL) && (
                        <AlertTriangle size={12} className="mr-1" />
                    )}
                     {machine.status === MachineStatus.EM_ESPERA && (
                        <Clock size={12} className="mr-1" />
                    )}
                    {machine.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                  <button onClick={() => setViewHistoryMachine(machine)} aria-label="Histórico de Manutenção" className="text-gray-500 hover:text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:text-white p-1.5 rounded transition-colors" title="Histórico de Manutenção">
                    <History size={18} />
                  </button>
                  <button onClick={() => onLocate(machine)} aria-label="Localizar no Mapa" className="text-brand-600 hover:text-brand-900 bg-brand-50 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:text-brand-300 p-1.5 rounded transition-colors" title="Localizar">
                    <MapPin size={18} />
                  </button>
                  <button onClick={() => openEditModal(machine)} aria-label="Editar Máquina" className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:text-indigo-300 p-1.5 rounded transition-colors" title="Editar">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDeleteClick(machine)} aria-label="Excluir Máquina" className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded transition-colors" title="Excluir">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        {filteredMachines.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            Nenhuma máquina encontrada com os filtros atuais.
          </div>
        )}
      </div>

      {/* Modal de Histórico */}
      {viewHistoryMachine && (
          <MaintenanceHistoryModal 
            machine={viewHistoryMachine} 
            onClose={() => setViewHistoryMachine(null)} 
          />
      )}

      {/* Modal de Confirmação Personalizado */}
      {showConfirmModal && machineToSave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-sm w-full animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4 text-brand-600 dark:text-brand-400">
                    <AlertTriangle size={32} />
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Confirmar Ação</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {isCreating 
                        ? "Deseja adicionar esta nova máquina ao inventário?" 
                        : `Deseja salvar as alterações na máquina ${machineToSave.patrimonio}?`}
                </p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => { setShowConfirmModal(false); setMachineToSave(null); }} 
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={executeSave} 
                        className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 font-medium shadow-sm"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Sobreposição do Modal de Edição/Criação */}
      {editingMachine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                {isCreating ? <Plus size={20} /> : <Edit size={20} />}
                {isCreating ? 'Nova Máquina' : 'Editar Máquina'}
            </h3>
            <form onSubmit={handlePreSave} className="space-y-4">
              
              {/* Informações Básicas */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Patrimônio <span className="text-red-500">*</span></label>
                    <input aria-label="Patrimônio" type="text" value={editingMachine.patrimonio} onChange={e => setEditingMachine({...editingMachine, patrimonio: e.target.value})} className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca/Modelo</label>
                    <input 
                        aria-label="Marca ou Modelo"
                        list="brands-list" 
                        value={editingMachine.brand || ''} 
                        onChange={e => setEditingMachine({...editingMachine, brand: e.target.value})} 
                        className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2" 
                        placeholder="Selecione ou digite..." 
                    />
                    <datalist id="brands-list">
                        {availableMachineBrands.map(brand => <option key={brand} value={brand} />)}
                    </datalist>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo <span className="text-red-500">*</span></label>
                    <input 
                        aria-label="Tipo de Máquina"
                        list="types-list"
                        value={editingMachine.type} 
                        onChange={e => setEditingMachine({...editingMachine, type: e.target.value as MachineType})} 
                        className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2" 
                        required
                        placeholder="Selecione ou digite novo tipo..."
                    />
                     <datalist id="types-list">
                      {availableMachineTypes.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                  </div>
              </div>

              {/* Status e Preparação */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <select aria-label="Status" value={editingMachine.status} onChange={e => setEditingMachine({...editingMachine, status: e.target.value as MachineStatus})} className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2">
                      {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preparação <span className="text-red-500">*</span></label>
                    <input aria-label="Preparação" type="text" value={editingMachine.preparation} onChange={e => setEditingMachine({...editingMachine, preparation: e.target.value})} className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2" required />
                 </div>
              </div>

              {/* Localização */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Localização</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Módulo <span className="text-red-500">*</span></label>
                        <select aria-label="Módulo" value={editingMachine.moduleId} onChange={e => setEditingMachine({...editingMachine, moduleId: e.target.value})} className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2" required>
                            {FACTORY_MODULES.map(m => <option key={m} value={m}>{m === 'OUTROS' ? 'OUTROS' : m === 'TREINAMENTO' ? 'TREINAMENTO' : `Módulo ${m}`}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{editingMachine.moduleId === 'OUTROS' ? 'Corredor/Prateleira' : 'Time'} <span className="text-red-500">*</span></label>
                        <select aria-label="Time ou Corredor" value={editingMachine.teamId} onChange={e => setEditingMachine({...editingMachine, teamId: e.target.value})} className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2" required>
                            {teamOptions.map(t => <option key={t} value={t.toString()}>{editingMachine.moduleId === 'OUTROS' ? `Corredor ${t}` : `Time ${t}`}</option>)}
                        </select>
                    </div>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observações</label>
                <textarea aria-label="Observações" value={editingMachine.notes || ''} onChange={e => setEditingMachine({...editingMachine, notes: e.target.value})} className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2" rows={2} />
              </div>

              {/* Seção Adicionar Registro de Manutenção */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                      <History size={16} /> Adicionar Registro de Manutenção
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-md border border-orange-100 dark:border-orange-800 space-y-3">
                      <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Motivo da Manutenção</label>
                          <input aria-label="Motivo da manutenção" type="text" value={maintenanceReason} onChange={e => setMaintenanceReason(e.target.value)} placeholder="Ex: Troca de agulha, Motor quebrado..." className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Data Início</label>
                            <input aria-label="Data de início" type="date" value={maintenanceStartDate} onChange={e => setMaintenanceStartDate(e.target.value)} className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Data Fim (Opcional)</label>
                            <input aria-label="Data de término" type="date" value={maintenanceEndDate} onChange={e => setMaintenanceEndDate(e.target.value)} className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2 text-sm" />
                          </div>
                      </div>
                  </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={() => { setEditingMachine(null); setIsCreating(false); }} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-white bg-brand-600 rounded-md hover:bg-brand-700 shadow-sm flex items-center gap-2">
                    <Save size={18} /> {isCreating ? 'Salvar' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
