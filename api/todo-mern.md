---
title: 'Todo List MERN'
subTitle: 'Building A Simple Full Crud MERN App'
excerpt: 'I want to be the best. I want to be the best simple and plain, thats what drives me - Kobe Bryant'
featureImage: '/img/todolist.png'
date: '12/25/22'
order: 1001
---

# Separation of Concerns

Separation of concerns in web development is the practice of breaking down a web application into distinct parts that each handles a separate concern, such as the user interface, business logic, and data access. This helps to improve maintainability, scalability, and reusability of the application.

Traditionally Frontend is separated into

HTML: Structure

CSS: Presentation

JS: Functionality

![](/img/htmlcssjs.gif)

# A different way of Separating Concerns with Component Driven Development
![components](https://media.git.generalassemb.ly/user/15881/files/c8fa3780-92ec-11ea-8b7c-8bf723456c19)

<details>

<summary>

## Component Driven Development

#### Click For More

</summary>


Component Driven Development (CDD) is an approach to web development that makes use of reusable components to create a user interface. It is based on the React JavaScript library and is used to create interactive websites, mobile apps, and other user interfaces. React is a JavaScript library created by Facebook with a focus on performance and scalability.

CDD makes use of reusable components, or “widgets”, to create a user interface.

Each component is responsible for rendering a specific part of the user interface, and components can be composed together to create a complete user interface.

React components are written using JavaScript and the React library provides a set of tools to help developers create and manage components.

CDD also makes use of a declarative programming style, which makes it easier to write code that is easier to maintain and debug.

In addition, React's component-driven architecture encourages developers to write modular code, which makes it easier to reuse and update components.

Finally, React supports server-side rendering, which allows developers to create faster and more responsive user interfaces.

</details>



***Component Driven Development is a powerful and efficient approach to web development that is based on the React JavaScript library. It makes use of reusable components and a declarative programming style to create user interfaces that are easy to maintain and debug. Additionally, React supports server-side rendering, which allows developers to create faster and more responsive user interfaces.***


<details>

<summary>

## Declarative Programming

#### Click For More

</summary>

Declarative programming is a programming style in React that focuses on describing the logic of a program, rather than describing the exact steps the program should take to reach a certain outcome. In React, this is achieved by using components, properties, and state.

Components are the basic building blocks of React, and are used to represent pieces of user interface. They are composed of HTML, JavaScript, and other languages, and can be reused in different parts of the application. Properties are used to provide data to components, while state is used to store data.

Declarative programming in React allows developers to focus on the logic of the program, rather than the implementation details. This makes it easier to create responsive, reusable, and testable components. It also allows for rapid development, since changes can be made without needing to rewrite the entire application.

</details>

***Declarative programming in React is an efficient and powerful programming style that allows developers to focus on the logic of their program. It makes applications more responsive and easier to maintain, as well as allowing for faster development.***


<details>

<summary>

## The Virtual DOM

#### Click For More

</summary>

The Virtual DOM is a core concept of React, a JavaScript library used to create user interfaces. The Virtual DOM is a JavaScript representation of the actual DOM, or Document Object Model, which is the tree structure of HTML elements in a web page. The Virtual DOM allows React to make changes to the DOM without having to reload the page or redraw the page.

The Virtual DOM works by creating a virtual representation of the current DOM and comparing it to the desired state of the DOM. When a change is made, React runs a diffing algorithm which looks for differences between the virtual DOM and the actual DOM. The diffing algorithm then determines which parts of the DOM need to be changed and updates only those parts, instead of having to redraw the entire page. This makes changes to the DOM faster and more efficient.

React's use of the virtual DOM also allows developers to write more efficient code. Instead of having to write code to manipulate the DOM directly, developers can use React's declarative API to describe the desired state of the DOM, and React will handle the rest. This makes it easier for developers to create complex user interfaces and makes their code less prone to errors.

</details>

***The Virtual DOM is a core concept of React that allows it to make changes to the DOM without having to reload the page or redraw the page. It works by creating a virtual representation of the current DOM and comparing it to the desired state of the DOM, and then updating only the parts that need to be changed. This makes it faster and more efficient to make changes to the DOM, as well as easier for developers to create complex user interfaces.***


<details>

<summary>

## React Developer Tools

#### Click for More

</summary>


React Developer Tools is a browser extension for Chrome and Firefox that allows users to inspect and debug React components in their applications. The tool allows developers to see the components, props, state and hierarchy of their React app in an interactive way. It also provides helpful features such as the ability to find components by name, view their source code, and edit them in the browser.

To install React Developer Tools, first open the Chrome Web Store, then search for “React Developer Tools”. The extension should appear in the search results. Click “Add to Chrome”, then confirm the installation. Once the installation is complete, the React Developer Tools icon should appear in the Chrome toolbar. We will be using the `Components Tab` in the React Dev Tools.

The React Developer Tools extension is an invaluable tool for React developers. It allows developers to easily inspect and debug their components, as well as view their props, state and hierarchy. With these features, React developers are able to more quickly identify and fix problems in their apps.

</details>

***For a new React Learner looking to develop React applications, the React Developer Tools extension is a must-have. With its intuitive interface and helpful features, the extension will provide a wealth of information that can be used to debug and optimize applications. Furthermore, installation is quick and easy, making it a great addition to any React developer’s workflow.***


<details>

<summary>

## Thinking In React

#### Click For More

</summary>

Thinking in React is a concept developed by Facebook to help web developers build user interfaces (UI) more efficiently. It is a component-based approach that focuses on breaking down UI elements into small, reusable components. This allows developers to break down complex tasks into individual, simple parts that can be reused as needed. The main idea behind Thinking in React is to think of the UI as a set of components, or small pieces, that can be moved around, modified, and reused.

Thinking in React requires developers to break down an application into smaller components, each of which has its own state. State is data that is stored within a component, such as a user’s name or what items are in their shopping cart. By breaking down an app into smaller components, developers can more easily manage application state and make sure that updates only affect the component that needs updating.

The Thinking in React approach also encourages developers to use one-way data flow. This means that data flows from parent components to child components, rather than from child components to parent components. This helps keep components independent and makes it easier to debug and maintain an application.

</details>

***Thinking in React is a great tool for building efficient, reusable user interfaces. It encourages developers to break down complex applications into small, reusable components and to use one-way data flow to keep components independent. This helps developers create robust applications quickly and easily.***

## The useState Hook

The useState hook allows us to generate variables that are special, as updating them would trigger your component and its children to update.

First step is always importing the useState hook.

```js
import { useState } from "react"
```

Inside the body of your component function you can then initiate a state variable. The name convention is "state" for the variable and "setState" for the function that updates the states value.

If I wanted to create state for a counter it would look like this.

```js
// initiate counter at 0, setCounter let's me update counter
const [counter, setCounter] = useState(0)
```

So a simple counter component would look like this...

```js
import { useState } from "react"

export default function Counter(props) {
  // Declare the state
  const [counter, setCounter] = useState(0)

  // Function to add one to the state
  const addOne = () => {
    // sets counter to its current value + 1
    setCounter(counter + 1)
  }

  // The h1 display the counter and button runs addOne function
  return (
    <div>
      <h1>{counter}</h1>
      <button onClick={addOne}>Click Me to Add One</button>
    </div>
  )
}
```

### That's as simple as it gets. What happens when the button is clicked.

- setCounter is passed the current value + 1
- React then compares this new value to the old value of counter
- If they are the same, React does nothing (beware of references as values when it comes to objects and arrays, make sure you understand pass by value vs pass by reference remember the `arthurshouse taraleeshouse example`)
- If they are different then React updates its VirtualDOM based on a re-render of the component and its children
- It then compares the virtualDOM to the real browser DOM and only updates the places in which they differ.

The above process is why variables that are "State" are reactive, meaning the DOM will updates when the value updates. All other variables are not reactive and will not trigger updates when changed.

**NOTE**: If the state is an object or array, make sure you pass a new array or object and not just modify the old one. Objects and Arrays are reference types, so if you pass the old array with modified values the references will still be equal so there will be no update to the DOM.

Example...

Don't do this

```js
// modify the existing state
state[0] = 6
// then setState as the existing state, triggering NO update
setState(state)
```

also don't do this
```js
// these two variables are both pointing to the same position in memory
const updatedState = state
// no update is triggered
setState(updatedState)
```

Do this

```js
// create a unique copy of the array
const updatedState = [...state]
// modify the new array
updatedState[0] = 6
// set the State to the updatedArray, DOM will update
setState(updatedState)
```

## The useEffect Hook

Here is our counter component from earlier with a console.log and second piece of state.

```js
import { useState } from "react"

export default function Counter(props) {
  // Declare the state
  const [counter, setCounter] = useState(0)
  // second piece of state
  const [evenCounter, setEvenCounter] = useState(0)

  console.log("I'm just a random log")

  // Function to add one to the state
  const addOne = () => {
    // if counter is even before the update, update evenCounter
    if (counter % 2 === 0) {
      setEvenCounter(evenCounter + 1)
    }
    // sets counter to its current value + 1
    setCounter(counter + 1)
  }

  // The h1 display the counter and button runs addOne function
  return (
    <div>
      <h1>{counter}</h1>
      <h1>{evenCounter}</h1>
      <button onClick={addOne}>Click Me to Add One</button>
    </div>
  )
}
```

So right now this component displays both counter in its JSX

- when we click the button counter will always go up by 1
- if counter is even before it is increased, evenCounter will go

Any code in the function body will run again on every render of the component. The component will render with every change of state. So in this case if we keep clicking the button that console.log will run again and again.

What if we only want it to run when evenCounter changes.

This is where the useEffect hook comes into play. This hook is a function that takes two arguments:

- A function that will be run immediately when the component loads and anytime any value in the second argument changes
- An array of values, when they change the function will run again. Usually an empty array if you never want the function to run again.

```js
import { useState, useEffect } from "react"

export default function Counter(props) {
  // Declare the state
  const [counter, setCounter] = useState(0)
  // second piece of state
  const [evenCounter, setEvenCounter] = useState(0)

  //making sure console.log only runs on certain renders
  useEffect(() => {
    console.log("I'm just a random log")
  }, [evenCounter])

  // Function to add one to the state
  const addOne = () => {
    // if counter is even before the update, update evenCounter
    if (counter % 2 === 0) {
      setEvenCounter(evenCounter + 1)
    }
    // sets counter to its current value + 1
    setCounter(counter + 1)
  }

  // The h1 display the counter and button runs addOne function
  return (
    <div>
      <h1>{counter}</h1>
      <h1>{evenCounter}</h1>
      <button onClick={addOne}>Click Me to Add One</button>
    </div>
  )
}
```

So notice the useEffect receives a function that executes our log, and we also gave it an array with evenCounter in it. This means...

- The function will run once when the component is first loaded
- The function will run again only when evenCounter changes

useEffect is more regularly used for API calls. Usually you'll call the API, get the data then update state inside a useEffect to prevent an infinite loop from occurring.

```js
const getSomethingFromAPI = async(url) => {
 try {
  const response = await fetch(url)
  const data = await response.json()
  setState(data)
 }catch(e){
    console.error(e)
 }
}
useEffect(() => {
  getSomethingFromAPI('api url')
}, [])
```

Also if the function given to useEffect returns a function, the returned function will be run when the component is removed from the DOM useful for removing event listeners that may be left behind (not something that should come up often)


## Problem Solving

ALLLLLLL MY STUDENTS ALWAYS end up being asked at some point in the interview process how to create a Todo List with Basic CRUD capability.

***Creating New Todo Items***

***Reading/Seeing Todos***

***Updating Todos that have been created***

***Deleting Todos off the Page***


## Part 1 Making The API & Connecting it to a React App

<div class="iframe-container">
<iframe src="https://www.youtube.com/embed/u-qbgNNIky8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
[GitHub Code](https://github.com/arthurbernierjr/todoyoutube)

## Part 2 Using Components to Properly Separate Concerns

<div class="iframe-container">
<iframe src="https://www.youtube.com/embed/_oOXfYrVGHs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

[GitHub Code](https://github.com/arthurbernierjr/todoyoutubepart2)

## Part 3 Using CSS Modules to Properly Style Components

# In this video we will be using CSS Modules


CSS Modules in JavaScript is a way of writing modularized CSS code, which is locally scoped and composable. This means that each CSS file can only be accessed within the module it is defined in, allowing for better modularity, which makes styles more maintainable and reusable. The syntax for CSS Modules is the same as regular CSS, but with a few extra features. The main feature is the use of the :local() selector, which allows you to assign a unique class name to a given style rule. This unique class name is then used in the HTML file to reference the specific style. This makes it easier to avoid naming collisions and keep code organized.

<div class="iframe-container">
<iframe src="https://www.youtube.com/embed/OUBVBgPbyNA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

[GitHub Code](https://github.com/arthurbernierjr/todoyoutubepart3)

In a **CSS Module** all class names and animation names are scoped locally by default. All URLs (`url(...)`) and `@imports` are in module request format (`./xxx` and `../xxx` means relative, `xxx` and `xxx/yyy` means in modules folder, i. e. in `node_modules`).

CSS Modules compile to a low-level interchange format called ICSS or [Interoperable CSS](https://github.com/css-modules/icss), but are written like normal CSS files:

``` css
/* style.css */
.className {
  color: green;
}
```

When importing the **CSS Module** from a JS Module, it exports an object with all mappings from local names to global names.

``` js
import styles from "./style.css";
// import { className } from "./style.css";

element.innerHTML = '<div class="' + styles.className + '">';
```

***or in React***


```js
import styles from './ComponentName.module.css'

export default function ComponentName(props){
  return (
    <>
      <div className={styles.className}>
        Hello World
      </div>
    </>
  )
}
```

## Usage with preprocessors like SASS/SCSS

```scss
.card {
  &Title {
    color: green;
  }
}
```

```js
import styles from './ComponentName.module.scss'

export default function ComponentName(props){
  return (
    <>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Green Text</h2>
      </div>
    </>
  )
}
```
## SCSS

SCSS (Sassy CSS) is a preprocessor language that is used to extend the capabilities of CSS. It provides features like variables, nesting, mixins, and functions to help make CSS easier to maintain and extend. SCSS code is compiled into regular CSS code, which is then used to style the web page.

## Why CSS Modules with SCSSS?

**modular** and **reusable** CSS!

* No more conflicts.
* Explicit dependencies.
* No global scope.
* Built in Specificity with nesting

## CSS Modules Examples and Sources

* [CSS Modules Webpack Demo](https://github.com/css-modules/webpack-demo)
* [PostCSS Modules Example](https://github.com/outpunk/postcss-modules-example)
* [Theming](docs/theming.md)
* [CSS Modules Browserify Demo](https://github.com/css-modules/browserify-demo)
* [X-team Starting CSS Modules](https://github.com/x-team/starting-css-modules)
* [CSS Modules Readme](https://github.com/css-modules/css-modules/blob/master/README.md)
