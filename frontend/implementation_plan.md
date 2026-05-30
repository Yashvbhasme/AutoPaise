# Admin Verification Flow and Payment Timeline

This plan implements the complete bank details verification flow and mandate timeline you described.

## Proposed Changes

### Backend Changes

#### [MODIFY] [recurpay-backend/models/User.js](file:///c:/busy%20with%20projects/recurpay-backend/models/User.js)
- Add `role: { type: String, enum: ['user', 'admin'], default: 'user' }` to the User schema to differentiate admins from standard business owners.
- Add `passbookUrl: { type: String, default: null }` under the `bankDetails` object schema.

#### [NEW] `recurpay-backend/middleware/uploadMiddleware.js`
- Create a `multer` configuration to handle single image uploads (passbook photo) locally to an `uploads/` directory on the server.

#### [MODIFY] [recurpay-backend/server.js](file:///c:/busy%20with%20projects/recurpay-backend/server.js)
- Add `app.use('/uploads', express.static('uploads'))` to serve uploaded images statically.

#### [MODIFY] [recurpay-backend/controllers/authController.js](file:///c:/busy%20with%20projects/recurpay-backend/controllers/authController.js)
- Update [updateBankDetails](file:///c:/busy%20with%20projects/recurpay-backend/controllers/authController.js#124-168) to handle `req.file` (the uploaded passbook photo) and save its URL to `passbookUrl` in the user's `bankDetails`.

#### [MODIFY] [recurpay-backend/middleware/authMiddleware.js](file:///c:/busy%20with%20projects/recurpay-backend/middleware/authMiddleware.js)
- Add an `adminProtect` middleware that verifies `req.user.role === 'admin'`.

#### [NEW] `recurpay-backend/controllers/adminController.js`
- `getPendingVerifications`: Fetch all users who have bank details submitted but `isVerified: false`.
- `verifyBankDetails`: Given a `userId`, updates their `isVerified` status to `true`.

#### [NEW] `recurpay-backend/routes/adminRoutes.js`
- `GET /api/admin/pending-verifications`
- `PUT /api/admin/verify-bank/:id`

#### [MODIFY] [recurpay-backend/server.js](file:///c:/busy%20with%20projects/recurpay-backend/server.js)
- Register the `/api/admin` path to `adminRoutes`.

#### [NEW] `recurpay-backend/seedAdmin.js`
- A short utility script to run once via terminal to create an initial admin account (`admin@autopaise.com` / `admin123`) so you can test the flow.

---

### Frontend Changes

#### [MODIFY] [recurpay/src/pages/Settings.jsx](file:///c:/busy%20with%20projects/recurpay/src/pages/Settings.jsx)
- Add a file input field in the Bank Details tab to upload the Passbook photo.
- Update the API request to use `FormData` since we are now uploading an image along with JSON text data.
- Add UI to display the Bank Details status: 
  - If empty: "Please add your bank details"
  - If added but `!isVerified`: "Pending Review ⏳"
  - If `isVerified`: "Verified ✅"

#### [MODIFY] [recurpay/src/pages/CreateMandate.jsx](file:///c:/busy%20with%20projects/recurpay/src/pages/CreateMandate.jsx)
- Before rendering the form, check if the logged-in user's bank details are verified.
- If not verified, present a blocked screen: "You must add your bank details and get them verified by an admin before you can create mandates." with a button pointing to Settings.

#### [NEW] `recurpay/src/pages/AdminDashboard.jsx`
- A dedicated page for the admin role.
- Lists all users with pending bank verifications.
- Displays the uploaded Passbook photo for the admin to verify.
- Includes a "Verify ✅" button that calls the backend `verifyBankDetails` endpoint.

#### [MODIFY] [recurpay/src/utils/api.js](file:///c:/busy%20with%20projects/recurpay/src/utils/api.js)
- Setup `adminAPI` for `getPending()` and `verifyBank(id)`.

#### [MODIFY] [recurpay/src/App.jsx](file:///c:/busy%20with%20projects/recurpay/src/App.jsx)
- Add a new route `<Route path="/admin" element={...} />` pointing to `AdminDashboard`.

#### [MODIFY] [recurpay/src/pages/MandateDetails.jsx](file:///c:/busy%20with%20projects/recurpay/src/pages/MandateDetails.jsx)
- Add a robust "Payment Timeline" section at the bottom.
- Will visually show steps: Mandate Created -> Customer Approved -> Payment Processing -> Settlement to Verified Bank (T+2 Days) 💰.

## Verification Plan

### Automated Tests
- None added as we don't have a test suite configured yet.

### Manual Verification
1. Create a normal user account and head to Settings. Add bank details and observe "Pending Review ⏳".
2. Go to Create Mandate and observe the lock stating you need verification.
3. Run `node seedAdmin.js` in the backend to generate the admin account.
4. Log out and log in as the admin.
5. Go to `/admin`. See the pending verification for the normal user and click "Verify ✅".
6. Log out and log in as the normal user again.
7. Go to Settings and observe "Verified ✅".
8. Go to Create Mandate and observe the form is now unlocked.
9. Create a mandate and proceed to Mandate Details.
10. Observe the newly added Payment Timeline (Settlement T+2 Days 💰) on the Details page.
