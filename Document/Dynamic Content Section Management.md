# Development Request: Dynamic Content Section Management

## Document Information
- **Feature**: Dynamic Content Section Management
- **Version**: 1.0
- **Date**: January 2025
- **Priority**: High
- **Estimated Duration**: 1-2 weeks

---

## Executive Summary

This request outlines the enhancement of the Landing Page Builder to support dynamic content section management. While maintaining the core Hero-Content-CTA structure, users will be able to add multiple content sections, choose between text-only and image-inclusive layouts, delete sections, and reorder all sections through drag-and-drop functionality.

## Current State

### Existing Structure
- Fixed 3-section layout: Hero → Content → CTA
- Single Content section with embedded image option
- No ability to add/remove sections
- No drag-and-drop reordering
- Image is part of Content section properties

## Proposed Changes

### 1. Content Section Types

#### **Type A: Text Content Section**
```typescript
interface TextContentSection {
  id: string;
  type: 'content-text';
  order: number;
  data: {
    title: string;
    content: string;
    backgroundColor: string;
    backgroundType: 'color' | 'gradient';
    backgroundGradient?: string;
    textColor: string;
    textAlignment: 'left' | 'center' | 'right';
    padding: 'small' | 'medium' | 'large';
  };
}
```

#### **Type B: Image Content Section**
```typescript
interface ImageContentSection {
  id: string;
  type: 'content-image';
  order: number;
  data: {
    title: string;
    content: string;
    imageUrl: string;
    imagePublicId?: string;
    imagePosition: 'left' | 'right' | 'top' | 'bottom';
    imageSize: 'small' | 'medium' | 'large';
    backgroundColor: string;
    textColor: string;
    padding: 'small' | 'medium' | 'large';
  };
}
```

### 2. Section Management Rules

#### **Structure Rules**
- **Hero Section**: Always 1, always first, non-removable
- **Content Sections**: 0 to 10 sections allowed
  - Can be either `content-text` or `content-image` type
  - Fully removable and reorderable
- **CTA Section**: Always 1, always last, non-removable

#### **Section Limits**
- Minimum total sections: 2 (Hero + CTA only)
- Maximum total sections: 12 (Hero + 10 Content + CTA)
- Maximum image sections: 5 (performance consideration)

### 3. User Interface Updates

#### **3.1 Toolbar Changes**
Add new button in toolbar:
```
[+ Add Content Section] - Dropdown with two options:
  - Add Text Section
  - Add Image Section
```

#### **3.2 Section List Panel (Left)**
```
Page Sections
├── 🔒 Hero Section (locked position)
├── 📝 Content Section - Text
│   [↕️ drag] [🗑️ delete]
├── 🖼️ Content Section - Image
│   [↕️ drag] [🗑️ delete]
├── 📝 Content Section - Text
│   [↕️ drag] [🗑️ delete]
└── 🔒 CTA Section (locked position)
```

#### **3.3 Section Controls**
Each content section should have:
- **Drag Handle**: For reordering (except Hero/CTA)
- **Delete Button**: For removal (except Hero/CTA)
- **Type Indicator**: Icon showing text or image type
- **Duplicate Button**: Quick duplication of section

### 4. Functionality Requirements

#### **4.1 Adding Sections**
```typescript
// Function to add new content section
function addContentSection(type: 'content-text' | 'content-image') {
  // Generate unique ID
  // Insert after last content section (before CTA)
  // Auto-scroll to new section
  // Select new section for editing
}
```

#### **4.2 Deleting Sections**
```typescript
// Function to delete content section
function deleteContentSection(sectionId: string) {
  // Confirm deletion if section has content
  // Remove from state
  // Update order of remaining sections
  // Select previous or next section
}
```

#### **4.3 Drag and Drop Reordering**
```typescript
// Using @dnd-kit/sortable
function handleDragEnd(event: DragEndEvent) {
  // Prevent Hero from moving from position 0
  // Prevent CTA from moving from last position
  // Allow free movement of content sections between Hero and CTA
  // Update order property for all affected sections
}
```

### 5. State Management Updates

#### **Zustand Store Modifications**
```typescript
interface BuilderStore {
  // ... existing properties
  
  // New actions
  addContentSection: (type: 'content-text' | 'content-image') => void;
  deleteSection: (sectionId: string) => void;
  reorderSections: (sections: Section[]) => void;
  duplicateSection: (sectionId: string) => void;
  convertSectionType: (sectionId: string, newType: 'content-text' | 'content-image') => void;
  
  // New computed properties
  contentSectionsCount: number;
  canAddMoreSections: boolean;
  canDeleteSection: (sectionId: string) => boolean;
}
```

