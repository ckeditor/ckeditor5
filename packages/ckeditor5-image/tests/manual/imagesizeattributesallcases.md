## Image size attributes

This manual tests consists of many use cases for different combinations of image attributes and styles:
* `width` (image width attribute)
* `height` (image height attribute)
* `resizedWidth` (image width style)
* `resizedHeight` (image height style)

Image in the editor should look like the image next to the editor (created from editor's output data):
* after initial editor load
* after resizing image in the editor

**Note**: Every time an image is resized, the code blocks below the editor are updated with refreshed output data and model.
It's then easier to compare what has changed after resizing.
