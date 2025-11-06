import { FC, useEffect, useState } from 'react';

import { API_PATH } from '@/data';
import useQueryApi from '@/hooks/useQueryApi';
import { EmojiType } from '@/types/emoji';

type Props = {
    onChange? : (e : any, emoji: EmojiType) => void;
}

const Emoji : FC<Props> = ({ onChange = null }) => {

    const emojiApi = useQueryApi<{[Key: string]: EmojiType}>({ queryKey: ['emoji'], url: `${API_PATH}/emoji` });

    const [folderInEmoji, setFolderInEmoji] = useState<{[Key:string] : EmojiType[]}>({});

	const handleFolderEmoji = (emojiList : {[Key: string]: EmojiType}) => {
		const _folderInEmoji: {[Key:string] : EmojiType[]} = {};
		Object.entries(emojiList).forEach( ([id, item]) => {
			if(item.folder){
				if(_folderInEmoji[item.folder]){
					_folderInEmoji[item.folder].push(item);
				}else{
					_folderInEmoji[item.folder] = [item];
				}
			}
		});
		setFolderInEmoji(_folderInEmoji);
	}

    useEffect(() => {
        if(emojiApi.data && emojiApi.status === 'success'){
            handleFolderEmoji(emojiApi.data);
        }
    },[emojiApi.data]);

    return (
        <div className="m-Emoji">
            <div className="m-EmojiHeader"></div>
            <div className="m-EmojiBody">
                { folderInEmoji && Object.entries(folderInEmoji).map(([folder, items], idx) => (
                    <div key={ idx } className="m-EmojiFolder">
                        <div className="m-EmojiFolder_name">{ folder }</div>
                        <div className="m-EmojiFolderItems">
                            { items.map( item => (
                                <button
                                    key={ item.id }
                                    type="button"
                                    onClick={ onChange ? e => onChange(e,item) : undefined }
                                    className="m-EmojiFolderItems_item"
                                >
                                    <img src={ `/public/emoji/${ item.id }.${ item.mimeType }` } alt={ item.name } />
                                </button>
                            )) }
                        </div>
                    </div>
                ))}

                {
                    !folderInEmoji && (
                        <div className="m-EmojiFolder">
                            <div className="m-EmojiFolder_name"></div>
                            <div className="m-EmojiFolderItems">
                                { [1,2,3,4,5,6,7,8,9].map( item => (
                                    <button
                                        key={ item }
                                        type="button"
                                        className="m-EmojiFolderItems_item is-skeleton"
                                    >
                                    </button>
                                )) }
                            </div>
                        </div>
                    )
                }
            </div>
            <div className="m-EmojiFooter">

            </div>
        </div>
    );
};

export default Emoji;