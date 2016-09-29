/**
 * app.util.js
 *
 *  * This file is part of **Cohesion Catalyst prototype** (working title) project
 * and created during June 10 - September 10, 2013 within the context of the bachelor thesis
 * * * ---------------------------------------------------
 *     "Konzeption und Umsetzung einer Web-Applikation zur
 *      visuellen Exploration von Multikollektivitaet"
 * * * ---------------------------------------------------
 * at Beuth Hochschule fuer Technik Berlin, University of Applied Sciences.
 * Author: Nadja Zollo, Matrikelnr. 763962, nadja.zollo@gmail.com
 *
 * Purpose: Provides application's helpers and utilities that are shared across all modules.
 *
 */

/*jslint
 browser: true,
 continue: true,
 devel: true,
 indent: 2,
 maxerr: 50,
 newcap: true,
 nomen: true,
 plusplus: true,
 regexp: true,
 sloppy: true,
 vars: false,
 white: true
 */

/* global $, app, Handlebars */


// Creating the namespace of this module: app.util
app.util = (function () {
  var
    renderTemplate,
    replaceSpecialChars,
    replaceable = { "ä" : "ae", "Ä" : "Ae", "ü" : "ue", "Ü" : "Ue", "ö" : "oe", "Ö" : "Oe", "ß" : "ss"}
    ;

  // BEGIN Public method **renderTemplate**
  // Purpose: Loads a Handlebars template that is stored in the "/views" directory
  // and compiles it and also caches it.
  // Arguments:
  // * template_name - name of the template to load and compile
  // * template_data - data the template is executed with
  // Returns: The HTML result of the evaluated Handlebars template with the given data.
  // cf. code snippet at [as per June 26, 2013]:
  // * http://javascriptissexy.com/handlebars-js-tutorial-learn-everything-about-handlebars-js-javascript-templating/
  // * http://www.jblotus.com/2011/05/24/keeping-your-handlebars-js-views-organized/
  //
  renderTemplate = function (template_name, template_data) {
    var
      template_directory,
      template_url,
      source,
      template
      ;

    if (!renderTemplate.template_cache) {
      renderTemplate.template_cache = {};
    }

    if (!renderTemplate.template_cache[template_name]) {
      template_directory = '../public/views';
      // template_directory = '../views';
      template_url = template_directory + '/' + template_name + '.handlebars';

      $.ajax({
        url     : template_url,
        method  : 'GET',
        async   : false,
        success : function (data) {
          source = data;
        }
      });
      template = Handlebars.compile(source);
      renderTemplate.template_cache[template_name] = template;
    }
    return renderTemplate.template_cache[template_name](template_data);
  }; // END Public method **renderTemplate**


  // BEGIN Public method **replaceSpecialChars**
  // Purpose: Replaces special characters (such as ä, ü, ö, etc.) of the user input.
  // This serves as a precaution because the string values entered by the user act also
  // as node identifiers and parameters within the Cypher query string submitted to the
  // Neo4J database and therefore must not consist of special characters.
  // This method uses the JavaScript method **replace**
  // Arguments:
  // * stringToConvert - string value to be replaced
  // Returns: A new string with the matched characters being replaced.
  // cf. code snippet at [as per July 25, 2013]:
  // * http://stackoverflow.com/questions/1909815/regex-to-compare-strings-with-umlaut-and-non-umlaut-variations
  replaceSpecialChars = function (stringToConvert) {
    return stringToConvert.replace(/[ÄÖÜß]/gi, function ($0) {
      return replaceable[$0];
    });
  }; // END Public method **replaceSpecialChars**



  return{
    renderTemplate      : renderTemplate,
    replaceSpecialChars : replaceSpecialChars
  };

}());
