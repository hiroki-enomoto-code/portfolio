import React, { LegacyRef, HTMLAttributes, memo } from 'react';
import Link from 'next/link';
import LoadingIcon from '@/components/icon/LoadingIcon';;

type ButtonProps = HTMLAttributes<HTMLButtonElement> & {
    ref?: LegacyRef<HTMLButtonElement>;
    color?: 'primary' | 'dark' | 'white' | 'transparent' | 'default' | 'danger' | 'success';
    size?: 'xs' | 's' | 'm' | 'l';
    rounded?: 'xs' | 's' | 'm' | 'l' | 'circle';
    border?: boolean;
    type?: 'button' | 'submit' | 'reset';
    value?: string | number;
    loading?: boolean;
    disabled?: boolean;
    width?: string | number | 'fit-content';
    height?: string | number | 'fit-content';
}

type AnchorProps = Omit<HTMLAttributes<HTMLAnchorElement>, keyof ButtonProps> & ButtonProps & {
    href: string;
}

function isAnchorProps(props: ButtonProps | AnchorProps): props is AnchorProps {
    return 'href' in props;
}

type Props = ButtonProps | AnchorProps;

const Button: React.FC<Props> = memo(({ children, color = 'default', size = 's', rounded = 'xs', border = false, className, loading = false, width = 'auto', height = 'auto', ...props }) => {

    const commonClassNames = `m-Button size-${size} color-${color} rounded-${rounded} border-${border ? 'solid' : 'none'}${ props.disabled ? ' is-disabled' : '' } ${className || ''}`;

    if (isAnchorProps(props)) {
        const { href, ...anchorProps } = props;
        return (
            <Link href={href} style={{width, height}} className={commonClassNames} {...anchorProps as any}>
                {children}
            </Link>
        );
    }

    return (
        <button style={{width, height}} className={commonClassNames} { ...props }>
            { children }
            {
                loading && (
                    <div className="m-Button_load">
                        <LoadingIcon/>
                    </div>
                )
            }
        </button>
    );
});

export default Button;