"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useFieldControlRegistration = useFieldControlRegistration;
var React = _interopRequireWildcard(require("react"));
var ReactDOM = _interopRequireWildcard(require("react-dom"));
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _getCombinedFieldValidityData = require("../../field/utils/getCombinedFieldValidityData");
var _FormContext = require("../form-context/FormContext");
function useFieldControlRegistration(params) {
  const {
    commit,
    invalid,
    markedDirtyRef,
    name,
    setValidityData,
    validityData
  } = params;
  const {
    formRef
  } = (0, _FormContext.useFormContext)();
  const activeFieldControlSourceRef = React.useRef(null);
  const registrationRef = React.useRef(null);
  const fallbackControlRef = React.useRef(null);
  const getValue = (0, _useStableCallback.useStableCallback)(() => {
    const registration = registrationRef.current;
    if (!registration) {
      return undefined;
    }
    if (registration.getValue) {
      return registration.getValue();
    }
    return registration.value;
  });
  const validate = (0, _useStableCallback.useStableCallback)((flushSync = true) => {
    const registration = registrationRef.current;
    if (!registration) {
      return;
    }
    let nextValue = registration.value;
    if (nextValue === undefined) {
      nextValue = getValue();
    }
    markedDirtyRef.current = true;
    if (!flushSync) {
      commit(nextValue);
    } else {
      // Synchronously update the validity state so the submit event can be prevented.
      ReactDOM.flushSync(() => commit(nextValue));
    }
  });
  function refreshRegistration() {
    const registration = registrationRef.current;
    if (!registration || !registration.id) {
      return;
    }
    formRef.current.fields.set(registration.id, {
      getValue,
      name,
      controlRef: registration.controlRef ?? fallbackControlRef,
      validityData: (0, _getCombinedFieldValidityData.getCombinedFieldValidityData)(validityData, invalid),
      validate
    });
  }
  function deleteRegistration(id = registrationRef.current?.id) {
    if (id) {
      formRef.current.fields.delete(id);
    }
  }
  function syncInitialValue() {
    const registration = registrationRef.current;
    if (!registration) {
      return;
    }
    let initialValue = registration.value;
    if (initialValue === undefined) {
      initialValue = getValue();
    }
    if (validityData.initialValue === null && initialValue !== null) {
      setValidityData(prev => ({
        ...prev,
        initialValue
      }));
    }
  }
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    const registration = registrationRef.current;
    if (!registration || !registration.id) {
      return;
    }
    formRef.current.fields.set(registration.id, {
      getValue,
      name,
      controlRef: registration.controlRef ?? fallbackControlRef,
      validityData: (0, _getCombinedFieldValidityData.getCombinedFieldValidityData)(validityData, invalid),
      validate
    });
  }, [formRef, getValue, invalid, name, validate, validityData]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    const fields = formRef.current.fields;
    return () => {
      const id = registrationRef.current?.id;
      if (id) {
        fields.delete(id);
      }
    };
  }, [formRef]);
  return (0, _useStableCallback.useStableCallback)((source, registration) => {
    if (!registration) {
      if (activeFieldControlSourceRef.current === source) {
        activeFieldControlSourceRef.current = null;
        deleteRegistration();
        registrationRef.current = null;
      }
      return;
    }
    const previousId = registrationRef.current?.id;
    activeFieldControlSourceRef.current = source;
    registrationRef.current = registration;
    if (previousId && previousId !== registration.id) {
      deleteRegistration(previousId);
    }
    syncInitialValue();
    refreshRegistration();
  });
}