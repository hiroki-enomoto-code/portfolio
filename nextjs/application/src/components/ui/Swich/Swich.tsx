import React, { memo } from 'react';

type Props = {
    onChange: () => void;
    checkedChildren?: React.ReactNode;
    unCheckedChildren?: React.ReactNode;
    checked?: boolean;
}

const Swich: React.FC<Props> = memo(({ onChange, checkedChildren, unCheckedChildren, checked=false }) => {

    return (
        <button type="button" className="m-Swich" onClick={onChange}>
            <div className="m-Swich_inner">
                <div className="m-Swich_item">
                    {checkedChildren || ''}
                </div>
                <div className="m-Swich_item">
                    {unCheckedChildren || ''}
                </div>
                <div className={`indicator${ checked ? ' checked' : ''}`}></div>
            </div>
        </button>
    );
});

export default Swich;