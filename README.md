
#  Tear_Pro 

> **Gestão Inteligente de Produção Têxtil**

O **Tear_Pro** é um sistema completo para gerenciamento de chão de fábrica, focado em confecções têxteis. Ele oferece controle de inventário de máquinas, mapeamento visual da produção, histórico de manutenções e planejamento de referências.

---

##  Índice

1. [Funcionalidades Principais](#funcionalidades-principais)
2. [Capturas de Tela do Sistema](#capturas-de-tela-do-sistema)
3. [Estrutura dos Relatórios (CSV)](#estrutura-dos-relatórios-csv)
4. [Tecnologias Utilizadas](#tecnologias-utilizadas)
5. [Estrutura de Pastas e Conteúdo](#-estrutura-de-pastas-e-conteúdo)
6. [Persistência de Dados](#persistência-de-dados)
7. [Como Executar Localmente](#como-executar-localmente)
8. [Acesso Padrão (Admin)](#acesso-padrão-admin)
9. [Autor e Contato](#autor-e-contato)


---

##  Funcionalidades Principais

###  Dashboard Interativo
- Visão geral com estatísticas em tempo real.
- Contagem de máquinas totais, disponíveis, em uso e em manutenção.
- Miniatura do mapa e últimas movimentações.

###  Mapa de Fábrica Visual
- **Layout Físico:** Visualização dos módulos de produção (02A, 11A, etc.), Outros Setores (Outros) e Área de Treinamento.
- **Status Visual:** Ícones coloridos indicando o estado de cada máquina (🟢 Disponível, 🔵 Em Uso, 🔴 Manutenção, 🟡 Em Espera).
- **Navegação Rápida:** Barra de atalhos para rolar diretamente para setores específicos.
- **Edição de Locais:** Capacidade de renomear corredores e prateleiras na área de "Outros".

###  Inventário e Manutenção
- **CRUD Completo:** Adicionar, editar e excluir máquinas.
- **Filtros Avançados:** Pesquisa por patrimônio, marca, tipo (com contagem), status e localização.
- **Histórico de Manutenção:** Registro detalhado de intervenções técnicas (datas, motivos e status).
- **Exportação:** Geração de relatórios em CSV.

###  Configurações e Sistema
- **Persistência de Dados:** Todos os dados são salvos no `localStorage` do navegador.
- **Backup e Restauração:** Exportação e Importação de dados completos via arquivo JSON.
- **Personalização:** Alteração do nome do sistema, logo e perfil do usuário.
- **Dark Mode:** Tema claro e escuro alternável.
- **Gestão de Usuários:** Controle de acesso (Admin/User) e aprovação de cadastros.

---

## Capturas de Tela do Sistema

### 1. Dashboard Geral
<img width="1159" height="596" alt="image" src="https://github.com/user-attachments/assets/a3f5dc74-1fac-435a-8142-2a6f20765f87" />

### 2. Mapa de Fábrica Interativo
<img width="1162" height="595" alt="image" src="https://github.com/user-attachments/assets/61581f51-dfe0-4744-b05c-4d323633af41" />

### 3. Gestão de Inventário
<img width="1160" height="601" alt="image" src="https://github.com/user-attachments/assets/b420ab7d-3747-4587-b2b2-7f7bc521a3d2" />

---

##  Estrutura dos Relatórios (CSV)

O sistema gera relatórios de inventário em formato `.csv` (codificação UTF-8 com BOM), compatível com Excel e Google Sheets. As colunas geradas são:

| Coluna | Descrição | Exemplo |
| :--- | :--- | :--- |
| **Patrimônio** | Identificador único da máquina | `PAT-10001` |
| **Marca/Modelo** | Fabricante do equipamento | `Siruba` |
| **Tipo** | Categoria da máquina | `Overlock` |
| **Preparação** | Configuração atual da máquina | `Viés` |
| **Status** | Estado operacional atual | `Disponível` |
| **Módulo** | Localização macro na fábrica | `02A` |
| **Time** | Sub-localização (Time, Corredor ou Prateleira) | `1` |
| **Observações** | Notas adicionais cadastradas | `Motor com ruído` |

---

## Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando as tecnologias mais modernas do ecossistema React:

- **[React 19](https://react.dev/)**: Biblioteca principal para construção da interface.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática para maior segurança e escalabilidade.
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework de estilização utilitária para design responsivo e Dark Mode.
- **[Lucide React](https://lucide.dev/)**: Biblioteca de ícones leve e consistente.
- **Local Storage API**: Persistência de dados local sem necessidade de backend.

---

## 📂 Estrutura de Pastas e Conteúdo

```bash
/
├── index.html                  # Entry point, config do Tailwind e imports globais
├── index.tsx                   # Inicialização do React DOM
├── App.tsx                     # Componente raiz, gerenciamento de estado global e rotas
├── types.ts                    # Definições de Interfaces (Machine, User, etc.) e Enums
├── constants.ts                # Dados mockados, configurações estáticas e listas padrão
├── metadata.json               # Metadados do projeto
├── README.md                   # Documentação oficial
└── components/                 # Componentes da UI
    ├── Dashboard.tsx           # Painel de estatísticas e visão geral
    ├── FactoryMap.tsx          # Mapa visual com lógica de renderização de módulos
    ├── MachineList.tsx         # Tabela de inventário com lógica de filtros e CSV
    ├── LoginScreen.tsx         # Telas de Login e Registro
    ├── MaintenanceHistoryModal.tsx # Modal de histórico de manutenções
    ├── ProductionBatch.tsx     # Planejamento de produção e alocação de referências
    ├── SettingsScreen.tsx      # Configurações de perfil, sistema, backup e listas
    ├── Sidebar.tsx             # Menu de navegação lateral responsivo
    └── UserList.tsx            # Gestão de usuários (apenas Admin)
```

---

##  Persistência de Dados

O sistema utiliza o **Local Storage** do navegador para simular um banco de dados. 

> **Aviso Importante:** Se você limpar o cache do navegador, os dados serão perdidos. Utilize a função de **"Exportar Dados"** na tela de Configurações regularmente para criar backups de segurança (arquivos `.json`).

---

## Como Executar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Heringson/TearPro.git
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Execute o servidor de desenvolvimento:**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. **Acesse no navegador:**
   Geralmente em `http://localhost:5173`

---

##  Acesso Padrão (Admin)

Caso os dados sejam resetados, o usuário administrador padrão é:

- **Usuário:** `Lima`
- **Senha:** `80pc9pglq`

---

## Autor e Contato

Desenvolvido por **Heringson Lima**.

 **Localização:** São Paulo, SP - Brasil  
 **WhatsApp:** [+55 (11) 94569-5118](https://wa.me/5511945695118)   
 **E-mail** heringson.heringson@gmail.com


