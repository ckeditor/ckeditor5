## SVG with script included

Elements have set SVG in `src` or `srcset` attribute with script inside. Included script changes the color of a circle inside SVG to red if executed.

**Case 1:** `<img>` elements should display green or blue circle, meaning a script wasn't executed.

**Case 2:** Other elements shouldn't display anything, meaning the src/data attribute was filtered.
