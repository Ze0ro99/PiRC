import { useRenderElement } from "../internals/useRenderElement.js";
/**
 * Renders a Base UI element.
 *
 * @public
 */
export function useRender(params) {
  return useRenderElement(params.defaultTagName ?? 'div', params, params);
}