"use client";
import React, { useState } from 'react';

type Props = {
	children : React.ReactNode;
}

const Main : React.FC<Props> = ({ children }) => {

	return (
		<div className="m-Main">
			<div className="m-Main_inner">
				{ children }
			</div>
		</div>
	);
}

export default Main;