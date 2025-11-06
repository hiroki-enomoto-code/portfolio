import React, { LegacyRef, InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
    ref?: LegacyRef<HTMLInputElement>;
    label?: string;
    placeholder?: string;
    type?: 'text' | 'password' | 'number';
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string | number;
    error?: string | null;
    suffix?: React.ReactNode;
}

const TextField: React.FC<Props> = ({
    ref,
    label = null,
    placeholder = '',
    type = 'text',
    error = null,
    suffix = "",
    width = '100%',
    ...props
}) => {

    return (
        <div className="m-TextField">
            { label && <label className="m-TextField_label">{ label }</label> }
            <div className="m-TextField_input">
                <input
                    ref={ ref }
                    type={ type }
                    defaultValue={ props.defaultValue }
                    placeholder={ placeholder }
                    style={{ width }}
                    {...props}
                />
                { suffix && <span className="m-TextField_suffix">{ suffix }</span> }
            </div>
            { error && <div className="m-TextField_error">{ error }</div> }
        </div>
    );
};

export default TextField;