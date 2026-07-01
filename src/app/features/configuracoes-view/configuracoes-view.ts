import { Component, inject, Inject, signal, computed, OnInit } from '@angular/core';
import { FreteService } from '../../core/services/frete.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';

interface Feriado {
  id: string;
  data: string;
  descricao: string;
}

interface Transportadora {
  id: string;
  nome: string;
  cliente: string;
  homologada: boolean;
}

interface Alcada {
  id: string;
  unitCD: string;
  limiteInferior: number;
  limiteSuperior: number;
  userid: string;
  primeiroNome: string;
  ultimoNome: string;
  sequencia: number;
  status: 'Ativo' | 'Desabilitado' | 'Ausente Temporário';
  ausenciaPeriodo?: string;
}

interface Empresa {
  id: string;
  sigla: string;
  nome: string;
  endereco: string;
  tipo: 'Cliente' | 'Fornecedor' | 'Transportador' | 'ILC';
}

interface Usuario {
  id: string;
  primeiroNome: string;
  ultimoNome: string;
  email: string;
  telefone: string;
  empresaId: string; // Vínculo com a Empresa
  funcao: 'Aprovador' | 'Planejador' | 'Operador' | 'Administrador';
  perfil: 'Administrador' | 'Normal';
  status: 'Ativo' | 'Desabilitado' | 'Ausente Temporário';
  ausenciaPeriodo?: string;
}

@Component({
  selector: 'app-add-empresa-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Editar Empresa' : 'Adicionar Nova Empresa' }}</h2>
    <mat-dialog-content style="display: flex; flex-direction: column; gap: 16px; min-width: 350px; padding-top: 8px;">
      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Sigla / Código</mat-label>
          <input matInput [(ngModel)]="data.sigla" placeholder="ex: 3Q00" [readonly]="isEdit">
        </mat-form-field>
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Tipo de Empresa</mat-label>
          <mat-select [(ngModel)]="data.tipo" [disabled]="isEdit">
            <mat-option value="Cliente">Cliente</mat-option>
            <mat-option value="Fornecedor">Fornecedor</mat-option>
            <mat-option value="Transportador">Transportador</mat-option>
            <mat-option value="ILC">ILC</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Nome da Empresa</mat-label>
        <input matInput [(ngModel)]="data.nome" placeholder="ex: CLIENTE JOHN DEERE - CD 3Q00">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Endereço Completo</mat-label>
        <input matInput [(ngModel)]="data.endereco" placeholder="ex: Rodovia SP-340, Km 120">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="padding-bottom: 16px; padding-right: 16px;">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="!isValid()" [mat-dialog-close]="data">{{ isEdit ? 'Salvar' : 'Adicionar' }}</button>
    </mat-dialog-actions>
  `
})
export class AddEmpresaModal {
  isEdit = false;
  data = {
    id: '',
    sigla: '',
    nome: '',
    endereco: '',
    tipo: 'Cliente' as 'Cliente' | 'Fornecedor' | 'Transportador' | 'ILC'
  };

  constructor(
    public dialogRef: MatDialogRef<AddEmpresaModal>,
    @Inject(MAT_DIALOG_DATA) public editData: Empresa | null
  ) {
    if (editData) {
      this.data = {
        id: editData.id,
        sigla: editData.sigla,
        nome: editData.nome,
        endereco: editData.endereco,
        tipo: editData.tipo
      };
      this.isEdit = true;
    }
  }

  isValid() {
    return this.data.sigla.trim() && 
           this.data.nome.trim() && 
           this.data.endereco.trim();
  }
}

@Component({
  selector: 'app-add-usuario-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Editar Usuário' : 'Adicionar Novo Usuário' }}</h2>
    <mat-dialog-content style="display: flex; flex-direction: column; gap: 16px; min-width: 380px; padding-top: 8px;">
      
      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Empresa Organizacional</mat-label>
          <mat-select [(ngModel)]="data.empresaId" [disabled]="isEdit || blockEmpresaSelect">
            <mat-option *ngFor="let emp of empresas" [value]="emp.id">
              {{ emp.nome }} ({{ emp.sigla }})
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>User ID / Identificador</mat-label>
          <input matInput [(ngModel)]="data.id" placeholder="ex: CM37919" [readonly]="isEdit">
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Primeiro Nome</mat-label>
          <input matInput [(ngModel)]="data.primeiroNome" placeholder="ex: CAMILA">
        </mat-form-field>
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Último Nome</mat-label>
          <input matInput [(ngModel)]="data.ultimoNome" placeholder="ex: MARCAL">
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>E-mail</mat-label>
          <input matInput type="email" [(ngModel)]="data.email" placeholder="ex: camila@email.com">
        </mat-form-field>
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Telefone</mat-label>
          <input matInput [(ngModel)]="data.telefone" placeholder="ex: (11) 98888-7777">
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Função / Cargo</mat-label>
          <mat-select [(ngModel)]="data.funcao">
            <mat-option value="Aprovador">Aprovador</mat-option>
            <mat-option value="Planejador">Planejador</mat-option>
            <mat-option value="Operador">Operador</mat-option>
            <mat-option value="Administrador">Administrador</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Perfil de Acesso</mat-label>
          <mat-select [(ngModel)]="data.perfil">
            <mat-option value="Administrador">Administrador</mat-option>
            <mat-option value="Normal">Normal</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Status Operacional</mat-label>
        <mat-select [(ngModel)]="data.status">
          <mat-option value="Ativo">Ativo</mat-option>
          <mat-option value="Desabilitado">Desabilitado</mat-option>
          <mat-option value="Ausente Temporário">Ausente Temporário</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" *ngIf="data.status === 'Ausente Temporário'">
        <mat-label>Período de Ausência</mat-label>
        <input matInput [(ngModel)]="data.ausenciaPeriodo" placeholder="ex: 22/06/2026 a 05/07/2026">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="padding-bottom: 16px; padding-right: 16px;">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="!isValid()" [mat-dialog-close]="data">{{ isEdit ? 'Salvar' : 'Adicionar' }}</button>
    </mat-dialog-actions>
  `
})
export class AddUsuarioModal {
  isEdit = false;
  blockEmpresaSelect = false;
  empresas: Empresa[] = [];

