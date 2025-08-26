# Landing Page Builder - Phase 1 MVP

A modular, extensible landing page builder built with Next.js 14, TypeScript, and Tailwind CSS. This Phase 1 implementation provides the core foundation with three essential section types and a comprehensive editing interface.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open your browser and navigate to:
# http://localhost:3000
```

## 📋 Phase 1 Features

### ✅ Core Sections
- **Hero Section**: Main banner with headline, subheadline, and CTA button
- **Content Section**: Text and image layout with flexible positioning
- **CTA Section**: Call-to-action with optional form fields

### ✅ Builder Interface
- **Canvas**: Visual editing area with section selection and inline editing
- **Section List**: Left panel showing all sections with easy navigation
- **Property Panel**: Right panel for detailed section customization
- **Toolbar**: Save, preview, and page management tools

### ✅ Editing Features
- **Inline Text Editing**: Click any text to edit directly on the canvas
- **Color Picker**: Visual color selection with preset palettes
- **Background Options**: Solid colors, gradients, and image placeholders
- **Responsive Design**: All sections automatically adapt to mobile devices

### ✅ State Management
- **Auto-save**: Automatically saves to localStorage every 10 seconds
- **Undo/Redo Ready**: Architecture prepared for future implementation
- **Preview Mode**: Toggle between editing and full-screen preview

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   └── builder/
│       └── page.tsx             # Main builder interface
├── components/
│   ├── builder/                 # Builder-specific components
│   │   ├── BuilderLayout.tsx    # Main layout structure
│   │   ├── Canvas.tsx           # Visual editing canvas
│   │   ├── PropertyPanel.tsx    # Right-side property editor
│   │   ├── SectionList.tsx      # Left-side section navigation
│   │   └── Toolbar.tsx          # Top toolbar with actions
│   ├── sections/                # Landing page sections
│   │   ├── HeroSection.tsx      # Hero banner component
│   │   ├── ContentSection.tsx   # Content with image component
│   │   └── CTASection.tsx       # Call-to-action component
│   ├── editor/                  # Editing tools
│   │   ├── InlineTextEditor.tsx # Click-to-edit text component
│   │   └── ColorPicker.tsx      # Visual color selection
│   └── ui/                      # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Select.tsx
├── store/
│   └── builderStore.ts          # Zustand state management
├── lib/
│   ├── utils.ts                 # Utility functions
│   └── constants.ts             # Application constants
└── types/
    └── builder.types.ts         # TypeScript definitions
```

## 🎯 How to Use

### Starting the Builder
1. Visit the homepage at `http://localhost:3000`
2. Click "Start Building Now" to open the builder
3. The builder opens with three default sections ready to edit

### Editing Content
1. **Text Editing**: Click on any text to edit it inline
2. **Section Selection**: Click on sections to select and see properties
3. **Property Panel**: Use the right panel to customize colors, layouts, and settings
4. **Section List**: Use the left panel to navigate between sections

### Builder Tools
- **Save**: Manually save your work (auto-saves every 10 seconds)
- **Preview**: Toggle full-screen preview mode
- **Reset**: Clear all content and start over

### Section Types

#### Hero Section
- Headline and subheadline text
- Background options (color, gradient, image placeholder)
- Call-to-action button
- Text alignment controls

#### Content Section
- Title and content text
- Image placeholder (upload coming in Phase 2)
- Image position options (left, right, top, bottom)
- Padding controls

#### CTA Section
- Title and description
- Form toggle with field controls (name, email, phone)
- Button customization
- Background and text colors

## 🛠️ Technical Details

### Built With
- **Next.js 14** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Colorful** - Color picker
- **UUID** - Unique identifiers

### Key Features
- **Type Safety**: Full TypeScript implementation
- **Modular Architecture**: Easy to extend with new sections
- **Responsive Design**: Mobile-first approach
- **Auto-save**: Prevents data loss
- **Extensible**: Ready for Phase 2 features

### State Management
The application uses Zustand for state management with the following key features:
- Centralized page state
- Section management (add, update, reorder)
- Auto-save functionality
- Preview mode handling
- Local storage persistence

## 🔮 Phase 2 Roadmap

### Planned Features
- **Image Upload**: Cloudinary integration for image management
- **HTML Generation**: Export static HTML pages
- **Deployment**: One-click publish to Netlify
- **Templates**: Pre-built page templates
- **Advanced Animations**: Entrance and scroll animations
- **Form Handling**: Real form submission with email forwarding

### Technical Improvements
- Drag & drop section reordering
- Undo/redo functionality
- Multiple page management
- Custom CSS injection
- SEO optimization tools

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Code Style
- ESLint configuration for code quality
- Prettier for consistent formatting
- TypeScript strict mode enabled
- Component-based architecture

### Adding New Sections
1. Create component in `src/components/sections/`
2. Add section type to `builder.types.ts`
3. Update the Canvas component to render new section
4. Add properties to PropertyPanel component
5. Update store default sections if needed

## 🤝 Contributing

This is a Phase 1 MVP implementation. Future phases will expand functionality based on the roadmap.

### Key Principles
- **Modularity**: Easy to extend and maintain
- **Type Safety**: Comprehensive TypeScript usage
- **User Experience**: Intuitive editing interface
- **Performance**: Optimized for speed
- **Accessibility**: WCAG compliant components

## 📄 License

This project is part of a landing page builder MVP development.

---

## 🎉 Getting Started

Ready to build? Run the development server and visit `http://localhost:3000` to start creating your first landing page!

The builder is designed to be intuitive - just click on elements to edit them and use the property panel to customize appearance. Your work is automatically saved to localStorage every 10 seconds.