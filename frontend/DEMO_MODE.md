# Demo Mode

The frontend can run without the backend when `VITE_DEMO_MODE=true`.

## Start

```bash
npm run dev:frontend
```

Open `http://localhost:5173`.

## Demo owner login

- Email: `owner@autopaise.com`
- Password: `Owner@123456`

## Demo admin login

- Email: `admin@recurpay.com`
- Password: `Admin@123456`

## What works in demo mode

- Login and registration
- Dashboard metrics and mandate list
- Settings bank details form
- Razorpay account connection tab
- Create mandate flow
- Mandate details and status updates
- Admin dashboard owner verification flows

## Notes

- Demo data is stored in browser localStorage.
- If you want a clean reset, clear site storage in the browser and reload.
- To switch back to the real backend, set `VITE_DEMO_MODE=false`.
