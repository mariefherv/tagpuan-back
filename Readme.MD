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
**Register User (POST)**
```javascript
[API_LINK]/user/register
```
>*Required fields*
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

**Login User (POST)**
```javascript
[API_LINK]/user/login
```
>*Required fields*
```javascript
{
  username (String),
  password (String)
}
```

**Retrieve User Details (GET)**
```javascript
[API_LINK]/user/profile
```

**View Profile (Other User) (GET)**
```javascript
[API_LINK]/user/viewProfile/userId
```

**Retrieve All Users (Admin) (GET)**
```javascript
[API_LINK]/user/all
```

**Change Password (User) (PUT)**
```javascript
[API_LINK]/user/change-password
```
>*Required fields*
```javascript
{
  oldPassword (String),
  newPassword (String)
}
```

**Change User Role (Admin) (PUT)**
```javascript
[API_LINK]/user/role/:userId
```
>*Required fields*
```javascript
{
  role (enum) //[values: "Farmer", "Contractor", "Vendor"]
}
```

**Verify User (Admin) (PUT)**
```javascript
[API_LINK]/user/verify/:userId
```

**Deny Verification (Admin) (PUT)**
```javascript
[API_LINK]/user/deny/:userId
```

**Edit User Profile (PUT)**
```javascript
[API_LINK]/user/edit
```
>*Optional fields*
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
**Add Commodity (Admin) (POST)**
```javascript
[API_LINK]/commodity/add
```
>*Required fields*
```javascript
{
  en_name (String),
  hil_name (String),
  category (String)
}
```

**Get All Commodities (GET)**
```javascript
[API_LINK]/commodity/getAll
```

### Order Routes
**Create order (POST)**
```javascript
[API_LINK]/order/create
```
>*Required fields*
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

**View Order Details (GET)**
```javascript
[API_LINK]/order/:id
```

**Request Order (POST)**
```javascript
[API_LINK]/order/request/:farmer_id
```

**View User Orders (GET)**
```javascript
[API_LINK]/order/view
```

**View All Orders/Quest (GET)**
```javascript
[API_LINK]/order/viewAll
```

>*Example call with query parameters*
```javascript
[API_LINK]/order/viewAll?commodity=67dacca5eb2a721492b9f49f&order_type=Single&schedule=2025-03-28
```

**Update Order Status (by Farmer) (PUT)**
```javascript
[API_LINK]/order/update/:orderId
```

*>*Required Fields**
```javascript
{
  status (enum) [values: "Pending", "Accepted", "Preparing", "On The Way", "Delivered"]
}
```

**Cancel Order (PUT)**
```javascript
[API_LINK]/order/cancel/:orderId
```

**Confirm Order (PUT)**
```javascript
[API_LINK]/order/confirm/:orderId
```

### Bid Routes
**Create bid (Farmer) (POST)**
```javascript
[API_LINK]/bid/create/:orderId
```

**View all bids for a specific order (Contractor) (GET)**
```javascript
[API_LINK]/bid/order/:orderId
```

**View specific bid (GET)**
```javascript
[API_LINK]/bid/:id
```

### Farmer Routes
**Find All Farmers (with Filter) (GET)**
```javascript
[API_LINK]/farmer/find
```

>*Example call with query parameters*
```javascript
[API_LINK]/farmer/find?commodity=67dacc6aeb2a721492b9f49c&paymentTerms=Cash%20on%20Delivery&modeOfDelivery=Pickup
```

### Conversation Routes
**Create Conversation (POST)**
```javascript
[API_LINK]/conversation/create/:userId
```

**Send Message (POST)**
```javascript
[API_LINK]/conversation/send/:conversationId
```
>*Required fields*
```
{
  content (String)
}
```

**Retrieve Specific Conversation (GET)**
```javascript
[API_LINK]/conversation/get/:conversationId
```

>*You can also call alternatively using the OTHER user's ID*
```javascript
[API_LINK]/conversation/get/?userId=67dce12a2746c5c0c23cb6b7
```

**Get ALL user conversations (GET)**
```javascript
[API_LINK]/conversation/
```

### Item Routes
**Create Item (Vendor) (POST)**
```javascript
[API_LINK]/item/create
```
>*Required fields*
```
{
  name (String),
  marketplace (enum), //[values: "Farmers", "Consumers"]
  description (String), //optional,
  price (int), // price in PHP
  agricoin (int) //price in agricoin
}
```

**Get Items by Market (GET)**
```javascript
[API_LINK]/item/getItems/:market
```
>*Example call*
```javascript
[API_LINK]/item/getItems/Farmers
```

**Buy Item (POST)**
```javascript
[API_LINK]/item/buy/:itemId
```
>*Required fields*
```
{
  quantity (int),
  place_of_delivery (String),
  logistics (enum), //[values: "Pickup", "Delivery"]
  payment_method (enum), //[values: "PHP", "agricoin"],
}
```

**Update Order Status (by Vendor) (PUT)**
```javascript
[API_LINK]/item/update/:orderId
```

*>*Required Fields**
```javascript
{
  status (enum) [values: "Pending", "Accepted", "Preparing", "On The Way", "Delivered"]
}
```

**Cancel Order (PUT)**
```javascript
[API_LINK]/item/cancel/:orderId
```

**Confirm Order (PUT)**
```javascript
[API_LINK]/item/confirm/:orderId
```

**Delete Item (DELETE)**
```javascript
[API_LINK]/item/delete/:itemId
```

### Notification Routes
**Get All Notifications (GET)**
```javascript
[API_LINK]/notification
```

**Mark Notification As Read (PUT)**
```javascript
[API_LINK]/notification/markRead/:notificationId
```
