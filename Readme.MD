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
### User
> Register User
```
[API_LINK]/user/register
```
*Required fields*
```
{
  username (String),
  email (String),
  password (String),
  role, [enum values: "Farmer", "Contractor", "Vendor"]
  first_name (String),
  last_name (String),
  middle_name (String),
  suffix (String),
  front_id (File),
  back_id (File)

  // Additional fields for "Farmer" roles
  farmer_details.commodity ([Object ID of commodity]),
  farmer_details.paymentTerms ([String]), [enum values: "Cash on Delivery", "E-Wallet (GCash/Maya)", "Digital Bank Transfer"],
  farmer_details.modeOfDelivery [enum values: "Pickup", "Delivery"]
}
```

> Login User
```
[API_LINK]/user/login
```
*Required fields*
```
{
  username (String),
  password (String)
}
```

> Retrieve User Details
```
[API_LINK]/user/profile
```

> Retrieve All Users (Admin)
```
[API_LINK]/user/all
```

> Change Password (User)
```
[API_LINK]/user/change-password
```
*Required fields*
```
{
  oldPassword (String),
  newPassword (String)
}
```

> Change User Role (Admin)
```
[API_LINK]/user/role/:userID
```
*Required fields*
```
{
  role [enum values: "Farmer", "Contractor", "Vendor"]
}
```

> Verify User (Admin)
```
[API_LINK]/user/verify/:userID
```

> Deny Verification (Admin)
```
[API_LINK]/user/deny/:userID
```

> Edit User Profile
```
[API_LINK]/user/edit
```
*Optional fields*
```
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

