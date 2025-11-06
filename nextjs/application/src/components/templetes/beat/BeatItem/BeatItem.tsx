import { FC, memo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { API_PATH } from '@/data';
import { BeatProps, BeatListProps } from '@/types/beat';
import { EmojiType } from '@/types/emoji';
import { useData } from "@/context/DataContext";
import useQueryApi from '@/hooks/useQueryApi';
import { FileProps } from '@/components/customUi/FileUpload';

import Button from '@/components/ui/Button/Button';
import Avatar from '@/components/ui/Avatar/Avatar';
import ReplyIcon from '@/components/icon/ReplyIcon';
import Reaction from '@/components/customUi/Reaction';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import MoreHorizIcon from '@/components/icon/MoreHorizIcon';
import DeleteIcon from '@/components/icon/DeleteIcon';
import Modal from '@/components/ui/Modal';
import BeatEditor from '@/components/customUi/BeatEditor';
import Popup from '@/components/ui/Popup';

type Props = {
	item : BeatProps;
	emoji : EmojiType | null;
	isReply? : boolean;
}

interface BeatItemComponent extends FC<Props> {
  Skeleton: FC;
}

const _BeatItem: FC<Props> = memo(({ item : _item, emoji, isReply = false }) => {
	const router = useRouter();
	const { account, users } = useData();

	const beatApi = useQueryApi<BeatListProps>({ queryKey: ['beat'], url: ``, enabled: false });
	const beatReplyApi = useQueryApi<BeatListProps>({ queryKey: ['beat-reply'], url: ``, enabled: false });

	const configRef = useRef<HTMLButtonElement>(null);

	const [item, setItem] = useState<BeatProps>(_item);
	const [isOpenEditor, setIsOpenEditor] = useState(false);
	const [isOpenConfig, setIsOpenConfig] = useState(false);
	const [isDeleteModal, setIsDeleteModal] = useState(false);

	const handleOpenEditor = e => {
		e.stopPropagation();
		setIsOpenEditor(true);
	}

	const handleOpenDeleteModal = () => {
		setIsOpenConfig(false);
		setIsDeleteModal(true);
	}

	const handleDeleteItem = async() => {
		await axios.delete<BeatProps>(`${API_PATH}/beat/${ item.id }`)
			.then((res) => {
				if (res.data && res.status === 200) {

					if(isReply){
						if(beatApi.data){
							const beatIndex = beatApi.data.data.findIndex((beat) => beat.id === item.reply);
							if(beatIndex !== -1){
								beatApi.setQueryData((prev : BeatListProps) => {
									const newBeat : BeatListProps = { ...prev };
									newBeat.data[beatIndex].comments -= 1;
									return newBeat;
								});
							}
						}
	
						if(beatReplyApi.data){
							const beatParentIndex = beatReplyApi.data.data.findIndex((beat) => beat.id === item.reply);
							const beatIndex = beatReplyApi.data.data.findIndex((beat) => beat.id === item.id);
							if(beatIndex !== -1){
								beatReplyApi.setQueryData((prev : BeatListProps) => {
									const newBeat : BeatListProps = { ...prev };
									newBeat.data[beatParentIndex].comments -= 1;
									newBeat.data.splice(beatIndex, 1);
									return newBeat;
								});
							}
						}
					}else{
						if(beatApi.data){
							const beatIndex = beatApi.data.data.findIndex((beat) => beat.id === item.id);
							if(beatIndex !== -1){
								beatApi.setQueryData((prev : BeatListProps) => {
									const newBeat : BeatListProps = { ...prev };
									newBeat.data.splice(beatIndex, 1);
									return newBeat;
								});
							}
						}
					}
					setIsDeleteModal(false);
				}
			})
			.catch((error) => {
				console.log(error);
			})
			.finally(() => { });
	}

	const handleReply = async( content: string, attachments: FileProps[], replyId?: number | null) => {

		if(!replyId) return null;

        const formData = new FormData();
        attachments.forEach((file) => {
            if (file.file) {
                formData.append(`file[]`, file.file);
            }
        });
        formData.append('content', content);
		formData.append('reply', String(replyId));

        await axios.post<BeatProps>(`${API_PATH}/beat`, formData)
            .then((res) => {
                if (res.data && res.status === 200) {

					if(beatApi.data){
						const beatIndex = beatApi.data.data.findIndex((beat) => beat.id === res.data.reply);
						if(beatIndex !== -1){
							beatApi.setQueryData((prev : BeatListProps) => {
								const newBeat : BeatListProps = { ...prev };
								newBeat.data[beatIndex].comments += 1;
								return newBeat;
							});
						}
					}

					if(beatReplyApi.data){
						const beatIndex = beatReplyApi.data.data.findIndex((beat) => beat.id === res.data.reply);
						beatReplyApi.setQueryData((prev : BeatListProps) => {
							let newBeat : BeatListProps = { ...prev };
							if(beatIndex !== -1){
								newBeat.data[beatIndex].comments += 1;
							}
							newBeat.data.splice(1, 0, res.data);
							return newBeat;
						});
					}

                    setIsOpenEditor(false);
                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => { });
	}
	
	const handleChangeReaction = async (emoji:EmojiType) => {

		const beforeItem = item;

        if(item.reaction){
            if(item.reaction[emoji.id]){
                if(item.reaction[emoji.id].includes(account!.id)){
                    item.reaction[emoji.id] = item.reaction[emoji.id].filter((id) => id !== account!.id);
                }else{
                    item.reaction[emoji.id].push(account!.id);
                }
            }else{
                item.reaction[emoji.id] = [account!.id];
            }
        }else{
            item.reaction = {};
            item.reaction[emoji.id] = [account!.id];
        }

        setItem(item);

        await axios.post<BeatProps>(`${API_PATH}/beat/reaction/${ item.id }`, { emoji_id: emoji.id })
            .then((res) => {
                if (res.data && res.status === 200) {
                    if(beatApi.data){
						const beatIndex = beatApi.data.data.findIndex((beat) => beat.id === item.id);
						if(beatIndex !== -1){
							beatApi.setQueryData((prev:BeatListProps) => {
								const newBeat = {...prev};
								newBeat.data[beatIndex] = res.data;
								return newBeat;
							});
						}
					}

					if(beatReplyApi.data){
						const beatIndex = beatReplyApi.data.data.findIndex((beat) => beat.id === item.id);
						if(beatIndex !== -1){
							beatReplyApi.setQueryData((prev:BeatListProps) => {
								const newBeat = {...prev};
								newBeat.data[beatIndex] = res.data;
								return newBeat;
							});
						}
					}
                }
            })
            .catch((error) => {
                console.log(error);
				setItem(beforeItem);
            })
            .finally(() => { });
    }

	return (
		<>
			<div className={ `m-BeatItem${ isReply ? ' is-reply' : '' }` } onClick={ () => !isReply ? router.push(`/beat/${ item.id }`) : undefined }>
				<div className="m-BeatItem_inner">
					<div className="m-BeatItem_avatar">
						<Avatar size="m" rounded="m" src={ users[item.user_id] && users[item.user_id].avatar ? `/public/avatar/${ users[item.user_id].avatar }` : `/images/i_oji_default.png` } />
					</div>
					<div className="m-BeatItem_top">
						<div className="m-BeatItemHead">
							<p className="m-BeatItemHead_name">{ users[item.user_id] ? users[item.user_id].nickname : '---' }</p>
							<div className="m-BeatItemHead_right">
								<p className="m-BeatItemHead_date">{new Date(item.created_at).toLocaleDateString()}</p>
								<Button
									ref={ configRef }
									color="transparent"
									rounded="circle"
									onClick={ e => {
										e.stopPropagation();
										setIsOpenConfig(true);
									}}
								><MoreHorizIcon/></Button>
							</div>
						</div>
					</div>
					<div className="m-BeatItem_detail">
						<div className="m-BeatItemText">
							<div className="content" dangerouslySetInnerHTML={{ __html: item.content }} />
							{
								item.attachment.length > 0 && (
									<div className={`images is-${item.attachment.length}`}>
										{
											item.attachment.map((file, index) => (
												<img
													key={index}
													src={`/public/beat/${item.id}/${file}`}
													onError={e => e.currentTarget.src = "/images/quiz/quiz_default_thumbnail.jpg"}
												/>
											))
										}
									</div>
								)
							}
						</div>

						<div className="m-BeatItemFoot">
							{
								(!isReply || !item.reply) && (
									<Button onClick={ handleOpenEditor } type="button" color="transparent">
										<ReplyIcon className="m-BeatItemFoot_item_icon" />
										<p className="m-BeatItemFoot_item_count">{item.comments}</p>
									</Button>
								)
							}

							<div className="m-BeatItemReaction">
								<Reaction
									reaction={item.reaction}
									account_id={ 1 }
									onSelectEmoji={ handleChangeReaction }
									emoji={ emoji }
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<Modal isOpen={isOpenEditor} onOpen={ () => setIsOpenEditor(false) }>
				<BeatEditor
					handlePost={handleReply}
					replyItem={item}
				/>
			</Modal>
			{
				item.user_id === account!.id && (
					<Modal isOpen={ isDeleteModal } onOpen={ () => setIsDeleteModal(false) }>
						<div className="m-BeatItemDelete">
							<p className="m-BeatItemDelete_title">ポストを削除</p>
							<p className="m-BeatItemDelete_text">本当に削除しますか？</p>
							<div className="m-BeatItemDelete_btn">
								<Button color="transparent" onClick={ () => setIsDeleteModal(false) }>キャンセル</Button>
								<Button color="primary" onClick={ handleDeleteItem }>削除</Button>
							</div>
						</div>
					</Modal>
				)
			}
			<Popup isOpen={ isOpenConfig } target={ configRef.current } onClose={ () => setIsOpenConfig(false) }>
                <div className="m-BeatItemConfig">
					<Button color="transparent">
						<div className="m-BeatItemConfig_button">デフ</div>
					</Button>
					{ item.user_id === account!.id && (
						<Button color="transparent" onClick={ handleOpenDeleteModal }>
							<div className="m-BeatItemConfig_button is-delete">
								<DeleteIcon className="m-BeatItemConfig_button_icon" />
								<p className="m-BeatItemConfig_button_text">削除</p>
							</div>
						</Button>
					) }
				</div>
            </Popup>
		</>
	)
});

const _BeatItemSkeleton : FC = () => {
	return (
		<div className="m-BeatItemSkeleton">
			<div className="m-BeatItemSkeleton_inner">
				<div className="m-BeatItemSkeleton_avatar">
					<Skeleton className="m-BeatItemSkeleton_avatarIcon"/>
				</div>
				<div className="m-BeatItemSkeleton_top">
					<Skeleton className="m-BeatItemSkeleton_name"/>
					<Skeleton className="m-BeatItemSkeleton_time"/>
				</div>
				<div className="m-BeatItemSkeleton_detail">
					<Skeleton className="m-BeatItemSkeleton_text"/>
					<Skeleton className="m-BeatItemSkeleton_text"/>
					<Skeleton className="m-BeatItemSkeleton_text"/>
					<Skeleton className="m-BeatItemSkeleton_image"/>
				</div>
			</div>
		</div>
	)
}

const BeatItem = _BeatItem as BeatItemComponent;

BeatItem.Skeleton = _BeatItemSkeleton;

export default BeatItem as BeatItemComponent;
