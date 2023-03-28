---
menu-title: FAQ
category: support
order: 60
---

# Frequently asked questions

## How to set the height of CKEditor 5?

The height of the editing area can be easily controlled with CSS.

```css
.ck.ck-content:not(.ck-comment__input *) {
	height: 300px;
	overflow-y: auto;
}
```

## Why does the editor filter out my content (styles, classes, elements)?

CKEditor 5 implements a custom {@link framework/architecture/editing-engine data model}. This means that every piece of content that is loaded into the editor needs to be converted to that model and then rendered back to the view.

Each kind of content must be handled by some feature. For instance the [`ckeditor5-basic-styles`](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles) package handles HTML elements such as `<b>`, `<i>`, `<u>`, etc. along with their representation in the model. The feature defines the two–way conversion between the HTML (view) and the editor model.

If you load some content unknown to any editor feature, it will be dropped. If you want all the HTML5 elements to be supported, you need to write plugins to support them. Once you do that, CKEditor 5 will not filter anything out.

## How to turn the source mode on?

The {@link features/source-editing source editing} feature provides basic support for viewing and editing the source of the document.

## The build I downloaded is missing some features. How do I add them?

See the {@link installation/plugins/installing-plugins Installing plugins} guide to learn how to extend the editor with some additional features.

You can learn which editor features are available in the {@link features/index feature index}.

## How to insert some content into the editor?

Because CKEditor 5 uses a custom {@link framework/architecture/editing-engine data model}, whenever you want to insert anything, you should modify the model first, which is then converted back to the view where the users input their content (called "editable"). In CKEditor 5, HTML is just one of many possible output formats. You can learn more about the ways of changing the model in the {@link framework/architecture/editing-engine#changing-the-model dedicated guide}.

To insert a new link at the current position, use the following snippet:

```js
editor.model.change( writer => {
	const insertPosition = editor.model.document.selection.getFirstPosition();

	writer.insertText( 'CKEditor 5 rocks!', { linkHref: 'https://ckeditor.com/' }, insertPosition );
} );
```

And to insert some plain text, you can use a slightly shorter one:

```js
editor.model.change( writer => {
	writer.insertText( 'Plain text', editor.model.document.selection.getFirstPosition() );
} );
```

You may have noticed that a link is represented as a text with an attribute in the editor model. See the API of the {@link module:engine/model/writer~Writer model writer} to learn about other useful methods that can help you modify the editor model.

To insert some longer HTML code, you can parse it to the {@link module:engine/model/documentfragment~DocumentFragment model fragment} first and then {@link module:engine/model/model~Model#insertContent insert} it into the editor model:

```js
const content = '<p>A paragraph with <a href="https://ckeditor.com">some link</a>.';
const viewFragment = editor.data.processor.toView( content );
const modelFragment = editor.data.toModel( viewFragment );

editor.model.insertContent( modelFragment );
```

## How to list all instances of the editor?

By default, CKEditor 5 has no global registry of editor instances. But if necessary, such feature can be easily implemented as explained in this [Stack Overflow answer](https://stackoverflow.com/a/48682501/1485219).

## How to enable image drag&drop and upload? Where should I start?

The {@link features/images-overview Image} and {@link features/image-upload Image upload} features are enabled by default in all editor builds. However, to fully enable image upload when installing CKEditor 5 you need to configure one of the available upload adapters. Check out the {@link features/image-upload comprehensive "Image upload" guide} to find out the best image upload strategy for your project.

## How to use CKEditor 5 with frameworks (Angular, React, Vue, etc.)?

For the full list of official integrations see the {@link installation/frameworks/overview#official-wysiwyg-editor-integrations "Official integrations"} section.

If an official integration for the framework of your choice does not exist yet, make sure to read the {@link installation/frameworks/overview "Integrating CKEditor 5 with JavaScript frameworks"} guide. CKEditor 5 offers a rich JavaScript API and predefined builds that make it possible to use CKEditor 5 with whichever framework you need.

We plan to provide more official integrations with time. [Your feedback on what should we work on next](https://github.com/ckeditor/ckeditor5/issues/1002) will be most welcome!

## How to get a full–featured editor build?

We have prepared a build containing almost all available plugins, and it is called the superbuild. Instructions on how to integrate it quickly can be found in the {@link installation/getting-started/quick-start#running-a-full-featured-editor-from-cdn quick start guide}.

In the {@link installation/getting-started/predefined-builds predefined builds} guide, there are details available about the {@link installation/getting-started/predefined-builds#superbuild superbuild}, together with the {@link installation/getting-started/predefined-builds#list-of-plugins-included-in-the-ckeditor-5-predefined-builds list of features included in the superbuild}, compared to other types of builds.

## How to customize the CKEditor 5 icons?

The easiest way is to use webpack's [`NormalModuleReplacementPlugin`](https://webpack.js.org/plugins/normal-module-replacement-plugin/) plugin. For example, to replace the bold icon use the following code in your `webpack.config.js`:

```js
...
plugins: [
	new webpack.NormalModuleReplacementPlugin(
		/bold\.svg/,
		'/absolute/path/to/my/icon.svg'
	)
]
```

You can also use the relative path which is resolved relative to the resource that imports `bold.svg` (the {@link module:basic-styles/bold/boldui~BoldUI `BoldUI`} class file in this scenario).

Learn more about {@link installation/advanced/integrating-from-source-webpack#webpack-configuration building CKEditor 5 using webpack}.

## How to get the editor instance object from the DOM element?

If you have a reference to the editor editable's DOM element (the one with the `.ck-editor__editable` class and the `contenteditable` attribute), you can access the editor instance this editable element belongs to using the `ckeditorInstance` property:

```html
<!-- The editable element in the editor's DOM structure. -->
<div class="... ck-editor__editable ..." contenteditable="true">
	<!-- Editable content. -->
</div>
```

```js
// A reference to the editor editable element in the DOM.
const domEditableElement = document.querySelector( '.ck-editor__editable' );

// Get the editor instance from the editable element.
const editorInstance = domEditableElement.ckeditorInstance;

// Use the editor instance API.
editorInstance.setData( '<p>Hello world!<p>' );
```

## How to add an attribute to the editor editable in DOM?

If you have a reference to the editor instance, simply use the {@link framework/architecture/editing-engine#changing-the-view `change()`} method of the view and set the new attribute via the {@link module:engine/view/downcastwriter~DowncastWriter view downcast writer}:

```js
editor.editing.view.change( writer => {
	const viewEditableRoot = editor.editing.view.document.getRoot();

	writer.setAttribute( 'myAttribute', 'value', viewEditableRoot );
} );
```

If you do not have the reference to the editor instance but you have access to the editable element in the DOM, you can [access it using the `ckeditorInstance` property](#how-to-get-the-editor-instance-object-from-the-dom-element) and then use the same API to set the attribute:

```js
const domEditableElement = document.querySelector( '.ck-editor__editable' );
const editorInstance = domEditableElement.ckeditorInstance;

editorInstance.editing.view.change( writer => {
	// Map the editable element in the DOM to the editable element in the editor's view.
	const viewEditableRoot = editorInstance.editing.view.domConverter.mapDomToView( domEditableElement );

	writer.setAttribute( 'myAttribute', 'value', viewEditableRoot );
} );
```
