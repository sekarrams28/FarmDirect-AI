// SMS provider configuration.
//
// Supported providers to evaluate for the real deployment: MSG91, Exotel,
// Twilio (see FarmDirect_SMS_Notification_Plan.txt). Before going live,
// confirm: India SMS support, pricing, Sender ID / DLT template
// requirements, and delivery-report support for whichever one is chosen.
//
// Until real credentials are set, SMS_PROVIDER defaults to "mock": every
// "send" is logged to the console and recorded in SmsLog as sent, but no
// network call is made. This lets the whole order flow (and a viva demo)
// run end-to-end without a paid SMS account.

const provider = (process.env.SMS_PROVIDER || 'mock').toLowerCase();

const config = {
  provider,
  apiKey: process.env.SMS_API_KEY || '',
  apiUrl: process.env.SMS_API_URL || '',
  senderId: process.env.SMS_SENDER_ID || 'FARMDR',
  // Real provider calls only fire when a provider other than "mock" is
  // named AND the credentials it needs are present.
  isConfigured: provider !== 'mock' && Boolean(process.env.SMS_API_KEY) && Boolean(process.env.SMS_API_URL),
};

module.exports = config;
