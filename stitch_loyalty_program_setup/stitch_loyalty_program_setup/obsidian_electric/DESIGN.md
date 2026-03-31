```markdown
# Design System: Midnight & Electric Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Neon Nocturne"**

This design system rejects the "safe" corporate grid in favor of a high-end, editorial experience that feels like a luxury lifestyle digital concierge. It is built on the tension between deep, infinite obsidian voids and sharp, electric bursts of light. 

To move beyond a "template" look, we employ **Intentional Asymmetry**. Key elements should not always be centered; use the `24 (8.5rem)` and `20 (7rem)` spacing tokens to create dramatic gutters that force the eye toward hero content. Overlap elements—such as a `surface-container-high` card bleeding over a `surface-bright` background—to create a sense of bespoke, layered depth that feels curated rather than generated.

---

## 2. Colors & Surface Logic

The palette is a sophisticated interplay of `background (#060e20)` and vibrant pops of `primary (#ba9eff)`. 

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to define sections. Boundaries must be felt, not seen. Separate content blocks by shifting from `surface` to `surface-container-low` or `surface-container-high`. This creates a seamless, "molded" look characteristic of premium hardware interfaces.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials.
*   **Base Layer:** `surface` (#060e20) for the main viewport.
*   **Secondary Sections:** Use `surface-container-low` for large, secondary content areas.
*   **Interactive Cards:** Use `surface-container-highest` or `surface-bright` to pull critical loyalty data (e.g., points balance) toward the user.

### The "Glass & Gradient" Rule
To achieve the "Electric" feel, avoid flat primary colors on large surfaces.
*   **Signature Textures:** For main CTAs and progress bars, use a linear gradient transitioning from `primary_dim (#8455ef)` to `primary (#ba9eff)` at a 135-degree angle.
*   **Glassmorphism:** For floating navigation bars or modal overlays, use `surface_variant` at 60% opacity with a `20px` backdrop-blur. This allows the "Midnight" background to bleed through, softening the tech-heavy aesthetic.

---

## 3. Typography: The Geometric Voice

We use a dual-font strategy to balance high-fashion editorial with technical precision.

*   **Display & Headlines (Manrope):** These are your "vibe" setters. Use `display-lg` and `headline-lg` with `letter-spacing: -0.04em`. This tight tracking creates a dense, "locked-in" premium feel.
*   **Body & Labels (Inter):** For utility and readability. Use `body-md` for all descriptive text. Ensure `on_surface_variant (#a3aac4)` is used for secondary metadata to maintain the moody, low-contrast atmosphere of the background while keeping the `primary` and `white` text for high-importance items.

---

## 4. Elevation & Depth

### The Layering Principle
Forget shadows as a default. Use **Tonal Stacking**. 
*   Place a card using `surface_container_lowest (#000000)` on top of a `surface (#060e20)` background to create a "sunken" or "carved" effect. 
*   Conversely, place `surface_bright` on `surface` for a "raised" effect.

### Ambient Shadows
When an element must float (e.g., a "Redeem" button), use an **Ambient Glow**. Instead of a grey shadow, use a shadow color derived from `surface_tint` (#ba9eff) at 8% opacity with a `32px` blur and `16px` Y-offset. This mimics the glow of a neon sign against a dark street.

### The "Ghost Border" Fallback
If contrast is required for accessibility, use the `outline_variant` token at **15% opacity**. It should be a mere suggestion of an edge, not a hard line.

---

## 5. Components

### Buttons: The Action Drivers
*   **Primary:** Rounded `full (9999px)`. Use the signature gradient (Primary Dim to Primary). Text color must be `on_primary (#39008c)`.
*   **Secondary:** Rounded `full`. Background: `surface_container_high`. Border: Ghost Border (15% opacity `outline`).

### Cards: The Loyalty Vault
*   **Styling:** Use `md (1.5rem)` or `lg (2rem)` corner radius. 
*   **Forbid Dividers:** Never use a line to separate a card header from its body. Use a `1.4rem (4)` vertical gap or a slight background shift.

### Input Fields: Minimalist Luxury
*   **Style:** No background fill. Only a bottom "Ghost Border" using `outline`. 
*   **Active State:** The border transitions to a `2px` solid `secondary (#34b5fa)` with a subtle outer glow.

### The "Status Glow" (Contextual Component)
Instead of standard success/error banners, use a small `8px` blurred dot of `error (#ff6e84)` or `secondary (#34b5fa)` next to the relevant typography to indicate status organically.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Whitespace as a Luxury:** Give elements room to breathe. Use the `16 (5.5rem)` spacing token between major sections.
*   **Embrace the Dark:** Keep 90% of the UI in the `surface` and `surface_container` range. Save `white` and `primary` for the "Electric" moments.
*   **Tighten the Type:** Keep the letter spacing on Manrope tight to maintain the "High-End" tech look.

### Don’t:
*   **No "Safety" Green:** Even for success states, use `secondary (Cyber Blue)`. We are building a lifestyle app, not a banking spreadsheet.
*   **No Standard Grids:** Avoid perfectly symmetrical 2-column layouts. Try a 60/40 split to create visual tension.
*   **No Opaque Borders:** Hard lines kill the "Glassmorphism" effect. If you see a hard 1px line, delete it.```