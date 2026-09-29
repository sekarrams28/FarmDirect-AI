CHANGES MADE — FarmDirect AI Offline
=====================================
Applied against FarmDirect_AI_Offline_Improvement_Plan.txt. Grouped by the
plan's phases. Items not listed here were not touched in this pass.

PHASE 1 — SECURITY (all CRITICAL/HIGH items)
---------------------------------------------
1. Admin registration fixed
   - backend/controllers/authController.js: public `register` now only
     accepts role = farmer | buyer | fpo (backend/utils/validators.js ->
     PUBLIC_ROLES). The request body's `role` can never produce an admin
     account through this endpoint anymore.
   - New endpoint: POST /api/auth/admin/create, protected by
     protect + authorize('admin') — the only in-app way to create an admin.
   - backend/utils/seed.js already created its demo admin via Mongoose
     directly (bypassing the public API), which already satisfies "a
     protected setup/seed process" — left as-is.

2. Authentication strengthened
   - Password strength validation (8+ chars, at least one letter and one
     number) on register and admin-create.
   - `isActive` is now checked at both login and in the `protect`
     middleware (backend/middleware/auth.js) — a deactivated account is
     rejected even if it's still holding a valid, unexpired JWT.
   - Rate limiting added: backend/middleware/rateLimit.js
     (express-rate-limit, added to backend/package.json) — 10 login
     attempts / 15 min and 20 registrations / hour, per IP.
   - JWT expiration was already implemented (utils/generateToken.js).

3. Backend validation added
   - backend/utils/validators.js: shared, dependency-free validators
     (phone format, positive/non-negative numbers, password strength,
     role/language enums).
   - Wired into produce (create/update), offer (create), and order
     (create) controllers — negative price/quantity, empty required
     fields, and invalid enums are now rejected server-side, not just by
     the frontend `required`/`min` attributes.

BONUS SECURITY FIXES (found while implementing the plan, not explicitly
listed in it, but real authorization holes):
   - offerController.updateOffer previously had NO ownership check — any
     authenticated user could accept/reject/expire any offer on any
     listing. Now only the farmer who owns the listing (or an admin) can.
   - orderController.updateOrderStatus previously had NO ownership check
     either — any authenticated user could change any order's status. Now:
     admin can do anything; the owning farmer can advance the fulfilment
     stages; the owning buyer can only cancel, and only pre-shipment.
   - produceController.updateProduce used a blanket `Object.assign(produce,
     req.body)`, which would have let a client overwrite internal fields
     (farmer ownership, cached AI predictions, etc.) via the same endpoint
     used for legitimate edits. Now only an explicit whitelist of editable
     fields is applied.

PHASE 2 — OFFLINE-FIRST (CRITICAL/HIGH) — previously entirely absent
----------------------------------------------------------------------
   - frontend/src/offline/db.js — IndexedDB wrapper (native API, no new
     dependency): generic key/value store, produce/order/AI result
     caches, and a persistent sync queue.
   - frontend/src/offline/OfflineContext.jsx — tracks online/offline
     state, last-synchronized time, and automatically replays the queue
     when the browser's `online` event fires.
   - frontend/src/components/OfflineBanner.jsx — visible status banner,
     matching the plan's mock-up ("OFFLINE MODE ACTIVE / Last
     synchronized: ..."), mounted globally in App.jsx.
   - ListProduce.jsx: submitting a new listing while offline now queues
     it locally (IndexedDB) instead of failing, with clear user feedback,
     and it auto-publishes once connectivity returns.
   - Marketplace.jsx: every successful fetch caches results to IndexedDB;
     when offline, the page reads from that cache instead of showing a
     network error.
   - Offline AI: the Python ai-service (ai-service/) was already fully
     local — price_model.py, buyer_matcher.py, etc. use pandas over local
     CSVs, no OpenAI or other external API calls. This requirement was
     already satisfied by the existing architecture; verified, not
     changed.

PHASE 4 — MARKETPLACE / ORDER MANAGEMENT
------------------------------------------
11. Notifications — wired up end-to-end (previously the Bell icon in the
    navbar was decorative and the Notification model was written to but
    never read):
   - backend/controllers/notificationController.js +
     backend/routes/notificationRoutes.js: list (with unread count),
     mark-one-read, mark-all-read, registered in server.js.
   - Notifications are now created for: new order placed, produce sold
     out, new offer received (previously only "order status changed" and
     "offer status changed" existed).
   - frontend/src/components/NotificationBell.jsx: real dropdown with
     unread badge, polling every 60s, mark-read-on-click, mark-all-read.
     Wired into Navbar.jsx in place of the old static button.

12. Duplicate data protection
   - Offer creation now rejects a second pending offer from the same
     buyer on the same listing (application-level check).
   - Vehicle.registrationNumber is now `unique: true, sparse: true`.
   - (Phone numbers were already unique on the User model.)

PHASE 6 — MULTILINGUAL
------------------------
15. Backend/frontend language mismatch fixed: the frontend ships 7
    language bundles (en/ta/hi/te/kn/mr/bn — see frontend/src/i18n/) but
    User.preferredLanguage only accepted 5 (missing mr, bn), so selecting
    Marathi or Bengali at signup would have silently failed validation.
    Fixed in backend/models/User.js.

