const path = require("path");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const axios = require("axios");

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const globalError = require("./middlewares/errormiddleware");

// notifaction
const http = require("http");
const socketIo = require("socket.io");

// Routes
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/adminRoutes");
const walletRoutes = require("./routes/walletRoutes");
const transactionsRoutes = require("./routes/transactitonsRoutes");
const sallaRoutes = require("./routes/sallaRoutes");
const shopifyRoutes = require("./routes/shopifyRoutes");
const zidRoutes = require("./routes/zidRoutes");
const wooCommerceRoutes = require("./routes/woocommerceRoutes");
const mnasatiRoutes = require("./routes/mnasatiRoutes");
const clientAddressRoutes = require("./routes/clientAddressRoutes");
const orderManuallyRoutes = require("./routes/orderManuallyRoutes");
const packageRoutes = require("./routes/packageRoutes");
const addressRotues = require("./routes/addressRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// sysytem routes
const employeeRoutes = require("./system/routes/employeeRoutes");
const salaryModifactionRoutes = require("./system/routes/salaryModificationRoutes");
const salaryRoutes = require("./system/routes/salaryRoutes");

// schedule salary processing
const { scheduleSalaryProcessing } = require("./utils/scheduler");
scheduleSalaryProcessing();

//  run function schedule
require("./controllers/sallaController");
require("./controllers/shopifyController");
require("./controllers/zidController");
require("./controllers/wooCommerceController");
require("./controllers/mnasatiController");

// expess app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 4000;

// توصيل MongoDB
mongoose
  .connect(process.env.DATABASE_URL)
  .then((conn) => {
    console.log(`Database Connected: ${conn.connection.host}`);
  })
  .catch((err) => {
    console.log(`Database Error: ${err.message}`);
    process.exit(1);
  });

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

app.use(cors());
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.static("public"));



// notification middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware لتحليل JSON

app.use(express.static(path.join(__dirname, "uploads")));

const Store = require("./models/Store");
const Order = require("./models/Order");
const Notification = require("./models/notificationModel");
const crypto = require("crypto");

