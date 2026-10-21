import Razorpay from 'razorpay';
import { validateRazorpayConfig } from './razorpayMode.js';

export default new Razorpay(validateRazorpayConfig(process.env));
