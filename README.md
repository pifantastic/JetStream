# JetStream

JetStream tries to bring the beauty and simplicity of the the jQuery API to databases.
    
    // Get all users who are older than 20 years.
    var adults = jet('users').filter(function(user) {
      return (user.age > 20);
    });
    console.log(adults);
    
    // Get all users and print their ages
    jet('users').each(function(i, v) {
      console.log(v.name + " is " + v.age + " years old.");
    });
    
    // Get all users who are in their twenties
    console.log("********** These users are in their twenties ***********");
    jet('users').filter(function(user) {
      return (user.age >= 20 && user.age <= 29);
    }).each(function(i, user) {
      console.log(user.name);
    });
    
    // Show all users
    console.log("********** This is all of the users ***********");
    jet('users').each(function(i, user) {
      console.log(user.name);
    });
    
    // Expressions
    console.log("********** Expressions ***********");
    // Contains
    console.log(jet("users[name*=Aaron]").get());
    // Ends with
    console.log(jet("users[name$=Aaron]").get());
    // Equals
    console.log(jet("users[name=Aaron]").get());
    // Not equal
    console.log(jet("users[name!=Aaron]").get());
    // Starts with
    console.log(jet("users[name^=Aaron]").get());