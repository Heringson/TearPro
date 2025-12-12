import React from 'react';
import { Machine } from '../types';
import { X, Calendar, Wrench, AlertCircle } from 'lucide-react';

interface MaintenanceHistoryModalProps {
  machine: Machine;
  onClose: () => void;
}

export const MaintenanceHistoryModal: React.FC<MaintenanceHistoryModalProps> = ({ machine, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Wrench className="text-brand-600" size={24} />
                Histórico de Manutenção
            </h3>
            <p className="text-gray-500 text-sm mt-1">
                {machine.patrimonio} - {machine.brand} {machine.type}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
            {!machine.maintenanceLog || machine.maintenanceLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <AlertCircle size={48} className="mb-2 opacity-50" />
                    <p>Nenhum registro de manutenção encontrado.</p>
                </div>
            ) : (
                <div className="relative border-l-2 border-brand-200 ml-4 space-y-8">
                    {machine.maintenanceLog.slice().reverse().map((record) => (
                        <div key={record.id} className="relative pl-6">
                            <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-500 border-2 border-white ring-2 ring-brand-100"></span>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
                                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                    <div className="font-bold text-gray-800 text-sm">{record.reason}</div>
                                    <div className="text-xs bg-white border px-2 py-1 rounded text-gray-600 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {record.startDate} {record.endDate ? ` até ${record.endDate}` : '(Em andamento)'}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    Status: <span className={`font-semibold ${!record.endDate ? 'text-red-500' : 'text-green-500'}`}>{!record.endDate ? 'Aberto' : 'Concluído'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium shadow-sm">
                Fechar
            </button>
        </div>
      </div>
    </div>
  );
};
