import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { StarterKit } from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import {
    Bold, Italic, Underline as UnderlineIcon,
    Strikethrough, Heading1, Heading2, List,
    Link as LinkIcon, Type, RotateCcw
} from 'lucide-react';
import './EditableText.css';

const EditableText = ({
    value,
    componentId,
    field,
    tag: Tag = 'span',
    className = '',
    placeholder = ''
}) => {
    const isEditMode = new URLSearchParams(window.location.search).get('preview') === 'true';

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // If it's a small tag like span/b, we might want to disable blocks?
                // For now, let's keep it flexible.
            }),
            TextStyle,
            Color,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'editor-link',
                },
            }),
        ],
        content: value || placeholder,
        editable: isEditMode,
        onBlur: ({ editor }) => {
            const newValue = editor.getHTML();
            if (newValue !== value) {
                window.parent.postMessage({
                    type: 'CONTENT_UPDATE',
                    componentId,
                    field,
                    value: newValue
                }, window.location.origin);
            }
        },
    });

    // Update editor content if value props changes externally
    useEffect(() => {
        if (editor && value !== editor.getHTML() && !editor.isFocused) {
            editor.commands.setContent(value || placeholder);
        }
    }, [value, editor, placeholder]);

    if (!isEditMode) {
        return <Tag className={className} dangerouslySetInnerHTML={{ __html: value || placeholder }} />;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className={`editable-text-wrapper ${className}`}>
            {editor && (
                <BubbleMenu className="bubble-menu" tippyOptions={{ duration: 100 }} editor={editor}>
                    <div className="bubble-menu-group">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={editor.isActive('bold') ? 'is-active' : ''}
                        >
                            <Bold size={14} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={editor.isActive('italic') ? 'is-active' : ''}
                        >
                            <Italic size={14} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={editor.isActive('underline') ? 'is-active' : ''}
                        >
                            <UnderlineIcon size={14} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            className={editor.isActive('strike') ? 'is-active' : ''}
                        >
                            <Strikethrough size={14} />
                        </button>
                    </div>
                    <div className="bubble-menu-divider"></div>
                    <div className="bubble-menu-group">
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
                        >
                            <Heading1 size={14} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                        >
                            <Heading2 size={14} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={editor.isActive('bulletList') ? 'is-active' : ''}
                        >
                            <List size={14} />
                        </button>
                    </div>
                    <div className="bubble-menu-divider"></div>
                    <div className="bubble-menu-group">
                        <button onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''}>
                            <LinkIcon size={14} />
                        </button>
                        <div className="color-picker-wrapper">
                            <input
                                type="color"
                                onInput={e => editor.chain().focus().setColor(e.target.value).run()}
                                value={editor.getAttributes('textStyle').color || '#000000'}
                            />
                            <Type size={14} className="color-icon" />
                        </div>
                        <button onClick={() => editor.chain().focus().unsetColor().run()}>
                            <RotateCcw size={12} />
                        </button>
                    </div>
                </BubbleMenu>
            )}
            <EditorContent
                editor={editor}
                className="editable-text"
            />
        </div>
    );
};

export default EditableText;
