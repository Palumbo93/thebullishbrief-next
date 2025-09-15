"use client";

import React, { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Image } from '../../lib/tiptap/image-extension';
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
import { Video } from '../../lib/tiptap/video-extension';
import { Embed } from '../../lib/tiptap/embed-extension';



import { UrlInputModal } from './UrlInputModal';
import { ImageUploadModal } from './ImageUploadModal';
import { VideoModal } from './VideoModal';
import { EmbedModal } from './EmbedModal';



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
  Table as TableIcon,
  Undo,
  Redo,
  Minus,
  Play,
  FileCode,
  Maximize,
  Minimize
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  articleId?: string; // Entity ID for image uploads
  entityType?: 'article' | 'brief'; // Determines storage structure for content images
}

const MenuBar: React.FC<{ editor: any; articleId?: string; entityType?: 'article' | 'brief'; isFullscreen: boolean; onToggleFullscreen: () => void }> = ({ editor, articleId, entityType = 'article', isFullscreen, onToggleFullscreen }) => {
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [editingEmbed, setEditingEmbed] = useState<{
    content: string;
    title?: string;
    width?: string;
    height?: string;
    type?: 'iframe' | 'script' | 'html';
    updateAttributes?: (attrs: any) => void;
  } | null>(null);
  const [editingImage, setEditingImage] = useState<{
    src: string;
    alt?: string;
    title?: string;
    figcaption?: string;
    width?: string;
    height?: string;
    updateAttributes?: (attrs: any) => void;
  } | null>(null);
  const [editingVideo, setEditingVideo] = useState<{
    src: string;
    title?: string;
    width?: string;
    height?: string;
    controls?: boolean;
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    poster?: string;
    figcaption?: string;
    updateAttributes?: (attrs: any) => void;
  } | null>(null);



  const [currentLinkUrl, setCurrentLinkUrl] = useState('');
  const [currentLinkText, setCurrentLinkText] = useState('');

  // Listen for embed edit events from the Node View
  useEffect(() => {
    const handleEditEmbed = (event: CustomEvent) => {
      const { content, title, width, height, type, updateAttributes } = event.detail;
      setEditingEmbed({
        content,
        title,
        width,
        height,
        type,
        updateAttributes
      });
      setIsEmbedModalOpen(true);
    };

    const handleEditImage = (event: CustomEvent) => {
      const { src, alt, title, figcaption, width, height, updateAttributes } = event.detail;
      setEditingImage({
        src,
        alt,
        title,
        figcaption,
        width,
        height,
        updateAttributes
      });
      setIsImageModalOpen(true);
    };

    const handleEditVideo = (event: CustomEvent) => {
      const { src, title, width, height, controls, autoplay, muted, loop, poster, figcaption, updateAttributes } = event.detail;
      setEditingVideo({
        src,
        title,
        width,
        height,
        controls,
        autoplay,
        muted,
        loop,
        poster,
        figcaption,
        updateAttributes
      });
      setIsVideoModalOpen(true);
    };

    window.addEventListener('editEmbed', handleEditEmbed as EventListener);
    window.addEventListener('editImage', handleEditImage as EventListener);
    window.addEventListener('editVideo', handleEditVideo as EventListener);
    
    return () => {
      window.removeEventListener('editEmbed', handleEditEmbed as EventListener);
      window.removeEventListener('editImage', handleEditImage as EventListener);
      window.removeEventListener('editVideo', handleEditVideo as EventListener);
    };
  }, []);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    
    setCurrentLinkUrl(previousUrl || '');
    setCurrentLinkText(selectedText || '');
    setIsUrlModalOpen(true);
  }, [editor]);

  const hasLink = useCallback(() => {
    if (!editor) return false;
    return !!editor.getAttributes('link').href;
  }, [editor]);

  const handleUrlSubmit = useCallback((url: string, displayText: string) => {
    console.log('🔗 handleUrlSubmit called:', { url, displayText });
    
    if (url === '') {
      console.log('🔗 Removing link');
      editor.chain().focus().unsetLink().run();
      return;
    }

    const { from, to } = editor.state.selection;
    console.log('🔗 Selection:', { from, to });
    
    if (from === to) {
      // No text selected - insert new text with link
      const textToInsert = displayText || url;
      console.log('🔗 Inserting new text with link:', textToInsert);
      editor.chain()
        .focus()
        .insertContent(textToInsert)
        .setTextSelection(from, from + textToInsert.length)
        .setLink({ href: url })
        .run();
    } else {
      // Text is selected - apply link to selection
      console.log('🔗 Applying link to selected text');
      editor.chain()
        .focus()
        .setLink({ href: url })
        .run();
    }
    
    console.log('🔗 Link operation completed');
  }, [editor]);

  const addImage = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    setEditingImage(null); // Clear any existing edit state
    setIsImageModalOpen(true);
  }, []);

  const handleImageSubmit = useCallback((imageUrl: string, altText: string, figcaption?: string, width?: string, height?: string) => {
    if (editingImage?.updateAttributes) {
      // Update existing image using the updateAttributes function from Node View
      editingImage.updateAttributes({
        src: imageUrl,
        alt: altText,
        figcaption: figcaption,
        width: width,
        height: height,
      });
    } else {
      // Create new image
      editor.chain().focus().setImage({ 
        src: imageUrl, 
        alt: altText,
        figcaption: figcaption,
        width: width,
        height: height,
      }).run();
    }
    setIsImageModalOpen(false);
    setEditingImage(null);
  }, [editor, editingImage]);

  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const addVideo = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    setEditingVideo(null); // Clear any existing edit state
    setIsVideoModalOpen(true);
  }, []);

  const handleVideoSubmit = useCallback((videoData: {
    src: string;
    title?: string;
    width?: string;
    height?: string;
    controls?: boolean;
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    poster?: string;
    figcaption?: string;
  }) => {
    if (editingVideo?.updateAttributes) {
      // Update existing video using the updateAttributes function from Node View
      editingVideo.updateAttributes(videoData);
    } else {
      // Create new video
      editor.chain().focus().setVideo(videoData).run();
    }
    setIsVideoModalOpen(false);
    setEditingVideo(null);
  }, [editor, editingVideo]);

  const addEmbed = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingEmbed(null); // Clear any existing edit state
    setIsEmbedModalOpen(true);
  }, []);

  const handleEmbedSubmit = useCallback((embedData: {
    content: string;
    title?: string;
    width?: string;
    height?: string;
    type?: 'iframe' | 'script' | 'html';
  }) => {
    if (editingEmbed?.updateAttributes) {
      // Update existing embed using the updateAttributes function from Node View
      editingEmbed.updateAttributes(embedData);
    } else {
      // Create new embed
      editor.chain().focus().setEmbed(embedData).run();
    }
    setIsEmbedModalOpen(false);
    setEditingEmbed(null);
  }, [editor, editingEmbed]);







  const addDivider = useCallback(() => {
    editor.chain().focus().insertContent('<hr>').run();
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
        borderBottom: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
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
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLink();
          }}
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
          title="Add Link"
        >
          <LinkIcon style={{ width: '16px', height: '16px' }} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!hasLink()}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'transparent',
            color: hasLink() ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            cursor: hasLink() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)',
            opacity: hasLink() ? 1 : 0.5
          }}
          title="Remove Link"
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
          type="button"
          onClick={addVideo}
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
          title="Add Video"
        >
          <Play style={{ width: '16px', height: '16px' }} />
        </button>







        <button
          type="button"
          onClick={addDivider}
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
          title="Add Divider"
        >
          <Minus style={{ width: '16px', height: '16px' }} />
        </button>

        <button
          type="button"
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

        <button
          type="button"
          onClick={addEmbed}
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
          title="Add Embed"
        >
          <FileCode style={{ width: '16px', height: '16px' }} />
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

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: 'var(--color-border-primary)' }} />

      {/* Fullscreen */}
      <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center', marginLeft: 'auto' }}>
        <button
          type="button"
          onClick={onToggleFullscreen}
          style={{
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: isFullscreen ? 'var(--color-primary)' : 'transparent',
            color: isFullscreen ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize style={{ width: '16px', height: '16px' }} />
          ) : (
            <Maximize style={{ width: '16px', height: '16px' }} />
          )}
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
          zIndex={isFullscreen ? 10000 : undefined}
        />,
        document.body
      )}

      {isImageModalOpen && createPortal(
        <ImageUploadModal
          isOpen={isImageModalOpen}
          onClose={() => {
            setIsImageModalOpen(false);
            setEditingImage(null);
          }}
          onSubmit={handleImageSubmit}
          articleId={articleId}
          entityType={entityType}
          zIndex={isFullscreen ? 10000 : undefined}
          initialImageUrl={editingImage?.src}
          initialAltText={editingImage?.alt}
          initialFigcaption={editingImage?.figcaption}
          initialWidth={editingImage?.width}
          initialHeight={editingImage?.height}
        />,
        document.body
      )}

      {isVideoModalOpen && createPortal(
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => {
            setIsVideoModalOpen(false);
            setEditingVideo(null);
          }}
          onSubmit={handleVideoSubmit}
          zIndex={isFullscreen ? 10000 : undefined}
          initialSrc={editingVideo?.src}
          initialTitle={editingVideo?.title}
          initialWidth={editingVideo?.width}
          initialHeight={editingVideo?.height}
          initialControls={editingVideo?.controls}
          initialAutoplay={editingVideo?.autoplay}
          initialMuted={editingVideo?.muted}
          initialLoop={editingVideo?.loop}
          initialPoster={editingVideo?.poster}
          initialFigcaption={editingVideo?.figcaption}
        />,
        document.body
      )}

      {isEmbedModalOpen && createPortal(
        <EmbedModal
          isOpen={isEmbedModalOpen}
          onClose={() => {
            setIsEmbedModalOpen(false);
            setEditingEmbed(null);
          }}
          onSubmit={handleEmbedSubmit}
          zIndex={isFullscreen ? 10000 : undefined}
          initialContent={editingEmbed?.content}
          initialTitle={editingEmbed?.title}
          initialWidth={editingEmbed?.width}
          initialHeight={editingEmbed?.height}
          initialType={editingEmbed?.type}
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
  articleId,
  entityType = 'article' // Default to article for backwards compatibility
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFullscreen]);

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
      Video,
      Embed,
    ],
    content,
    onUpdate: ({ editor }) => {
      try {
        const html = editor.getHTML();
        onChange(html);
      } catch (error) {
        console.error('🔄 RichTextEditor: Error getting HTML:', error);
      }
    },
    editorProps: {
      transformPastedHTML: (html: string) => {
        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Convert H1 tags to H2 tags
        const h1Elements = tempDiv.querySelectorAll('h1');
        h1Elements.forEach(h1 => {
          const h2 = document.createElement('h2');
          // Copy all attributes from h1 to h2
          Array.from(h1.attributes).forEach(attr => {
            h2.setAttribute(attr.name, attr.value);
          });
          // Copy the content
          h2.innerHTML = h1.innerHTML;
          // Replace h1 with h2
          h1.parentNode?.replaceChild(h2, h1);
        });
        
        // Remove only color-related attributes and styles, preserving other formatting
        const elements = tempDiv.querySelectorAll('*');
        elements.forEach(element => {
          // Remove color attributes
          element.removeAttribute('color');
          element.removeAttribute('bgcolor');
          
          // Remove only color-related styles, preserving other styles
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
        
        // Return the cleaned HTML for TipTap to process normally
        return tempDiv.innerHTML;
      },
    },
    immediatelyRender: false,
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && editor.commands && content !== editor.getHTML()) {
      try {
        editor.commands.setContent(content);
      } catch (error) {
        console.error('🔄 RichTextEditor: Error setting content:', error);
      }
    }
  }, [editor, content]);

  // Process Twitter widgets when content changes
  useEffect(() => {
    if (editor && typeof window !== 'undefined' && (window as any).twttr) {
      const timer = setTimeout(() => {
        (window as any).twttr.widgets.load();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [editor, content]);


  // Process Twitter widgets when editor updates
  useEffect(() => {
    if (editor && typeof window !== 'undefined' && (window as any).twttr) {
      const handleUpdate = () => {
        setTimeout(() => {
          (window as any).twttr.widgets.load();
        }, 100);
      };
      
      editor.on('update', handleUpdate);
      return () => {
        editor.off('update', handleUpdate);
      };
    }
  }, [editor]);

  // Force Node View re-render when entering/exiting fullscreen
  useEffect(() => {
    if (editor) {
      // Small delay to let the DOM settle after fullscreen toggle
      const timer = setTimeout(() => {
        // Force all Node Views to re-render
        editor.view.updateState(editor.view.state);
        
        // Also trigger a manual dispatch to ensure everything is updated
        editor.view.dispatch(editor.view.state.tr);
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [isFullscreen, editor]);

  const editorComponent = (
    <div className={className} style={{
      border: '1px solid var(--color-border-primary)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      background: 'var(--color-bg-primary)',
      height: isFullscreen ? '100vh' : '600px',
      display: 'flex',
      flexDirection: 'column',
      ...(isFullscreen && {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        borderRadius: 0,
        width: '100vw',
        height: '100vh'
      })
    }}>
      <MenuBar 
        editor={editor} 
        articleId={articleId} 
        entityType={entityType}
        isFullscreen={isFullscreen} 
        onToggleFullscreen={toggleFullscreen} 
      />
      <div style={{
        height: '0.5px',
        background: 'var(--color-border-primary)',
        width: '100%'
      }} />
      <div style={{
        flex: 1,
        overflow: 'auto',
        position: 'relative'
      }}>
        <EditorContent 
          editor={editor} 
          style={{
            padding: isFullscreen ? 'var(--space-4) var(--content-padding)' : 'var(--space-4)',
            minHeight: isFullscreen ? 'calc(100vh - 60px)' : '400px',
            fontSize: 'var(--text-base)',
            lineHeight: '1.6',
            color: 'var(--color-text-primary)',
            maxWidth: isFullscreen ? 'var(--max-width)' : 'none',
            margin: isFullscreen ? '0 auto' : '0'
          }}
        />
      </div>
    </div>
  );

  // Don't use portal for fullscreen to avoid Node View issues
  // Instead, use CSS positioning
  return editorComponent;
}; 