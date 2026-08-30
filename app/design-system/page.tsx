"use client";

import { useState } from "react";
import { Container, Section, SectionHeader, Grid, Stack, HStack, VStack, Divider } from "@/components/layout";
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Tooltip,
  Skeleton,
  ArticleCardSkeleton,
  VideoCardSkeleton,
  TrendingItemSkeleton,
  Pagination,
  ToastProvider,
  useToast,
} from "@/components/ui";
import { ThemeToggle, ThemeToggleCompact } from "@/components/ui/theme-toggle";
import { useTheme } from "@/lib/theme/theme-provider";
import { 
  Search, 
  Heart, 
  Star, 
  Bell, 
  Mail, 
  User, 
  Settings,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
} from "@/components/icons";
import { CategoryIcon, CategoryIconCircle } from "@/components/icons/category-icons";

export default function DesignSystemPage() {
  const { resolvedTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <ToastProvider>
      <main className="min-h-screen py-12">
        <Container size="xl">
          {/* Header */}
          <div className="mb-12">
            <HStack justify="between" align="center" className="mb-6">
              <div>
                <h1 className="text-hero mb-2">
                  <span className="text-[--color-vntv-red]">VN</span>TV Design System
                </h1>
                <p className="text-[13px] text-[--color-foreground-muted]">
                  Complete component library in <span className="font-bold">{resolvedTheme}</span> theme
                </p>
              </div>
              <HStack gap="md">
                <ThemeToggleCompact />
                <ThemeToggle />
              </HStack>
            </HStack>
            <Divider />
          </div>

          {/* Design Tokens */}
          <Section padding="md">
            <SectionHeader 
              title="Design Tokens" 
              description="Brand colors, typography, and spacing"
            />
            <Grid cols={3} gap="md">
              <ColorShowcase />
              <TypographyShowcase />
              <SpacingShowcase />
            </Grid>
          </Section>

          {/* Buttons */}
          <Section padding="md">
            <SectionHeader 
              title="Buttons" 
              description="5 variants, 4 sizes, loading state"
            />
            <VStack gap="lg">
              <ButtonVariants />
              <ButtonSizes />
              <ButtonStates />
            </VStack>
          </Section>

          {/* Form Inputs */}
          <Section padding="md">
            <SectionHeader 
              title="Form Inputs" 
              description="Input, Textarea, Select, Checkbox with validation"
            />
            <Grid cols={2} gap="lg">
              <FormInputs />
            </Grid>
          </Section>

          {/* Badges */}
          <Section padding="md">
            <SectionHeader 
              title="Badges" 
              description="6 variants + category colors"
            />
            <BadgeShowcase />
          </Section>

          {/* Cards */}
          <Section padding="md">
            <SectionHeader 
              title="Cards" 
              description="Composable card components"
            />
            <Grid cols={3} gap="md">
              <CardShowcase />
            </Grid>
          </Section>

          {/* Avatars */}
          <Section padding="md">
            <SectionHeader 
              title="Avatars" 
              description="5 sizes with fallback support"
            />
            <AvatarShowcase />
          </Section>

          {/* Icons */}
          <Section padding="md">
            <SectionHeader 
              title="Icons" 
              description="Lucide React + Category icons"
            />
            <IconShowcase />
          </Section>

          {/* Dialog */}
          <Section padding="md">
            <SectionHeader 
              title="Dialog" 
              description="Modal with full accessibility"
            />
            <DialogShowcase />
          </Section>

          {/* Tabs */}
          <Section padding="md">
            <SectionHeader 
              title="Tabs" 
              description="Keyboard navigable tabs"
            />
            <TabsShowcase />
          </Section>

          {/* Skeleton Loaders */}
          <Section padding="md">
            <SectionHeader 
              title="Skeleton Loaders" 
              description="Loading states"
            />
            <Grid cols={3} gap="md">
              <ArticleCardSkeleton />
              <ArticleCardSkeleton />
              <ArticleCardSkeleton />
            </Grid>
          </Section>

          {/* Pagination */}
          <Section padding="md">
            <SectionHeader 
              title="Pagination" 
              description="Smart ellipsis generation"
            />
            <Pagination
              currentPage={currentPage}
              totalPages={20}
              onPageChange={setCurrentPage}
            />
          </Section>

          {/* Toast */}
          <Section padding="md">
            <SectionHeader 
              title="Toast Notifications" 
              description="4 types with animations"
            />
            <ToastShowcase />
          </Section>

          {/* Layout Components */}
          <Section padding="md">
            <SectionHeader 
              title="Layout Components" 
              description="Container, Grid, Stack, Divider"
            />
            <LayoutShowcase />
          </Section>
        </Container>
      </main>
    </ToastProvider>
  );
}

