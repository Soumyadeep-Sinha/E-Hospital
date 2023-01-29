Project created BY Soumyadeep Sinha

### PLEASE READ THE CONTENTS IN ORDER TO AVOID ERRORS

Thank you for visiting my page.
This is a hospital management project based on MongoDB and Mongoose
Tools used :
1) Node Js
2) Express Js
3) EJS
4) HTML
5) CSS
6) NPM --> express, body-parser, ejs, mongoose, express-sessions, mongodb-session, socket.io.

NOTE : The project is configured to run on Localhost:3000 by default.
but can be configured to run on cloud MongoDB Atlas Servers.

### Functionalities for user: 

--> User can create an account
--> login using the credentials
--> view or update information 
--> deregester (delete account)

--> Now after login, a session will be created and the session can be destroyed after clicking logout button.

--> User can register any patient in any department (currently : in Anesthesiology and cardiology)
--> then they can print receipt 
--> if required they can cancel the registration.
--> NEW : Users can now view their appointments.

### Features :
--> Dynamic Home page 
--> Dynamic Patient Registration Page.
--> Full CRUD functions to the USER.
--> Create and Delete function for patient registration.
--> Pages can be translated in any Language with the help of google translate API
--> One click print function on receipt page.
--> Mobile optimized.
--> Dynamic error and alert pages.

### Additional Functions

--> Admin control.
--> Dedicated pages and server for Admin.
--> Complete control to Admin.
--> NEW : Chatbox feature added for both user and Admin.
--> Secure authentication enabled for admin and some userside routes.

### Things to take care : 

--> additional Node modules might be needed.
--> The app.js has some console logs wich are unecessary but I have kept them for debugging purposes.
--> the project needs to run on three independent servers to work with full functionality.

### Installation: ###
Make sure to open the terminal in the correct directory.

--> install the following modules in the main folder. (run the following commands in terminal.)
1) npm i express
2) npm i body-parser
3) npm i mongodb-sessions
4) npm i express-sessions
5) npm i mongoose
6) npm i ejs

--> install the following modules in the Chat folder. (run the following commands in terminal.)
1) npm i express
2) npm i socket.io

-->optional module
1) nodemon can be installed to easier operation.

Running the project
1) In the main folder run the app.js file using node or nodemon --> this will run in localhost:3000
1) In the same folder run the admin.js file using node or nodemon --> this will run on localhost:4000
3) In the Chat folder run the chat_server.js file using node or nodemon --> this will run on localhost:3500

~ All modern browsers are supported.

### the app can crash under some cicumstances most of them are handled but still few may occour. ###