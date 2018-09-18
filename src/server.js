const http = require('http');
const url = require('url');

const query = require('querystring');
const responseHandler = require('./responses.js');

// set the port. process.env.PORT and NODE_PORT are for servers like heroku
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// key:value object to look up URL routes to specific functions
const urlStruct = {
  '/': responseHandler.getIndex,
  '/success': responseHandler.success,
  '/badRequest': responseHandler.badRequest,
  '/unauthorized': responseHandler.unauthorized,
  '/forbidden': responseHandler.forbidden,
  '/internal': responseHandler.internal,
  '/notImplemented': responseHandler.notImplemented,
  '/style.css': responseHandler.getCSS,
  notFound: responseHandler.notFound,
};
//  /success, /badRequest, /unauthorized, /forbidden, /internal, /notImplemented
// handle HTTP requests. In node the HTTP server will automatically
// send this function request and pre-filled response objects.
const onRequest = (request, response) => {
  // parse the url using the url module
  // This will let us grab any section of the URL by name
  const parsedUrl = url.parse(request.url);

  // Grab the accepted types
  const acceptedTypes = request.headers.accept.split(',');

  // grab the query parameters (?key=value&key2=value2&etc=etc)
  // and parse them into a reusable object by field name
  const params = query.parse(parsedUrl.query);

  // check if the path name (the /name part of the url) matches
  // any in our url object. If so call that function. If not, default to index.
  if (urlStruct[parsedUrl.pathname] === '/') {
    urlStruct[parsedUrl.pathname](request, response);
  } else if (urlStruct[parsedUrl.pathname] === '/style.css') {
    urlStruct[parsedUrl.pathname](request, response);
  } else if (urlStruct[parsedUrl.pathname]) {
    urlStruct[parsedUrl.pathname](request, response, params, acceptedTypes);
  } else {
    urlStruct.notFound(request, response);
  }
};

// start HTTP server
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
