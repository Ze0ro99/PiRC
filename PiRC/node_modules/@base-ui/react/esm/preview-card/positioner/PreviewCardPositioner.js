'use client';

import * as React from 'react';
import { usePreviewCardRootContext } from "../root/PreviewCardContext.js";
import { PreviewCardPositionerContext } from "./PreviewCardPositionerContext.js";
import { FloatingNode, useFloatingNodeId } from "../../floating-ui-react/index.js";
import { useAnchorPositioning } from "../../utils/useAnchorPositioning.js";
import { usePreviewCardPortalContext } from "../portal/PreviewCardPortalContext.js";
import { POPUP_COLLISION_AVOIDANCE } from "../../internals/constants.js";
import { adaptiveOrigin } from "../../utils/adaptiveOriginMiddleware.js";
import { usePositioner } from "../../utils/usePositioner.js";

/**
 * Positions the popup against the trigger.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Preview Card](https://base-ui.com/react/components/preview-card)
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const PreviewCardPositioner = /*#__PURE__*/React.forwardRef(function PreviewCardPositioner(componentProps, forwardedRef) {
  const {
    render,
    className,
    anchor,
    positionMethod = 'absolute',
    side = 'bottom',
    align = 'center',
    sideOffset = 0,
    alignOffset = 0,
    collisionBoundary = 'clipping-ancestors',
    collisionPadding = 5,
    arrowPadding = 5,
    sticky = false,
    disableAnchorTracking = false,
    collisionAvoidance = POPUP_COLLISION_AVOIDANCE,
    style,
    ...elementProps
  } = componentProps;
  const store = usePreviewCardRootContext();
  const keepMounted = usePreviewCardPortalContext();
  const nodeId = useFloatingNodeId();
  const open = store.useState('open');
  const mounted = store.useState('mounted');
  const floatingRootContext = store.useState('floatingRootContext');
  const instantType = store.useState('instantType');
  const transitionStatus = store.useState('transitionStatus');
  const hasViewport = store.useState('hasViewport');
  const positioning = useAnchorPositioning({
    anchor,
    floatingRootContext,
    positionMethod,
    mounted,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    collisionBoundary,
    collisionPadding,
    sticky,
    disableAnchorTracking,
    keepMounted,
    nodeId,
    collisionAvoidance,
    adaptiveOrigin: hasViewport ? adaptiveOrigin : undefined
  });
  const state = {
    open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    instant: instantType
  };
  const element = usePositioner(componentProps, state, {
    styles: positioning.positionerStyles,
    transitionStatus,
    props: elementProps,
    refs: [forwardedRef, store.useStateSetter('positionerElement')],
    hidden: !mounted,
    inert: !open
  });
  return /*#__PURE__*/_jsx(PreviewCardPositionerContext.Provider, {
    value: positioning,
    children: /*#__PURE__*/_jsx(FloatingNode, {
      id: nodeId,
      children: element
    })
  });
});
if (process.env.NODE_ENV !== "production") PreviewCardPositioner.displayName = "PreviewCardPositioner";