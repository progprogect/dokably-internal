import { useSubscriptionContext } from "@app/context/subscriptionContext/subscriptionContext";
import { WorkspaceMember } from "@entities/models/workspaceMember";
// import { useWorkspaceContext } from "@app/context/workspaceContext/workspaceContext";
import Button from "@shared/common/Button"
import { Popover, PopoverContent, PopoverTrigger } from "@shared/uikit/popover"

interface IInviteConfirmationProps {
	confirm?: boolean;
	buttonText: string;
	newMembers: string[];
	onButtonClick: () => void;
}

export const InviteConfirmation = (props: IInviteConfirmationProps) => {
	const { subscription, members } = useSubscriptionContext();
	const memberEmails = members?.map((member: WorkspaceMember) => member?.user?.email);
	const price = subscription?.price?.value || 0;
	const period = subscription?.price?.recurringInterval === "yearly" ? "year" : "month"; 
  const subscriptionIsActive = subscription?.status === "active" && !subscription?.cancelAtPeriodEnd;
	const membersForInvite = props.newMembers.filter(member => !memberEmails.includes(member));
	const confirm = (props.confirm === undefined ? true : props.confirm) && subscriptionIsActive && membersForInvite.length;
	
	return confirm ? (
		<Popover>
			<PopoverTrigger>
				<Button
					label={props.buttonText}
					styleType='primary'
					className='invitebyemail__button text-sml !py-2.01 !w-24 full-h h-[38px]'
					onClick={confirm ? undefined : props.onButtonClick}
					disabled={!props.newMembers.length}
				/>
			</PopoverTrigger>
			<PopoverContent className='w-[300px] p-3'>
				<p className='text-[14px] mb-[6px] text-[#6598FF] font-[500]'>
					Inviting this member will increase your subscription cost by ${price * membersForInvite.length}/{period}.
				</p>
				<p className='text-[14px] mb-[12px] text-[#69696B]'>
					This happens because your current plan includes a limited number of seats, and you're about to add an additional paid member.
				</p>
				<Button
					label='Confirm and Invite'
					styleType='primary'
					className='invitebyemail__button text-sml !py-2.01 h-[38px]'
					onClick={props.onButtonClick}
				/>
			</PopoverContent>
		</Popover>
	) : (
		<Button
			label={props.buttonText}
			styleType='primary'
			className='invitebyemail__button text-sml !py-2.01 !w-24 h-[38px]'
			onClick={props.onButtonClick}
			disabled={!props.newMembers.length}
		/>
	);
}