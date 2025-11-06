import React, { LegacyRef, HTMLAttributes, memo } from 'react';

type Props = {
    src: string;
    ref?: LegacyRef<HTMLImageElement>;
    width?: string | number;
    height?: string | number;
    alt?: string;
    className?: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' | 'initial' | 'inherit';
};

const Image: React.FC<Props> = memo(({
    ref=null,
    src = "",
    width = '100%',
    height = 'auto',
    objectFit = 'initial',
    alt = '',
    ...props
}) => {

    return (
        <img
            ref={ ref }
            src={ src }
            style={{
                width,
                height,
                objectFit
            }}
            alt={ alt }
            {  ...props }
        />
    );
});

export default Image;