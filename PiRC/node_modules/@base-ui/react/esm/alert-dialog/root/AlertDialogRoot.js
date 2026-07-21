'use client';

import * as React from 'react';
import { IsDrawerContext } from "../../dialog/root/DialogRoot.js";
import { useDialogRoot } from "../../dialog/root/useDialogRoot.js";
import { DialogRootContext, useDialogRootContext } from "../../dialog/root/DialogRootContext.js";
import { DialogStore } from "../../dialog/store/DialogStore.js";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Groups all parts of the alert dialog.
 * Doesn't render its own HTML element.
 *
 * Documentation: [Base UI Alert Dialog](https://base-ui.com/react/components/alert-dialog)
 */
export function AlertDialogRoot(props) {
  const {
    children,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onOpenChangeComplete,
    actionsRef,
    handle,
    triggerId: triggerIdProp,
    defaultTriggerId: defaultTriggerIdProp = null
  } = props;
  const parentDialogRootContext = useDialogRootContext(true);
  const nested = Boolean(parentDialogRootContext);
  const store = DialogStore.useStore(handle?.store, {
    open: defaultOpen,
    openProp,
    activeTriggerId: defaultTriggerIdProp,
    triggerIdProp,
    modal: true,
    disablePointerDismissal: true,
    nested,
    role: 'alertdialog'
  });
  store.useControlledProp('openProp', openProp);
  store.useControlledProp('triggerIdProp', triggerIdProp);
  store.useSyncedValue('nested', nested);
  store.useContextCallback('onOpenChange', onOpenChange);
  store.useContextCallback('onOpenChangeComplete', onOpenChangeComplete);
  const payload = store.useState('payload');
  useDialogRoot({
    store,
    actionsRef,
    parentContext: parentDialogRootContext?.store.context,
    isDrawer: false,
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