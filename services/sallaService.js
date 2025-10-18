// const axios = require("axios");
// const SallaStore = require("../models/sallaStoreModel");

// class SallaService {
//   constructor() {
//     this.baseUrl = "https://api.salla.dev/admin/v2";
//   }

//   async getAuthUrl() {
//     const redirectUri = process.env.SALLA_REDIRECT_URI;
//     const clientId = process.env.SALLA_CLIENT_ID;

//     return (
//       `https://accounts.salla.sa/oauth2/auth?` +
//       `client_id=${clientId}&` +
//       `redirect_uri=${encodeURIComponent(redirectUri)}&` +
//       `response_type=code&` +
//       `scope=offline_access`
//     );
//   }

//   async handleOAuthCallback(code, merchantId) {
//     try {
//       // Exchange code for access token
//       const tokenResponse = await axios.post(
//         "https://accounts.salla.sa/oauth2/token",
//         {
//           grant_type: "authorization_code",
//           client_id: process.env.SALLA_CLIENT_ID,
//           client_secret: process.env.SALLA_CLIENT_SECRET,
//           code: code,
//           redirect_uri: process.env.SALLA_REDIRECT_URI,
//         }
//       );

//       // Get merchant details
//       const merchantDetails = await this.getMerchantDetails(
//         tokenResponse.data.access_token
//       );

//       // Create or update store record
//       let store = await SallaStore.findOne({ merchantId });

//       if (!store) {
//         store = new SallaStore({
//           merchantId,
//           storeName: merchantDetails.data.name,
//           client_id: process.env.SALLA_CLIENT_ID,
//           client_secret: process.env.SALLA_CLIENT_SECRET,
//           access_token: tokenResponse.data.access_token,
//           refresh_token: tokenResponse.data.refresh_token,
//           tokenExpiry: new Date(
//             Date.now() + tokenResponse.data.expires_in * 1000
//           ),
//           status: "active",
//           settings: {
//             defaultShippingCarrier: "Flow Express",
//             pickupAddress: merchantDetails.data.address || "",
//           },
//         });
//       } else {
//         store.storeName = merchantDetails.data.name;
//         store.access_token = tokenResponse.data.access_token;
//         store.refresh_token = tokenResponse.data.refresh_token;
//         store.tokenExpiry = new Date(
//           Date.now() + tokenResponse.data.expires_in * 1000
//         );
//         store.status = "active";
//       }

//       await store.save();
//       return store;
//     } catch (error) {
//       console.error("Error in OAuth callback:", error);
//       throw new Error("Failed to process OAuth callback");
//     }
//   }

//   async getMerchantDetails(accessToken) {
//     try {
//       const response = await axios.get(`${this.baseUrl}/merchant/details`, {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });
//       return response.data;
//     } catch (error) {
//       console.error("Error getting merchant details:", error);
//       throw new Error("Failed to get merchant details");
//     }
//   }

//   async refreshToken(store) {
//     try {
//       const response = await axios.post(
//         "https://accounts.salla.sa/oauth2/token",
//         {
//           grant_type: "refresh_token",
//           client_id: store.client_id,
//           client_secret: store.client_secret,
//           refresh_token: store.refresh_token,
//         }
//       );

//       store.access_token = response.data.access_token;
//       store.refresh_token = response.data.refresh_token;
//       store.tokenExpiry = new Date(
//         Date.now() + response.data.expires_in * 1000
//       );
//       await store.save();

//       return store.access_token;
//     } catch (error) {
//       console.error("Error refreshing token:", error);
//       throw new Error("Failed to refresh token");
//     }
//   }

//   async getStoreOrders(store, params = {}) {
//     try {
//       // Check if token needs refresh
//       if (store.tokenExpiry <= new Date()) {
//         await this.refreshToken(store);
//       }

//       const response = await axios.get(`${this.baseUrl}/orders`, {
//         headers: {
//           Authorization: `Bearer ${store.access_token}`,
//         },
//         params,
//       });

//       return response.data;
//     } catch (error) {
//       console.error("Error getting store orders:", error);
//       throw new Error("Failed to get store orders");
//     }
//   }
// }

// module.exports = new SallaService();
