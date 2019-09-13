---
category: framework-deep-dive-conversion
menu-title: Advanced concepts
order: 10

# IMPORTANT:
# This guide is meant to become "Introduction to conversion" later on, hence the file name.
# For now, due to lack of content, it is called "advanced concepts".
---

# Advanced conversion concepts

This guide extends the {@link framework/guides/architecture/editing-engine introduction to CKEditor 5 editing engine architecture}. Therefore, we highly recommend reading the former guide first.

In this guide we will dive deeper into some of the conversion concepts.

## Inline and block content

Generally speaking, there are two main types of the content in the editor view and data output: inline and block.

The inline content means elements like `<strong>`, `<a>` or `<span>`. Unlike `<p>`, `<blockquote>` or `<div>`, inline elements do not structure the data. Instead, they mark some text in a specific (visual and semantical) way. These elements are a characteristic of a text. For instance, we could say that some part of a text is bold, or a linked, etc.. This concept has its reflection in the model of the editor where `<a>` or `<strong>` are not represented as elements. Instead, they are attributes of the text.

For example &mdash; in the model, we might have a `<paragraph>` element with "Foo bar" text, where "bar" has the `bold` attribute set `true`. A pseudo–code of this *model* data structure could look as follows:

```html
<paragraph>
	"Foo "			// no attributes
	"bar"			// bold=true
</paragraph>
```

<info-box>
	Throughout the rest of this guide we will use the following, shorter convention to represent model text attributes:

	```html
	<paragraph>Foo <$text bold="true">bar</$text></paragraph>
	```
</info-box>

Note that there is no `<strong>` or any other additional element there, it is just some text with an attribute.

So, when this text becomes wrapped with a `<strong>` element? This happens during conversion to the view. It is also important to know which type of a view element needs to be used. In case of elements which represent inline formatting, this should be a {@link module:engine/view/attributeelement~AttributeElement}.

## Conversion of multiple text attributes

A model text node may have multiple attributes (e.g. be bolded and linked) and all of them are converted to their respective view elements by independent converters.

Keep in mind that in the model, attributes do not have any specific order. This is contrary to the editor view or HTML output, where inline elements are nested one in another. Fortunately, the nesting happens automatically during conversion from the model to the view. This makes working in the model simpler, as features do not need to take care of breaking or rearranging elements in the model.

For instance, consider the following model structure:

```html
<paragraph>
	<$text bold="true" linkHref="url">Foo </$text>
	<$text linkHref="url">bar</$text>
	<$text bold="true"> baz</$text>
</paragraph>
```

During conversion, it will be converted to the following view structure:

```html
<p>
	<a href="url"><strong>Foo </strong>bar</a><strong> baz</strong>
</p>
```

Note, that the `<a>` element is converted in such way that it always becomes the "topmost" element. This is intentional so that no element ever breaks a link, which would otherwise look as follows:

```html
<p>
	<strong><a href="url">Foo </a></strong><a href="url">bar</a><strong> baz</strong>
</p>
```

There are two links with the same `href` next to each other in the generated view (editor output), which is semantically wrong. To make sure that it never happens the view element which represents  a link must have a *priority* defined. Most elements, like for instance `<strong>` do not care about it and stick to the default priority (`10`). The {@link features/link link feature} ensures that all view `<a>` elements have priority set to `5` so they are kept outside other elements.

## Merging attribute elements during conversion

Most of the simple view inline elements like `<strong>` or `<em>` do not have any attributes. Some of them have just one, for instance `<a>` has its `href`.

But it is easy to come up with features that style a part of a text in a more complex way. An example would be a {@link features/font Font family feature}. When used, it adds the `fontFamily` attribute to a text in the model, which is later converted to a `<span>` element with a corresponding `style` attribute.

So what would happen if several attributes are set on the same part of a text? Take this model example where `fontSize` is used next to `fontFamily`:

```
<paragraph>
	<$text fontFamily="Tahoma" fontSize="big">foo</$text>
</paragraph>
```

Editor features are implemented in a granular way, which means that e.g. the font size converter is completely independent from the font family converter. This means that the above converts as follows:

* `fontFamily="value"` converts to `<span style="font-family: value;">`,
* `fontSize="value"` converts to `<span class="text-value">`.

and, in theory, we could expect the following HTML as a result:

```html
<p>
	<span style="font-family: Tahoma;">
		<span class="text-big">foo</span>
	</span>
</p>
```

But this is not the most optimal output we can get from the editor. Why not have just one `<span>` element instead?

```html
<p>
	<span style="font-family: Tahoma;" class="text-big">foo</span>
</p>
```

Obviously a single `<span>` makes more sense. And thanks to the merging mechanism built in the conversion process, this would be the actual result of the conversion.

Why is it so? In the above scenario, two model attributes are converted to `<span>` elements. When the first attribute (say, `fontFamily`) is converted, there is no `<span>` in the view yet. So the first `<span>` is added with the `style` attribute. But then, when `fontSize` is converted, the `<span>` is already in the view. The {@link module:engine/view/downcastwriter~DowncastWriter downcast writer} recognizes it and checks whether those elements can be merged, following these 3 rules:

1. both elements must have the same {@link module:engine/view/element~Element#name name},
2. both elements must have the same {@link module:engine/view/attributeelement~AttributeElement#priority priority},
3. neither can have an {@link module:engine/view/attributeelement~AttributeElement#id id}.

## Examples

Once you understand more about the conversion of model attributes, you can check some examples of:

* {@link framework/guides/deep-dive/conversion-extending-output How to extend the editor output} &mdash; extending the output of existing CKEditor 5 features.
* {@link framework/guides/deep-dive/conversion-preserving-custom-content How to extend the editor with custom content} &mdash; how to make CKEditor 5 accept more content.
