const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');

var swaggerJSDoc = require('swagger-jsdoc'),
    swaggerUi = require('swagger-ui-express')
    swaggerDocument = require('./swagger.json');

//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//Configure isProduction variable
const isProduction = process.env.NODE_ENV == 'production';

//Initiate our app
const app = express();

//configure our app
app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'passport-tutorial', cookie: {maxAge: 60000} , resave: false, saveUninitialized: false }));


if(!isProduction){
    app.use(errorHandler());
}

//Configure Mongoose
mongoose.connect('mongodb://localhost/passport-tutorial');
mongoose.set('debug', true);

//Models and Routes
require('./models/Users');
require('./config/passport');
var router = require('./routes')
//app.use(router);

// swagger definition
var swaggerDefinition = {
  info: {
    title: 'Node Swagger API',
    version: '1.0.0',
    description: 'Demonstrating how to describe a RESTful API with Swagger-ui',
  },
  host: 'localhost:8000',
  basePath: '/',
  swagger: "2.0",
  paths: { },
  definitions: { },
  responses: { },
  parameters: { },
  securityDefinitions: { }
};
// options for the swagger docs
var options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ['./**/routes/*.js','routes.js'],// pass all in array
  };
// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);

// serve swagger
/*app.get('/swagger.json', function(req, res) {
   res.setHeader('Content-Type', 'application/json');
   res.send(swaggerSpec);
 });*/

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', router);

//Error handlers & middlewares
if(!isProduction){
    app.use((err, req, res) => {
        res.status(err.status || 500);

        res.json({
            errors: {
                message: err.message,
                error: err,
            },
        });
    });
}

app.use((err, req, res) => {
    res.status(err.status || 500);

    res.json({
        errors: {
            message: err.message,
            error: {},
        },
    });
});

app.listen(8000, () => console.log('Server running on http://localhost:8000/'));
