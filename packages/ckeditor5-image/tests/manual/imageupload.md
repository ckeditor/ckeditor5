## Image upload

1. Drop an image into editor.
1. Image should be read and displayed.
1. Press "Upload progress" button couple times to simulate upload process.
1. After uploading is complete your image should be replaced with sample image from server.

On the occasionn – when you drop an image on another image in the editor,
your browser [**should not** redirect to the image](https://github.com/ckeditor/ckeditor5-upload/issues/32).

Repeat all the steps with:
* dropping multiple images,
* using toolbar button to add one and multiple images,
* using `Simulate error` button to stop upload, show error and remove image,
* using `Simulate aborting` button to stop upload and remove image.
