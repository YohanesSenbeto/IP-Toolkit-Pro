# WAN IP Analyzer API & Frontend Integration Documentation

## API Endpoints

### 1. Analyze WAN IP (GET)
- **Endpoint:** `/api/wan-ip/analyze?ip=...`
- **Method:** GET
- **Query Parameter:**
  - `ip` (string): The WAN IP address to analyze.
- **Response:**
  ```json
  {
    "ipAddress": "string",
    "networkInfo": { /* ... */ },
    "interface": { /* ... */ },
    "region": { /* ... */ },
    "recommendations": { /* ... */ },
    "status": { /* ... */ }
  }
  ```
- **Notes:**
  - The response is a flat object. Use the fields directly in the frontend.

### 2. Assign WAN IP to Account (POST)
- **Endpoint:** `/api/wan-ip/analyze`
- **Method:** POST
- **Body:**
  ```json
  {
    "wanIp": "string",
    "accountNumber": "string"
  }
  ```
- **Response:**
  - Assignment info or error object.

## Frontend Usage

- For WAN IP analysis:
  - Use a GET request to `/api/wan-ip/analyze?ip=...`.
  - Use the response object directly (e.g., `setAnalysis(data)`).
- For WAN IP assignment:
  - Use a POST request with `{ wanIp, accountNumber }` in the body.
  - Handle assignment info or error from the response.

## Example Usage (React/Next.js)

```js
// WAN IP Analysis (GET)
const response = await fetch(`/api/wan-ip/analyze?ip=${encodeURIComponent(ipAddress)}`);
const data = await response.json();
setAnalysis(data); // Use data directly

// WAN IP Assignment (POST)
const response = await fetch('/api/wan-ip/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ wanIp: ipAddress, accountNumber })
});
const result = await response.json();
// Handle result
```

## Error Handling
- Always check `response.ok` before using the data.
- If the response contains an `error` field, display it to the user.

## Backend Notes
- GET expects only the `ip` query param.
- POST expects both `wanIp` and `accountNumber` in the body.
- The backend returns a flat object for analysis, and assignment info or error for POST.

---

Keep this file up to date if you change the API or frontend logic!