VERIFICATION DONE
-------------------
- `node --check` passed on every backend .js file.
- `npm install` + `npm run build` succeeded cleanly on the frontend with
  all new/changed files included (no syntax or import errors).
- node_modules/ and dist/ were removed before repackaging — run
  `npm install` in backend/ and frontend/ before starting the app.

NOT YET DONE (still open from the plan)
------------------------------------------
- Phase 3: richer AI price-prediction / buyer-matching / route-optimization
  UI screens (the AI endpoints and backend logic already exist and work —
  this is presentation-layer work).
- Phase 2 offline caching for orders and AI results specifically (produce/
  marketplace caching is done; orders and AI advice are not yet cached for
  offline viewing).
- Phase 5: richer admin dashboard stats (orders today, most-listed crop,
  recent users/orders, charts) — current admin dashboard is functional but
  basic.
- Phase 7: mobile responsiveness testing pass at the specific breakpoints
  listed in the plan.
- Phase 8/9: formal test suite, screenshots, and demo/viva prep materials.


SMS NOTIFICATION FEATURE — applied against FarmDirect_SMS_Notification_Plan.txt
================================================================================
Full plan implemented (minimum + recommended-final scope).

1. SMS service (Phase 1-2)
   - backend/config/sms.js: reads SMS_PROVIDER/SMS_API_KEY/SMS_SENDER_ID/
     SMS_API_URL from .env. Defaults to a "mock" provider (logs to console,
     no network call) so the whole flow works without a paid SMS account —
     switch SMS_PROVIDER to msg91/exotel/twilio and fill in credentials
     once one is chosen and evaluated per the plan's checklist.
   - backend/models/SmsLog.js: recipient phone (masked in toJSON), user,
     order, event, language, message, status (pending/sent/failed/skipped),
     providerMessageId, failureReason, timestamps.
   - backend/services/smsService.js: one function per event
     (sendOrderReceivedSMS, sendOrderConfirmedSMS, sendOrderInTransitSMS,
     sendOrderDeliveredSMS, sendOrderCancelledSMS) plus sendTestSms. Kept
     entirely separate from orderController. English + Tamil templates are
     filled in (per the plan's own phase 5 ordering — "test English and
     Tamil first"); hi/te/kn/mr/bn fall back to English until their
     templates are added (just add a key per event, nothing else changes).

2. Order integration (Phase 3) + bug fix
   - backend/controllers/orderController.js:
     - createOrder now fires sendOrderReceivedSMS to the farmer.
     - updateOrderStatus now fires the matching SMS
       (confirmed/in_transit/delivered/cancelled) to the correct recipient.
     - BUG FIX (flagged in the plan under "Important Backend Change"): the
       in-app notification on status change used to go to req.user._id —
       i.e. whoever made the change — so a farmer confirming an order
       notified the farmer, not the buyer. It now notifies the other
       party (both parties on cancellation).
   - Every SMS call is fire-and-forget from the controller; smsService
     catches its own errors, so a provider outage never affects the order
     response (Phase 4 requirement).

3. Reliability (Phase 4)
   - Duplicate-SMS protection: before sending, smsService checks SmsLog for
     an existing status:'sent' row for the same order+event+user.
   - Invalid phone numbers and opted-out users are logged as 'skipped',
     not sent.

4. Multilingual (Phase 5)
   - Templates keyed by user.preferredLanguage, falling back to English.

5. Frontend (Phase 6)
   - frontend/src/components/OrderTimeline.jsx: shared 5-stage order
     timeline + SmsStatusBadge ([SMS Sent]/[SMS Pending]/[SMS Failed]/
     [SMS Skipped]).
   - frontend/src/components/SmsPreferenceToggle.jsx: lets a user opt out
     of SMS notifications (PUT /api/auth/notification-preferences).
   - frontend/src/pages/BuyerDashboard.jsx: now shows the timeline + SMS
     badge per order, and a cancel-order action.
   - frontend/src/pages/FarmerDashboard.jsx: added an "Orders to Fulfil"
     section — this didn't exist before, so a farmer had no way to confirm/
     ship/deliver an order from the UI. Each order shows the timeline, SMS
     badge, a "next stage" action button, and cancel.
   - backend/controllers/orderController.js: listOrders/getOrder now
     attach the viewer's own latest SmsLog status per order as
     order.smsStatus, so the frontend badge needs no extra request.

6. Misc
   - backend/models/User.js: added smsOptOut (default false).
   - backend/controllers/authController.js + routes/authRoutes.js:
     PUT /api/auth/notification-preferences.
   - backend/controllers/adminController.js + routes/adminRoutes.js:
     POST /api/admin/sms/test (Phase 2 item 8 — admin-only test SMS) and
     GET /api/admin/sms/logs (recent SMS activity, useful for the viva demo).
   - backend/.env.example: added SMS_PROVIDER/SMS_API_KEY/SMS_SENDER_ID/
     SMS_API_URL.
   - No new npm dependency — smsService reuses axios, already in
     package.json.

NOT implemented / left for a later pass
----------------------------------------
- GSM/SIM hardware path (Option B in the plan) — API-based SMS only, as
  the plan itself recommends for the first version.
- hi/te/kn/mr/bn message templates — structure is in place, English is the
  fallback until each is added and reviewed by a speaker of that language.
- A real SMS provider account (MSG91/Exotel/Twilio) — SMS_PROVIDER=mock
  until one is evaluated and credentials are added to .env.
