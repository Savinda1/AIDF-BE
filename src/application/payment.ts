import { Request, Response } from "express";
import util from "util";
import Booking from "../infrastructure/schemas/Booking";
import stripe from "../infrastructure/stripe"
import Hotel from "../infrastructure/schemas/Hotel";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL as string;

async function fulfillCheckout(sessionId: string) {
  console.log("Fulfilling Checkout Session " + sessionId);

  // Retrieve the Checkout Session from the API with line_items expanded
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });
  console.log(
    util.inspect(checkoutSession, false, null, true /* enable colors */)
  );

  const booking = await Booking.findById(checkoutSession.metadata?.bookingId);
  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.paymentStatus !== "PENDING") {
    throw new Error("Payment is not pending");
  }

  // Check the Checkout Session's payment_status property
  if (checkoutSession.payment_status === "paid") {
    await Booking.findByIdAndUpdate(booking._id, {
      paymentStatus: "PAID",
    });
  }
}

export const handleWebhook = async (req: Request, res: Response) => {
  const payload = req.body;
  const sig = req.headers["stripe-signature"] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await fulfillCheckout(event.data.object.id);
      res.status(200).send();
      return;
    }
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const bookingId = req.body.bookingId;
    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.paymentStatus === "PAID") {
      throw new Error("Booking is already paid");
    }

    const hotel = await Hotel.findById(booking.hotelId);
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    if (!hotel.stripePriceId) {
      throw new Error("Stripe price ID is missing for this hotel");
    }

    // Calculate number of nights
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: [{
        price: hotel.stripePriceId,
        quantity: numberOfNights,
      }],
      mode: "payment",
      return_url: `${FRONTEND_URL}/booking/complete?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        bookingId: bookingId,
      },
    });

    res.send({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ 
      message: "Failed to create checkout session", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
};

export const retrieveSessionStatus = async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.session_id as string;
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    const booking = await Booking.findById(checkoutSession.metadata?.bookingId);
    
    if (!booking) {
      throw new Error("Booking not found");
    }

    const hotel = await Hotel.findById(booking.hotelId);
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    res.status(200).json({
      bookingId: booking._id,
      booking: booking,
      hotel: hotel,
      status: checkoutSession.status,
      customer_email: checkoutSession.customer_details?.email,
      paymentStatus: booking.paymentStatus,
    });
  } catch (error) {
    console.error("Error retrieving session status:", error);
    res.status(500).json({
      message: "Failed to retrieve session status",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};