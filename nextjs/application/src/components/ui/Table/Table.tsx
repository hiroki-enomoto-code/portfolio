import { LegacyRef, HTMLAttributes, FC } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
    columns?: string;
    size?: 'xxs' | 'xs' | 's' | 'm' | 'l';
    ref?: LegacyRef<HTMLDivElement>;
}

const Table: FC<Props> = ({
    children,
    ref,
    size = 'm',
    columns = "1fr",
    ...props
}) => {
    return (
        <div style={{ '--grid-template-columns': columns } as any} className={`m-Table size-${ size }`} ref={ref} {...props}>
            {children}
        </div>
    );
};

export default Table;

type TableHeaderProps = HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
    gap?: number;
    ref?: LegacyRef<HTMLDivElement>;
}
export const TableHeader: FC<TableHeaderProps> = ({
    children,
    ref,
    gap = 4,
    ...props
}) => {
    return (
        <div className={`m-Table-Header`} ref={ref} style={{ gap }} {...props}>
            {children}
        </div>
    );
};

export const TableBody: FC<TableHeaderProps> = ({
    children,
    ref,
    gap = 4,
    ...props
}) => {
    return (
        <div className={`m-Table-Body`} ref={ref} style={{ gap }} {...props}>
            {children}
        </div>
    );
};

type TableRowProps = HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
    clickable?: boolean;
    ref?: LegacyRef<HTMLDivElement>;
}
export const TableRow: FC<TableRowProps> = ({
    children,
    ref,
    clickable = false,
    ...props
}) => {
    return (
        <div className={`m-Table-Row${ clickable ? ' clickable' : '' }`} ref={ref} {...props}>
            {children}
        </div>
    );
};

export const TableCell: FC<Props> = ({
    children,
    ref,
    ...props
}) => {
    return (
        <div className={`m-Table-Cell`} ref={ref} {...props}>
            {children}
        </div>
    );
};

export const TableHeaderCell: FC<Props> = ({
    children,
    ref,
    ...props
}) => {
    return (
        <div className={`m-Table-HeaderCell`} ref={ref} {...props}>
            {children}
        </div>
    );
};

export const TableFooter: FC<Props> = ({
    children,
    ref,
    ...props
}) => {
    return (
        <div className={`m-Table-Footer`} ref={ref} {...props}>
            {children}
            <div className="table">
                <div className="tableHead">
                    <div className="tableRow">
                        <div className="tableCell">Footer Cell 1</div>
                        <div className="tableCell">Footer Cell 2</div>
                        <div className="tableCell">Footer Cell 3</div>
                    </div>
                </div>
                <div className="tableBody">
                    <div className="tableRow">
                        <div className="tableCell">Footer Content 1</div>
                        <div className="tableCell">Footer Content 2</div>
                        <div className="tableCell">Footer Content 3</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

