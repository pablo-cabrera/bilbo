(function(global) {
    "use strict";

    var bags = {},

        slice = function(a, s, e) {
            return Array.prototype.slice.call(a, s, e);
        },

        hop = function(o, p) {
            return Object.prototype.hasOwnProperty.call(o, p);
        },

        forEach = function(o, f) {
            for (var p in o) {
                if (hop(o, p)) {
                    f(o[p], p);
                }
            }
        },

        merge = function(a, b) {
            forEach(b, function(v, p) {
                a[p] = v;
            });
        },

        builder = function(type) {
            var F = function() {};
            F.prototype = type.prototype;
            return function(args) {
                var stuff = new F(),
                    result = type.apply(stuff, slice(args));

                if (Object.prototype.toString.call(result) === "[object Object]") {
                    stuff = result;
                }

                return stuff;
            };
        },

        type = function(specs) {
            var constr = specs.constr || function() {};
            if (specs.proto) {
                merge(constr.prototype, specs.proto);
            }

            constr.descend = function(specs) {
                var child = specs.constr || function() { return constr.apply(this, slice(arguments)); },
                    F = function() {};

                F.prototype = constr.prototype;
                child.prototype = new F();
                child.prototype.constructor = child;
                child.ancestor = constr.prototype;

                if (specs.proto) {
                    merge(child.prototype, specs.proto);
                }

                return child;
            };

            return constr;
        },

        /**
         * The standard bag.
         *
         * @class bilbo.Bag
         * @constructor
         * @param {string} name The bag's name
         */
        Bag = type({

            constr: function(name) {
                this._name = name;
                this._stuff = {};
            },

            proto: {

                /**
                 * Empties the bag, and vanishes it removing it from bilbo
                 * altogether.
                 *
                 * @method vanish
                 * @for bilbo.Bag
                 */
                vanish: function() {
                    this.empty();
                    delete bags[this._name];
                },

                /**
                 * Empties the bag, removing all stored stuff from within
                 *
                 * @method empty
                 * @for bilbo.Bag
                 */
                empty: function() {
                    this._stuff = {};
                },

                /**
                 * Tries to grab a stored stuff. If a given thing can't be found
                 * within the bag, it throws an error.
                 *
                 * It may also receive aditional arguments if the storage method
                 * supports varargs.
                 *
                 * @method grab
                 * @for bilbo.Bag
                 * @param {string} name The thing's name
                 * @param {mixed...} args Optional arguments passed to stored thing if supported
                 * @return {mixed}
                 */
                grab: function(name) {
                    if (!this._stuff.hasOwnProperty(name)) {
                        throw new Error("Couldn't find stuff: " + name);
                    }

                    return this._stuff[name].apply(null, slice(arguments, 1));
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
                    this._stuff[name] = function() {
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
                    this._stuff[name] = function() {
                        return thing;
                    };
                },

                /**
                 * Stores a lazy initializer. When <code>grab</code> is
                 * called, it will call the lazy function and return it's value.
                 * Subsequent calls will always receive the same value.
                 *
                 * The lazy function may receive aditional arguments upon
                 * calling <code>grab</code> as varargs
                 *
                 * @method lazy
                 * @for bilbo.Bag
                 * @param {string} name The given name
                 * @param {function} lazy The lazy function
                 */
                lazy: function(name, lazy) {
                    var that = this;
                    this._stuff[name] = function() {
                        var stuff;
                        that._stuff[name] = function() {
                            return stuff;
                        };

                        stuff = lazy.apply(null, slice(arguments));
                        return stuff;
                    };
                },

                /**
                 * Stores a factory function. When <code>grab</code> is
                 * called, it will call the factory function and return it's
                 * value.
                 *
                 * The factory function may receive aditional arguments upon
                 * calling <code>grab</code> as varargs
                 *
                 * @method factory
                 * @for bilbo.Bag
                 * @param {string} name The given name
                 * @param {function} factory The factory function
                 */
                factory: function(name, factory) {
                    this._stuff[name] = function() {
                        return factory.apply(null, slice(arguments));
                    };
                },

                /**
                 * Stores a constructor to be used as a singleton. When
                 * <code>grab</code> is called, it will instantiate the object
                 * using the <code>type</code> as a constructor for it.
                 * Subsequent calls will always receive the same instance.
                 *
                 * The constructor may receive aditional arguments upon calling
                 * <code>grab</code> as varargs
                 *
                 * @method type
                 * @for bilbo.Bag
                 * @param {string} name The given name
                 * @param {function} type The singleton constructor
                 */
                singleton: function(name, type) {
                    var singletonBuilder = builder(type);
                    this.lazy(name, function() {
                        return singletonBuilder(arguments);
                    });
                },

                /**
                 * Stores a constructor to be used as a type constructor. When
                 * <code>grab</code> is called, it will instantiate the object
                 * using the <code>type</code> as a constructor for it.
                 *
                 * The constructor may receive aditional arguments upon calling
                 * <code>grab</code> as varargs
                 *
                 * @method singleton
                 * @for bilbo.Bag
                 * @param {string} name The given name
                 * @param {function} type The type constructor
                 */
                type: function(name, type) {
                    var typeBuilder = builder(type);
                    this._stuff[name] = function() {
                        return typeBuilder(arguments);
                    };
                }
            }
        }),

        /**
         * The RequiringBag is a bag that tries to <b>require</b> things when
         * they are not found within. It's intended for <b>production</b> use.
         *
         * It uses the thing's name along with it's given <b>root</b> to locate
         * required things.
         *
         * The require things can <b>hint</b> the RequiringBag to a specific
         * storage method. The requiring bag looks for a property named
         * "precious" or "〇" (Unicode Character 'IDEOGRAPHIC NUMBER ZERO'
         * (U+3007)) within the required thing. The property may have the
         * following values as hints: <b>"prototype"</b>, <b>"lazy"</b>,
         * <b>"singleton"</b>, <b>"factory"</b>, <b>"type"</b>, and
         * <b>"stuff"</b>. The default storage method is <b>"stuff"</b>.
         *
         * @class bilbo.RequiringBag
         * @extends bilbo.Bag
         * @constructor
         * @param {string} name The bag's name
         * @param {string} root The bag's root
         */
        RequiringBag = Bag.descend({
            constr: function(name, root) {
                RequiringBag.ancestor.constructor.call(this, name);
                this._root = root;
            },

            proto: {

                /**
                 * Just like bilbo.Bag's grab method but when it cannot find
                 * stuff within, it tries to require them
                 *
                 * @method grab
                 * @for bilbo.RequiringBag
                 * @param {string} name The thing's name
                 * @return {mixed}
                 */
                grab: function(name) {
                    if (!this._stuff.hasOwnProperty(name)) {
                        var stuff = require(this._root + name),
                            precious = stuff["\u3007"] || stuff.precious;

                        if (["prototype", "lazy", "singleton", "factory", "type", "stuff"].indexOf(precious) !== -1) {
                            this[precious](name, stuff);
                        } else {
                            this.stuff(name, stuff);
                        }
                    }

                    return RequiringBag.ancestor.grab.call(this, name);
                }
            }
        }),

        /**
         * The MockingBag is a bag creates and stores empty objects when things
         * are not found within. It's intended for <b>testing</b> usage.
         *
         * When the bag creates objects it will store them with the "stuff"
         * storage method. Like so, modifying objects will modify created
         * references within.
         *
         * @class bilbo.MockingBag
         * @extends bilbo.Bag
         */
        MockingBag = Bag.descend({
            proto: {

                /**
                 * Just like bilbo.Bag's grab method but when it cannot find
                 * stuff within, it creates a new object and stores within
                 * itself.
                 *
                 * @method grab
                 * @for bilbo.MockingBag
                 * @param {string} name The thing's name
                 * @return {mixed}
                 */
                grab: function(name) {
                    if (!this._stuff.hasOwnProperty(name)) {
                        this.stuff(name, {});
                    }
                    return MockingBag.ancestor.grab.call(this, name);
                }
            }
        }),

        /**
         * Bilbo baggins!
         *
         * @class bilbo
         * @static
         */
        bilbo = {

            /**
             * Retrieves or creates a new bag
             *
             * @method bag
             * @for bilbo
             * @param {string} name The bag's name
             * @return {bilbo.Bag}
             */
            bag: function(name) {
                name = String(name);
                if (!bags.hasOwnProperty(name)) {
                    bags[name] = new Bag(name);
                }

                return bags[name];
            },

            /**
             * Creates and returns a <code>bilbo.RequiringBag</code>
             *
             * @method requiringBag
             * @for bilbo
             * @param {string} name The bag's name
             * @param {string} root The root directory from where to lookup requires
             * @return {bilbo.RequiringBag}
             */
            requiringBag: function(name, root) {
                name = String(name);
                bags[name] = new RequiringBag(name, root);
                return bags[name];
            },

            /**
             * Creates and returns a <code>bilbo.MockingBag</code>
             *
             * @method mockingBag
             * @for bilbo
             * @param {string} name The bag's name
             * @return {bilbo.MockingBag}
             */
            mockingBag: function(name) {
                name = String(name);
                bags[name] = new MockingBag(name);
                return bags[name];
            },

            /**
             * Gives a bag for bilbo to keep
             *
             * @param {bilbo.Bag} ba
             */
            keep: function(bag) {
                bags[bag._name] = bag;
            },

            /**
             * Vanishes all bags reseting bilbo to it's initial state. All bags
             * will be emptied, existing references will still be valid, but all
             * bags will have nothing inside.
             *
             * @method vanish
             * @for bilbo
             */
            vanish: function() {
                forEach(bags, function(b) { b.vanish(); });
            },

            Bag: Bag,
            RequiringBag : RequiringBag,
            MockingBag : MockingBag
        };

    if (typeof exports !== "undefined" && global.exports !== exports) {
        module.exports = bilbo;
    } else {
        global.bilbo = bilbo;
    }

}(this));