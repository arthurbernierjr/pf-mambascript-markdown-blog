---
title: 'Bookmarks MERN'
subTitle: 'Building A Simple Full Crud MERN App'
excerpt: 'I want to be the best. I want to be the best simple and plain, thats what drives me - Kobe Bryant'
featureImage: '/img/3.png'
date: '12/25/22'
order: 1002
---


## Form Handling

There are two ways to handle forms in React.

- **Controlled Forms:** The value of the inputs are bound to state, so value of state and the value of the inputs are always in sync.

- **Uncontrolled Forms:** The forms are not bound by state, instead their values are pulled using a ref when needed.

### Example of a Controlled Form

Parts:

- object holding form values as state
- handleChange function that updates the state when we type into the form
- handleSubmit function to handle form submission and do what you want with the data

```js
import { useState } from "react"

export default function Form(props) {
  //State to hold the form data
  const [form, setForm] = useState({
    name: "",
    age: 0,
  })

  // handleChange function
  const handleChange = event => {
    // dynamically update the state using the event object
    // this function always looks the same
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = event => {
    // prevent page refresh
    event.preventDefault()
    // do what you want with the form data
    console.log(form)
  }

  // The JSX for the form binding the functions and state to our inputs
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={form.name}
        onChange={handleChange}
        name="name"
        placeholder="write name here"
      />
      <input
        type="number"
        value={form.age}
        onChange={handleChange}
        name="age"
        placeholder="write age here"
      />
      <input type="submit" value="Submit Form" />
    </form>
  )
}
```

### Example of an Uncontrolled Form

- a ref created for each input
- handleSubmit for when form is submitted

```js
import { useRef } from "react"

export default function Form(props) {
  // ref to get input values
  const nameInput = useRef(null)
  const ageInput = useRef(null)

  const handleSubmit = event => {
    // prevent page refresh
    event.preventDefault()
    // do what you want with the form data
    console.log({
      name: nameInput.current.value,
      age: ageInput.current.value,
    })
  }

  // The JSX for the form binding the functions and state to our inputs
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" ref={nameInput} placeholder="write name here" />
      <input type="number" ref={ageInput} placeholder="write age here" />
      <input type="submit" value="Submit Form" />
    </form>
  )
}
```



## Part 1 Making The API & Connecting it to a React App

<center>

| **URL** | **HTTP Verb** |  **Action**|
|------------|-------------|------------|
| /api/bookmarks/:id | DELETE    | destroy bookmark  |  
| /api/bookmarks/:id | PUT | update bookmark |
| /api/bookmarks | POST      | create bookmark  |        
| /api/users/login | POST | Login User |
| /api/users/ | POST | Sign Up User |
| /api/users/bookmarks | GET | Get Users Bookmarks |

</center>

## User

```js
name
email
password
bookmarks ref of bookmarks
```
## Bookmark

```js
title
link
```


### Steps
1. Use Create React App to Build App
1. Add .env, server.js, .env.example, Models, Controllers, Routes and Config Folders
1. Add Mongoose, Morgan, Bcrypt and Jsonwebtoken
1. Build Server and config/database
1. Build Bookmark Model and User Model
1. Build Controllers for Bookmark and User
1. Build Router For Bookmarks and User
1. Test Login, SignUp, CreateBookmark, ListBookmarksByUser, DeleteBookmark, UpdateBookmark  


<div class="iframe-container">
<iframe src="https://www.youtube.com/embed/ZUiLrrf2qVw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

[Github Code](https://github.com/arthurbernierjr/bookmarks-yt-part1)

## Part 2 Using Components to Properly Separate Concerns

### Steps
1. Login, SignUp, CreateBookmark, ListBookmarksByUser, DeleteBookmark, UpdateBookmark Functionality
1. Login/SignUp Page and functionality
1. BookmarksPage
1. CreateBookmark Component and use `UseRef for form`
1. Verify created bookmarks get added to list  
1. BookmarkList Component
1. When Bookmark gets clicked it opens up Bookmark in a new tab
1. Bookmark Component  
1. Update & Delete Bookmark Functionality applied
1. Delete Via Button
1. Update Via Conditionally Rendering Input Field Adding New Text and pressing enter


```js
{ showUpdateInput ?
  <input type='text' defaultValue={bookmark.title} onKeyPress={(e) => e.key === 'Enter' && updateBookmark(e, bookmark._id, setShowUpdateInput) }/>:
  <span onClick={() => setShowUpdateInput(true)}>{bookmark.title}</span>}
```  

![](/img/4.png)

## Part 3 Using CSS Modules to Properly Style Components

### Steps
1. Add Sass
1. Style Login/SignUp Page
1. Style Bookmark
1. Style BookmarkList
1. Create Universal Body Styling


![](/img/5.png)
