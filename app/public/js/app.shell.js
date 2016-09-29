/**
 * app.shell.js
 *
 * This file is part of **Cohesion Catalyst prototype** (working title) project
 * and created during June 10 - September 10, 2013 within the context of the bachelor thesis
 * * * ---------------------------------------------------
 *     "Konzeption und Umsetzung einer Web-Applikation zur
 *      visuellen Exploration von Multikollektivitaet"
 * * * ---------------------------------------------------
 * at Beuth Hochschule fuer Technik Berlin, University of Applied Sciences.
 * Author: Nadja Zollo, Matrikelnr. 763962, nadja.zollo@gmail.com
 * Date: 03.07.13
 *
 *
 * Purpose: The **app.shell module** initializes browser feature modules and at this stage of development
 * coordinates the application's modules with regard to the login state. Its responsibility may be
 * enhanced in the future.
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

// Creating the namespace of this module: app.shell
app.shell = (function () {
  'use strict';
  var
    // Configuration map with values that do not change after module initialization
    configMap = {
      rendered_html : app.util.renderTemplate('app.shell')
    },
    // Map that will hold cached jQuery selection objects
    jqueryMap = {},
    setJqueryMap,
    subscribeEvents,
    completeLogin,
    completeLogout,
    onLoginError,
    initModule
    ;

  // Populates the jqueryMap with jQuery selection objects.
  // That way we can use the jqueryMap with its cached elements instead constantly
  // calling jQuery for searching through the DOM for elements.
  setJqueryMap = function () {
    var $templateContainer;
    $templateContainer = configMap.$template_container;
    jqueryMap = {
      $header_container        : $templateContainer.find('#header-container'),
      $login_container         : $templateContainer.find('#signup-login-container'),
      $content_container       : $templateContainer.find('#content-container'),
      $input_container         : $templateContainer.find('#input-container'),
      $visualization_container : $templateContainer.find('#visualization-container'),
      $footer                  : $templateContainer.find('footer')
    };
  };


  // Convenient function for subscribing to global custom events.
  // The **jquery.event.gevent.js plugin** provides the global custom events functionality.
  subscribeEvents = function () {
    // Bind the global custom events to the shell's container and subscribe a function to the event.
    $.gevent.subscribe(configMap.$template_container, 'userLogin', completeLogin);
    $.gevent.subscribe(configMap.$template_container, 'userLogout', completeLogout);
    $.gevent.subscribe(configMap.$template_container, 'loginError', onLoginError);
  };


  // Handles the global custom event **userLogin**.
  // Changes state of the application and of the UI.
  completeLogin = function (event, userdata) {
    // **userdata** is what the database returns if the **app.data.createUserNode** or
    // **app.data.lookUpUserNode** functions are successful.
    app.model.user.setCurrentUser(userdata);
    jqueryMap.$login_container.slideUp(600);
    jqueryMap.$content_container
      .slideUp(1800)
      .removeClass('logged-out');
    jqueryMap.$login_status = jqueryMap.$header_container.find('#login-status span');
    jqueryMap.$login_status.text('Logged in as ' + userdata.name + ' ');
    jqueryMap.$logout = jqueryMap.$header_container.find('#logout');
    jqueryMap.$logout.removeClass('logged-out');
    jqueryMap.$footer.removeClass('logged-out');
  };


  // Handles the global custom event **userLogout**.
  // TODO Has to be improved to correctly changing the state of the application and of the UI.
  completeLogout = function (event) {
    window.location.reload();
  };


  // Handles the global custom event **loginError**.
  onLoginError = function () {
    jqueryMap.$login_form = jqueryMap.$login_container.find('#login-form');
    jqueryMap.$login_user = jqueryMap.$login_container.find('#login-username');
    jqueryMap.$login_password = jqueryMap.$login_container.find('#login-password');
    //clear the input fields
    jqueryMap.$login_user.val('');
    jqueryMap.$login_password.val('');
    //show the error message
    jqueryMap.$error_message = jqueryMap.$login_form.find('span');
    jqueryMap.$error_message.removeClass('login-error');
  };


  // Configures and initializes the module and proceeds the initialization cascade of the feature modules.
  initModule = function ($container) {
    // Find the target container within which the template is going to be rendered.
    configMap.$template_container = $container;
    // Insert the template.
    configMap.$template_container.html(configMap.rendered_html);
    // After the template is in place, jQuery selection objects can be set.
    setJqueryMap();
    app.header.initModule(jqueryMap.$header_container);
    app.login.initModule(jqueryMap.$login_container);
    app.topic_input.initModule(jqueryMap.$input_container);
    app.visualization.initModule(jqueryMap.$visualization_container);
    // After all feature modules are initialized we can call our **subscribeEvents**
    // function, otherwise they will not be ready to respond to the events.
    subscribeEvents();

  };

  // Return the public method **initModule**
  return {
    initModule : initModule
  };

}());