import {
	CardCvcElement,
	CardExpiryElement,
	CardNumberElement,
	useElements,
	useStripe,
} from "@stripe/react-stripe-js";
import styles from "./styles.module.scss";
import classNames from "classnames";

interface IPaymentFormProps {
	onSavePaymentMethod: (token: string) => void;
	onClosePaymentMethod: () => void;
	hiddenButtons?: boolean;
}

export const PaymentForm = (props: IPaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) return;

    const { token, error } = await stripe.createToken(cardNumberElement);
	
    console.log("[CreateToken]", token, error);
		if (token?.id) {
			props.onSavePaymentMethod(token?.id);
		}
  };

	return (
		<form onSubmit={handleSubmit}>
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
			{!props.hiddenButtons && (
				<div className={styles.buttonsWrapper}>
					<button
						className={styles.button}
						onClick={props.onClosePaymentMethod}
					>
						Cancel
					</button>
					<button
						type="submit"
						className={classNames(styles.button, styles.saveButton)}
						disabled={!stripe}
					>
						Save
					</button>
				</div>
			)}
		</form>
	)
};
