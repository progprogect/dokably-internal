import { ISubscription } from '@app/queries/payment/useGetSubscriptionMethodQuery';
import Button from '@shared/uikit/button';
import { format } from 'date-fns';
import { ReactComponent as Logo } from '@icons/logo-blue.svg';
import "./style.css";
import { LoaderIcon } from 'react-hot-toast';
import { useState } from 'react';
import { useWorkspaceContext } from '@app/context/workspace/context';
import { useDeleteSubscription } from '@app/queries/payment/useDeleteSubscriptionQuery';
import SuccessModal from '../success-modal';
// import { useDeletePaymentMethod } from '@app/queries/payment/useDeletePaymentMethodQuery';

interface ICancel {
  subscription: ISubscription;
  setPopUp: React.Dispatch<React.SetStateAction<boolean>>;
}

const UnsubscribeModal = ({ subscription, setPopUp }: ICancel) => {
  const { planInfo, subscription: data } = subscription;
  const { activeWorkspace } = useWorkspaceContext();
  const { deleteSubscription, isPending: deleteSubscriptionIsPending } = useDeleteSubscription(`${activeWorkspace?.id}`);
  // const { deletePaymentMethod, isPending: deletePaymentMethodIsPending } = useDeletePaymentMethod(`${workspace?.id}`);
  const [useSuccess, setSuccess] = useState(false);

  const onSubscribe = async () => {
    await deleteSubscription();
    setSuccess(true);
  };

  if (useSuccess === true) {
    return <SuccessModal setSuccess={setSuccess} setPopUp={setPopUp} />
  }

  return (
    <div className='popup-success'>
      <div className='popup__window-success unsubscribe-wrapper'>
        {(deleteSubscriptionIsPending) && (
          <div className="loader">
            <LoaderIcon style={{ width: 40, height: 40 }} />
          </div>
        )}
        <div className='popup__content-success popup-unsubscribe-info'>
          <Logo className='popup__logo' />
          <h2 className='popup__header-success'>Cancel your subscription</h2>
          <p className='type' style={{ textTransform: "capitalize", marginTop: 48, marginBottom: 8 }}>{planInfo?.type}</p>
          <p>
            <b className='type'>${(data?.price?.value * (data?.price?.recurringInterval === "yearly" ? 12 : 1))?.toFixed(2)} </b>
            <span>per {data?.price?.recurringInterval === "monthly" ? "month" : "year"}</span>
          </p>
          <p>Your subscription will be canceled,  but is still available until the end of your billing period on {data?.endPeriod ? format(new Date(1970, 0, 1).setSeconds(data?.endPeriod), "MMMM d, yyyy") : ""}.</p>
          {/* <p className='popup__txt-success'>Your plan was changed.</p> */}
          <p>If you chance your mind, you can renew your subscription.</p>
          {/* <SuccessImg className='popup__img-success' /> */}
          <Button
            buttonType='primary'
            onClick={onSubscribe}
            className='popup__btn-success mb-[8px]'
          >
            Cancel subscription
          </Button>
          <Button
            buttonType='gray'
            onClick={() => {
              setPopUp(false);
            }}
            className='popup__btn-success'
          >
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribeModal;
