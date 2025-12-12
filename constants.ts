
import { Machine, MachineStatus, MachineType, ProductReference, User } from './types';

export const FACTORY_MODULES = [
  "02A", "11A", "07B", "08B", "14B", 
  "04B", "04A", "03A", "10A", "10B", 
  "11B", "06B", "71B", "16B", "70A", 
  "70B", "09C", "05A", "06A", "07A", 
  "09A", "09B", "16A", "OUTROS", "TREINAMENTO"
];

export const TEAMS_PER_MODULE = 5;

export const MACHINE_BRANDS = [
  'Sansei', 
  'Pegasus', 
  'Melco', 
  'Juki', 
  'Lanmax', 
  'Sun Special',
  'Siruba',
  'Yamato',
  'Jack',
  'Brother'
];

// Auxiliar para gerar dados de exemplo (mock)
const generateMockMachines = (): Machine[] => {
  const machines: Machine[] = [];
  let idCounter = 1;

  for (const mod of FACTORY_MODULES) {
    if (mod === "OUTROS") continue; // Iniciar reserva/outros vazio ou tratar separadamente se necessário

    // 09A e 09B têm 8 máquinas por time, outros têm 6
    const machinesPerTeam = (mod === "09A" || mod === "09B") ? 8 : 6;

    // Criar times por módulo
    for (let team = 1; team <= TEAMS_PER_MODULE; team++) {
      // Criar máquinas por time
      for (let m = 1; m <= machinesPerTeam; m++) {
        
        const typeIndex = Math.floor(Math.random() * Object.keys(MachineType).length);
        const type = Object.values(MachineType)[typeIndex] as MachineType;
        
        const brandIndex = Math.floor(Math.random() * MACHINE_BRANDS.length);
        const brand = MACHINE_BRANDS[brandIndex];

        let preparation = "Padrão";
        if (type === MachineType.GALONEIRA) {
            const preps = ["Bainha", "Viés", "Elástico 26mm", "Elástico 8mm"];
            preparation = preps[Math.floor(Math.random() * preps.length)];
        } else if (type === MachineType.PONTO_CADEIA) {
            const preps = ["Ombro a Ombro", "Aplicar Silicone", "Aplicar Borracha"];
            preparation = preps[Math.floor(Math.random() * preps.length)];
        } else if (type === MachineType.RETA) {
            const preps = ["Refiladeira", "Eletrônica", "Pesada"];
            preparation = preps[Math.floor(Math.random() * preps.length)];
        }

        // Distribuição aleatória de status
        const rand = Math.random();
        let status = MachineStatus.DISPONIVEL;
        if (rand > 0.90) status = MachineStatus.MANUTENCAO; // 10% manutenção
        else if (rand > 0.85) status = MachineStatus.INDISPONIVEL; // 5% indisponível
        else if (rand > 0.4) status = MachineStatus.EM_USO; // ~45% em uso

        machines.push({
          id: `M-${idCounter}`,
          patrimonio: `PAT-${10000 + idCounter}`,
          brand,
          type,
          preparation,
          status,
          moduleId: mod,
          teamId: team.toString(),
          notes: '',
          maintenanceLog: []
        });
        idCounter++;
      }
    }
  }
  return machines;
};

export const INITIAL_MACHINES = generateMockMachines();

export const MACHINE_TYPE_OPTIONS = Object.values(MachineType);
export const STATUS_OPTIONS = Object.values(MachineStatus);

// Referências manuais iniciais de exemplo
export const INITIAL_REFERENCES: ProductReference[] = [
  {
    id: 'REF-1',
    code: '50800',
    description: 'Camiseta Básica Gola Careca, Algodão 30.1',
    requirements: [
      { id: 'REQ-1', machineType: MachineType.RETA, quantity: 2, preparationKeyword: 'Refiladeira', reason: 'Bainha' },
      { id: 'REQ-2', machineType: MachineType.PONTO_CADEIA, quantity: 1, preparationKeyword: 'Ombro a Ombro', reason: 'Reforço' },
      { id: 'REQ-3', machineType: MachineType.OVERLOCK, quantity: 2, preparationKeyword: '', reason: 'Fechamento' }
    ]
  },
  {
    id: 'REF-2',
    code: '50802',
    description: 'Regata Nadador com Viés',
    requirements: [
      { id: 'REQ-4', machineType: MachineType.GALONEIRA, quantity: 2, preparationKeyword: 'Viés', reason: 'Acabamento' },
      { id: 'REQ-5', machineType: MachineType.RETA, quantity: 1, preparationKeyword: '', reason: 'Etiqueta' }
    ]
  }
];

// --- ALTERE AQUI O LOGO ---
// Substitua a URL abaixo pelo link direto da sua imagem (terminado em .png, .jpg, etc)
export const DEFAULT_LOGO_URL = 'https://i.imgur.com/kQO6T0w.png'; 
export const DEFAULT_SYSTEM_NAME = 'Dev_Lima';

export const INITIAL_ADMIN_USER: User = {
    username: 'Lima',
    password: '80pc9pglq', 
    role: 'ADMIN',
    name: 'Admin Lima',
    registration: '8576',
    avatarUrl: ''
};
