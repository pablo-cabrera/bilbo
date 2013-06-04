(function(global) {
    "use strict";

    var bags = {},

        slice = function(a, n) {
            return Array.prototype.slice.call(a, n);
        },

        Bag = function(name) {
            this._name = name;
            this._stuff = {};
        },

        proto = {
            vanish : function() {
                this._stuff = {};
                delete bags[this._name];
            },

            grab : function(name) {
                if (!this._stuff.hasOwnProperty(name)) {
                    throw new Error("Couldn't find stuff: " + name);
                }

                return this._stuff[name].apply(null, slice(arguments, 1));
            },

            prototype : function(name, proto) {
                this._stuff[name] = function() {
                    var F = function() {};
                    F.prototype = proto;
                    return new F();
                };
            },

            singleton : function(name, singleton) {
                this._stuff[name] = function() {
                    return singleton;
                };
            },

            lazy : function(name, builder) {
                var that = this;
                this._stuff[name] = function() {
                    var stuff;
                    that._stuff[name] = function() {
                        return stuff;
                    };

                    stuff = builder.apply(null, slice(arguments));
                    return stuff;
                };
            },

            factory : function(name, factory) {
                this._stuff[name] = function() {
                    return factory.apply(null, slice(arguments));
                };
            },

            type : function(name, type) {
                var F = function() {};
                F.prototype = type.prototype;
                this._stuff[name] = function() {
                    var stuff = new F();
                    type.apply(stuff, slice(arguments));
                    return stuff;
                };
            }
        },

        bilbo = {
            bag: function(name) {
                name = String(name);
                if (!bags.hasOwnProperty(name)) {
                    bags[name] = new Bag(name);
                }

                return bags[name];
            },

            vanish: function() {
                bags = {};
            },

            Bag: Bag
        };

    for (var p in proto) {
        if (proto.hasOwnProperty(p)) {
            Bag.prototype[p] = proto[p];
        }
    }

    if (typeof exports !== "undefined" && global.exports !== exports) {
        module.exports = bilbo;
    } else {
        global.bilbo = bilbo;
    }

}(this));