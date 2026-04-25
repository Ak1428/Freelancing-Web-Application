# Design System - TalentFlow

## Overview
The application has been redesigned with Tailwind CSS, providing a modern, consistent, and scalable design system.

## Color Palette

### Primary Colors
- **Primary 600**: `#0284c7` - Main brand color
- **Primary 700**: `#0369a1` - Hover state
- **Primary 50-100**: Light backgrounds

### Semantic Colors
- **Accent**: `#f59e0b` - Warnings and highlights
- **Neutral**: `#6b7280` - Text and borders
- **Success**: `#10b981` - Positive actions
- **Danger**: `#ef4444` - Destructive actions

## Typography

### Font Families
- **Body**: Inter (sans-serif)
- **Display**: Poppins (headings)

### Sizes
- **Mobile**: Base text 14-16px
- **Desktop**: Base text 16px
- **H1**: 32-48px (responsive)
- **H2**: 24-32px (responsive)
- **H3**: 18-24px (responsive)

## Components

### UI Components (in `/src/components/ui/`)
- **Button**: Variants (primary, secondary, outline, ghost) with sizes (sm, md, lg)
- **Card**: Glass morphism design with glass & solid variants
- **Badge**: Inline status indicators with semantic colors
- **Container**: Responsive max-width wrapper

### Layout Components (in `/src/components/layout/`)
- **TopNav**: Sticky header with theme toggle and navigation

### Common Components (in `/src/components/common/`)
- **BackButton**: Navigation helper

## Spacing & Layout

- **Container max-width**: 6xl (64rem)
- **Padding**: Responsive 4-8px (sm-lg breakpoints)
- **Gap**: 16-24px between sections
- **Border radius**: 8px (buttons), 16px (cards), 24px (large cards)

## Responsive Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

## Shadows
- **shadow-glass**: `0 8px 32px 0 rgba(31, 38, 135, 0.1)` - Subtle depth
- **shadow-md**: `0 4px 6px -1px rgba(0, 0, 0, 0.1)` - Default shadows
- **shadow-lg**: `0 10px 15px -3px rgba(0, 0, 0, 0.1)` - Elevated elements

## Animations & Transitions
- **Duration**: 200-300ms for UI feedback
- **Easing**: ease-in-out for smooth interactions
- **Fade-in**: 300ms opacity transition
- **Slide-in**: 300ms translate + opacity

## Dark Mode
Dark mode is available via theme toggle in TopNav.
- Uses CSS classes: `theme-dark`, `theme-light`
- Persisted to localStorage as `freelanceTheme`

## Usage Examples

### Button
```tsx
<Button variant="primary" size="lg">Click me</Button>
<Button variant="outline">Secondary</Button>
<Button loading disabled>Loading...</Button>
```

### Card
```tsx
<Card variant="glass" className="p-6">
  Content here
</Card>
```

### Layout
```tsx
<Container className="py-12">
  <div className="grid lg:grid-cols-3 gap-6">
    Content
  </div>
</Container>
```

## Migration Guide
Pages using old CSS modules should be updated to use:
1. New UI components from `/src/components/ui/`
2. Tailwind utility classes for custom styling
3. Container wrapper for consistent layout
4. Card component for content areas

## Next Steps
- Update remaining pages (Register, Jobs, Freelancers, etc.)
- Apply consistent spacing and layout patterns
- Add dark mode compatible styling to all pages
- Create additional UI components as needed (Modal, Form, Dropdown, etc.)
