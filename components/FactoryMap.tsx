
import React, { useMemo, useState, useEffect } from 'react';
import { Machine, MachineStatus, CustomZoneNames } from '../types';
import { FACTORY_MODULES, STATUS_OPTIONS } from '../constants';
import { Map as MapIcon, CheckCircle, Wrench, Ban, Clock, MousePointerClick, Archive, Box, Search, Filter, Navigation, Edit2, Save, X, GraduationCap } from 'lucide-react';

interface FactoryMapProps {
  machines: Machine[];
  highlightedMachineId?: string | null;
  customZoneNames?: CustomZoneNames;
  onUpdateZoneName?: (teamId: string, newName: string) => void;
}

export const FactoryMap: React.FC<FactoryMapProps> = ({ 
    machines, 
    highlightedMachineId,
    customZoneNames = {},
    onUpdateZoneName
}) => {
  const [highlightedModuleId, setHighlightedModuleId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [moduleSearch, setModuleSearch] = useState('');

  // Estado de edição para nomes de zonas: { teamId: string } ou null
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [tempZoneName, setTempZoneName] = useState('');

  // Rolagem automática quando highlightedMachineId muda
  useEffect(() => {
    if (highlightedMachineId) {
        const machine = machines.find(m => m.id === highlightedMachineId);
        if (machine) {
            scrollToModule(machine.moduleId);
        }
    }
  }, [highlightedMachineId, machines]);

  // Filtrar máquinas primeiro
  const filteredMachines = useMemo(() => {
      return machines.filter(m => {
          const matchesText = filterText === '' || 
              m.patrimonio.toLowerCase().includes(filterText.toLowerCase()) ||
              m.type.toLowerCase().includes(filterText.toLowerCase()) ||
              m.brand.toLowerCase().includes(filterText.toLowerCase());
          
          const matchesStatus = filterStatus === '' || m.status === filterStatus;

          return matchesText && matchesStatus;
      });
  }, [machines, filterText, filterStatus]);
  
  // Estrutura: Map<ID_Modulo, Map<ID_Time, Machine[]>>
  const structure = useMemo(() => {
    const map = new Map<string, Map<string, Machine[]>>();
    
    // Inicializar estrutura
    FACTORY_MODULES.forEach(mod => {
        const teamMap = new Map<string, Machine[]>();
        // Inicializar times 1-5
        for(let i=1; i<=5; i++) {
            teamMap.set(i.toString(), []);
        }
        map.set(mod, teamMap);
    });

    // Preencher com máquinas FILTRADAS
    filteredMachines.forEach(m => {
      const moduleTeams = map.get(m.moduleId);
      if (moduleTeams) {
        let teamList = moduleTeams.get(m.teamId); 
        if (!teamList) {
            teamList = [];
            moduleTeams.set(m.teamId, teamList);
        }
        teamList.push(m);
      }
    });

    return map;
  }, [filteredMachines]);

  const getStatusColor = (status: MachineStatus | string) => {
    switch (status) {
      case MachineStatus.DISPONIVEL: return 'bg-green-500';
      case MachineStatus.EM_USO: return 'bg-blue-500';
      case MachineStatus.MANUTENCAO: return 'bg-red-500';
      case MachineStatus.EM_ESPERA: return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: MachineStatus | string) => {
    switch (status) {
      case MachineStatus.DISPONIVEL: return <CheckCircle size={10} className="text-white" />;
      case MachineStatus.MANUTENCAO: return <Wrench size={10} className="text-white" />;
      case MachineStatus.EM_USO: return <div className="text-[8px] text-white font-bold">U</div>;
      case MachineStatus.EM_ESPERA: return <Clock size={10} className="text-white" />;
      default: return <Ban size={10} className="text-white" />;
    }
  };

  const scrollToModule = (moduleId: string) => {
      setHighlightedModuleId(moduleId);
      const element = document.getElementById(`module-${moduleId}`);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  };

  const handleModuleSearch = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setModuleSearch(val);
      if (val) scrollToModule(val);
  };

  const startEditingZone = (teamId: string, currentName: string) => {
      setEditingZoneId(teamId);
      setTempZoneName(currentName);
  };

  const saveZoneName = (teamId: string) => {
      if (onUpdateZoneName) {
          onUpdateZoneName(teamId, tempZoneName);
      }
      setEditingZoneId(null);
  };

  const cancelEditingZone = () => {
      setEditingZoneId(null);
      setTempZoneName('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full overflow-y-auto relative animate-fade-in-up transition-colors duration-300">
      <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <div className="p-2 bg-brand-100 dark:bg-brand-900 rounded-lg text-brand-600 dark:text-brand-300">
                  <MapIcon size={24} />
                </div>
                Mapa de Localização
              </h2>

              {/* Barra de Filtros */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-48">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Filtrar máquinas..." 
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400"
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                      />
                  </div>
                  <div className="relative md:w-40">
                      <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <select 
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                      >
                          <option value="">Todos Status</option>
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                  </div>
                  <div className="relative md:w-40">
                      <Navigation className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <select 
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        value={moduleSearch}
                        onChange={handleModuleSearch}
                      >
                          <option value="">Ir para Módulo...</option>
                          {FACTORY_MODULES.map(m => <option key={m} value={m}>{m === 'OUTROS' ? 'OUTROS' : m === 'TREINAMENTO' ? 'TREINAMENTO' : `Módulo ${m}`}</option>)}
                      </select>
                  </div>
              </div>
          </div>
          
          {/* Navegação Rápida de Módulos (Rolagem Horizontal) */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin w-full">
            {FACTORY_MODULES.map(mod => {
                const isOthers = mod === 'OUTROS';
                const isTraining = mod === 'TREINAMENTO';
                const hasVisibleMachines = structure.get(mod)?.size ?? 0 > 0;
                
                return (
                    <button
                        key={mod}
                        onClick={() => scrollToModule(mod)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1 ${
                            highlightedModuleId === mod 
                            ? (isOthers ? 'bg-slate-700 text-white border-slate-700 scale-105 shadow-md' : 'bg-brand-600 text-white border-brand-600 scale-105 shadow-md')
                            : (isOthers ? 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-brand-300')
                        }`}
                    >
                        {highlightedModuleId === mod && <MousePointerClick size={12}/>}
                        {isOthers ? <Box size={12} /> : isTraining ? <GraduationCap size={12}/> : null}
                        {mod === 'OUTROS' ? 'OUTROS' : mod === 'TREINAMENTO' ? 'TREINAMENTO' : `Módulo ${mod}`}
                    </button>
                )
            })}
          </div>
      </div>

      <div className="flex flex-col gap-8">
        {Array.from(structure.entries()).map(([moduleId, teamsMap]) => {
          const isHighlighted = highlightedModuleId === moduleId;
          const isOthers = moduleId === 'OUTROS';
          const isTraining = moduleId === 'TREINAMENTO';
          
          const hasMachines = Array.from(teamsMap.values()).some(arr => arr.length > 0);
          if ((filterText || filterStatus) && !hasMachines) return null;

          return (
            <div 
                key={`mod-${moduleId}`} 
                id={`module-${moduleId}`}
                className={`border rounded-xl p-4 transition-all duration-500 break-inside-avoid ${
                    isHighlighted 
                    ? (isOthers ? 'bg-slate-100 dark:bg-slate-900 border-slate-400 shadow-lg ring-2 ring-slate-300' : 'bg-brand-50 dark:bg-brand-900/40 border-brand-400 shadow-lg ring-2 ring-brand-200 dark:ring-brand-800')
                    : (isOthers ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-sm' : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700 shadow-sm')
                }`}
            >
                <h3 className={`text-lg font-bold mb-4 border-b pb-2 flex justify-between items-center ${
                    isHighlighted 
                        ? (isOthers ? 'text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600' : 'text-brand-800 dark:text-brand-200 border-brand-200 dark:border-brand-800') 
                        : 'text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                }`}>
                    <span className="flex items-center gap-2">
                        <span className={`w-2 h-6 rounded-full ${
                            isHighlighted 
                            ? (isOthers ? 'bg-slate-600' : 'bg-brand-600') 
                            : (isOthers ? 'bg-slate-400' : 'bg-brand-500')
                        }`}></span>
                        {isOthers ? <span className="flex items-center gap-2"><Archive size={20}/> Outros / Depósito</span> : isTraining ? <span className="flex items-center gap-2"><GraduationCap size={20}/> Treinamento</span> : `Módulo ${moduleId}`}
                    </span>
                    {isHighlighted && <span className={`text-xs font-normal bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm ${isOthers ? 'text-slate-600 dark:text-slate-300' : 'text-brand-600 dark:text-brand-400'}`}>Selecionado</span>}
                </h3>
                
                {/* Grade de Times dentro do Módulo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {Array.from(teamsMap.entries()).sort((a,b) => parseInt(a[0]) - parseInt(b[0])).map(([teamId, teamMachines]) => {
                        const customName = isOthers && customZoneNames[teamId];
                        const displayName = customName || (isOthers ? `Corredor/Prat. ${teamId}` : `Time ${teamId}`);
                        const isEditingThis = isOthers && editingZoneId === teamId;

                        return (
                        <div key={`mod-${moduleId}-team-${teamId}`} className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-3 shadow-sm h-full flex flex-col ${isOthers ? 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900' : ''}`}>
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 text-center border-b border-gray-100 dark:border-gray-700 pb-1 flex items-center justify-center gap-1 h-8">
                                {isEditingThis ? (
                                    <div className="flex items-center gap-1 w-full">
                                        <input 
                                            autoFocus
                                            type="text" 
                                            value={tempZoneName} 
                                            onChange={e => setTempZoneName(e.target.value)}
                                            className="w-full text-xs p-1 border rounded"
                                            onKeyDown={e => { if (e.key === 'Enter') saveZoneName(teamId); else if(e.key === 'Escape') cancelEditingZone(); }}
                                        />
                                        <button onClick={() => saveZoneName(teamId)} className="text-green-600 hover:text-green-800"><Save size={12}/></button>
                                        <button onClick={cancelEditingZone} className="text-red-500 hover:text-red-700"><X size={12}/></button>
                                    </div>
                                ) : (
                                    <>
                                        {displayName}
                                        {isOthers && (
                                            <button 
                                                onClick={() => startEditingZone(teamId, customName || `Corredor/Prat. ${teamId}`)} 
                                                className="ml-2 text-gray-300 hover:text-brand-600 transition-colors"
                                                title="Renomear Local"
                                            >
                                                <Edit2 size={10} />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 place-content-center flex-1 mx-auto">
                                {teamMachines.map((machine) => (
                                    <div 
                                        key={machine.id}
                                        className={`
                                            group relative w-8 h-8 rounded-md flex items-center justify-center transition-all duration-300 cursor-help shadow-sm
                                            ${getStatusColor(machine.status)}
                                            ${highlightedMachineId === machine.id ? 'ring-4 ring-yellow-400 scale-125 z-20 shadow-xl' : 'hover:scale-110 hover:shadow-md'}
                                        `}
                                    >
                                        {getStatusIcon(machine.status)}
                                        
                                        {/* Tooltip detalhado ao passar o mouse */}
                                        <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-md p-0 z-30 whitespace-nowrap mb-2 shadow-xl border border-gray-700 pointer-events-none min-w-[140px] text-center overflow-hidden">
                                            <div className="bg-gray-800 px-2 py-1.5 border-b border-gray-700 flex items-center justify-center gap-1.5">
                                                {getStatusIcon(machine.status)}
                                                <span className="font-bold text-sm">{machine.patrimonio}</span>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                <div className="text-gray-300 text-[10px] uppercase tracking-wider">{machine.type}</div>
                                                <div className="text-brand-300 font-medium border-t border-gray-700 pt-1 mt-1">
                                                    {machine.preparation}
                                                </div>
                                                <div className={`text-[10px] font-bold mt-1 ${
                                                    machine.status === MachineStatus.DISPONIVEL ? 'text-green-400' :
                                                    machine.status === MachineStatus.MANUTENCAO ? 'text-red-400' :
                                                    machine.status === MachineStatus.EM_USO ? 'text-blue-400' : 
                                                    machine.status === MachineStatus.EM_ESPERA ? 'text-yellow-400' : 'text-gray-400'
                                                }`}>
                                                    {machine.status}
                                                </div>
                                                <div className="text-[9px] text-gray-400 border-t border-gray-700 mt-1 pt-1">
                                                    {isOthers ? displayName : isTraining ? `TREINAMENTO - Time ${teamId}` : `Mód ${moduleId} - Time ${teamId}`}
                                                </div>
                                            </div>
                                            {/* Pequena seta na parte inferior */}
                                            <div className="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                    </div>
                                ))}
                                {teamMachines.length === 0 && (
                                    <span className="col-span-3 text-[10px] text-gray-300 dark:text-gray-500 italic self-center text-center">Vazio</span>
                                )}
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>
          );
        })}
        {filteredMachines.length === 0 && (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                Nenhuma máquina encontrada com os filtros atuais no mapa.
            </div>
        )}
      </div>

      <div className="mt-6 flex gap-4 text-sm text-gray-600 dark:text-gray-400 justify-center flex-wrap bg-gray-50 dark:bg-gray-700 p-4 rounded-lg sticky bottom-0 border-t dark:border-gray-600 shadow-inner z-10">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-md shadow-sm"></div>Disponível</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded-md shadow-sm"></div>Em Uso</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-500 rounded-md shadow-sm"></div>Em Espera</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-md shadow-sm"></div>Manutenção</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-400 rounded-md shadow-sm"></div>Indisponível</div>
      </div>
    </div>
  );
};
