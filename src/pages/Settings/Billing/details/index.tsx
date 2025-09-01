import Button from '@shared/uikit/button';
import './style.css';
import { useWorkspaceContext } from '@app/context/workspace/context';
import { useEffect, useMemo, useState } from 'react';
import Dropdown from '../dropdown';
import { object, string, TypeOf } from 'zod';
// import DropdownCountries from '../dropdown-countries';
import { useCreatePaymentMethod } from '@app/queries/payment/useCreatePaymentMethodQuery';
import { StripeContainer } from '../stripeContainer';
import { ISubscription } from '@app/queries/payment/useGetSubscriptionMethodQuery';
import { format } from 'date-fns';
import { useGetPriceQuery } from '@app/queries/payment/useGetPriceQuery';
import { useCreateSubscription } from '@app/queries/payment/useCreateSubscriptionMethodQuery';

interface IBillingDetailsProps {
  subscription?: ISubscription;
}

const BillingSchema = object({
  card: string().min(16, 'Card number is required'),
  date: string().min(2, 'Date is required'),
  cvv: string().min(3, 'CVV is required'),
});

export type BillingInput = TypeOf<typeof BillingSchema>;

const BillingDetails = (props: IBillingDetailsProps) => {
  const { subscription: data } = props;
  const { activeWorkspace } = useWorkspaceContext();
  const { data: prices } = useGetPriceQuery();
  const { createPaymentMethod } = useCreatePaymentMethod(`${activeWorkspace?.id}`);
  const { createSubscription } = useCreateSubscription(`${activeWorkspace?.id}`);
  const planIsCanceled = data && data?.subscription?.cancelAtPeriodEnd;

  const [paymentMethodIsEditing, setPaymentMethodIsEditing] = useState<boolean>(false);
  const [billingIntervalIsEditing, setBillingIntervalIsEditing] = useState<boolean>(false);
  const [activeBillingInterval, setActiveBillingInterval] = useState<string>('');

  const activeInterval = useMemo(() => {
    return prices.find((price) => price.id === activeBillingInterval)?.recurringInterval || 0;
  }, [activeBillingInterval, prices]);

  const onClosePaymentMethod = () => setPaymentMethodIsEditing(false);

  const onSavePaymentMethod = async (token: string) => {
    await createPaymentMethod({ token });
    setPaymentMethodIsEditing(false);
  };

  const onSaveBillingInterval = async () => {
    await createSubscription({ priceId: activeBillingInterval });
    setBillingIntervalIsEditing(false);
  };

  useEffect(() => {
    if (data?.subscription?.price?.id) setActiveBillingInterval(data?.subscription?.price?.id);
  }, [data?.subscription?.price?.id]);

  if (!data?.subscription) {
    return null;
  }

  return (
    <div className='billingDetails'>
      <div className='billingDetails__title'>Billing details</div>
      <div className='billingDetails__info'>
        <b>
          <span style={{ textTransform: 'capitalize' }}>{data?.planInfo?.type} </span>plan
        </b>
        <div
          className='payment-info'
          style={{ maxWidth: 750 }}
        >
          {planIsCanceled
            ? `You canceled the current Unlimited Plan. Your team will be downgraded to our free Forever Plan and no longer billed starting ${data?.subscription?.cancelAt ? format(new Date(1970, 0, 1).setSeconds(data?.subscription?.cancelAt), 'MMMM d, yyyy') : ''}.`
            : `$${data?.subscription?.price?.value * (activeInterval === 'yearly' ? 12 : 1)} per ${activeInterval === 'yearly' ? 'year' : 'month'} and will renew on ${data?.subscription?.endPeriod ? format(new Date(1970, 0, 1).setSeconds(data?.subscription?.endPeriod), 'MMMM d, yyyy') : ''}.`}
        </div>
      </div>
      <div className='details__userinfo'>
        <div
          className='details__userinfo-line'
          style={{ height: paymentMethodIsEditing ? 'auto' : '' }}
        >
          <p className='line__name'>Payment method</p>
          {paymentMethodIsEditing ? (
            <div
              className='line__info'
              style={{
                flexDirection: paymentMethodIsEditing ? 'column' : 'row',
                alignItems: paymentMethodIsEditing ? 'flex-end' : 'center',
                margin: paymentMethodIsEditing ? '12px 0' : '',
              }}
            >
              <StripeContainer
                onSavePaymentMethod={onSavePaymentMethod}
                onClosePaymentMethod={onClosePaymentMethod}
              />
            </div>
          ) : (
            <div className='line__info'>
              <p className='line__info-txt'>
                {data?.subscription
                  ? `${data?.subscription?.paymentMethod?.brand} ending at ${data?.subscription?.paymentMethod?.lastFourCardDigits}`
                  : null}
              </p>
              <Button
                buttonType='gray'
                onClick={() => setPaymentMethodIsEditing(true)}
              >
                Update
              </Button>
            </div>
          )}
        </div>
        <div className='details__userinfo-line'>
          <p className='line__name'>Billing interval</p>
          {billingIntervalIsEditing ? (
            <div className='line__info'>
              <p className='line__info-txt'>
                <Dropdown
                  interval={activeBillingInterval}
                  setInterval={setActiveBillingInterval}
                  prices={prices}
                />
              </p>
              <Button
                buttonType='primary'
                onClick={onSaveBillingInterval}
              >
                Save
              </Button>
            </div>
          ) : (
            <div className='line__info'>
              <p
                className='line__info-txt'
                style={{ textTransform: 'capitalize' }}
              >
                {data?.subscription?.price?.recurringInterval}
              </p>
              <Button
                buttonType='gray'
                onClick={() => setBillingIntervalIsEditing(true)}
                disabled={planIsCanceled}
              >
                Update
              </Button>
            </div>
          )}
        </div>
        {/* <div className='details__userinfo-line'>
          <p className='line__name'>Billing email</p>
          <div className='line__info'>
            <p className='line__info-txt'>dzikan@gmail.com</p>
            <Button buttonType='gray' onClick={() => setBillingEmailIsEditing(true)}>
              Update
            </Button>
          </div>
        </div>
        <div className='details__userinfo-line'>
          <p className='line__name'>Your address</p>
          <div className='line__info'>
            <p className='line__info-txt'>Alexandra Dzikan, PT</p>
            <Button buttonType='gray' onClick={() => {}}>
              Update
            </Button>
          </div>
        </div> */}
      </div>

      {/* <div className='billingDetails__info'>
        <p className='info__header'>Free plan</p>
        <p className='info__txt'>$0 per month</p>
      </div> */}
    </div>
  );
};

export default BillingDetails;
