'use client';

import * as React from 'react';
import { useOnFirstRender } from '@base-ui/utils/useOnFirstRender';
import { useDialogRoot } from "./useDialogRoot.js";
import { DialogRootContext, useDialogRootContext } from "./DialogRootContext.js";
import { DialogStore } from "../store/DialogStore.js";
import { jsx as _jsx } from "react/jsx-runtime";
export const IsDrawerContext = /*#__PURE__*/React.createContext(false);

/**
 * Groups all parts of the dialog.
 * Doesn't render its own HTML element.
 *
 * Documentation: [Base UI Dialog](https://base-ui.com/react/components/dialog)
 */
if (process.env.NODE_ENV !== "production") IsDrawerContext.displayName = "IsDrawerContext";
export function DialogRoot(props) {
  const {
    children,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onOpenChangeComplete,
    disablePointerDismissal = false,
    modal = true,
    actionsRef,
    handle,
    triggerId: triggerIdProp,
    defaultTriggerId: defaultTriggerIdProp = null
  } = props;
  const parentDialogRootContext = useDialogRootContext(true);
  const isDrawer = React.useContext(IsDrawerContext);
  const nested = Boolean(parentDialogRootContext);
  const store = DialogStore.useStore(handle?.store, {
    open: defaultOpen,
    openProp,
    activeTriggerId: defaultTriggerIdProp,
    triggerIdProp,
    modal,
    disablePointerDismissal,
    nested
  });

  // Support initially open state when uncontrolled
  useOnFirstRender(() => {
    if (openProp === undefined && store.state.open === false && defaultOpen === true) {
      store.update({
        open: true,
        activeTriggerId: defaultTriggerIdProp
      });
    }
  });
  store.useControlledProp('openProp', openProp);
  store.useControlledProp('triggerIdProp', triggerIdProp);
  store.useSyncedValues({
    disablePointerDismissal,
    nested,
    modal
  });
  store.useContextCallback('onOpenChange', onOpenChange);
  store.useContextCallback('onOpenChangeComplete', onOpenChangeComplete);
  const payload = store.useState('payload');
  useDialogRoot({
    store,
    actionsRef,
    parentContext: parentDialogRootContext?.store.context,
    isDrawer,
    onOpenChange,
    triggerIdProp
  });
  const contextValue = React.useMemo(() => ({
    store
  }), [store]);
  return /*#__PURE__*/_jsx(IsDrawerContext.Provider, {
    value: false,
    children: /*#__PURE__*/_jsx(DialogRootContext.Provider, {
      value: contextValue,
      children: typeof children === 'function' ? children({
        payload
      }) : children
    })
  });
}