import React, { useEffect, useMemo, useState } from 'react';
import './style.css';
// import { ReactComponent as CheckIcon } from '@icons/check.svg';
// import { ReactComponent as Logo } from '@icons/logo-black.svg';
// import { ReactComponent as LogoSelected } from '@icons/logo-selected.svg';
import Button from '@shared/uikit/button';
import PopupUpgrade from '../popup-upgrade';
import UnsubscribeModal from '../unsubscribe-modal';
import { useGetSubscriptionQuery } from '@app/queries/payment/useGetSubscriptionMethodQuery';
import { useWorkspaceContext } from '@app/context/workspace/context';
import { useGetPriceQuery } from '@app/queries/payment/useGetPriceQuery';
import { useGetSubscriptionPlanQuery } from '@app/queries/payment/useGetSubscriptionPlanQuery';
import classNames from 'classnames';
import { Check, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Upgrade = () => {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspaceContext();
  const { data: plansInfo } = useGetSubscriptionPlanQuery();
  const { data, isPending } = useGetSubscriptionQuery(activeWorkspace?.id);
  const { data: prices } = useGetPriceQuery();
  const currentInterval = data?.subscription?.price?.recurringInterval || "monthly";
  // const currentPriceId = data?.subscription?.price?.id;

  const [periodState, setPeriodState] = useState("");
  const [upgradePopup, setUpgradePopup] = useState(false);
  const [unsubscribePopup, setUnsubscribePopup] = useState(false);

  // const activePrice = useMemo(() => prices.find(price => price.id === currentPriceId)?.value, [currentPriceId, prices]);
  const activePlanIndex = isPending ? null : (data?.subscription ? 1 : 0);
  const planPrice = useMemo(() => prices.find(price => price.recurringInterval === periodState)?.value, [prices, periodState]);
  const planIsCanceled = data && data?.subscription?.cancelAtPeriodEnd;
  const paymentMethodExists = data && !!data?.subscription?.paymentMethod;

  const openUpgradePopup = () => setUpgradePopup(true);
  const openUnsubscribePopup = () => setUnsubscribePopup(true);

  useEffect(() => {
    if (currentInterval) setPeriodState(currentInterval);
  }, [currentInterval]);

  return (
    <div className='Upgrade'>
      {upgradePopup && (
        <PopupUpgrade
          setPopup={setUpgradePopup}
          price={planPrice || 0}
          members={activeWorkspace?.numberOfMembers || 0}
          discount={0}
          paymentMethodExists={paymentMethodExists}
        />
      )}
      {unsubscribePopup && data && (
        <UnsubscribeModal
          subscription={data}
          setPopUp={setUnsubscribePopup}
        />
      )}
      <div className='upgrade__header'>
        <h2 className='upgrade__h2'>Upgrade</h2>
      </div>
      <div className='upgrade__variants'>
        <div className="variant">
          <div className="variant__title" style={{ textAlign: "left" }}>
            <h3 style={{ justifyContent: "flex-start" }}>Pay</h3>
            <p>
              <fieldset disabled={data && data?.planInfo?.type === "unlimited"}>
                <div>
                  <input checked={periodState === "monthly"} onChange={(e: any) => setPeriodState(e.target.value)} type="radio" id="monthly" value="monthly" name="pay" />
                  <label htmlFor="monthly">Monthly</label>
                </div>
                <div>
                  <input checked={periodState === "yearly"} onChange={(e: any) => setPeriodState(e.target.value)} type="radio" id="yearly" value="yearly" name="pay" />
                  <label htmlFor="yearly">Yearly <span>save 25%</span></label>
                </div>
              </fieldset>
            </p>
          </div>
        </div>
        {plansInfo && plansInfo.titles.map((title, index) => (
          <div key={index} className={classNames("variant", { "active": index === activePlanIndex })}>
            <div className="variant__title">
              <h3>
                {plansInfo.subtitles[index]}
                {planIsCanceled && index === activePlanIndex && (
                  <span className='coming-soon' style={{ position: "static", marginLeft: 6 }}>
                    {/* Current plan */}
                    Canceled
                  </span>
                )}
              </h3>
              <p>{plansInfo.descriptions[index]}</p>
            </div>
            <div className="variant__price">
              <p className="price">
                {planPrice ? title.replace("{{price}}", `$${planPrice?.toFixed(2)}`) : ""}
                {/* {index === 1 ? (planPrice ? `$${planPrice?.toFixed(2)}` : "") : title} */}
              </p>
            </div>
            <div className="variant__action">
              {/* {(index === activePlanIndex) && !planIsCanceled && ( */}
              {(index === activePlanIndex) && (
                <Button
                  buttonType='primary'
                  onClick={() => navigate('/settings/current-plan')}
                  className='upgrade__btn'
                >
                  Current plan
                </Button>
              )}
              {/* {(index === activePlanIndex) && planIsCanceled && (
                <Button
                  buttonType='primary'
                  onClick={openUpgradePopup}
                  className='upgrade__btn filled'
                >
                  Re-activate
                </Button>
              )} */}
              {title === "Free" && (index !== activePlanIndex) && (
                <Button
                  buttonType='primary'
                  onClick={openUnsubscribePopup}
                  className='upgrade__btn'
                  disabled={planIsCanceled}
                >
                  Downgrade
                </Button>
              )}
              {title === "{{price}}" && (index !== activePlanIndex) && (
                <Button
                  buttonType='primary'
                  onClick={openUpgradePopup}
                  className='upgrade__btn filled'
                >
                  Upgrade
                </Button>
              )}
              {title === "Let's talk" && (index !== activePlanIndex) && (
                <Button
                  buttonType='primary'
                  onClick={openUpgradePopup}
                  className='upgrade__btn filled'
                >
                  Contact us
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="upgrade__information">
          {plansInfo && plansInfo.params.map((param, index) => (
            <React.Fragment key={index}>
              <div className="usage-row">
                <div className='title'>{param.title}</div>
                {([...new Array(plansInfo.titles.length)]).map((_, index) => (
                  <div key={index} className={classNames({ "active": index === activePlanIndex })}/>
                ))}
              </div>
              {param.items.map((item, index) => (
                <div key={index} className="usage-row" style={{ borderBottom: index === param.items.length - 1 ? 0 : undefined }}>
                  <div>{item.name}</div>
                  {item.values.map((value, index) => (
                    <div key={index} className={classNames({ "active": index === activePlanIndex })}>
                      {typeof value === "boolean"
                        ? (value ? <Check /> : <Minus />)
                        : value
                      }
                    </div>
                  ))}
                </div>
              ))}
            </React.Fragment>
          ))}
      </div>
    </div>
  );
};

export default Upgrade;