app.post("/api/salla/webhook", async (req, res) => {
  try {
    console.log("webhook is run mahmoud ..........");
    const io = req.io;

    const event = req.body;

    if (event.event !== "order.created") {
      return res.status(200).json({ message: "تم تجاهل الحدث" });
    }

    const orderId = event.data?.id;
    let orderData = event.data;

    const storeId = event.store_id || event.data?.store?.id;
    const store = await Store.findOne({ platform: "salla", storeId });

    if (!store) {
      return res
        .status(404)
        .json({ error: "المتجر غير موجود في قاعدة البيانات" });
    }

    const accessToken = store.accessToken;

    if (!orderData && orderId) {
      try {
        const response = await axios.get(
          `https://api.salla.dev/admin/v2/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        orderData = response.data.data;
      } catch (fetchErr) {
        console.error("فشل في جلب بيانات الطلب من سلة:", fetchErr);
        return res.status(500).json({ error: "تعذر جلب بيانات الطلب" });
      }
    }

    const customerId = store.customer;

    await Order.findOneAndUpdate(
      { platform: "salla", id: orderData.id },
      {
        platform: "salla",
        id: orderData.id,
        storeId: store.storeId,

        total: {
          amount: orderData.amounts?.total?.amount || "",
          currency: orderData.amounts?.total?.currency || "",
        },

        status: {
          name: orderData.status?.name || "",
          slug: orderData.status?.slug || "",
        },

        payment_method:
          orderData.payment_method?.toLowerCase() === "cod" ? "COD" : "Prepaid",

        payment_actions: {
          paid_amount: {
            amount:
              orderData.payment_actions?.refund_action?.paid_amount?.amount ||
              "",
            currency:
              orderData.payment_actions?.refund_action?.paid_amount?.currency ||
              "",
          },
        },

        items:
          orderData.items?.map((item) => ({
            name: item.name || "",
            quantity: item.quantity || 0,
            price: item.amounts?.price_without_tax?.amount || "",
          })) || [],

        customer: {
          id: orderData.customer?.id || "",
          full_name: orderData.customer?.full_name || "",
          first_name: orderData.customer?.first_name || "",
          last_name: orderData.customer?.last_name || "",
          mobile: orderData.customer?.mobile?.toString() || "",
          email: orderData.customer?.email || "",
          city: orderData.customer?.city || "",
          country: orderData.customer?.country || "",
          currency: orderData.customer?.currency || "",
          location: orderData.customer?.location || "",
        },
        Customer: customerId,
      },
      { upsert: true, new: true }
    );

    const notification = new Notification({
      customerId,
      type: "order",
      message: `New order #${orderData.id} has been placed. Total: ${orderData.total?.amount} ${orderData.total?.currency}`,
    });

    await notification.save();

    if (notification.customerId) {
      io.to(`user_${notification.customerId}`).emit(
        "new_notification",
        notification
      );
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("خطأ في معالجة Webhook سلة:", error);
    return res.status(500).json({ error: "فشل في معالجة Webhook الطلب" });
  }
});

app.post(
  "/api/shopify/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      console.log("webhook is run ...........");
      const io = req.io;

      const hmacHeader = req.headers["x-shopify-hmac-sha256"];
      const secret = process.env.SHOPIFY_API_SECRET;

      const hash = crypto
        .createHmac("sha256", secret)
        .update(req.body)
        .digest("base64");

      if (hash !== hmacHeader) {
        console.error("توقيع الـ Webhook غير صالح!");
        return res.status(401).send("غير مصرح");
      }

      const data = JSON.parse(req.body.toString("utf8"));

      const orderData = data;

      if (!orderData || !orderData.id) {
        return res.status(400).json({ error: "Invalid order data" });
      }

      const store = await Store.findOne({ storeName: orderData.shop });
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }

      const customerId = store.customer;

      let payment_method;
      if (orderData.payment_terms?.payment_terms_name === "Due on Receipt") {
        payment_method = "COD";
      } else if (orderData.financial_status === "paid") {
        payment_method = "Prepaid";
      } else {
        payment_method = "COD";
      }

      const order = await Order.findOneAndUpdate(
        { id: orderData.id },
        {
          id: orderData.id,
          storeId: store.storeId,
          platform: "Shopify",
          status: {
            name:
              orderData.financial_status ||
              orderData.fulfillment_status ||
              "pending",
            slug: (
              orderData.financial_status ||
              orderData.fulfillment_status ||
              "pending"
            )
              .toLowerCase()
              .replace(/\s+/g, "_"),
          },
          total: {
            amount: parseFloat(orderData.total_price),
            currency: orderData.currency,
          },
          payment_actions: {
            paid_amount: {
              amount: parseFloat(orderData.total_price),
              currency: orderData.currency,
            },
          },
          payment_method: payment_method,
          items: orderData.line_items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: parseFloat(item.price),
          })),
          Customer: customerId,
        },
        { upsert: true, new: true }
      );
      const notification = new Notification({
        customerId,
        type: "order",
        message: `New order #${orderData.id} has been placed or updated. Total: ${orderData.total_price} ${orderData.currency}`,
      });

      await notification.save();

      if (notification.customerId) {
        io.to(`user_${notification.customerId}`).emit(
          "new_notification",
          notification
        );
      }

      return res.status(200).json({ status: "success", data: order });
    } catch (error) {
      console.error("Error handling order creation webhook:", error);
      return res
        .status(500)
        .json({ error: "Failed to process order creation webhook" });
    }
  }
);

//webhook for zid

