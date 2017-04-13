
# Redsand
![My image](http://www.ecastles.co.uk/redsand3.jpg)

User authentication API using [JSON web token](https://jwt.io). 
The "red sand" name is a reference to the Red Sands fort also known as Maunsell Army Sea Forts (http://www.ecastles.co.uk/armyforts.html)

# Why?
Just a simple and quick way to add user authentication to your application at the development/prototyping stage or even in production at your own risk (for while). You can run it as a microservice or embbed the source code into your project.
It uses rethinkdb as database for the sake of speed and simplicity and yet makes it cluster friendly

# Pre-requisites:
- [NodeJS](https://nodejs.org)
- [NPM](https://www.npmjs.com/get-npm)
- [RethinkDB](https://www.rethinkdb.com)

**We are going to release a docker image soon!**

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

Redsand offers an easy way to add user authentication to your applications using [JSON web tokens](https://jwt.io) and storing user data making your life easier by not duplicating code accross your projects.

Basically the available endpoints are split between API endpoints and ADMIN endpoints.

## Data Overview

The data is persisted into a RethinkDB database in JSON format and currently there are 2 entities as part of the project:

### `Users`

There's nothing much to explain about this entity. It basically contains the info required to authenticate users and it worth to mention that the password is encrypted before being persisted so that there's now way to know the plain version of it. 
Another useful feature is the ability to share the same user among several applications/organizations. 

> I am still thinking about the roles structure since I'm not sure whether to keep it simple or create something like "Roles per organization" because the way it is now, unless the roles are the same for all the organizations the user belongs to, it would require a name convention for them like `"ORG_ID1.ROLE_1, ORG_ID2.ANOTHER_ROLE"`.

This is the current structure:

```json
{
  "login":"asmith",
  "password":"<encrypted pwd>",
  "email":"adam@smith.com',
  "fullName":"Adam Smith",
  "roles":["ROLE_1","ROLE_2","ROLE_3","ROLE_4"],
  "org_id":["org_id1", "org_id2"],
  "create_date":"2017-01-01T11:30:21.986Z"
}
```


### `Orgs`

Orgs or Organizations are meant to store some custom configurations like token expiration which we know that each application has it's own way to deal with session/token expiration. You can also deactivate an organization so that the users can't authenticate for it. 
The current structure is like below:

```json
{
  "org_id": "org_id",
  "name": "Organization Name",
  "tokenExpiration": "24h", //*Using Json Web Token standard format: 60, "2 days", "10h", "7d"*
  "inactive": false
}
```



## API Endpoints

The API endpoints are the ones your application must call in order to authenticate users and validate their tokens as well.

- `POST /api/auth` - Authenticates a user and returns a response payload with the JSON Web Token and a set of roles the user is authorized for so that you can keep this info in your application and use it to grant permission based on them. Returning the roles avoids your application to call redsand everytime to validate user's credentials, specially for mobile apps.
The request payload `auth` property value must be Base64 encoded using the Basic auth pattern (`login:password`). [This web site](https://www.base64encode.org) is really helpful to encode/decode Base64 texts. Also the request payload must come with the org_id the user wants to authenticate against.

  **Request body example**: 
  
  ```json
  {
    "auth": "bG9naW46cGFzc3dvcmQ=",
    "org_id": "org_id"
  }
   ```

  **Successful response payload example**:
  
  ```json
  {
  "success": true,
  "message": "AUTHORIZED",
  "roles": ["ROLE_1","ROLE_2","ROLE_3","ROLE_4"],         
  "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImNyZWF0ZV9kYXRlIjoiMjAxNy0wNC0xMlQxNTo0NzoxNC43NjVaIiwiZW1haWwiOiJ1c2VyQHVzZXIuY29tIiwiZnVsbE5hbWUiOiJmdWxsIG5hbWUgMiIsImxvZ2luIjoibG9naW4iLCJvcmdfaWQiOlsib3JnX2lkIl0sInJvbGVzIjpbIlJPTEVfMSIsIlJPTEVfMiIsIlJPTEVfMyIsIlJPTEVfNCJdfSwiaWF0IjoxNDkyMDE2NTkyLCJleHAiOjE0OTIwNTI1OTJ9.Cetry2TV2v-VR_nbHnTJKtE9nmz0JHLWecRG2I9NDFc"
  }
  ```

  **Unsuccessful response paylod example**:

  ```json
  {
    "success":false,
    "message":"UNAUTHORIZED"
  }
  ```


- `POST /api/validate` - Validates a given JSON Web Token and returns 204 if it's valid otherwise returns 403. There are 2 ways you can validade a token:

  1. Validate the token like checking if it's expired for example, you just have to send the token itself in the payload:

    **Request body example**:

    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImNyZWF0ZV9kYXRlIjoiMjAxNy0wNC0xMFQyMzowMDoxMC4wMzNaIiwiZW1haWwiOiJ1c2VyQHVzZXIuY29tIiwiZnVsbE5hbWUiOiJmdWxsIG5hbWUyIiwibG9naW4iOiJsb2dpbiIsIm9yZ19pZCI6WyJvcmdfaWQiXSwicm9sZXMiOlsiUk9MRV8xIiwiUk9MRV8yIiwiUk9MRV8zIiwiUk9MRV80Il19LCJpYXQiOjE0OTE5OTM3MTksImV4cCI6MTQ5MjA4MDExOX0.Yz0bzanyADuHmWtu5l4ufVs57_6ScCWbTmFujSOcsuU"
    }
    ```
  2. Performs the previous validation plus validates the token against the user info in order to assure that token belongs to it. This kind of validation might be useful for long duration tokens:

    **Request body example**:

    ```json
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

These endpoints are meant to create and maintain users and organizations info. Hopefully in a near future there will be a web front end to make it easier but until this doesn't happen you will have to do that manually via postman, for example. 

- `POST /admin/user`: 
  
  Creates a user 

- `PUT /admin/user/:id` 

  Updates a user. You can only send in the request body the fields that must be changed.
  
- `DELETE /admin/user/:id`
- `GET /admin/user/:org_id`


- `POST /admin/org`
- `PUT /admin/org/:id`
- `DELETE /admin/org/:id`


### NOTES

- By default in the production environment they must be called with a valid token because a token validation filter is added on top of each request. Also by default the environemnt is set to Development so the filter is deactivated.

# If you want to develop

If you want to constribute or even make your own customizations you will need just an additional step which is to install [docker-compose](https://docs.docker.com/compose/) since we run the tests against a RethinkDB docker image so that your local rethinkdb installation is not touched.

- `npm test` to run the tests
- `npm start` to run the app (Notice that currently the app will use your local RethinkDB installation instead of the docker container). If you want to use the docker container you need to follow the steps bellow:
    1. Stop your local RethinkDB instance; 
    2. Edit the config.js file and change the rethinkdb port property to `37250`;
    3. On the project's root folder run `docker-compose up -d`. It will spin up the database docker container;
    4. And finally start the app by running `npm start`. 

# Backlog

Story   |
--------|
Store user activity in a table |
Add user password expiration policy |
Add user password reset. Useful for app features like 'Forgot your password' |
User activation via email with a link. Make it capable to use email API services like Mailgun(https://www.npmjs.com/package/mailgun-js), Mailchimp. *Mental note:* Use queue for background processing https://rethinkdb.com/docs/publish-subscribe/javascript/ |

