'use client'
import React, { FC, useState, memo } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid';
import {
    Button, Field, Fieldset, For, Input,
    Textarea, Box, Group, CloseButton
} from "@chakra-ui/react"

export type EnqueteType = {
    id: string,
    answers: {
        id: string,
        value: string | number,
        count: number
    }[],
    detail: string,
    status: 'active' | 'end',
};

type Props = {
    onSubmit: (data: { answers: { id: string, value: string | number, count: number }[], detail: string }) => void;
}

const Enquete: FC<Props> = memo(({ onSubmit: _onSubmit }) => {

    const { register, handleSubmit, formState: { errors } } = useForm<any>({ shouldUnregister: false });

    const [answers, setAnswers] = useState<{ id: string, value: string | number }[]>([{ id: uuidv4(), value: '' }, { id: uuidv4(), value: '' }]);

    const onDeleteAnswer = (id: string) => {
        if (answers.length <= 2) return;
        setAnswers(answers.filter(answer => answer.id !== id));
    };

    const onAddAnswer = () => {
        setAnswers([...answers, { id: uuidv4(), value: '' }]);
    }

    const onSubmit: SubmitHandler<any> = (data) => {
        try {
            const datas = {
                answers: [] as { id: string, value: string | number, count: number }[],
                detail: data.detail
            }

            answers.forEach((answer, index) => {
                if (!data[`answer-${answer.id}`]) {
                    throw new Error(`Answer ${index + 1} is required`);
                }

                const value = data[`answer-${answer.id}`].trim();
                if (value){
                    datas.answers.push({
                        id: answer.id,
                        value,
                        count: 0
                    });
                }
            });

            if(datas.answers.length < 2) throw new Error('At least two answers are required');

            _onSubmit(datas);

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Box
            padding="8"
            as={"form"}
            onSubmit={handleSubmit(onSubmit)}
        >
            <Fieldset.Root size="lg">
                <Fieldset.Content>
                    <Field.Root invalid={!!errors.detail}>
                        <Field.Label>アンケートを内容</Field.Label>
                        <Textarea
                            {...register("detail", { required: true })}
                            placeholder="アンケートの内容を入力"
                            autoresize
                        />
                        <Field.ErrorText>必須項目です</Field.ErrorText>
                    </Field.Root>

                    <Field.Root>
                        <Field.Label>選択肢</Field.Label>
                        <For each={answers}>
                            {answer => (
                                <Group key={ answer.id } attached w="full">
                                    <Input
                                        defaultValue={answer.value || ''}
                                        {...register(`answer-${answer.id}`)}
                                    />
                                    <CloseButton onClick={() => onDeleteAnswer(answer.id)}/>
                                </Group>
                            )}
                        </For>
                        <Button size="2xs" onClick={onAddAnswer} type="button">選択肢追加</Button>
                    </Field.Root>
                </Fieldset.Content>

                <Button type="submit" colorPalette="blue" alignSelf="flex-start">送信</Button>
            </Fieldset.Root>
        </Box>
    );
});

export default Enquete;