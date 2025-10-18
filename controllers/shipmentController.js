// const Shipment = require("../models/shipmentModel");
// const Order = require("../models/Order");
// const SmsaExpress = require("../platforms/shipment/smsaExpressPlatform");
// const Aramex = require("../platforms/shipment/aramexPlatform");
// const FlowExpress = require("../platforms/shipment/flowExpressPlatform");

// // Create shipment from Salla order
// exports.createShipmentFromSallaOrder = async (req, res) => {
//   try {
//     const {
//       orderId,
//       shippingCarrier, // e.g., 'Flow Express', 'SMSA', 'Aramex'
//       weight,
//       numberOfPackages,
//       pickupAddress,
//       deliveryAddress,
//       paymentMethod,
//       orderValue,
//     } = req.body;

//     // Validate order exists
//     const order = await Order.findOne({ sallaOrderId: orderId });
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // Initialize shipping provider based on carrier selection
//     let shippingProvider;
//     let shipmentData;

//     switch (shippingCarrier.toLowerCase()) {
//       case "flow express":
//         shippingProvider = new FlowExpress(
//           process.env.FLOW_API_KEY,
//           process.env.FLOW_BASE_URL
//         );
//         shipmentData = {
//           orderId: orderId,
//           weight: weight,
//           numberOfPackages: numberOfPackages,
//           pickupAddress: pickupAddress,
//           deliveryAddress: deliveryAddress,
//           customerName: order.customer.name,
//           customerPhone: order.customer.phone,
//           customerEmail: order.customer.email,
//           paymentMethod: paymentMethod,
//           orderValue: orderValue,
//           deliveryType: "standard",
//           isPrePaid: paymentMethod === "Prepaid",
//         };
//         break;

//       case "smsa":
//         shippingProvider = new SmsaExpress(
//           process.env.SMSA_API_KEY,
//           process.env.SMSA_BASE_URL
//         );
//         shipmentData = {
//           orderId: orderId,
//           weight: weight,
//           numberOfPackages: numberOfPackages,
//           senderAddress: pickupAddress,
//           receiverAddress: deliveryAddress,
//           customerDetails: {
//             name: order.customer.name,
//             phone: order.customer.phone,
//             email: order.customer.email,
//           },
//           paymentType: paymentMethod,
//           cashOnDelivery: paymentMethod === "COD" ? orderValue : 0,
//         };
//         break;

//       case "aramex":
//         shippingProvider = new Aramex(
//           process.env.ARAMEX_USERNAME,
//           process.env.ARAMEX_PASSWORD,
//           process.env.ARAMEX_ACCOUNT_NUMBER,
//           process.env.ARAMEX_PIN,
//           process.env.ARAMEX_ENTITY,
//           process.env.ARAMEX_COUNTRY_CODE
//         );
//         shipmentData = {
//           orderId: orderId,
//           weight: weight,
//           numberOfPieces: numberOfPackages,
//           senderAddress: pickupAddress,
//           receiverAddress: deliveryAddress,
//           customerInfo: {
//             name: order.customer.name,
//             phone: order.customer.phone,
//             email: order.customer.email,
//           },
//           paymentType: paymentMethod,
//           cashOnDelivery: paymentMethod === "COD" ? orderValue : 0,
//         };
//         break;

//       default:
//         throw new Error("Unsupported shipping carrier");
//     }

//     // Create shipment with the carrier
//     const carrierResponse = await shippingProvider.createShipment(shipmentData);

//     // Create shipment record in our database
//     const shipment = await Shipment.create({
//       orderId: order._id,
//       storeId: order.storeId,
//       shippingCompany: shippingCarrier,
//       trackingNumber: carrierResponse.trackingNumber,
//       status: "READY_FOR_PICKUP",
//       weight: weight,
//       shippingCost: carrierResponse.shippingCost || 0,
//       shippingAddress: {
//         city: deliveryAddress.city,
//         country: deliveryAddress.country,
//         details: deliveryAddress.details,
//       },
//       data: {
//         numberOfPackages: numberOfPackages,
//         paymentMethod: paymentMethod,
//         orderValue: orderValue,
//         carrierResponse: carrierResponse,
//       },
//     });

//     // Update order with shipping info
//     order.shippingInfo = {
//       carrier: shippingCarrier,
//       trackingNumber: carrierResponse.trackingNumber,
//       status: "READY_FOR_PICKUP",
//     };
//     order.status = "processing";
//     await order.save();

//     res.json({
//       success: true,
//       message: "Shipment created successfully",
//       shipment,
//       trackingNumber: carrierResponse.trackingNumber,
//     });
//   } catch (error) {
//     console.error("Shipment creation error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create shipment",
//       error: error.message,
//     });
//   }
// };

// // Get shipment details
// exports.getShipmentDetails = async (req, res) => {
//   try {
//     const { trackingNumber } = req.params;

//     const shipment = await Shipment.findOne({ trackingNumber }).populate(
//       "orderId",
//       "status totalAmount customer"
//     );

//     if (!shipment) {
//       return res.status(404).json({
//         success: false,
//         message: "Shipment not found",
//       });
//     }

//     // Get latest tracking info from carrier
//     let shippingProvider;
//     switch (shipment.shippingCompany.toLowerCase()) {
//       case "flow express":
//         shippingProvider = new FlowExpress(
//           process.env.FLOW_API_KEY,
//           process.env.FLOW_BASE_URL
//         );
//         break;
//       case "smsa":
//         shippingProvider = new SmsaExpress(
//           process.env.SMSA_API_KEY,
//           process.env.SMSA_BASE_URL
//         );
//         break;
//       case "aramex":
//         shippingProvider = new Aramex(
//           process.env.ARAMEX_USERNAME,
//           process.env.ARAMEX_PASSWORD,
//           process.env.ARAMEX_ACCOUNT_NUMBER,
//           process.env.ARAMEX_PIN,
//           process.env.ARAMEX_ENTITY,
//           process.env.ARAMEX_COUNTRY_CODE
//         );
//         break;
//       default:
//         throw new Error("Unsupported shipping carrier");
//     }

//     const trackingInfo = await shippingProvider.trackShipment(trackingNumber);

//     // Update shipment status if needed
//     if (trackingInfo.status !== shipment.status) {
//       shipment.status = trackingInfo.status;
//       await shipment.save();
//     }

//     res.json({
//       success: true,
//       shipment,
//       trackingInfo,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to get shipment details",
//       error: error.message,
//     });
//   }
// };
