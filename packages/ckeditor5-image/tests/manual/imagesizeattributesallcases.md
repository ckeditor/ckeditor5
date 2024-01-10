## Image size attributes

This manual tests consists of many use cases for different combinations of image attributes and styles:
* `width` (image width attribute)
* `height` (image height attribute)
* `resizedWidth` (image width style)
* `resizedHeight` (image height style)

Image in the editor should look like the image next to the editor (created from editor's output data):
* after initial editor load
	* the exception to this are inline images that have not been resized (because in the editor they have `max-width: 100%`)
* after resizing image in the editor

**Note**: Every time an image is resized, the code blocks below the editor are updated with refreshed output data and model.
It's then easier to compare what has changed after resizing.
