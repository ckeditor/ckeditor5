---
category: features
---

{@snippet build-classic-source}

# Editor placeholder

CKEditor 5 can display a configurable placeholder text when the content is empty. The placeholder helps users locate the editor in the application and prompts to input the content. It works similarly to the native DOM [`placeholder` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#The_placeholder_attribute) used by inputs.

## Demo

See the demo of the placeholder feature:

{@snippet features/placeholder}

## Configuring the placeholder

There are two different ways of configuring the editor placeholder text:

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
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		placeholder: 'Type the content here!'
	} )
	.then( editor => {
		console.log( editor );
	} )
	.catch( error => {
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
