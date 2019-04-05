/**
 * Created by yinhe on 18/8/13.
 */
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var graphqlHTTP = require('express-graphql');
var http = require('http');

var cors = require('cors');
// var { graphqlExpress, graphiqlExpress } = require('graphql-server-express');

const config = require("./config/config")

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var schemas =require ('./controllers/graphql/schemas');

// var testSchemas =require ('./controllers/graphql/test');

var GraphController = require("./controllers/GraphqlController")
var SystemGraphController = require("./controllers/SystemGraphController")
var graphController = new GraphController()
var gSchema;
var sySChemaMap = {};

var app = express();
app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, '../static')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/graphql', graphqlHTTP(async () => {
  if(!gSchema){  // 关闭自动更新
    gSchema = await graphController.parseTableToStr()
  }
  return {
    schema: gSchema,
    graphiql: true, //启用GraphiQL
  }
}));


app.use('/api/graphql2/:sysId', graphqlHTTP(async (req) => {
  console.log("---"+req.params.sysId)
  if(!sySChemaMap[req.params.sysId]){  // 关闭自动更新

    var curSchema = await new SystemGraphController(req.params.sysId).parseTableToStr()
    sySChemaMap[req.params.sysId] = curSchema;
  }
  return {
    schema: sySChemaMap[req.params.sysId],
    graphiql: true, //启用GraphiQL
  }
}));

app.use('/graphql2', graphqlHTTP({
  schema: schemas,
  graphiql: true
}));
//
// app.use('/graphiqlt', graphiqlExpress({
//   endpointURL: '/graphqlt',
// }));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
}

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(config.port || "8000");
server.on('error', onError);
server.on('listening', onListening);
