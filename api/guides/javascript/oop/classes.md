---
title: "JavaScript Classes"
subTitle: "Object-Oriented JavaScript"
excerpt: "Classes are syntactic sugar over prototypes - sweet and useful."
featureImage: "/img/js-classes.png"
date: "2026-02-01"
order: 30
---

# Explanation

## Classes in JavaScript

ES6 classes provide a cleaner syntax for creating objects and handling inheritance. Under the hood, they're still prototype-based, but they're much easier to read and write.

### Key Concepts

- **Class**: Blueprint for objects
- **Constructor**: Initializes new instances
- **Methods**: Functions on the class
- **Inheritance**: extends keyword
- **Static**: Class-level methods/properties

---

# Demonstration

## Example 1: Basic Classes

```javascript
// Class declaration
class User {
    // Constructor
    constructor(name, email) {
        this.name = name;
        this.email = email;
        this.createdAt = new Date();
    }

    // Instance method
    greet() {
        return `Hello, I'm ${this.name}!`;
    }

    // Getter
    get displayName() {
        return `${this.name} <${this.email}>`;
    }

    // Setter
    set displayName(value) {
        const [name, email] = value.split(' <');
        this.name = name;
        this.email = email.replace('>', '');
    }

    // Static method
    static createGuest() {
        return new User('Guest', 'guest@example.com');
    }

    // Static property (ES2022)
    static defaultRole = 'user';
}

// Usage
const user = new User('Arthur', 'art@bpc.com');
console.log(user.greet());        // Hello, I'm Arthur!
console.log(user.displayName);    // Arthur <art@bpc.com>

user.displayName = 'Art <art@example.com>';
console.log(user.name);           // Art

const guest = User.createGuest();
console.log(guest.name);          // Guest
console.log(User.defaultRole);    // user
```

## Example 2: Inheritance

```javascript
// Base class
class Animal {
    constructor(name) {
        this.name = name;
    }

    speak() {
        throw new Error('Method not implemented');
    }

    describe() {
        return `${this.constructor.name}: ${this.name}`;
    }
}

// Derived class
class Dog extends Animal {
    constructor(name, breed) {
        super(name);  // Call parent constructor
        this.breed = breed;
    }

    speak() {
        return `${this.name} says Woof!`;
    }

    fetch() {
        return `${this.name} is fetching the ball`;
    }
}

class Cat extends Animal {
    constructor(name, indoor = true) {
        super(name);
        this.indoor = indoor;
    }

    speak() {
        return `${this.name} says Meow!`;
    }

    scratch() {
        return `${this.name} is scratching`;
    }
}

// Polymorphism
const animals = [
    new Dog('Buddy', 'Golden Retriever'),
    new Cat('Whiskers'),
    new Dog('Max', 'German Shepherd')
];

animals.forEach(animal => {
    console.log(animal.speak());
    console.log(animal.describe());
});

// instanceof check
console.log(animals[0] instanceof Dog);    // true
console.log(animals[0] instanceof Animal); // true
console.log(animals[0] instanceof Cat);    // false
```

## Example 3: Private Fields and Methods

```javascript
class BankAccount {
    // Private fields (ES2022)
    #balance = 0;
    #transactions = [];

    constructor(owner, initialDeposit = 0) {
        this.owner = owner;
        if (initialDeposit > 0) {
            this.deposit(initialDeposit);
        }
    }

    // Private method
    #recordTransaction(type, amount) {
        this.#transactions.push({
            type,
            amount,
            balance: this.#balance,
            date: new Date()
        });
    }

    deposit(amount) {
        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }
        this.#balance += amount;
        this.#recordTransaction('deposit', amount);
        return this.#balance;
    }

    withdraw(amount) {
        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }
        if (amount > this.#balance) {
            throw new Error('Insufficient funds');
        }
        this.#balance -= amount;
        this.#recordTransaction('withdrawal', amount);
        return this.#balance;
    }

    get balance() {
        return this.#balance;
    }

    get transactionHistory() {
        // Return copy to prevent modification
        return [...this.#transactions];
    }

    // Static private field
    static #accountCount = 0;

    static getAccountCount() {
        return BankAccount.#accountCount;
    }
}

const account = new BankAccount('Arthur', 1000);
console.log(account.balance);           // 1000
account.deposit(500);
account.withdraw(200);
console.log(account.balance);           // 1300
console.log(account.transactionHistory);