// Showcase Components
function ColorShowcase() {
  const colors = [
    { name: "VNTV Red", value: "#e0142c" },
    { name: "Ghana", value: "#e31c23" },
    { name: "Nigeria", value: "#f5a623" },
    { name: "Africa", value: "#2fbf6f" },
    { name: "World", value: "#4a90e2" },
    { name: "Politics", value: "#9013fe" },
    { name: "Business", value: "#f08bb4" },
    { name: "Sports", value: "#5856d6" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Colors</CardTitle>
      </CardHeader>
      <CardContent>
        <VStack gap="sm">
          {colors.map((color) => (
            <HStack key={color.name} gap="md" align="center">
              <div
                className="w-8 h-8 rounded-md border border-[--color-border]"
                style={{ backgroundColor: color.value }}
              />
              <div>
                <div className="text-[12px] font-bold">{color.name}</div>
                <div className="text-[11px] text-[--color-foreground-muted]">{color.value}</div>
              </div>
            </HStack>
          ))}
        </VStack>
      </CardContent>
    </Card>
  );
}

function TypographyShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Typography</CardTitle>
      </CardHeader>
      <CardContent>
        <VStack gap="md">
          <div>
            <div className="text-hero">Hero 34px</div>
            <div className="text-[11px] text-[--color-foreground-muted]">text-hero</div>
          </div>
          <div>
            <div className="text-h1">Heading 1 24px</div>
            <div className="text-[11px] text-[--color-foreground-muted]">text-h1</div>
          </div>
          <div>
            <div className="text-h3">Heading 3 16px</div>
            <div className="text-[11px] text-[--color-foreground-muted]">text-h3</div>
          </div>
          <div>
            <div className="text-body">Body 14px</div>
            <div className="text-[11px] text-[--color-foreground-muted]">text-body</div>
          </div>
          <div>
            <div className="text-caption">Caption 12px</div>
            <div className="text-[11px] text-[--color-foreground-muted]">text-caption</div>
          </div>
        </VStack>
      </CardContent>
    </Card>
  );
}

function SpacingShowcase() {
  const spacingSizes = [
    { name: "xs", width: 20 },
    { name: "sm", width: 40 },
    { name: "md", width: 60 },
    { name: "lg", width: 80 },
    { name: "xl", width: 100 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spacing</CardTitle>
      </CardHeader>
      <CardContent>
        <VStack gap="md">
          {spacingSizes.map((size) => (
            <div key={size.name}>
              <div className="text-[12px] font-bold mb-1">gap-{size.name}</div>
              <div 
                className="h-2 bg-[--color-vntv-red] rounded" 
                style={{ width: `${size.width}%` }} 
              />
            </div>
          ))}
        </VStack>
      </CardContent>
    </Card>
  );
}

function ButtonVariants() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Button Variants</CardTitle>
      </CardHeader>
      <CardContent>
        <HStack gap="md" wrap>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="text">Text</Button>
        </HStack>
      </CardContent>
    </Card>
  );
}

function ButtonSizes() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Button Sizes</CardTitle>
      </CardHeader>
      <CardContent>
        <HStack gap="md" align="center" wrap>
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </HStack>
      </CardContent>
    </Card>
  );
}

function ButtonStates() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Button States</CardTitle>
      </CardHeader>
      <CardContent>
        <HStack gap="md" wrap>
          <Button>Normal</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button fullWidth>Full Width</Button>
        </HStack>
      </CardContent>
    </Card>
  );
}

function FormInputs() {
  return (
    <>
      <VStack gap="md">
        <Input label="Email" placeholder="Enter your email" type="email" />
        <Input label="Password" placeholder="Enter password" type="password" />
        <Input label="Error State" placeholder="Invalid input" error="This field is required" />
        <Input label="With Hint" placeholder="Username" hint="Choose a unique username" />
      </VStack>
      <VStack gap="md">
        <Textarea label="Message" placeholder="Enter your message" rows={4} />
        <Select
          label="Country"
          options={[
            { value: "ghana", label: "Ghana" },
            { value: "nigeria", label: "Nigeria" },
            { value: "kenya", label: "Kenya" },
          ]}
        />
        <Checkbox label="I agree to terms and conditions" />
        <Checkbox label="Subscribe to newsletter" defaultChecked />
      </VStack>
    </>
  );
}

function BadgeShowcase() {
  return (
    <VStack gap="md">
      <HStack gap="sm" wrap>
        <Badge variant="primary">Primary</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="info">Info</Badge>
      </HStack>
      <HStack gap="sm" wrap>
        <Badge variant="category" categoryColor="#e31c23">GHANA</Badge>
        <Badge variant="category" categoryColor="#f5a623">NIGERIA</Badge>
        <Badge variant="category" categoryColor="#2fbf6f">AFRICA</Badge>
        <Badge variant="category" categoryColor="#4a90e2">WORLD</Badge>
        <Badge variant="category" categoryColor="#9013fe">POLITICS</Badge>
      </HStack>
    </VStack>
  );
}

