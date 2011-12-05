test("module without setup/teardown (default)", function() {
	expect(1);
	ok(true);
});

test("expect in test", 3, function() {
	ok(true);
	ok(true);
	ok(true);
});

test("expect in test", 1, function() {
	ok(true);
});

module("setup test", {
	setup: function() {
		ok(true);
	}
});

test("module with setup", function() {
	expect(2);
	ok(true);
});

module("RiverVertex");

test("Minimal constructor", 2, function() {
  var rv = new RiverVertex(new THREE.Vector3(0, 0, 0));
  ok(rv.riverWidth !== undefined, "riverWidth defined");
  ok(rv.riverWidth > 0, "riverWidth positive");
});

module("Player");

test("Minimal constructor", 1, function() {
  var player = new Player();
  ok(player.update(), "Handle no input gracefully");
});

