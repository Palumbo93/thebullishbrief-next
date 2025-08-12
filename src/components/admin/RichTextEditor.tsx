"use client";

import React, { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import CodeBlock from '@tiptap/extension-code-block';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { UrlInputModal } from './UrlInputModal';
import { ImageUploadModal } from './ImageUploadModal';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  Link as LinkIcon,
  Unlink,
  Palette,
  Highlighter,
  Table as TableIcon,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Minus
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  articleId?: string; // For image uploads
}

const MenuBar: React.FC<{ editor: any; articleId?: string }> = ({ editor, articleId }) => {
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');
  const [currentLinkText, setCurrentLinkText] = useState('');

  const setLink = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const previousUrl = editor.getAttributes('link').href;
    const previousText = editor.getText();
    
    setCurrentLinkUrl(previousUrl || '');
    setCurrentLinkText(previousText || '');
    setIsUrlModalOpen(true);
  }, [editor]);

  const handleUrlSubmit = useCallback((url: string, displayText: string) => {
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      if (displayText && displayText !== url) {
        editor.chain().focus().insertContent(displayText).run();
      }
    }
  }, [editor]);

  const addImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImageModalOpen(true);
  }, []);

  const handleImageSubmit = useCallback((imageUrl: string, altText: string) => {
    editor.chain().focus().setImage({ src: imageUrl, alt: altText }).run();
  }, [editor]);

  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-1)',
        padding: 'var(--space-3)',
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        border: '1px solid var(--color-border-primary)',
        borderBottom: 'none'
      }}>
      {/* Text Formatting */}
      <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: editor.isActive('bold') ? 'var(--color-primary)' : 'transparent',
            color: editor.isActive('bold') ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <Bold style={{ width: '16px', height: '16px' }} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: editor.isActive('italic') ? 'var(--color-primary)' : 'transparent',
            color: editor.isActive('italic') ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <Italic style={{ width: '16px', height: '16px' }} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: editor.isActive('underline') ? 'var(--color-primary)' : 'transparent',
            color: editor.isActive('underline') ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <UnderlineIcon style={{ width: '16px', height: '16px' }} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: editor.isActive('strike') ? 'var(--color-primary)' : 'transparent',
            color: editor.isActive('strike') ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <Strikethrough style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: 'var(--color-border-primary)' }} />

      {/* Headings */}
      <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: editor.isActive('heading', { level: 1 }) ? 'var(--color-primary)' : 'transparent',
            color: editor.isActive('heading', { level: 1 }) ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            fontWeight: 'bold',
            transition: 'all var(--transition-base)'
          }}
        >
          H1
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: editor.isActive('heading', { level: 2 }) ? 'var(--color-primary)' : 'transparent',
            color: editor.isActive('heading', { level: 2 }) ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            fontWeight: 'bold',
            transition: 'all var(--transition-base)'
          }}
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: editor.isActive('heading', { level: 3 }) ? 'var(--color-primary)' : 'transparent',
            color: editor.isActive('heading', { level: 3 }) ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            fontWeight: 'bold',
            transition: 'all var(--transition-base)'
          }}
        >
          H3
        </button>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: 'var(--color-border-primary)' }} />

      {/* Lists */}
      <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: editor.isActive('bulletList') ? 'var(--color-primary)' : 'transparent',
            color: editor.isActive('bulletList') ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <List style={{ width: '16px', height: '16px' }} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: editor.isActive('orderedList') ? 'var(--color-primary)' : 'transparent',
            color: editor.isActive('orderedList') ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <ListOrdered style={{ width: '16px', height: '16px' }} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: editor.isActive('blockquote') ? 'var(--color-primary)' : 'transparent',
            color: editor.isActive('blockquote') ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <Quote style={{ width: '16px', height: '16px' }} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: editor.isActive('codeBlock') ? 'var(--color-primary)' : 'transparent',
            color: editor.isActive('codeBlock') ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <Code style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: 'var(--color-border-primary)' }} />

      {/* Alignment */}
      <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: editor.isActive({ textAlign: 'left' }) ? 'var(--color-primary)' : 'transparent',
            color: editor.isActive({ textAlign: 'left' }) ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <AlignLeft style={{ width: '16px', height: '16px' }} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: editor.isActive({ textAlign: 'center' }) ? 'var(--color-primary)' : 'transparent',
            color: editor.isActive({ textAlign: 'center' }) ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <AlignCenter style={{ width: '16px', height: '16px' }} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: editor.isActive({ textAlign: 'right' }) ? 'var(--color-primary)' : 'transparent',
            color: editor.isActive({ textAlign: 'right' }) ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <AlignRight style={{ width: '16px', height: '16px' }} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: editor.isActive({ textAlign: 'justify' }) ? 'var(--color-primary)' : 'transparent',
            color: editor.isActive({ textAlign: 'justify' }) ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <AlignJustify style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: 'var(--color-border-primary)' }} />

      {/* Media & Advanced */}
      <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
        <button
          type="button"
          onClick={setLink}
          className={editor.isActive('link') ? 'is-active' : ''}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: editor.isActive('link') ? 'var(--color-primary)' : 'transparent',
            color: editor.isActive('link') ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <LinkIcon style={{ width: '16px', height: '16px' }} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-tertiary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <Unlink style={{ width: '16px', height: '16px' }} />
        </button>

        <button
          type="button"
          onClick={addImage}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <ImageIcon style={{ width: '16px', height: '16px' }} />
        </button>

        <button
          onClick={addTable}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <TableIcon style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: 'var(--color-border-primary)' }} />

      {/* History */}
      <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <Undo style={{ width: '16px', height: '16px' }} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
        >
          <Redo style={{ width: '16px', height: '16px' }} />
        </button>
              </div>
      </div>

      {/* Native Modals - Rendered via Portal outside form hierarchy */}
      {isUrlModalOpen && createPortal(
        <UrlInputModal
          isOpen={isUrlModalOpen}
          onClose={() => setIsUrlModalOpen(false)}
          onSubmit={handleUrlSubmit}
          initialUrl={currentLinkUrl}
          initialDisplayText={currentLinkText}
        />,
        document.body
      )}

      {isImageModalOpen && createPortal(
        <ImageUploadModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onSubmit={handleImageSubmit}
          articleId={articleId}
        />,
        document.body
      )}
    </>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing your article...',
  className = '',
  articleId
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable extensions that we're adding separately
        underline: false,
        codeBlock: false,
        link: false, // Disable to avoid duplicate with our custom Link extension
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight,
      CodeBlock,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      handlePaste: (view, event, slice) => {
        // Get the pasted content
        const html = event.clipboardData?.getData('text/html');
        
        if (html) {
          // Create a temporary div to parse the HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          
          // Remove all color-related attributes and styles
          const elements = tempDiv.querySelectorAll('*');
          elements.forEach(element => {
            // Remove color attributes
            element.removeAttribute('color');
            element.removeAttribute('bgcolor');
            
            // Remove color-related styles
            const style = element.getAttribute('style');
            if (style) {
              const newStyle = style
                .replace(/color\s*:\s*[^;]+;?/gi, '')
                .replace(/background-color\s*:\s*[^;]+;?/gi, '')
                .replace(/background\s*:\s*[^;]+;?/gi, '')
                .trim();
              
              if (newStyle) {
                element.setAttribute('style', newStyle);
              } else {
                element.removeAttribute('style');
              }
            }
          });
          
          // Insert the cleaned HTML using TipTap's insertContent
          const cleanedHtml = tempDiv.innerHTML;
          editor?.commands.insertContent(cleanedHtml as string);
          
          return true; // Prevent default paste behavior
        }
        
        return false; // Allow default paste behavior for plain text
      },
    },
    immediatelyRender: false,
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  return (
    <div className={className} style={{
      border: '1px solid var(--color-border-primary)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      background: 'var(--color-bg-primary)'
    }}>
      <MenuBar editor={editor} articleId={articleId} />
      <EditorContent 
        editor={editor} 
        style={{
          padding: 'var(--space-4)',
          minHeight: '400px',
          fontSize: 'var(--text-base)',
          lineHeight: '1.6',
          color: 'var(--color-text-primary)'
        }}
      />
    </div>
  );
}; 