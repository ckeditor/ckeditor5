---
category: crash-course
order: 30
menu-title: Model and schema
meta-title: CKEditor 5 crash course - Model and schema | CKEditor 5 Documentation
modified_at: 2023-08-16
---

# Model and schema

## The editor

The editors come in a few flavors. While each looks different visually, they are similar under the hood and consist of two parts:

* Editing engine,
* Editing UI.

In this and the next chapters of this tutorial, you will learn about the **editing engine**, which is responsible for reading, maintaining, and outputting the state of the editor, and everything else that powers the editor under the hood.

Later you will also learn about the **editing UI**, but for now, all you need to know is that it is the interface the user sees and interacts with.

### Model

The first and most important part of the editing engine is the model. The model is an HTML-like structure that represents the content of the editor. When the {@link module:core/editor/editor~Editor#setData `editor.setData()`} method is called, HTML passed as the argument is converted into the model. Then, when the {@link module:core/editor/editor~Editor#getData `editor.getData()`} method is called, the model is converted back to HTML.

One major difference between the model and HTML is that in the model, both text and elements can have attributes.

Let's see how the model compares to HTML.

{@snippet tutorials/mini-inspector-basic-styles}

### Schema

You cannot put anything you want inside the document model. At least not until you update the schema. The schema defines what is allowed and where, what attributes are allowed for certain nodes, what is not allowed, and so on.

Schema determines things like whether the given element can be enclosed in a block quote, or whether the bold button is enabled on selected content.

## Extending the model to support text highlighting

With this information, what do we need to do to add support for highlighting? There are two things we need to take care of:

1. We need to somehow track in the model which parts of the text are highlighted.
2. Since HTML has a `<mark>` element used for highlighting, we want to be able to convert it to and from the model.

### Extending the schema

As we learned earlier, text nodes in a model can have attributes. We also saw that italic, bold, and underlined text does not use elements like in HTML, but the text attributes. Since highlighting works the same way as those three text styles, let's follow the same path.

Let's extend the `$text` node to allow a new attribute called `highlight`. Add the following code to the end of the `Highlight` function in `src/plugin.js`:

```js
editor.model.schema.extend( '$text', {
	allowAttributes: 'highlight'
} );
```

### Converting the HTML elements

Now that we can add the `highlight` attribute to the text parts, let's make it possible to convert `<mark>` HTML elements to the model `highlight` attribute and vice versa. Add the following code to the end of the `Highlight` function in `src/plugin.js`:

```js
editor.conversion.attributeToElement( {
	model: 'highlight',
	view: 'mark'
} );
```

Why is the method called `attributeToElement()` when we want to convert `<mark>` HTML **element** to `highlight` model **attribute**? Should it be the other way around?

For the editor, the model is the most important state, and HTML is just input and output. From its perspective, the role is reversed - it has the `highlight` attribute, which corresponds to the`<mark>` element in HTML. You will see this pattern repeated when we dive deeper into data conversion in the next chapter.

### Testing changes

Let's test our changes. Open the console in your browser and run the following code:

```js
editor.setData( '<p>Hello <mark>world</mark>!</p>' );
```

If all went well, the word `world` should be highlighted in the editor.

## CKEditor inspector

Let's inspect the editor to validate the schema and model. Open the `src/main.js` file and install the {@link framework/development-tools/inspector CKEditor inspector}.

```js
// Import inspector.
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

// Add this at the bottom of the file to inspect the editor.
CKEditorInspector.attach(editor);
```

When the page refreshes, you should see a debugging panel for CKEditor. Go to the `Schema` tab and click the `$text` element. On the right side you should see `highlight:true` under the `Allowed Attributes` section.

Go to the `Model` tab and re-run this code in the console:

```js
editor.setData( '<p>Hello <mark>world</mark>!</p>' );
```

Notice how the model has changed and the `highlight` attribute has been attached to the `"world"` string.

You can also go to the `View` tab to see how the `highlight` attribute is converted to the `<mark>` element.

We will be using this tool in the next stages of plugin development.

## What's next

If you want to read more about the editing engine, see the {@link framework/architecture/editing-engine Editing engine} document.

Otherwise, go to the next chapter, where you will {@link tutorials/crash-course/data-conversion learn more about data conversion} and what really happens when we call the `attributeToElement()` method.
