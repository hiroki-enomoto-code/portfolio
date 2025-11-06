"use client";
import React, { useState, memo, useRef } from 'react';
import { v4 as uuid } from "uuid";

import { FileProps } from '@/components/customUi/FileUpload';
import { BeatProps } from '@/types/beat';

import Modal from '@/components/ui/Modal';
import TextField from '@/components/ui/TextField/TextField';
import Button from '@/components/ui/Button/Button';
import FileUpload from '@/components/customUi/FileUpload';
import Emoji from '@/components/customUi/Emoji';
import Popup from '@/components/ui/Popup';

import EmojiIcon from '@/components/icon/EmojiIcon';
import QuestionIcon from '@/components/icon/QuestionIcon';
import ImageIcon from '@/components/icon/ImageIcon';
import CrossIcon from '@/components/icon/CrossIcon';
import { EmojiType } from '@/types/emoji';
import { useData } from '@/context/DataContext';

type LinkMenu = {
    visible: boolean;
    x: number;
    y: number;
    link: any | null;
    range?: Range | null;
};

type Props = {
    handlePost : (content: string, attachments: FileProps[], replyId? : number | null) => void;
    replyItem?: BeatProps | null;
}

const BeatEditor: React.FC<Props> = memo(({ handlePost, replyItem = null }) => {

    const { users, account } = useData();

    const linkMenuHrefRef = React.useRef<HTMLInputElement>(null);
    const linkMenuTextRef = React.useRef<HTMLInputElement>(null);

    const editorRef = useRef<HTMLDivElement>(null);

    const [linkMenu, setLinkMenu] = useState<LinkMenu>({ visible: false, x: 0, y: 0, link: null});
    const [openEmoji, setOpenEmoji] = useState<{ visible: boolean; target:any}>({ visible: false, target:null });
    const [attachments, setAttachments] = useState<FileProps[]>([]);
    const [isLoad, setIsLoad] = useState(false);

    const handleFileDelete = (idx : number) => {
        const newFiles = attachments.filter((_, index) => index !== idx);
        setAttachments(newFiles);
    }

    const handleLinkChange = () => {
        const text = linkMenuTextRef.current?.value;
        const link = linkMenuHrefRef.current?.value;
        
        if(!text) return;

        if(linkMenu.link){
            
            const linkId = linkMenu.link.id;

            if(!link) {
                const target = document.getElementById(`${linkId}`);
                const parent = target!.parentNode;
                parent!.replaceChild(document.createTextNode(text), target as Node);
            }

            linkMenu.link.href = link;
            linkMenu.link.textContent = text;
        }else if(linkMenu.range && link){
            const addLink = document.createElement('a');
            addLink.href = link!;
            addLink.id = `link-${ uuid() }`;
            addLink.textContent = text!;
            addLink.target = '_blank';
            linkMenu.range.surroundContents(addLink);
        }

        setLinkMenu({ visible: false, x: 0, y: 0, link: null});
    }

    const handleLinkDelete = () => {
        const text = linkMenuTextRef.current?.value;
        const linkId = linkMenu.link.id;
        if(text && linkId) {
            const target = document.getElementById(`${linkId}`);
            const parent = target?.parentNode;
            parent?.replaceChild(document.createTextNode(text), target as Node);
        }
        setLinkMenu({ visible: false, x: 0, y: 0, link: null});
    }

    const handleContextMenu = (e) => {
        let target = e.target;
        if (target.tagName === 'A') {
            e.preventDefault();

            if(!linkMenu.visible){
                setLinkMenu({
                    visible: true,
                    x: e.pageX,
                    y: e.pageY,
                    link: target,
                });
            }
        }else{
            const selection = window.getSelection();
            const hasSelection = !selection!.isCollapsed;
            if(hasSelection){
                e.preventDefault();
                setLinkMenu({
                    visible: true,
                    x: e.pageX,
                    y: e.pageY,
                    link: null,
                    range : selection!.getRangeAt(0),
                });
            }
        }
    };

    const handleOpenEmoji = e => {
        e.preventDefault();
        
        setOpenEmoji({
            visible: true,
            target: e.currentTarget,
        });
    }

    const handleSelectEmoji = (_, emoji: EmojiType) => {
        const selection = window.getSelection();

        const emojiNode = document.createElement('img');
        emojiNode.src = `/public/emoji/${ emoji.id }.${ emoji.mimeType }`;
        emojiNode.className = 'emoji';

        if(!editorRef.current?.contains(selection?.anchorNode as Node)){
            editorRef.current!.appendChild(emojiNode);
            const range = document.createRange();
            range.setStartAfter(emojiNode);
            range.setEndAfter(emojiNode);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }else if(selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.insertNode(emojiNode);
            range.setStartAfter(emojiNode);
            range.setEndAfter(emojiNode);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        setOpenEmoji({ ...openEmoji, visible: false });
    }

    const handlePaste = (e) => {
        e.preventDefault();
        const clipboardData = e.clipboardData || window.Clipboard;
        const pastedText = clipboardData.getData('text');

        if (pastedText && /^https?:\/\//.test(pastedText)) {
            const link = document.createElement('a');
            link.href = pastedText;
            link.id = `link-${ uuid() }`;
            link.textContent = pastedText;
            link.target = '_blank';

            const selection = window.getSelection();
            if (selection!.rangeCount > 0) {
                const range = selection!.getRangeAt(0);
                range.deleteContents();
                range.insertNode(link);
                range.setStartAfter(link);
                range.setEndAfter(link);
                selection!.removeAllRanges();
                selection!.addRange(range);
            }
        } else {
            document.execCommand('insertText', false, pastedText);
        }
    };

    const Post = async () => {
        let content = editorRef.current?.innerHTML;
        if(!content) return;

        content = content?.replace(/<div><br><\/div>/g, '<br>');

        setIsLoad(true);
        handlePost(content, attachments, replyItem ? replyItem.id : null );
    }

    return (
        <div className="m-BeatEditor">
            {
                replyItem && (
                    <div className="m-BeatEditorParent">
                        <div className="m-BeatEditorParentHead">
                            <img className="m-BeatEditorParentHead_icon" src={ users[replyItem.user_id]?.avatar ? `/public/avatar/${users[replyItem.user_id]?.avatar }` : '/images/i_oji_default.png' } alt="" />
                            <div className="m-BeatEditorParentHead_name">{ account?.nickname }</div>
                        </div>
                        <div className="m-BeatEditorParent_content" dangerouslySetInnerHTML={{ __html: replyItem.content }} />
                    </div>
                )
            }
            <div className="m-BeatEditorPost">
                <div className="m-BeatEditorPostHead">
                    <img src={ account?.avatar ? `/public/avatar/${ account!.avatar }` : '/images/i_oji_default.png' } alt="" />
                    <p>{ account!.nickname }</p>
                </div>
                <div className="m-BeatEditorPostBox">
                    <div
                        ref={editorRef}
                        className="m-BeatEditorPostEditor"
                        contentEditable="true"
                        onPaste={ handlePaste }
                        onContextMenu={ handleContextMenu }
                        suppressContentEditableWarning={ true }
                        data-placeholder='何かを入力してください'
                    />
                    {
                        attachments.length > 0 && (
                            <div className="m-BeatEditorPostAttachment">
                                { attachments.map((file, index) => (
                                    <div key={ index } className="m-BeatEditorPostAttachment_item">
                                        <img src={ file.preview! } alt="" />
                                        <button onClick={ () => handleFileDelete(index) }><CrossIcon/></button>
                                    </div>
                                )) }
                            </div>
                        )
                    }
                </div>
                <div className="m-BeatEditorFooter">
                    <div className="m-BeatEditorToolbar">
                        <div className="m-BeatEditorToolbar_item">
                            <Button color="transparent" className="m-BeatEditorToolbar_item_button">
                                <FileUpload
                                    onChange={ files => setAttachments(files) }
                                    maxLength={ 3 }
                                    multiple
                                >
                                    <div className="upload">
                                        <ImageIcon className="icon"/>
                                    </div>
                                </FileUpload>
                            </Button>
                        </div>
                        <div className="m-BeatEditorToolbar_item">
                            <Button color="transparent" className="m-BeatEditorToolbar_item_button">
                                <QuestionIcon className="icon" />
                            </Button>
                        </div>
                        <div className="m-BeatEditorToolbar_item">
                            <Button onClick={ handleOpenEmoji } color="transparent" className="m-BeatEditorToolbar_item_button">
                                <EmojiIcon className="icon" />
                            </Button>
                        </div>
                    </div>
                    <div className="m-BeatEditorFooterButton">
                        <Button
                            onClick={ Post }
                            color="default"
                            border={ true }
                            loading={ isLoad }
                        >POST</Button>
                    </div>
                </div>
            </div>

            <Popup isOpen={ openEmoji.visible } target={ openEmoji.target } onClose={ () => setOpenEmoji({ ...openEmoji, visible: false }) }>
                <Emoji onChange={ handleSelectEmoji }/>
            </Popup>

            <Modal
                isOpen={ linkMenu.visible }
                onOpen={ () => setLinkMenu({ ...linkMenu, visible: false }) }
            >
                <div className="m-BeatEditorLinkMenu">
                    <div className="m-BeatEditorLinkMenu_input">
                        {
                            linkMenu.range ? (
                                <>
                                    <TextField ref={ linkMenuTextRef } label="テキスト" defaultValue={ linkMenu.range.commonAncestorContainer.textContent as string } />
                                    <TextField ref={ linkMenuHrefRef } label="リンク" defaultValue={ linkMenu.range.commonAncestorContainer.textContent as string } />
                                </>
                            ) : (
                                <>
                                    <TextField ref={ linkMenuTextRef } label="テキスト" defaultValue={ linkMenu.link?.textContent as string } />
                                    <TextField ref={ linkMenuHrefRef } label="リンク" defaultValue={ linkMenu.link?.href } />
                                </>
                            )
                        }
                    </div>
                    <div className="m-BeatEditorLinkMenu_button">
                        <Button
                            onClick={ handleLinkChange }
                            color="primary"
                        >変更</Button>
                        { linkMenu.link && <Button color="dark" onClick={ handleLinkDelete }>削除</Button> }
                    </div>
                </div>
            </Modal>
        </div>
    );
});

export default BeatEditor;