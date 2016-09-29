/**
 * app.header.js
 *
 * This file is part of **Cohesion Catalyst prototype** (working title) project
 * and created during June 10 - September 10, 2013 within the context of the bachelor thesis
 * * * ---------------------------------------------------
 *     "Konzeption und Umsetzung einer Web-Applikation zur
 *      visuellen Exploration von Multikollektivitaet"
 * * * ---------------------------------------------------
 * at Beuth Hochschule fuer Technik Berlin, University of Applied Sciences.
 * Author: Nadja Zollo, Matrikelnr. 763962, nadja.zollo@gmail.com
 * Date: 15.07.13
 *
 * Purpose: The **app.header.js module** provides information of the login state and
 * logout functionality.
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

/* global $, app */  //Information for JSLint about global variables


// Creating the namespace of this module: app.header
app.header = (function () {
  'use strict';
  var
    // Configuration map with values that do not change after module initialization
    configMap = {
      rendered_html : app.util.renderTemplate('app.header')
    },
    // Map that will hold cached jQuery selection objects
    jqueryMap = {},
    setJqueryMap,
    bindUIActions,
    onLogOut,
    initModule
    ;

  // Populates the jqueryMap with jQuery selection objects.
  // That way we can use the jqueryMap with its cached elements instead constantly
  // calling jQuery for searching through the DOM for elements.
  setJqueryMap = function () {
    var $templateContainer;
    $templateContainer = configMap.$template_container;
    jqueryMap = {
      $login_status : $templateContainer.find('#login-status'),
      $logout: $templateContainer.find('#logout')
    };
  };


  // Convenient function for binding user interface events
  // cf. code snippet at [as per August 7, 2013]:
  // * http://css-tricks.com/how-do-you-structure-javascript-the-module-pattern-edition/
  bindUIActions = function () {
    jqueryMap.$logout.on('click', onLogOut);
  };


  // Handles the event when the current user wants to logout and has clicked the logout icon.
  // Delegates the logout task and calls the **app.model.userlogOut** function.
  onLogOut = function(){
    app.model.user.logOut();
  };

  // Configures and initializes the module.
  initModule = function (container) {
    // Find the target container within which the template is going to be rendered.
    configMap.$template_container = container;
    // Insert the template.
    configMap.$template_container.html(configMap.rendered_html);
    // After the template is in place, jQuery selection objects can be set
    setJqueryMap();
    // and the module can be bound to browser events.
    bindUIActions();

  };

  // Return the public method **initModule**
  return {
    initModule : initModule
  };

}());