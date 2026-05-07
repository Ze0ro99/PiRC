"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DialogRoot = DialogRoot;
exports.IsDrawerContext = void 0;
var React = _interopRequireWildcard(require("react"));
var _useOnFirstRender = require("@base-ui/utils/useOnFirstRender");
var _useDialogRoot = require("./useDialogRoot");
var _DialogRootContext = require("./DialogRootContext");
var _DialogStore = require("../store/DialogStore");
var _jsxRuntime = require("react/jsx-runtime");
const IsDrawerContext = exports.IsDrawerContext = /*#__PURE__*/React.createContext(false);

/**
 * Groups all parts of the dialog.
 * Doesn't render its own HTML element.
 *
 * Documentation: [Base UI Dialog](https://base-ui.com/react/components/dialog)
 */
if (process.env.NODE_ENV !== "production") IsDrawerContext.displayName = "IsDrawerContext";
function DialogRoot(props) {
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
  const parentDialogRootContext = (0, _DialogRootContext.useDialogRootContext)(true);
  const isDrawer = React.useContext(IsDrawerContext);
  const nested = Boolean(parentDialogRootContext);
  const store = _DialogStore.DialogStore.useStore(handle?.store, {
    open: defaultOpen,
    openProp,
    activeTriggerId: defaultTriggerIdProp,
    triggerIdProp,
    modal,
    disablePointerDismissal,
    nested
  });

  // Support initially open state when uncontrolled
  (0, _useOnFirstRender.useOnFirstRender)(() => {
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
  (0, _useDialogRoot.useDialogRoot)({
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
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(IsDrawerContext.Provider, {
    value: false,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_DialogRootContext.DialogRootContext.Provider, {
      value: contextValue,
      children: typeof children === 'function' ? children({
        payload
      }) : children
    })
  });
}