import { LegacyRef, HTMLAttributes, FC } from 'react';

type Props = HTMLAttributes<HTMLHeadingElement> & {
    children?: React.ReactNode;
    level?: 1 | 2 | 3 | 4 | 5;
    center?: boolean;
    ref?: LegacyRef<HTMLHeadingElement>;
}

export const Title : FC<Props> = ({
    children,
    level = 1,
    center = false,
    ref,
    ...props
}) => {

	return (
		<div className={`m-Typography-Title level-${ level } ${ center ? 'text-center' : 'text-left' }`} {...props}>
            { children }
        </div>
	);
};

type ParagraphProps = HTMLAttributes<HTMLParagraphElement> & {
    children?: React.ReactNode;
    className?: string;
    size? : 'xxs'| 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    align?: 'left' | 'center' | 'right';
    weight?: 'normal' | 'bold';
    type?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
    ellipsis?: number;
    leading?: number| 'initial' | 'normal' | 'inherit' | 'unset';
    ref?: LegacyRef<HTMLHeadingElement>;
}
export const Paragraph: FC<ParagraphProps> = ({ children, size = 'md', align = 'left', ellipsis = 0, type, weight, leading = 'inherit', ...props }) => {
    return (
        <p
            className={`m-Typography-Paragraph${ ellipsis ? ` is-ellipsis clamp-${ ellipsis }` : '' }${ weight ? ` text-${ weight }` : ''}${ type ? ` color-${ type }` : '' }${ size ? ` size-${ size }` : '' }`}
            style={{
                textAlign: align,
                lineHeight: leading,
            }}
            {...props}
        >
            { children }
        </p>
    );
}