  data = {
    id: '',
    primeiroNome: '',
    ultimoNome: '',
    email: '',
    telefone: '',
    empresaId: '',
    funcao: 'Aprovador' as 'Aprovador' | 'Planejador' | 'Operador' | 'Administrador',
    perfil: 'Normal' as 'Administrador' | 'Normal',
    status: 'Ativo' as 'Ativo' | 'Desabilitado' | 'Ausente Temporário',
    ausenciaPeriodo: ''
  };

  constructor(
    public dialogRef: MatDialogRef<AddUsuarioModal>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) {
    if (dialogData) {
      this.empresas = dialogData.empresas || [];
      const editData = dialogData.editData || (dialogData.id ? dialogData : null);
      
      if (editData) {
        this.data = {
          id: editData.id,
          primeiroNome: editData.primeiroNome,
          ultimoNome: editData.ultimoNome,
          email: editData.email,
          telefone: editData.telefone,
          empresaId: editData.empresaId,
          funcao: editData.funcao,
          perfil: editData.perfil,
          status: editData.status,
          ausenciaPeriodo: editData.ausenciaPeriodo || ''
        };
        this.isEdit = true;
      } else if (dialogData.empresaId) {
        this.data.empresaId = dialogData.empresaId;
        this.blockEmpresaSelect = true;
      }
    }
  }

  isValid() {
    return this.data.id.trim() && 
           this.data.primeiroNome.trim() && 
           this.data.ultimoNome.trim() && 
           this.data.email.trim() &&
           this.data.empresaId.trim();
  }
}

