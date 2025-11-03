/**
 * Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022-2025)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Centralized DOMPurify hooks for consistent behavior across components.
 */
import dompurify from "dompurify"

// preserve target=_blank and set security attributes (see https://github.com/cure53/DOMPurify/issues/317)
const TEMPORARY_ATTRIBUTE = "data-temp-href-target"

dompurify.addHook("beforeSanitizeAttributes", function (node): void {
  if (
    node instanceof HTMLElement &&
    node.hasAttribute("target") &&
    node.getAttribute("target") === "_blank"
  ) {
    node.setAttribute(TEMPORARY_ATTRIBUTE, "_blank")
  }
})

dompurify.addHook("afterSanitizeAttributes", function (node): void {
  if (node instanceof HTMLElement && node.hasAttribute(TEMPORARY_ATTRIBUTE)) {
    node.setAttribute("target", "_blank")
    // according to https://html.spec.whatwg.org/multipage/links.html#link-type-noopener,
    // noreferrer implies noopener, but we set it just to be sure in case some browsers
    // do not implement the spec accordingly.
    node.setAttribute("rel", "noopener noreferrer")
    node.removeAttribute(TEMPORARY_ATTRIBUTE)
  }
})

export default dompurify
