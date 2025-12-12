
export enum MachineStatus {
  DISPONIVEL = 'Disponível',
  EM_USO = 'Em Uso',
  MANUTENCAO = 'Manutenção',
  EM_ESPERA = 'Em Espera',
  INDISPONIVEL = 'Indisponível'
}

export enum MachineType {
  RETA = 'Reta',
  GALONEIRA = 'Galoneira',
  OVERLOCK = 'Overlock',
  INTERLOCK = 'Interlock',
  PONTO_CADEIA = 'Ponto Cadeia',
  TRAVETE = 'Travete',
  ELASTIQUEIRA = 'Elastiqueira',
  BOTONEIRA = 'Botoneira',
  CASEADEIRA = 'Caseadeira',
  FECHADEIRA = 'Fechadeira',
  OUTROS = 'Outros'
}

export interface MaintenanceRecord {
  id: string;
  startDate: string;
  endDate?: string;
  reason: string;
}

export interface Machine {
  id: string;
  patrimonio: string;
  brand: string;
  type: MachineType | string;
  preparation: string;
  status: MachineStatus | string;
  moduleId: string;
  teamId: string;
  notes?: string;
  maintenanceLog?: MaintenanceRecord[];
}

export interface ProductionRequirement {
  id: string;
  machineType: MachineType | string;
  quantity: number;
  preparationKeyword: string;
  reason: string;
}

export interface ProductReference {
  id: string;
  code: string;
  description: string;
  requirements: ProductionRequirement[];
}

export interface User {
  username: string;
  password?: string;
  role: 'ADMIN' | 'USER' | 'PENDING';
  name: string;
  registration?: string;
  avatarUrl?: string;
}

export interface SystemConfig {
  systemName: string;
  logoUrl: string;
}

// Chave: teamId (string), Valor: Nome Personalizado (string)
export type CustomZoneNames = Record<string, string>;
