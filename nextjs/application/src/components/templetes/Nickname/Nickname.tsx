"use client";
import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { useForm, SubmitHandler } from "react-hook-form";

import { useData } from "@/context/DataContext";
import { User } from '@/types/user';
import { API_PATH } from '@/data';
import { FileProps } from "@/components/customUi/FileUpload";

import TextField from '@/components/ui/TextField/TextField';
import Button from '@/components/ui/Button/Button';
import Avatar from '@/components/ui/Avatar/Avatar';
import FileUpload from '@/components/customUi/FileUpload';

const Nickname : React.FC = () => {

	const { account, setAccount } = useData();
	const { register, handleSubmit, formState: { errors } } = useForm<{ nickname : string }>({ shouldUnregister: false });

	const [isLoading, setLoading] = useState(false);
	const [fileState, setFileState] = useState<FileProps | null>(null);

	const onSubmit: SubmitHandler<{ nickname : string }> = async (data) => {

		const formData = new FormData();
		formData.append('nickname', data.nickname);
		if (fileState && fileState.file) {
			formData.append('avatar', fileState.file);
		}

		setLoading(true);
		await axios.get(`${API_PATH}/sanctum/csrf-cookie`);
		await axios.post<User>(`${ API_PATH }/profile`, formData)
            .then((res) => {
                if (res.data) {
                    setAccount(res.data);
                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setLoading(false);
            });
	}

	return (
		<div className="m-Nickname">
			<div className="m-Nickname_inner">
				<p className="m-Nickname_title">ニックネームとアイコンを設定してください</p>
				<p className="m-Nickname_subtitle">アプリ内で使用するニックネームは本名以外を入力してください。<br />アプリ内で使用します</p>
				<form className="m-NicknameForm" onSubmit={ handleSubmit(onSubmit) }>
					<FileUpload label="アイコン" onChange={ file => setFileState(file) }>
						<div className="m-NicknameForm_icon">
							{
								fileState ? (
									<Avatar size={80} src={fileState.preview!} />
								) : (
									<Avatar size={80} src={`/public/avatar/default.png`} />
								)
							}
							<p>変更する</p>
						</div>
					</FileUpload>
					<TextField label="ニックネーム" id="nickname" defaultValue={ account?.nickname } {...register("nickname", { required: "nickname is required" })} type="text" />
					<div className="m-NicknameForm_submit">
						<Button type="submit" size="m" loading={ isLoading }>登録する</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default Nickname;