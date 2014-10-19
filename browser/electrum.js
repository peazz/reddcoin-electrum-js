require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
    bip44 : {
        purpose : "44",
        // Reddcoin type is 4. @TODO Switch to this soon.
        // coin_type : "4",
        coin_type : "0"
    },

    bitcoreModules : [
//        'lib/Address',
//        'lib/AuthMessage',
//        'lib/Base58',
        'lib/HierarchicalKey',
//        'lib/BIP21',
        'lib/BIP39',
        'lib/BIP39WordlistEn',
//        'lib/Block',
//        'lib/Bloom',
//        'lib/Connection',
//        'lib/Deserialize',
//        'lib/ECIES',
//        'lib/Electrum',
//        'lib/Message',
//        'lib/NetworkMonitor',
//        'lib/Opcode',
//        'lib/PayPro',
//        'lib/Peer',
//        'lib/PeerManager',
//        'lib/PrivateKey',
//        'lib/RpcClient',
//        'lib/Key',
//        'lib/Point',
//        'lib/SIN',
//        'lib/SINKey',
//        'lib/Script',
//        'lib/ScriptInterpreter',
//        'lib/SecureRandom',
//        'lib/sjcl',
//        'lib/Transaction',
//        'lib/TransactionBuilder',
//        'lib/Wallet',
        'lib/WalletKey',
//        'patches/Buffers.monkey',
//        'patches/Number.monkey',
//        'config',
//        'const',
//        'networks',
//        'util/log',
//        'util/util',
//        'util/EncodedData',
//        'util/VersionedData',
//        'util/BinaryParser'
    ]
}
},{}],2:[function(require,module,exports){
var hdAccount = require("./HdAccount");
var instantiable = require("../attributes/Instantiable");
var stampit = require('stampit');

module.exports = {
    account : function(index, masterPrivateKey){
        var account = stampit.compose(instantiable, hdAccount).create();
        account.instantiate(index, masterPrivateKey);
        return account;
    }
};



},{"../attributes/Instantiable":5,"./HdAccount":4,"stampit":27}],3:[function(require,module,exports){
var stampit = require('stampit');
var instantiable = require("../attributes/Instantiable");
var bitcore = bitcore || require('bitcore');
var WalletKey = bitcore.WalletKey;

var Address = stampit().enclose(function () {
    var data = {
        priv : '',
        pub  : '',
        addr : ''
    };

    this.createFromWalletKey = function (wKey) {
        this.instantiating();

        data.priv = wKey.priv;
        data.pub = wKey.pub;
        data.addr = wKey.addr;
    };

    this.create = function (privateKey) {
        var wKey = new WalletKey();

        wKey.fromObj({ priv : privateKey});

        this.createFromWalletKey(wKey.storeObj());
    };

    this.toString = function(){
        return data.addr;
    };

});

module.exports = {

    create : function (privateKey) {
        var address = stampit.compose(instantiable, Address).create();
        address.create(privateKey);
        return address;
    },

    createFromWalletKey : function (wKey) {
        var address = stampit.compose(instantiable, Address).create();
        address.createFromWalletKey(wKey);
        return address;
    }
};
},{"../attributes/Instantiable":5,"bitcore":undefined,"stampit":27}],4:[function(require,module,exports){
var stampit = require('stampit');
var Address = require('./Address');
var bitcore = bitcore || require('bitcore');
var HierarchicalKey = bitcore.HierarchicalKey;

var HdAccount = stampit().enclose(function() {
    var index,
        changeChain,
        publicChain,
        addresses = [],

        generateAddress = function(chain, index){
            var privateKey = chain.deriveChild(index).eckey.private.toString("hex");

            return Address.create(privateKey);
        },

        generateAddresses = function(chain, count){
            var index;

            for(var i = 0; i < count; i++){
                index = addresses.length;
                addresses[index] = generateAddress(chain, index);
            }
        };


    this.instantiate = function(i, masterPrivateKey){
        var baseDerivation = 'm/' + i + '\'/';
        this.instantiating();
        index = i;
        publicChain = new HierarchicalKey(masterPrivateKey).derive(baseDerivation + '0');
        changeChain = new HierarchicalKey(masterPrivateKey).derive(baseDerivation + '1');

        this.generatePublicAddresses(20);
    };

    this.generatePublicAddresses = function(count){
        var cnt = count || 1;
        generateAddresses(publicChain, cnt);
    };

    this.getAddresses = function(){
        return addresses;
    };

});

module.exports = HdAccount;
},{"./Address":3,"bitcore":undefined,"stampit":27}],5:[function(require,module,exports){
var stampit = require('stampit');

/**
 * This is a simple mixin that will ensure an operation only occurs once during the lifetime of an object.
 *
 * This is useful with a wallet for instance. Once it has built its data structures from one of several methods, we
 * don't want to repeat that initial setup ever again. Simply calling `instantiating` before building will ensure that
 * doesn't happen.
 *
 * @type {*|Object}
 */
var Instantiable = stampit().enclose(function() {
    var operations = {};

    /**
     * Throws an error if an object tries to repeat an operation that should only occur once in its lifetime.
     *
     * @param operationName - The name of the operation that can only occur once.
     */
    this.instantiating = function(operationName){
        operationName = operationName || "instantiate";

        if(operations.hasOwnProperty(operationName)){
            throw new Error("Cannot repeat operation: " + operationName);
        }

        operations[operationName] = true;
    };
});

module.exports = Instantiable;
},{"stampit":27}],6:[function(require,module,exports){
var stampit = require('stampit');

var AbstractWallet = stampit().enclose(function(){
    var addresses = [];

    this.addSimpleAddress = function(address){
        addresses.push(address);
    };

    this.getSimpleAddresses = function(){
        return addresses;
    };

    this.isDeterministic = function(){
        return false;
    };
});

module.exports = AbstractWallet;
},{"stampit":27}],7:[function(require,module,exports){
var stampit = require('stampit');
var config = require('../../configuration.js');
var AccountFactory = require('../address/AccountFactory');
var bitcore = bitcore || require('bitcore');
var BIP39 = bitcore.BIP39;
var HierarchicalKey = bitcore.HierarchicalKey;


var Bip32HdWallet = stampit().enclose(function() {
    var masterPublicKey = false,
        masterPrivateKey = false,
        accounts = [],

        getRootDerivation = function(){
            var hardened = "'";
            //something like: "m/44'/0'"
            return 'm/' + config.bip44.purpose + hardened + '/' + config.bip44.coin_type + hardened;
        };

    this.buildFromKeys = function(publicKey, privateKey){
        this.instantiating("Build Wallet");
        //private key is optional, so lets keep it boolean if not provided.
        privateKey = privateKey || false;

        masterPublicKey  = privateKey;
        masterPrivateKey = privateKey;

        accounts.push(AccountFactory.account(0, masterPrivateKey));
    };

    this.buildFromSeed = function(seed){
        var root             = new HierarchicalKey.seed(seed),
            rootXprv         = root.extendedPrivateKeyString(),
            rootDerivation   = getRootDerivation(),
            hkey             = new HierarchicalKey(rootXprv).derive(rootDerivation),
            masterPublicKey  = hkey.extendedPublicKeyString(),
            masterPrivateKey = hkey.extendedPrivateKeyString();

        this.buildFromKeys(masterPublicKey, masterPrivateKey);
    };

    this.buildFromMnemonic = function(mnemonicSeed){
        var seed = BIP39.mnemonic2seed(mnemonicSeed, '');
        this.buildFromSeed(seed);
    };

    this.getAddresses = function(){
        return accounts[0].getAddresses();
    };

    this.isDeterministic = function(){
        return true;
    };

});

module.exports = Bip32HdWallet;
},{"../../configuration.js":1,"../address/AccountFactory":2,"bitcore":undefined,"stampit":27}],8:[function(require,module,exports){
var abstract = require("./AbstractWallet");
var bip32 = require("./Bip32HdWallet");
var instantiable = require("../attributes/Instantiable");
var stampit = require('stampit');

module.exports = {
    standardWallet : function(){
        //return abstract.create();
        return stampit.compose(instantiable, abstract, bip32).create();
    }
};



},{"../attributes/Instantiable":5,"./AbstractWallet":6,"./Bip32HdWallet":7,"stampit":27}],9:[function(require,module,exports){
var forIn = require('mout/object/forIn');

function copyProp(val, key){
    this[key] = val;
}

module.exports = function mixInChain(target, objects){
    var i = 0,
        n = arguments.length,
        obj;
    while(++i < n){
        obj = arguments[i];
        if (obj != null) {
            forIn(obj, copyProp, target);
        }
    }
    return target;
};

},{"mout/object/forIn":22}],10:[function(require,module,exports){


    /**
     * Array forEach
     */
    function forEach(arr, callback, thisObj) {
        if (arr == null) {
            return;
        }
        var i = -1,
            len = arr.length;
        while (++i < len) {
            // we iterate over sparse items since there is no way to make it
            // work properly on IE 7-8. see #64
            if ( callback.call(thisObj, arr[i], i, arr) === false ) {
                break;
            }
        }
    }

    module.exports = forEach;



},{}],11:[function(require,module,exports){
var forEach = require('./forEach');
var makeIterator = require('../function/makeIterator_');

    /**
     * Array map
     */
    function map(arr, callback, thisObj) {
        callback = makeIterator(callback, thisObj);
        var results = [];
        if (arr == null){
            return results;
        }

        var i = -1, len = arr.length;
        while (++i < len) {
            results[i] = callback(arr[i], i, arr);
        }

        return results;
    }

     module.exports = map;


},{"../function/makeIterator_":12,"./forEach":10}],12:[function(require,module,exports){
var prop = require('./prop');
var deepMatches = require('../object/deepMatches');

    /**
     * Converts argument into a valid iterator.
     * Used internally on most array/object/collection methods that receives a
     * callback/iterator providing a shortcut syntax.
     */
    function makeIterator(src, thisObj){
        switch(typeof src) {
            case 'object':
                // typeof null == "object"
                return (src != null)? function(val, key, target){
                    return deepMatches(val, src);
                } : src;
            case 'string':
            case 'number':
                return prop(src);
            case 'function':
                if (typeof thisObj === 'undefined') {
                    return src;
                } else {
                    return function(val, i, arr){
                        return src.call(thisObj, val, i, arr);
                    };
                }
            default:
                return src;
        }
    }

    module.exports = makeIterator;



},{"../object/deepMatches":21,"./prop":13}],13:[function(require,module,exports){


    /**
     * Returns a function that gets a property of the passed object
     */
    function prop(name){
        return function(obj){
            return obj[name];
        };
    }

    module.exports = prop;



},{}],14:[function(require,module,exports){
var kindOf = require('./kindOf');
var isPlainObject = require('./isPlainObject');
var mixIn = require('../object/mixIn');

    /**
     * Clone native types.
     */
    function clone(val){
        switch (kindOf(val)) {
            case 'Object':
                return cloneObject(val);
            case 'Array':
                return cloneArray(val);
            case 'RegExp':
                return cloneRegExp(val);
            case 'Date':
                return cloneDate(val);
            default:
                return val;
        }
    }

    function cloneObject(source) {
        if (isPlainObject(source)) {
            return mixIn({}, source);
        } else {
            return source;
        }
    }

    function cloneRegExp(r) {
        var flags = '';
        flags += r.multiline ? 'm' : '';
        flags += r.global ? 'g' : '';
        flags += r.ignorecase ? 'i' : '';
        return new RegExp(r.source, flags);
    }

    function cloneDate(date) {
        return new Date(+date);
    }

    function cloneArray(arr) {
        return arr.slice();
    }

    module.exports = clone;



},{"../object/mixIn":26,"./isPlainObject":19,"./kindOf":20}],15:[function(require,module,exports){
var clone = require('./clone');
var forOwn = require('../object/forOwn');
var kindOf = require('./kindOf');
var isPlainObject = require('./isPlainObject');

    /**
     * Recursively clone native types.
     */
    function deepClone(val, instanceClone) {
        switch ( kindOf(val) ) {
            case 'Object':
                return cloneObject(val, instanceClone);
            case 'Array':
                return cloneArray(val, instanceClone);
            default:
                return clone(val);
        }
    }

    function cloneObject(source, instanceClone) {
        if (isPlainObject(source)) {
            var out = {};
            forOwn(source, function(val, key) {
                this[key] = deepClone(val, instanceClone);
            }, out);
            return out;
        } else if (instanceClone) {
            return instanceClone(source);
        } else {
            return source;
        }
    }

    function cloneArray(arr, instanceClone) {
        var out = [],
            i = -1,
            n = arr.length,
            val;
        while (++i < n) {
            out[i] = deepClone(arr[i], instanceClone);
        }
        return out;
    }

    module.exports = deepClone;




},{"../object/forOwn":23,"./clone":14,"./isPlainObject":19,"./kindOf":20}],16:[function(require,module,exports){
var isKind = require('./isKind');
    /**
     */
    var isArray = Array.isArray || function (val) {
        return isKind(val, 'Array');
    };
    module.exports = isArray;


},{"./isKind":17}],17:[function(require,module,exports){
var kindOf = require('./kindOf');
    /**
     * Check if value is from a specific "kind".
     */
    function isKind(val, kind){
        return kindOf(val) === kind;
    }
    module.exports = isKind;


},{"./kindOf":20}],18:[function(require,module,exports){
var isKind = require('./isKind');
    /**
     */
    function isObject(val) {
        return isKind(val, 'Object');
    }
    module.exports = isObject;


},{"./isKind":17}],19:[function(require,module,exports){


    /**
     * Checks if the value is created by the `Object` constructor.
     */
    function isPlainObject(value) {
        return (!!value
            && typeof value === 'object'
            && value.constructor === Object);
    }

    module.exports = isPlainObject;



},{}],20:[function(require,module,exports){


    var _rKind = /^\[object (.*)\]$/,
        _toString = Object.prototype.toString,
        UNDEF;

    /**
     * Gets the "kind" of value. (e.g. "String", "Number", etc)
     */
    function kindOf(val) {
        if (val === null) {
            return 'Null';
        } else if (val === UNDEF) {
            return 'Undefined';
        } else {
            return _rKind.exec( _toString.call(val) )[1];
        }
    }
    module.exports = kindOf;


},{}],21:[function(require,module,exports){
var forOwn = require('./forOwn');
var isArray = require('../lang/isArray');

    function containsMatch(array, pattern) {
        var i = -1, length = array.length;
        while (++i < length) {
            if (deepMatches(array[i], pattern)) {
                return true;
            }
        }

        return false;
    }

    function matchArray(target, pattern) {
        var i = -1, patternLength = pattern.length;
        while (++i < patternLength) {
            if (!containsMatch(target, pattern[i])) {
                return false;
            }
        }

        return true;
    }

    function matchObject(target, pattern) {
        var result = true;
        forOwn(pattern, function(val, key) {
            if (!deepMatches(target[key], val)) {
                // Return false to break out of forOwn early
                return (result = false);
            }
        });

        return result;
    }

    /**
     * Recursively check if the objects match.
     */
    function deepMatches(target, pattern){
        if (target && typeof target === 'object') {
            if (isArray(target) && isArray(pattern)) {
                return matchArray(target, pattern);
            } else {
                return matchObject(target, pattern);
            }
        } else {
            return target === pattern;
        }
    }

    module.exports = deepMatches;



},{"../lang/isArray":16,"./forOwn":23}],22:[function(require,module,exports){


    var _hasDontEnumBug,
        _dontEnums;

    function checkDontEnum(){
        _dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];

        _hasDontEnumBug = true;

        for (var key in {'toString': null}) {
            _hasDontEnumBug = false;
        }
    }

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forIn(obj, fn, thisObj){
        var key, i = 0;
        // no need to check if argument is a real object that way we can use
        // it for arrays, functions, date, etc.

        //post-pone check till needed
        if (_hasDontEnumBug == null) checkDontEnum();

        for (key in obj) {
            if (exec(fn, obj, key, thisObj) === false) {
                break;
            }
        }

        if (_hasDontEnumBug) {
            while (key = _dontEnums[i++]) {
                // since we aren't using hasOwn check we need to make sure the
                // property was overwritten
                if (obj[key] !== Object.prototype[key]) {
                    if (exec(fn, obj, key, thisObj) === false) {
                        break;
                    }
                }
            }
        }
    }

    function exec(fn, obj, key, thisObj){
        return fn.call(thisObj, obj[key], key, obj);
    }

    module.exports = forIn;



},{}],23:[function(require,module,exports){
var hasOwn = require('./hasOwn');
var forIn = require('./forIn');

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forOwn(obj, fn, thisObj){
        forIn(obj, function(val, key){
            if (hasOwn(obj, key)) {
                return fn.call(thisObj, obj[key], key, obj);
            }
        });
    }

    module.exports = forOwn;



},{"./forIn":22,"./hasOwn":24}],24:[function(require,module,exports){


    /**
     * Safer Object.hasOwnProperty
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     module.exports = hasOwn;



},{}],25:[function(require,module,exports){
var hasOwn = require('./hasOwn');
var deepClone = require('../lang/deepClone');
var isObject = require('../lang/isObject');

    /**
     * Deep merge objects.
     */
    function merge() {
        var i = 1,
            key, val, obj, target;

        // make sure we don't modify source element and it's properties
        // objects are passed by reference
        target = deepClone( arguments[0] );

        while (obj = arguments[i++]) {
            for (key in obj) {
                if ( ! hasOwn(obj, key) ) {
                    continue;
                }

                val = obj[key];

                if ( isObject(val) && isObject(target[key]) ){
                    // inception, deep merge objects
                    target[key] = merge(target[key], val);
                } else {
                    // make sure arrays, regexp, date, objects are cloned
                    target[key] = deepClone(val);
                }

            }
        }

        return target;
    }

    module.exports = merge;



},{"../lang/deepClone":15,"../lang/isObject":18,"./hasOwn":24}],26:[function(require,module,exports){
var forOwn = require('./forOwn');

    /**
    * Combine properties from all the objects into first one.
    * - This method affects target object in place, if you want to create a new Object pass an empty object as first param.
    * @param {object} target    Target Object
    * @param {...object} objects    Objects to be combined (0...n objects).
    * @return {object} Target Object.
    */
    function mixIn(target, objects){
        var i = 0,
            n = arguments.length,
            obj;
        while(++i < n){
            obj = arguments[i];
            if (obj != null) {
                forOwn(obj, copyProp, target);
            }
        }
        return target;
    }

    function copyProp(val, key){
        this[key] = val;
    }

    module.exports = mixIn;


},{"./forOwn":23}],27:[function(require,module,exports){
/**
 * Stampit
 **
 * Create objects from reusable, composable behaviors.
 **
 * Copyright (c) 2013 Eric Elliott
 * http://opensource.org/licenses/MIT
 **/
'use strict';
var forEach = require('mout/array/forEach');
var mixIn = require('mout/object/mixIn');
var merge = require('mout/object/merge');
var map = require('mout/array/map');
var forOwn = require('mout/object/forOwn');
var mixInChain = require('./mixinchain.js');
var slice = [].slice;

// Avoiding JSHist W003 violations.
var create, extractFunctions, stampit, compose, isStamp, convertConstructor;

create = function (o) {
  if (arguments.length > 1) {
    throw new Error('Object.create implementation only accepts the first parameter.');
  }
  function F() {}

  F.prototype = o;
  return new F();
};

if (!Array.isArray) {
  Array.isArray = function (vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
  };
}

extractFunctions = function extractFunctions(arg) {
  if (typeof arg === 'function') {
    return map(slice.call(arguments), function (fn) {
      if (typeof fn === 'function') {
        return fn;
      }
    });
  } else if (typeof arg === 'object') {
    var arr = [];
    forEach(slice.call(arguments), function (obj) {
      forOwn(obj, function (fn) {
        arr.push(fn);
      });
    });
    return arr;
  } else if (Array.isArray(arg)) {
    return slice.call(arg);
  }
  return [];
};

/**
 * Return a factory function that will produce new objects using the
 * prototypes that are passed in or composed.
 *
 * @param  {Object} [methods] A map of method names and bodies for delegation.
 * @param  {Object} [state]   A map of property names and values to clone for each new object.
 * @param  {Function} [enclose] A closure (function) used to create private data and privileged methods.
 * @return {Function} factory A factory to produce objects using the given prototypes.
 * @return {Function} factory.create Just like calling the factory function.
 * @return {Object} factory.fixed An object map containing the fixed prototypes.
 * @return {Function} factory.methods Add methods to the methods prototype. Chainable.
 * @return {Function} factory.state Add properties to the state prototype. Chainable.
 * @return {Function} factory.enclose Add or replace the closure prototype. Not chainable.
 */
stampit = function stampit(methods, state, enclose) {
  var fixed = {
      methods: methods || {},
      state: state,
      enclose: extractFunctions(enclose)
    },

    factory = function factory(properties) {
      var state = merge({}, fixed.state),
        instance = mixIn(create(fixed.methods || {}),
          state, properties),
        closures = fixed.enclose,
        args = slice.call(arguments, 1);

      forEach(closures, function (fn) {
        if (typeof fn === 'function') {
          instance = fn.apply(instance, args) || instance;
        }
      });

      return instance;
    };

  return mixIn(factory, {
    create: factory,
    fixed: fixed,
    /**
     * Take n objects and add them to the methods prototype.
     * @return {Object} stamp  The factory in question (`this`).
     */
    methods: function stampMethods() {
      var obj = fixed.methods || {},
        args = [obj].concat(slice.call(arguments));
      fixed.methods = mixInChain.apply(this, args);
      return this;
    },
    /**
     * Take n objects and add them to the state prototype.
     * @return {Object} stamp  The factory in question (`this`).
     */
    state: function stampState() {
      var obj = fixed.state || {},
        args = [obj].concat(slice.call(arguments));
      fixed.state = mixIn.apply(this, args);
      return this;
    },
    /**
     * Take n functions, an array of functions, or n objects and add
     * the functions to the enclose prototype.
     * @return {Object} The factory in question (`this`).
     */
    enclose: function stampEnclose() {
      fixed.enclose = fixed.enclose
        .concat(extractFunctions.apply(null, arguments));
      return this;
    },
    /**
     * Take one or more factories produced from stampit() and
     * combine them with `this` to produce and return a new factory.
     * Combining overrides properties with last-in priority.
     * @param {[Function]|...Function} factories Stampit factories.
     * @return {Function} A new stampit factory composed from arguments.
     */
    compose: function (factories) {
      var args = Array.isArray(factories) ? factories : slice.call(arguments);
      args = [this].concat(args);
      return compose(args);
    }
  });
};

/**
 * Take two or more factories produced from stampit() and
 * combine them to produce a new factory.
 * Combining overrides properties with last-in priority.
 * @param {[Function]|...Function} factories A factory produced by stampit().
 * @return {Function} A new stampit factory composed from arguments.
 */
compose = function compose(factories) {
  factories = Array.isArray(factories) ? factories : slice.call(arguments);
  var result = stampit(),
    f = result.fixed;
  forEach(factories, function (source) {
    if (source && source.fixed) {
      if (source.fixed.methods) {
        f.methods = mixInChain(f.methods, source.fixed.methods);
      }

      if (source.fixed.state) {
        f.state = mixIn(f.state || {}, source.fixed.state);
      }

      if (source.fixed.enclose) {
        f.enclose = f.enclose.concat(source.fixed.enclose);
      }
    }
  });
  return result;
};

/**
 * Check if an object is a stamp.
 * @param {Object} obj An object to check.
 * @returns {Boolean}
 */
isStamp = function isStamp(obj) {
  return (
    typeof obj === 'function' &&
    typeof obj.fixed === 'object' &&
    typeof obj.methods === 'function' &&
    typeof obj.state === 'function' &&
    typeof obj.enclose === 'function'
    );
};

/**
 * Take an old-fashioned JS constructor and return a stampit stamp
 * that you can freely compose with other stamps.
 * @param  {Function} Constructor
 * @return {Function}             A composable stampit factory
 *                                (aka stamp).
 */
convertConstructor = function convertConstructor(Constructor) {
  return stampit().methods(Constructor.prototype).enclose(Constructor);
};

module.exports = mixIn(stampit, {
  compose: compose,
  /**
   * Alias for mixIn
   */
  extend: mixIn,
  /**
   * Take a destination object followed by one or more source objects,
   * and copy the source object properties to the destination object,
   * with last in priority overrides.
   * @param {Object} destination An object to copy properties to.
   * @param {...Object} source An object to copy properties from.
   * @returns {Object}
   */
  mixIn: mixIn,
  /**
   * Check if an object is a stamp.
   * @param {Object} obj An object to check.
   * @returns {Boolean}
   */
  isStamp: isStamp,

  convertConstructor: convertConstructor
});

},{"./mixinchain.js":9,"mout/array/forEach":10,"mout/array/map":11,"mout/object/forOwn":23,"mout/object/merge":25,"mout/object/mixIn":26}],"electrum":[function(require,module,exports){
module.exports = {
    WalletFactory : require('./lib/wallet/WalletFactory')
}
},{"./lib/wallet/WalletFactory":8}]},{},[]);