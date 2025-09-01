import { useQuery } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { IPrice } from './useGetPriceQuery';
import { isUndefined } from 'lodash';

export interface IWorkspaceLimitStats {
	channels: number;
	documents: number;
	guests: number;
	whiteboards: number;
}

export interface IPlanInfo {
	aiFreeUsage: number;
	channels: string;
	docs: string;
	members: string;
	storageSize: string;
	type: string;
	whiteboards: string;
}

export interface ISubscriptionInfo {
	cancelAt: number;
	cancelAtPeriodEnd: boolean;
	endPeriod: number;
	qty: number;
	startPeriod: number;
	status: string;
	price: IPrice;
	paymentMethod: {
		brand: string;
		lastFourCardDigits: string;
	},
}

export interface ISubscription {
	planInfo: IPlanInfo;
	subscription: ISubscriptionInfo;
	workspaceLimitStats: IWorkspaceLimitStats;
};

const getSubscription = async (workspaceId?: string): Promise<ISubscription> => {
  const uri = `/frontend/workspace/${workspaceId}/subscription`;
  const response = await api.get<ISubscription>(uri);
  return response.data ?? [];
};

export const useGetSubscriptionQuery = (workspaceId?: string) => {
	const enabled = !isUndefined(workspaceId);
  const {
    error,
    data: data,
    refetch,
    isPending,
  } = useQuery({
    queryKey: ['getSubscription', workspaceId],
    queryFn: () => getSubscription(workspaceId),
		enabled: enabled,
  });

  if (error) errorHandler(error);

  return {
    data,
    refetch,
    isPending,
		error,
  };
};
