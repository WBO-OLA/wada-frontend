import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { DocumentService } from '../../services/document.service';
import { CommandService } from '../../services/command.service';
import { AssetAssignmentService } from '../../../inventory/services/asset-assignment.service';
import {
  Member, STATUS_LABELS, RANK_LABELS, MemberStatus,
  StatusHistoryEntry, RankHistoryEntry, TransferHistoryEntry, MedicalRecord,
  MemberActivity, ActivityType, ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_COLORS,
  ResponsibilityHistoryEntry
} from '../../../../core/models/member.model';
import { Command } from '../../../../core/models/command.model';
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
  private commandService = inject(CommandService);
  private assetService = inject(AssetAssignmentService);
  private route = inject(ActivatedRoute);
  protected auth = inject(AuthService);

  uploadForm = this.fb.group({ description: [''] });
  responsibilityForm = this.fb.group({
    responsibility: ['', Validators.required],
    changedBy: ['', Validators.required],
    reason: [''],
  });
  transferForm = this.fb.group({
    toCommandId: [null as number | null],
    transferredBy: ['', Validators.required],
    reason: [''],
  });
  activityForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    activityDate: ['', Validators.required],
    type: ['JOIN' as ActivityType, Validators.required],
  });
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
  allCommands = signal<Command[]>([]);
  transferHistory = signal<TransferHistoryEntry[]>([]);
  showTransferForm = signal(false);
  transferSubmitting = signal(false);
  transferError = signal('');

  documents = signal<MemberDocument[]>([]);
  docsLoading = signal(false);
  showUpload = signal(false);
  uploading = signal(false);
  selectedFile = signal<File | null>(null);
  docError = signal('');
  docSuccess = signal('');

  activities = signal<MemberActivity[]>([]);
  showActivityForm = signal(false);
  activitySubmitting = signal(false);
  activityError = signal('');

  statusHistory = signal<StatusHistoryEntry[]>([]);
  rankHistory = signal<RankHistoryEntry[]>([]);

  medicalRecords = signal<MedicalRecord[]>([]);
  showMedicalForm = signal(false);
  medicalSubmitting = signal(false);
  medicalError = signal('');

  responsibilityHistory = signal<ResponsibilityHistoryEntry[]>([]);
  showResponsibilityForm = signal(false);
  responsibilitySubmitting = signal(false);
  responsibilityError = signal('');

  photoUploading = signal(false);
  photoError = signal('');

  assignedAssets = signal<AssetAssignment[]>([]);

  activeTab = signal<string>('profile');

  responsibilityTimeline = computed(() => {
    const asc = [...this.responsibilityHistory()].reverse();
    return asc.map((entry, i) => {
      const fromYear = new Date(entry.changedAt).getFullYear().toString();
      const next = asc[i + 1];
      const toYear = next ? new Date(next.changedAt).getFullYear().toString() : 'Present';
      return {
        responsibility: entry.newResponsibility,
        fromYear,
        toYear,
        isCurrent: !next,
        changedBy: entry.changedBy,
        reason: entry.reason,
        changedAt: entry.changedAt,
      };
    }).reverse();
  });

  readonly statusLabels = STATUS_LABELS;
  readonly rankLabels = RANK_LABELS;
  readonly activityTypeLabels = ACTIVITY_TYPE_LABELS;
  readonly activityTypeColors = ACTIVITY_TYPE_COLORS;
  readonly activityTypes: ActivityType[] = ['JOIN', 'PROMOTION', 'TRAINING', 'INJURY', 'MISSION', 'MISSION_SUCCESS', 'MISSION_FAILED', 'AWARD', 'RETIREMENT'];
  readonly statusColors: Record<MemberStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    INJURED: 'bg-yellow-100 text-yellow-700',
    RETIRED: 'bg-gray-100 text-gray-600',
    PASSED_AWAY: 'bg-red-100 text-red-700',
  };

  tabClass(tab: string): string {
    const base = 'px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap focus:outline-none ';
    return tab === this.activeTab()
      ? base + 'border-slate-900 text-slate-900'
      : base + 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  }

  get canEdit(): boolean { return this.auth.canEdit(); }

  get canViewMedical(): boolean {
    const r = this.auth.getRole();
    return r === 'ADMIN' || r === 'CHIEF' || r === 'MANAGER';
  }

  get currentUser(): string { return this.auth.getUser()?.username ?? ''; }

  constructor() {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.commandService.getAll().subscribe({ next: c => this.allCommands.set(c), error: () => {} });
    this.memberService.getById(id).subscribe({
      next: m => {
        this.member.set(m);
        this.loading.set(false);
        this.loadDocuments(id);
        this.loadActivities(id);
        this.loadStatusHistory(id);
        this.loadRankHistory(id);
        this.loadTransferHistory(id);
        this.loadResponsibilityHistory(id);
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

  loadActivities(memberId: number) {
    this.memberService.getActivities(memberId).subscribe({
      next: a => this.activities.set(a),
      error: () => {},
    });
  }

  addActivity() {
    if (this.activityForm.invalid || !this.member()?.id) return;
    this.activitySubmitting.set(true);
    this.activityError.set('');
    this.memberService.addActivity(this.member()!.id!, this.activityForm.value as Partial<MemberActivity>).subscribe({
      next: () => {
        this.activitySubmitting.set(false);
        this.showActivityForm.set(false);
        this.activityForm.reset({ type: 'JOIN' });
        this.loadActivities(this.member()!.id!);
      },
      error: (err: any) => {
        this.activityError.set(err?.error?.message ?? 'Failed to add activity.');
        this.activitySubmitting.set(false);
      },
    });
  }

  deleteActivity(activityId: number) {
    this.memberService.deleteActivity(activityId).subscribe({
      next: () => this.loadActivities(this.member()!.id!),
    });
  }

  loadTransferHistory(memberId: number) {
    this.memberService.getTransferHistory(memberId).subscribe({
      next: h => this.transferHistory.set(h),
      error: () => {},
    });
  }

  loadResponsibilityHistory(memberId: number) {
    this.memberService.getResponsibilityHistory(memberId).subscribe({
      next: h => this.responsibilityHistory.set(h),
      error: () => {},
    });
  }

  submitResponsibility() {
    if (this.responsibilityForm.invalid || !this.member()?.id) return;
    this.responsibilitySubmitting.set(true);
    this.responsibilityError.set('');
    const { responsibility, changedBy, reason } = this.responsibilityForm.value;
    this.memberService.updateResponsibility(this.member()!.id!, {
      responsibility: responsibility!,
      changedBy: changedBy!,
      reason: reason ?? undefined,
    }).subscribe({
      next: updated => {
        this.member.set(updated);
        this.responsibilitySubmitting.set(false);
        this.showResponsibilityForm.set(false);
        this.responsibilityForm.reset();
        this.loadResponsibilityHistory(this.member()!.id!);
      },
      error: (err: any) => {
        this.responsibilityError.set(err?.error?.message ?? 'Failed to update responsibility.');
        this.responsibilitySubmitting.set(false);
      },
    });
  }

  submitTransfer() {
    if (this.transferForm.invalid || !this.member()?.id) return;
    this.transferSubmitting.set(true);
    this.transferError.set('');
    const { toCommandId, transferredBy, reason } = this.transferForm.value;
    this.memberService.transfer(this.member()!.id!, {
      toCommandId: toCommandId ?? null,
      transferredBy: transferredBy!,
      reason: reason ?? undefined,
    }).subscribe({
      next: updated => {
        this.member.set(updated);
        this.transferSubmitting.set(false);
        this.showTransferForm.set(false);
        this.transferForm.reset();
        this.loadTransferHistory(this.member()!.id!);
      },
      error: (err: any) => {
        this.transferError.set(err?.error?.message ?? 'Transfer failed.');
        this.transferSubmitting.set(false);
      },
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

  photoUrl(id: number | undefined): string | null {
    if (!id) return null;
    return this.memberService.getPhotoUrl(id) + '?t=' + (this.member()?.updatedAt ?? '');
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.member()?.id) return;
    const file = input.files[0];
    this.photoUploading.set(true);
    this.photoError.set('');
    this.memberService.uploadPhoto(this.member()!.id!, file).subscribe({
      next: updated => {
        this.member.set(updated);
        this.photoUploading.set(false);
      },
      error: (err: any) => {
        this.photoError.set(err?.error?.message ?? 'Photo upload failed.');
        this.photoUploading.set(false);
      },
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
    const { description } = this.uploadForm.value;
    this.documentService.upload(
      this.member()!.id!, this.selectedFile()!, description ?? '', this.currentUser
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
