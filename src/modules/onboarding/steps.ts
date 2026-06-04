/**
 * Lógica pura del stepper de onboarding (sin red, testeable). Define los pasos,
 * valida el avance y calcula el progreso. La verificación real (Self) la hace
 * el adapter; aquí solo el control de flujo.
 */

export const ONBOARDING_STEPS = ["account", "profile", "verify", "done"] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export interface OnboardingState {
  step: OnboardingStep;
  email?: string;
  fullName?: string;
  country?: string;
  selfVerified: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Valida que un paso esté completo para poder avanzar. Falla fuerte si no. */
export function canAdvance(state: OnboardingState): boolean {
  switch (state.step) {
    case "account":
      return !!state.email && EMAIL_RE.test(state.email);
    case "profile":
      return !!state.fullName?.trim() && !!state.country && state.country.length === 2;
    case "verify":
      return state.selfVerified;
    case "done":
      return false;
  }
}

/** Índice del paso actual (para la barra de progreso). */
export function stepIndex(step: OnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step);
}

/** Progreso 0..1 según el paso actual. */
export function progress(step: OnboardingStep): number {
  return stepIndex(step) / (ONBOARDING_STEPS.length - 1);
}

/** Siguiente paso, o el mismo si no se puede avanzar. */
export function nextStep(state: OnboardingState): OnboardingStep {
  if (!canAdvance(state)) return state.step;
  const i = stepIndex(state.step);
  return ONBOARDING_STEPS[Math.min(i + 1, ONBOARDING_STEPS.length - 1)];
}
