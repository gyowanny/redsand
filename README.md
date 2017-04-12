
# Redsand
![My image](http://www.ecastles.co.uk/redsand3.jpg)

User authentication API using Json Web Token. 
The "red sand" name is a reference to the Red Sands fort also known as Maunsell Army Sea Forts (http://www.ecastles.co.uk/armyforts.html)

# Why?
Just a simple and quick way to add user authentication to your application at the development/prototyping stage or even in production at your own risk (for while). 
It uses rethinkdb as database for the sake of speed and simplicity and yet makes it cluster friendly

# Pre-requisites:
- [NodeJS](https://nodejs.org)
- [NPM](https://www.npmjs.com/get-npm)
- [RethinkDB](https://www.rethinkdb.com)

# Hands on!
*Make sure that RethinkDB is started*

1. Clone the project:
git clone https://github.com/gyowanny/redsand
2. cd redsand
3. npm install
4. npm start
5. If everything goes fine you will see the following log message:
`info: Server started on port 3000`

That's it! Now you can go ahead and set your application up to call the endpoints or simply test them via `curl`, `postman` or whatever tool you prefer.

# Redsand Overview

Redsand offers an easy way to add user authentication to your applications using JSON web tokens and storing user data making your life easier by not duplicating code accross your projects.

Basically the available endpoints are split in API endpoints and ADMIN endpoints.

## API Endpoints

The API endpoints are the ones your application must call in order to authenticate users and validate their tokens as well.
- `/api/auth` - Authenticates a user and returns the JSON Web Token. The payload must be the login and the Base64 encoded password.

  **Body payload example**: 
  
  ```javascript
  {
     "login":"admin.smith", 
     "password":"ZWNvbm9taWNzU3Vja3M="
   }
   ```

- `/api/validate` - Validates a given JSON Web Token. There are 2 ways you can validade a token:

1. Validate the token like checking if it's expired for example, you just have to send the token itself in the payload:

```javascript
{
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImNyZWF0ZV9kYXRlIjoiMjAxNy0wNC0xMFQyMzowMDoxMC4wMzNaIiwiZW1haWwiOiJ1c2VyQHVzZXIuY29tIiwiZnVsbE5hbWUiOiJmdWxsIG5hbWUyIiwibG9naW4iOiJsb2dpbiIsIm9yZ19pZCI6WyJvcmdfaWQiXSwicm9sZXMiOlsiUk9MRV8xIiwiUk9MRV8yIiwiUk9MRV8zIiwiUk9MRV80Il19LCJpYXQiOjE0OTE5OTM3MTksImV4cCI6MTQ5MjA4MDExOX0.Yz0bzanyADuHmWtu5l4ufVs57_6ScCWbTmFujSOcsuU"
}
```
2. Performs the previous validation plus validates the token against the user info in order to assure that token belongs to it. This kind of validation might be useful for long duration tokens:

```javascript
{
 "user": {
     "login": "adam.smith",
     "email": "adam.smith@economics.com",
     "fullName": "Adam Smith",
     "roles": ["ROLE_1","ROLE_2","ROLE_3","ROLE_4"],
     "org_id": ["ECONOMICS"]
 },
 "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImNyZWF0ZV9kYXRlIjoiMjAxNy0wNC0xMFQyMzowMDoxMC4wMzNaIiwiZW1haWwiOiJ1c2VyQHVzZXIuY29tIiwiZnVsbE5hbWUiOiJmdWxsIG5hbWUyIiwibG9naW4iOiJsb2dpbiIsIm9yZ19pZCI6WyJvcmdfaWQiXSwicm9sZXMiOlsiUk9MRV8xIiwiUk9MRV8yIiwiUk9MRV8zIiwiUk9MRV80Il19LCJpYXQiOjE0OTE5OTM3MTksImV4cCI6MTQ5MjA4MDExOX0.Yz0bzanyADuHmWtu5l4ufVs57_6ScCWbTmFujSOcsuU"
}
```


## ADMIN Endpoints

These endpoints are meant to create and maintain users and organzations info. By default in the production environment they must be called with a valid token (this is achived via a filter added to the admin router). Also by default the environemnt is set to Development so the filter is deactivated.
