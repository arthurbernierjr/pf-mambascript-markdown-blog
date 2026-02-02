# Blog Expansion: 150 New Articles

**Goal:** Transform bigpoppacode.io blog into an MDN-style developer resource with 150 EDIP-format articles.

**Source Materials:**
- Polyglot course materials (`/home/bigpoppacode/code/obelisk/evelyn-the-goat-class.sfs-flex.com/src/course-materials/polyglot/`)
- Week 26 Day 3 slides systems overview(`/home/bigpoppacode/code/obelisk/evelyn-the-goat-class.sfs-flex.com/src/course-materials/teams/week-26/day-3/slides.md`)
- Existing 7 articles in `/api/` folder

**Format:** EDIP (Explain, Demonstrate, Imitate, Practice)

**Style:** MDN-like with Big Poppa Code brand colors

---

## Phase 1: Article Generation (Claude Code)

### **Source 1: Polyglot Materials (75 articles)**

**Languages covered:**
- Python (intro, routing, OOP, API, models)
- Go (intro, routing, OOP, API, models)
- PHP (intro, routing, OOP, API, models)
- Ruby (intro, routing, OOP, API, models)
- Rust (intro, routing, OOP, API, models)
- Java (intro, routing, OOP, API, models)
- Dart (intro, routing, OOP, API, models)
- Frontend (Angular, React, Vue, Svelte)

**Articles to generate (per language):**
1. `{lang}-intro.md` - Language introduction
2. `{lang}-routing.md` - Routing patterns
3. `{lang}-oop.md` - Object-oriented programming
4. `{lang}-api.md` - Building APIs
5. `{lang}-models.md` - Data modeling

**Total: 8 languages × 5 topics = 40 articles**

**Additional polyglot topics (35 articles):**
- Comparing syntax across languages
- Best practices per language
- Framework comparisons
- Deployment strategies
- Testing patterns

### **Source 2: Week 26 Slides (75 articles)**

**Topics from "Ultimate Guide":**
1. HTML fundamentals (5 articles)
2. CSS fundamentals (5 articles)
3. JavaScript fundamentals (10 articles)
4. Node.js architecture (5 articles)
5. CRUD operations (5 articles)
6. REST API design (5 articles)
7. MVC pattern (5 articles)
8. Server-side rendering (5 articles)
9. Client-side rendering (5 articles)
10. MERN stack (5 articles)
11. Full-stack architecture (5 articles)
12. Event-driven programming (5 articles)
13. Asynchronous JavaScript (5 articles)
14. Database design (5 articles)
15. Deployment & DevOps (5 articles)

---

## EDIP Template

Each article follows this structure:

```markdown
---
title: "{Topic Title}"
category: "{Language/Framework/Concept}"
difficulty: "beginner|intermediate|advanced"
date: "2026-02-01"
author: "Arthur Bernier Jr"
---

# {Topic Title}

## Explain

{Use Big Poppa Code's analogy-based teaching style. Reference real-world metaphors.}

### Key Concepts
- {Concept 1}
- {Concept 2}
- {Concept 3}

### Why This Matters
{Practical application, why developers need to know this}

---

## Demonstrate

### Example 1: {Simple Use Case}

\`\`\`{language}
// Code example with detailed comments
{code}
\`\`\`

**Output:**
\`\`\`
{expected output}
\`\`\`

**Explanation:**
{Line-by-line walkthrough of what's happening}

### Example 2: {Real-World Use Case}

\`\`\`{language}
// More complex example
{code}
\`\`\`

**Key Takeaways:**
- {Point 1}
- {Point 2}
- {Point 3}

---

## Imitate

Now it's your turn! Try modifying the examples above.

### Challenge 1: Modify the First Example
**Task:** {Specific modification task}

**Hint:** {Helpful hint}

<details>
<summary>Solution</summary>

\`\`\`{language}
{solution code}
\`\`\`

**Explanation:** {Why this works}

</details>

### Challenge 2: Build Your Own
**Task:** {Create something from scratch}

**Requirements:**
- {Requirement 1}
- {Requirement 2}
- {Requirement 3}

---

## Practice

### Exercise 1: {Practical Application}
**Difficulty:** {Beginner/Intermediate/Advanced}

**Scenario:** {Real-world problem}

**Your Task:**
{Detailed instructions}

**Tests to pass:**
1. {Test case 1}
2. {Test case 2}
3. {Test case 3}

### Exercise 2: {Advanced Challenge}
**Difficulty:** Advanced

**Scenario:** {Complex real-world scenario}

**Your Task:**
{Open-ended challenge}

**Bonus:**
- {Extra challenge}

---

## Summary

**What you learned:**
- {Key point 1}
- {Key point 2}
- {Key point 3}

**Next Steps:**
- Read: [{Related Article}](#)
- Practice: [{Exercise Link}](#)
- Build: [{Project Idea}](#)

---

## Resources

- [MDN: {Relevant Doc}](url)
- [Official Docs: {Language/Framework}](url)
- [Big Poppa Code Video: {Related Topic}](https://youtube.com/@bigpoppacode)
```

