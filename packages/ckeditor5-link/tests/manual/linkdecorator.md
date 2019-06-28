## Link decorators

### Manual decorators (window.editors.manualDecorators):

1. Should be available for every link.
2. Should be applied to the content only when "Save" was clicked.
3. There should be initially set some decorators over specific links based on source data of the editor:
    * `CKEditor5` has: "Open in a new tab"
    * `CKSource` has: "Open in a new tab" and "Downloadable"
    * `CKEditor5` (schemaless) has: "Gallery"
    * `ftp address` has: "Downloadable"
4. There should be 3 manual decorators available:
    * Open in new a new tab
    * Downloadable
    * Gallery link
5. State of the decorator switches should reflect the model of the currently selected link.
6. Switch buttons should be focusable (with the tab key), after the URL input. The "save" and "cancel" buttons should be focused last.

### Automatic decorators (window.editors.automaticDecorators).

1. There should be a default automatic decorator turned on, which adds `target="_blank"` and `rel="noopener noreferrer"` attributes to all external links (links starting with `http://`, `https://` or `//`).
2. There should be no changes to the model or the view of the editors.
3. Decorator data should be added during downcast (run `window.editors.automaticDecorators.getData()` to see how it works).
4. There are 2 additional decorators in this editor:
    * phone, which detects all links starting with `tel:` and adds the `phone` CSS class to such link,
    * internal, which adds the `internal` CSS class to all links starting with `#`.
