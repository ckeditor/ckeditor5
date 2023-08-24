---
category: features
meta-title: Editor placeholder | CKEditor 5 Documentation
---

{@snippet build-classic-source}

# Editor placeholder

You can prompt the user to input content by displaying a configurable placeholder text when the editor is empty. This works similarly to the native DOM [`placeholder` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-placeholder) used by inputs. Not to be confused with {@link examples/framework/content-placeholder content placeholder}.

## Demo

See the demo of the placeholder feature:

{@snippet features/placeholder}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	This feature is enabled by default in all {@link installation/getting-started/predefined-builds predefined builds}.
</info-box>

The editor placeholder feature does not require a separate plugin installation. It does, however, require configuring the editor before use. There are two different ways of configuring the editor placeholder text:

### Using the `placeholder` attribute of a textarea

Set the `placeholder` attribute on a `<textarea>` element passed to the `Editor.create()` method (for instance {@link module:editor-classic/classiceditor~ClassicEditor.create `ClassicEditor.create()`}) to configure the placeholder:

```html
<textarea id="editor" placeholder="Type the content here!"></textarea>
```

```js
ClassicEditor
	.create( document.querySelector( '#editor' ) )
	.then( editor => {
		console.log( editor );
	} )
	.catch( error => {
		console.error( error );
	} );
```

### Using the editor configuration

You can use the {@link module:core/editor/editorconfig~EditorConfig#placeholder `editor.config.placeholder`} configuration option:

* when no element was passed into `Editor.create()` method,
* when the element passed into `Editor.create()` was not a `<textarea>` (for instance, a `<div>` element),
* to override the `placeholder` text of a `<textarea>`, if one was passed into `Editor.create()` but the placeholder text should be different.

```js
ClassicEditor.create(
	document.querySelector( '#editor' ),
    {
		placeholder: 'Type the content here!'
	}
).then( editor => {
    console.log( editor );
} ).catch( error => {
    console.error( error );
} );
```

If your editor implementation uses multiple roots, you should pass an object with keys corresponding to the editor roots names and values equal to the placeholder that should be set in each root:

```js
MultiRootEditor.create(
	// Roots for the editor:
	{
		header: document.querySelector( '#header' ),
		content: document.querySelector( '#content' ),
		leftSide: document.querySelector( '#left-side' ),
		rightSide: document.querySelector( '#right-side' )
	},
	// Config:
	{
		placeholder: {
			header: 'Type header...',
			content: 'Type content...',
			leftSide: 'Type left-side...',
			rightSide: 'Type right-side...'
		}
	}
).then( editor => {
    console.log( editor );
} ).catch( error => {
    console.error( error );
} );
```

## Styling the placeholder

The editor placeholder text is displayed using a CSS pseudo–element (`::before`) related to the first empty element in the editor content (usually a paragraph). You can use the following snippet to change the appearance of the placeholder:

```css
.ck.ck-editor__editable > .ck-placeholder::before {
	color: #d21714;
	font-family: Georgia;
}
```

{@snippet features/placeholder-custom}

**Note**: The `.ck-placeholder` class is also used to display placeholders in other places, for instance, {@link features/images-captions image captions}. Make sure your custom styles apply to the right subset of placeholders.

## Changing the placeholder

The editor placeholder could be updated at runtime by changing the `placeholder` property in the editing root.

```js
editor.editing.view.document.getRoot( 'main' ).placeholder = 'new placeholder';
```

{@snippet features/update-placeholder}

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-core](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-core).
