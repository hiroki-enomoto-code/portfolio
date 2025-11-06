import { FC, useMemo, ChangeEvent, useEffect, useState } from 'react';

import { v4 as uuid } from "uuid";
import ImageIcon from '@/components/icon/ImageIcon';

export type FileProps = {
    file: File | null;
    preview: string | null;
}

type Props<T extends boolean = false> = {
    children?: React.ReactNode;
    onChange: (file: T extends true ? FileProps[] : FileProps) => void;
    maxLength?: number;
    multiple?: T;
    label?: string | null;
}

const FileUpload = <T extends boolean = false>({ children, onChange, maxLength = 1, multiple, label = null }: Props<T>) => {

    const id = useMemo(() => `file-upload-${uuid()}`, []);

    const [isMounted, setIsMounted] = useState(false);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const _files = e.target.files;

        const filesArray = Array.from(_files || []);
        const fileReadPromises = filesArray
            .filter(_file => _file && _file.type.startsWith('image/'))
            .map(_file => {
                return new Promise<FileProps>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({
                            file: _file,
                            preview: reader.result as string,
                        });
                    };
                    reader.readAsDataURL(_file);
                });
            });
        const _fileState = await Promise.all(fileReadPromises);

        // multipleがfalseの場合は単体のFilePropsを返す
        if (!multiple) {
            onChange((_fileState[0] || { file: null, preview: null }) as T extends true ? FileProps[] : FileProps);
        } else {
            onChange(_fileState as T extends true ? FileProps[] : FileProps);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    if (!isMounted) return null;

    return (
        <div className="m-FileUpload">
            {label && <div className="label">{label}</div>}
            <label htmlFor={id} className="m-FileUpload_inner">
                <input
                    id={id}
                    onChange={handleFileChange}
                    type="file"
                    accept="image/*"
                    maxLength={maxLength}
                    multiple={multiple}
                />
                {children}
            </label>
        </div>
    );
};

export default FileUpload;