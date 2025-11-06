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
import { QuizProps } from '@/types/quiz';

type Props = {
	quiz : QuizProps;
}

interface QuizListItemComponent extends FC<Props> {
  Skeleton: FC;
}

const _QuizListItem: FC<Props> = memo(({ quiz }) => {
	const router = useRouter();
	const { account, users } = useData();

	return (
		<>
			<div className="QuizListItem">
				<div className="QuizListItem_inner">
					<div className="QuizListItem_thumbnail">
						<img
							src={ quiz.thumbnail ? `/public/quiz/${ quiz.id }/${ quiz.thumbnail }` : "/images/quiz/quiz_default_thumbnail.jpg" }
							alt={quiz.title}
							onError={ e => e.currentTarget.src = "/images/quiz/quiz_default_thumbnail.jpg" }
						/>
					</div>
					<div className="QuizListItem_detail">
						<div className="QuizListItem_title">{quiz.title}</div>
						<div className="QuizListItemData">
							<div className="QuizListItemData_item">
								<ReplyIcon className="w-4 h-4" />
								<span className="text-[12px]">全{quiz.question_count}問</span>
							</div>
							<div className="QuizListItemData_item">
								<ReplyIcon className="w-4 h-4" />
								<span className="text-[12px]">正解率{quiz.avg_score}%</span>
							</div>
							<div className="QuizListItemData_item">
								<ReplyIcon className="w-4 h-4" />
								<span className="text-[12px]">プレイ回数：{quiz.count}</span>
							</div>
						</div>
						<div className="QuizListItemLinks">
							<div className="QuizListItemLinks_item">
								<Button href={ `/quiz/${ quiz.id }` }>チャレンジ</Button>
							</div>
							<div className="QuizListItemLinks_item">
								<Button href={ `/quiz/attempt/${ quiz.id }/` }>みんなの結果を見る</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
});

const _QuizItemSkeleton : FC = () => {
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

const QuizListItem = _QuizListItem as QuizListItemComponent;

QuizListItem.Skeleton = _QuizItemSkeleton;

export default QuizListItem as QuizListItemComponent;
