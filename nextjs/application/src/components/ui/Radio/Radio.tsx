import { FC, forwardRef, ReactNode } from 'react';

type Props = {
	id?: string;
	name: string;
	value: any;
	size?: 'sm' | 'md' | 'lg';
	label?: string;
	checked?: boolean;
	onChange?: (value : any) => void;
	disabled?: boolean;
	error?: string | null;
}

interface BeatItemComponent extends FC<Props> {
	Group: FC<{ children: ReactNode }>;
}

const _RadioButton : FC<Props> = forwardRef(({
	id,
	name,
	value,
	label,
	disabled = false,
	error = null,
	size = 'md',
	...rest
}, ref) => {

	const uniqueId = id || `radio-${name}-${value}`;

	return (
		<div className={`m-RadioButton size-${size}`}>
			<label htmlFor={ uniqueId }>
				<input
					type="radio"
					id={ uniqueId }
					name={name}
					value={value}
					disabled={disabled}
					{...rest}
				/>
				<div className={`radio ${disabled ? 'disabled' : ''}`}></div>
				{ label && <span className="label">{label}</span> }
			</label>
		</div>
	);
});

const RadioButtonGroup : FC<{ children: ReactNode }> = ({ children }) => {
	return (
		<div className="m-RadioGroup">
			{ children }
		</div>
	)
}

const Radio = _RadioButton as BeatItemComponent;

Radio.Group = RadioButtonGroup;

export default Radio as BeatItemComponent;