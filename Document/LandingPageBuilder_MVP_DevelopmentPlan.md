# Landing Page Builder MVP - Development Plan

## Project Overview

### Executive Summary
A simple, Carrd-like landing page builder that allows users to create professional landing pages without coding knowledge. Users can create pages using a drag-and-drop interface, which generates static HTML files deployed automatically to Netlify.

### Core Value Proposition
- **Simple**: Create a landing page in under 10 minutes
- **Free Hosting**: Leveraging Netlify's free tier
- **No Code Required**: Visual builder interface
- **Mobile Responsive**: Automatic responsive design

### Technology Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Image Storage**: Cloudinary
- **Deployment**: Static HTML → GitHub → Netlify
- **Form Handling**: Email forwarding service
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit/sortable

## Architecture Overview

### System Flow
```
User Creates Page → Generate HTML → Push to GitHub → Auto Deploy to Netlify
```

### Data Flow
1. User designs page in builder (Next.js app)
2. Images uploaded to Cloudinary
3. Generate static HTML with inline CSS
4. Commit HTML to GitHub repository
5. Netlify auto-deploys from GitHub
6. User receives landing page URL

## MVP Features (Phase 1)

### 1. Page Structure
Landing pages consist of exactly 3 sections:
- **Hero Section**: Main visual impact area
- **Content Section**: Information/features
- **CTA Section**: Call-to-action with form

### 2. Content Elements
Limited to essential elements only:
- **Text Types**: 
  - Heading (H1, H2)
  - Body text
  - Button text
- **Images**: Single images only (no galleries)
- **Forms**: Fixed fields (Name, Email, Phone)

### 3. Styling Options
- **Colors**: 2 colors only (Primary, Secondary)
- **Fonts**: 3 pre-selected font combinations
- **Spacing**: Pre-defined padding/margin sets
- **Mobile**: Automatic responsive handling

## User Interface Structure

### Builder Layout
```
┌─────────────────────────────────────────┐
│  Top Toolbar (Save/Preview/Publish)      │
├────────┬────────────────────┬───────────┤
│        │                    │           │
│  Left  │   Center Canvas    │   Right   │
│Section │  (Edit Area)       │ Property  │
│  List  │                    │   Panel   │
│        │                    │           │
└────────┴────────────────────┴───────────┘
```

### Component Breakdown

#### Top Toolbar
- **Save Button**: Saves current state to localStorage
- **Preview Button**: Opens preview modal (Desktop/Tablet/Mobile views)
- **Publish Button**: Generates HTML and deploys to Netlify
- **Settings Icon**: Basic page settings (Title, Meta description)

#### Left Panel - Section List
- Shows 3 fixed sections (not removable)
- Drag handle for reordering
- Click to select/edit section
- Visual indicator for active section

#### Center Canvas
- Live preview of landing page
- Click to select elements
- Inline editing for text
- Visual feedback on hover/select

#### Right Panel - Properties
- Context-sensitive based on selection
- Text properties (size, color, alignment)
- Image upload/replace
- Section background color
- Spacing controls (simple slider)

## Technical Implementation

### Project Structure
```
src/
├── app/
│   ├── page.tsx                 # Landing/dashboard
│   ├── builder/
│   │   └── page.tsx             # Main builder interface
│   └── api/
│       ├── generate-html/
│       │   └── route.ts         # HTML generation endpoint
│       └── deploy/
│           └── route.ts         # Netlify deployment endpoint
├── components/
│   ├── builder/
│   │   ├── Canvas.tsx           # Main editing canvas
│   │   ├── SectionList.tsx     # Left panel sections
│   │   ├── PropertyPanel.tsx   # Right panel properties
│   │   └── Toolbar.tsx         # Top toolbar
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── ContentSection.tsx
│   │   └── CTASection.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
├── lib/
│   ├── html-generator.ts       # HTML generation logic
│   ├── cloudinary.ts           # Image upload handling
│   └── netlify-deploy.ts       # Deployment logic
├── store/
│   └── builder-store.ts        # Zustand state management
└── types/
    └── builder.types.ts        # TypeScript definitions
```

