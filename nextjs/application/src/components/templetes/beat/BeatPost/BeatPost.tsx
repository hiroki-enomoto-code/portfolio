import { FC, memo, useState } from 'react';
import axios from 'axios';

import { API_PATH } from '@/data';
import { BeatProps } from '@/types/beat';
import { FileProps } from '@/components/customUi/FileUpload';

import PlusIcon from '@/components/icon/PlusIcon';
import Modal from '@/components/ui/Modal';
import BeatEditor from '@/components/customUi/BeatEditor';

type Props = {
	onPost : (item : BeatProps) => void;
}

const BeatPost: FC<Props> = memo(({ onPost }) => {

	const [isOpenEditor, setIsOpenEditor] = useState(false);

	const handleOpenEditor = () => {
        setIsOpenEditor(true);
    }

	const handlePost = async (
        content: string,
        attachments: FileProps[],
        replyId?: number | null
    ) => {

        const formData = new FormData();
        attachments.forEach((file) => {
            if (file.file) {
                formData.append(`file[]`, file.file);
            }
        });
        formData.append('content', content);

        if (replyId) {
            formData.append('reply', String(replyId));
        }

        await axios.post<BeatProps>(`${API_PATH}/beat`, formData)
            .then((res) => {
                console.log(res);
                if (res.data && res.status === 200) {
					onPost(res.data);
                    setIsOpenEditor(false);
                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => { });
    }

	return (
		<>
			<button onClick={ handleOpenEditor } className="beatAddButton"><PlusIcon /></button>

			<Modal isOpen={isOpenEditor} onOpen={() => setIsOpenEditor(false)}>
                <BeatEditor
                    handlePost={handlePost}
                />
            </Modal>
		</>
	)
});

export default BeatPost;
