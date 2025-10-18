// const axios = require("axios");
// const ShopifyStore = require("../models/shopifyStoreModel");
// const Order = require("../models/Order");
// const shipmentController = require("../controllers/shipmentController");

// class ShopifyService {
//   constructor() {
//     this.clientId = process.env.SHOPIFY_CLIENT_ID;
//     this.clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
//     this.redirectUri = process.env.SHOPIFY_REDIRECT_URI;
//     this.scopes = "read_orders,write_orders,read_products,write_products";
//   }

//   getAuthUrl(shop) {
//     return (
//       `https://${shop}/admin/oauth/authorize?` +
//       `client_id=${this.clientId}&` +
//       `scope=${this.scopes}&` +
//       `redirect_uri=${encodeURIComponent(this.redirectUri)}`
//     );
//   }

//   async handleOAuthCallback(shop, code) {
//     try {
//       // Exchange code for access token
//       const tokenResponse = await axios.post(
//         `https://${shop}/admin/oauth/access_token`,
//         {
//           client_id: this.clientId,
//           client_secret: this.clientSecret,
//           code: code,
//         }
//       );

//       // Get shop details
//       const shopDetails = await this.getShopDetails(
//         shop,
//         tokenResponse.data.access_token
//       );

//       // Create or update store record
//       let store = await ShopifyStore.findOne({ shop });

//       if (!store) {
//         store = new ShopifyStore({
//           shop,
//           storeName: shopDetails.data.shop.name,
//           accessToken: tokenResponse.data.access_token,
//           status: "active",
//           settings: {
//             defaultShippingCarrier: "Flow Express",
//             pickupAddress: {
//               street: shopDetails.data.shop.address1 || "",
//               city: shopDetails.data.shop.city || "",
//               country: shopDetails.data.shop.country || "",
//               details: shopDetails.data.shop.address2 || "",
//             },
//           },
//         });
//       } else {
//         store.storeName = shopDetails.data.shop.name;
//         store.accessToken = tokenResponse.data.access_token;
//         store.status = "active";
//       }

//       await store.save();

//       // Set up webhook for order notifications
//       await this.setupWebhook(store);

//       return store;
//     } catch (error) {
//       console.error("Error in OAuth callback:", error);
//       throw new Error("Failed to process OAuth callback");
//     }
//   }

//   async getShopDetails(shop, accessToken) {
//     try {
//       const response = await axios.get(
//         `https://${shop}/admin/api/2024-01/shop.json`,
//         {
//           headers: {
//             "X-Shopify-Access-Token": accessToken,
//           },
//         }
//       );
//       return response.data;
//     } catch (error) {
//       console.error("Error getting shop details:", error);
//       throw new Error("Failed to get shop details");
//     }
//   }

//   async setupWebhook(store) {
//     try {
//       // Generate webhook secret
//       const webhookSecret = Math.random().toString(36).substring(2, 15);

//       // Register webhook with Shopify
//       await axios.post(
//         `https://${store.shop}/admin/api/2024-01/webhooks.json`,
//         {
//           webhook: {
//             topic: "orders/create",
//             address: `${process.env.APP_URL}/api/webhooks/shopify`,
//             format: "json",
//             fields: [
//               "id",
//               "email",
//               "created_at",
//               "total_price",
//               "shipping_address",
//               "line_items",
//             ],
//           },
//         },
//         {
//           headers: {
//             "X-Shopify-Access-Token": store.accessToken,
//           },
//         }
//       );

//       // Save webhook secret
//       store.webhookSecret = webhookSecret;
//       await store.save();
//     } catch (error) {
//       console.error("Error setting up webhook:", error);
//       throw new Error("Failed to set up webhook");
//     }
//   }

//   async handleOrderWebhook(payload, signature) {
//     try {
//       const store = await ShopifyStore.findOne({ shop: payload.shop_domain });
//       if (!store) {
//         throw new Error("Store not found");
//       }

//       // Verify webhook signature
//       // Implementation depends on Shopify's signature verification method

//       if (payload.topic === "orders/create") {
//         await this.processNewOrder(store, payload.data);
//       }
//     } catch (error) {
//       console.error("Error handling webhook:", error);
//       throw new Error("Failed to process webhook");
//     }
//   }

//   async processNewOrder(store, orderData) {
//     try {
//       // Create order in our database
//       const order = await Order.create({
//         shopifyOrderId: orderData.id,
//         storeId: store._id,
//         status: orderData.fulfillment_status || "pending",
//         totalAmount: orderData.total_price,
//         customer: {
//           name: `${orderData.customer.first_name} ${orderData.customer.last_name}`,
//           email: orderData.customer.email,
//         },
//         shippingAddress: {
//           address1: orderData.shipping_address.address1,
//           address2: orderData.shipping_address.address2,
//           city: orderData.shipping_address.city,
//           country: orderData.shipping_address.country,
//           zip: orderData.shipping_address.zip,
//         },
//         items: orderData.line_items,
//       });

//       // If auto-create shipment is enabled, create shipment
//       if (store.settings.autoCreateShipment) {
//         await shipmentController.createShipmentFromShopifyOrder({
//           body: {
//             orderId: order.shopifyOrderId,
//             shippingCarrier: store.settings.defaultShippingCarrier,
//             weight: 2.0, // Default weight
//             numberOfPackages: 1,
//             pickupAddress: store.settings.pickupAddress,
//             deliveryAddress: orderData.shipping_address,
//             paymentMethod:
//               orderData.payment_gateway_names[0] === "cash on delivery"
//                 ? "COD"
//                 : "Prepaid",
//             orderValue: orderData.total_price,
//           },
//         });
//       }

//       return order;
//     } catch (error) {
//       console.error("Error processing new order:", error);
//       throw new Error("Failed to process new order");
//     }
//   }
// }

// module.exports = new ShopifyService();
