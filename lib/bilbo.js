(function(node) {
    "use strict";

    var main;
    var parts;

    if (node) {
        main = global;
        parts = require("parts");
    } else {
        main = window;
        parts = main.parts;
    }

    /**
     * The standard bag.
     *
     * @class bilbo.Bag
     * @constructor
     * @param {string} name The bag's name
     */
    var Bag = parts.tokens(function (
        name,
        stuff
    ) {
        return parts.type(function(myName) {
            name.mark(this, myName);
            stuff.mark(this, {});
        }).

        proto({

            /**
             * Tries to grab a stored stuff. If a given thing can't be found
             * within the bag, it throws an error.
             *
             * @method grab
             * @for bilbo.Bag
             * @param {string} name The thing's name
             * @return {mixed}
             */
            grab: function(name) {
                if (!this[stuff].hasOwnProperty(name)) {
                    throw new Error("Couldn't find stuff: " + name);
                }

                return this[stuff][name].apply(null);
            },

            /**
             * Stores an object within this bag under a given name. When
             * <code>grab</code> is called, it will give a new object
             * having the previous object as prototype.
             *
             * @method prototype
             * @for bilbo.Bag
             * @param {string} name The given name
             * @param {object} proto The object to be used as prototype
             */
            prototype: function(name, proto) {
                this[stuff][name] = function() {
                    var F = function() {};
                    F.prototype = proto;
                    return new F();
                };
            },

            /**
             * Stores something within the bag itself. When
             * <code>grab</code> is called, it will give it back as is.
             *
             * @method stuff
             * @for bilbo.Bag
             * @param {string} name The given name
             * @param {mixed} thing The thing to be stored
             */
            stuff: function(name, thing) {
                this[stuff][name] = parts.constant(thing);
            },

            /**
             * Stores a lazy initializer. When <code>grab</code> is
             * called, it will call the lazy function and return it's value.
             * Subsequent calls will always receive the same value.
             *
             * @method lazy
             * @for bilbo.Bag
             * @param {string} name The given name
             * @param {function} lazy The lazy function
             */
            lazy: parts.that(function(that, name, lazy) {
                this[stuff][name] = function() {
                    var thing = lazy.apply(null);
                    that.stuff(name, thing);
                    return thing;
                };
            }),

            /**
             * Stores a factory function. When <code>grab</code> is
             * called, it will call the factory function and return it's
             * value.
             *
             * @method factory
             * @for bilbo.Bag
             * @param {string} name The given name
             * @param {function} factory The factory function
             */
            factory: function(name, factory) {
                this[stuff][name] = function() {
                    return factory.apply(null);
                };
            },

            /**
             * Stores a constructor to be used as a singleton. When
             * <code>grab</code> is called, it will instantiate the object
             * using the <code>type</code> as a constructor for it.
             * Subsequent calls will always receive the same instance.
             *
             * @method type
             * @for bilbo.Bag
             * @param {string} name The given name
             * @param {function} T The singleton constructor
             */
            singleton: function(name, T) {
                this.lazy(name, function() { return new T(); });
            },

            /**
             * Stores a constructor to be used as a type constructor. When
             * <code>grab</code> is called, it will instantiate the object
             * using the <code>type</code> as a constructor for it.
             *
             * @method singleton
             * @for bilbo.Bag
             * @param {string} name The given name
             * @param {function} T The type constructor
             */
            type: function(name, T) {
                this[stuff][name] = function() { return new T(); };
            }
        });
    });

    /**
     * Bilbo baggins!
     *
     * @class bilbo.Bilbo
     * @constructor
     */
    var Bilbo = parts.tokens(function (bags) {
        return parts.type(function () {
            bags.mark(this, {});
        }).

        constant({

            /**
             * Creates another standalone instance of Bilbo.
             *
             * @method standalone
             * @for bilbo.Bilbo
             * @static
             * @return {bilbo.Bilbo}
             */
            standalone: function () {
                return new Bilbo();
            }
        }).

        proto({

            /**
             * Creates another standalone instance of Bilbo.
             *
             * @method standalone
             * @for bilbo.Bilbo
             * @return {bilbo.Bilbo}
             */
            standalone: function () {
                return this.constant("standalone")();
            },

            /**
             * Retrieves or creates a new bag
             *
             * @method bag
             * @for bilbo.Bilbo
             * @param {string} name The bag's name
             * @return {bilbo.Bag}
             */
            bag: function(name) {
                name = String(name);

                if (!this[bags].hasOwnProperty(name)) {
                    this[bags][name] = new Bag(name);
                }

                return this[bags][name];
            },

            /**
             * Throws away all stored bags
             *
             * @method vanish
             * @for bilbo.Bilbo
             */
            vanish: function () {
                this[bags] = {};
            }
        });
    });

    var bilbo = new Bilbo();

    if (node) {
        module.exports = bilbo;
    } else {
        main.bilbo = bilbo;
    }

}(typeof exports !== "undefined" && global.exports !== exports));