---
category: examples
order: 500
meta-title: CKEditor 5 How-tos | CKEditor 5 Documentation
modified_at: 2023-07-17
---

# How-tos

## Basics

### How to set the height of CKEditor 5?

The height of the editing area can be easily controlled with CSS.

```css
/* This selector targets the editable element (excluding comments). */
.ck-editor__editable_inline:not(.ck-comment__input *) {
	height: 300px;
	overflow-y: auto;
}
```

### How to customize the CKEditor 5 icons?

The easiest way is to use webpack's [`NormalModuleReplacementPlugin`](https://webpack.js.org/plugins/normal-module-replacement-plugin/) plugin. For example, to replace the bold icon, use the following code in your `webpack.config.js`:

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

### How to add an attribute to the editor editable in DOM?

If you have a reference to the editor instance, use the {@link framework/architecture/editing-engine#changing-the-view `change()`} method of the view and set the new attribute via the {@link module:engine/view/downcastwriter~DowncastWriter view downcast writer}:

```js
editor.editing.view.change( writer => {
	const viewEditableRoot = editor.editing.view.document.getRoot();

	writer.setAttribute( 'myAttribute', 'value', viewEditableRoot );
} );
```

If you do not have the reference to the editor instance, but you have access to the editable element in the DOM, you can [access it using the `ckeditorInstance` property](#how-to-get-the-editor-instance-object-from-the-dom-element) and then use the same API to set the attribute:

```js
const domEditableElement = document.querySelector( '.ck-editor__editable_inline' );
const editorInstance = domEditableElement.ckeditorInstance;

editorInstance.editing.view.change( writer => {
	// Map the editable element in the DOM to the editable element in the editor's view.
	const viewEditableRoot =
		editorInstance.editing.view.domConverter.mapDomToView(
			domEditableElement
		);

	writer.setAttribute( 'myAttribute', 'value', viewEditableRoot );
} );
```

### How to check the CKEditor version?

To check your editor version, open the JavaScript console available in the browser's developer tools. This is usually done through the browser's menu or by right-clicking anywhere on the page and choosing the `Inspect` option from the dropdown.

Enter the `CKEDITOR_VERSION` command to check the currently used CKEditor 5 version.

{@img assets/img/version.png 468 CKEditor 5 version displayed in the developer console.}

## Editor's instances

### How to get the editor instance in the plugin?

In a simple plugin, you can get the editor's instance using a plugin functions' attribute

```js
function MyPlugin(editor) {
	// Interact with the API.
	// ...
}

ClassicEditor.create( document.querySelector( '#editor' ), {
	// If you're using builds, this is going to be extraPlugins property.
	plugins: [
		MyPlugin,
		// Other plugins.
		// ...
	]
} );
```

### How to get the editor instance object from the DOM element?

If you have a reference to the editor editable's DOM element (the one with the `.ck-editor__editable` class and the `contenteditable` attribute), you can access the editor instance this editable element belongs to using the `ckeditorInstance` property:

```html
<!-- The editable element in the editor's DOM structure. -->
<div class="... ck-editor__editable ..." contenteditable="true">
	<!-- Editable content. -->
</div>
```

```js
// A reference to the editor editable element in the DOM.
const domEditableElement = document.querySelector( '.ck-editor__editable_inline' );

// Get the editor instance from the editable element.
const editorInstance = domEditableElement.ckeditorInstance;

// Use the editor instance API.
editorInstance.setData( '<p>Hello world!<p>' );
```

### How to list all instances of the editor?

By default, CKEditor 5 has no global registry of editor instances. But if necessary, such a feature can be easily implemented, as explained in this [Stack Overflow answer](https://stackoverflow.com/a/48682501/1485219).

## Editor's API

### How to insert some content into the editor?

Because CKEditor 5 uses a custom {@link framework/architecture/editing-engine data model}, whenever you want to insert anything, you should modify the model first, which is then converted back to the view where the users input their content (called "editable"). In CKEditor 5, HTML is just one of many possible output formats. You can learn more about the ways of changing the model in the {@link framework/architecture/editing-engine#changing-the-model dedicated guide}.

For example, to insert a new link at the current position, use the following snippet:

```js
editor.model.change( writer => {
	const insertPosition = editor.model.document.selection.getFirstPosition();

	const myLink = writer.createText(
		'CKEditor 5 rocks!',
		{ linkHref: 'https://ckeditor.com/' }
	);

	editor.model.insertContent( myLink, insertPosition )
} );
```

And to insert some plain text, you can use a slightly shorter one:

```js
editor.model.change( writer => {
	const insertPosition = editor.model.document.selection.getFirstPosition();

	editor.model.insertContent( writer.createText( 'Plain text' ), insertPosition );
} );
```

You may have noticed that a link is represented as a text with an attribute in the editor model. See the API of the {@link module:engine/model/writer~Writer model writer} to learn about other useful methods that can help you modify the editor model. {@link module:engine/model/model~Model#insertContent model.insertContent} will ensure that the content can be inserted to the selected place according to the schema.

To insert some longer HTML code, you can parse it to the {@link module:engine/model/documentfragment~DocumentFragment model fragment} first and then {@link module:engine/model/model~Model#insertContent insert} it into the editor model:

```js
const content =
	'<p>A paragraph with <a href="https://ckeditor.com">some link</a>.</p>';
const viewFragment = editor.data.processor.toView( content );
const modelFragment = editor.data.toModel( viewFragment );

editor.model.insertContent( modelFragment );
```

Remember, if some element or attribute does not have declared converters (whether by the dedicated feature or {@link features/html/general-html-support General HTML support) plugin then those won't get inserted.

### How to focus the editor?

```js
// Focus the editor.
editor.focus();
```

### How to delete selected blocks?

```js
const selectedBlocks = Array.from(
	editor.model.document.selection.getSelectedBlocks()
);
const firstBlock = selectedBlocks[ 0 ];
const lastBlock = selectedBlocks[ selectedBlocks.length - 1 ];

editor.model.change( writer => {
	const range = writer.createRange(
		writer.createPositionAt( firstBlock, 0 ),
		writer.createPositionAt( lastBlock, 'end' )
	);

	const selection = writer.createSelection( range )

	editor.model.deleteContent( selection );
} );
```

### How to delete all specific elements (e.g. block images) in the editor?

```js
editor.model.change( writer => {
	const range = writer.createRangeIn( editor.model.document.getRoot() );
	const itemsToRemove = [];

	for ( const value of range.getWalker() ) {
		if ( value.item.is( 'element', 'imageBlock' ) ) {
			// a different `is` usage.
			itemsToRemove.push( value.item );
		}
	}

	for ( const item of itemsToRemove ) {
		writer.remove( item ); // remove all of the items.
	}
} );
```

### How to place the caret at the beginning or the end?

```js
// Place it at the beginning.
editor.model.change( writer => {
	writer.setSelection(
		writer.createPositionAt( editor.model.document.getRoot(), 0 )
	);
} );

// Place it at the end.
editor.model.change( writer => {
	writer.setSelection(
		writer.createPositionAt( editor.model.document.getRoot(), 'end' )
	);
} );
```

### How to find all specific elements in the editor?

In the example below, we try to find all links, and store the unique ones.

```js
const range = editor.model.createRangeIn( editor.model.document.getRoot() );

const links = new Set();

for ( const value of range.getWalker() ) {
	// Link is an attribute on a Text element.
	if ( value.type === 'text' && value.item.hasAttribute( 'linkHref' ) ) {
		// Set will store only unique links, preventing duplication.
		links.add( value.item.getAttribute( 'linkHref' ) );
	}
}
```

### How to listen on a double click (e.g. link elements)?

```js
// Add observer for double click and extend a generic DomEventObserver class by a native DOM dblclick event:
import { DomEventObserver } from 'ckeditor5/src/engine';

class DoubleClickObserver extends DomEventObserver {
	constructor( view ) {
		super( view );

		this.domEventType = 'dblclick';
	}

	onDomEvent( domEvent ) {
		this.fire( domEvent.type, domEvent );
	}
}

// Then use in the editor:
const view = editor.editing.view;
const viewDocument = view.document;

view.addObserver( DoubleClickObserver );

editor.listenTo(
	viewDocument,
	'dblclick',
	( evt, data ) => {
		console.log( 'clicked' );
		// Fire your custom actions here.
	},
	{ context: 'a' }
);
```

There are many observers provided with our features, and you should check if there is no conflicting observer that already fires for the given DOM event.

### How to create a widget with a single view element and multiple/nested model elements?

```js
import { Plugin } from 'ckeditor5/src/core';
import { toWidget, toWidgetEditable } from 'ckeditor5/src/widget';

class Forms extends Plugin {
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		schema.register( 'forms', {
			inheritAllFrom: '$inlineObject',
			allowAttributes: 'type'
		} );

		schema.register( 'formName', {
			allowIn: 'forms',
			allowChildren: '$text',
			isLimit: true
		} );

		// Disallow all attributes on $text inside `formName` (there won't be any bold/italic etc. inside).
		schema.addAttributeCheck( context => {
			if ( context.endsWith( 'formName $text' ) ) {
				return false;
			}
		} );

		// Allow only text nodes inside `formName` (without any elements that could be down-casted to HTML elements).
		schema.addChildCheck( ( context, childDefinition ) => {
			if (
				context.endsWith( 'formName' ) &&
				childDefinition.name !== '$text'
			) {
				return false;
			}
		} );

		// Data upcast. Convert a single element loaded by the editor to a structure of model elements.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'input',
				attributes: [ 'type', 'name' ]
			},
			model: ( viewElement, { writer } ) => {
				const modelElement = writer.createElement( 'forms', {
					type: viewElement.getAttribute( 'type' )
				} );
				const nameModelElement = writer.createElement( 'formName' );

				// Build model structure out of a single view element.
				writer.insert( nameModelElement, modelElement, 0 );
				writer.insertText(
					viewElement.getAttribute( 'name' ),
					nameModelElement,
					0
				);

				return modelElement;
			}
		} );

		// Editing downcast. Convert model elements separately to widget and to widget-editable nested inside.
		editor.conversion
			.for( 'editingDowncast' )
			.elementToElement( {
				model: 'forms',
				view: ( modelElement, { writer } ) => {
					const viewElement = writer.createContainerElement( 'span', {
						'data-type': modelElement.getAttribute( 'type' ),
						style: 'display: inline-block'
					} );

					return toWidget( viewElement, writer );
				}
			} )
			.elementToElement( {
				model: 'formName',
				view: ( modelElement, { writer } ) => {
					const viewElement = writer.createEditableElement( 'span' );

					return toWidgetEditable( viewElement, writer );
				}
			} );

		// Data downcast. Convert the outermost model element and all its content into a single view element.
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'forms',
			view: ( modelElement, { writer, consumable } ) => {
				let nameModelElement;

				// Find the `formName` model element and consume everything inside the model element range,
				// so it won't get converted by any other downcast converters.
				for ( const { item } of editor.model.createRangeIn( modelElement ) ) {
					if ( item.is( 'element', 'formName' ) ) {
						nameModelElement = modelElement.getChild( 0 );
					}

					consumable.consume( item, 'insert' );
				}

				return writer.createContainerElement( 'input', {
					type: modelElement.getAttribute( 'type' ),
					name: nameModelElement.getChild( 0 ).data
				} );
			}
		} );
	}
}
```