---

## Phase 2: Styling (MDN-like)

Update `/public/css/style.css` or create new stylesheet:

### **Brand Colors:**
```css
:root {
  --primary: #057176;      /* Teal */
  --secondary: #6B2D9E;    /* Purple */
  --accent: #b10000;       /* Red */
  --bg: #ffffff;           /* White bg */
  --text: #1a1a1a;         /* Dark text */
  --code-bg: #f5f5f5;      /* Light gray code blocks */
  --border: #e0e0e0;
}
```

### **MDN-Inspired Styles:**
- Clean typography (system fonts)
- Sidebar navigation
- Code syntax highlighting
- Collapsible `<details>` sections
- Sticky table of contents
- Breadcrumb navigation
- "Try it yourself" interactive code blocks (future enhancement)

### **Layout:**
```
┌─────────────────────────────────────┐
│         Header (Teal)                │
├──────────┬──────────────────────────┤
│          │  Article Title            │
│ Sidebar  │  ───────────────          │
│  Nav     │  Content with code        │
│          │  blocks, examples         │
│ (Purple) │                            │
│          │  EDIP sections            │
│          │                            │
└──────────┴──────────────────────────┘
```

---

## Phase 3: Article File Structure

**New folder:** `/api/guides/`

**Organization:**
```
/api
  /guides
    /javascript
      /fundamentals
        - variables.md
        - functions.md
        - arrays.md
        - objects.md
      /async
        - promises.md
        - async-await.md
        - event-loop.md
    /python
      - intro.md
      - routing.md
      - oop.md
    /go
      - intro.md
      - routing.md
    /concepts
      - crud.md
      - rest.md
      - mvc.md
    /fullstack
      - mern-architecture.md
      - ssr-vs-csr.md
```

---

## Execution Steps

### **Step 1: Generate Articles** (Claude Code)

For each source file in polyglot/:

1. Read the original material
2. Extract key concepts
3. Create EDIP article using template
4. Save to appropriate `/api/guides/{category}/` folder
5. Add frontmatter metadata

Example command structure:
```
Read: polyglot/python/intro.md
Generate: /api/guides/python/intro.md (EDIP format)
```

### **Step 2: Create Index Pages**

Generate index pages for each category:
```markdown
# JavaScript Guides

## Fundamentals
- [Variables](./javascript/fundamentals/variables.md)
- [Functions](./javascript/fundamentals/functions.md)
...

## Async Programming
- [Promises](./javascript/async/promises.md)
...
```

### **Step 3: Update Navigation**

Update `server.mamba` routes to serve new articles.

### **Step 4: Styling**

Apply MDN-inspired CSS with Big Poppa Code colors.

---

## Success Metrics

- [ ] 150 articles generated
- [ ] All follow EDIP format
- [ ] MDN-style design applied
- [ ] Navigation works
- [ ] Code blocks syntax highlighted
- [ ] Mobile responsive
- [ ] Fast load times
- [ ] SEO metadata added

---

## Example Article (Reference)

See `/api/guides/_TEMPLATE.md` for a complete example following the EDIP format with Big Poppa Code's teaching style.

---

**This is your roadmap. Execute and deploy today.** 🚀
