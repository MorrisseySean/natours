import axios from 'axios';
import { showAlert } from './alerts'
const stripe = Stripe('pk_test_YtF6aY9oBvEAK59SdvcV3FXV005rMWjH81');

export const bookTour = async tourId => {
    try {
        // Get checkout session from API endpoint
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
        // Create a checkout form & charge the credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch(err) {
        showAlert('error', err);
    }
    
}