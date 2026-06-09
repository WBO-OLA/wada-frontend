import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { DocumentService } from '../../services/document.service';
import { AssetAssignmentService } from '../../../inventory/services/asset-assignment.service';
import {
  Member, STATUS_LABELS, RANK_LABELS, MemberStatus,
  StatusHistoryEntry, RankHistoryEntry, MedicalRecord
} from '../../../../core/models/member.model';
import { MemberDocument } from '../../../../core/models/document.model';
import { AssetAssignment } from '../../../../core/models/asset-assignment.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-member-detail',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './member-detail.html',
  styleUrl: './member-detail.css',
})
export class MemberDetail implements OnInit {
  private fb = inject(FormBuilder);
  private memberService = inject(MemberService);
  private documentService = inject(DocumentService);
  private assetService = inject(AssetAssignmentService);
  private route = inject(ActivatedRoute);
  protected auth = inject(AuthService);

  uploadForm = this.fb.group({ description: [''], uploadedBy: [''] });
  medicalForm = this.fb.group({
    recordDate: ['', Validators.required],
    diagnosis: ['', Validators.required],
    treatment: [''],
    physician: [''],
    confidential: [false],
    notes: [''],
  });

  member = signal<Member | null>(null);
  loading = signal(true);
  documents = signal<MemberDocument[]>([]);
  docsLoading = signal(false);
  showUpload = signal(false);
  uploading = signal(false);
  selectedFile = signal<File | null>(null);
  docError = signal('');
  docSuccess = signal('');

  statusHistory = signal<StatusHistoryEntry[]>([]);
  rankHistory = signal<RankHistoryEntry[]>([]);
  showStatusHistory = signal(false);
  showRankHistory = signal(false);

  medicalRecords = signal<MedicalRecord[]>([]);
  showMedical = signal(false);
  showMedicalForm = signal(false);
  medicalSubmitting = signal(false);
  medicalError = signal('');

  assignedAssets = signal<AssetAssignment[]>([]);
  showAssets = signal(false);

  readonly statusLabels = STATUS_LABELS;
  readonly rankLabels = RANK_LABELS;
  readonly statusColors: Record<MemberStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    NEW_JOINER: 'bg-blue-100 text-blue-700',
    INJURED: 'bg-yellow-100 text-yellow-700',
    RETIRED: 'bg-gray-100 text-gray-600',
    PASSED_AWAY: 'bg-red-100 text-red-700',
  };

  get canViewMedical(): boolean {
    const r = this.auth.getRole();
    return r === 'ADMIN' || r === 'MANAGER';
  }

  constructor() {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.memberService.getById(id).subscribe({
      next: m => {
        this.member.set(m);
        this.loading.set(false);
        this.loadDocuments(id);
        this.loadStatusHistory(id);
        this.loadRankHistory(id);
        this.loadAssignedAssets(id);
        if (this.canViewMedical) this.loadMedicalRecords(id);
      },
      error: () => this.loading.set(false),
    });
  }

  loadDocuments(memberId: number) {
    this.docsLoading.set(true);
    this.documentService.getDocuments(memberId).subscribe({
      next: docs => { this.documents.set(docs); this.docsLoading.set(false); },
      error: () => this.docsLoading.set(false),
    });
  }

  loadStatusHistory(memberId: number) {
    this.memberService.getStatusHistory(memberId).subscribe({
      next: h => this.statusHistory.set(h),
      error: () => {},
    });
  }

  loadRankHistory(memberId: number) {
    this.memberService.getRankHistory(memberId).subscribe({
      next: h => this.rankHistory.set(h),
      error: () => {},
    });
  }

  loadMedicalRecords(memberId: number) {
    this.memberService.getMedicalRecords(memberId).subscribe({
      next: r => this.medicalRecords.set(r),
      error: () => {},
    });
  }

  loadAssignedAssets(memberId: number) {
    this.assetService.getActiveByMember(memberId).subscribe({
      next: a => this.assignedAssets.set(a),
      error: () => {},
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedFile.set(input.files[0]);
  }

  uploadDocument() {
    if (!this.selectedFile() || !this.member()?.id) return;
    this.uploading.set(true);
    this.docError.set('');
    const { description, uploadedBy } = this.uploadForm.value;
    this.documentService.upload(
      this.member()!.id!, this.selectedFile()!, description ?? '', uploadedBy ?? ''
    ).subscribe({
      next: () => {
        this.docSuccess.set('Document uploaded.');
        this.uploading.set(false);
        this.showUpload.set(false);
        this.uploadForm.reset();
        this.selectedFile.set(null);
        this.loadDocuments(this.member()!.id!);
      },
      error: (err: any) => {
        this.docError.set(err?.error?.message ?? 'Upload failed.');
        this.uploading.set(false);
      },
    });
  }

  downloadUrl(docId: number): string {
    return this.documentService.getDownloadUrl(docId);
  }

  deleteDocument(docId: number) {
    this.documentService.delete(docId).subscribe({
      next: () => { this.docSuccess.set('Document deleted.'); this.loadDocuments(this.member()!.id!); },
      error: (err: any) => this.docError.set(err?.error?.message ?? 'Delete failed.'),
    });
  }

  submitMedicalRecord() {
    if (this.medicalForm.invalid || !this.member()?.id) return;
    this.medicalSubmitting.set(true);
    this.medicalError.set('');
    this.memberService.addMedicalRecord(this.member()!.id!, this.medicalForm.value as Partial<MedicalRecord>).subscribe({
      next: () => {
        this.medicalSubmitting.set(false);
        this.showMedicalForm.set(false);
        this.medicalForm.reset({ confidential: false });
        this.loadMedicalRecords(this.member()!.id!);
      },
      error: (err: any) => {
        this.medicalError.set(err?.error?.message ?? 'Failed to add record.');
        this.medicalSubmitting.set(false);
      },
    });
  }

  deleteMedicalRecord(recordId: number) {
    this.memberService.deleteMedicalRecord(recordId).subscribe({
      next: () => this.loadMedicalRecords(this.member()!.id!),
    });
  }

  formatBytes(bytes: number | undefined): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  formatDate(dt: string | undefined): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
