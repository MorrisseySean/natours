const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const Booking = require('./../models/bookingModel')
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // Get the current tour
    const tour = await Tour.findById(req.params.tourID);

    if(!tour) return next(new AppError('No tour found', 404));
    console.log('Connecting to stripe...');
    console.log(req.protocol, req.params.tourID, req.user.id, tour.price);
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`https://www.natour.dev/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'USD',
                quantity: 1
            }
        ] 
    });
    if(!session) return new AppError('Something went wrong', 500);

    // Send to client
    res.status(200).json({
        status: 'success',
        session
    });
    
});

exports.createBookingCheckout = catchAsync(async (req, res, next) =>{
    const { tour, user, price } = req.query;

    if(!tour || !user || !price) return next();
    await Booking.create({tour, user, price});

    res.redirect(req.originalUrl.split('?')[0]);
});