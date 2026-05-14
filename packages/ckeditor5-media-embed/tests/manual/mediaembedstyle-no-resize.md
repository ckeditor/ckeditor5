# Media embed alignment without the resize feature

Editor configured with `MediaEmbed` + `MediaEmbedStyle` (no `MediaEmbedResize`). The page stylesheet
caps the YouTube figure at `max-width: 50%`, simulating a scenario where the figure's width comes
from outside the resize feature (custom integrator CSS, GeneralHtmlSupport preserving inline styles,
custom upcast, etc.). The Spotify embed is unaffected by that rule and demos a different width
source — its built-in 300px default.

The selected figure should have a contextual toolbar with **Break text** and **Wrap text** dropdowns.

## Default centering

1. The first figure (no alignment class) should be centered horizontally inside the editor content,
1. The data `<figure>` should be `class="media"` only — no alignment class.

## Block alignment shifts the figure even without `media_resized`

1. Select the YouTube embed,
1. From the **Break text** dropdown, click "Left aligned media" — the figure should pin to the left edge of the content area,
1. The data `<figure>` should include `media-style-block-align-left` (no `media_resized` class — the resize plugin is not loaded),
1. Repeat for "Right aligned media" — the figure should pin to the right edge,
1. Click "Centered media" — the figure should re-center.

## Wrap-text alignment with surrounding text

1. Select the YouTube embed,
1. From the **Wrap text** dropdown, click "Left aligned media" — the figure should float left and the paragraph below should wrap around it,
1. The data `<figure>` should include `media-style-align-left`,
1. Repeat with "Right aligned media" — the figure should float right with text wrapping on the left.

## Provider with a built-in default width (Spotify)

1. Select the Spotify embed (300px wide by default),
1. Apply each block alignment in turn — the figure should shift to the corresponding edge of the content area,
1. Apply each wrap-text alignment in turn — the figure should float to the corresponding side and surrounding text should wrap around it.

## Round-trip

1. Apply any alignment,
1. Call `editor.getData()` — the output should contain only `media-style-*` classes; no `media_resized`, no `style="width: …"` (the resize feature is not loaded).
