import * as React from 'react';
import type { FieldValidityData } from "../../field/root/FieldRoot.js";
export interface FieldControlRegistration {
  controlRef: React.RefObject<any>;
  getValue?: (() => unknown) | undefined;
  id: string | undefined;
  value: unknown;
}
export declare function useFieldControlRegistration(params: UseFieldControlRegistrationParameters): (source: symbol, registration: FieldControlRegistration | undefined) => void;
export interface UseFieldControlRegistrationParameters {
  commit: (value: unknown) => void;
  invalid: boolean;
  markedDirtyRef: React.RefObject<boolean>;
  name: string | undefined;
  setValidityData: React.Dispatch<React.SetStateAction<FieldValidityData>>;
  validityData: FieldValidityData;
}