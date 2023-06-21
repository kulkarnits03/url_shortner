# url_shortner

This code is a web application built using Node.js, Express.js, and MongoDB. It provides functionality for user authentication, URL shortening, and redirection. Here's a brief description of its key components:

Dependencies: The code requires various modules such as express, body-parser, ejs, mongoose, express-session, passport, and passport-local-mongoose for different functionalities.

Database Setup: It connects to two MongoDB databases: userDB and urlShortener.

User Authentication:

It defines a User schema using Mongoose, which includes fields like email, password, and Google ID for authentication.
Passport.js is used for user authentication with local strategy and Google OAuth 2.0 strategy.
The /register and /login routes handle user registration and login, respectively, with password hashing and salting.
Google OAuth 2.0:

The /auth/google route initiates the Google authentication process, redirecting the user to the Google login page.
Upon successful authentication, the callback URL /auth/google/url is called, and the user's Google ID is stored or retrieved from the database.
URL Shortening:

The /url route renders the index page, displaying a list of short URLs stored in the database.
The /shortUrls route handles the creation of new short URLs by saving the provided full URL in the ShortUrl model.
The /:shortUrl route handles the redirection to the original full URL based on the provided short URL.
Views: The code uses the EJS templating engine to render dynamic web pages with embedded JavaScript.

Server Setup: The application listens on port 3000 and starts the server.

Overall, this code combines user authentication with URL shortening functionality and provides a web interface for users to register, login, create short URLs, and access the original URLs through the shortened versions.
