import './style.css';
import { ReactComponent as Logo } from '@icons/logo-blue.svg';
import { ReactComponent as Close } from '@icons/close.svg';
import { ReactComponent as Check } from '@icons/check-green.svg';
import { ReactComponent as Visa } from '@icons/visa.svg';
import { ReactComponent as MasterCard } from '@icons/mastercard.svg';
import { ReactComponent as Amex } from '@icons/amex.svg';
import { ReactComponent as DCI } from '@icons/DCIbank.svg';
import Dropdown from '../dropdown';
import { useEffect, useMemo, useState } from 'react';
import SuccessModal from '../success-modal';
import { useGetPriceQuery } from '@app/queries/payment/useGetPriceQuery';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
	CardCvcElement,
	CardExpiryElement,
	CardNumberElement,
	useElements,
	useStripe,
} from "@stripe/react-stripe-js";
import styles from "../paymentForm/styles.module.scss";
import classNames from 'classnames';
import { useCreatePaymentMethod } from '@app/queries/payment/useCreatePaymentMethodQuery';
import { useWorkspaceContext } from '@app/context/workspace/context';
import { useCreateSubscription } from '@app/queries/payment/useCreateSubscriptionMethodQuery';
import { LoaderIcon } from 'react-hot-toast';
import { useSubscriptionContext } from '@app/context/subscriptionContext/subscriptionContext';

interface IPopup {
  setPopup: React.Dispatch<React.SetStateAction<boolean>>;
  price: number;
  discount: number;
  members: number;
  paymentMethodExists?: boolean;
}

// const BillingSchema = object({
//   name: string().min(1, 'Name is required'),
//   adress: string().min(1, 'Adress is required'),
//   city: string().min(1, 'City is required'),
//   zip: string().min(1, 'Zip code is required'),
//   state: string().min(1, 'State or Province is required'),
//   card: string().min(16, 'Card number is required'),
//   date: string().min(2, 'Date is required'),
//   cvv: string().min(3, 'CVV is required'),
// });

// export type BillingInput = TypeOf<typeof BillingSchema>;

