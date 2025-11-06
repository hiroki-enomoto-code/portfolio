import { LegacyRef, HTMLAttributes, FC } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
    padding?: number | string;
    margin?: number | string;
    background?: string;
    ref?: LegacyRef<HTMLHeadingElement>;
}

const Space : FC<Props> = ({
    children,
    ref,
    padding = 0,
    margin = 0,
    background = 'transparent',
    ...props
}) => {

	return (
		<div
            style={{
                padding: typeof padding === 'number' ? `${padding}px` : padding,
                margin: typeof margin === 'number' ? `${margin}px` : margin,
                backgroundColor: background
            }}
        >
            { children }
        </div>
	);
};

export default Space;