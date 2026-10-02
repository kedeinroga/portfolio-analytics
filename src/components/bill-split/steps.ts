export const Step = {
  HOME: 0,
  SERVICE: 1,
  BILL: 2,
  ROOMS: 3,
  REVIEW: 4,
  RESULT: 5,
} as const;

export type Step = (typeof Step)[keyof typeof Step];

/** Steps shown in the "Paso N de M" indicator (HOME is not counted). */
export const WIZARD_STEP_COUNT = Step.RESULT;
