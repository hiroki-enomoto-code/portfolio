'use client';
import React, { useState, useRef, useEffect, use } from 'react';
import { motion } from "framer-motion";
import axios from 'axios';

import { API_PATH } from '@/data';
import useQueryApi from '@/hooks/useQueryApi';
import { EmojiType } from '@/types/emoji';
import { BeatProps, BeatListProps } from '@/types/beat';

import BeatItem from '@/components/templetes/beat/BeatItem/BeatItem';

type PageProps = {
    params: Promise<{
      id: string;
    }>;
};

export default function Page({ params }: PageProps) {

    const { id } = use(params);
    const isFirstRender = useRef(false);
    const sensorRef = useRef<HTMLDivElement>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const lastId = useRef<number>(0);
    const args = useRef<{ last_id : number, per_page:number }>({
        last_id: lastId.current,
        per_page: 40,
    });

    const emojiApi = useQueryApi<EmojiType>({ queryKey: ['emoji'], url: `${API_PATH}/emoji` });
    const beatApi = useQueryApi<BeatListProps>({ queryKey: ['beat-reply'], url: `${API_PATH}/beat/reply/${id}/?${new URLSearchParams(args.current as any)}`, enabled: false });
    
    const [isInit, setIsInit] = useState<boolean>(false);
    const [refetching, setRefetching] = React.useState(false);

    const handleMoreBeat = async() => {
        args.current.last_id = lastId.current;
        setRefetching(true);
        await axios.get<BeatListProps>(`${API_PATH}/beat/reply/${id}/?${new URLSearchParams(args.current as any)}`)
            .then((res) => {
                if (res.data && res.data.data) {
                    if(!res.data.more){
                        if(sensorRef.current && observer.current){
                            observer.current.unobserve(sensorRef.current);
                            observer.current = null;
                        }
                    }
                    beatApi.setQueryData((prev : BeatListProps) => {
                        const newBeat : BeatListProps = {
                            more: res.data.more,
                            data: [...prev.data, ...res.data.data],
                        };
                        return newBeat;
                    });
                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setRefetching(false);
            });
    }

    useEffect(() => {
        if(id && !isFirstRender.current){
            ( async() => {
                await beatApi.setQueryData([]);
                await beatApi.refetch();
                setIsInit(true);
            })()
        }
    },[id]);

    useEffect(() => {
        if(beatApi.data && beatApi.data.data && beatApi.data.more){

            lastId.current = beatApi.data.data[beatApi.data.data.length - 1].id;

            if(sensorRef.current && !isFirstRender.current){
                isFirstRender.current = true;
                observer.current = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting && !refetching) {
                        console.log('IntersectionObserver');
                        handleMoreBeat();
                    }
                }, { threshold: 0.2 });
                
                observer.current.observe(sensorRef.current);
            }
        }
    },[beatApi.data]);

    return (
        <div id="page-beat" className="page-beat">
            <div className="beatList">
                {
                    (beatApi.data?.data && isInit) && (
                        beatApi.data.data.map( (item, idx) => (
                            <motion.div
                                className="beatList_item"
                                key={ item.id }
                                custom={idx % 5}
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0, y: 50 },
                                    visible: (i) => ({
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring',
                                            damping: 12,
                                            stiffness: 200,
                                            delay: i * 0.05,
                                        },
                                    }),
                                }}
                            >
                                <BeatItem
                                    key={ idx }
                                    item={ item }
                                    emoji={ emojiApi.data || null }
                                    isReply={ item.reply ? true : false }
                                />
                            </motion.div>
                        ))
                    )
                }

                { (beatApi.isFetching || refetching) && (
                    [...Array(20)].map((_, idx) => (
                        <BeatItem.Skeleton key={ idx }/>
                    ))
                )}
            </div>
            <div ref={ sensorRef } className="page-beat_sensor"/>
        </div>
    );
}