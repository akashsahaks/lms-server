# Notes

### Index.js Page

// Middleware to parse JSON data in the request body

### app.use(express.json());

// Middleware to parse URL-encoded data

### app.use(express.urlencoded({ extended: true }));

#### express.json() and express.urlencoded({ extended: true }) are middleware in Express.js that deal with parsing incoming request bodies, but they handle different types of data formats.

express.json():

This middleware is specifically designed to parse incoming JSON payloads.
When a client sends a request with a Content-Type: application/json header, this middleware will parse the JSON data in the request body and make it available in the req.body object of your route handlers.
javascript

app.use(express.json());
Example of usage:

app.post('/api/json', (req, res) => {
console.log(req.body); // Parsed JSON data
res.json({ message: 'JSON data received successfully' });
});
express.urlencoded({ extended: true }):

This middleware is designed to parse incoming URL-encoded payloads.
URL-encoded data is often used in HTML form submissions with the Content-Type: application/x-www-form-urlencoded header.
The extended: true option allows for complex objects and arrays to be encoded in the URL-encoded data.
javascript
Copy code
app.use(express.urlencoded({ extended: true }));
Example of usage:

app.post('/api/form', (req, res) => {
console.log(req.body); // Parsed URL-encoded data
res.json({ message: 'URL-encoded data received successfully' });
});
In summary, use express.json() when expecting JSON data in the request body, and use express.urlencoded({ extended: true }) when dealing with URL-encoded data, such as form submissions. Depending on the requirements of your application, you might need one or both of these middleware functions. If you are building a RESTful API that primarily deals with JSON data, you might just use express.json(). If your app

---

The "SIGINT" signal is a signal sent to a process by its controlling terminal to interrupt the process. It's commonly used in the context of manually stopping a running process in the terminal, often triggered by pressing Ctrl+C.

In the context of a Node.js application using Express, handling SIGINT allows you to perform cleanup operations or gracefully shut down the server when the user interrupts the process.

// Handling server termination
process.on('SIGINT', () => {
server.close(() => {
console.log('LMS-Server terminated gracefully');
process.exit(0);
});
});

-> process.on('SIGINT', ...) sets up a listener for the SIGINT event.

-> When a SIGINT signal is received (for example, when you press Ctrl+C in the terminal), the callback function is executed.

-> server.close() is called to stop accepting new connections and allow existing connections to finish.

-> The callback passed to server.close() is executed when all connections are closed, and it prints a message to the console before exiting the process with process.exit(0).

This ensures that the server shuts down gracefully when you manually stop it.
