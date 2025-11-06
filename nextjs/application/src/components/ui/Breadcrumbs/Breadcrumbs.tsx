import React, { Fragment, memo } from 'react';
import Link from 'next/link';

import Button from '../Button/Button';
import ArrowRightIcon from '@/components/icon/ArrowRightIcon';
import ReturnIcon from '@/components/icon/ReturnIcon';

type Props = {
    data : {name:string, href?:string}[]
    back?: string;
}

const Breadcrumbs: React.FC<Props> = memo(({ data, back }) => {

    return (
        <div className="m-Breadcrumbs">
            <div className="m-Breadcrumbs_inner">
                {
                    back && (
                        <div className="m-Breadcrumbs_back">
                            <Button href={back} color="transparent"><ReturnIcon /></Button>
                        </div>
                    )
                }
                <div className="m-BreadcrumbsList">
                    {data.map((item, idx) => (
                        <Fragment key={idx}>
                            <div className="m-BreadcrumbsList_item">
                                { item.href ? <Link href={item.href}>{item.name}</Link> : <div>{item.name}</div> }
                            </div>
                            {idx < data.length - 1 && (
                                <div className="m-BreadcrumbsList_arrow">
                                    <ArrowRightIcon />
                                </div>
                            )}
                        </Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default Breadcrumbs;