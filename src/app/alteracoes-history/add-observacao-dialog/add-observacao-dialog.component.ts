// src/app/alteracoes-history/add-observacao-dialog/add-observacao-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-add-observacao-dialog',
  templateUrl: './add-observacao-dialog.component.html',
  styleUrls: ['./add-observacao-dialog.component.scss']
})
export class AddObservacaoDialogComponent {
  observacaoForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    public dialogRef: MatDialogRef<AddObservacaoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: any },
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.observacaoForm = this.fb.group({
      texto: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.observacaoForm.valid) {
      this.loading = true;
      this.error = '';

      // Adiciona observação ao registro específico, incluindo a data de modificação
      this.apiService.adicionarObservacaoRegistro(
        this.data.item.tabela,
        this.data.item.id,
        this.observacaoForm.value.texto,
        this.data.item.data_modificacao
      ).subscribe({
        next: (response) => {
          this.loading = false;
          this.dialogRef.close({ success: true, observacao: response });
        },
        error: (error) => {
          console.error('Erro ao adicionar observação:', error);
          this.error = error.error?.error || error.error?.texto?.[0] || 'Erro ao salvar observação. Tente novamente.';
          this.loading = false;
        }
      });
    }
  }
}

