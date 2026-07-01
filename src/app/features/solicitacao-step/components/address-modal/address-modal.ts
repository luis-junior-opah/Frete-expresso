import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-address-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './address-modal.html',
  styleUrls: ['./address-modal.css']
})
export class AddressModal implements OnInit {
  addressForm!: FormGroup;

  ufs = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddressModal>,
    @Inject(MAT_DIALOG_DATA) public data: { address: string }
  ) {}

  ngOnInit() {
    this.addressForm = this.fb.group({
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      uf: ['', Validators.required],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]]
    });

    if (this.data && this.data.address) {
      const parsed = this.parseAddress(this.data.address);
      if (parsed) {
        this.addressForm.patchValue(parsed);
      }
    }
  }

  onCepInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 8) {
      value = value.substring(0, 8);
    }
    if (value.length > 5) {
      value = `${value.substring(0, 5)}-${value.substring(5)}`;
    }
    input.value = value;
    this.addressForm.get('cep')?.setValue(value, { emitEvent: false });
  }

  parseAddress(addressStr: string) {
    if (!addressStr) return null;
    try {
      const cepRegex = /(\d{5}-\d{3})$/;
      const cepMatch = addressStr.match(cepRegex);
      let cep = '';
      let remaining = addressStr;
      if (cepMatch) {
        cep = cepMatch[1];
        remaining = addressStr.replace(/,\s*\d{5}-\d{3}$/, '').trim();
      }

      const ufRegex = /-\s*([A-Z]{2})$/;
      const ufMatch = remaining.match(ufRegex);
      let uf = '';
      if (ufMatch) {
        uf = ufMatch[1];
        remaining = remaining.replace(/\s*-\s*[A-Z]{2}$/, '').trim();
      }

      const parts = remaining.split(',').map(p => p.trim());
      let logradouro = '';
      let numero = '';
      let complemento = '';
      let bairro = '';
      let cidade = '';

      if (parts.length >= 4) {
        logradouro = parts[0];
        const numCompPart = parts[1];
        if (numCompPart.includes(' - ')) {
          const subParts = numCompPart.split(' - ');
          numero = subParts[0].trim();
          complemento = subParts[1].trim();
        } else {
          numero = numCompPart.trim();
        }
        bairro = parts[2];
        cidade = parts.slice(3).join(', ');
      } else if (parts.length === 3) {
        logradouro = parts[0];
        numero = parts[1];
        bairro = parts[2];
      } else if (parts.length === 2) {
        logradouro = parts[0];
        numero = parts[1];
      } else {
        logradouro = addressStr;
      }

      return { logradouro, numero, complemento, bairro, cidade, uf, cep };
    } catch (e) {
      return { logradouro: addressStr, numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' };
    }
  }

  salvar() {
    if (this.addressForm.valid) {
      const val = this.addressForm.value;
      const streetNum = `${val.logradouro}, ${val.numero}`;
      const addressParts = [];
      if (val.complemento && val.complemento.trim()) {
        addressParts.push(`${streetNum} - ${val.complemento.trim()}`);
      } else {
        addressParts.push(streetNum);
      }
      addressParts.push(val.bairro.trim());
      const mainAddress = addressParts.join(', ');
      const finalAddress = `${mainAddress}, ${val.cidade.trim()} - ${val.uf}, ${val.cep}`;
      
      this.dialogRef.close(finalAddress);
    } else {
      this.addressForm.markAllAsTouched();
    }
  }

  voltar() {
    this.dialogRef.close();
  }
}
