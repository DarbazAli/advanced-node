# Introduction to Advanced Node and Express Challenges
Authentication is the process or action of verifying the identity of a user or process. in this chapter, we are going to talk about how to utilize this key concept.

The most common and easiest way to use authentication middleware for Node.js is Passport. It is easy to learn, light-weight, and extremely flexible allowing for many strategies.

 In addition to authentication we will also look at template engines which allow for use of Pug and web sockets which allow for real time communication between all your clients and your server.


 ### Setup Template Engine
 
 - Install pug template eninge package `npm i pug`
 - Setup view engine in the server file e.g **app.js**
    ```javascript
    app.set('view engine', 'pug');
    app.set('views', 'views'); // second view is the views directory in your app
    ```

- Create a pug file inside the views directory e.g **index.pug**, then put all the code you want inside it
- Render the pug template using the following command.
    ```javascript
    app.get('/', (req, res) => res.render('index'));
    ```

### Using a template Engine's Power
The power of using a template engine is, it allows us to pass variables from the server to the template file.
- In the template file, we can access the variables by using one of these 2 syntaxes
    `#{variable_name}` or `p= variable_name`

- We can pass variables to the template file in from the server as follows
    ```javascript
    app.get('/', (req, res) => {
        res.render('index', {
            title: 'Advanced node and express',
            message: 'please login'
        })
    })
    ```

