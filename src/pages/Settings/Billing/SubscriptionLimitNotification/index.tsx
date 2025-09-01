import { useSubscriptionContext } from '@app/context/subscriptionContext/subscriptionContext';
import { IPlanInfo, IWorkspaceLimitStats } from '@app/queries/payment/useGetSubscriptionMethodQuery';
import { ReactComponent as Close } from '@icons/close.svg';
import Button from "@shared/uikit/button";
import { useNavigate } from "react-router-dom";

const getMessages = (
	limits: { [key: string]: boolean },
	workspaceLimitStats: IWorkspaceLimitStats,
	planInfo: IPlanInfo,
) => {
	const messages: { type: string; title: string; description: string; isMax: boolean }[]  = [];
	if (limits) {
		Object.keys(limits).forEach(key => {
			if (!!limits[key]) {
				const planKey = key === "documents" ? "docs" : key;
				messages.push({
					type: key,
					title: `You've used ${workspaceLimitStats[key as keyof IWorkspaceLimitStats]} / ${planInfo[planKey as keyof IPlanInfo]} ${key}`,
					description: `To add unlimited ${key}`,
					isMax: workspaceLimitStats[key as keyof IWorkspaceLimitStats] === planInfo[planKey as keyof IPlanInfo],
				});
			};
		});
	}
	return messages;
};

export const SubscriptionLimitNotification = () => {
  const navigate = useNavigate();
	const { isOwner, notificationIsVisible, hideNotification, limits, planInfo, workspaceLimitStats } = useSubscriptionContext();
	const messages = getMessages(limits, workspaceLimitStats, planInfo);

	const closeNotification = (type: string) => {
		const stepsSkipped = JSON.parse(localStorage.getItem("workspaceLimitStepsSkipped") || "{}");
		const result = { ...stepsSkipped, [type]: [...new Set([ ...(stepsSkipped[type] || []), workspaceLimitStats[type] ])] };
		localStorage.setItem("workspaceLimitStepsSkipped", JSON.stringify(result));
		hideNotification();
	};

	return notificationIsVisible && messages.length ? (
		<>
			{messages.map(message => (
				<div key={message.type} className="p-3 mt-3 text-[14px] border-t border-[#EAEAEA]">
					<div className='flex justify-end'>
						<Close
							className='text-[#D4D4D5] cursor-pointer'
							onClick={() => closeNotification(message.type)}
						/>
					</div>
					<p className="text-[#69696B]">
						<span className={message.isMax ? "text-[#FF5065]" : "text-[#6598FF]"}>{message.title}</span>
						<br />
						{message.description}
					</p>
					{isOwner && (
						<Button
							buttonType="custom"
							onClick={() => navigate('/settings/upgrade')}
							className='mt-3 w-full text-[#6598FF] bg-[#CFDFFF]'
						>
							Upgrade
						</Button>
					)}
				</div>
			))}
		</>
	) : null;
};
