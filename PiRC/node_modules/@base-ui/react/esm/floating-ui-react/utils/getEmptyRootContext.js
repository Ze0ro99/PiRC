import { PopupTriggerMap } from "../../utils/popups/index.js";
import { FloatingRootStore } from "../components/FloatingRootStore.js";
export function getEmptyRootContext() {
  return new FloatingRootStore({
    open: false,
    transitionStatus: undefined,
    floatingElement: null,
    referenceElement: null,
    triggerElements: new PopupTriggerMap(),
    floatingId: '',
    syncOnly: false,
    nested: false,
    onOpenChange: undefined
  });
}