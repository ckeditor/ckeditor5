## Show whitespace — performance test

1. The editor loads with ~500 paragraphs of generated content.
2. Open browser DevTools Performance tab.
3. Click the pilcrow button (¶) to toggle show whitespace ON — note the toggle time in console.
4. Click again to toggle OFF — note the toggle time.
5. With the feature ON, type in the middle of the document — verify there is no noticeable typing lag.
6. Toggle times under 200ms are acceptable. Over 500ms needs optimization.
