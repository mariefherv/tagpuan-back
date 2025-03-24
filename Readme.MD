To install the necessary dependencies, run:
```
npm i
```

To enter dev mode:
```
npm run dev
```

To run the API:
```
npm run start
```
## API Endpoints
### User Routes
> Register User
```javascript
[API_LINK]/user/register
```
*Required fields*
```javascript
{
  username (String),
  email (String),
  password (String),
  role (enum), //[values: "Farmer", "Contractor", "Vendor"]
  first_name (String),
  last_name (String),
  middle_name (String),
  suffix (String),
  front_id (File),
  back_id (File)

  // Additional fields for "Farmer" roles
  farmer_details.commodity ([Object ID of commodity]),
  farmer_details.paymentTerms ([enum]), //[values: "Cash on Delivery", "E-Wallet (GCash/Maya)", "Digital Bank Transfer"],
  farmer_details.modeOfDelivery (enum) //[values: "Pickup", "Delivery"]
}
```

> Login User
```javascript
[API_LINK]/user/login
```
*Required fields*
```javascript
{
  username (String),
  password (String)
}
```

> Retrieve User Details
```javascript
[API_LINK]/user/profile
```

> View Profile (Other User)
```javascript
[API_LINK]/user/viewProfile/userId
```

> Retrieve All Users (Admin)
```javascript
[API_LINK]/user/all
```

> Change Password (User)
```javascript
[API_LINK]/user/change-password
```
*Required fields*
```javascript
{
  oldPassword (String),
  newPassword (String)
}
```

> Change User Role (Admin)
```javascript
[API_LINK]/user/role/:userId
```
*Required fields*
```javascript
{
  role (enum) //[values: "Farmer", "Contractor", "Vendor"]
}
```

> Verify User (Admin)
```javascript
[API_LINK]/user/verify/:userId
```

> Deny Verification (Admin)
```javascript
[API_LINK]/user/deny/:userId
```

> Edit User Profile
```javascript
[API_LINK]/user/edit
```
*Optional fields*
```javascript
{
  username,
  email,
  first_name,
  last_name,
  middle_name,
  suffix,
  farmer_details (refer to registration),
  profile_picture (file)
}
```

### Commodity Routes
> Add Commodity (Admin)
```javascript
[API_LINK]/commodity/add
```
*Required fields*
```javascript
{
  en_name (String),
  hil_name (String),
  category (String)
}
```

> Get All Commodities
```javascript
[API_LINK]/commodity/getAll
```

### Order Routes
> Create order
```javascript
[API_LINK]/order/create
```
*Required fields*
```javascript
{
  commodity (Object ID),
  order_type (enum), //[values: "Single", "Bulk"]
  category (String),
  quantity (int),
  duration (enum), //[values: "Single Order", "Weekly", "Monthly"]
  price (int),
  payment_terms (enum), //[values: "Cash on Delivery", "Digital Bank", "E-Wallet (GCash/Maya)"],
  place_of_delivery (String),
  logistics (enum) //[values: "Pickup", "Delivery"]
  schedule (Date) // Must be a future date
}
```

> View Order Details
```javascript
[API_LINK]/order/:id
```

> Request Order
```javascript
[API_LINK]/order/request/:farmer_id
```

> View User Orders
```javascript
[API_LINK]/order/view
```

> View All Orders/Quest
```javascript
[API_LINK]/order/viewAll
```

**Example call with query parameters**
```javascript
[API_LINK]/order/viewAll?commodity=67dacca5eb2a721492b9f49f&order_type=Single&schedule=2025-03-28
```

> Update Order Status (by Farmer)
```javascript
[API_LINK]/order/update/:orderId
```

**Required Fields**
```javascript
{
  status (enum) [values: "Pending", "Accepted", "Preparing", "On The Way", "Delivered"]
}
```

> Cancel Order
```javascript
[API_LINK]/order/cancel/:orderId
```

> Confirm Order
```javascript
[API_LINK]/order/confirm/:orderId
```

### Bid Routes
> Create bid (Farmer)
```javascript
[API_LINK]/bid/create/:orderId
```

> View all bids for a specific order (Contractor)
```javascript
[API_LINK]/bid/order/:orderId
```

> View specific bid
```javascript
[API_LINK]/bid/:id
```

### Farmer Routes
> Find All Farmers (with Filter)
```javascript
[API_LINK]/farmer/find
```

**Example call with query parameters**
```javascript
[API_LINK]/farmer/find?commodity=67dacc6aeb2a721492b9f49c&paymentTerms=Cash%20on%20Delivery&modeOfDelivery=Pickup
```
