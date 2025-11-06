import { Children, isValidElement, cloneElement, useRef, FC, ReactNode, useState, useEffect } from 'react';

type Props = {
	children: ReactNode;
	value?: string | number;
	head?: {
		children: ReactNode;
		value: string | number;
	}[];
}

interface FormComponent extends FC<Props> {
	Item: FC<{
		children: ReactNode,
		value: string | number,
	}>;
}

const _Tab: FC<Props> = ({ children, value: _value, head }) => {

	const childrenCountRef = useRef(Children.count(children));
	const dataValues = useRef<(string | number)[]>([]);

	const [value, setValue] = useState<string | number>(_value || '');
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		dataValues.current = [];

		if (head) {
			head.forEach(item => {
				dataValues.current.push(item.value || '');
			});
		} else {
			Children.forEach(children, (child) => {
				if (isValidElement(child)) {
					dataValues.current.push(child.props.value || '');
				}
			});
		}
	}, []);

	useEffect(() => {
		if (_value) {
			setValue(_value);
		}
	}, [_value]);

	useEffect(() => {
		const idx = dataValues.current.indexOf(value);
		if (idx !== -1) {
			setActiveIndex(idx);
		} else {
			setActiveIndex(0);
			setValue(dataValues.current[0]);
		}
	}, [value]);

	return (
		<div className="m-Tab">
			{head && (
				<div className="m-TabHead">
					{head.map((item, index) => (
						<div key={index} className="m-TabHeadItem" onClick={() => setValue(item.value)}>
							{item.children}
						</div>
					))}
				</div>
			)}
			<div className="m-TabBody">
				<div
					className="m-TabBody_inner"
					style={{
						width: `${100 * childrenCountRef.current}%`,
						transform: `translateX(-${(100 / childrenCountRef.current) * activeIndex}%)`
					}}
				>
					{children && Children.map(children, (child, idx) => {
						if (isValidElement(child)) {
							return cloneElement(child,
								{ 
									className: activeIndex === idx ? 'm-TabBodyItem is-active' : 'm-TabBodyItem'
								} as any
							);
						}
						return child;
					})}
				</div>
			</div>
		</div>
	);
};

const TabItem: FC<{
	children: ReactNode,
	value: string | number;
	className?: string;
}> = ({ children, value, className = "m-TabBodyItem" }) => {
	return (
		<div
			className={className}>
			{children}
		</div>
	)
}

const Tab = _Tab as FormComponent;

Tab.Item = TabItem;

export default Tab;