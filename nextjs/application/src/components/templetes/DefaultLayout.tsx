"use client";
import { ReactNode, memo } from "react";
import { NextPage } from 'next';

import Notification from "@/components/ui/Notification/Notification";

type Props = {
	children: ReactNode;
}

const DefaultLayout: NextPage<Props> = memo(({ children }) => {
	return (

		<>
			{children}
			<Notification />
		</>
	)
});

export default DefaultLayout;