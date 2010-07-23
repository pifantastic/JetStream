/**
 * Set up the test environment
 */
var log = air.Introspector.Console.log;
var cwd = air.File.applicationDirectory;

JetStream.adaptor = new JetStreamAirAdaptor({
	database: cwd.resolvePath("tests/air/database.sqlite")
});

module("AIR");

test("Selecting", function() {
	equals(jet("magical_creatures").length, 5, "Select all creatures");
	equals(jet("magical_creatures[species=Dragon]").length, 2, "Select all dragons");
	equals(jet("magical_creatures").filter(function(creature) { return (creature.age < 30); }).length, 3, "Select all creatures younger than 30");
	equals(jet('magical_creatures[name=Bill]').attr("name"), 'Bill', "Find Bill");
});

test("Updating", function() {
	equals(jet('magical_creatures[name=Bill]').attr("name", 'Bruno').attr("name"), 'Bruno', "Change Bill's name to Bruno");
});