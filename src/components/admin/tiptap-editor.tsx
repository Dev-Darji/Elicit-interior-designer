import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Quote, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon 
} from 'lucide-react'

interface TipTapEditorProps {
  value?: any
  onChange: (json: any) => void
  label?: string
}

export function TipTapEditor({ value, onChange, label }: TipTapEditorProps) {
  // Parse content if it's a JSON string or return it if it's already an object/string
  const getInitialContent = () => {
    if (!value) return ''
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }
    return value
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent underline',
        },
      }),
    ],
    content: getInitialContent(),
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[250px] px-4 py-3 text-sm leading-relaxed text-foreground',
      },
    },
  })

  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('Enter link URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className="w-full">
      {label && <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</label>}
      <div className="border border-border bg-background rounded-sm overflow-hidden focus-within:border-accent transition">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2 bg-muted/40">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-muted transition ${editor.isActive('bold') ? 'bg-muted text-foreground font-bold' : 'text-muted-foreground'}`}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-muted transition ${editor.isActive('italic') ? 'bg-muted text-foreground italic' : 'text-muted-foreground'}`}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded hover:bg-muted transition ${editor.isActive('heading', { level: 1 }) ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded hover:bg-muted transition ${editor.isActive('heading', { level: 2 }) ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-muted transition ${editor.isActive('bulletList') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded hover:bg-muted transition ${editor.isActive('orderedList') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded hover:bg-muted transition ${editor.isActive('blockquote') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            type="button"
            onClick={addLink}
            className={`p-1.5 rounded hover:bg-muted transition ${editor.isActive('link') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            title="Insert Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={addImage}
            className="p-1.5 rounded hover:bg-muted transition text-muted-foreground"
            title="Insert Image URL"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Editor Body */}
        <EditorContent editor={editor} className="bg-background prose-container" />
      </div>
    </div>
  )
}
