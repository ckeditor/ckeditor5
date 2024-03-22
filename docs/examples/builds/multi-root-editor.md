---
category: examples-builds
meta-title: Multi-root editor build example | CKEditor 5 Documentation
order: 60
toc: false
classes: main__content--no-toc
---

# Multi-root editor

{@link getting-started/legacy-getting-started/predefined-builds#multi-root-editor Multi-root editor} is an editor type that features multiple, separate editable areas.

The main difference between using a multi-root editor and using multiple separate editors (like in the {@link examples/builds/inline-editor inline editor demo}) is the fact that in a multi-root editor all editable areas belong to the same editor instance share the same configuration, toolbar and the undo stack, and produce one document.

{@snippet examples/multi-root-editor}

## Setting and reading editor data

Please note that setting and reading the editor data is different for multi-root editor.

Pass an object when setting the editor data

Setting the data using `editor.setData()`:

```js
editor.setData( {
	header: '<p>Content for header part.</p>',
	content: '<p>Content for main part.</p>',
	leftSide: '<p>Content for left-side box.</p>',
	rightSide: '<p>Content for right-side box.</p>'
} );
```

Setting the data through `config.initialData`:

```js
MultiRootEditor.create(
	{
		header: document.querySelector( '#header' ),
		content: document.querySelector( '#content' ),
		leftSide: document.querySelector( '#left-side' ),
		rightSide: document.querySelector( '#right-side' )
	},
	{
		initialData: {
			header: '<p>Content for header part.</p>',
			content: '<p>Content for main part.</p>',
			leftSide: '<p>Content for left-side box.</p>',
			rightSide: '<p>Content for right-side box.</p>'
		}
	}
);
```

Specify root name when obtaining the data

```js
	editor.getData( { rootName: 'leftSide' } ); // -> '<p>Content for left-side box.</p>'
```
</details>

Learn more about using the multi-root editor in its {@link module:editor-multi-root/multirooteditor~MultiRootEditor API documentation}.
