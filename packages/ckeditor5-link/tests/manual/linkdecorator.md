## Link decorators

### Manual decorators (window.editors.manualDecorators):
1. Should be available for every link.
2. Should apply changes after accepting changes.
3. There should be available 3 manual decorators:
  * Open in new window
  * Downloadable
  * Gallery link
4. State of buttons should reflect state of currently selected link.
5. Switch buttons should be focused (with tab key) after input. Save and cancel buttons should be focused at the end

### Automatic decorators (window.editors.automaticDecorators).
1. There should be turned on default automatic decorator, which adds `target="_blank"` and `rel="noopener noreferrer"` attributes to all external links (links started with `http://`, `https://` or `//`);
2. There should not be any changes in model or view of the editors.
3. Additional data should be added during downcast ( you need to run `window.editors.automaticDecorators.getData()` to see how it works ).
4. There are 2 additional decorators:
  * phone, which detects all links started with `tel:` and adds `phone` class to such link
  * internal, which adds `internal` class to all links started with `#`
