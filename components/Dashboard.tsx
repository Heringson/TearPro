
import React from 'react';
import { Machine, MachineStatus } from '../types';
import { Factory, CheckCircle, AlertTriangle, PlayCircle, Filter } from 'lucide-react';
import { FactoryMap } from './FactoryMap';
import { MachineList } from './MachineList';

interface DashboardProps {
  machines: Machine[];
  availableMachineTypes: string[];
  availableMachineBrands: string[];
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ machines, availableMachineTypes, availableMachineBrands, onNavigate }) => {
  const total = machines.length;
  const available = machines.filter(m => m.status === MachineStatus.DISPONIVEL).length;
  const maintenance = machines.filter(m => m.status === MachineStatus.MANUTENCAO || m.status === MachineStatus.INDISPONIVEL).length;
  const inUse = machines.filter(m => m.status === MachineStatus.EM_USO).length;

  return (
    <div className="p-6 h-full overflow-y-auto animate-fade-in-up transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Dashboard</h2>
        
        {/* Cartões de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total de Máquinas</p>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{total}</h3>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                    <Factory size={24} />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Disponíveis</p>
                    <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">{available}</h3>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                    <CheckCircle size={24} />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('maintenance')}>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Em Manutenção</p>
                    <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">{maintenance}</h3>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                    <AlertTriangle size={24} />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Em Produção</p>
                    <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400">{inUse}</h3>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                    <PlayCircle size={24} />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[500px]">
            {/* Mini Mapa */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200">Mapa de Localização</h3>
                    <button onClick={() => onNavigate('map')} className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline">Ver Mapa Completo</button>
                </div>
                <div className="flex-1 overflow-hidden relative p-2">
                    <div className="absolute inset-0 scale-75 origin-top-left w-[133%] h-[133%] overflow-auto">
                        <FactoryMap machines={machines} />
                    </div>
                </div>
            </div>

             {/* Movimentações Recentes / Lista Filtrada */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                 <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2"><Filter size={16}/> Últimas Movimentações</h3>
                     <button onClick={() => onNavigate('inventory')} className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline">Ver Inventário</button>
                </div>
                <div className="flex-1 overflow-auto">
                    {/* Reutilizando MachineList com uma visualização mais simples se possível, mas por enquanto renderização padrão */}
                    <MachineList 
                        machines={machines.slice(0, 10)} 
                        availableMachineTypes={availableMachineTypes}
                        availableMachineBrands={availableMachineBrands}
                        onCreateMachine={() => {}} 
                        onLocate={() => {}} 
                        onUpdateMachine={() => {}} 
                        onDeleteMachine={() => {}}
                        title=""
                    />
                </div>
            </div>
        </div>
    </div>
  );
};
