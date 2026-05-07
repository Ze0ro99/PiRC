'use client';

import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useFieldRootContext } from "../../internals/field-root-context/FieldRootContext.js";
import { useLabelableContext } from "../../internals/labelable-provider/LabelableContext.js";
import { fieldValidityMapping } from "../../internals/field-constants/constants.js";
import { useBaseUiId } from "../../internals/useBaseUiId.js";
import { useRenderElement } from "../../internals/useRenderElement.js";

/**
 * A paragraph with additional information about the field.
 * Renders a `<p>` element.
 *
 * Documentation: [Base UI Field](https://base-ui.com/react/components/field)
 */
export const FieldDescription = /*#__PURE__*/React.forwardRef(function FieldDescription(componentProps, forwardedRef) {
  const {
    render,
    id: idProp,
    className,
    style,
    ...elementProps
  } = componentProps;
  const id = useBaseUiId(idProp);
  const fieldRootContext = useFieldRootContext(false);
  const {
    setMessageIds
  } = useLabelableContext();
  useIsoLayoutEffect(() => {
    if (!id) {
      return undefined;
    }
    setMessageIds(v => v.concat(id));
    return () => {
      setMessageIds(v => v.filter(item => item !== id));
    };
  }, [id, setMessageIds]);
  const element = useRenderElement('p', componentProps, {
    ref: forwardedRef,
    state: fieldRootContext.state,
    props: [{
      id
    }, elementProps],
    stateAttributesMapping: fieldValidityMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") FieldDescription.displayName = "FieldDescription";