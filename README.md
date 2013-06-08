bilbo [![Build Status](https://travis-ci.org/pablo-cabrera/bilbo.png)](https://travis-ci.org/pablo-cabrera/bilbo)
======

**Bilbo** is a simple dependency injection library for JavaScript. It's intended audience is for **node-js** applications, but it can also be used for **client-side** applications.

He uses **bags** to store and distribute dependencies along your code. **Bags** are identifies by it's name within **bilbo**.

```js
var bilbo = require("bilbo");
var bag = bilbo.bag("bag's name");
```

If there is no bag with a given **name**, <code>bilbo.bag()</code> will create one.

Fetching things from the bag is done by the <code>bilbo.grab()</code> method. Each thing is identified by it's **name** within the **bag**.

```js
var thing = bilbo.grab("thing's name");
```


Bags store things in many ways:

- [**stuff**](#stuff): simple storage, no action performed
- [**prototype**](#prototype): stores a prototype object used to create new objects having this one as prototype
- [**factory**](#factory): stores a function to be used as factory each time
- [**lazy**](#lazy): stores a function that initializes an returns something that may be called only once
- [**type**](#type): stores a constructor function that may be used for creating new instances each time
- [**singleton**](#singleton): stores a constructor function that may be used for create a single instance

### stuff

Just stores something within the bag itself. No modification whatsoever is taken upon the stored data.

```js
var myStuff = {};
bag.stuff("stuff's name", myStuff); // stores myStuff under "stuff's name"

var myStuffBack = bag.grab("stuff's name"); // grabs back myStuff using "stuff's name"
myStuff === myStuffBack; // true
```
