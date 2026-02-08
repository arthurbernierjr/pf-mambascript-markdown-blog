# BigPoppaCode.io Portfolio

Personal portfolio and developer education platform featuring programming guides, blog content, and project showcases.

## Tech Stack

- **Frontend:** React 17, MambaScript, Sass
- **Backend:** Node.js, Express, MongoDB
- **Build:** Gulp, Browser-sync

## Project Structure

```
src/
├── pages/         # Main pages (Home, About, Blog, Contact, Guides, Projects)
├── components/    # Reusable components (FullBlog, PostContent, PillarContent)
├── layout/        # Layout wrappers (headers, footers, navigation)
└── scss/          # Modular styles (Bootstrap, Neat grid, custom)

public/            # Static assets, compiled output, landing pages

api/               # API routes and markdown content
└── guides/        # Programming guides organized by language/topic
    ├── javascript/
    ├── python/
    ├── ruby/
    ├── go/
    ├── rust/
    ├── java/
    ├── php/
    ├── dart/
    ├── frontend/
    ├── fullstack/
    └── concepts/
```

## Development

**Prerequisites**
```bash
npm i -g gulp-cli
```

**Install dependencies**
```bash
npm install
```

**Start dev server with hot reload**
```bash
npm run dev
```

**Build for production**
```bash
npm run build
```

**Compile SCSS only**
```bash
npm run styles
```

**Run production server**
```bash
npm start
```

**Generate new page from template**
```bash
npm run create
```

## Scripts

| Command | Description |
|---------|-------------|
| `dev` | Gulp watch + browser-sync |
| `build` | Production build (Gulp + styles) |
| `styles` | Compile SCSS |
| `create` | Generate new page from template |
| `start` | Run production server via MambaScript |

## Key Features

- **Responsive Navigation** - Mobile-first nav with hamburger menu and slide-out drawer
- **Blog System** - MDN-style programming guides (88+ articles across 10+ languages)
- **MambaScript Templating** - JSX-like syntax compiled to static HTML
- **Email Integration** - SendGrid and Mailchimp for newsletters and contact forms
- **Modular SCSS** - Bootstrap 5 utilities + Neat grid system
- **Gray Matter** - Frontmatter parsing for markdown content
- **Showdown** - Markdown to HTML conversion

## Layout Components

- `AppLayout` - Main site wrapper
- `GuidesLayout` - Documentation pages
- `NewsletterLayout` - Email capture pages
- `SalesLayout` - Landing pages
- `ResponsiveNav` - Adaptive navigation

## Environment

Requires Node.js >= 18.0.0

Create `.env` for API keys:
```
SENDGRID_API_KEY=
MAILCHIMP_API_KEY=
MONGODB_URI=
```
