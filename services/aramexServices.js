// const axios = require("axios");

// class AramexLocationService {
//   constructor() {
//     this.baseURL = "https://ws.aramex.net/ShippingAPI.V2/"; // Production or Sandbox
//     this.client = axios.create({
//       baseURL: this.baseURL,
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     this.clientInfo = {
//       AccountCountryCode: process.env.ARAMEX_ACCOUNT_COUNTRY_CODE,
//       AccountEntity: process.env.ARAMEX_ACCOUNT_ENTITY,
//       AccountNumber: process.env.ARAMEX_ACCOUNT_NUMBER,
//       AccountPin: process.env.ARAMEX_ACCOUNT_PIN,
//       UserName: process.env.ARAMEX_USERNAME,
//       Password: process.env.ARAMEX_PASSWORD,
//       Version: "v1.0",
//       Source: 24,
//     };
//   }
//   async createShipment(data) {
//     try {
//       const payload = {
//         ClientInfo: this.clientInfo,
//         LabelInfo: { ReportID: 9729, ReportType: "URL" },
//         Shipments: [data],
//       };

//       const res = await this.client.post(
//         "Shipping/Service_1_0.svc/json/CreateShipments",
//         payload
//       );

//       if (res.data.HasErrors) {
//         throw new Error(res.data.Notifications.map((n) => n.Message).join(", "));
//       }

//       const shipment = res.data.Shipments[0];

//       return {
//         success: true,
//         id: shipment.ID,
//         shipmentNumber: shipment.ShipmentNumber,
//         labelUrl: shipment.ShipmentLabel?.LabelURL,
//       };
//     } catch (error) {
//       console.error("❌ Aramex createShipment error:", error.message);
//       throw error;
//     }
//   }

//   /**
//    * 🖨️ طباعة ملصق الشحنة
//    */
//   async printLabel(shipmentNumber) {
//     try {
//       const payload = {
//         ClientInfo: this.clientInfo,
//         LabelInfo: { ReportID: 9729, ReportType: "URL" },
//         ShipmentNumber: shipmentNumber,
//       };

//       const res = await this.client.post(
//         "Shipping/Service_1_0.svc/json/PrintLabel",
//         payload
//       );

//       if (res.data.HasErrors) {
//         throw new Error(res.data.Notifications.map((n) => n.Message).join(", "));
//       }

//       return {
//         success: true,
//         labelUrl: res.data.ShipmentLabel.LabelURL,
//       };
//     } catch (error) {
//       console.error("❌ Aramex printLabel error:", error.message);
//       throw error;
//     }
//   }

//   /**
//    * 📦 جدولة استلام (Pickup)
//    */
//   async createPickup(pickupData) {
//     try {
//       const payload = {
//         ClientInfo: this.clientInfo,
//         LabelInfo: { ReportID: 9729, ReportType: "URL" },
//         Pickup: pickupData,
//       };

//       const res = await this.client.post(
//         "Shipping/Service_1_0.svc/json/CreatePickup",
//         payload
//       );

//       if (res.data.HasErrors) {
//         throw new Error(res.data.Notifications.map((n) => n.Message).join(", "));
//       }

//       return {
//         success: true,
//         pickupGUID: res.data.PickupGUID,
//         message: res.data.Message,
//       };
//     } catch (error) {
//       console.error("❌ Aramex createPickup error:", error.message);
//       throw error;
//     }
//   }

//   /**
//    * 🔢 حجز أرقام شحنات
//    */
//   async reserveShipmentNumberRange(count) {
//     try {
//       const payload = {
//         ClientInfo: this.clientInfo,
//         Entity: this.clientInfo.AccountEntity,
//         ProductGroup: "DOM",
//         Count: count,
//       };

//       const res = await this.client.post(
//         "Shipping/Service_1_0.svc/json/ReserveShipmentNumberRange",
//         payload
//       );

//       if (res.data.HasErrors) {
//         throw new Error(res.data.Notifications.map((n) => n.Message).join(", "));
//       }

//       return {
//         success: true,
//         range: res.data.ReservedRange,
//       };
//     } catch (error) {
//       console.error("❌ Aramex reserveShipmentNumberRange error:", error.message);
//       throw error;
//     }
//   }

//   /**
//    * 🛑 إلغاء استلام
//    */
//   async cancelPickup(pickupGUID) {
//     try {
//       const payload = {
//         ClientInfo: this.clientInfo,
//         Comments: "Cancelled from system",
//         PickupGUID: pickupGUID,
//       };

//       const res = await this.client.post(
//         "Shipping/Service_1_0.svc/json/CancelPickup",
//         payload
//       );

//       if (res.data.HasErrors) {
//         throw new Error(res.data.Notifications.map((n) => n.Message).join(", "));
//       }

//       return {
//         success: true,
//         message: res.data.Message,
//       };
//     } catch (error) {
//       console.error("❌ Aramex cancelPickup error:", error.message);
//       throw error;
//     }
//   }
//   /**
//    * الحصول على قائمة الدول المتاحة في Aramex
//    */
//   async fetchCountries() {
//     try {
//       const response = await this.client.post(
//         "Location/Service_1_0.svc/json/CountriesFetching",
//         {
//           ClientInfo: this.clientInfo,
//         }
//       );

//       if (response.data.HasErrors) {
//         throw new Error(this._extractErrors(response.data.Notifications));
//       }

//       return {
//         success: true,
//         countries: response.data.Countries,
//       };
//     } catch (error) {
//       this._handleError("fetchCountries", error);
//     }
//   }

//   /**
//    * الحصول على المدن حسب الدولة
//    * @param {string} countryCode رمز الدولة (مثل: SA)
//    */
//   async fetchCities(countryCode) {
//     try {
//       const response = await this.client.post(
//         "Location/Service_1_0.svc/json/CitiesFetching",
//         {
//           ClientInfo: this.clientInfo,
//           CountryCode: countryCode,
//         }
//       );

//       if (response.data.HasErrors) {
//         throw new Error(this._extractErrors(response.data.Notifications));
//       }

//       return {
//         success: true,
//         cities: response.data.Cities,
//       };
//     } catch (error) {
//       this._handleError("fetchCities", error);
//     }
//   }

//   /**
//    * التحقق من عنوان
//    * @param {string} countryCode
//    * @param {string} address
//    */
//   async validateAddress(countryCode, address) {
//     try {
//       const response = await this.client.post(
//         "Location/Service_1_0.svc/json/ValidateAddress",
//         {
//           ClientInfo: this.clientInfo,
//           Address: {
//             Line1: address,
//             CountryCode: countryCode,
//           },
//         }
//       );

//       if (response.data.HasErrors) {
//         throw new Error(this._extractErrors(response.data.Notifications));
//       }

//       return {
//         success: true,
//         suggestedAddresses: response.data.SuggestedAddresses,
//       };
//     } catch (error) {
//       this._handleError("validateAddress", error);
//     }
//   }

//   /**
//    * جلب مكاتب Aramex بناءً على الموقع
//    * @param {string} countryCode
//    * @param {string} city
//    */
//   async fetchOffices(countryCode, city) {
//     try {
//       const response = await this.client.post(
//         "Location/Service_1_0.svc/json/FetchOffices",
//         {
//           ClientInfo: this.clientInfo,
//           CountryCode: countryCode,
//           City: city,
//         }
//       );

//       if (response.data.HasErrors) {
//         throw new Error(this._extractErrors(response.data.Notifications));
//       }

//       return {
//         success: true,
//         offices: response.data.Offices,
//       };
//     } catch (error) {
//       this._handleError("fetchOffices", error);
//     }
//   }


//   /**
//    * استخراج رسائل الأخطاء من Notifications
//    */
//   _extractErrors(notifications) {
//     return notifications.map((n) => n.Message).join(" | ");
//   }

//   /**
//    * عرض الخطأ بشكل منظم
//    */
//   _handleError(method, error) {
//     console.error(`Aramex ${method} Error:`, error.message);
//     throw new Error(`Aramex ${method} failed: ${error.message}`);
//   }
// }

// module.exports = new AramexLocationService();
