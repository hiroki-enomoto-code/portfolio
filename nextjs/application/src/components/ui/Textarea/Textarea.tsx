import { LegacyRef, HTMLAttributes, FC } from 'react';

type Props = HTMLAttributes<HTMLTextAreaElement> & {
    ref?: LegacyRef<HTMLTextAreaElement>;
    label?: string;
    placeholder?: string;
    error?: string | null;
	rows?: number;
}

const Textarea : FC<Props> = ({
    ref,
    label = null,
    placeholder = '',
    error = null,
	rows,
    ...props
}) => {

	return (
		<div className="m-Textarea">
            { label && <label className="m-Textarea_label">{ label }</label> }
            <textarea
                ref={ ref }
                defaultValue={ props.defaultValue }
                placeholder={ placeholder }
				rows={ rows || 5 }
                {...props}
            />
            { error && <div className="m-Textarea_error">{ error }</div> }
        </div>
	);
};

export default Textarea;

