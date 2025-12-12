
import React, { useState, useEffect } from 'react';
import { Machine, MachineStatus, ProductReference, ProductionRequirement, MachineType } from '../types';
import { Layers, CheckCircle, X, MapPin, Plus, Trash2, Edit, Save, ArrowLeft } from 'lucide-react';

interface ProductionBatchProps {
  machines: Machine[];
  availableMachineTypes: string[];
  onSelectMachine: (machine: Machine) => void;
  references: ProductReference[];
  onSaveReference: (ref: ProductReference) => void;
  onDeleteReference: (id: string) => void;
}

export const ProductionBatch: React.FC<ProductionBatchProps> = ({ 
  machines, 
  availableMachineTypes,
  onSelectMachine,
  references,
  onSaveReference,
  onDeleteReference
}) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'EDIT' | 'PLAN'>('LIST');
  const [selectedRef, setSelectedRef] = useState<ProductReference | null>(null);
  
  // Estado de Edição
  const [editCode, setEditCode] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editReqs, setEditReqs] = useState<ProductionRequirement[]>([]);

  // Estado de Planejamento
  const [allocatedMachineIds, setAllocatedMachineIds] = useState<Set<string>>(new Set());

  // Resetar alocação ao trocar referências
  useEffect(() => {
    setAllocatedMachineIds(new Set());
  }, [selectedRef]);

  // --- Manipuladores CRUD ---

  const startNewReference = () => {
    setSelectedRef(null);
    setEditCode('');
    setEditDesc('');
    setEditReqs([]);
    setViewMode('EDIT');
  };

  const startEditReference = (ref: ProductReference) => {
    setSelectedRef(ref);
    setEditCode(ref.code);
    setEditDesc(ref.description);
    setEditReqs([...ref.requirements]);
    setViewMode('EDIT');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCode || !editDesc) { alert("Preencha código e descrição"); return; }
    
    const newRef: ProductReference = {
        id: selectedRef ? selectedRef.id : Date.now().toString(),
        code: editCode,
        description: editDesc,
        requirements: editReqs
    };
    
    onSaveReference(newRef);
    setViewMode('LIST');
  };

  const addRequirement = () => {
      setEditReqs([
          ...editReqs, 
          { 
              id: Date.now().toString(), 
              machineType: availableMachineTypes[0] || MachineType.RETA, 
              quantity: 1, 
              preparationKeyword: '', 
              reason: '' 
          }
      ]);
  };

  const updateRequirement = (id: string, field: keyof ProductionRequirement, value: any) => {
      setEditReqs(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRequirement = (id: string) => {
      setEditReqs(prev => prev.filter(r => r.id !== id));
  };

  // --- Lógica de Planejamento ---

  const handlePlanReference = (ref: ProductReference) => {
      setSelectedRef(ref);
      setViewMode('PLAN');
  };

  const toggleAllocation = (machineId: string) => {
    setAllocatedMachineIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(machineId)) newSet.delete(machineId);
      else newSet.add(machineId);
      return newSet;
    });
  };

  const findMachines = (reqType: string, prepKeyword?: string) => {
    const allMatches = machines.filter(m => {
        const typeMatch = m.type === reqType;
        const prepMatch = prepKeyword ? m.preparation.toLowerCase().includes(prepKeyword.toLowerCase()) : true;
        return typeMatch && prepMatch;
    });
    const physicallyAvailable = allMatches.filter(m => m.status === MachineStatus.DISPONIVEL);
    const allocatedHere = physicallyAvailable.filter(m => allocatedMachineIds.has(m.id));
    const availableToPick = physicallyAvailable.filter(m => !allocatedMachineIds.has(m.id));
    return { allMatches, availableToPick, allocatedHere };
  };

  // --- Renderizações ---

  if (viewMode === 'LIST') {
      return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-full flex flex-col animate-fade-in-up transition-colors duration-300">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Layers className="text-brand-600 dark:text-brand-400" /> Referências de Produtos
                  </h2>
                  <button onClick={startNewReference} className="bg-brand-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-brand-700 shadow-sm">
                      <Plus size={18} /> Nova Referência
                  </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
                  {references.map(ref => (
                      <div key={ref.id} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-700 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{ref.code}</h3>
                              <div className="flex gap-2">
                                  <button onClick={() => startEditReference(ref)} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"><Edit size={16} /></button>
                                  <button onClick={() => { if(confirm('Excluir referência?')) onDeleteReference(ref.id) }} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"><Trash2 size={16} /></button>
                              </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-1">{ref.description}</p>
                          <div className="flex items-center justify-between mt-auto pt-3 border-t dark:border-gray-600">
                              <span className="text-xs text-gray-500 dark:text-gray-400">{ref.requirements.length} tipos de máq.</span>
                              <button onClick={() => handlePlanReference(ref)} className="text-brand-600 dark:text-brand-400 font-bold text-sm hover:underline flex items-center gap-1">
                                  Planejar <ArrowLeft className="rotate-180" size={14} />
                              </button>
                          </div>
                      </div>
                  ))}
                  {references.length === 0 && (
                      <div className="col-span-full text-center py-12 text-gray-400 border-2 border-dashed dark:border-gray-600 rounded-lg">
                          Nenhuma referência cadastrada.
                      </div>
                  )}
              </div>
          </div>
      );
  }

  if (viewMode === 'EDIT') {
      return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-full overflow-y-auto animate-fade-in-up transition-colors duration-300">
              <div className="flex items-center gap-4 mb-6 border-b dark:border-gray-700 pb-4">
                  <button onClick={() => setViewMode('LIST')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-gray-300"><ArrowLeft size={20}/></button>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                      {selectedRef ? 'Editar Referência' : 'Nova Referência'}
                  </h2>
              </div>

              <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Código (Referência)</label>
                          <input type="text" value={editCode} onChange={e => setEditCode(e.target.value)} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded mt-1" placeholder="Ex: 50800" />
                      </div>
                      <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                          <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded mt-1" placeholder="Ex: Camiseta..." />
                      </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border dark:border-gray-600">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-gray-700 dark:text-gray-200">Máquinas Necessárias</h3>
                          <button type="button" onClick={addRequirement} className="text-sm text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                              <Plus size={14} /> Adicionar Máquina
                          </button>
                      </div>
                      
                      <div className="space-y-3">
                          {editReqs.map((req, index) => (
                              <div key={req.id} className="flex flex-col md:flex-row gap-3 items-end bg-white dark:bg-gray-800 p-3 rounded shadow-sm border dark:border-gray-600">
                                  <div className="flex-1">
                                      <label className="text-xs text-gray-500 dark:text-gray-400">Tipo de Máquina</label>
                                      <select 
                                        value={req.machineType} 
                                        onChange={e => updateRequirement(req.id, 'machineType', e.target.value)}
                                        className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-1.5 rounded text-sm"
                                      >
                                          {availableMachineTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                      </select>
                                  </div>
                                  <div className="w-20">
                                      <label className="text-xs text-gray-500 dark:text-gray-400">Qtd.</label>
                                      <input type="number" min="1" value={req.quantity} onChange={e => updateRequirement(req.id, 'quantity', parseInt(e.target.value))} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-1.5 rounded text-sm" />
                                  </div>
                                  <div className="flex-1">
                                      <label className="text-xs text-gray-500 dark:text-gray-400">Filtro Preparação</label>
                                      <input type="text" value={req.preparationKeyword} onChange={e => updateRequirement(req.id, 'preparationKeyword', e.target.value)} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-1.5 rounded text-sm" placeholder="Ex: Viés" />
                                  </div>
                                  <div className="flex-1">
                                      <label className="text-xs text-gray-500 dark:text-gray-400">Motivo / Obs</label>
                                      <input type="text" value={req.reason || ''} onChange={e => updateRequirement(req.id, 'reason', e.target.value)} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-1.5 rounded text-sm" />
                                  </div>
                                  <button type="button" onClick={() => removeRequirement(req.id)} className="p-2 text-red-400 hover:text-red-600">
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          ))}
                          {editReqs.length === 0 && <p className="text-sm text-gray-400 italic text-center">Nenhuma máquina adicionada.</p>}
                      </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setViewMode('LIST')} className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded">Cancelar</button>
                      <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 flex items-center gap-2">
                          <Save size={18} /> Salvar Referência
                      </button>
                  </div>
              </form>
          </div>
      );
  }

  // View Mode: PLAN
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full animate-fade-in-up transition-colors duration-300">
      {/* Informações da Barra Lateral */}
      <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-fit">
          <button onClick={() => setViewMode('LIST')} className="flex items-center text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4 text-sm">
              <ArrowLeft size={16} className="mr-1"/> Voltar para Lista
          </button>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedRef?.code}</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2 mb-6">{selectedRef?.description}</p>
          
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Resumo do Planejamento</h4>
              <p className="text-sm text-blue-700 dark:text-blue-200 mb-1">
                  Máquinas Alocadas: <span className="font-bold">{allocatedMachineIds.size}</span>
              </p>
          </div>
      </div>

      {/* Lista de Resultados */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="space-y-6">
              {selectedRef?.requirements.map((req) => {
                const { allMatches, availableToPick, allocatedHere } = findMachines(req.machineType, req.preparationKeyword);
                const currentlyAllocatedCount = allocatedHere.length;
                const isFullyAllocated = currentlyAllocatedCount >= req.quantity;
                
                return (
                  <div key={req.id} className={`border rounded-lg p-4 transition-shadow shadow-sm hover:shadow-md ${isFullyAllocated ? 'border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
                           {req.machineType}
                           <span className={`text-xs px-2 py-1 rounded font-bold border ${isFullyAllocated ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700' : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}>
                             Meta: {req.quantity}
                           </span>
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1">{req.reason}</p>
                        {req.preparationKeyword && <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-1">Filtro: "{req.preparationKeyword}"</p>}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${currentlyAllocatedCount >= req.quantity ? 'bg-green-500 text-white' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                            {currentlyAllocatedCount} / {req.quantity} Alocadas
                      </div>
                    </div>

                    {/* Máquinas Alocadas */}
                    {allocatedHere.length > 0 && (
                        <div className="mb-3">
                            <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase mb-2 flex items-center gap-1">
                                <CheckCircle size={12}/> Selecionadas:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {allocatedHere.map(m => (
                                    <div key={m.id} className="flex justify-between items-center bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800 p-2 rounded">
                                        <div>
                                            <div className="font-bold text-sm text-green-900 dark:text-green-100">{m.patrimonio}</div>
                                            <div className="text-xs text-green-700 dark:text-green-300">Mód {m.moduleId} - {m.preparation}</div>
                                        </div>
                                        <button onClick={() => toggleAllocation(m.id)} className="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded text-green-800 dark:text-green-200"><X size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Máquinas Disponíveis */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded p-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                         {allocatedHere.length >= req.quantity ? "Outras Opções Disponíveis:" : "Selecione para Alocar:"}
                      </p>
                      {availableToPick.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {availableToPick.slice(0, 8).map(m => (
                            <div key={m.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 border border-gray-200 dark:border-gray-600 rounded hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-all group cursor-pointer" onClick={() => toggleAllocation(m.id)}>
                                <div>
                                    <div className="font-bold text-sm text-gray-800 dark:text-gray-200">{m.patrimonio}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Mód {m.moduleId} - Time {m.teamId}</div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); onSelectMachine(m); }} className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-gray-600 rounded-full"><MapPin size={14} /></button>
                                    <CheckCircle size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-green-500" />
                                </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Nenhuma outra máquina disponível.</p>
                      )}
                      {allMatches.length > (availableToPick.length + allocatedHere.length) && (
                          <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                             <p className="text-xs text-gray-400 dark:text-gray-500">
                                + {allMatches.length - (availableToPick.length + allocatedHere.length)} máquinas existem mas estão ocupadas/indisponíveis.
                             </p>
                          </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
      </div>
    </div>
  );
};
