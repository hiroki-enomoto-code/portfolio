import { FC, ReactNode } from 'react';

type Props = {
	children: ReactNode;
	justify? : 'start' | 'center' | 'end' | 'between' | 'around';
	align? : 'start' | 'center' | 'end' | 'stretch';
	wrap? : 'nowrap' | 'wrap' | 'wrap-reverse';
	gap? : number|string;
	vertical? : boolean;
	width?: string | number | 'fit-content';
}

interface FormComponent extends FC<Props> {
	Item: FC<{
		children: ReactNode,
		flex? : string|number,
		width?: string | number
	}>;
}

const _justify = {
	start: 'flex-start',
	center: 'center',
	end: 'flex-end',
	between: 'space-between',
	around: 'space-around',
};

const _Flex: FC<Props> = ({ children, justify = 'start', align = 'stretch', wrap = "nowrap", gap = 0, vertical = false, width = '100%' }) => {

	return (
		<div
			className="c-Flex"
			style={{
				display: 'flex',
				flexDirection: vertical ? 'column' : 'row',
				justifyContent: _justify[justify] || 'flex-start',
				alignItems: align,
				flexWrap: wrap,
				gap,
				width,
			}}
		>{children}</div>
	);
};

const FlexItem: FC<{
	children: ReactNode,
	flex? : string|number
	width?: string | number
}> = ({ children, flex = 'initial', width = 'auto' }) => {
	return (
		<div
			className="c-FlexItem"
			style={{ flex, width }}
		>
			{children}
		</div>
	)
}

const Flex = _Flex as FormComponent;

Flex.Item = FlexItem;

export default Flex;