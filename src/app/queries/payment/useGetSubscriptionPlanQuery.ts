import { useQuery } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';

interface IPlanInfo {
  titles: string[];
  subtitles: string[];
  descriptions: string[];
  params: {
    title: string;
    items: {
      name: string;
      values: string[];
    }[];
  }[];
}

const getSubscriptionPlan = async (): Promise<IPlanInfo> => {
  const uri = `/frontend/subscription-plan`;
  const response = await api.get<IPlanInfo>(uri);
  return response.data ?? [];
};

export const useGetSubscriptionPlanQuery = () => {
  const {
    error,
    data: data,
    refetch,
    isPending,
  } = useQuery({
		enabled: true,
    queryKey: ['getSubscriptionPlan'],
    queryFn: getSubscriptionPlan,
  });

  if (error) errorHandler(error);

  return {
    data,
    refetch,
    isPending,
  };
};
