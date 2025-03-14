# Modern UI Design System

A comprehensive design system with a purple/teal color scheme, featuring clean components and consistent styling for modern web applications.

## Overview

This design system provides a complete set of styles, components, and patterns for building beautiful, consistent user interfaces. It features:

- A distinctive purple and teal color palette
- Clean, modern typography
- Consistent spacing and layout principles
- Reusable UI components
- Responsive design patterns
- Dark mode support

## Getting Started

1. Include the CSS files in your project:

   ```html
   <link rel="stylesheet" href="styles/global.css" />
   ```

2. Add the Inter font from Google Fonts:

   ```html
   <link
     href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
     rel="stylesheet"
   />
   ```

3. Start using the components and utility classes in your HTML.

## File Structure

- `design-patterns.mdc` - Design system documentation
- `styles/`
  - `variables.css` - CSS variables for colors, typography, spacing, etc.
  - `components.css` - Component-specific styles
  - `global.css` - Global styles and imports
- `components/` - React component examples
  - `Button.js` - Button component
  - `Card.js` - Card component
- `example.html` - Example page showcasing the design system

## Color Palette

### Primary Colors

- **Base Background**: Deep purple/navy (#2d2b40)
- **Primary Accent**: Vibrant purple (#6c5ce7)
- **Secondary Accent**: Teal/mint (#66d9c9)

### Supporting Colors

- **Card Background**: Pure white (#ffffff)
- **Dark Mode Card Background**: Near-black (#1e1d2b)
- **Text - Primary**: Near-black (#212121)
- **Text - Secondary**: Gray (#6b7280)
- **Text - Light**: White (#ffffff)
- **Notification/Accent**: Red (#e74c3c)

## Components

The design system includes the following components:

- Buttons (Primary, Secondary, Text)
- Cards
- Form elements
- Navigation items
- Badges
- Avatars
- Progress bars
- Status indicators
- Notification badges

## Utility Classes

The system provides utility classes for:

- Typography (headings, body text, captions)
- Layout (flex, grid, containers)
- Spacing (margin, padding)
- Alignment (items-center, justify-between)

## Example

To see the design system in action, open `example.html` in your browser.

## Customization

You can customize the design system by modifying the CSS variables in `styles/variables.css`.

## Browser Support

This design system uses modern CSS features like CSS variables and color-mix(), which are supported in all modern browsers.

## License

MIT
