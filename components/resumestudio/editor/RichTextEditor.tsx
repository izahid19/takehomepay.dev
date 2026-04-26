import { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  List, ListOrdered, Link as LinkIcon, AlignCenter, AlignRight, AlignLeft, RemoveFormatting 
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import TextAlignExtension from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

const MenuBar = ({ editor }: { editor: any }) => {
  const toggleLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30 rounded-t-xl">
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-muted' : ''}><Bold className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-muted' : ''}><Italic className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={!editor.can().chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'bg-muted' : ''}><UnderlineIcon className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-muted' : ''}><Strikethrough className="w-4 h-4" /></Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-muted' : ''}><List className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-muted' : ''}><ListOrdered className="w-4 h-4" /></Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button variant="ghost" size="icon" onClick={toggleLink} className={editor.isActive('link') ? 'bg-muted' : ''}><LinkIcon className="w-4 h-4" /></Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}><AlignLeft className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}><AlignCenter className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}><AlignRight className="w-4 h-4" /></Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}><RemoveFormatting className="w-4 h-4" /></Button>
    </div>
  );
};

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = '180px' }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
      }),
      TextAlignExtension.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Type here...',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert text-foreground dark:text-white max-w-none p-4 focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-500 [&_a]:underline [&_strong]:text-white [&_em]:text-white [&_p]:text-white [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:text-muted-foreground/50 [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:h-0',
        style: `min-height: ${minHeight}; --tw-prose-body: white; --tw-prose-headings: white; --tw-prose-bold: white;`,
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      if (editor.getHTML() === '<p></p>' && !value) return;
    }
  }, [value, editor]);

  return (
    <div className="bg-background rounded-xl overflow-hidden border border-border focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
