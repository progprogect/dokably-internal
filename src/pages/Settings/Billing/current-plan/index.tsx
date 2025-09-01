import Button from '@shared/uikit/button';
import './style.css';
// import '../details/style.css';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as LogoSelected } from '@icons/logo-selected.svg';
// import { useGetPriceQuery } from '@app/queries/payment/useGetPriceQuery';
// import { useEffect } from 'react';
// import { usePutBillingEmail } from '@app/queries/payment/usePutBillingEmailQuery';
import { useWorkspaceContext } from '@app/context/workspace/context';
import BillingDetails from '../details';
import { useGetSubscriptionQuery } from '@app/queries/payment/useGetSubscriptionMethodQuery';
import { LoaderIcon } from 'react-hot-toast';
import { useGetPaymentInvoicesQuery } from '@app/queries/payment/useGetPaymentInvoicesQuery';
import { format } from 'date-fns';

const CurrentPlan = () => {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspaceContext();
  const { data, isPending } = useGetSubscriptionQuery(activeWorkspace?.id);
  const { data: invoices } = useGetPaymentInvoicesQuery(activeWorkspace?.id);
  const isUnlimited = data?.planInfo?.type === 'unlimited';
  const planIsCanceled = data && data?.subscription?.cancelAtPeriodEnd;

  // const onSubscribe = async () => {
  //   const priceId = "484488eb-e653-4899-9794-3062adcbbe66";
  //   await createSubscription({ priceId });
  // }

  return (
    <div className='currentplan'>
      <h2 className='currentplan__header'>Current plan</h2>
      {isPending ? (
        <LoaderIcon style={{ width: 40, height: 40 }} />
      ) : (
        <>
          <div className='currentplan__userplan'>
            <div className='currentplan__pricing'>
              <p className='pricing__name flex'>
                {isUnlimited && <LogoSelected />}
                {data?.planInfo?.type || ''}
                {planIsCanceled && ' (canceled)'}
              </p>
              {/* <p className='pricing__tariff'>$0 / month per user</p> */}
            </div>
            <div className='currentplan__button'>
              <Button
                buttonType='primary'
                onClick={() => navigate('/settings/upgrade')}
                className='currentplan__upgradebtn'
              >
                {isUnlimited ? 'Manage plan' : 'Upgrade'}
              </Button>
            </div>
          </div>
          <div className='currentplan__info'>
            <div className='planinfo__doc'>
              <p className='info__header'>Doc usage</p>
              <p className='info__txt'>{isUnlimited ? 'Unlimited' : data?.planInfo?.docs || '—'}</p>
            </div>
            <div className='planinfo__members'>
              <p className='info__header'>Members</p>
              <p className='info__txt'>{isUnlimited ? 'Unlimited' : data?.planInfo?.members || '—'}</p>
            </div>
            <div className='planinfo__storage'>
              <p className='info__header'>File storage</p>
              <p className='info__txt'>
                {data?.planInfo?.storageSize ? `Up to ${data?.planInfo?.storageSize} per user` : '—'}
              </p>
              {data?.planInfo?.type === 'free' && (
                <p className='info__description'>
                  On the Free plan, your storage quota for images and attachments is limited.
                </p>
              )}
            </div>
            <div className='planinfo__channel'>
              <p className='info__header'>Channel</p>
              <p className='info__txt'>{isUnlimited ? 'Unlimited' : data?.planInfo?.channels || '—'}</p>
            </div>
            <div className='planinfo__whiteboard'>
              <p className='info__header'>Whireboard usage</p>
              <p className='info__txt'>{isUnlimited ? 'Unlimited' : data?.planInfo?.whiteboards || '—'}</p>
            </div>
            <div className='planinfo__ai'>
              <p className='info__header'>AI free usage</p>
              <p className='info__txt'>{data?.planInfo?.aiFreeUsage ? `Up to ${data?.planInfo?.aiFreeUsage}` : '—'}</p>
            </div>
          </div>
          <BillingDetails subscription={data} />
          <div className="invoiceHistory">
            <div className='invoiceHistory__title'>Invoice history</div>
            <div className='invoiceHistory__info'>
              {/* <p className='info__description'>You have no invoice yet.</p> */}

              {invoices?.length ? invoices.map(invoice => ( 
                <div className='details__history-line'>
                {/* <p className='line__date'>October 6, 2022</p> */}
                <p className='line__date'>{format(invoice.createdAt, 'MMMM d, yyyy')}</p>
                <div className='line__rightpart'>
                  <div className='line__paid'>
                    <p className='line__paid_txt' style={{ textTransform: "capitalize" }}>{invoice.status}</p>
                    <p className='line__paid_txt'>${(invoice.amount/100).toFixed(2)}</p>
                  </div>
                  <a href={invoice.pdfUrl} target="_blank">
                    <Button
                      buttonType='transparent'
                      onClick={() => {}}
                      className='line__btn'
                    >
                      View invoice
                    </Button>
                  </a>
                </div>
              </div>
              )) : <p className='info__description'>You have no invoice yet.</p>}
              {/* <div className='details__history-line'>
                <p className='line__date'>October 6, 2022</p>
                <div className='line__rightpart'>
                  <div className='line__paid'>
                    <p className='line__paid_txt'>Paid</p>
                    <p className='line__paid_txt'>$1.23</p>
                  </div>
                  <Button
                    buttonType='transparent'
                    onClick={() => {}}
                    className='line__btn'
                  >
                    View invoice
                  </Button>
                </div>
              </div>
              <div className='details__history-line'>
                <p className='line__date'>September 26, 2022</p>
                <div className='line__rightpart'>
                  <div className='line__paid'>
                    <p className='line__paid_txt'>Paid</p>
                    <p className='line__paid_txt'>$9.02</p>
                  </div>
                  <Button
                    buttonType='transparent'
                    onClick={() => {}}
                    className='line__btn'
                  >
                    View invoice
                  </Button>
                </div>
              </div> */}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CurrentPlan;
