import { Component, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatTooltipModule
  ],
  templateUrl: './search-modal.html',
  styleUrls: ['./search-modal.css']
})
export class SearchModal implements AfterViewInit {
  searchTerm = '';
  displayedColumns: string[] = ['cnpj', 'nome', 'nomeReduzido', 'codErp', 'municipio', 'uf', 'acoes'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  private allData: any = {
    cliente: [
      { cnpj: '01.234.567/0001-01', nome: 'JOHN DEERE CAMPINAS (3Q00)', nomeReduzido: 'JOHN DEERE CAMPINAS (3Q00)', codErp: '1001', municipio: 'Campinas', uf: 'SP' },
      { cnpj: '01.234.567/0002-02', nome: 'JOHN DEERE MONTENEGRO (BM00)', nomeReduzido: 'JOHN DEERE MONTENEGRO (BM00)', codErp: '1002', municipio: 'Montenegro', uf: 'RS' },
      { cnpj: '01.234.567/0003-03', nome: 'JOHN DEERE INDAIATUBA (BZ00)', nomeReduzido: 'JOHN DEERE INDAIATUBA (BZ00)', codErp: '1003', municipio: 'Indaiatuba', uf: 'SP' },
      { cnpj: '01.234.567/0004-04', nome: 'JOHN DEERE HORIZONTINA (CQ00)', nomeReduzido: 'JOHN DEERE HORIZONTINA (CQ00)', codErp: '1004', municipio: 'Horizontina', uf: 'RS' },
      { cnpj: '01.234.567/0005-05', nome: 'JOHN DEERE CATALAO (NW00)', nomeReduzido: 'JOHN DEERE CATALAO (NW00)', codErp: '1005', municipio: 'Catalão', uf: 'GO' },
    ],
    fornecedor: [
      { cnpj: '10.200.300/0001-11', nome: 'BRUNING (PANAMBI)', nomeReduzido: 'BRUNING (PANAMBI)', codErp: 'F001', municipio: 'Panambi', uf: 'RS' },
      { cnpj: '10.200.300/0002-22', nome: 'FOTOGRAVURA ZEYANA (CAXIAS)', nomeReduzido: 'FOTOGRAVURA ZEYANA (CAXIAS)', codErp: 'F002', municipio: 'Caxias do Sul', uf: 'RS' },
      { cnpj: '10.200.300/0003-33', nome: 'LTM (BOTUCATU)', nomeReduzido: 'LTM (BOTUCATU)', codErp: 'F003', municipio: 'Botucatu', uf: 'SP' },
      { cnpj: '10.200.300/0004-44', nome: 'BELLOTA (INDAIAL)', nomeReduzido: 'BELLOTA (INDAIAL)', codErp: 'F004', municipio: 'Indaial', uf: 'SC' },
      { cnpj: '10.200.300/0005-05', nome: 'HENNINGS (SOROCABA)', nomeReduzido: 'HENNINGS (SOROCABA)', codErp: 'F005', municipio: 'Sorocaba', uf: 'SP' },
    ],
    transportador: [
      { cnpj: '90.100.200/0001-99', nome: 'MIRASSOL', nomeReduzido: 'MIRASSOL', codErp: 'T001', municipio: 'Mirassol', uf: 'SP' },
      { cnpj: '91.200.300/0001-88', nome: 'M3 LOGÍSTICA', nomeReduzido: 'M3 LOGÍSTICA', codErp: 'T002', municipio: 'Campinas', uf: 'SP' },
      { cnpj: '92.300.400/0001-77', nome: 'GOLDEN CARGO', nomeReduzido: 'GOLDEN CARGO', codErp: 'T003', municipio: 'Guarulhos', uf: 'SP' },
      { cnpj: '93.400.500/0001-66', nome: 'VF (IVOTI)', nomeReduzido: 'VF (IVOTI)', codErp: 'T004', municipio: 'Ivoti', uf: 'RS' },
      { cnpj: '94.500.600/0001-55', nome: 'ARMANI (CAMPINAS)', nomeReduzido: 'ARMANI (CAMPINAS)', codErp: 'T005', municipio: 'Campinas', uf: 'SP' },
    ]
  };

  constructor(
    public dialogRef: MatDialogRef<SearchModal>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, type: 'cliente' | 'fornecedor' | 'transportador' }
  ) {
    this.dataSource.data = this.allData[data.type];
  }

  get dynamicTitle(): string {
    const titles = {
      cliente: 'Pesquisar Cliente',
      fornecedor: 'Pesquisar Fornecedor',
      transportador: 'Pesquisar Transportadora'
    };
    return titles[this.data.type];
  }

  get dynamicPlaceholder(): string {
    const placeholders = {
      cliente: 'Busca Cliente',
      fornecedor: 'Busca Fornecedor',
      transportador: 'Busca Transportador'
    };
    return placeholders[this.data.type];
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  buscar() {
    const original = this.allData[this.data.type];
    if (!this.searchTerm) {
      this.dataSource.data = original;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    const filtered = original.filter((item: any) => 
      item.cnpj.includes(term) || 
      item.nome.toLowerCase().includes(term) ||
      item.nomeReduzido.toLowerCase().includes(term) ||
      item.codErp.toLowerCase().includes(term)
    );
    this.dataSource.data = filtered;
  }

  selecionar(row: any) {
    this.dialogRef.close(row.nomeReduzido || row.nome);
  }

  fechar() {
    this.dialogRef.close();
  }
}
