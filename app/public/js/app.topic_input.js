/**
 * app.topic_input.js
 *
 * This file is part of **Cohesion Catalyst prototype** (working title) project
 * and created during June 10 - September 10, 2013 within the context of the bachelor thesis
 * * * ---------------------------------------------------
 *     "Konzeption und Umsetzung einer Web-Applikation zur
 *      visuellen Exploration von Multikollektivitaet"
 * * * ---------------------------------------------------
 * at Beuth Hochschule fuer Technik Berlin, University of Applied Sciences.
 * Author: Nadja Zollo, Matrikelnr. 763962, nadja.zollo@gmail.com
 * Date: 30.06.13
 *
 * Purpose: The **app.topic_input.js module** is a browser feature module.
 * It controls the functionality of the input fields and structures the values
 * entered by the user before handing them off.
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

// Creating the namespace of this module: app.topic_input
app.topic_input = (function () {
  'use strict';
  var
    // Configuration map with values that do not change after module initialization
    configMap = {
      rendered_html : app.util.renderTemplate('app.topic_input', app.model.templateData)
    },
    // Map that will hold cached jQuery selection objects
    jqueryMap = {},
    setJqueryMap,
    bindUIActions,
    trainingSelected = false,
    selectTrainingID,
    showAlert,
    showTopicInput,
    addTopic,
    removeTopic,
    enterSubtopic,
    submitTopic,
    initModule
    ;


  // Populates the jqueryMap with jQuery selection objects.
  // That way we can use the jqueryMap with its cached elements instead constantly
  // calling jQuery for searching through the DOM for elements.
  setJqueryMap = function () {
    var $templateContainer;
    $templateContainer = configMap.$template_container;
    jqueryMap = {
      $template_container : $templateContainer,
      $category_label     : $templateContainer.find('label.tree-toggler'),
      $category_container : $templateContainer.find('div.tree'),
      $training_select    : $templateContainer.find('#training'),
      $alert_div          : $templateContainer.find('.alert-div')
    };
  };

  // Convenient function for binding user interface events
  // cf. code snippet at [as per August 7, 2013]:
  // * http://css-tricks.com/how-do-you-structure-javascript-the-module-pattern-edition/
  bindUIActions = function () {
    jqueryMap.$training_select.on('change', selectTrainingID);
    jqueryMap.$category_label.on('click', showTopicInput);
    jqueryMap.$category_container.on('click', 'a.add-topic', addTopic);
    jqueryMap.$category_container.on('click', 'a.remove-topic', removeTopic);
    jqueryMap.$category_container.on('click', 'a.enter-subtopic', enterSubtopic);
    jqueryMap.$category_container.on('click', 'button.topic-submit-btn', submitTopic);
  };


  // BEGIN function **selectTrainingID**
  // Handles the event when the current user selects the training id.
  // Makes sure that the training id has to be selected before the user
  // can move on entering any other data and calls the
  // **app.model.training.commitTrainingID** function.
  selectTrainingID = function () {
    var
      $this,
      training,
      currentUser = app.model.user.getCurrentUser()
      ;
    $this = $(this);
    if ($this.val() === 'Please, select:') {
      showAlert();
    }else{
      jqueryMap.$alert_div.find('.alert').alert('close');
      trainingSelected = true;
      training = {
        "id": $this.val()
      };
      app.model.training.commitTrainingID(training, currentUser);
    }
  }; // END function **selectTrainingID**


  showAlert = function(){
    jqueryMap.$alert_div.append([
      '<div class="alert alert-danger fade in">',
      '<button type="button" class="close" data-dismiss="alert">×</button>',
      'Please, select a Trainings-ID.',
      '</div>'
    ].join('\n'));
  };


  // Handles the event when the user clicks on a category label
  // and opens the input field - but only if the user has selected a
  // training id. Otherwise, an alert message is shown.
  showTopicInput = function (){
    if(!trainingSelected){
      showAlert();
      return false;
    } else {
      $(this).parent().children('div.tree').toggle(300);
    }
  };


  // BEGIN function **addTopic**
  // Handles the event when the user clicks to add another topic, i.e. another input field
  // to enter another topic data.
  // Traverses the DOM to find the correct place for inserting another input element.
  // Because the same functionality is used within the different sections of categories,
  // we have to make sure that always the current category is considered. Furthermore we have
  // to count the dynamically added input fields in order to be able to remove them if needed.
  // The main functionality is taken from an example at [as per August 7, 2013]:
  // * http://bootsnipp.com/snipps/dynamic-form-fields
  // See **app.topic_input.handlebars** and **app.new_topic_input.handlebars** for the
  // details of the DOM elements' structure.
  addTopic = function () {
    var
      $this,
      currentCategory,
      hiddenCounter,
      next,
      thisTopicInput,
      newTopicInputHtml,
      newTopicInput,
      templateData
      ;
    $this = $(this);
//    currentCategory = $this.closest('div.tree').attr('id');
    // Get the name of this current category (which is the value of the element's id) and store it
    currentCategory = $this.closest(jqueryMap.$category_container).attr('id');
    // Select the hidden input field of the current category which acts as a counter
    hiddenCounter = $('input[name="' + currentCategory + '-count"]');
    // Get the value of the counter and store it
    next = hiddenCounter.val();
    thisTopicInput = $this.closest('div.controls');
    // The user wants to add a topic, so the counter has to be incremented
    next++;
    // The attribute values of the new input field has to be the current category
    // and the updated counter value. These are passed as template data.
    templateData = {currentCategory : currentCategory, next : next};
    // Render the new template
    newTopicInputHtml = app.util.renderTemplate('app.new_topic_input', templateData);
    newTopicInput = $(newTopicInputHtml);
    // Insert the new input field after the current input field
    thisTopicInput.after(newTopicInput);
    newTopicInput.find(':text').focus();
    // TODO: replace dummy data-source
    $('#' + currentCategory + '-field-' + next).attr('data-source', thisTopicInput.attr('data-source'));
    hiddenCounter.val(next);
  }; // END function **addTopic**



  // BEGIN function **removeTopic**
  // Handles the event when the user clicks to remove a topic or a subtopic.
  // This function is analogous to the **addTopic** function but handles both
  // topic-input-field and subtopic-input-field removal.
  removeTopic = function () {
    var
      $this,
      currentCategory,
      context,
      hiddenCounter,
      currentCount,
      topicToRemove,
      defaultInputElement
      ;
    $this = $(this);
    currentCategory = $this.closest(jqueryMap.$category_container).attr('id');
    context = $('#' + currentCategory);
    hiddenCounter = $('input[name="' + currentCategory + '-count"]');
    currentCount = hiddenCounter.val();
    topicToRemove = $this.closest('div.controls', context);
    if (topicToRemove.hasClass('enter-subtopic')) {
      topicToRemove.remove();
    }
    else if (currentCount > 0) {
      topicToRemove.remove();
      currentCount--;
      hiddenCounter.val(currentCount);
    }
    else {
      defaultInputElement = topicToRemove.find('input[type=text]');
      defaultInputElement.val(defaultInputElement.attr('defaultValue'));
    }
  }; // END function **removeTopic**



  // BEGIN function **enterSubtopic**
  // Handles the event when the user clicks to enter a subtopic.
  // See **addTopic** function
  enterSubtopic = function () {
    var
      $this,
      currentCategory,
      context,
      thisInput,
      newSubtopicInputHtml,
      newSubtopicInput
      ;
    $this = $(this);
    currentCategory = $this.closest(jqueryMap.$category_container).attr('id');
    //context = $('div.tree');
    context = $('#' + currentCategory);
    thisInput = $this.closest('div.controls', context);
//    console.log("thisInput: ", thisInput);
    newSubtopicInputHtml = app.util.renderTemplate('app.subtopic_input');
    newSubtopicInput = $(newSubtopicInputHtml);
    thisInput.append(newSubtopicInput);
    newSubtopicInput.find(':text').focus();
  }; // END function **enterSubtopic**



  // BEGIN function **submitTopic**
  // Handles the event when the user wants to submit the data.
  // Gets the values of all the input fields within the current category
  // and stores them in an array of **topics** as object literals.
  // In order to maintain the relation between a topic and possibly multiple subtopics or
  // subtopics of subtopics, we store subtopics with an extra property **isSubtopicOf**.
  // The function then calls **app.model.topic.processInputData** and hands off all the data.
  submitTopic = function (event) {
    var
      $thisButton = $(this),
      currentUser = app.model.user.getCurrentUser(),
      currentCategory = $thisButton.closest(jqueryMap.$category_container).attr('id'),
      context = $('#' + currentCategory),
      topicList = []
      ;

    $('#' + currentCategory + ' :text').each(function () {
      var
        $thisInput = $(this),
        topicInput,
        topic
        ;
      // Don't submit an empty input-field. Instead, remove it from the DOM.
      if ($thisInput.val() === "") {
        console.log("no subtopic input");
        $thisInput.closest('div.controls', context).find('a.remove-topic').trigger('click');
        // If there is a subtopic input, make sure to also assign
        // the value of its parent input to the topic object
      } else if ($thisInput.attr('name') === 'subtopic') {
      //  topicInput = $thisInput.closest('div.controls', currentCategory).prev().find(':text');
        topicInput = $thisInput.closest('div.controls', currentCategory).parent().find(':text');
        console.log($thisInput.val() + ' relates to ' + topicInput.val());
        topic = {
          topic        : $thisInput.val(),
          isSubtopicOf : topicInput.val(),
          type         : "topic"
        };
        topicList.push(topic);
      } else {
        console.log("$thisInput val ", $thisInput.val());
        topic = {
          topic : $thisInput.val(),
          type  : "topic"
        };
        topicList.push(topic);
      }
      console.dir(topicList);
    }); // End /each()
    // $thisButton.closest('div.tree', currentCategory).toggle(300);
    if (topicList.length > 0) {
      app.model.topic.processInputData(currentUser, currentCategory, topicList);
    }
    event.preventDefault();
  }; // END function **submitTopic**


  // Configures and initializes the module.
  initModule = function ($container) {
    // Find the target container within which the template is going to be rendered.
    configMap.$template_container = $container;
    // Insert the template.
    configMap.$template_container.html(configMap.rendered_html);
    // After the template is in place, jQuery selection objects can be set
    setJqueryMap();
    // and the module can be bound to browser events.
    bindUIActions();

  };

  // Return the public method **initModule**
  return{
    initModule : initModule
  };

}());