app.post("/api/zid/webhook", express.json(), async (req, res) => {
  try {
    console.log("webhook is run .....");

    const io = req.io;

    const zidToken = req.headers["x-manager-token"];
    const expectedToken = process.env.ZID_WEBHOOK_SECRET;

    if (!zidToken || zidToken !== expectedToken) {
      console.error("توقيع Webhook Zid غير صالح!");
      return res.status(401).send("غير مصرح");
    }

    const data = req.body;
    console.log("Webhook data:", data);

    let orderData;
    if (data.type === "order.created") {
      orderData = data.data;
    } else {
      return res.status(200).json({ message: "حدث غير مهم" });
    }

    if (!orderData || !orderData.id) {
      return res.status(400).json({ error: "بيانات الطلب غير صالحة" });
    }

    const store = await Store.findOne({ storeId: orderData.store_id });
    if (!store) {
      return res.status(404).json({ error: "المتجر غير موجود" });
    }

    const customerId = store.customer;

    let payment_method =
      orderData.payment_status === "paid" ? "Prepaid" : "COD";

    const order = await Order.findOneAndUpdate(
      { id: orderData.id },
      {
        id: orderData.id,
        storeId: store.storeId,
        platform: "Zid",
        status: {
          name: orderData.status || "pending",
          slug: (orderData.status || "pending")
            .toLowerCase()
            .replace(/\s+/g, "_"),
        },
        total: {
          amount: parseFloat(orderData.total_amount),
          currency: orderData.currency,
        },
        payment_method,
        items: orderData.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price),
        })),
        Customer: customerId,
      },
      { upsert: true, new: true }
    );

    const notification = new Notification({
      customerId,
      type: "order",
      message: `تم إنشاء أو تحديث الطلب #${orderData.id}. المجموع: ${orderData.total_amount} ${orderData.currency}`,
    });
    await notification.save();

    if (notification.customerId) {
      io.to(`user_${notification.customerId}`).emit(
        "new_notification",
        notification
      );
    }

    res.status(200).json({ status: "success", data: order });
  } catch (error) {
    console.error("Error handling Zid webhook:", error);
    res.status(500).json({ error: "فشل في معالجة Webhook الطلب" });
  }
});

// webhook moyasar

const Wallet = require("./models/walletModel");
const Transaction = require("./models/transactionModel");

app.post("/api/wallet/webhook/moyasar", express.json(), async (req, res) => {
  try {
    // const secret = process.env.MOYASAR_SECRET_KEY;
    //     const signature = req.headers["x-moyasar-signature"];
    //     const body = JSON.stringify(req.body);

    //     console.log("جسم الطلب:", body);
    //     console.log("التوقيع المستلم:", signature);

    //     const hash = crypto
    //       .createHmac("sha256", secret)
    //       .update(body)
    //       .digest("hex");

    //     console.log("التجزئة المحسوبة:", hash);

    //     if (hash !== signature) {
    //       console.error("فشل التحقق من التوقيع في Webhook");
    //       return res.status(400).json({ error: "توقيع غير صالح" });
    //     }

    const payment = req.body;

    if (payment.status !== "paid") {
      return res
        .status(200)
        .json({ message: "تم استلام الإشعار لكن الحالة ليست مدفوعة" });
    }

    const customerId = payment.metadata?.customerId;
    const netAmount = parseFloat(payment.metadata?.netAmount || 0);

    if (!customerId || !netAmount) {
      return res.status(400).json({ error: "بيانات ناقصة في الإشعار" });
    }

    // تحديث أو إنشاء المحفظة
    const wallet = await Wallet.findOneAndUpdate(
      { customerId },
      { $inc: { balance: netAmount } },
      { upsert: true, new: true }
    );

    // إنشاء معاملة
    const transaction = await Transaction.create({
      type: "credit",
      customerId: customerId,
      description: "Recharge Wallet",
      amount: netAmount / 100,
      status: "completed",
      method: "moyasar",
      moyasarPaymentId: payment.id,
      walletId: wallet._id,
    });

    // ربط المعاملة بالمحفظة
    await Wallet.findByIdAndUpdate(wallet._id, {
      $push: { transactions: transaction._id },
    });

    console.log(
      `تم شحن محفظة العميل ${customerId} بمبلغ ${
        netAmount / 100
      } ريال بعد الخصم`
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("خطأ في Webhook:", err);
    res.status(500).json({ error: "حدث خطأ في المعالجة" });
  }
});

app.use(express.json());




app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/tranactions", transactionsRoutes);
app.use("/api/salla", sallaRoutes);
app.use("/api/shopify", shopifyRoutes);
app.use("/api/zid", zidRoutes);
app.use("/api/woocommerce", wooCommerceRoutes);
app.use("/api/mnasati", mnasatiRoutes);
app.use("/api/clientaddress", clientAddressRoutes);
app.use("/api/orderManually", orderManuallyRoutes);
app.use("/api/package", packageRoutes);
app.use("/api/addresses", addressRotues);
app.use("/api/notifications", notificationRoutes);

//system mount routes
app.use("/api/employees", employeeRoutes);
app.use("/api/salarymodifaction", salaryModifactionRoutes);
app.use("/api/salaries", salaryRoutes);

app.use(globalError);

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
