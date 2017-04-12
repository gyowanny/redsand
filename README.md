
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
cd redsand

2. npm install
3. npm start
4. If everything goes fine you will see the following log message:
`info: Server started on port 3000`

That's it! Now you can go ahead and set your application up to call the endpoints or even test them via `curl`, `postman` or whatever tool you prefer.

# Redsand Overview

Redsand offers an easy way to add user authentication to your applications using JSON web tokens and storing user data making your life easier by not duplicating code accross your projects.

Basically the available endpoints are split in API endpoints and ADMIN endpoints.

## API Endpoints

The API endpoints are the ones your application must call in order to authenticate users and validate their tokens as well.
- `/api/auth` - Authenticates a user and returns the JSON Web Token
- `/api/validate` - Validates a given JSON Web Token 

## ADMIN Endpoints

These endpoints are used to create and maintain user and organzations information.
