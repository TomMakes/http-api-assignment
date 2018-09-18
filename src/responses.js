const fs = require('fs'); // pull in the file system module

// Load our index fully into memory.
// THIS IS NOT ALWAYS THE BEST IDEA.
// We are using this for simplicity. Ideally we won't have
// synchronous operations or load entire files into memory.
const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

// function to send response
const respond = (request, response, status, content, type) => {
  // set status code and content type
  response.writeHead(status, { 'Content-Type': type });
  // write the content string or buffer to response
  response.write(content);
  // send the response to the client
  response.end();
};

// function for our /cats page
// Takes request, response and an array of client requested mime types
const getResponse = (request, response, acceptedTypes, requestType,
  idSend, messageSend, params) => {
  // object to send
  const reply = {
    id: idSend,
    message: messageSend,
  };

  let status = 404;

  if (requestType === 'success') {
    status = 200;
  } else if (requestType === 'badRequest') {
    if (!params.valid || params.valid !== 'true') {
      status = 200;
    } else {
      status = 400;
      reply.id = '';
      reply.message = 'This request has the required parameters.';
    }
  } else if (requestType === 'unauthorized') {
    if (!params.loggedIn || params.loggedIn !== 'yes') {
      status = 200;
    } else {
      status = 401;
      reply.id = '';
      reply.message = 'You have successfully viewed the content';
    }
  } else if (requestType === 'forbidden') {
    status = 403;
  } else if (requestType === 'internal') {
    status = 500;
  } else if (requestType === 'notImplemented') {
    status = 501;
  }

  // if the client's most preferred type (first option listed)
  // is xml, then respond xml instead
  if (acceptedTypes[0] === 'text/xml') {
    // create a valid XML string with name and age tags.
    let responseXML = '<response>';
    responseXML = `${responseXML} <id>${reply.id}</id>`;
    responseXML = `${responseXML} <message>${reply.message}</message>`;
    responseXML = `${responseXML} </response>`;

    // return response passing out string and content type
    return respond(request, response, status, responseXML, 'text/xml');
  }

  // stringify the json object (so it doesn't use references/pointers/etc)
  // but is instead a flat string object.
  // Then write it to the response.
  const responseString = JSON.stringify(reply);

  // return response passing json and content type
  return respond(request, response, status, responseString, 'application/json');
};

// function to handle the index page
const getIndex = (request, response) => {
  respond(request, response, 200, index, 'text/html');
};

const success = (request, response, params, acceptedTypes) => {
  getResponse(request, response, acceptedTypes, 'success', 'Success', 'This is a successful response.', params);
};

const badRequest = (request, response, params, acceptedTypes) => {
  getResponse(request, response, acceptedTypes, 'badRequest', 'Bad Request', 'Missing valid query parameter set to true.', params);
};

const unauthorized = (request, response, params, acceptedTypes) => {
  getResponse(request, response, acceptedTypes, 'unauthorized', 'Unauthorized', 'Missing loggedIn query set to yes.', params);
};

const forbidden = (request, response, params, acceptedTypes) => {
  getResponse(request, response, acceptedTypes, 'forbidden', 'Forbidden', 'You do not have access to this content.', params);
};

const internal = (request, response, params, acceptedTypes) => {
  getResponse(request, response, acceptedTypes, 'internal', 'Internal Server Error', 'Internal Server Error. Something went wrong.', params);
};

const notImplemented = (request, response, params, acceptedTypes) => {
  getResponse(request, response, acceptedTypes, 'notImplemented', 'Not Implemented',
    'A get request for this page has not been implemented yet, please check back later for content.', params);
};

const notFound = (request, response) => {
  getResponse(request, response, 'application/json', 'notFound', 'Resource Not Found', 'The page you are looking for was not found.');
};

const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

// exports to set functions to public.

module.exports = {
  getIndex,
  success,
  badRequest,
  unauthorized,
  forbidden,
  internal,
  notImplemented,
  notFound,
  getCSS,
};