function CardShowcase() {
  return (
    <>
      <Card hover>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body-sm">This is a basic card with hover effect.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="ghost">Action</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="aspect-video bg-[--color-background-panel-2]" />
        </CardContent>
        <CardHeader>
          <CardTitle>Image Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-sm">Card with image content.</p>
        </CardContent>
      </Card>

      <Card className="p-8">
        <Badge variant="primary" className="mb-3">FEATURED</Badge>
        <CardTitle className="mb-2">Featured Content</CardTitle>
        <p className="text-body-sm text-[--color-foreground-muted]">
          This card has custom padding and a badge.
        </p>
      </Card>
    </>
  );
}

function AvatarShowcase() {
  return (
    <VStack gap="md">
      <HStack gap="md" align="center">
        <Avatar size="xs"><AvatarFallback>XS</AvatarFallback></Avatar>
        <Avatar size="sm"><AvatarFallback>SM</AvatarFallback></Avatar>
        <Avatar size="md"><AvatarFallback>MD</AvatarFallback></Avatar>
        <Avatar size="lg"><AvatarFallback>LG</AvatarFallback></Avatar>
        <Avatar size="xl"><AvatarFallback>XL</AvatarFallback></Avatar>
      </HStack>
      <HStack gap="md" align="center">
        <Avatar><AvatarFallback>UN</AvatarFallback></Avatar>
        <div>
          <div className="text-[14px] font-bold">Username</div>
          <div className="text-[12px] text-[--color-foreground-muted]">user@example.com</div>
        </div>
      </HStack>
    </VStack>
  );
}

function IconShowcase() {
  return (
    <VStack gap="lg">
      <HStack gap="md" wrap>
        <Search className="w-6 h-6" />
        <Heart className="w-6 h-6" />
        <Star className="w-6 h-6" />
        <Bell className="w-6 h-6" />
        <Mail className="w-6 h-6" />
        <User className="w-6 h-6" />
        <Settings className="w-6 h-6" />
        <Play className="w-6 h-6" />
        <Pause className="w-6 h-6" />
        <CheckCircle className="w-6 h-6 text-[--color-success]" />
        <AlertCircle className="w-6 h-6 text-[--color-error]" />
      </HStack>
      <HStack gap="md" wrap>
        {["ghana", "nigeria", "africa", "world", "politics", "business", "entertainment", "sports"].map((cat) => (
          <CategoryIconCircle key={cat} category={cat} size={48} />
        ))}
      </HStack>
    </VStack>
  );
}

function DialogShowcase() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>This is a description of the dialog content.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-body">
            This dialog demonstrates the modal component with proper focus management
            and keyboard navigation. Press ESC to close.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TabsShowcase() {
  return (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <Card><CardContent className="p-6">Content for Tab 1</CardContent></Card>
      </TabsContent>
      <TabsContent value="tab2">
        <Card><CardContent className="p-6">Content for Tab 2</CardContent></Card>
      </TabsContent>
      <TabsContent value="tab3">
        <Card><CardContent className="p-6">Content for Tab 3</CardContent></Card>
      </TabsContent>
    </Tabs>
  );
}

function ToastShowcase() {
  const { addToast } = useToast();

  return (
    <HStack gap="md" wrap>
      <Button onClick={() => addToast("Success message", "success")}>Success Toast</Button>
      <Button onClick={() => addToast("Error message", "error")}>Error Toast</Button>
      <Button onClick={() => addToast("Warning message", "warning")}>Warning Toast</Button>
      <Button onClick={() => addToast("Info message", "info")}>Info Toast</Button>
    </HStack>
  );
}

function LayoutShowcase() {
  return (
    <VStack gap="lg">
      <Card>
        <CardHeader>
          <CardTitle>Grid System</CardTitle>
        </CardHeader>
        <CardContent>
          <Grid cols={4} gap="md">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-[--color-vntv-red] rounded-md flex items-center justify-center text-white font-bold">
                {i}
              </div>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stack Components</CardTitle>
        </CardHeader>
        <CardContent>
          <VStack gap="md">
            <HStack gap="md" justify="between">
              <div className="h-12 w-12 bg-[--color-category-ghana] rounded-md" />
              <div className="h-12 w-12 bg-[--color-category-nigeria] rounded-md" />
              <div className="h-12 w-12 bg-[--color-category-africa] rounded-md" />
              <div className="h-12 w-12 bg-[--color-category-world] rounded-md" />
            </HStack>
          </VStack>
        </CardContent>
      </Card>
    </VStack>
  );
}
