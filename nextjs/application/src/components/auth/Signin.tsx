"use client";
import React, { FC, useState } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";

import axios from 'axios';
import { API_PATH } from '../../data';
import { useData } from "@/context/DataContext";
import TextField from '@/components/ui/TextField/TextField';
import Button from '../ui/Button/Button';
import { redirect } from 'next/navigation';

const LoginComponent: FC = () => {

	const { setAccount } = useData();

	const { register, handleSubmit, formState: { errors } } = useForm<{ password: string, remember: boolean, email: string }>({ shouldUnregister: false });
	const { register: verifyEmailRegister, handleSubmit: verifyEmailSubmit, setValue, formState: { errors: s } } = useForm<{ email: string, register_email: string }>({ shouldUnregister: false });

	const [isLoad, setIsLoad] = useState<'login' | 'reset' | ''>('');
	const [isResetMailDone, setIsResetMailDone] = useState(false);
	const [tab, setTab] = useState<'login' | 'password-reset'>('login');

	const onTabChange = (value: 'login' | 'password-reset') => {
		setTab(value);
		setValue('register_email', '');
		setValue('email', '');
	};

	const onSubmit: SubmitHandler<{ password: string, remember: boolean, email: string }> = async (data) => {
		let isLoginOK = false;
		try {
			setIsLoad('login');

			data.remember = true;

			await axios.get(`${API_PATH}/sanctum/csrf-cookie`);
			await axios.post(`${API_PATH}/login`, data)
				.then(res => {
					console.log(res);

					if (res.data && res.status === 200) {
						setAccount(res.data);
						isLoginOK = true;
					}
				})
				.catch(error => {
					console.log(error);
					//toast.error('ログインに失敗しました。');
				});

		} catch (error: any) {
			console.log(error.message);
		} finally {
			setIsLoad('');
		}

		if (isLoginOK) {
			redirect('/');
		}
	};

	const onVerifyEmail: SubmitHandler<{ email: string, register_email: string }> = async (data) => {

		let email = '';
		let reset = false;

		if (data.email) {
			email = data.email;
			reset = true;
		} else {
			email = data.register_email;
			reset = false;
		}

		if (!email) return;

		setIsLoad('reset');

		await axios.get(`${API_PATH}/sanctum/csrf-cookie`);
		await axios.post(`${API_PATH}/verify-email`, { email, reset })
			.then(response => {
				setIsResetMailDone(true);
			})
			.catch((error) => {
				console.log(error);
				//toast.error('メールの送信に失敗しました。');
			})
			.finally(() => {
				setIsLoad('');
			});
	};

	return (
		<div id="signIn" className="signIn">
			<div className="signIn_inner">
				{tab === 'login' && (
					<form className="signInForm" onSubmit={handleSubmit(onSubmit)}>
						<div className="signInForm_title">ログイン</div>
						<div className="signInForm_inner">
							<TextField
								placeholder="example@example.com"
								label="メールアドレス"
								{...register("email", { required: "メールアドレスを入力してください" })}
								error={ errors.email ? errors.email.message : null }
							/>
							<TextField
								type='password'
								label="パスワード"
								{...register("password", { required: "パスワードを入力してください" })}
								error={ errors.password ? errors.password.message : null }
							/>
							<div className="signInForm_button">
								<Button color="default" border={true} type="submit" loading={ isLoad === 'login' ? true : false }>&ensp;送&ensp;信&ensp;</Button>
								<button className="signInForm_change" onClick={() => onTabChange('password-reset')}>パスワードリセット</button>
							</div>
						</div>
					</form>
				)}

				{tab === 'password-reset' && (
					<form className="signInForm" onSubmit={verifyEmailSubmit(onVerifyEmail)}>
						<div className="signInForm_title">パスワードリセット</div>
						<div className="signInForm_inner">
							{
								!isResetMailDone ? (
									<>
										<TextField
											placeholder="example@example.com"
											label="メールアドレス"
											{...verifyEmailRegister("email", { required: "メールアドレスを入力してください" })}
											error={ errors.email ? errors.email.message : null }
										/>
										<div className="signInForm_button">
											<Button color="default" border={true} type="submit" loading={ isLoad === 'reset' ? true : false }>&ensp;送&ensp;信&ensp;</Button>
											<button className="signInForm_change" onClick={() => onTabChange('login')}>ログイン</button>
										</div>
									</>
								) : (
									<div className="signInFormMail">
										<p>
											メールを送信しました。
											<br />
											メールに記載されているURLをクリックしてパスワードをリセットしてください。
											迷惑メールに振り分けられる場合がありますので、受信トレイをご確認ください。
										</p>
									</div>
								)
							}
						</div>
					</form>
				)}
			</div>
		</div>
	);
}

const RegisterComponent: FC = () => {

	const { register: verifyEmailRegister, handleSubmit: verifyEmailSubmit, setValue, formState: { errors } } = useForm<{ email: string, register_email: string }>({ shouldUnregister: false });

	const [isLoad, setIsLoad] = useState<boolean>(false);
	const [isResetMailDone, setIsResetMailDone] = useState(false);

	const onVerifyEmail: SubmitHandler<{ email: string, register_email: string }> = async (data) => {

		const email = data.register_email;
		const reset = false;

		if (!email) return;

		setIsLoad(true);
		await axios.get(`${API_PATH}/sanctum/csrf-cookie`);
		await axios.post(`${API_PATH}/verify-email`, { email, reset })
			.then(response => {
				//toast.success('メールを送信しました。');
				console.log(response);
				
				setIsResetMailDone(true);
			})
			.catch((error) => {
				console.log(error);
				//toast.error('メールの送信に失敗しました。');
			})
			.finally(() => {
				setIsLoad(false);
			});
	};

	return (
		<div id="signIn" className="signIn">
			<div className="signIn_inner">
				<form className="signInForm" onSubmit={verifyEmailSubmit(onVerifyEmail)}>
					<div className="signInForm_title">新規登録</div>
					<div className="signInForm_inner">
						{
							!isResetMailDone ? (
								<>
									<TextField
										placeholder="example@example.com"
										label="メールアドレス"
										{...verifyEmailRegister("register_email", { required: "メールアドレスを入力してください" })}
										error={ errors.register_email ? errors.register_email.message : null }
									/>
									<div className="signInForm_button">
										<Button color="default" border={true} type="submit" loading={ isLoad }>&ensp;送&ensp;信&ensp;</Button>
									</div>
								</>
							) : (
								<div className="signInFormMail">
									<p>
										メールを送信しました。
										<br />
										メールに記載されているURLをクリックしてパスワードをリセットしてください。
										迷惑メールに振り分けられる場合がありますので、受信トレイをご確認ください。
									</p>
								</div>
							)
						}
					</div>
				</form>
			</div>
		</div>
	);
}

export const Signin = {
	Login: LoginComponent,
	Register: RegisterComponent
};

export default Signin;
