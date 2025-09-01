import { useQuery } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

export interface IPrice {
  externalId: string;
  id: string;
  order: number;
  recurringInterval: string;
  value: number;
}

const getPrice = async (): Promise<IPrice[]> => {
  const uri = `/frontend/price`;
  const response = await api.get<IPrice[]>(uri);
  return response.data ?? [];
};

export const useGetPriceQuery = () => {
  const {
    error,
    data: data,
    refetch,
    isPending,
  } = useQuery({
    queryKey: ['getPrice'],
    queryFn: getPrice,
  });

  if (error) errorHandler(error);

  return {
    data: data ? data : [],
    refetch,
    isPending,
  };
};