### Data Models

#### Page State Structure
```typescript
interface PageState {
  id: string;
  title: string;
  metaDescription: string;
  favicon?: string;
  colors: {
    primary: string;
    secondary: string;
  };
  font: 'modern' | 'classic' | 'playful';
  sections: Section[];
}

interface Section {
  id: string;
  type: 'hero' | 'content' | 'cta';
  order: number;
  data: SectionData;
}

interface HeroSectionData {
  headline: string;
  subheadline: string;
  buttonText: string;
  buttonAction: 'scroll' | 'form';
  backgroundImage?: string;
  backgroundColor: string;
}

interface ContentSectionData {
  title: string;
  content: string;
  image?: string;
  imagePosition: 'left' | 'right' | 'top';
}

interface CTASectionData {
  title: string;
  description: string;
  formFields: ['name', 'email', 'phone'];
  buttonText: string;
  recipientEmail: string;
}
```

### Core Components

#### 1. Canvas Component
```typescript
// Responsibilities:
- Render current page state
- Handle element selection
- Enable inline text editing
- Provide visual feedback
```

#### 2. Section Templates
```typescript
// Each section has:
- Default content/structure
- Editable properties
- Responsive layout
- Hover/selected states
```

#### 3. Property Panel
```typescript
// Dynamic controls based on selection:
- Text: Font size, color, alignment
- Image: Upload, alt text
- Section: Background, padding
- Form: Email recipient
```

### HTML Generation

#### Template Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><!-- Page Title --></title>
    <meta name="description" content="<!-- Meta Description -->">
    
    <!-- Inline Critical CSS -->
    <style>
        /* Reset styles */
        /* Typography based on font selection */
        /* Color scheme variables */
        /* Responsive grid system */
        /* Component styles */
    </style>
</head>
<body>
    <!-- Generated sections HTML -->
    
    <!-- Minimal JavaScript for form handling -->
    <script>
        // Form submission logic
        // Smooth scroll behavior
    </script>
</body>
</html>
```

#### CSS Strategy
- All CSS inlined (no external stylesheets)
- Mobile-first responsive design
- Maximum 10KB CSS size
- Use CSS variables for theming

### API Endpoints

#### `/api/generate-html`
- **Method**: POST
- **Input**: PageState object
- **Output**: Generated HTML string
- **Process**:
  1. Validate page state
  2. Generate HTML from templates
  3. Inline all CSS
  4. Optimize and minify
  5. Return HTML string

#### `/api/deploy`
- **Method**: POST
- **Input**: HTML string, userId, pageId
- **Output**: Deployed URL
- **Process**:
  1. Create/update GitHub file
  2. Wait for Netlify webhook
  3. Return public URL

#### `/api/upload-image`
- **Method**: POST
- **Input**: Image file
- **Output**: Cloudinary URL
- **Process**:
  1. Validate image (size, type)
  2. Upload to Cloudinary
  3. Return optimized URL

## Development Phases

### Phase 1: Core Builder (Week 1-2)
- [ ] Setup Next.js project with TypeScript
- [ ] Create basic layout components
- [ ] Implement section templates
- [ ] Add Zustand store
- [ ] Basic drag-and-drop for sections

### Phase 2: Editing Features (Week 2-3)
- [ ] Inline text editing
- [ ] Property panel controls
- [ ] Color picker implementation
- [ ] Image upload to Cloudinary
- [ ] Preview modal (responsive views)

### Phase 3: HTML Generation (Week 3-4)
- [ ] HTML template system
- [ ] CSS inlining logic
- [ ] Form handler JavaScript
- [ ] Mobile responsive rules
- [ ] HTML optimization

### Phase 4: Deployment Pipeline (Week 4)
- [ ] GitHub API integration
- [ ] Netlify webhook setup
- [ ] Deploy endpoint
- [ ] URL management
- [ ] Error handling

### Phase 5: Polish & Testing (Week 5)
- [ ] UI/UX improvements
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Error messages
- [ ] Documentation

## Key Design Decisions

### Why These Limitations?
1. **3 Sections Only**: Ensures good design, prevents feature creep
2. **Fixed Form Fields**: Simplifies backend, covers 90% use cases
3. **2 Colors**: Maintains design consistency
4. **No Custom CSS**: Prevents broken layouts
5. **Static HTML**: Zero hosting costs, maximum performance

### Performance Targets
- Builder loads in < 2 seconds
- HTML generation < 500ms
- Generated pages < 100KB
- PageSpeed score > 90
- Mobile-first always

## External Services Setup

### Cloudinary Configuration
```javascript
// Required settings:
- Unsigned upload preset
- Auto-format and auto-quality
- Responsive breakpoints
- Max file size: 5MB
```

### GitHub Repository
```
Structure:
landing-pages/
├── sites/
│   ├── user1/
│   │   └── page1/
│   │       └── index.html
│   └── user2/
│       └── page1/
│           └── index.html
```

### Netlify Configuration
```yaml
# netlify.toml
[build]
  publish = "sites"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Security Considerations

