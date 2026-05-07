"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FieldRootContext = void 0;
exports.useFieldRootContext = useFieldRootContext;
var _formatErrorMessage2 = _interopRequireDefault(require("@base-ui/utils/formatErrorMessage"));
var React = _interopRequireWildcard(require("react"));
var _empty = require("@base-ui/utils/empty");
var _noop = require("../noop");
var _constants = require("../field-constants/constants");
const FieldRootContext = exports.FieldRootContext = /*#__PURE__*/React.createContext({
  invalid: undefined,
  name: undefined,
  validityData: {
    state: _constants.DEFAULT_VALIDITY_STATE,
    errors: [],
    error: '',
    value: '',
    initialValue: null
  },
  setValidityData: _noop.NOOP,
  disabled: undefined,
  touched: _constants.DEFAULT_FIELD_STATE_ATTRIBUTES.touched,
  setTouched: _noop.NOOP,
  dirty: _constants.DEFAULT_FIELD_STATE_ATTRIBUTES.dirty,
  setDirty: _noop.NOOP,
  filled: _constants.DEFAULT_FIELD_STATE_ATTRIBUTES.filled,
  setFilled: _noop.NOOP,
  focused: _constants.DEFAULT_FIELD_STATE_ATTRIBUTES.focused,
  setFocused: _noop.NOOP,
  validate: () => null,
  validationMode: 'onSubmit',
  validationDebounceTime: 0,
  shouldValidateOnChange: () => false,
  state: _constants.DEFAULT_FIELD_ROOT_STATE,
  markedDirtyRef: {
    current: false
  },
  registerFieldControl: _noop.NOOP,
  validation: {
    getValidationProps: (props = _empty.EMPTY_OBJECT) => props,
    getInputValidationProps: (props = _empty.EMPTY_OBJECT) => props,
    inputRef: {
      current: null
    },
    commit: async () => {}
  }
});
if (process.env.NODE_ENV !== "production") FieldRootContext.displayName = "FieldRootContext";
function useFieldRootContext(optional = true) {
  const context = React.useContext(FieldRootContext);
  if (context.setValidityData === _noop.NOOP && !optional) {
    throw new Error(process.env.NODE_ENV !== "production" ? 'Base UI: FieldRootContext is missing. Field parts must be placed within <Field.Root>.' : (0, _formatErrorMessage2.default)(28));
  }
  return context;
}