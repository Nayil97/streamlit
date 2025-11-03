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

import { FC, memo, useEffect, useMemo, useRef } from "react"

import dompurify from "./dompurifyHooks"
import HtmlContainer from "./HtmlContainer"

export interface HtmlWithJsProps {
  body: string
}

const HtmlWithJs: FC<HtmlWithJsProps> = ({ body }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const sanitizedBody = useMemo(() => {
    return dompurify.sanitize(body, {
      // Keep to HTML profile
      USE_PROFILES: { html: true },
      // Retain script/style tags for execution & styling
      ADD_TAGS: ["script", "style"],
      // Ensure relevant script attributes are preserved
      ADD_ATTR: [
        "src",
        "type",
        "async",
        "defer",
        "nonce",
        "crossorigin",
        "referrerpolicy",
        "integrity",
      ],
      // Prevent browser oddities by forcing body context
      FORCE_BODY: true,
    })
  }, [body])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    // Inject sanitized HTML (links get rel via DOMPurify hooks).
    container.innerHTML = sanitizedBody

    // Execute scripts by cloning them so the browser runs them.
    const scripts = Array.from(
      container.querySelectorAll<HTMLScriptElement>("script")
    )

    scripts.forEach(oldScript => {
      const newScript = document.createElement("script")

      // Copy attributes (type, src, async, defer, nonce, etc.).
      for (const { name, value } of Array.from(oldScript.attributes)) {
        try {
          newScript.setAttribute(name, value)
        } catch {
          // Best-effort - ignore invalid attributes.
        }
      }

      if (!oldScript.src) {
        newScript.textContent = oldScript.textContent
      }

      // Replace to trigger JS execution.
      oldScript.parentNode?.replaceChild(newScript, oldScript)
    })

    // Cleanup on dependency change.
    return () => {
      container.innerHTML = ""
    }
  }, [sanitizedBody])

  return <HtmlContainer ref={containerRef} />
}

export default memo(HtmlWithJs)
