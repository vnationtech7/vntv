# Content Access Gate

Reusable component for gating content (articles and videos) for anonymous users.

## Features

- **Article Gate**: Triggered during article reading
- **Video Gate**: Triggered at 25% playback progress
- **Seamless Authentication**: Embedded login/signup forms
- **Return to Content**: Automatically resumes content after authentication
- **Mobile Optimized**: Responsive design that works on all devices
- **Theme Aware**: Supports light and dark themes

## Usage

### Article Gate Example

```tsx
"use client";

import { ContentAccessGate } from "@/components/content";
import { useContentGate } from "@/hooks/use-content-gate";
import { useEffect } from "react";

export function ArticlePage({ article, gateEnabled }) {
  const { showGate, triggerGate, closeGate, isAuthenticated } = useContentGate({
    type: "article",
    enabled: gateEnabled,
    contentTitle: article.title,
  });

  // Trigger gate when user scrolls to a certain point
  useEffect(() => {
    if (!isAuthenticated && gateEnabled) {
      const handleScroll = () => {
        const scrollPercentage = (window.scrollY / document.body.scrollHeight) * 100;
        
        // Trigger gate at 50% scroll
        if (scrollPercentage > 50) {
          triggerGate();
          window.removeEventListener("scroll", handleScroll);
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [isAuthenticated, gateEnabled, triggerGate]);

  const handleAuthenticated = () => {
    closeGate();
    // User can continue reading
  };

  return (
    <div>
      <article>{/* Article content */}</article>

      <ContentAccessGate
        type="article"
        isOpen={showGate}
        onClose={closeGate}
        onAuthenticated={handleAuthenticated}
        contentTitle={article.title}
      />
    </div>
  );
}
```

### Video Gate Example

```tsx
"use client";

import { ContentAccessGate } from "@/components/content";
import { useContentGate } from "@/hooks/use-content-gate";
import { useRef, useState } from "react";

export function VideoPlayer({ video, gateEnabled }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasTriggeredGate, setHasTriggeredGate] = useState(false);

  const { showGate, triggerGate, closeGate, isAuthenticated } = useContentGate({
    type: "video",
    enabled: gateEnabled,
    contentTitle: video.title,
  });

  const handleTimeUpdate = () => {
    if (!videoRef.current || hasTriggeredGate || isAuthenticated || !gateEnabled) {
      return;
    }

    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;

    // Trigger gate at 25% playback
    if (progress >= 25) {
      videoRef.current.pause();
      triggerGate();
      setHasTriggeredGate(true);
    }
  };

  const handleAuthenticated = () => {
    closeGate();
    // Resume playback
    videoRef.current?.play();
  };

  return (
    <div>
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        controls
      >
        <source src={video.url} />
      </video>

      <ContentAccessGate
        type="video"
        isOpen={showGate}
        onClose={closeGate}
        onAuthenticated={handleAuthenticated}
        contentTitle={video.title}
      />
    </div>
  );
}
```

### Server-Side Gate Check

```tsx
import { isArticleGateEnabled, isVideoGateEnabled } from "@/app/settings/actions";

export default async function ArticlePage({ params }) {
  const gateEnabled = await isArticleGateEnabled();

  return <ArticlePageClient article={article} gateEnabled={gateEnabled} />;
}
```

## Components

### ContentAccessGate

Main gate component that shows authentication modal.

**Props:**

- `type`: `"article" | "video"` - Type of content being gated
- `isOpen`: `boolean` - Whether the gate should be shown
- `onClose`: `() => void` - Callback when gate is closed
- `onAuthenticated?`: `() => void` - Callback after successful authentication
- `contentTitle?`: `string` - Content title for better messaging

### useContentGate Hook

React hook for managing gate state.

**Options:**

- `type`: `"article" | "video"` - Type of content
- `enabled`: `boolean` - Whether gating is enabled
- `contentTitle?`: `string` - Content title

**Returns:**

- `showGate`: `boolean` - Whether gate should be shown
- `triggerGate`: `() => void` - Function to trigger the gate
- `closeGate`: `() => void` - Function to close the gate
- `isAuthenticated`: `boolean` - Whether user is authenticated

## Server Actions

### getSiteSetting(key: string)

Fetch a site setting value by key.

### isArticleGateEnabled()

Check if article gating is enabled in site settings.

### isVideoGateEnabled()

Check if video gating is enabled in site settings.

## Configuration

Gate settings are stored in the `site_settings` table:

- `anonymous_article_gate_enabled`: `boolean` - Enable article gating
- `anonymous_video_gate_enabled`: `boolean` - Enable video gating

Update these settings in the admin panel to control gating behavior.

## Behavior

### Article Gate
- Triggered during article reading (typically at scroll point)
- Shows authentication modal overlay
- User can sign in or sign up
- After authentication, user can continue reading

### Video Gate
- Triggered at 25% playback progress
- Pauses video automatically
- Shows authentication modal overlay
- After authentication, video resumes playback
- YouTube videos are NOT gated (only VNTV-hosted videos)

## Mobile Support

The gate is fully responsive and optimized for mobile devices:
- Touch-friendly form inputs
- Proper viewport scaling
- Accessible tap targets
- Smooth animations

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- Focus management
- ARIA labels
- Clear error messages
