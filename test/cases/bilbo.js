(function(node) {
    "use strict";

    var main = node? global: window;
    var gabarito;
    var bilbo;

    if (node) {
        gabarito = require("gabarito");
        bilbo = require("../../lib/bilbo");
    } else {
        gabarito = main.gabarito;
        bilbo = main.bilbo;
    }

    var assert = gabarito.assert;

    var stdBilbo;

    gabarito.add({
        name: "bilbo",

        before: function () {
            stdBilbo = bilbo.standalone();
        },

        "should create a new bag": function() {
            var bag = stdBilbo.bag();
            assert.isObject(bag);
        },

        "should get rid of the bag": function() {
            var bag = stdBilbo.bag();
            stdBilbo.vanish();

            var newBag = stdBilbo.bag();
            assert.areNotSame(bag, newBag);
        },

        "should get a different bag for a different name": function() {
            var bagX = stdBilbo.bag("x");
            var bagY = stdBilbo.bag("y");

            assert.areNotSame(bagX, bagY);
        },

        "should fail when trying to grab something that isn't there": function() {
            var bag = stdBilbo.bag();
            try {
                bag.grab("yo momma's ass");
            } catch (e) {
                assert.areSame("Couldn't find stuff: yo momma's ass", e.message);
            }
        },

        "should grab a stored stuff": function() {
            var o = {};
            var bag = stdBilbo.bag();
            bag.stuff("a", o);
            assert.areSame(o, bag.grab("a"));
        },

        "should grab a new object that has a stored object as prototype": function() {
            var o = { a: {}};
            var bag = stdBilbo.bag();
            bag.prototype("a", o);
            var o2 = bag.grab("a");

            assert.areSame(o.a, o2.a);
            assert.isFalse(o2.hasOwnProperty("a"));
        },

        "should grab a new stuff created by a stored factory": function() {
            var o;
            var factory = function() {
                o = {};
                return o;
            };

            var bag = stdBilbo.bag();
            bag.factory("a", factory);
            var o2 = bag.grab("a");
            assert.areSame(o, o2);
        },

        "should grab a new stuff created by a stored lazy function, that should be called just once": function() {
            var o,
                count = 0,
                lazy = function() {
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
        },

        "shoud grab a new stuff using the stored function as a constructor for it": function() {
            var T = function() {};

            var bag = stdBilbo.bag();
            bag.type("a", T);
            var a = bag.grab("a");
            var b = bag.grab("a");

            assert.isInstanceOf(a, T);
            assert.isInstanceOf(b, T);

            assert.areNotSame(a, b);
        },

        "shoud grab a new stuff using the stored function as a constructor for the singleton ": function() {
            var T = function() {};

            var bag = stdBilbo.bag();
            bag.singleton("a", T);
            var a = bag.grab("a");
            var b = bag.grab("a");

            assert.isInstanceOf(a, T);
            assert.isInstanceOf(b, T);

            assert.areSame(a, b);
        }

    });

}(typeof exports !== "undefined" && global.exports !== exports));