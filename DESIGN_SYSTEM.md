# VNTV Design System

Complete design system documentation for the VNTV platform.

**Live Showcase:** [http://localhost:3000/design-system](http://localhost:3000/design-system)

---

## Table of Contents

- [Overview](#overview)
- [Design Tokens](#design-tokens)
- [Theme System](#theme-system)
- [Components](#components)
- [Layout Components](#layout-components)
- [Icons](#icons)
- [Accessibility](#accessibility)
- [Form Validation](#form-validation)
- [Usage Examples](#usage-examples)

---

## Overview

The VNTV design system is built with:
- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Lucide React** for icons
- **Full accessibility** (WCAG 2.2 AA compliant)
- **Light/Dark theme** support

### Key Features

✅ Complete component library (19 components)  
✅ Responsive and mobile-first  
✅ Full keyboard navigation  
✅ Screen reader support  
✅ Form validation system  
✅ Theme persistence  
✅ TypeScript types for everything  

---

## Design Tokens

All design tokens are defined in three locations:

### 1. Tailwind Config (`tailwind.config.ts`)
Contains utility classes and design scales.

### 2. CSS Variables (`app/globals.css`)
Theme-aware colors using CSS custom properties:

```css
/* Light Theme */
--color-background: #ffffff
--color-foreground: #0d0d0f

/* Dark Theme */
.dark {
  --color-background: #0b0b0d
  --color-foreground: #f2f2f3
}
```

### 3. TypeScript Tokens (`config/design-tokens.ts`)
Runtime-accessible tokens for JavaScript/TypeScript:

```typescript
import { colors, typography, spacing } from "@/config/design-tokens";
```

### Color System

#### Brand Colors
- **VNTV Red**: `#e0142c` - Primary brand color
- **Red Hover**: `#c11026` - Hover states
- **Red Dim**: `#8a0f1e` - Dimmed variant

#### Category Colors
- **Ghana**: `#e31c23` (Red)
- **Nigeria**: `#f5a623` (Gold)
- **Africa**: `#2fbf6f` (Green)
- **World**: `#4a90e2` (Blue)
- **Politics**: `#9013fe` (Purple)
- **Business**: `#f08bb4` (Pink)
- **Entertainment**: `#e0142c` (Red)
- **Sports**: `#5856d6` (Indigo)

#### Semantic Colors
- **Success**: `#2fbf6f`
- **Error**: `#e0142c`
- **Warning**: `#f5a623`
- **Info**: `#4a90e2`

### Typography

All typography uses **Helvetica Neue** with fallbacks to Arial and sans-serif.

#### Type Scale
- `text-hero`: 34px / 800 weight
- `text-h1`: 24px / 800 weight
- `text-h2`: 20px / 700 weight
- `text-h3`: 16px / 700 weight
- `text-body`: 14px / 400 weight
- `text-caption`: 12px / 400 weight

### Spacing

Consistent spacing scale:
- `gap-xs`: 4px
- `gap-sm`: 8px
- `gap-md`: 16px
- `gap-lg`: 24px
- `gap-xl`: 32px

---

## Theme System

### Setup

The theme system is already set up in `app/layout.tsx`:

```tsx
import { ThemeProvider } from "@/lib/theme/theme-provider";

<ThemeProvider defaultTheme="system">
  {children}
</ThemeProvider>
```

### Using Theme

```tsx
"use client";
import { useTheme } from "@/lib/theme/theme-provider";

function MyComponent() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  
  return (
    <div>
      Current theme: {resolvedTheme}
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

### Theme Toggle Components

Three variants available:

```tsx
import { ThemeToggle, ThemeToggleCompact, ThemeToggleDropdown } from "@/components/ui/theme-toggle";

// Icon button
<ThemeToggle />

// Compact with label
<ThemeToggleCompact />

// Dropdown with system option
<ThemeToggleDropdown />
```

### Syncing with User Profile

For authenticated users, theme preference syncs with database:

```tsx
"use client";
import { useUserTheme } from "@/hooks/use-user-theme";

function AuthenticatedApp() {
  useUserTheme(); // Auto-syncs theme with user profile
  return <div>...</div>;
}
```

---

## Components

### Button

5 variants, 4 sizes, loading state, full-width option.

```tsx
import { Button } from "@/components/ui";

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>
<Button variant="text">Text</Button>

// Sizes
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>
<Button fullWidth>Full Width</Button>
```

### Input / Textarea

Form inputs with label, error, hint support.

```tsx
import { Input, Textarea } from "@/components/ui";

<Input
  label="Email"
  placeholder="Enter email"
  error="Email is required"
  hint="We'll never share your email"
/>

<Textarea
  label="Message"
  rows={4}
  placeholder="Enter message"
/>
```

### Select

Custom styled dropdown.

```tsx
import { Select } from "@/components/ui";

<Select
  label="Country"
  options={[
    { value: "gh", label: "Ghana" },
    { value: "ng", label: "Nigeria" },
  ]}
  error="Please select a country"
/>
```

### Checkbox

Custom checkbox with label.

```tsx
import { Checkbox } from "@/components/ui";

<Checkbox label="I agree to terms" />
<Checkbox label="Subscribe" defaultChecked />
```

### Badge

6 variants + category colors.

```tsx
import { Badge } from "@/components/ui";

<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="category" categoryColor="#e31c23">GHANA</Badge>
```

### Card

Composable card components.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui";

<Card hover>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Avatar

5 sizes with image and fallback support.

```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui";

<Avatar size="md">
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>UN</AvatarFallback>
</Avatar>
```

### Dialog

Accessible modal with keyboard trapping.

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@/components/ui";

<Dialog>
  <DialogTrigger>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogBody>
      <p>Content</p>
    </DialogBody>
    <DialogFooter>
      <DialogClose>
        <Button variant="ghost">Cancel</Button>
      </DialogClose>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Tabs

Keyboard navigable tabs.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Tooltip

4 positions with delay.

```tsx
import { Tooltip } from "@/components/ui";

<Tooltip content="Tooltip text" side="top">
  <Button>Hover me</Button>
</Tooltip>
```

### Skeleton

Loading states.

```tsx
import { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar } from "@/components/ui";

<Skeleton height={200} />
<SkeletonText lines={3} />
<SkeletonCard />
<SkeletonAvatar size={40} />
```

### Pagination

Smart ellipsis generation.

```tsx
import { Pagination } from "@/components/ui";

<Pagination
  currentPage={5}
  totalPages={20}
  onPageChange={(page) => console.log(page)}
/>
```

### Toast

4 types with animations.

```tsx
import { ToastProvider, useToast } from "@/components/ui";

// Wrap app in ToastProvider
<ToastProvider>
  <App />
</ToastProvider>

// Use in components
function MyComponent() {
  const { addToast } = useToast();
  
  return (
    <Button onClick={() => addToast("Success!", "success")}>
      Show Toast
    </Button>
  );
}
```

---

## Layout Components

### Container

Max-width container with responsive padding.

```tsx
import { Container } from "@/components/layout";

<Container size="xl" padding="md">
  Content
</Container>
```

### Grid

Responsive grid system (1-12 columns).

```tsx
import { Grid, GridItem } from "@/components/layout";

<Grid cols={4} gap="md" responsive>
  <div>Item 1</div>
  <GridItem colSpan={2}>Spans 2 columns</GridItem>
  <div>Item 3</div>
</Grid>
```

### Stack / HStack / VStack

Flexible layouts.

```tsx
import { Stack, HStack, VStack } from "@/components/layout";

<VStack gap="md" align="start">
  <div>Item 1</div>
  <div>Item 2</div>
</VStack>

<HStack gap="md" justify="between">
  <div>Left</div>
  <div>Right</div>
</HStack>
```

### Section

Consistent vertical spacing.

```tsx
import { Section, SectionHeader } from "@/components/layout";

<Section padding="lg">
  <SectionHeader 
    title="Section Title"
    description="Description"
    action={<Button>Action</Button>}
  />
  Content
</Section>
```

### Divider

Horizontal/vertical dividers.

```tsx
import { Divider } from "@/components/layout";

<Divider />
<Divider label="OR" />
<Divider orientation="vertical" />
```

### AspectRatio

Maintain aspect ratios.

```tsx
import { AspectRatio } from "@/components/layout";

<AspectRatio ratio="16/9">
  <img src="..." alt="..." />
</AspectRatio>
```

---

## Icons

Using Lucide React (100+ icons).

### Basic Usage

```tsx
import { Search, Heart, Star, Bell } from "@/components/icons";

<Search className="w-5 h-5" />
<Heart className="w-5 h-5 text-[--color-vntv-red]" />
```

### Category Icons

Auto-colored icons for VNTV categories.

```tsx
import { CategoryIcon, CategoryIconCircle } from "@/components/icons/category-icons";

<CategoryIcon category="ghana" size={20} />
<CategoryIconCircle category="nigeria" size={48} />
```

### Icon Wrapper

Consistent sizing.

```tsx
import { Icon } from "@/components/ui/icon";
import { Search } from "@/components/icons";

<Icon as={Search} size="md" />
```

---

## Accessibility

### Keyboard Navigation

All components support keyboard navigation:
- **Tab**: Move focus
- **Enter/Space**: Activate buttons
- **Escape**: Close modals/dialogs
- **Arrow keys**: Navigate tabs, pagination

### Screen Reader Support

```tsx
import { announce, LiveRegion } from "@/lib/accessibility";

// Add LiveRegion to root layout
<LiveRegion />

// Announce updates
announce("Form submitted successfully", "polite");
announce("Error occurred", "assertive");
```

### Focus Management

```tsx
import { 
  focusElement, 
  getFirstFocusable, 
  focusNext, 
  focusPrevious 
} from "@/lib/accessibility";

const firstElement = getFirstFocusable(containerRef.current);
focusElement(firstElement);
```

### Focus Trap (for modals)

```tsx
import { useFocusTrap } from "@/hooks/use-focus-trap";

function Modal({ isOpen }) {
  const ref = useFocusTrap(isOpen);
  
  return <div ref={ref}>...</div>;
}
```

### CSS Utilities

```tsx
// Screen reader only
<span className="sr-only">Hidden from view, available to screen readers</span>

// Force focus visible
<button className="force-focus-visible">Always show focus outline</button>
```

---

## Form Validation

### Validation Rules

```tsx
import { validationRules, validate } from "@/lib/validation/form-validation";

const result = validate(email, [
  validationRules.required(),
  validationRules.email(),
]);

if (!result.isValid) {
  console.error(result.errors);
}
```

### Available Rules

- `required()` - Field is required
- `email()` - Valid email format
- `minLength(n)` - Minimum length
- `maxLength(n)` - Maximum length
- `pattern(regex)` - Regex pattern
- `url()` - Valid URL
- `number()` - Valid number
- `min(n)` - Minimum value
- `max(n)` - Maximum value
- `match(value)` - Values match
- `password()` - Strong password (8+ chars, uppercase, lowercase, number)
- `slug()` - Valid slug format

### Form Validation Hook

```tsx
import { useFormValidation } from "@/hooks/use-form-validation";
import { validationRules } from "@/lib/validation/form-validation";

function LoginForm() {
  const { values, errors, handleChange, handleBlur, handleSubmit } = useFormValidation({
    email: {
      initialValue: "",
      rules: [validationRules.required(), validationRules.email()],
    },
    password: {
      initialValue: "",
      rules: [validationRules.required(), validationRules.minLength(8)],
    },
  });

  const onSubmit = (values) => {
    console.log("Form values:", values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Email"
        value={values.email}
        onChange={(e) => handleChange("email")(e.target.value)}
        onBlur={handleBlur("email")}
        error={errors.email?.[0]}
      />
      <Input
        type="password"
        label="Password"
        value={values.password}
        onChange={(e) => handleChange("password")(e.target.value)}
        onBlur={handleBlur("password")}
        error={errors.password?.[0]}
      />
      <Button type="submit">Login</Button>
    </form>
  );
}
```

---

## Usage Examples

### Complete Form Example

```tsx
"use client";

import { useState } from "react";
import { Button, Input, Select, Checkbox, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useFormValidation } from "@/hooks/use-form-validation";
import { validationRules } from "@/lib/validation/form-validation";
import { useToast } from "@/components/ui";

export function ContactForm() {
  const { addToast } = useToast();
  const { values, errors, handleChange, handleBlur, handleSubmit, reset } = useFormValidation({
    name: {
      initialValue: "",
      rules: [validationRules.required(), validationRules.minLength(2)],
    },
    email: {
      initialValue: "",
      rules: [validationRules.required(), validationRules.email()],
    },
    country: {
      initialValue: "",
      rules: [validationRules.required()],
    },
    terms: {
      initialValue: false,
      rules: [
        {
          validate: (value) => value === true,
          message: "You must accept the terms",
        },
      ],
    },
  });

  const onSubmit = async (data) => {
    // Submit form
    console.log("Submitting:", data);
    addToast("Form submitted successfully!", "success");
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            value={values.name}
            onChange={(e) => handleChange("name")(e.target.value)}
            onBlur={handleBlur("name")}
            error={errors.name?.[0]}
            fullWidth
          />
          
          <Input
            label="Email"
            type="email"
            value={values.email}
            onChange={(e) => handleChange("email")(e.target.value)}
            onBlur={handleBlur("email")}
            error={errors.email?.[0]}
            fullWidth
          />
          
          <Select
            label="Country"
            value={values.country}
            onChange={(e) => handleChange("country")(e.target.value)}
            onBlur={handleBlur("country")}
            error={errors.country?.[0]}
            options={[
              { value: "", label: "Select country" },
              { value: "ghana", label: "Ghana" },
              { value: "nigeria", label: "Nigeria" },
            ]}
            fullWidth
          />
          
          <Checkbox
            label="I agree to the terms and conditions"
            checked={values.terms}
            onChange={(e) => handleChange("terms")(e.target.checked)}
            error={errors.terms?.[0]}
          />
          
          <Button type="submit" fullWidth>
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Responsive Layout Example

```tsx
import { Container, Section, Grid, HStack, VStack } from "@/components/layout";
import { Card, Button, Badge } from "@/components/ui";

export function NewsGrid() {
  return (
    <Section padding="lg">
      <Container size="xl">
        <HStack justify="between" align="center" className="mb-6">
          <h2 className="text-h1">Latest News</h2>
          <Button variant="ghost">View All</Button>
        </HStack>
        
        <Grid cols={4} gap="md" responsive>
          {articles.map((article) => (
            <Card key={article.id} hover>
              <img src={article.image} alt={article.title} />
              <VStack gap="sm" className="p-4">
                <Badge variant="category" categoryColor={article.categoryColor}>
                  {article.category}
                </Badge>
                <h3 className="text-h4">{article.title}</h3>
                <p className="text-body-sm text-[--color-foreground-muted]">
                  {article.excerpt}
                </p>
              </VStack>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
```

---

## Best Practices

### 1. Always use theme-aware colors

```tsx
// ✅ Good - uses CSS variable
<div className="bg-[--color-background-panel]">

// ❌ Bad - hardcoded color
<div className="bg-gray-100">
```

### 2. Use semantic HTML

```tsx
// ✅ Good
<button onClick={handleClick}>Click me</button>

// ❌ Bad
<div onClick={handleClick}>Click me</div>
```

### 3. Include ARIA labels

```tsx
// ✅ Good
<button aria-label="Close dialog" onClick={onClose}>
  <X className="w-5 h-5" />
</button>
```

### 4. Test keyboard navigation

All interactive elements should be keyboard accessible.

### 5. Respect reduced motion

Animations automatically respect `prefers-reduced-motion`.

---

## Support

For issues or questions about the design system:
1. Check the showcase page: `/design-system`
2. Review component source code in `components/ui/`
3. Check accessibility utilities in `lib/accessibility/`

---

**Built with ❤️ for VNTV**
