import { createContext, useContext, useEffect, useMemo, useState } from 'react';
// import { useWorkspaceContext } from '../workspaceContext/workspaceContext';
import { ISubscription, IWorkspaceLimitStats, useGetSubscriptionQuery } from '@app/queries/payment/useGetSubscriptionMethodQuery';
// import { useGetWorkspaceMembers } from '@app/queries/workspace/user/useGetWorkspaceMembers';
import { startTimer } from '@app/utils/timers';
import { useWorkspaceContext } from '../workspace/context';
import { WorkspaceMember } from '../workspace/types';
import { isUndefined } from 'lodash';

interface ISubscriptionContext extends ISubscription {
	isOwner: boolean;
	members: WorkspaceMember[];
	notificationIsVisible: boolean;
	hideNotification: () => void;
	limits: { [key: string]: boolean };
	limitModalIsVisible: boolean;
	showLimitModal: () => void;
	hideLimitModal: () => void;
};

const steps: { [key: string]: number[] } = {
	// channels: [3, 5],
	documents: [35, 45, 50],
	guests: [7, 10],
	whiteboards: [7, 10],
};

const checkLimits = (workspaceLimitStats?: IWorkspaceLimitStats): { [key: string]: boolean } => {
	const keys = workspaceLimitStats ? Object.keys(workspaceLimitStats) : [];
	const stepsSkipped = JSON.parse(localStorage.getItem("workspaceLimitStepsSkipped") || "{}");
	const limits: { [key: string]: boolean } = {};
	if (workspaceLimitStats) {
		keys.forEach(key => {
			const limitValue = (workspaceLimitStats)[key as keyof IWorkspaceLimitStats];
			const valueForNotification = !!steps[key]?.includes(limitValue);
			const notificationSkipped = stepsSkipped[key]?.includes(limitValue);
			const isShow = valueForNotification && !notificationSkipped;
			limits[key] = isShow;
		});
	};
	return limits;
};

const SubscriptionContext = createContext<ISubscriptionContext | any>(null);

export const SubscriptionContextProvider = ({ children }: {children: React.ReactNode}) => {
  const { activeWorkspace, members } = useWorkspaceContext();
	const { data, refetch, error } = useGetSubscriptionQuery(activeWorkspace?.id);
	const [notificationIsVisible, setNotificationIsVisible] = useState<boolean>(false);
	const [limitModalIsVisible, setLimitModalIsVisible] = useState<boolean>(false);

	const limits = useMemo(() => (error || data?.subscription) ? null : checkLimits(data?.workspaceLimitStats), [data?.workspaceLimitStats, data?.subscription, error]);
	// console.log("limits: ", limits, data, data?.workspaceLimitStats);

	const isOwner = activeWorkspace?.userRole === "owner";

  const showNotification = () => setNotificationIsVisible(true);
  const hideNotification = () => setNotificationIsVisible(false);
  const showLimitModal = () => setLimitModalIsVisible(true);
  const hideLimitModal = () => setLimitModalIsVisible(false);

	const checkUpdates = () => {
		refetch()
			.then(() => {
				if (limits && Object.values(limits).some(limit => !!limit)) {
					showNotification()
				}
				startTimer(checkUpdates, 60);
			})
			.catch((err) => console.log(err));
	};

  useEffect(() => {
		if (!isUndefined(activeWorkspace?.id) && limits && !data?.subscription) checkUpdates();
  }, [limits, activeWorkspace?.id, data?.subscription]);

  return (
    <SubscriptionContext.Provider value={{
			subscription: data?.subscription,
			planInfo: data?.planInfo,
			workspaceLimitStats: data?.workspaceLimitStats,
			isOwner,
			members,
			notificationIsVisible,
			hideNotification,
			limits,
			limitModalIsVisible,
			showLimitModal,
			hideLimitModal,
		}}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);

  if (typeof context === undefined) {
    throw new Error('useSubscriptionContext must be used within SubscriptionContextProvider');
  }

  return context;
};
