## Div element

Verify if `div` element model has been correctly upcasted depending on the content context:

* `div` element including only phrasing content should be upcasted to `htmlDivInline` model.
* `div` element including paragraphs should be upcasted to `htmlDiv` model.
* Mixed content including both block and inline content should autoparagraph inline content and upcast `div` element to `htmlDiv` model.
* Content including disallowed `div` element should be correctly split without data loss (you should see `foobar` in image caption).
