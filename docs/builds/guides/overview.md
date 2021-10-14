---
# Scope:
# * What is it?
# * What are the use cases?
# * What is the difference with CKEditor 5 Framework?
# * What is the difference with CKEditor 4?

category: builds-predefined
order: 10
---

# Overview

Predefined CKEditor 5 builds are a set of ready-to-use rich text editors. Every "build" provides a single type of editor with a set of features and a default configuration. They provide convenient solutions that can be installed with no effort and that satisfy the most common editing use cases.

## Available builds

The following CKEditor 5 builds are currently available:

 * [Classic editor](#classic-editor)
 * [Inline editor](#inline-editor)
 * [Balloon editor](#balloon-editor)
 * [Balloon block editor](#balloon-block-editor)
 * [Document editor](#document-editor)

### Classic editor

Classic editor is what most users traditionally learnt to associate with a rich text editor &mdash; a toolbar with an editing area placed in a specific position on the page, usually as a part of a form that you use to submit some content to the server.

During its initialization the editor hides the used editable element on the page and renders "instead" of it. This is why it is usually used to replace `<textarea>` elements.

In CKEditor 5 the concept of the "boxed" editor was reinvented:

 * The toolbar is now always visible when the user scrolls the page down.
 * The editor content is now placed inline in the page (without the surrounding `<iframe>` element) &mdash; it is now much easier to style it.
 * By default the editor now grows automatically with the content.

{@img assets/img/editor-classic.png 778 Screenshot of a classic editor.}

To try it out online, check the {@link examples/builds/classic-editor classic editor example}. Jump to {@link builds/guides/quick-start#classic-editor Quick start} to start using it.

### Inline editor

Inline editor comes with a floating toolbar that becomes visible when the editor is focused (e.g. by clicking it). Unlike classic editor, inline editor does not render *instead* of the given element, it simply makes it editable. As a consequence the styles of the edited content will be exactly the same before and after the editor is created.

A common scenario for using inline editor is offering users the possibility to edit content in its real location on a web page instead of doing it in a separate administration section.

{@img assets/img/editor-inline.png 776 Screenshot of an inline editor.}

To try it out online, check the {@link examples/builds/inline-editor inline editor example}. Jump to {@link builds/guides/quick-start#inline-editor Quick start} to start using it.

### Balloon editor

Balloon editor is very similar to inline editor. The difference between them is that the toolbar appears in a balloon next to the selection (when the selection is not empty):

{@img assets/img/editor-balloon.png 789 Screenshot of a balloon toolbar editor.}

To try it out online, check the {@link examples/builds/balloon-editor balloon editor example}. Jump to {@link builds/guides/quick-start#balloon-editor Quick start} to start using it.

### Balloon block editor

Balloon block is essentially the [balloon editor](#balloon-editor) with an extra block toolbar which can be accessed using the button attached to the editable content area and following the selection in the document. The toolbar gives an access to additional, block–level editing features.

{@img assets/img/editor-balloon-block.png 813 Screenshot of a balloon block toolbar editor.}

To try it out online, check the {@link examples/builds/balloon-block-editor balloon block editor example}. Jump to {@link builds/guides/quick-start#balloon-block-editor Quick start} to start using it.

### Document editor

The document editor is focused on rich text editing experience similar to the native word processors. It works best for creating documents which are usually later printed or exported to PDF files.

{@img assets/img/editor-document.png 843 Screenshot of the user interface of the document editor.}

To try it out online, check the {@link examples/builds/document-editor document editor example}. Jump to {@link builds/guides/quick-start#document-editor Quick start} to start using it.

## Build customization

Every build comes with a default set of features and their default configuration. Although the builds try to fit many use cases, they may still need to be adjusted in some integrations. The following modifications are possible:

 * You can override the default **configuration of features** (e.g. define different image styles or heading levels).
 * You can change the default **toolbar configuration** (e.g. remove undo/redo buttons).
 * You can also **remove features** (plugins).

Read more in the {@link builds/guides/integration/configuration Configuration guide}.

If a build does not provide all the necessary features or you want to create a highly optimized build of the editor which will contain only the features that you require, you need to customize the build or create a brand new one. Check {@link builds/guides/development/custom-builds Custom builds} for details on how to change the default builds to match your preferences.

## Additional information

### How builds were designed

Each build was designed to satisfy as many use cases as possible. They differ in their UI, UX and features, and are based on the following approach:

* Include the set of features proposed by the [Editor Recommendations project](https://ckeditor.github.io/editor-recommendations/).
* Include features that contribute to creating quality content.
* Provide setups as generic as possible, based on research and community feedback.

### Use cases

Each of the builds fits several different use cases. Just think about any possible use for writing rich text in applications.

The following are **some** common use cases:

* In content management systems:
	* Forms for writing articles or website content.
	* Inline writing in a frontend-like editing page.
	* Comments.
* In marketing and sales automation applications:
	* Composing email campaigns.
	* Creating templates.
* In forum applications:
	* Creating topics and their replies.
* In team collaboration applications:
	* Creating shared documents.
* Other uses:
	* User profile editing pages.
	* Book writing applications.
	* Social messaging and content sharing.
	* Creation of ads in recruitment software.

### When NOT to use builds?

{@link framework/index CKEditor 5 Framework} should be used, instead of builds, in the following cases:

* When you want to create your own text editor and have full control over its every aspect, from UI to features.
* When the solution proposed by the builds does not fit your specific use case.

In the following cases [CKEditor 4](https://ckeditor.com/ckeditor-4/) should be used instead:

* When compatibility with old browsers is a requirement.
* If CKEditor 4 contains features that are essential for you, which are not available in CKEditor 5 yet.
* If CKEditor 4 is already in use in your application and you are still not ready to replace it with CKEditor 5.

In the following cases [Letters](https://ckeditor.com/letters/) may be used instead:

* When you want an easy way to enable, as part of your application, the creation of articles and documents that feature:
	* Real-time collaborative writing.
	* Inline comments and discussion in the content.
	* Advanced writing features.
