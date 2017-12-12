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
* Good support:
	* Edge (latest stable release). Known issues:
		* Minor issues with selection: [1](https://github.com/ckeditor/ckeditor5-engine/issues/974), [2](https://github.com/ckeditor/ckeditor5-engine/issues/928).
		* The editor becomes unstable when F12 developer tools are enabled.
		* Clipboard integration is broken due to [Edge bugs](https://github.com/ckeditor/ckeditor5-clipboard/issues/20).

Not supported yet:

* Internet Explorer 11. See the [Compatibility with IE11](https://github.com/ckeditor/ckeditor5/issues/330) ticket.

### Notes

Features known to not be fully supported yet:

* Text composition. Input Method Engine (IME) is a mechanism that allows the users to input text in languages such as Japanese and Chinese. This mechanism is not fully supported yet and we will be polishing that feature in a close future.
* Drag and drop inside the editor does not work yet. It is possible to drop images from your system if the {@link module:upload/imageupload~ImageUpload} feature is enabled.

## Mobile environment

Although CKEditor 5 works in Safari for iOS and Chrome for Android, it has not been fully tested yet and there are known bugs and inconveniences. Full support for mobile browsers will be our goal after releasing 1.0.0.

When working on mobile support we need to consider two complex aspects:

* **Special UI, designed for mobile.**

	During the design phase we understood that creating a responsive and touch-friendly UI will not guarantee a desired UX level by itself. Also, that the "mobile first" approach has no application in this case due to constraints of the mobile environment and specific editing method. Therefore, we plan to introduce a completely customized, mobile-oriented UI.

	We began research on how to display necessary UI controls on the screen and, sadly, it turned out that mobile Safari's viewport mechanics makes it extremely complicated to display the UI in a reliable way. You can read more in the [UX: Mobile editing](https://github.com/ckeditor/ckeditor5-design/issues/149) ticket.

* **Handling mobile browsers' quirks.**

	Mobile browsers (especially mobile Safari) work differently than their desktop equivalents. [Chrome's incomplete `keydown` event](https://bugs.chromium.org/p/chromium/issues/detail?id=118639) is just one of the issues that we need to deal with.

	For several years we have worked with W3C on [fixing `contentEditable`](https://medium.com/content-uneditable/fixing-contenteditable-1a9a5073c35d) &mdash; a technology on which the entire browser-based editing is based. Recently, browser vendors started implementing the core part of [the new specifications](http://w3c.github.io/editing/) &mdash; the `beforeinput` event which has a chance to improve the situation. CKEditor 5's architecture was designed with this event in mind, so we will start taking advantage of it as soon as it proves to be stable enough.

## Quality assurance

To ensure the highest quality, we maintain a complete test suite with a stable 100% of code coverage for each of the packages. As of December 2017, this means over 7000 tests and the number is growing.

Such an extensive test suite requires a proper continuous integration service. We use [Travis CI](https://travis-ci.com/) as a build platform and [BrowserStack](https://www.browserstack.com/) to be able to run tests on all browsers. These services ensure seamless and fast developer experience and allow us to focus on the job.
