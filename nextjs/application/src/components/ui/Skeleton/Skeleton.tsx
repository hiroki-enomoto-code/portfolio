import { FC, HTMLAttributes } from "react";

const Skeleton : FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {

	return (
        <span className={`m-Skeleton${ className ? ` ${ className }` : `` }`} { ...props }></span>
	)
}

export default Skeleton;