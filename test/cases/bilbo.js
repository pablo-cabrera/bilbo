(function (node) {
    "use strict";

    var main = node? global: window;
    var gabarito;
    var bilbo;
    var parts;

    if (node) {
        gabarito = require("gabarito");
        bilbo = require("../../lib/bilbo");
        parts = require("parts");
    } else {
        gabarito = main.gabarito;
        bilbo = main.bilbo;
        parts = main.parts;
    }

    var assert = gabarito.assert;

    var stdBilbo;

    var mock = function (f) {
        var called = false;
        var mock = parts.args(function (args) {
            try {
                return f.apply(this, args);
            } finally {
                called = true;
            }
        });

        mock.verify = function () {
            if (!called) {
                throw new Error("Function hasn't been called");
            }
        };

        return mock;
    };

    var testRegister = function (register, precious) {
        return function () {
            var o = parts.make()(register, precious).build();
            var bag = stdBilbo.bag();
            bag[precious] = mock(function (n, s) {
                assert.areSame("o", n);
                assert.areSame(s, o);
            });

            bag.register("o", o);
            bag[precious].verify();
        };
    };

    var testRing = function (precious) {
        return testRegister("\u3007", precious);
    };

    var testPrecious = function (precious) {
        return testRegister("precious", precious);
    };

    gabarito.add(parts.make()
    ("name", "bilbo")

    ("before", function () {
        stdBilbo = bilbo.standalone();
    })

    ("should create a new bag", function () {
        var bag = stdBilbo.bag();
        assert.isObject(bag);
    })

    ("should get rid of the bag", function () {
        var bag = stdBilbo.bag();
        stdBilbo.vanish();

        var newBag = stdBilbo.bag();
        assert.areNotSame(bag, newBag);
    })

    ("should get a different bag for a different name", function () {
        var bagX = stdBilbo.bag("x");
        var bagY = stdBilbo.bag("y");

        assert.areNotSame(bagX, bagY);
    })

    ("should fail when trying to grab something that isn't there", function () {
        var bag = stdBilbo.bag();
        try {
            bag.grab("yo momma's ass");
        } catch (e) {
            assert.areSame("Couldn't find stuff: yo momma's ass", e.message);
        }
    })

    ("should grab a stored stuff", function () {
        var o = {};
        var bag = stdBilbo.bag();
        bag.stuff("a", o);
        assert.areSame(o, bag.grab("a"));
    })

    ("should grab a new object that has a stored object as prototype",
    function () {
        var o = { a: {}};
        var bag = stdBilbo.bag();
        bag.prototype("a", o);
        var o2 = bag.grab("a");

        assert.areSame(o.a, o2.a);
        assert.isFalse(o2.hasOwnProperty("a"));
    })

    ("should grab a new stuff created by a stored factory", function () {
        var o;
        var factory = function () {
            o = {};
            return o;
        };

        var bag = stdBilbo.bag();
        bag.factory("a", factory);
        var o2 = bag.grab("a");
        assert.areSame(o, o2);
    })

    ("should grab a new stuff created by a stored lazy function, that should " +
            "be called just once",
    function () {
        var o,
            count = 0,
            lazy = function () {
                o = {};
                count += 1;
                return o;
            };

        var bag = stdBilbo.bag();
        bag.lazy("a", lazy);

        var o2 = bag.grab("a");
        var o3 = bag.grab("a");

        assert.areSame(o, o2);
        assert.areSame(o2, o3);
        assert.areSame(1, count);
    })

    ("shoud grab a new stuff using the stored function as a constructor for it",
    function () {
        var T = function () {};

        var bag = stdBilbo.bag();
        bag.type("a", T);
        var a = bag.grab("a");
        var b = bag.grab("a");

        assert.isInstanceOf(a, T);
        assert.isInstanceOf(b, T);

        assert.areNotSame(a, b);
    })

    ("shoud grab a new stuff using the stored function as a constructor for " +
            "the singleton ",
    function () {
        var T = function () {};

        var bag = stdBilbo.bag();
        bag.singleton("a", T);
        var a = bag.grab("a");
        var b = bag.grab("a");

        assert.isInstanceOf(a, T);
        assert.isInstanceOf(b, T);

        assert.areSame(a, b);
    })

    ("should register a function as a singleton", function () {
        var f = function () {};
        var bag = stdBilbo.bag();
        bag.register("f", f);
        var i = bag.grab("f");
        assert.isInstanceOf(i, f);
        assert.areSame(i, bag.grab("f"));
    })

    ("should register an object as a stuff", function () {
        var o = {};
        var bag = stdBilbo.bag();
        bag.register("o", o);
        assert.areSame(o, bag.grab("o"));
    })

    ("should register a thing as a stuff if specified within precious",
    testPrecious("stuff"))

    ("should register a thing as a prototype if specified within precious",
    testPrecious("prototype"))

    ("should register a thing as a type if specified within precious",
    testPrecious("type"))

    ("should register a thing as a factory if specified within precious",
    testPrecious("factory"))

    ("should register a thing as a singleton if specified within precious",
    testPrecious("singleton"))

    ("should register a thing as a lazy if specified within precious",
    testPrecious("lazy"))

    ("should register a thing as a stuff if specified within ring",
    testRing("stuff"))

    ("should register a thing as a prototype if specified within ring",
    testRing("prototype"))

    ("should register a thing as a type if specified within ring",
    testRing("type"))

    ("should register a thing as a factory if specified within ring",
    testRing("factory"))

    ("should register a thing as a singleton if specified within ring",
    testRing("singleton"))

    ("should register a thing as a lazy if specified within ring",
    testRing("lazy"))

    ("dummy", undefined).build());

}(typeof exports !== "undefined" && global.exports !== exports));
