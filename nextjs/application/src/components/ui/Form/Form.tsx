import { FC, FormHTMLAttributes, ReactNode } from 'react';

type Props = FormHTMLAttributes<HTMLFormElement> & {
	children?: ReactNode
}

interface FormComponent extends FC<Props> {
	Item: FC<{ children: ReactNode, label?: string }>;
	Error: FC<{ children: ReactNode, isError: boolean }>;
}

const _Form: FC<Props> = ({ children, className, ...props }) => {
	return (
		<form className="c-Form" {...props}>{children}</form>
	);
};

const FormItem: FC<{ children: ReactNode, label? : string }> = ({ children, label = '' }) => {
	return (
		<div className="c-FormItem">
			{label && <label className="c-FormItem_label">{label}</label>}
			{children}
		</div>
	)
}

const FormError: FC<{ children: ReactNode, isError : boolean }> = ({ children, isError }) => {
	return (
		isError && <div className="c-FormError">{ children }</div>
	)
}

const Form = _Form as FormComponent;

Form.Item = FormItem;
Form.Error = FormError;

export default Form;