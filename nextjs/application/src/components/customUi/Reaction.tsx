import { FC, memo, useRef, useState } from 'react';

import { BeatProps } from '@/types/beat';
import { EmojiType } from '@/types/emoji';

import EmojiIcon from '@/components/icon/EmojiIcon';
import Button from '@/components/ui/Button/Button';
import Emoji from '@/components/customUi/Emoji';
import Popup from '@/components/ui/Popup';

type Props = {
    reaction : BeatProps['reaction'] | null;
    account_id : number;
    onSelectEmoji : (emoji : EmojiType) => void;
    emoji : EmojiType | null;
}

const Reaction : FC<Props> = memo(({ reaction, account_id, emoji, onSelectEmoji }) => {

    const addEmojiRef = useRef<HTMLButtonElement>(null);

    const [isOpenEmoji, setIsOpenEmoji] = useState(false);

    const handleOpenEmoji = (e) => {
        e.stopPropagation();
        setIsOpenEmoji(true);
    }

    const handleCloseEmoji = () => {
        setIsOpenEmoji(false);
    }

    const handleSelectEmoji = (e, emoji: EmojiType) => {
        e.stopPropagation();
        onSelectEmoji(emoji);
        setIsOpenEmoji(false);
    }

    return (
        <div className="m-Reaction">
            {
                (emoji && reaction) && (
                    Object.entries(reaction).map(([reaction_id, reaction_user_ids]) => {
                        if(!reaction_user_ids.length) return null;
                        return (
                            <Button onClick={ e => handleSelectEmoji(e, emoji[reaction_id]) } key={ reaction_id }>
                                <div className={ `m-ReactionItem${ reaction_user_ids.includes(account_id) ? ` is-active` : `` }` }>
                                    <img className="m-ReactionItem_icon" src={`/public/emoji/${ emoji[reaction_id].id }.${ emoji[reaction_id].mimeType }`} alt={ emoji[reaction_id].name } />
                                    <div className="m-ReactionItem_count">{reaction_user_ids.length}</div>
                                </div>
                            </Button>
                        )
                    })
                )
            }
            <Button ref={ addEmojiRef } onClick={ handleOpenEmoji } type="button" color="transparent">
                <EmojiIcon className="m-ReactionButton_icon" />
            </Button>

            <Popup isOpen={ isOpenEmoji } target={ addEmojiRef.current } onClose={ handleCloseEmoji }>
                <Emoji onChange={ handleSelectEmoji }/>
            </Popup>
        </div>
    );
});

export default Reaction;