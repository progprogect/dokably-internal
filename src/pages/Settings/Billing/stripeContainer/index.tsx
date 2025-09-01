import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentForm } from "../paymentForm";

const stripePromise = loadStripe("pk_test_51RBjpORpxov9odTiZ2Gfrml1LoTuA97KlYCINLsBwibyfHoXjruvsHJbZO3eelEKKnBRlUMnU61p09meqbkmCOqF00EwgRVbGq");

interface IStripeContainerProps {
	onSavePaymentMethod: (token: string) => void;
	onClosePaymentMethod: () => void;
	hiddenButtons?: boolean;
}

export const StripeContainer = (props: IStripeContainerProps) => {
	return (
		<Elements stripe={stripePromise}>
			<PaymentForm
				onSavePaymentMethod={props.onSavePaymentMethod}
				onClosePaymentMethod={props.onClosePaymentMethod}
				hiddenButtons={props.hiddenButtons}
			/>
		</Elements>
	)
};
