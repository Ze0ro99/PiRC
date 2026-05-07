'use client';

import * as React from 'react';
import { triggerOpenStateMapping } from "../../utils/collapsibleOpenStateMapping.js";
import { transitionStatusMapping } from "../../internals/stateAttributesMapping.js";
import { useRenderElement } from "../../internals/useRenderElement.js";
import { useButton } from "../../internals/use-button/index.js";
import { useCollapsibleRootContext } from "../root/CollapsibleRootContext.js";
const stateAttributesMapping = {
  ...triggerOpenStateMapping,
  ...transitionStatusMapping
};

/**
 * A button that opens and closes the collapsible panel.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Collapsible](https://base-ui.com/react/components/collapsible)
 */
export const CollapsibleTrigger = /*#__PURE__*/React.forwardRef(function CollapsibleTrigger(componentProps, forwardedRef) {
  const {
    panelId,
    open,
    handleTrigger,
    state,
    disabled: contextDisabled
  } = useCollapsibleRootContext();
  const {
    className,
    disabled = contextDisabled,
    id,
    render,
    nativeButton = true,
    style,
    ...elementProps
  } = componentProps;
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled,
    focusableWhenDisabled: true,
    native: nativeButton
  });
  const props = React.useMemo(() => ({
    'aria-controls': open ? panelId : undefined,
    'aria-expanded': open,
    onClick: handleTrigger
  }), [panelId, open, handleTrigger]);
  const element = useRenderElement('button', componentProps, {
    state,
    ref: [forwardedRef, buttonRef],
    props: [props, elementProps, getButtonProps],
    stateAttributesMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") CollapsibleTrigger.displayName = "CollapsibleTrigger";