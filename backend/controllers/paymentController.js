// controllers/paymentController.js
// Stripe payment intent creation and webhook reconciliation.

const Stripe = require("stripe");
const Order = require("../models/Order");

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const canAccessOrder = (order, user) => {
  if (!order || !user) return false;
  if (user.role === "admin") return true;
  if (user.role === "customer") return order.user.toString() === user.id;
  if (user.role === "restaurant") {
    return order.restaurant?.owner?.toString() === user.id;
  }
  return false;
};

const createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured on the server",
      });
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const order = await Order.findById(orderId).populate("restaurant", "owner");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!canAccessOrder(order, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you cannot pay for this order",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "This order has already been paid",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot pay for a cancelled order",
      });
    }

    let intent;
    if (order.paymentId) {
      intent = await stripe.paymentIntents.retrieve(order.paymentId);
    }

    if (!intent || ["canceled", "succeeded"].includes(intent.status)) {
      intent = await stripe.paymentIntents.create({
        amount: Math.round(order.totalAmount * 100),
        currency: "inr",
        metadata: {
          orderId: order._id.toString(),
          userId: order.user.toString(),
        },
        automatic_payment_methods: { enabled: true },
      });
      order.paymentId = intent.id;
      await order.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        client_secret: intent.client_secret,
        order,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error creating payment intent",
    });
  }
};

const handleStripeWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(500).json({
      success: false,
      message: "Stripe is not configured on the server",
    });
  }

  const signature = req.headers["stripe-signature"];
  let event = req.body;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else if (Buffer.isBuffer(req.body)) {
      event = JSON.parse(req.body.toString("utf8"));
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const orderId = intent.metadata?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "paid",
          status: "confirmed",
          paymentId: intent.id,
        });
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object;
      const orderId = intent.metadata?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "failed",
          paymentId: intent.id,
        });
      }
    }

    return res.status(200).json({ success: true, data: { received: true } });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Webhook signature verification failed",
    });
  }
};

module.exports = {
  createPaymentIntent,
  handleStripeWebhook,
};