### Input Validation
- Sanitize all text inputs (XSS prevention)
- Validate image uploads (type, size)
- Rate limiting on API endpoints
- Email validation for forms

### Data Privacy
- No sensitive data in HTML
- Form submissions via secure email
- Images served from CDN
- No cookies or tracking (MVP)

## Testing Strategy

### Unit Tests
- HTML generation functions
- State management logic
- Validation utilities

### Integration Tests
- Builder workflow
- Image upload flow
- Deployment pipeline

### E2E Tests
- Complete page creation
- Mobile responsiveness
- Form submissions

## Success Metrics

### Technical Metrics
- Page generation time < 1s
- Zero runtime errors
- 95% uptime

### User Metrics
- Time to first page < 10 min
- Successful publish rate > 90%
- Mobile responsiveness 100%

## Future Enhancements (Post-MVP)

### Phase 2 Features
- Additional section types
- A/B testing capability
- Analytics integration
- Custom domains
- Team collaboration

### Phase 3 Features
- AI content generation
- Template marketplace
- Advanced animations
- E-commerce sections
- Multi-language support

## Development Environment

### Required Tools
```bash
# Node.js 20.x LTS
# npm or yarn
# Git
# VSCode with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
```

### Environment Variables
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=
```

### Getting Started
```bash
# Clone repository
git clone [repo-url]

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build
```

## Support Documentation

### For Developers
- Component API documentation
- State management guide
- HTML generation specs
- Deployment flow diagram

### For Users
- Quick start guide
- Template selection
- Best practices
- Troubleshooting

## Contact & Resources

### Documentation
- API Reference: `/docs/api`
- Component Library: `/docs/components`
- Deployment Guide: `/docs/deployment`

### Support Channels
- GitHub Issues
- Discord Community
- Email Support

---

## Appendix A: HTML Template Examples

### Hero Section HTML
```html
<section class="hero" style="background-color: var(--primary-color);">
  <div class="container">
    <h1>{{ headline }}</h1>
    <p>{{ subheadline }}</p>
    <button class="cta-button">{{ buttonText }}</button>
  </div>
</section>
```

### Form Handler JavaScript
```javascript
document.getElementById('lead-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  // Send to email service
  await fetch('https://formspree.io/f/[form-id]', {
    method: 'POST',
    body: formData,
    headers: { 'Accept': 'application/json' }
  });
});
```

## Appendix B: Color Schemes

### Predefined Palettes
1. **Professional**: Navy (#1e3a8a) + Gold (#fbbf24)
2. **Modern**: Black (#000000) + Mint (#10b981)
3. **Friendly**: Blue (#3b82f6) + Orange (#fb923c)
4. **Elegant**: Purple (#7c3aed) + Pink (#ec4899)
5. **Natural**: Green (#059669) + Brown (#92400e)

---

*Last Updated: [Current Date]*
*Version: 1.0.0*