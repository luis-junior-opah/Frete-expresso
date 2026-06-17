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
      { cnpj: '01.234.567/0001-01', nome: 'JOHN DEERE BRASIL LTDA', nomeReduzido: 'JOHN DEERE CAT', codErp: '1001', municipio: 'Catalão', uf: 'GO' },
      { cnpj: '01.234.567/0002-02', nome: 'JOHN DEERE MONTENEGRO', nomeReduzido: 'JOHN DEERE MON', codErp: '1002', municipio: 'Montenegro', uf: 'RS' },
    ],
    fornecedor: [
      { cnpj: '10.200.300/0001-11', nome: 'FORNECEDOR MIRASSOL', nomeReduzido: 'MIRASSOL SP', codErp: 'F001', municipio: 'Mirassol', uf: 'SP' },
    ],
    transportador: [
      { cnpj: '90.100.200/0001-99', nome: 'JM PREMIER TRANSPORTES', nomeReduzido: 'JM PREMIER', codErp: 'T001', municipio: 'São Paulo', uf: 'SP' },
      { cnpj: '91.200.300/0001-88', nome: 'RAPIDÃO COMETA LTDA', nomeReduzido: 'COMETA', codErp: 'T002', municipio: 'Campinas', uf: 'SP' },
      { cnpj: '92.300.400/0001-77', nome: 'BRASPRESS TRANSPORTES', nomeReduzido: 'BRASPRESS', codErp: 'T003', municipio: 'Guarulhos', uf: 'SP' },
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
