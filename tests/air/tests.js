/**
 * Set up the test environment
 * 
 * CREATE TABLE "main"."magical_creatures" (
 *   "id" INTEGER PRIMARY KEY NOT NULL , 
 *   "name" VARCHAR, 
 *   "age" INTEGER, 
 *   "strength" INTEGER,
 *   "agility" INTEGER, 
 *   "intelligence" INTEGER,
 *   "species" VARCHAR
 * )
 */
var log = air.Introspector.Console.log;
var database = new air.File(air.File.applicationDirectory.nativePath + "/tests/air/database.sqlite");
database.moveToTrash();

JetStream.adaptor = new JetStreamAirAdaptor({
	database: database,
	primaryKey: "id",
	schema: {
	  magical_creatures: {
	    id: "INTEGER PRIMARY KEY NOT NULL",
	    name: "VARCHAR",
	    age: "INTEGER",
	    strength: "INTEGER",
	    agility: "INTEGER",
	    intelligence: "INTEGER",
	    species: "VARCHAR"
	  }
	}
});

module("AIR");

test("Creating", function() {
  jet("magical_creatures", {name: "Puff", age: 242, strength: 7, agility: 5, intelligence: 2, species: "Dragon"});
  jet("magical_creatures", {name: "Draco", age: 592, strength: 7, agility: 7, intelligence: 9, species: "Dragon"});
  jet("magical_creatures", {name: "Stanley", age: 87, strength: 6, agility: 9, intelligence: 6, species: "Liopleurodon"});
  jet("magical_creatures", {name: "Griff", age: 28, strength: 6, agility: 8, intelligence: 2, species: "Griffin"});
  jet("magical_creatures", {name: "Bill", age: 63, strength: 10, agility: 2, intelligence: 4, species: "Balrog"});
  
  equals(jet("magical_creatures").length, 5, "Inserted 5 rows");
});

test("Selecting", function() {
	equals(jet("magical_creatures").length, 5, "Select all creatures");
	equals(jet("magical_creatures[species='Dragon']").length, 2, "Select all dragons");
	equals(jet('magical_creatures[name=Bill]').attr("name"), 'Bill', "Find Bill");
});

test("Updating", function() {
	equals(jet('magical_creatures[name=Bill]').attr("name", 'Bruno').attr("name"), 'Bruno', "Change Bill's name to Bruno");
});

test("Filtering", function() {
	equals(jet("magical_creatures").filter(function(creature) { return (creature.age < 200); }).length, 3, "Select all creatures younger than 200");
})
