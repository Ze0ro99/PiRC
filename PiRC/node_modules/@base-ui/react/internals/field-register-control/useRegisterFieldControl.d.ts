import type { FieldControlRegistration } from "./useFieldControlRegistration.js";
export interface UseRegisterFieldControlParameters extends FieldControlRegistration {
  enabled?: boolean | undefined;
}
export declare function useRegisterFieldControl(controlRef: FieldControlRegistration['controlRef'], params: Omit<UseRegisterFieldControlParameters, 'controlRef'>): void;