// Define views and templates in the application here

Template.hello.greeting = function () {
  return "Welcome to meteor-seed.";
};

Template.hello.events({
  'click input' : function () {
    // template data, if any, is available in 'this'
    if (typeof console !== 'undefined')
      console.log("You pressed the button");
  }
});
