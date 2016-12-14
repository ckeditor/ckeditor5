## Image feature

* Images with CKEditor logo should be loaded.
* Hovering over image should apply yellow outline.
* Clicking on image should apply blue outline which should not change when hovering over.

### Deleting

* Click image and press <kbd>delete</kbd> (<kbd>forward delete</kbd> on Mac) - empty paragraph should be created in place of image.
* Click image and press <kbd>backspace</kbd> (<kbd>delete</kbd> on Mac)  - empty paragraph should be created in place of image.
* Place selection at the end of the first paragraph and press <kbd>delete</kbd> (<kbd>forward delete</kbd> on Mac) - image should be selected. Second press should delete it.
* Place selection at the beginning of the second paragraph and press <kbd>backspace</kbd> (<kbd>delete</kbd> on Mac) - image should be selected. Second press should delete it.
* Place selection in an empty paragraph before image and press <kbd>delete</kbd> (<kbd>forward delete</kbd> on Mac) - image should be selected and paragraph removed.
* Place selection in an empty paragraph after image and press <kbd>backspace</kbd> (<kbd>delete</kbd> on Mac) - image should be selected and paragraph removed.

### Arrow key handling

* Click first image and press <kbd>right arrow</kbd> - second image should be selected. Same effect should happen for <kbd>down arrow</kbd>.
* Click second image and press <kbd>left arrow</kbd> - first image should be selected. Same effect should happen for <kbd>up arrow</kbd>.
* Place selection at the end of the first paragraph and press <kbd>right arrow</kbd> - third image should be selected. Same effect should happen for <kbd>down arrow</kbd>.
* Place selection at the beginning of the first paragraph and press <kbd>left arrow</kbd> - first image should be selected. Same effect should happen for <kbd>up arrow</kbd>.
