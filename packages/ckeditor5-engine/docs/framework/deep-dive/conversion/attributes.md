---
category: framework-deep-dive-conversion
menu-title: Attributes and inline formatting
meta-title: Attributes and inline formatting | CKEditor 5 Framework Documentation
meta-description: Learn how CKEditor 5 represents inline formatting with model text attributes and how they are rendered in the view.
order: 120
modified_at: 2025-01-30
---

# Attributes and inline formatting

In this guide, we will dive deeper into how inline formatting works in CKEditor&nbsp;5 through the lens of model text attributes. To fully understand the concepts presented here, you should first study how {@link framework/deep-dive/conversion/intro conversion} works, particularly how attributes are transformed between the model and view layers.

## Inline and block content

Generally speaking, there are two main types of content in the editor view and data output: inline and block.

The inline content means elements like `<strong>`, `<a>`, or `<span>`. Unlike `<p>`, `<blockquote>`, or `<div>`, the inline elements do not structure the data. Instead, they format some text in a specific (visual and semantical) way. These elements are characteristic of text. For instance, you could say that some part of the text is bold, is linked, and so on. This concept has its reflection in the model of the rich-text editor, where `<a>` or `<strong>` are not represented as elements. Instead, they are the attributes of the text.

For example &ndash; in the model, you might have a `<paragraph>` element with the "Foo bar" text, where "bar" has the `bold` attribute set to `true`. A pseudo-code of this *model* data structure could look as follows:

```html
<paragraph>
	"Foo "			// no attributes
	"bar"			// bold=true
</paragraph>
```

<info-box>
	Throughout the rest of this guide, the following, shorter convention will be used to represent model text attributes for the sake of clarity:

	```html
	<paragraph>Foo <$text bold="true">bar</$text></paragraph>
	```
</info-box>

Note that there is no `<strong>` or any other additional element there; it is just some text with an attribute.

So, when does this text become wrapped with a `<strong>` element? This happens during the conversion to the view. It is also important to know what type of view element needs to be used. In the case of the elements that represent inline formatting, this should be an {@link module:engine/view/attributeelement~ViewAttributeElement attribute element}.

## Conversion of multiple text attributes

A model text node may have multiple attributes (for example, be bolded and linked), and all of them are converted into their respective view elements by independent converters.

Keep in mind that in the model, attributes do not have any specific order. This is contrary to the editor view or HTML output, where inline elements are nested in one another. Fortunately, the nesting happens automatically during the conversion from the model to the view. This makes working in the model simpler, as features do not need to take care of breaking or rearranging elements in the model.

For instance, consider the following model structure:

```html
<paragraph>
	<$text bold="true" linkHref="url">Foo </$text>
	<$text linkHref="url">bar</$text>
	<$text bold="true"> baz</$text>
</paragraph>
```

During the conversion, it will be converted to the following view structure:

```html
<p>
	<a href="url"><strong>Foo </strong>bar</a><strong> baz</strong>
</p>
```

Note that the `<a>` element is converted in such a way that it always becomes the "topmost" element. This is intentional so that no element ever breaks a link, which would otherwise look as follows:

```html
<p>
	<strong><a href="url">Foo </a></strong><a href="url">bar</a><strong> baz</strong>
</p>
```

There are two links with the same `href` attribute next to each other in the generated view (editor output), which is semantically wrong. To make sure that this never happens, the view element that represents a link must have a {@link module:engine/view/attributeelement~ViewAttributeElement#priority priority} defined. Most elements, like `<strong>`, do not care about it and stick to the default priority (`10`). The {@link features/link Link feature} ensures that all `<a>` view elements have the priority set to `5`, therefore they are kept outside other elements.

## Merging attribute elements during conversion

Priority is not only important for determining the nesting order of attribute elements. It also plays a crucial role in deciding whether adjacent attribute elements can be merged during the conversion process.

Inline elements in the view, such as `<strong>` or `<em>`, are typically simple formatting elements without additional attributes. However, some features require more complex styling. For example, the {@link features/font Font family feature} adds a `fontFamily` attribute to text in the model. During downcast, this model attribute is converted to a view `<span>` element with a corresponding `style` attribute, which then appears as a `<span style="font-family: ...">` in the HTML output.

What would, then, happen if several model attributes were set on the same part of the text? Take this model example where `fontSize` is used next to `fontFamily`:

```html
<paragraph>
	<$text fontFamily="Tahoma" fontSize="big">foo</$text>
</paragraph>
```

CKEditor 5 features are implemented in a granular way, which means that the font size converter is completely independent from the font family converter. This means that the above example is converted as follows:

* `fontFamily="value"` converts to `<span style="font-family: value;">`,
* `fontSize="value"` converts to `<span class="text-value">`.

And, in theory, you could expect the following HTML as a result:

```html
<p>
	<span style="font-family: Tahoma;">
		<span class="text-big">foo</span>
	</span>
</p>
```

But this is not the most optimal output you can get from the rich-text editor. A single `<span>` element would be better:

```html
<p>
	<span style="font-family: Tahoma;" class="text-big">foo</span>
</p>
```

A single `<span>` makes more sense. And thanks to the merging mechanism built into the conversion process, this is the actual output of the conversion.

Why is this so? In the above scenario, two model attributes are converted to `<span>` elements. When the engine converts the first attribute (say, `fontFamily`), there is no `<span>` in the view yet. So the first `<span>` is added with the `style` attribute. But then, when the engine converts `fontSize`, the `<span>` is already in the view. The {@link module:engine/view/downcastwriter~ViewDowncastWriter downcast writer} recognizes it and checks whether these elements can be merged, following these three rules:

1. Both elements must have the same {@link module:engine/view/element~ViewElement#name name}.
2. Both elements must have the same {@link module:engine/view/attributeelement~ViewAttributeElement#priority priority}.
3. Neither can have an {@link module:engine/view/attributeelement~ViewAttributeElement#id ID}.

If you need to keep attributes separated (for example, to prevent merging between two visually identical but semantically distinct decorations), set a unique `id`. Otherwise, leave the `id` unset and let the engine merge.

<info-box>
	When using the {@link features/general-html-support General HTML Support (GHS)} feature, be aware that the merging behavior can affect how the editor processes your HTML. For instance, adjacent `<span>` elements with no distinguishing attributes may be merged into a single element during the model-to-view conversion, as described in [this issue](https://github.com/ckeditor/ckeditor5/issues/15408). Conversely, adding an inline element (like `<a>`) inside a `<span>` may cause the `<span>` to split into multiple elements due to the nesting and priority rules. If you need to preserve the exact structure of your HTML, consider using element IDs or adjusting your content structure to work with CKEditor&nbsp;5's attribute element behavior.
</info-box>

## Further reading

If you want to learn more about converting model attributes, we recommend checking out the following guides:

* {@link tutorials/widgets/implementing-a-block-widget#defining-converters Implementing a block widget} &ndash; A practical tutorial showing conversion in action.
* {@link tutorials/widgets/implementing-an-inline-widget#defining-converters Implementing an inline widget} &ndash; Learn how to implement inline widgets with custom conversion.
