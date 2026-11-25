import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Validates URLs to only allow safe http and https protocols.
 * Prevents javascript:, data:, vbscript: or other arbitrary scheme execution.
 */
const isSafeUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim().toLowerCase()
  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('/')
  )
}

/**
 * SpendWise Dark Fintech Markdown Renderer
 * Powered by react-markdown and remark-gfm.
 * Secure, responsive, and styled to match the dark fintech design system.
 */
export const MarkdownRenderer = ({ content, className = '' }) => {
  if (!content) return null

  return (
    <div className={`markdown-content text-left text-xs sm:text-sm text-text-secondary leading-relaxed space-y-2.5 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children, ...props }) => (
            <h1
              {...props}
              className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight mt-4 mb-2 first:mt-0"
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              {...props}
              className="text-base sm:text-lg font-bold text-text-primary tracking-tight mt-3.5 mb-2 first:mt-0 flex items-center gap-2"
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              {...props}
              className="text-sm sm:text-base font-bold text-secondary tracking-tight mt-3 mb-1.5 first:mt-0"
            >
              {children}
            </h3>
          ),

          // Paragraphs
          p: ({ children, ...props }) => (
            <p {...props} className="my-1.5 leading-relaxed text-text-secondary">
              {children}
            </p>
          ),

          // Bold & Italic
          strong: ({ children, ...props }) => (
            <strong {...props} className="font-bold text-text-primary">
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em {...props} className="italic text-text-secondary">
              {children}
            </em>
          ),

          // Lists
          ul: ({ children, ...props }) => (
            <ul {...props} className="my-2 pl-5 list-disc space-y-1 text-text-secondary marker:text-secondary">
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol {...props} className="my-2 pl-5 list-decimal space-y-1 text-text-secondary marker:text-secondary font-medium">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li {...props} className="leading-relaxed pl-0.5">
              {children}
            </li>
          ),

          // Blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote
              {...props}
              className="my-3 p-3 sm:p-3.5 rounded-xl bg-primary/10 border-l-4 border-primary text-xs sm:text-sm text-text-secondary leading-relaxed"
            >
              {children}
            </blockquote>
          ),

          // Horizontal Divider
          hr: ({ ...props }) => <hr {...props} className="my-4 border-t border-border/80" />,

          // Tables (GFM)
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-border/80 bg-sidebar/50 shadow-sm">
              <table {...props} className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead {...props} className="bg-sidebar/90 border-b border-border text-text-muted text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody {...props} className="divide-y divide-border/60">
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr {...props} className="hover:bg-white/5 even:bg-white/[0.02] transition-colors">
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th {...props} className="py-2.5 px-3.5 font-semibold text-text-primary whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td {...props} className="py-2 px-3.5 text-text-secondary font-medium">
              {children}
            </td>
          ),

          // Code
          code: ({ inline, className: codeClass, children, ...props }) => {
            const isInline = inline || !String(children).includes('\n')
            if (isInline) {
              return (
                <code
                  {...props}
                  className="px-1.5 py-0.5 rounded bg-background border border-border text-secondary font-mono text-[11px] sm:text-xs"
                >
                  {children}
                </code>
              )
            }
            return (
              <pre className="overflow-x-auto p-3.5 my-2.5 rounded-xl bg-background border border-border font-mono text-xs text-text-primary leading-snug">
                <code {...props} className={codeClass}>
                  {children}
                </code>
              </pre>
            )
          },

          // Safe Links
          a: ({ href, children, ...props }) => {
            const safe = isSafeUrl(href)
            if (!safe) {
              return <span className="text-text-secondary">{children}</span>
            }
            return (
              <a
                {...props}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-text-primary underline underline-offset-2 transition-colors font-medium"
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer
