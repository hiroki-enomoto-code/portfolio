import axios from 'axios';
import { useQuery, UseQueryResult, useQueryClient, UseQueryOptions, QueryKey } from '@tanstack/react-query';

type Response<T> = UseQueryResult<T> & {
	setQueryData : (data: any) => Promise<void>;
}

type Props = Omit<UseQueryOptions<any, any>, 'queryKey' | 'queryFn'> & {
	queryKey : ['emoji'] | ['account'] | ['beat' | 'beat-reply'] | ['quiz'] | ['quiz-edit-list'];
	url : string;
};

const useQueryApi = <T>({ queryKey, url, ...options } : Props) => {

	const queryClient = useQueryClient();

	const queryResponse = useQuery({
		queryKey : queryKey,
		queryFn : async () => {
			const apiResponse = await axios.get(url)
				.then((res) => {
					if (res.data && res.status === 200) {
						return res.data;
					}
					throw new Error(res.data);
				})
				.catch((error) => {
					console.log(error);
					return null;
				});

			return apiResponse;
		},
		...options
	});

	const setQueryData = async (data : any) => {
		await queryClient.setQueryData(queryKey, data);
	}

    return { ...queryResponse, setQueryData } as Response<T>;
}

export default useQueryApi;