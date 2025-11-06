import { useData } from "@/context/DataContext";
import { NotificationProps } from "@/components/ui/Notification/Notification";

type Response = {
	success : (arg : {
		type?: 'success' | 'error';
		position?: 'top-center' | 'bottom-center' | 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
		duration?: number;
		message: string;
	}) => void;
}

const useNotification = () => {

	const { setNotification } = useData();

	const success : Response['success'] = ({
		message = 'Success',
		position = 'top-center',
		duration = 3000,
		type = 'success',
	}) => {
		const id = crypto.randomUUID();
		setNotification({
			id,
			type,
			message,
			position,
			duration
		});
	}

	return {
		success
	} as Response;
}

export default useNotification;