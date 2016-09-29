/**
 * app.login.js
 *
 * This file is part of **Cohesion Catalyst prototype** (working title) project
 * and created during June 10 - September 10, 2013 within the context of the bachelor thesis
 * * * ---------------------------------------------------
 *     "Konzeption und Umsetzung einer Web-Applikation zur
 *      visuellen Exploration von Multikollektivitaet"
 * * * ---------------------------------------------------
 * at Beuth Hochschule fuer Technik Berlin, University of Applied Sciences.
 * Author: Nadja Zollo, Matrikelnr. 763962, nadja.zollo@gmail.com
 * Date: 10.07.13
 *
 * Purpose: The **app.login.js module** is responsible for the sign up or login process.
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


// Creating the namespace of this module: app.login
app.login = (function () {
  'use strict';
  var
    // Configuration map with values that do not change after module initialization
    configMap = {
      rendered_html : app.util.renderTemplate('app.login')
    },
    // Map that will hold cached jQuery selection objects
    jqueryMap = {},
    setJqueryMap,
    showError,
    hideError,
    isValidInput,
    bindUIActions,
    onSignUp,
    onLogIn,
    initModule
    ;

  // Populates the jqueryMap with jQuery selection objects.
  // That way we can use the jqueryMap with its cached elements instead constantly
  // calling jQuery for searching through the DOM for elements.
  setJqueryMap = function () {
    var templateContainer;
    templateContainer = configMap.$template_container;
    jqueryMap = {
      $signup_button   : templateContainer.find('#signup-btn'),
      $login_button    : templateContainer.find('#login-btn'),
      $signup_name     : templateContainer.find('#signup-username'),
      $signup_email    : templateContainer.find('#signup-email'),
      $signup_password : templateContainer.find('#signup-password'),
      $login_user      : templateContainer.find('#login-username'),
      $login_password  : templateContainer.find('#login-password'),
      $signup_form     : templateContainer.find('#signup-form')
    };

  };

  // BEGIN function **isValidInput**
  // Checks the user's input from the **SIGN UP** or **LOGIN** form.
  // Shows an error message near the corresponding input field if something is
  // wrong and hides it if everything is ok, respectively.
  // At this stage of development the function only checks for empty input.
  // In the future this has to be improved to include email validation, for example.
  // Returns: **true** if there is no empty input field, **false** otherwise.
  isValidInput = function (credentials, trigger) {
    var valid = true;
    if (credentials.hasOwnProperty("name")) {
      if (credentials.name === "") {
        showError(jqueryMap.$signup_name);
        valid = false;
        // TODO Make function **isTaken** work
      } else if (app.model.user.isTaken(credentials.name)) {
        jqueryMap.$signup_name.closest('div.control-group').addClass('error');
        if (!jqueryMap.$signup_name.next('em.help-inline').length) {
          jqueryMap.$signup_name.after('<em class="help-inline">A user with this name already exists</em>');
        }
        valid = false;
      } else {
        hideError(jqueryMap.$signup_name);
      }
    }
    if (credentials.hasOwnProperty("email") && credentials.email === "") {
      showError(jqueryMap.$signup_email);
      valid = false;
    } else {
      hideError(jqueryMap.$signup_email);
    }
    if (credentials.hasOwnProperty("password") && credentials.password === "") {
      if (trigger === "signup-btn") {
        showError(jqueryMap.$signup_password);
        valid = false;
      } else {
        hideError(jqueryMap.$signup_password);
      }
      if (trigger === "login-btn") {
        showError(jqueryMap.$login_password);
        valid = false;
      } else {
        hideError(jqueryMap.$login_password);
      }
    }
    if (credentials.hasOwnProperty("userdata") && credentials.userdata === "") {
      showError(jqueryMap.$login_user);
      valid = false;
    } else {
      hideError(jqueryMap.$login_user);
    }
    return valid;
  }; // END function **isValidInput**


  // Convenient function for binding user interface events
  // cf. code snippet at [as per August 7, 2013]:
  // * http://css-tricks.com/how-do-you-structure-javascript-the-module-pattern-edition/
  bindUIActions = function () {
    jqueryMap.$signup_button.on('click', onSignUp);
    jqueryMap.$login_button.on('click', onLogIn);
  };


  showError = function (element) {
    (element).closest('div.control-group').addClass('error');
    // don't add the error message if it already exists
    if (!(element).next('em.help-inline').length) {
      (element).after('<em class="help-inline">This information is required</em>');
    }
  };

  hideError = function (element) {
    element.closest('div.control-group').removeClass('error');
    if (element.next('em.help-inline').length) {
      element.next('em.help-inline').remove();
    }
  };

  // BEGIN function **onSignUp**
  // Handles the event when a new user wants to sign up and has clicked the **SIGN UP** button.
  // Gets the values of the user's input, passes them to the **isValidInput** function and if that
  // function returns **true** it calls the **app.model.user.signUp** function.
  onSignUp = function (event) {
    event.preventDefault();
    var
      trigger = $(this).attr("id"),
      name,
      email,
      password,
      credentials
      ;

    name = jqueryMap.$signup_name.val();
    email = jqueryMap.$signup_email.val();
    password = jqueryMap.$signup_password.val();

    credentials = {
      name     : name,
      email    : email,
      password : password
    };

    if (isValidInput(credentials, trigger)) {
      app.model.user.signUp(credentials);
      // TODO visual feedback that data is being processed
    }
  }; // END function **onSignUp**


  // BEGIN function **onLogIn**
  // Handles the event when a existing user wants to login and has clicked the **LOGIN** button.
  // Gets the values of the user's input, passes them to the **isValidInput** function and if that
  // function returns **true** it calls the **app.model.user.logIn** function.
  onLogIn = function (event) {
    event.preventDefault();
    var
      trigger = $(this).attr("id"),
      user,
      password,
      credentials
      ;

    user = jqueryMap.$login_user.val();
    password = jqueryMap.$login_password.val();

    credentials = {
      userdata : user,
      password : password
    };

    if (isValidInput(credentials, trigger)) {
      app.model.user.logIn(credentials);
      // TODO visual feedback that data is being processed
    }
  }; // END function **onLogIn**


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