import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export function pastOrTodayValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const date = new Date(control.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date <= today ? null : { futureDate: true };
  };
}

export function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const dob = new Date(control.value);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - minAge);
    return dob <= cutoff ? null : { minAge: { required: minAge } };
  };
}

export function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export function maxDobIso(minAge: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - minAge);
  return d.toISOString().split('T')[0];
}
