import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
})
export class FileUploadComponent {
  @Output() readonly filesChanged = new EventEmitter<File[]>();

  protected readonly files = signal<File[]>([]);
  protected readonly isDragging = signal(false);

  protected onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(input.files);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  protected onDragLeave(): void {
    this.isDragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    this.addFiles(event.dataTransfer?.files ?? null);
  }

  protected removeFile(index: number): void {
    const nextFiles = this.files().filter((_, fileIndex) => fileIndex !== index);
    this.files.set(nextFiles);
    this.filesChanged.emit(nextFiles);
  }

  protected formatSize(size: number): string {
    if (size < 1024 * 1024) {
      return `${Math.max(1, Math.round(size / 1024))} KB`;
    }

    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  private addFiles(fileList: FileList | null): void {
    if (!fileList?.length) {
      return;
    }

    const acceptedFiles = Array.from(fileList).filter((file) =>
      ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(file.type),
    );

    const nextFiles = [...this.files(), ...acceptedFiles];
    this.files.set(nextFiles);
    this.filesChanged.emit(nextFiles);
  }
}
