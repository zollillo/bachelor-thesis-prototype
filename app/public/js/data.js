// This is the template data to be dynamically rendered in
// the app.topic_input.handlebars Template as long as the template
// data is not retrieved from the NEO4j database.
// Its structure corresponds to the properties the nodes in the database
// will contain.
// CAUTION: Because the rendering-targets of the "tag"-values include "id"-attributes
// of DOM elements, spaces (as in "Sexual Identity") will cause problems.
// So for now, we use the words hyphenated.
var data = {
  trainings  : [
    {id : "cct-2013_1", type: "cct"}
  ],
  categories : [
    {tag : "Profession", type : "category", color : "#1f77b4"},
    {tag : "Education", type : "category", color : "#ff7f0e"},
    {tag : "Family", type : "category", color : "#2ca02c"},
    {tag : "Sexual-Identity", type : "category", color : "#d62728"},
    {tag : "Geographical-Places", type : "category", color : "#9467bd"},
    {tag         : "Organizations", type : "category", color : "#8c564b",
      description : "Organizations or groups you are a part of.",
      example     : ["political parties", "clubs", "charity organizations"]},
    {tag         : "Freetime", type : "category", color : "#e377c2",
      description : "The things you do in your freetime.",
      example     : ["the sports you like to do or watch", "the books or magazines you like to read",
        "the media you like to use or watch", "the arts or handicrafts you like to do or enjoy"]},
    {tag : "Possessions", type : "category", color : "#7f7f7f", description : "The things you own."},
    {tag : "Products", type : "category", color : "#bcbd22", description : "Brands or products you like to buy"},
    {tag : "World-View", type : "category", color : "#17becf", description : "Your world view and spiritual life."}
  ]
};
