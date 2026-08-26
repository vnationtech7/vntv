/**
 * Focus visible utilities
 * 
 * Helps manage focus states for keyboard vs mouse navigation
 */

let isUsingKeyboard = false;

if (typeof window !== "undefined") {
  // Detect keyboard usage
  window.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      isUsingKeyboard = true;
      document.body.classList.add("using-keyboard");
    }
  });

  // Detect mouse usage
  window.addEventListener("mousedown", () => {
    isUsingKeyboard = false;
    document.body.classList.remove("using-keyboard");
  });
}

/**
 * Check if user is currently using keyboard navigation
 */
export function isKeyboardNavigation(): boolean {
  return isUsingKeyboard;
}

/**
 * Focus an element programmatically
 */
export function focusElement(element: HTMLElement | null, options?: FocusOptions) {
  if (!element) return;
  
  element.focus(options);
  
  // Ensure focus is visible
  if (isUsingKeyboard) {
    element.classList.add("force-focus-visible");
  }
}

/**
 * Get first focusable element in a container
 */
export function getFirstFocusable(container: HTMLElement): HTMLElement | null {
  const focusable = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  return focusable[0] || null;
}

/**
 * Get all focusable elements in a container
 */
export function getAllFocusable(container: HTMLElement): HTMLElement[] {
  const focusable = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  return Array.from(focusable);
}

/**
 * Focus next element in sequence
 */
export function focusNext(currentElement: HTMLElement) {
  const focusableElements = getAllFocusable(document.body);
  const currentIndex = focusableElements.indexOf(currentElement);
  const nextElement = focusableElements[currentIndex + 1];
  
  if (nextElement) {
    focusElement(nextElement);
  }
}

/**
 * Focus previous element in sequence
 */
export function focusPrevious(currentElement: HTMLElement) {
  const focusableElements = getAllFocusable(document.body);
  const currentIndex = focusableElements.indexOf(currentElement);
  const previousElement = focusableElements[currentIndex - 1];
  
  if (previousElement) {
    focusElement(previousElement);
  }
}