@Component({
  selector: 'app-add-alcada-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Editar Alçada' : 'Adicionar Nova Alçada' }}</h2>
    <mat-dialog-content style="display: flex; flex-direction: column; gap: 16px; min-width: 350px; padding-top: 8px;">
      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Unit CD</mat-label>
          <input matInput [(ngModel)]="data.unitCD" placeholder="ex: 3Q00" [readonly]="isEdit">
        </mat-form-field>
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Sequência</mat-label>
          <input matInput type="number" [(ngModel)]="data.sequencia" placeholder="ex: 1">
        </mat-form-field>
      </div>

      <div style="display: flex; gap: 16px;">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Limite Inferior (R$)</mat-label>
          <input matInput type="number" [(ngModel)]="data.limiteInferior" placeholder="0">
        </mat-form-field>
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Limite Superior (R$)</mat-label>
          <input matInput type="number" [(ngModel)]="data.limiteSuperior" placeholder="10000">
        </mat-form-field>
      </div>

      <!-- Seleção de Aprovadores ativos (Criação) -->
      <mat-form-field appearance="outline" *ngIf="!isEdit">
        <mat-label>Selecionar Aprovador (Usuário)</mat-label>
        <mat-select [(ngModel)]="data.userid" (selectionChange)="onAprovadorSelect($event.value)">
          <mat-option *ngFor="let usr of aprovadores" [value]="usr.id">
            {{ usr.primeiroNome }} {{ usr.ultimoNome }} ({{ usr.id }})
          </mat-option>
        </mat-select>
      </mat-form-field>
      
      <!-- User ID fixado (Edição) -->
      <mat-form-field appearance="outline" *ngIf="isEdit">
        <mat-label>User ID</mat-label>
        <input matInput [(ngModel)]="data.userid" readonly style="color: #64748b;">
      </mat-form-field>

      <div style="display: flex; gap: 16px;" *ngIf="data.userid">
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Primeiro Nome</mat-label>
          <input matInput [(ngModel)]="data.primeiroNome" readonly style="color: #64748b;">
        </mat-form-field>
        <mat-form-field appearance="outline" style="flex: 1;">
          <mat-label>Último Nome</mat-label>
          <input matInput [(ngModel)]="data.ultimoNome" readonly style="color: #64748b;">
        </mat-form-field>
      </div>

      <!-- Informações Operacionais Somente-Leitura vindas do Cadastro de Usuários -->
      <div style="display: flex; gap: 16px; align-items: center;" *ngIf="data.userid">
        <span style="font-size: 0.85rem; font-weight: 500; color: #475569;">Status Operacional do Usuário:</span>
        <span *ngIf="data.status === 'Ativo'" style="background-color: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">Ativo</span>
        <span *ngIf="data.status === 'Desabilitado'" style="background-color: #fee2e2; color: #b91c1c; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">Desabilitado</span>
        <span *ngIf="data.status === 'Ausente Temporário'" style="background-color: #fef9c3; color: #a16207; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">Ausente ({{ data.ausenciaPeriodo }})</span>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="padding-bottom: 16px; padding-right: 16px;">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="!isValid()" [mat-dialog-close]="data">{{ isEdit ? 'Salvar' : 'Adicionar' }}</button>
    </mat-dialog-actions>
  `
})
export class AddAlcadaModal {
  isEdit = false;
  aprovadores: Usuario[] = [];

  data = {
    unitCD: '',
    limiteInferior: 0,
    limiteSuperior: 0,
    userid: '',
    primeiroNome: '',
    ultimoNome: '',
    sequencia: 1,
    status: 'Ativo',
    ausenciaPeriodo: ''
  };

  constructor(
    public dialogRef: MatDialogRef<AddAlcadaModal>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) {
    if (dialogData) {
      this.aprovadores = dialogData.aprovadoresDisponiveis || [];
      const editData = dialogData.id ? dialogData : dialogData.editData;
      
      if (editData) {
        this.data = {
          unitCD: editData.unitCD,
          limiteInferior: editData.limiteInferior,
          limiteSuperior: editData.limiteSuperior,
          userid: editData.userid,
          primeiroNome: editData.primeiroNome,
          ultimoNome: editData.ultimoNome,
          sequencia: editData.sequencia,
          status: editData.status,
          ausenciaPeriodo: editData.ausenciaPeriodo || ''
        };
        this.isEdit = editData.id ? true : false;
      } else if (dialogData.unitCD) {
        this.data.unitCD = dialogData.unitCD;
      }
    }
  }

  onAprovadorSelect(userId: string) {
    const usr = this.aprovadores.find(u => u.id === userId);
    if (usr) {
      this.data.primeiroNome = usr.primeiroNome;
      this.data.ultimoNome = usr.ultimoNome;
      this.data.status = usr.status;
      this.data.ausenciaPeriodo = usr.ausenciaPeriodo || '';
    }
  }

  isValid() {
    return this.data.unitCD.trim() && 
           this.data.userid.trim() && 
           Number(this.data.limiteSuperior) > Number(this.data.limiteInferior);
  }
}

@Component({
  selector: 'app-configuracoes-view',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatDividerModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatSelectModule
  ],
  templateUrl: './configuracoes-view.html',
  styleUrls: ['./configuracoes-view.css']
})
export class ConfiguracoesView implements OnInit {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private freteService = inject(FreteService);

  activeTab = 0;

  // Parametrizações
  raioMaxAglutinacao = '10';
  slaExpiracaoCotacao = '40';
  slaProrrogacao = '30';
  slaEscalonamento = '30';
  margemTolerancia = '10';
  periodoHistorico = '180';
  limiteArquivo = '25';
  horarioInicio = '07:00';
  horarioFim = '20:00';
  
  // Parâmetros do cálculo de viabilidade (anteriormente mockados)
  tempoCarregamentoColeta = 2;
  tempoDeslocamentoColetas = 4;

  // Feriados
  feriados = this.freteService.feriados;

  // Transportadoras
  transportadoras = signal<Transportadora[]>([
    { id: '1', nome: 'MIRASSOL', cliente: 'JOHN DEERE', homologada: true },
    { id: '2', nome: 'M3 LOGÍSTICA', cliente: 'JOHN DEERE', homologada: true },
    { id: '3', nome: 'GOLDEN CARGO', cliente: 'JOHN DEERE', homologada: false },
    { id: '4', nome: 'VF (IVOTI)', cliente: 'JOHN DEERE', homologada: true },
    { id: '5', nome: 'ARMANI (CAMPINAS)', cliente: 'JOHN DEERE', homologada: true },
  ]);

  // Empresas Cadastradas
  empresas = signal<Empresa[]>([
    { id: 'EMP-3Q00', sigla: '3Q00', nome: 'CLIENTE JOHN DEERE - 3Q00', endereco: 'Av. Industrial, 1000 - Horizontina/RS', tipo: 'Cliente' },
    { id: 'EMP-BM00', sigla: 'BM00', nome: 'CLIENTE JOHN DEERE - BM00', endereco: 'Rod. Campinas-Mogi, Km 10 - Campinas/SP', tipo: 'Cliente' },
    { id: 'EMP-BZ00', sigla: 'BZ00', nome: 'CLIENTE JOHN DEERE - BZ00', endereco: 'Rua das Nações, 200 - Catalão/GO', tipo: 'Cliente' },
    { id: 'EMP-CQ00', sigla: 'CQ00', nome: 'CLIENTE JOHN DEERE - CQ00', endereco: 'Av. Contorno, 500 - Montenegro/RS', tipo: 'Cliente' },
    { id: 'EMP-NW00', sigla: 'NW00', nome: 'CLIENTE JOHN DEERE - NW00', endereco: 'Av. das Américas, 3000 - Indaiatuba/SP', tipo: 'Cliente' },
    { id: 'EMP-MIRS', sigla: 'MIRS', nome: 'MIRASSOL TRANSPORTES', endereco: 'Rua do Transportador, 50 - São Paulo/SP', tipo: 'Transportador' },
    { id: 'EMP-M3LO', sigla: 'M3LO', nome: 'M3 LOGÍSTICA', endereco: 'Av. Marginal Pinheiros, 1200 - São Paulo/SP', tipo: 'Transportador' },
    { id: 'EMP-ILC1', sigla: 'ILC1', nome: 'ILC CONTRATAÇÃO LOGÍSTICA', endereco: 'Rua da Tecnologia, 100 - Curitiba/PR', tipo: 'ILC' },
    { id: 'EMP-FORN', sigla: 'FOR1', nome: 'PARCEIRO FORNECEDOR PEÇAS', endereco: 'Av. das Indústrias, 400 - Porto Alegre/RS', tipo: 'Fornecedor' }
  ]);

  // Usuários do Sistema
  usuarios = signal<Usuario[]>([
    // Aprovadores da 3Q00
    { id: 'CM37919', primeiroNome: 'CAMILA', ultimoNome: 'MARCAL', email: 'camila.marcal@cliente.com', telefone: '(11) 98888-7777', empresaId: 'EMP-3Q00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'EZ68532', primeiroNome: 'ERNANI', ultimoNome: 'ZAMBERLAN FILHO', email: 'ernani.filho@cliente.com', telefone: '(11) 97777-6666', empresaId: 'EMP-3Q00', funcao: 'Aprovador', perfil: 'Normal', status: 'Desabilitado' },
    { id: 'LA06079', primeiroNome: 'LARISSA DE ABREU', ultimoNome: 'MARQUES', email: 'larissa.marques@cliente.com', telefone: '(11) 96666-5555', empresaId: 'EMP-3Q00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ausente Temporário', ausenciaPeriodo: '22/06/2026 a 05/07/2026' },
    { id: 'BG63954', primeiroNome: 'BRUNA', ultimoNome: 'GOULART', email: 'bruna.goulart@cliente.com', telefone: '(11) 95555-4444', empresaId: 'EMP-3Q00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
 
    // Aprovadores da BM00
    { id: 'FB12502', primeiroNome: 'FRANCINE', ultimoNome: 'BORTOVSKI', email: 'francine.bortovski@cliente.com', telefone: '(11) 94444-3333', empresaId: 'EMP-BM00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'FS10081', primeiroNome: 'FABRICIO', ultimoNome: 'SEVERO', email: 'fabricio.severo@cliente.com', telefone: '(11) 93333-2222', empresaId: 'EMP-BM00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'AR86923', primeiroNome: 'ANA', ultimoNome: 'ROHSIG', email: 'ana.rohsig@cliente.com', telefone: '(11) 92222-1111', empresaId: 'EMP-BM00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'AT72670', primeiroNome: 'ALLAN', ultimoNome: 'TELOCKEN', email: 'allan.telocken@cliente.com', telefone: '(11) 91111-0000', empresaId: 'EMP-BM00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'BG63954_BM', primeiroNome: 'BRUNA', ultimoNome: 'GOULART', email: 'bruna.goulart@cliente.com', telefone: '(11) 95555-4444', empresaId: 'EMP-BM00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
 
    // Aprovadores da BZ00
    { id: 'Q21NMCW', primeiroNome: 'FERNANDA', ultimoNome: 'SCARTON FEIJON', email: 'fernanda.scarton@cliente.com', telefone: '(11) 99999-8888', empresaId: 'EMP-BZ00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'LL43855', primeiroNome: 'LAIS', ultimoNome: 'SILVA', email: 'lais.silva@cliente.com', telefone: '(11) 98888-1234', empresaId: 'EMP-BZ00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'AR86923_BZ', primeiroNome: 'ANA', ultimoNome: 'ROHSIG', email: 'ana.rohsig@cliente.com', telefone: '(11) 92222-1111', empresaId: 'EMP-BZ00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'AT72670_BZ', primeiroNome: 'ALLAN', ultimoNome: 'TELOCKEN', email: 'allan.telocken@cliente.com', telefone: '(11) 91111-0000', empresaId: 'EMP-BZ00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'BG63954_BZ', primeiroNome: 'BRUNA', ultimoNome: 'GOULART', email: 'bruna.goulart@cliente.com', telefone: '(11) 95555-4444', empresaId: 'EMP-BZ00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
 
    // Aprovadores da CQ00
    { id: 'AM69676', primeiroNome: 'ALANA', ultimoNome: 'MONTEIRO', email: 'alana.monteiro@cliente.com', telefone: '(11) 97777-4321', empresaId: 'EMP-CQ00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'LA61954', primeiroNome: 'LUCAS', ultimoNome: 'ARALDI', email: 'lucas.araldi@cliente.com', telefone: '(11) 96666-8765', empresaId: 'EMP-CQ00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'AR86923_CQ', primeiroNome: 'ANA', ultimoNome: 'ROHSIG', email: 'ana.rohsig@cliente.com', telefone: '(11) 92222-1111', empresaId: 'EMP-CQ00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'AT72670_CQ', primeiroNome: 'ALLAN', ultimoNome: 'TELOCKEN', email: 'allan.telocken@cliente.com', telefone: '(11) 91111-0000', empresaId: 'EMP-CQ00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'BG63954_CQ', primeiroNome: 'BRUNA', ultimoNome: 'GOULART', email: 'bruna.goulart@cliente.com', telefone: '(11) 95555-4444', empresaId: 'EMP-CQ00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
 
    // Aprovadores da NW00
    { id: 'LS69464', primeiroNome: 'LAIS', ultimoNome: 'MEDEIROS', email: 'lais.medeiros@cliente.com', telefone: '(11) 95555-5678', empresaId: 'EMP-NW00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'EJ82110', primeiroNome: 'EURIZIO', ultimoNome: 'SANTOS JUNIOR', email: 'eurizio.junior@cliente.com', telefone: '(11) 94444-9012', empresaId: 'EMP-NW00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'AR86923_NW', primeiroNome: 'ANA', ultimoNome: 'ROHSIG', email: 'ana.rohsig@cliente.com', telefone: '(11) 92222-1111', empresaId: 'EMP-NW00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'AT72670_NW', primeiroNome: 'ALLAN', ultimoNome: 'TELOCKEN', email: 'allan.telocken@cliente.com', telefone: '(11) 91111-0000', empresaId: 'EMP-NW00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
    { id: 'BG63954_NW', primeiroNome: 'BRUNA', ultimoNome: 'GOULART', email: 'bruna.goulart@cliente.com', telefone: '(11) 95555-4444', empresaId: 'EMP-NW00', funcao: 'Aprovador', perfil: 'Normal', status: 'Ativo' },
 
    // Planejadores e Operadores
    { id: 'PL001', primeiroNome: 'RODRIGO', ultimoNome: 'ALMEIDA', email: 'rodrigo.almeida@cliente.com', telefone: '(11) 93333-8888', empresaId: 'EMP-3Q00', funcao: 'Planejador', perfil: 'Normal', status: 'Ativo' },
    { id: 'TR001', primeiroNome: 'CARLOS', ultimoNome: 'MIRASSOL', email: 'carlos@mirassol.com', telefone: '(11) 92222-9999', empresaId: 'EMP-MIRS', funcao: 'Operador', perfil: 'Normal', status: 'Ativo' },
    { id: 'ILC001', primeiroNome: 'MARCELO', ultimoNome: 'ADMIN', email: 'marcelo.admin@ilc.com', telefone: '(11) 91111-7777', empresaId: 'EMP-ILC1', funcao: 'Administrador', perfil: 'Administrador', status: 'Ativo' }
  ]);
 
  // Alçadas
  alcadas = signal<Alcada[]>([
    // CD 3Q00 (4 aprovadores)
    { id: '1', unitCD: '3Q00', limiteInferior: 0, limiteSuperior: 28300, userid: 'CM37919', primeiroNome: 'CAMILA', ultimoNome: 'MARCAL', sequencia: 1, status: 'Ativo' },
    { id: '2', unitCD: '3Q00', limiteInferior: 28306, limiteSuperior: 565999994, userid: 'EZ68532', primeiroNome: 'ERNANI', ultimoNome: 'ZAMBERLAN FILHO', sequencia: 2, status: 'Desabilitado' },
    { id: '3', unitCD: '3Q00', limiteInferior: 113206, limiteSuperior: 565999994, userid: 'LA06079', primeiroNome: 'LARISSA DE ABREU', ultimoNome: 'MARQUES', sequencia: 3, status: 'Ausente Temporário', ausenciaPeriodo: '22/06/2026 a 05/07/2026' },
    { id: '4', unitCD: '3Q00', limiteInferior: 28306, limiteSuperior: 565999994, userid: 'BG63954', primeiroNome: 'BRUNA', ultimoNome: 'GOULART', sequencia: 4, status: 'Ativo' },
 
    // CD BM00 (5 aprovadores)
    { id: '5', unitCD: 'BM00', limiteInferior: 0, limiteSuperior: 28300, userid: 'FB12502', primeiroNome: 'FRANCINE', ultimoNome: 'BORTOVSKI', sequencia: 1, status: 'Ativo' },
    { id: '6', unitCD: 'BM00', limiteInferior: 0, limiteSuperior: 28300, userid: 'FS10081', primeiroNome: 'FABRICIO', ultimoNome: 'SEVERO', sequencia: 2, status: 'Ativo' },
    { id: '7', unitCD: 'BM00', limiteInferior: 28306, limiteSuperior: 565999994, userid: 'AR86923', primeiroNome: 'ANA', ultimoNome: 'ROHSIG', sequencia: 3, status: 'Ativo' },
    { id: '8', unitCD: 'BM00', limiteInferior: 28306, limiteSuperior: 565999994, userid: 'AT72670', primeiroNome: 'ALLAN', ultimoNome: 'TELOCKEN', sequencia: 4, status: 'Ativo' },
    { id: '9', unitCD: 'BM00', limiteInferior: 28306, limiteSuperior: 565999994, userid: 'BG63954_BM', primeiroNome: 'BRUNA', ultimoNome: 'GOULART', sequencia: 5, status: 'Ativo' },
 
    // CD BZ00 (5 aprovadores)
    { id: '10', unitCD: 'BZ00', limiteInferior: 0, limiteSuperior: 28300, userid: 'Q21NMCW', primeiroNome: 'FERNANDA', ultimoNome: 'SCARTON FEIJON', sequencia: 1, status: 'Ativo' },
    { id: '11', unitCD: 'BZ00', limiteInferior: 0, limiteSuperior: 28300, userid: 'LL43855', primeiroNome: 'LAIS', ultimoNome: 'SILVA', sequencia: 2, status: 'Ativo' },
    { id: '12', unitCD: 'BZ00', limiteInferior: 28306, limiteSuperior: 565999994, userid: 'AR86923_BZ', primeiroNome: 'ANA', ultimoNome: 'ROHSIG', sequencia: 3, status: 'Ativo' },
    { id: '13', unitCD: 'BZ00', limiteInferior: 28306, limiteSuperior: 565999994, userid: 'AT72670_BZ', primeiroNome: 'ALLAN', ultimoNome: 'TELOCKEN', sequencia: 4, status: 'Ativo' },
    { id: '14', unitCD: 'BZ00', limiteInferior: 28306, limiteSuperior: 565999994, userid: 'BG63954_BZ', primeiroNome: 'BRUNA', ultimoNome: 'GOULART', sequencia: 5, status: 'Ativo' },
 
    // CD CQ00 (5 aprovadores)
    { id: '15', unitCD: 'CQ00', limiteInferior: 0, limiteSuperior: 28300, userid: 'AM69676', primeiroNome: 'ALANA', ultimoNome: 'MONTEIRO', sequencia: 1, status: 'Ativo' },
    { id: '16', unitCD: 'CQ00', limiteInferior: 0, limiteSuperior: 28300, userid: 'LA61954', primeiroNome: 'LUCAS', ultimoNome: 'ARALDI', sequencia: 2, status: 'Ativo' },
    { id: '17', unitCD: 'CQ00', limiteInferior: 28306, limiteSuperior: 565999994, userid: 'AR86923_CQ', primeiroNome: 'ANA', ultimoNome: 'ROHSIG', sequencia: 3, status: 'Ativo' },
    { id: '18', unitCD: 'CQ00', limiteInferior: 28306, limiteSuperior: 565999994, userid: 'AT72670_CQ', primeiroNome: 'ALLAN', ultimoNome: 'TELOCKEN', sequencia: 4, status: 'Ativo' },
    { id: '19', unitCD: 'CQ00', limiteInferior: 28306, limiteSuperior: 565999994, userid: 'BG63954_CQ', primeiroNome: 'BRUNA', ultimoNome: 'GOULART', sequencia: 5, status: 'Ativo' },
 
    // CD NW00 (5 aprovadores)
    { id: '20', unitCD: 'NW00', limiteInferior: 0, limiteSuperior: 28300, userid: 'LS69464', primeiroNome: 'LAIS', ultimoNome: 'MEDEIROS', sequencia: 1, status: 'Ativo' },
    { id: '21', unitCD: 'NW00', limiteInferior: 0, limiteSuperior: 28300, userid: 'EJ82110', primeiroNome: 'EURIZIO', ultimoNome: 'SANTOS JUNIOR', sequencia: 2, status: 'Ativo' },
    { id: '22', unitCD: 'NW00', limiteInferior: 28306, limiteSuperior: 565999994, userid: 'AR86923_NW', primeiroNome: 'ANA', ultimoNome: 'ROHSIG', sequencia: 3, status: 'Ativo' },
    { id: '23', unitCD: 'NW00', limiteInferior: 28306, limiteSuperior: 565999994, userid: 'AT72670_NW', primeiroNome: 'ALLAN', ultimoNome: 'TELOCKEN', sequencia: 4, status: 'Ativo' },
    { id: '24', unitCD: 'NW00', limiteInferior: 28306, limiteSuperior: 565999994, userid: 'BG63954_NW', primeiroNome: 'BRUNA', ultimoNome: 'GOULART', sequencia: 5, status: 'Ativo' }
  ]);
 
  unidadeSelecionada = signal<string | null>(null);
 
  unidadesLista = computed(() => {
    return this.empresas()
      .filter(e => e.tipo === 'Cliente')
      .map(e => e.sigla)
      .sort();
  });
 
  alcadasFiltradas = computed(() => {
    const selected = this.unidadeSelecionada();
    if (!selected) return [];
    return this.alcadas()
      .filter(a => a.unitCD === selected)
      .map(alcada => {
        const usr = this.usuarios().find(u => u.id === alcada.userid);
        if (usr) {
          return {
            ...alcada,
            primeiroNome: usr.primeiroNome,
            ultimoNome: usr.ultimoNome,
            status: usr.status,
            ausenciaPeriodo: usr.ausenciaPeriodo
          };
        }
        return alcada;
      });
  });

  gargalosAlertas: string[] = [];

  ngOnInit() {
    this.carregarConfiguracoes();
    this.validarGargaloAlcadas();
  }

  carregarConfiguracoes() {
    this.raioMaxAglutinacao = this.freteService.raioMaxAglutinacao();
    this.slaExpiracaoCotacao = this.freteService.slaExpiracaoCotacao();
    this.slaProrrogacao = this.freteService.slaProrrogacao();
    this.slaEscalonamento = this.freteService.slaEscalonamento();
    this.margemTolerancia = this.freteService.margemTolerancia();
    this.periodoHistorico = this.freteService.periodoHistorico();
    this.limiteArquivo = this.freteService.limiteArquivo();
    this.horarioInicio = this.freteService.horarioInicio();
    this.horarioFim = this.freteService.horarioFim();
    this.tempoCarregamentoColeta = this.freteService.tempoCarregamentoColeta();
    this.tempoDeslocamentoColetas = this.freteService.tempoDeslocamentoColetas();
  }

  validarGargaloAlcadas() {
    this.gargalosAlertas = [];
    const selected = this.unidadeSelecionada();
    if (!selected) return;
    
    // Filtra alçadas ativas da unidade selecionada
    const alcadasAtivas = this.alcadas().filter(a => a.unitCD === selected && a.status !== 'Desabilitado');
    
    // Ordena por limite inferior
    const list = [...alcadasAtivas].sort((a, b) => a.limiteInferior - b.limiteInferior);
    
    if (list.length === 0) {
      this.gargalosAlertas.push(`Gargalo crítico na unidade [${selected}]: nenhuma alçada ativa configurada. O fluxo de aprovação será bloqueado para qualquer valor.`);
      return;
    }

    // Verifica se o primeiro limite inferior começa em 0
    if (list[0].limiteInferior > 0) {
      this.gargalosAlertas.push(`Gargalo na unidade [${selected}]: Não existe aprovador ativo para valores abaixo de ${this.formatCurrency(list[0].limiteInferior)}.`);
    }

    for (let i = 0; i < list.length - 1; i++) {
      const atual = list[i];
      const proxima = list[i + 1];
      
      // Se houver lacuna
      if (proxima.limiteInferior > atual.limiteSuperior + 1) {
        const inicioLacuna = atual.limiteSuperior;
        const fimLacuna = proxima.limiteInferior;
        this.gargalosAlertas.push(
          `Gargalo na unidade [${selected}]: Lacuna de aprovador ativo entre ${this.formatCurrency(inicioLacuna)} e ${this.formatCurrency(fimLacuna)}.`
        );
      }
    }
  }

  temGargalo(unit: string): boolean {
    const alcadasUnit = this.alcadas().filter(a => a.unitCD === unit && a.status !== 'Desabilitado');
    if (alcadasUnit.length === 0) return true;
    
    const list = [...alcadasUnit].sort((a, b) => a.limiteInferior - b.limiteInferior);
    if (list[0].limiteInferior > 0) return true;
    
    for (let i = 0; i < list.length - 1; i++) {
      if (list[i + 1].limiteInferior > list[i].limiteSuperior + 1) {
        return true;
      }
    }
    return false;
  }

  countAprovadores(unit: string): number {
    return this.alcadas().filter(a => a.unitCD === unit).length;
  }

  selecionarUnidade(unit: string) {
    this.unidadeSelecionada.set(unit);
    this.validarGargaloAlcadas();
  }

  voltarUnidades() {
    this.unidadeSelecionada.set(null);
    this.gargalosAlertas = [];
  }

  private formatCurrency(val: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  }

  voltar() {
    this.router.navigate(['/home']);
  }

  salvarParametros() {
    this.freteService.salvarParametros({
      raioMaxAglutinacao: this.raioMaxAglutinacao,
      slaExpiracaoCotacao: this.slaExpiracaoCotacao,
      slaProrrogacao: this.slaProrrogacao,
      slaEscalonamento: this.slaEscalonamento,
      margemTolerancia: this.margemTolerancia,
      periodoHistorico: this.periodoHistorico,
      limiteArquivo: this.limiteArquivo,
      horarioInicio: this.horarioInicio,
      horarioFim: this.horarioFim,
      tempoCarregamentoColeta: this.tempoCarregamentoColeta,
      tempoDeslocamentoColetas: this.tempoDeslocamentoColetas
    });

    this.snackBar.open('Parametrizações salvas com sucesso!', 'Fechar', { duration: 3000 });
  }

  toggleHomologacao(id: string) {
    this.transportadoras.update(list => 
      list.map(t => t.id === id ? { ...t, homologada: !t.homologada } : t)
    );
  }

  deleteFeriado(id: string) {
    const newList = this.freteService.feriados().filter(f => f.id !== id);
    this.freteService.salvarFeriados(newList);
  }

  toggleAlcadaStatus(alcada: Alcada) {
    this.usuarios.update(list => 
      list.map(u => {
        if (u.id === alcada.userid) {
          const novoStatus = u.status === 'Desabilitado' ? 'Ativo' : 'Desabilitado';
          return { ...u, status: novoStatus as any };
        }
        return u;
      })
    );
    this.validarGargaloAlcadas();
    
    const usr = this.usuarios().find(u => u.id === alcada.userid);
    const acaoMsg = usr && usr.status === 'Desabilitado' ? 'desabilitada' : 'habilitada';
    this.snackBar.open(`Alçada do usuário ${alcada.primeiroNome} ${acaoMsg} com sucesso!`, 'Fechar', { duration: 4000 });
  }

  obterAprovadoresDisponiveis(siglaCD?: string) {
    return this.usuarios().filter(u => {
      const emp = this.empresas().find(e => e.id === u.empresaId);
      if (!emp) return false;
      const ehClienteAprovador = emp.tipo === 'Cliente' && u.funcao === 'Aprovador';
      if (siglaCD) {
        return ehClienteAprovador && emp.sigla === siglaCD;
      }
      return ehClienteAprovador;
    });
  }

  editarAlcada(alcada: Alcada) {
    const dialogRef = this.dialog.open(AddAlcadaModal, {
      data: {
        id: alcada.id,
        editData: alcada,
        aprovadoresDisponiveis: this.obterAprovadoresDisponiveis()
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.alcadas.update(list => 
          list.map(a => a.id === alcada.id ? {
            ...a,
            unitCD: result.unitCD.toUpperCase(),
            limiteInferior: Number(result.limiteInferior) || 0,
            limiteSuperior: Number(result.limiteSuperior) || 0,
            userid: result.userid.toUpperCase(),
            primeiroNome: result.primeiroNome.toUpperCase(),
            ultimoNome: result.ultimoNome.toUpperCase(),
            sequencia: Number(result.sequencia) || 1,
            status: result.status,
            ausenciaPeriodo: result.ausenciaPeriodo
          } : a)
        );
        this.validarGargaloAlcadas();
        this.snackBar.open(`Alçada do usuário ${result.primeiroNome.toUpperCase()} editada com sucesso!`, 'Fechar', { duration: 4000 });
      }
    });
  }
 
  addAlcada() {
    const unitSelected = this.unidadeSelecionada();
    const dialogRef = this.dialog.open(AddAlcadaModal, {
      data: {
        unitCD: unitSelected || '',
        aprovadoresDisponiveis: this.obterAprovadoresDisponiveis(unitSelected || undefined)
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const nova: Alcada = {
          id: 'ALC-' + Date.now(),
          unitCD: result.unitCD.toUpperCase(),
          limiteInferior: Number(result.limiteInferior) || 0,
          limiteSuperior: Number(result.limiteSuperior) || 0,
          userid: result.userid.toUpperCase(),
          primeiroNome: result.primeiroNome.toUpperCase(),
          ultimoNome: result.ultimoNome.toUpperCase(),
          sequencia: Number(result.sequencia) || 1,
          status: result.status,
          ausenciaPeriodo: result.ausenciaPeriodo
        };
        this.alcadas.update(list => [...list, nova]);
        
        if (!this.unidadeSelecionada()) {
          this.unidadeSelecionada.set(nova.unitCD);
        }
        
        this.validarGargaloAlcadas();
        this.snackBar.open(`Alçada para o usuário ${nova.primeiroNome} adicionada com sucesso!`, 'Fechar', { duration: 4000 });
      }
    });
  }

  // Controle de Empresas
  empresaSelecionadaUsr = signal<Empresa | null>(null);

  usuariosFiltradosPorEmpresa(empresaId: string) {
    return this.usuarios().filter(u => u.empresaId === empresaId);
  }

  selecionarEmpresaUsr(emp: Empresa) {
    if (this.empresaSelecionadaUsr()?.id === emp.id) {
      this.empresaSelecionadaUsr.set(null);
    } else {
      this.empresaSelecionadaUsr.set(emp);
    }
  }

  addEmpresa() {
    const dialogRef = this.dialog.open(AddEmpresaModal);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const nova: Empresa = {
          id: 'EMP-' + result.sigla.toUpperCase(),
          sigla: result.sigla.toUpperCase(),
          nome: result.nome.toUpperCase(),
          endereco: result.endereco,
          tipo: result.tipo
        };
        this.empresas.update(list => [...list, nova]);
        this.snackBar.open(`Empresa ${nova.nome} cadastrada com sucesso!`, 'Fechar', { duration: 4000 });
      }
    });
  }

  editarEmpresa(emp: Empresa) {
    const dialogRef = this.dialog.open(AddEmpresaModal, {
      data: emp
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.empresas.update(list => 
          list.map(e => e.id === emp.id ? {
            ...e,
            nome: result.nome.toUpperCase(),
            endereco: result.endereco
          } : e)
        );
        this.snackBar.open(`Empresa ${result.nome.toUpperCase()} editada com sucesso!`, 'Fechar', { duration: 4000 });
      }
    });
  }

  // Controle de Usuários por Empresa
  addUsuario() {
    const dialogRef = this.dialog.open(AddUsuarioModal, {
      data: {
        empresas: this.empresas(),
        empresaId: this.empresaSelecionadaUsr()?.id || ''
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const novo: Usuario = {
          id: result.id.toUpperCase(),
          primeiroNome: result.primeiroNome.toUpperCase(),
          ultimoNome: result.ultimoNome.toUpperCase(),
          email: result.email,
          telefone: result.telefone,
          empresaId: result.empresaId,
          funcao: result.funcao,
          perfil: result.perfil,
          status: result.status,
          ausenciaPeriodo: result.ausenciaPeriodo
        };
        this.usuarios.update(list => [...list, novo]);
        this.validarGargaloAlcadas();
        this.snackBar.open(`Usuário ${novo.primeiroNome} adicionado com sucesso!`, 'Fechar', { duration: 4000 });
      }
    });
  }

  editarUsuario(usr: Usuario) {
    const dialogRef = this.dialog.open(AddUsuarioModal, {
      data: {
        editData: usr,
        empresas: this.empresas()
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.usuarios.update(list => 
          list.map(u => u.id === usr.id ? {
            ...u,
            primeiroNome: result.primeiroNome.toUpperCase(),
            ultimoNome: result.ultimoNome.toUpperCase(),
            email: result.email,
            telefone: result.telefone,
            empresaId: result.empresaId,
            funcao: result.funcao,
            perfil: result.perfil,
            status: result.status,
            ausenciaPeriodo: result.ausenciaPeriodo
          } : u)
        );
        this.validarGargaloAlcadas();
        this.snackBar.open(`Usuário ${result.primeiroNome.toUpperCase()} editado com sucesso!`, 'Fechar', { duration: 4000 });
      }
    });
  }

  toggleUsuarioStatus(usr: Usuario) {
    this.usuarios.update(list => 
      list.map(u => {
        if (u.id === usr.id) {
          const novoStatus = u.status === 'Desabilitado' ? 'Ativo' : 'Desabilitado';
          return { ...u, status: novoStatus as any };
        }
        return u;
      })
    );
    this.validarGargaloAlcadas();
    const novoUsr = this.usuarios().find(u => u.id === usr.id);
    const acaoMsg = novoUsr && novoUsr.status === 'Desabilitado' ? 'desabilitado' : 'habilitado';
    this.snackBar.open(`Usuário ${usr.primeiroNome} ${acaoMsg} com sucesso!`, 'Fechar', { duration: 4000 });
  }
}

