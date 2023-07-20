---
category: tutorial
order: 30
menu-title: Model and schema
---

# Model and schema

## The editor

The editors come in few flavors. While each of them visually looks very different, under the hook they're very similar.

Each editor consists of two parts:

* Editing engine,
* Editing UI.

In this and next chapters of this tutorial we'll learn about **editing engine** responsible for reading, maintaning and outputting the editor's state and everything else that powers the editor under the hood. At this moment all you need to know is that the **editing UI** is the interface that the user sees with buttons, dropdown, editing panel, etc.

### Model

The first and most important part of the editing engine is the model. Model is a HTML-like structure which represents the content of the editor. When the {@link module:core/editor/utils/dataapimixin~DataApi#setData `editor.setData()`} method is called, the HTML passed as the argument is converted to the model. Then, when the {@link module:core/editor/utils/dataapimixin~DataApi#getData `model.getData()`} is called, model is converted back to HTML.

Once major difference between the model and HTML is that in model, the both text and elements can have attributes.

Let's see how model compares to HTML.

```html
<!-- Source HTML -->
<p>
	Hello 
	<i>
		<strong>
			<u>world</u>
		</strong>
	</i>
	!
</p>

<!-- Model -->
<paragraph>
	Hello 
	<$text italic="true" bold="true" underline="true">world</$text>
	!
</paragraph>
```

### Schema

You cannot put everything into the model. At least not, until you update the schema. Schema defines what and where a node is allowed or disallowed, what attributes are allowed for certain nodes, etc.

Schema determines things such as, if the given element can be wrapped with a block quote or if bold button is enabled on a selected content.

## Extending the model to support text highlighting

With this information, what do need to do to add support for highlighting? There are two things we need to take care of:

1. We need to somehow track in the model which parts of the text are highlighted.
2. Because HTML has a `<mark>` element used for highlighting, we want to be able to convert it to and from the model.

### Extending the schema

As we learned ealier, text nodes in model can have attributes. We've also seen that italic, bold and underline text doesn't use elements as in HTML, but the text attributes. Because highlightning works the same as those three text styles, let's follow the same path.

Let's extends the `$text` node to allow new attribute called `highlight`. Add the following code to the bottom of the `Highlight` function in `src/plugin.js`:

```js
editor.model.schema.extend('$text', {
	allowAttributes: 'highlight'
});
```

### Convert the `<mark>` HTML element

Now that we can add `highlight` attribute to the parts of the text, let's convert `<mark>` HTML elements into the model `highlight` attribute and vice versa. Add the following code to the bottom of the `Highlight` function in `src/plugin.js`:

```js
editor.conversion.attributeToElement( {
	model: 'highlight',
	view: 'mark'
} );
```

Why is the method called `attributeToElement()` if we want to convert `<mark>` HTML element to the `highlight` model attribute?

For editor, model is the most important state and HTML is only an input and output. From it's perspective, the role is reversed — it has the `highlight` attribute, which corresponds to the `<mark>` element in HTML. You will see this pattern repeat when we dive deeper into the data conversion in the next chapter.

### Testing changes

Let's test our changes. In the browser, open the console and run the following code:

```js
editor.setData('<p>Hello <mark>world</mark>!');
```

If everything went well, the `world` word should be highlighted in the editor.

## CKEditor inspector

Let's inspect the editor to validate the schema and model. Open the `src/main.js` file and install the {@link framework/development-tools#ckeditor-5-inspector CKEditor inspector}.

```js
// Import inspector
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

// Add this at the bottom of the file to inspect the editor
CKEditorInspector.attach(editor);
```

Once the page refreshes you should see a debugging panel for CKEditor. Go to the `Schema` tab and click the `$text` item. On the right side, you should see `highlight:true` under the `Allowed attributes` section.

Go to the `Model` tab and run this code in the console again:

```js
editor.setData('<p>Hello <mark>world</mark>!');
```

Notice how the model changed and the `highlight` attribute attached to the "world" string.

You can also go to the `View` tab to check how the `highlight` attribute is converted to the `<mark>` element.

We will be using this tool in the next stages of developing the plugin.

## What's next

In the next chapter you'll {@link tutorial/plugins learn more about data conversion} and what really happens when we call the `attributeToElement()` method.
