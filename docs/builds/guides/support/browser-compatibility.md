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

* Full support:
	* Chrome (latest stable release).
	* Firefox (latest stable release).
	* Safari (latest stable release).
	* Opera (latest stable release).
	* Electron (latest stable release).
	* Edge (latest stable release). Known issues:
		* Minor issue with selection: [1](https://github.com/ckeditor/ckeditor5-engine/issues/974).

Not supported yet:

* Internet Explorer 11. See the [Compatibility with IE11](https://github.com/ckeditor/ckeditor5/issues/330) ticket.

## Mobile environment

CKEditor 5 is currently supported in the following mobile environments:

* Android (all vendor-supported versions)
* iOS (all vendor-supported versions)
* Android WebView
* iOS WebView (UIWebView and WKWebView)

## Quality assurance

To ensure the highest quality, we maintain a complete test suite with a stable 100% of code coverage for each of the packages. As of February 2020, this means over 12,000 tests and the number is growing.

Such an extensive test suite requires a proper continuous integration service. We use [Travis CI](https://travis-ci.com/) as a build platform. This service ensures seamless and fast developer experience and allow us to focus on the job.