const PopupUpgradeChild = ({ setPopup, price, members, paymentMethodExists }: IPopup) => {
  const stripe = useStripe();
  const elements = useElements();

  const { activeWorkspace } = useWorkspaceContext();
  const { hideNotification } = useSubscriptionContext();
  const { data: prices } = useGetPriceQuery();
  const { createPaymentMethod, isPending: paymentMethodIsPending } = useCreatePaymentMethod(`${activeWorkspace?.id}`);
  const { createSubscription, isPending: subscriptionIsPending } = useCreateSubscription(`${activeWorkspace?.id}`);
  const [useSuccess, setSuccess] = useState(false);
  const [activeBillingInterval, setActiveBillingInterval] = useState<string>("");

  // const discount = useMemo(() => {
  //   return prices.find(price => price.id === activeBillingInterval)?.recurringInterval === "yearly" ? 20 : 0;
  // }, [activeBillingInterval, prices])

  const activePrice = useMemo(() => {
    return prices.find(price => price.id === activeBillingInterval)?.value || 0;
  }, [activeBillingInterval, prices]);

  const activeInterval = useMemo(() => {
    return prices.find(price => price.id === activeBillingInterval)?.recurringInterval || 0;
  }, [activeBillingInterval, prices]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (paymentMethodExists) {
      await createSubscription({ priceId: activeBillingInterval });
      setSuccess(true);
      return;
    }
    if (!stripe || !elements) {
      return;
    }
    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) return;
    const { token, error } = await stripe.createToken(cardNumberElement);
    console.log("[CreateToken]", token, error);
		if (token?.id) {
      await createPaymentMethod({ token: token?.id });
      await createSubscription({ priceId: activeBillingInterval });
      hideNotification();
      setSuccess(true);
		}
  };

  useEffect(() => {
    if (prices.length) {
      setActiveBillingInterval(prices?.find(p => p?.value === price)?.id || prices[0]?.id);
    };
  }, [prices, price]);

  if (useSuccess === true) {
    return <SuccessModal setSuccess={setSuccess} setPopUp={setPopup} />
  }

  return (
    <form onSubmit={handleSubmit}>
      {(paymentMethodIsPending || subscriptionIsPending) && (
        <div className="loader-wrapper">
          <LoaderIcon style={{ width: 40, height: 40 }} />
        </div>
      )}
      <div className='popup__window' style={{ height: paymentMethodExists ? 450 : undefined }}>
        {!paymentMethodExists && (
          <div className='popup__info'>
            <Logo className='popup__logo' />
            <p className='popup__offertxt'>Upgrade to Unlimited Premium</p>
            <p className='popup__description'>
              Sub-heading or some descriptional text
            </p>
            <div className='popup__paymentmethod'>
              <p className='popup__paymentmethod_header'>Payment method</p>
              <div className='popup__paymentmethod_cardlist'>
                <p className='cardlist__txt'>Credit or debit card</p>
                <div className='cardlist__logos'>
                  <Visa />
                  <MasterCard />
                  <Amex />
                  <DCI />
                </div>
              </div>
            </div>

            <div className={styles.wrapper}>
              <label>
                Card number
                <CardNumberElement
                  className={classNames(styles.input, styles.inputCardNumber)}
                />
              </label>
              <label className="ml-[12px] mr-[12px]">
                Expiration date
                <CardExpiryElement
                  className={classNames(styles.input, styles.inputExpiryNumber)}
                />
              </label>
              <label>
                Security code
                <CardCvcElement
                  className={classNames(styles.input, styles.inputCvcNumber)}
                />
              </label>
            </div>
          </div>
        )}

        <div className='popup__totalprice'>
          <div className='flex justify-end'>
            <button className='popup__close' onClick={() => setPopup(false)}>
              <Close className='text-[#29282C]' />
            </button>
          </div>
          <div className='popup__timeoptions'>
            <p className='popup__timeoptions_txt'>Billing interval</p>
            <Dropdown
              interval={activeBillingInterval}
              setInterval={setActiveBillingInterval}
              prices={prices}
            />
          </div>
          <div className='popup__orderdetails'>
            <p className='popup__sum'>Order Summary</p>
            <div className='popup__plandetails'>
              <div>
                <p className='popup__plandetails_header'>
                  Unlimited plan ({members} member{members > 1 ? "s" : ""})
                </p>
                <p className='popup__plandetails_txt'>
                  {/* {activePrice * (activeInterval === "yearly" ? 12 : 1)}$ / member / {activeInterval === "yearly" ? "year" : "month"} — Billed {activeInterval} */}
                  ${activePrice} per month × {members} member{members > 1 ? "s" : ""} {activeInterval === "yearly" ? "× 12 months" : ""}
                </p>
              </div>
              <p className='popup__firstprice'>${activePrice * members * (activeInterval === "yearly" ? 12 : 1)}</p>
            </div>
            {/* <div className='popup__discount'>
              <p className='popup__discount_txt'>Discount</p>
              <p className='popup__discount_precent'>-{discount}%</p>
            </div> */}
            <div className='popup__border'></div>
            <div className='popup__total'>
              <div className='popup__total_txt'>Total</div>
              <div className='popup__total_price'>
                ${activePrice * members * (activeInterval === "yearly" ? 12 : 1)}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              type='submit'
              form='billingForm'
              className='popup__sumbit'
              disabled={!stripe || !activeBillingInterval}
            >
              Go Unlimited
            </button>
            <div className='popup__guarantee'>
              <Check />
              <p>30 days money back guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

const stripePromise = loadStripe("pk_test_51RBjpORpxov9odTiZ2Gfrml1LoTuA97KlYCINLsBwibyfHoXjruvsHJbZO3eelEKKnBRlUMnU61p09meqbkmCOqF00EwgRVbGq");
const PopupUpgradeWrapper = ({children}: { children: JSX.Element }) => {
  return (
    <div className='popup'>
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    </div>
  )
}

const PopupUpgrade = (props: IPopup) => {
  return (
    <PopupUpgradeWrapper>
      <PopupUpgradeChild {...props} />
    </PopupUpgradeWrapper>
  )
}

export default PopupUpgrade;
