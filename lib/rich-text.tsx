import { Fragment, type ReactNode } from "react"

export function renderRichText(text: string): ReactNode[] {
  const lines = text.split("\n")
  const nodes: ReactNode[] = []

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      nodes.push(<br key={`br-${lineIndex}`} />)
    }

    const parts = line.split(/(\*\*[^*]+\*\*)/g).filter((part) => part !== "")

    parts.forEach((part, partIndex) => {
      const isBold = part.startsWith("**") && part.endsWith("**")

      if (isBold) {
        nodes.push(
          <strong key={`b-${lineIndex}-${partIndex}`} className="text-gray-900 font-bold">
            {part.slice(2, -2)}
          </strong>
        )
      } else {
        nodes.push(<Fragment key={`t-${lineIndex}-${partIndex}`}>{part}</Fragment>)
      }
    })
  })

  return nodes
}
