import React, { memo } from 'react';

type Props = {
    size? : 'xs' | 's' | 'm' | 'l' | 'xl' | number;
    rounded? : 'xs' | 's' | 'm' | 'l' | 'circle';
    src? : string;
}

const Avatar: React.FC<Props> = memo(({ size = 'xs', rounded = 'xs', src = null }) => {

    return (
        <div
            className="m-Avatar"
            style={{
                width: typeof size === 'number' ? size : undefined,
                height: typeof size === 'number' ? size : undefined,
            }}
        >
            { src && <img className="m-Avatar_image" src={ src } alt="" /> }
        </div>
    );
});

export default Avatar;