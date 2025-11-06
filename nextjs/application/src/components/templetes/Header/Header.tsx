"use client";
import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, SubmitHandler } from "react-hook-form";

import { API_PATH } from '@/data';
import { useData } from "@/context/DataContext";
import { FileProps } from "@/components/customUi/FileUpload";

import Menu from '@/components/templetes/Header/Menu';
import Button from "@/components/ui/Button/Button";
import Avatar from '@/components/ui/Avatar/Avatar';
import ArrowLeftIcon from '@/components/icon/ArrowLeftIcon';
import TextField from '../../ui/TextField/TextField';

type ProfileEditProps = {
	email: string,
	nickname: string,
	birthday: string,
	mbti: string,
	value: string,
};

const Header: React.FC = () => {

	const { account, setAccount } = useData();

	const { register, handleSubmit, formState: { errors } } = useForm<ProfileEditProps>({ shouldUnregister: false });

	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isProfileEdit, setIsProfileEdit] = useState(false);
	const [isOpenMenu, setIsOpenMenu] = useState(false);
	const [fileState, setFileState] = useState<FileProps[]>([]);
	const [isLoading, setLoading] = useState(false);

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const _files = e.target.files;

		const filesArray = Array.from(_files || []);
		const fileReadPromises = filesArray
			.filter(_file => _file && _file.type.startsWith('image/'))
			.map(_file => {
				return new Promise<FileProps>((resolve) => {
					const reader = new FileReader();
					reader.onloadend = () => {
						resolve({
							file: _file,
							preview: reader.result as string,
						});
					};
					reader.readAsDataURL(_file);
				});
			});
		const _fileState = await Promise.all(fileReadPromises);
		setFileState(_fileState);
	};

	const handleEditProfileSubmit: SubmitHandler<ProfileEditProps> = async (data) => {
		const formData = new FormData();
		formData.append('nickname', data.nickname);
		formData.append('birthday', data.birthday);
		formData.append('mbti', data.mbti);
		if (fileState.length > 0) {
			fileState.forEach((file) => {
				if (file.file) {
					formData.append('avatar', file.file);
				}
			});
		}

		setLoading(true);
		await axios.get(`${API_PATH}/sanctum/csrf-cookie`);
		await axios.post(`${API_PATH}/profile`, formData)
			.then((res) => {
				if (res.data && res.status === 200) {
					setAccount(res.data);
					setFileState([]);
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
		<>
			<div className="m-Header">
				<div className="m-Header_inner">
					<button onClick={() => setIsProfileOpen(true)}><Avatar src={ account!.avatar ? `/public/avatar/${ account!.avatar }` : `/images/i_oji_default.png`} /></button>
					<img className="m-Header_logo" src="/images/logo.svg" alt="" />
					<div className="m-Header_innerRight">
						<button onClick={ () => setIsOpenMenu(true) } className="m-HeaderMenuButton">
							<div className="m-HeaderMenuButton_inner">
								<span className="dot"></span>
								<span className="dot"></span>
								<span className="dot"></span>
								<span className="dot"></span>
								<span className="dot"></span>
								<span className="dot"></span>
								<span className="dot"></span>
								<span className="dot"></span>
								<span className="dot"></span>
							</div>
						</button>
					</div>
					<Menu
						isOpen={ isOpenMenu }
						onClose={ () => setIsOpenMenu(false) }
						onProfileOpen={ () => setIsProfileOpen(true) }
					/>
				</div>
			</div>
			<AnimatePresence>
				{
					isProfileOpen && (
						<div className="m-HeaderProfile">
							<div onClick={() => setIsProfileOpen(false)} className="m-HeaderProfile_bg"></div>
							<motion.div
								className="m-HeaderProfile_inner"
								variants={{
									hidden: { opacity: 0, scale: 0.5, x: 50 },
									visible: {
										opacity: 1,
										scale: 1,
										x: 0,
										transition: {
											type: 'spring',
											damping: 10,
											stiffness: 200,
											mass: 0.8
										}
									},
									exit: {
										opacity: 0,
										scale: 0.8,
										x: 20,
										transition: {
											duration: 0.2
										}
									}
								}}
								initial="hidden"
								animate="visible"
								exit="exit"
							>
								<AnimatePresence mode="wait">
									{
										!isProfileEdit ? (
											<motion.div
												key="profile-view"
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: -20 }}
												transition={{ duration: 0.3 }}
											>
												<div className="m-HeaderProfileData">
													<div className="m-HeaderProfileImage">
														<Avatar size={80} src={ account!.avatar ? `/public/avatar/${ account!.avatar }` : `/images/i_oji_default.png` } />
													</div>
													<div className="m-HeaderProfile_name">{account?.nickname || '名無しのタロベーさん'}</div>
													<div className="m-HeaderProfile_email">{account?.email || 'taro-yamada@com'}</div>
													<div className="m-HeaderProfile_editButton">
														<Button onClick={() => setIsProfileEdit(true)} color="transparent" border={true}>Edit Profile</Button>
													</div>
												</div>
											</motion.div>
										) : (
											<motion.div
												key="profile-edit"
												initial={{ opacity: 0, x: 20 }}
												animate={{ opacity: 1, x: 0 }}
												exit={{ opacity: 0, x: 20 }}
												transition={{ duration: 0.3 }}
											>
												<div className="m-HeaderProfileEdit">
													<div className="m-HeaderProfileEditHead">
														<Button onClick={() => setIsProfileEdit(false)} color="transparent"><ArrowLeftIcon /></Button>
														<div className="m-HeaderProfileEditHead_title">Edit Profile</div>
														<i />
													</div>
													<form onSubmit={handleSubmit(handleEditProfileSubmit)} className="m-HeaderProfileEditForm">
														<div className="m-HeaderProfileEditFormImage">
															{
																fileState.length > 0 ? (
																	<Avatar size={80} src={fileState[0].preview!} />
																) : (
																	<Avatar size={80} src={`/public/avatar/${ account!.avatar }`} />
																)
															}
															<input onChange={handleFileChange} type="file" accept="image/*" />
														</div>
														<TextField
															type="text"
															label="ニックネーム"
															id="nickname"
															{...register("nickname", { required: "ニックネームを入力してください" })}
															error={errors.nickname ? errors.nickname.message : null}
															defaultValue={account?.nickname || ''}
														/>
														<TextField
															type="text"
															label="誕生日"
															id="birthday"
															{...register("birthday", {
																pattern: {
																	value: /^([0-1][0-9]|2[0-3])-[0-5][0-9]$/,
																	message: "正しい時間形式で入力してください (例: 09-30)"
																}
															})}
															error={errors.birthday ? errors.birthday.message : null}
															defaultValue={account?.birthday || ''}
														/>
														<TextField
															type="text"
															label="MBTI"
															id="mbti"
															{...register("mbti")}
															defaultValue={account?.mbti || ''}
														/>
														<Button type="submit" loading={ isLoading }>変更</Button>
													</form>
												</div>
											</motion.div>
										)
									}
								</AnimatePresence>
							</motion.div>
						</div>
					)
				}
			</AnimatePresence>
		</>
	);
}

export default Header;