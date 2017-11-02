// This is an example of what I thought you might need to make a client side
// asset_url like function that would take into consideration what people would expect 
// paperclip to do.  I don't really know how to do the hash_digest where the 
// secret is secret on the front end.  Maybe the url needs to be generated when 
// you query the document on the server, or maybe the urls should be saved?  
// I would rather be able to generate the urls rather than put them in the 
// database because that is a lot of extra stuff to be storing if you don't 
// need to store them.  I haven't spent a lot of time on this code and I don't 
// like how it is written.  
//
// I'm not sure what sort of dependencies you should expect for code like 
// this, currently you might need CryptoJS and Handlebars for this particular 
// file.  Maybe I should leave off the Handlebars.register and then people 
// can just use the function directly for whatever they want, but I was 
// thinking that we could have different files for different template engines 
// and then configure it in the middleware to serve whichever file you need, if 
// people think that is a bad idea, then I am certainly ok to change that decision.  
//
// Also, I personally would like to use the klass library to make this better 
// organized, but I think that is a choice that I don't want to force on everyone 
// that might use this module.  I have made it possible to have different files 
// for different templating engines and to optionally not use CryptoJS if you 
// don't use the hash_digest parameter, but I have a feeling that this code 
// could be way nicer than it is now.  
//
// Suggestions and criticisms are welcome.
//
// How to use this code is you can configure the paperclip_options and 
// paperclip_options.templates in the head of the page and they will be 
// available to the handlebars function in your templates.  
//
// I haven't written the code for server side rendering because I'm making a 
// single page app, but I think that some of the code here could be made to 
// work for that.  It would probably be useful to make helpers for that, 
// but I don't need that right now so I'm skipping that for the time being. 
//
// I think that if you wrote your own custom code to do this you might be 
// able to make it more slick or have better organized but this was a first 
// attempt and I don't need anything other than this for the project that 
// I'm working on currently.

var contentTypeToExt = function(content_type) {
  switch(content_type) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
  }
}

if (paperclip_options == undefined) {
  var paperclip_options       = {};
}

if (paperclip_options.templates == undefined) {
  paperclip_options.templates = {};
}

paperclip_options.templates.default = { 
  path: '/{{class_name}}/{{plural}}/{{document._id}}', 
  file_name: '{{style}}.{{extension}}?{{created_at}}' 
};

paperclip_options.asset_url = function(image) {
  switch(true) {
    case paperclip_options.templates[image] != undefined:
      return paperclip_options.templates[image].path  + "/" + paperclip_options.templates[image].file_name;
    default:
      return paperclip_options.templates.default.path + "/" + paperclip_options.templates.default.file_name;
  }
}

var sha256 = function(string) {
    return CryptoJS.SHA256(string).toString();
    // Must have CryptoJS included to use the hash_digest function.
    // https://code.google.com/archive/p/crypto-js/
}

// I don't know if I should pass an object or just have three parameters.
//
// An object would be preferred, but I haven't used this much and I don't 
// know how well handlebars parses an object that is written out.

var paperclip = function(options) {
  var image         = options.image;
  var style         = options.style;
  
  var doc           = options.doc;
  var obj           = {};

  obj.document      = doc;

  if (doc[image].created_at) {
    obj.created_at  = new Date(doc[image].created_at).getTime();
  }

  obj.extension     = contentTypeToExt(doc[image].content_type);
  obj.style         = style
  obj.plural        = pluralize(image); 

  if (options.class_name) {
    obj.class_name  = options.class_name;
  }

  var template      = paperclip_options.asset_url(image);
  
  if (template.indexOf('hash_digest') > -1) {
    obj.hash_digest = sha256(obj.document._id);
  }
  
  if (template.indexOf('created_at_hash') > -1) {
    obj.created_at_hash = sha256(obj.created_at);
  }

  template          = Handlebars.compile(template);
  var url           = template(obj);

  return url;
}

Handlebars.registerHelper('paperclip', paperclip);
