(function(global) {
    "use strict";

    var YUITest = global.YUITest || require("yuitest"),
        root = (typeof exports !== "undefined" && global.exports !== exports) ? process.cwd() + "/" : "../",
        bilbo = require(root + "/lib/bilbo"),
        Assert = YUITest.Assert,

        resume = function(f) {
            return function() {
                var args = Array.prototype.slice.call(arguments);
                test.resume(function() {
                    return f.apply(this, args);
                });
            };
        },

        test = new YUITest.TestCase({

            setUp : function() {
                bilbo.vanish();
            },

            _should : {
                error : {
                    "should fail when trying to grab something that isn't there" : "Couldn't find stuff: yo momma's ass"
                }
            },

            name : "bilbo-test",

            "should create a new bag" : function() {
                var bag = bilbo.bag();
                Assert.isObject(bag);
            },

            "should get rid of the bag" : function() {
                var bag = bilbo.bag();
                bag.vanish();

                var newBag = bilbo.bag();
                Assert.areNotSame(bag, newBag);
            },

            "should get a different bag for a different name" : function() {
                var bagX = bilbo.bag("x");
                var bagY = bilbo.bag("y");

                Assert.areNotSame(bagX, bagY);
            },

            "should fail when trying to grab something that isn't there" : function() {
                var bag = bilbo.bag();
                bag.grab("yo momma's ass");
            },

            "should grab a stored singleton" : function() {
                var o = {};
                var bag = bilbo.bag();
                bag.singleton("a", o);
                Assert.areSame(o, bag.grab("a"));
            },

            "should grab a new object that has a stored object as prototype" : function() {
                var o = { a: {}};
                var bag = bilbo.bag();
                bag.prototype("a", o);
                var o2 = bag.grab("a");

                Assert.areSame(o.a, o2.a);
                Assert.isFalse(o2.hasOwnProperty("a"));
            },

            "should grab a new stuff created by a stored factory" : function() {
                var arg1 = {},
                    arg2 = {},
                    o,
                    factory = function(a1, a2) {
                        o = {};
                        Assert.areSame(a1, arg1);
                        Assert.areSame(a2, arg2);
                        return o;
                    };

                var bag = bilbo.bag();
                bag.factory("a", factory);
                var o2 = bag.grab("a", arg1, arg2);
                Assert.areSame(o, o2);
            },

            "should grab a new stuff created by a stored lazy function, that should be called just once" : function() {
                var arg1 = {},
                    arg2 = {},
                    o,
                    count = 0,
                    lazy = function(a1, a2) {
                        o = {};
                        Assert.areSame(a1, arg1);
                        Assert.areSame(a2, arg2);
                        count += 1;
                        return o;
                    };

                var bag = bilbo.bag();
                bag.lazy("a", lazy);

                var o2 = bag.grab("a", arg1, arg2);
                var o3 = bag.grab("a", arg1, arg2);

                Assert.areSame(o, o2);
                Assert.areSame(o2, o3);
                Assert.areSame(1, count);
            }

        });

    YUITest.TestRunner.add(test);
}(this));