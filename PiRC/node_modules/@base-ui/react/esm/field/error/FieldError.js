'use client';

import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useFieldRootContext } from "../../internals/field-root-context/FieldRootContext.js";
import { useLabelableContext } from "../../internals/labelable-provider/LabelableContext.js";
import { fieldValidityMapping } from "../../internals/field-constants/constants.js";
import { useFormContext } from "../../internals/form-context/FormContext.js";
import { useRenderElement } from "../../internals/useRenderElement.js";
import { useBaseUiId } from "../../internals/useBaseUiId.js";
import { useOpenChangeComplete } from "../../internals/useOpenChangeComplete.js";
import { transitionStatusMapping } from "../../internals/stateAttributesMapping.js";
import { useTransitionStatus } from "../../internals/useTransitionStatus.js";
import { jsx as _jsx } from "react/jsx-runtime";
const stateAttributesMapping = {
  ...fieldValidityMapping,
  ...transitionStatusMapping
};

/**
 * An error message displayed if the field control fails validation.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Field](https://base-ui.com/react/components/field)
 */
export const FieldError = /*#__PURE__*/React.forwardRef(function FieldError(componentProps, forwardedRef) {
  const {
    render,
    id: idProp,
    className,
    match,
    style,
    ...elementProps
  } = componentProps;
  const id = useBaseUiId(idProp);
  const {
    validityData,
    state: fieldState,
    name
  } = useFieldRootContext(false);
  const {
    setMessageIds
  } = useLabelableContext();
  const {
    errors
  } = useFormContext();
  const formError = name ? errors[name] : null;
  const hasSpecificMatch = typeof match === 'string';
  let rendered = false;
  if (match === true) {
    rendered = true;
  } else if (hasSpecificMatch) {
    rendered = Boolean(validityData.state[match]);
  } else {
    rendered = Boolean(formError) || validityData.state.valid === false;
  }
  const {
    mounted,
    transitionStatus,
    setMounted
  } = useTransitionStatus(rendered);
  useIsoLayoutEffect(() => {
    if (!rendered || !id) {
      return undefined;
    }
    setMessageIds(v => v.concat(id));
    return () => {
      setMessageIds(v => v.filter(item => item !== id));
    };
  }, [rendered, id, setMessageIds]);
  const errorRef = React.useRef(null);
  const [lastRenderedMessage, setLastRenderedMessage] = React.useState(null);
  const [lastRenderedMessageKey, setLastRenderedMessageKey] = React.useState(null);
  const clientErrorMessage = validityData.errors.length > 1 ? /*#__PURE__*/_jsx("ul", {
    children: validityData.errors.map(message => /*#__PURE__*/_jsx("li", {
      children: message
    }, message))
  }) : validityData.error;
  const errorMessage = hasSpecificMatch ? clientErrorMessage : formError || clientErrorMessage;
  let errorKey = validityData.error;
  if (formError != null) {
    errorKey = Array.isArray(formError) ? JSON.stringify(formError) : formError;
  } else if (validityData.errors.length > 1) {
    errorKey = JSON.stringify(validityData.errors);
  }
  if (rendered && errorKey !== lastRenderedMessageKey) {
    setLastRenderedMessageKey(errorKey);
    setLastRenderedMessage(errorMessage);
  }
  useOpenChangeComplete({
    open: rendered,
    ref: errorRef,
    onComplete() {
      if (!rendered) {
        setMounted(false);
      }
    }
  });
  const state = {
    ...fieldState,
    transitionStatus
  };
  const element = useRenderElement('div', componentProps, {
    ref: [forwardedRef, errorRef],
    state,
    props: [{
      id,
      children: rendered ? errorMessage : lastRenderedMessage
    }, elementProps],
    stateAttributesMapping,
    enabled: mounted
  });
  if (!mounted) {
    return null;
  }
  return element;
});
if (process.env.NODE_ENV !== "production") FieldError.displayName = "FieldError";