"use client";
import { FC, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';

import { useData } from "@/context/DataContext";

import DarkModeIcon from '@/components/icon/DarkModeIcon';
import LightModeIcon from '@/components/icon/LightModeIcon';

const Menu: FC<{ isOpen: boolean, onClose: () => void, onProfileOpen: () => void }> = ({ isOpen, onClose, onProfileOpen }) => {

	const domRef = useRef<HTMLDivElement>(null);
	const { account, setAccount, mode, setMode } = useData();

		const handleChangeMode = () => {
			if (mode === 'light') {
				setMode('dark');
			} else {
				setMode('light');
			}
			Cookies.set('mode', mode === 'light' ? 'dark' : 'light', { expires: 365 });
		}

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (domRef.current && !domRef.current.contains(e.target)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, onClose]);

	return (
		<AnimatePresence>
			{
				isOpen && (
					<motion.div
						ref={ domRef }
						className="m-HeaderMenuBox"
						variants={{
							hidden: { opacity: 0, scale: 1, y: 50 },
							visible: {
								opacity: 1,
								scale: 1,
								y: 0,
								transition: {
									type: 'spring',
									damping: 10,
									stiffness: 200,
									mass: 0.8
								}
							},
							exit: {
								opacity: 0,
								scale: 1,
								y: 20,
								transition: {
									duration: 0.2
								}
							}
						}}
						initial="hidden"
						animate="visible"
						exit="exit"
					>
						<div className="m-HeaderMenuBox_inner">
							<div className="m-HeaderMenuList">
								<div className="m-HeaderMenuListItem">
									<div className="m-HeaderMenuListItem_head">
										<Link onClick={ onClose } href="/beat/">つぶやき</Link>
									</div>
									<div className="m-HeaderMenuListItem_child">
										<div className="">
											<Link onClick={ onClose } href="/beat/"></Link>
										</div>
									</div>
								</div>

								<div className="m-HeaderMenuListItem">
									<div className="m-HeaderMenuListItem_head">
										<Link onClick={ onClose } href="/quiz/">クイズ一覧</Link>
									</div>
									<div className="m-HeaderMenuListItem_child">
										<div className="">
											<Link onClick={ onClose } href="/quiz/edit">クイズ作成</Link>
										</div>
										<div className="">
											<Link onClick={ onClose } href="/quiz/edit/list">作成したクイズ一覧</Link>
										</div>
										<div className="">
											<Link onClick={ onClose } href="/quiz/attempt/">チャレンジ履歴</Link>
										</div>
									</div>
								</div>

								<div className="m-HeaderMenuListItem">
									<div className="m-HeaderMenuListItem_head">
										<button type="button" onClick={ onProfileOpen }>プロフィール</button>
									</div>
								</div>
							</div>
							<button className="m-HeaderMode" onClick={handleChangeMode}>
								<div className="m-HeaderMode_inner">
									<div className="m-HeaderMode_item"><LightModeIcon /></div>
									<div className="m-HeaderMode_item"><DarkModeIcon /></div>
									<div className={`indicator${mode === 'dark' ? ' is-dark' : ''}`}></div>
								</div>
							</button>
						</div>
					</motion.div>
				)
			}
		</AnimatePresence>
	);
}

export default Menu;