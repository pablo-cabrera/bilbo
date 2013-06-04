(function(global) {
    "use strict";

    var bags = {},

        slice = function(a, s, e) {
            return Array.prototype.slice.call(a, s, e);
        },

        hop = function(o, p) {
            return Object.prototype.hasOwnProperty.call(o, p);
        },

        merge = function(a, b) {
            for (var p in b) {
                if (hop(b, p)) {
                    a[p] = b[p];
                }
            }
        },

        type = function(specs) {
            var constr = specs.constr || function() {};
            if (specs.proto) {
                merge(constr.prototype, specs.proto);
            }

            constr.descend = function(specs) {
                var child = specs.constr || function() {},
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

        Bag = type({

            constr: function(name) {
                this._name = name;
                this._stuff = {};
            },

            proto: {

                vanish: function() {
                    this.empty();
                    delete bags[this._name];
                },

                empty: function() {
                    this._stuff = {};
                },

                grab: function(name) {
                    if (!this._stuff.hasOwnProperty(name)) {
                        throw new Error("Couldn't find stuff: " + name);
                    }

                    return this._stuff[name].apply(null, slice(arguments, 1));
                },

                prototype: function(name, proto) {
                    this._stuff[name] = function() {
                        var F = function() {};
                        F.prototype = proto;
                        return new F();
                    };
                },

                stuff: function(name, singleton) {
                    this._stuff[name] = function() {
                        return singleton;
                    };
                },

                singleton: function(name, type) {
                    var F = function() {};
                    F.prototype = type.prototype;
                    this.lazy(name, function() {
                        var stuff = new F(),
                            result = type.apply(stuff, slice(arguments));

                        if (Object.prototype.toString.call(result) === "[object Object]") {
                            stuff = result;
                        }
                        return stuff;
                    });
                },

                lazy: function(name, builder) {
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

                factory: function(name, factory) {
                    this._stuff[name] = function() {
                        return factory.apply(null, slice(arguments));
                    };
                },

                type: function(name, type) {
                    var F = function() {};
                    F.prototype = type.prototype;
                    this._stuff[name] = function() {
                        var stuff = new F(),
                            result = type.apply(stuff, slice(arguments));

                        if (Object.prototype.toString.call(result) === "[object Object]") {
                            stuff = result;
                        }

                        return stuff;
                    };
                }
            }
        }),

        RequiringBag = Bag.descend({
            constr: function(name, root) {
                RequiringBag.ancestor.constructor.call(this, name);
                this._root = root;
            },

            proto: {
                grab: function(name) {
                    if (!this._stuff.hasOwnProperty(name)) {
                        var stuff = require(this._root + name);
                        if (["prototype", "lazy", "singleton", "factory", "type", "stuff"].indexOf(stuff.precious) !== -1) {
                            this[stuff.precious](name, stuff);
                        } else {
                            this.stuff(name, stuff);
                        }

                    }

                    return RequiringBag.ancestor.grab.call(this, name);
                }
            }
        }),

        bilbo = {
            bag: function(name) {
                name = String(name);
                if (!bags.hasOwnProperty(name)) {
                    bags[name] = new Bag(name);
                }

                return bags[name];
            },

            requiringBag: function(name, root) {
                bags[name] = new RequiringBag(name, root);
                return bags[name];
            },

            keep: function(bag) {
                bags[bag._name] = bag;
            },

            vanish: function() {
                bags = {};
            },

            Bag: Bag,
            RequiringBag : RequiringBag
        };

    if (typeof exports !== "undefined" && global.exports !== exports) {
        module.exports = bilbo;
    } else {
        global.bilbo = bilbo;
    }

}(this));