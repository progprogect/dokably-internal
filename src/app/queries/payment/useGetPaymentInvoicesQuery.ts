import { useQuery } from '@tanstack/react-query';

import { api } from '@app/utils/api';
import { errorHandler } from '@app/utils/errorHandler';
import { isUndefined } from 'lodash';

interface IPaymentInvoice {
	id: string;
	status: string;
	amount: number;
	createdAt: string;
	pdfUrl: string;
}

const getPaymentInvoices = async (workspaceId?: string): Promise<IPaymentInvoice[]> => {
  const uri = `/frontend/workspace/${workspaceId}/payment-invoices`;
  const response = await api.get<IPaymentInvoice[]>(uri);
  return response.data ?? [];
};

export const useGetPaymentInvoicesQuery = (workspaceId?: string) => {
	const enabled = !isUndefined(workspaceId);
  const {
    error,
    data: data,
    refetch,
    isPending,
  } = useQuery({
    queryKey: ['getPaymentInvoices', workspaceId],
    queryFn: () => getPaymentInvoices(workspaceId),
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
