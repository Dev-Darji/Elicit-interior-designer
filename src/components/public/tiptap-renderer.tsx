import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

interface TipTapRendererProps {
  content: any
}

export function TipTapRenderer({ content }: TipTapRendererProps) {
  // Parse content if it's a string, or use directly if it is an object
  const getParsedContent = () => {
    if (!content) return ''
    if (typeof content === 'string') {
      try {
        return JSON.parse(content)
      } catch {
        return content
      }
    }
    return content
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        HTMLAttributes: {
          class: 'text-accent underline hover:opacity-80 transition-opacity',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: getParsedContent(),
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose prose-editorial max-w-none focus:outline-none',
      },
    },
  })

  if (!editor) return null

  return <EditorContent editor={editor} />
}
