bilbo [![Build Status](https://travis-ci.org/pablo-cabrera/bilbo.png)](https://travis-ci.org/pablo-cabrera/bilbo)
======

**Bilbo** is a simple dependency injection library for JavaScript. It's intended audience is for **node-js** applications, but it can also be used for **client-side** applications.

He uses [**bags**](#bags) to store and distribute dependencies along your code. **Bags** are identifies by it's **name** within **bilbo**.

```js
var bilbo = require("bilbo");
var bag = bilbo.bag("bag's name");
```

If there is no **bag** with a given **name**, <code>bilbo.bag()</code> will create one.

Fetching things from a **bag** is done by the <code>bag.grab()</code> method. Each thing is identified by it's **name** within the **bag**.

```js
var thing = bag.grab("thing's name");
```


**Bags** can store things in many ways:

- [**stuff**](#stuff): simple storage, no action performed
- [**prototype**](#prototype): stores a prototype object used to create new objects having this one as prototype
- [**factory**](#factory): stores a function to be used as factory each time
- [**lazy**](#lazy): stores a function that initializes an returns something that may be returned every time
- [**type**](#type): stores a constructor function that may be used for creating new instances each time
- [**singleton**](#singleton): stores a constructor function that may be used for create a single instance

### stuff

Just stores something within the bag itself. No modification whatsoever is taken upon the stored data.

```js
var myStuff = {};
 // stores myStuff under "stuff's name"
bag.stuff("stuff's name", myStuff);

// grabs back myStuff using "stuff's name"
var myStuffBack = bag.grab("stuff's name");

myStuff === myStuffBack; // true
```

### prototype

Stores a prototype object. This object will be used as prototype for a newly created object each time <code>bag.grab()</code> is called.

```js
var myPrototype = { a: {} };
// stores myPrototype under "prototype's name"
bag.prototype("prototype's name", myPrototype);

// grabs a new object having myPrototype as prototype using "prototype's name"
var myObject = bag.grab("prototype's name");

myObject.a === myPrototype.a; // true
myObject.hasOwnProperty("a"); // false
```

### factory

Stores a factory function. This function will be used to create new things each time <code>bag.grab()</code> is called.

```js
var myFactory = function() { return {}; };
// stores myFactory under "factory's name"
bag.factory("factory's name", myFactory); 

// grabs oneThing created by the myFactory function
var oneThing = bag.grab("factory's name"); 
// grabs anotherThing created by the myFactory function
var anotherThing = bag.grab("factory's name"); 

oneThing === anotherThing; // false
```

The stored factory function may also receive aditional arguments upon calling <code>bag.grab()</code> like so:

```js
var argsFactory = function(arg1, arg2) {
  return {
    a1: arg1,
    a2: arg2
  };
};
// stores argsFactory under "args factory name"
bag.factory("args factory name", argsFactory);

var arg1 = {};
var arg2 = {};
// grabs someThing created by the argsFactory function passing some arguments
var someThing = bag.grab("args factory name", arg1, arg2);

someThing.a1 === arg1; // true
someThing.a2 === arg2; // true
```

### lazy

Stores a lazy function. This function will be used only once to create a new thing when <code>bag.grab()</code> is called. Subsequent calls will return the same thing created the first time it was called.

```js
var myLazy = function() { return {}; };
// stores myLazy under "lazy's name"
bag.lazy("lazy's name", myLazy); 

// grabs a thing created by the myLazy function
var thing = bag.grab("lazy's name"); 
// grabs the sameThing created by the myLazy function previously
var sameThing = bag.grab("lazy's name"); 

thing === sameThing; // true
```

The stored lazy function may also receive aditional arguments upon calling <code>bag.grab()</code> like so:

```js
var argsLazy = function(arg1, arg2) {
  return {
    a1: arg1,
    a2: arg2
  };
};
// stores argsLazy under "args lazy name"
bag.lazy("args lazy name", argsLazy);

var arg1 = {};
var arg2 = {};
// grabs someLazyThing created by the argsLazy function passing some arguments
var someLazyThing = bag.grab("args lazy name", arg1, arg2);

someLazyThing.a1 === arg1; // true
someLazyThing.a2 === arg2; // true
```

### type

Stores a type constructor function. This function will be used as a constructor to create new type instances each time <code>bag.grab()</code> is called.

```js
var MyConstructor = function() {};
// stores MyConstructor under "type's name"
bag.type("type's name", MyConstructor); 

// grabs anInstance created by the MyConstructor function
var anInstance = bag.grab("type's name"); 
// grabs anotherInstance created by the MyConstructor function
var anotherInstance = bag.grab("type's name"); 

anInstance === anotherInstance; // false
anInstance instanceof MyConstructor; // true
anotherInstance instanceof MyConstructor; // true
```

The stored type constructor function may also receive aditional arguments upon calling <code>bag.grab()</code> like so:

```js
var ArgsConstructor = function(arg1, arg2) {
  this.a1 = arg1;
  this.a2 = arg2;
};
// stores ArgsConstructor under "args type name"
bag.type("args type name", ArgsConstructor);

var arg1 = {};
var arg2 = {};
// grabs someInstance created by the ArgsConstructor function passing some arguments
var someInstance = bag.grab("args type name", arg1, arg2);

someInstance.a1 === arg1; // true
someInstance.a2 === arg2; // true
```

### singleton

Stores a type constructor function as a singleton. This function will be used as a singleton constructor to create a singleton instance once <code>bag.grab()</code> is called. Subsequent calls yields the same singleton instance.

```js
var MySingletonConstructor = function() {};
// stores MySingletonConstructor under "singleton's name"
bag.singleton("singleton's name", MySingletonConstructor); 

// grabs aSingleton created by the MySingletonConstructor function
var aSingleton = bag.grab("singleton's name"); 
// grabs sameSingleton created by the MySingletonConstructor function previously
var sameSingleton = bag.grab("singleton's name"); 

aSingleton === sameSingleton; // true
aSingleton instanceof MySingletonConstructor; // true
```

The stored type constructor function may also receive aditional arguments upon calling <code>bag.grab()</code> like so:

```js
var ArgsSingletonConstructor = function(arg1, arg2) {
  this.a1 = arg1;
  this.a2 = arg2;
};
// stores ArgsSingletonConstructor under "args singleton name"
bag.singleton("args singleton name", ArgsSingletonConstructor);

var arg1 = {};
var arg2 = {};
// grabs someSingleton created by the ArgsSingletonConstructor function passing some arguments
var someSingleton = bag.grab("args singleton name", arg1, arg2);

someSingleton.a1 === arg1; // true
someSingleton.a2 === arg2; // true
```

## bags

**Bilbo** has different types for **bags** for different occasions. 

The standard **Bag** will issue an error whenever you tries to **grab** a stuff that isn't there. For testing purposes, **bilbo** offers a **MockingBag**, that builds mocks objects whenever you tri to graba a stuff that isn't there instead. Lastly, **bilbo** also offers a **RequiringBag** that will try to resolve dependencies on it's own whenever you try to require something that isn't there yet.
