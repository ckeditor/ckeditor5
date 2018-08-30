---
# Scope:
# * Explain browser compatibility of CKEditor 5.
# * Document known compatibility issues and missing features.
# * Discuss support for mobile environments.

category: builds-support
order: 10
---

# Browser compatibility

## Desktop environment

CKEditor 5 is currently supported in the following desktop browsers:

* Full support (see [notes below](#notes)):
	* Chrome (latest stable release).
	* Firefox (latest stable release).
	* Safari (latest stable release).
	* Opera (latest stable release).
	* Electron (latest stable release).
* Good support:
	* Edge (latest stable release). Known issues:
		* Minor issues with selection: [1](https://github.com/ckeditor/ckeditor5-engine/issues/974), [2](https://github.com/ckeditor/ckeditor5-engine/issues/928).
		* The editor becomes unstable when F12 developer tools are enabled.

Not supported yet:

* Internet Explorer 11. See the [Compatibility with IE11](https://github.com/ckeditor/ckeditor5/issues/330) ticket.

### Notes

Features known to not be fully supported yet:

* Text composition. Input Method Engine (IME) is a mechanism that allows the users to input text in languages such as Japanese and Chinese. This mechanism is not fully supported yet and we will be polishing that feature in a close future.
* Drag and drop inside the editor does not work yet. It is possible to drop images from your system if the {@link module:image/imageupload~ImageUpload} feature is enabled.

## Mobile environment

CKEditor 5 is currently supported in the following mobile environments:

* Android (all vendor-supported versions)
* iOS (all vendor-supported versions)
* Android WebView
* iOS WebView (UIWebView and WKWebView)

## Quality assurance

To ensure the highest quality, we maintain a complete test suite with a stable 100% of code coverage for each of the packages. As of April 2018, this means over 8200 tests and the number is growing.

Such an extensive test suite requires a proper continuous integration service. We use [Travis CI](https://travis-ci.com/) as a build platform and [BrowserStack](https://www.browserstack.com/) to be able to run tests on all browsers. These services ensure seamless and fast developer experience and allow us to focus on the job.
