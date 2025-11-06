import React, { useState, useEffect, useRef, FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useData } from "@/context/DataContext";
import Button from '@/components/ui/Button/Button';
import CrossIcon from '@/components/icon/CrossIcon';

// Notification types
const TYPES = {
	SUCCESS: 'success',
	ERROR: 'error'
};

// Position variants
const POSITIONS = {
	TOP_CENTER: 'top-center',
	BOTTOM_CENTER: 'bottom-center',
	TOP_RIGHT: 'top-right',
	BOTTOM_RIGHT: 'bottom-right',
	BOTTOM_LEFT: 'bottom-left',
	TOP_LEFT: 'top-left'
};

// Position styles mapping
const positionStyles = {
	[POSITIONS.TOP_CENTER]: 'top-4 left-1/2 -translate-x-1/2',
	[POSITIONS.BOTTOM_CENTER]: 'bottom-4 left-1/2 -translate-x-1/2',
	[POSITIONS.TOP_RIGHT]: 'top-4 right-4',
	[POSITIONS.BOTTOM_RIGHT]: 'bottom-4 right-4',
	[POSITIONS.BOTTOM_LEFT]: 'bottom-4 left-4',
	[POSITIONS.TOP_LEFT]: 'top-4 left-4'
};

// Type styles mapping (colors)
const typeStyles = {
	[TYPES.SUCCESS]: 'bg-green-100 border-green-500 text-green-700',
	[TYPES.ERROR]: 'bg-red-100 border-red-500 text-red-700'
};

const animationVariants = {
	initial: (position) => {
		// Different initial positions based on notification position
		if (position.includes('top')) {
			return { opacity: 0, y: -50 };
		} else if (position.includes('bottom')) {
			return { opacity: 0, y: 50 };
		} else if (position.includes('left')) {
			return { opacity: 0, x: -50 };
		} else {
			return { opacity: 0, x: 50 };
		}
	},
	animate: {
		opacity: 1,
		y: 0,
		x: 0,
		transition: {
			duration: 0.3,
			ease: 'easeOut'
		}
	},
	exit: (position) => {
		// Different exit animations based on notification position
		if (position.includes('top')) {
			return {
				opacity: 0,
				y: -50,
				transition: {
					duration: 0.2,
					ease: 'easeIn'
				}
			};
		} else if (position.includes('bottom')) {
			return {
				opacity: 0,
				y: 50,
				transition: {
					duration: 0.2,
					ease: 'easeIn'
				}
			};
		} else if (position.includes('left')) {
			return {
				opacity: 0,
				x: -50,
				transition: {
					duration: 0.2,
					ease: 'easeIn'
				}
			};
		} else {
			return {
				opacity: 0,
				x: 50,
				transition: {
					duration: 0.2,
					ease: 'easeIn'
				}
			};
		}
	}
};

const NotificationIcon = ({ type }) => {
	if (type === TYPES.SUCCESS) {
		return (
			<svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
				<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
			</svg>
		);
	} else {
		return (
			<svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
				<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
			</svg>
		);
	}
};

export type NotificationProps = {
	id: string;
	type: 'success' | 'error';
	position: 'top-center' | 'bottom-center' | 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
	message: string;
	duration?: number;
}

const Notification : FC = () => {
	
	const { notification, setNotification } = useData();
	const [items, setItems] = useState<{ [Key: string] : NotificationProps[] }>({});

	useEffect(() => {
		const _items = {};
		notification.forEach((item) => {
			const position = item.position || POSITIONS.TOP_CENTER;
			if (!_items[position]) {
				_items[position] = [];
			}
			_items[position].push(item);
		});
		setItems(_items);
	},[notification]);

	return (
		Object.entries(items).map(([position, _items]) => (
			<div key={ position } className={`m-Notification ${ position }`}>
				{_items.map((item) => (
					<NotificationItem
						key={item.id}
						id={item.id}
						type={item.type}
						position={position}
						message={item.message}
						duration={item.duration}
						onClose={ () => setNotification(item, true) }
					/>
				))}
			</div>
		))
	);
};

export default Notification;


const NotificationItem = ({
	id,
	type = TYPES.SUCCESS,
	position,
	message = '',
	duration = 3000,
	onClose
}) => {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		if (duration <= 0) return;

		const timer = setTimeout(() => {
			setIsVisible(false);
		}, duration);

		return () => clearTimeout(timer);
	}, [duration]);

	const handleClose = () => {
		setIsVisible(false);
	};

	const handleExitComplete = () => {
		if (onClose) {
			onClose();
		}
	};

	return (
		<AnimatePresence onExitComplete={handleExitComplete}>
			{isVisible && (
				<motion.div
					className="m-NotificationItem"
					initial="initial"
					animate="animate"
					exit="exit"
					variants={animationVariants}
					custom={position}
				>
					<div className={`m-NotificationItem_inner ${typeStyles[type]}`}>
						<div className="m-NotificationItem_innerBox">
							<div className="m-NotificationItem_icon">
								<NotificationIcon type={type} />
							</div>
							<div className="m-NotificationItem_message">{message}</div>
							<Button type="button" onClick={handleClose} color="transparent">
								<CrossIcon />
							</Button>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};