### 6. Component Updates

#### **6.1 New Components to Create**
- `ContentTextSection.tsx` - Text-only content component
- `ContentImageSection.tsx` - Image + text content component
- `AddSectionButton.tsx` - Dropdown button for adding sections
- `SectionDragHandle.tsx` - Draggable handle component

#### **6.2 Components to Modify**
- `Canvas.tsx` - Support dynamic section rendering
- `SectionList.tsx` - Add drag-and-drop capability
- `PropertyPanel.tsx` - Different properties for each content type
- `builderStore.ts` - New actions and state management

### 7. User Experience Enhancements

#### **7.1 Visual Feedback**
- Smooth animations for section addition/removal
- Drag preview while reordering
- Visual indicators for drop zones
- Highlight valid drop areas during drag

#### **7.2 Keyboard Shortcuts**
- `Ctrl/Cmd + D` - Duplicate selected section
- `Delete` - Remove selected section (with confirmation)
- `Alt + ↑/↓` - Move section up/down

#### **7.3 Empty State**
When no content sections exist:
```
[Hero Section]

  📝 No content sections yet
  [+ Add Your First Content Section]

[CTA Section]
```

### 8. Migration Strategy

#### **Existing Projects**
```typescript
// Migration function for existing saved pages
function migrateOldContentSection(oldSection: LegacyContentSection) {
  if (oldSection.data.imageUrl) {
    // Convert to content-image type
    return createImageContentSection(oldSection);
  } else {
    // Convert to content-text type
    return createTextContentSection(oldSection);
  }
}
```

### 9. Testing Requirements

#### **Functional Tests**
- [ ] Add text content section
- [ ] Add image content section
- [ ] Delete content section
- [ ] Reorder sections via drag-and-drop
- [ ] Duplicate section functionality
- [ ] Maximum sections limit enforcement
- [ ] Hero/CTA position locking

#### **Edge Cases**
- [ ] Delete last content section
- [ ] Add section when at maximum limit
- [ ] Drag Hero/CTA sections (should not move)
- [ ] Rapid add/delete operations
- [ ] Undo/redo with new section types

### 10. Acceptance Criteria

1. **Section Addition**
   - Users can add up to 10 content sections
   - New sections appear between existing content and CTA
   - Choice between text and image types

2. **Section Deletion**
   - Any content section can be deleted
   - Confirmation dialog for non-empty sections
   - Hero and CTA cannot be deleted

3. **Drag and Drop**
   - Smooth reordering of content sections
   - Hero stays at top, CTA stays at bottom
   - Visual feedback during drag operation

4. **Section Types**
   - Clear distinction between text and image sections
   - Appropriate property panels for each type
   - Option to convert between types

5. **Performance**
   - No lag with 10+ sections
   - Smooth animations under 60fps
   - Efficient state updates

### 11. Technical Notes

#### **Dependencies to Add**
```bash
npm install @dnd-kit/sortable @dnd-kit/core @dnd-kit/utilities
```

#### **Breaking Changes**
- Content section type split into `content-text` and `content-image`
- Section ordering now uses dynamic `order` property
- Legacy content sections need migration

### 12. Timeline

#### **Week 1**
- Day 1-2: Implement new section types and state management
- Day 3-4: Add section addition/deletion functionality
- Day 5: Implement drag-and-drop reordering

#### **Week 2**
- Day 1-2: Update UI components and property panels
- Day 3: Migration logic for existing projects
- Day 4: Testing and bug fixes
- Day 5: Documentation and deployment

---

## Appendix: Visual Mockups

### Section Type Selector
```
┌─────────────────────────┐
│ Add Content Section  ▼  │
├─────────────────────────┤
│ 📝 Text Section         │
│ 🖼️ Image Section        │
└─────────────────────────┘
```

### Drag and Drop Visualization
```
[Hero] 🔒
[Content-Text] ━━━━ ← Dragging
[··············] ← Drop zone
[Content-Image]
[CTA] 🔒
```

---

*This document represents a significant enhancement to the Landing Page Builder, providing users with greater flexibility while maintaining the simplicity of the original design.*