// Cannot access private fields
// console.log(account.#balance);       // SyntaxError
```

## Example 4: Mixins and Composition

```javascript
// Mixin functions
const TimestampMixin = (Base) => class extends Base {
    constructor(...args) {
        super(...args);
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    touch() {
        this.updatedAt = new Date();
        return this;
    }
};

const SerializableMixin = (Base) => class extends Base {
    toJSON() {
        return { ...this };
    }

    static fromJSON(json) {
        const data = typeof json === 'string' ? JSON.parse(json) : json;
        return Object.assign(new this(), data);
    }
};

const ValidatableMixin = (Base) => class extends Base {
    validate() {
        const errors = [];
        for (const [field, rules] of Object.entries(this.constructor.validations || {})) {
            for (const rule of rules) {
                const error = rule(this[field], field);
                if (error) errors.push(error);
            }
        }
        return errors;
    }

    isValid() {
        return this.validate().length === 0;
    }
};

// Apply mixins
class User extends TimestampMixin(SerializableMixin(ValidatableMixin(class {}))) {
    static validations = {
        name: [
            (v, f) => !v ? `${f} is required` : null,
            (v, f) => v && v.length < 2 ? `${f} too short` : null
        ],
        email: [
            (v, f) => !v ? `${f} is required` : null,
            (v, f) => v && !v.includes('@') ? `${f} is invalid` : null
        ]
    };

    constructor(name, email) {
        super();
        this.name = name;
        this.email = email;
    }
}

const user = new User('Arthur', 'art@bpc.com');
console.log(user.createdAt);      // Date
console.log(user.isValid());      // true
console.log(user.toJSON());       // { name, email, createdAt, updatedAt }

const invalidUser = new User('', 'invalid');
console.log(invalidUser.validate()); // ['name is required', 'email is invalid']
```

## Example 5: Factory Pattern

```javascript
// Factory function alternative to classes
function createUser(name, email) {
    // Private state (closure)
    let _password = null;

    return {
        name,
        email,

        setPassword(password) {
            _password = hashPassword(password);
        },

        checkPassword(password) {
            return _password === hashPassword(password);
        },

        greet() {
            return `Hello, I'm ${this.name}!`;
        }
    };
}

// Class-based factory
class UserFactory {
    static createAdmin(name, email) {
        const user = new User(name, email);
        user.role = 'admin';
        user.permissions = ['read', 'write', 'delete', 'admin'];
        return user;
    }

    static createModerator(name, email) {
        const user = new User(name, email);
        user.role = 'moderator';
        user.permissions = ['read', 'write', 'delete'];
        return user;
    }

    static createUser(name, email) {
        const user = new User(name, email);
        user.role = 'user';
        user.permissions = ['read', 'write'];
        return user;
    }
}

const admin = UserFactory.createAdmin('Arthur', 'art@bpc.com');
const mod = UserFactory.createModerator('Sarah', 'sarah@example.com');
```

**Key Takeaways:**
- Classes are syntactic sugar over prototypes
- Use `super()` to call parent constructor
- Private fields use `#` prefix
- Mixins enable composition over inheritance
- Factories provide flexible object creation

---

# Imitation

### Challenge 1: Create an Event Emitter Class

**Task:** Build an EventEmitter class with on, off, and emit methods.

<details>
<summary>Solution</summary>

```javascript
class EventEmitter {
    #events = new Map();

    on(event, callback) {
        if (!this.#events.has(event)) {
            this.#events.set(event, []);
        }
        this.#events.get(event).push(callback);
        return this;
    }

    off(event, callback) {
        if (!this.#events.has(event)) return this;

        if (callback) {
            const callbacks = this.#events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        } else {
            this.#events.delete(event);
        }
        return this;
    }

    emit(event, ...args) {
        if (!this.#events.has(event)) return false;

        this.#events.get(event).forEach(callback => {
            callback.apply(this, args);
        });
        return true;
    }

    once(event, callback) {
        const wrapper = (...args) => {
            callback.apply(this, args);
            this.off(event, wrapper);
        };
        return this.on(event, wrapper);
    }
}

// Usage
const emitter = new EventEmitter();

emitter.on('message', (msg) => console.log('Received:', msg));
emitter.emit('message', 'Hello!');

emitter.once('connect', () => console.log('Connected!'));
emitter.emit('connect');  // Logs once
emitter.emit('connect');  // Nothing
```

</details>

---

# Practice

### Exercise 1: State Machine
**Difficulty:** Intermediate

Create a StateMachine class with:
- Defined states and transitions
- Guards for transitions
- Event hooks

### Exercise 2: Observable Collection
**Difficulty:** Advanced

Build an ObservableArray class:
- Extends Array
- Emits events on changes
- Supports computed properties

---

## Summary

**What you learned:**
- Class syntax and constructors
- Inheritance with extends
- Private fields and methods
- Mixins for composition
- Factory patterns

**Next Steps:**
- Read: [Prototypes](/api/guides/javascript/oop/prototypes)
- Practice: Convert factory functions to classes
- Build: Plugin system with classes

---

## Resources

- [MDN: Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [JavaScript.info: Class](https://javascript.info/class)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
