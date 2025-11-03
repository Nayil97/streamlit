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

import { memo, ReactElement, useMemo } from "react"

import dompurify from "./dompurifyHooks"
import HtmlContainer from "./HtmlContainer"

export interface SanitizedHtmlProps {
  body: string
}
const sanitizeString = (html: string): string => {
  const sanitizationOptions = {
    // Default to permit HTML, SVG and MathML, this limits to HTML only
    USE_PROFILES: { html: true },
    // glue elements like style, script or others to document.body and prevent unintuitive browser behavior in several edge-cases
    FORCE_BODY: true,
  }
  return dompurify.sanitize(html, sanitizationOptions)
}

function SanitizedHtml({
  body,
}: Readonly<SanitizedHtmlProps>): ReactElement | null {
  const sanitizedHtml = useMemo(() => sanitizeString(body), [body])

  if (!sanitizedHtml) {
    return null
  }

  return (
    <HtmlContainer
      // Note: This is an expected usage of dangerouslySetInnerHTML.
      // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}

export default memo(SanitizedHtml)
