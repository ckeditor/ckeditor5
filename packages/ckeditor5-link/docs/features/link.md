---
title: Link
category: features
---

{@snippet features/build-link-source}

The {@link module:link/link~Link} feature brings support for link editing to the editor. It allows for inserting hyperlinks into the edited content and offers the UI to create and edit them.

## Demo

You can edit existing links by clicking them and using the balloon. Use the Link toolbar button or press <kbd>Ctrl/⌘</kbd>+<kbd>K</kbd> to create a new link.

{@snippet features/link}

## Typing around links

CKEditor 5 allows for typing both at inner and outer boundaries of links to make the editing easier for the users.

**To type inside a link**, move the caret to its (start or end) boundary. As long as the link remains highlighted (by default: blue), typing and and applying formatting will be done within its boundaries:

{@img assets/img/typing-inside.gif 770 The animation showing typing inside the link in CKEditor 5 rich text editor.}

**To type before or after a link**, move the caret to its boundary, then press the Arrow key (<kbd>→</kbd> or <kbd>←</kbd>) once. The link is no longer highlighted and whatever text you type or formatting you apply will not be enclosed by the link:

{@img assets/img/typing-before.gif 770 The animation showing typing before the link in CKEditor 5 rich text editor.}

## Decorators

Decorator feature provides an easy way to configure and extend links with additional attributes. A decorator is an object defined in the configuration, which describes additional rules applied to the link feature. There are 2 types of decorators: "automatic" and "manual". More information about each of them might be found in sections below or in {@link module:link/link~LinkConfig#decorators the API documentation}.

<info-box warning>
	**Warning:** It is not recommended to modify the same attribute through two or more decorators. All decorators work independent and its state is not reflected between them in any way. This also includes mixing manual and automatic decorators.
</info-box>

### Demo

In editor below is presented automatic and manual decorator feature. All external links gets automatically `target="_blank"` and `rel="noopener noreferrer"` attributes, what is done with {@link module:link/link~LinkConfig#targetDecorator} feature described below. The second decorator is a manual one, which adds a UI switch button with `"Downloadable"` label. Output data can be found in container below editor (its content updates automatically).

{@snippet features/linkdecorators}

### Automatic decorators

This type of decorator is applied automatically based on the link's URL. The automatic decorator has defined a callback function in {@link module:link/link~LinkDecoratorAutomaticOption the configuration}, which decides whether given decorators should be executed or not. There might be multiple decorators configured for the same link, however, each of them should implement different attribute's set without overlaps.

Automatic decorators are applied during {@link framework/guides/architecture/editing-engine#conversion downcasting data}, which means that result of working decorator is visible neither in the editor's model nor the UI in any way.

For example, this decorator will add `download="download"` attribute to every link ending with `.pdf`:
```js
const config = {
	link: {
		decorators: [
			{
				mode: 'automatic',
				callback: url => url.endsWith( '.pdf' ),
				attributes: {
					download: 'download'
				}
			}
		]
	}
}
```

#### Target decorator

Automatic decorators might be very handy in one particular situation. Mentioned case is to add `target="_blank"` and `rel="noopener noreferrer"` attributes to all external links in document. A request for this feature is quite common, and because of that, there is a {@link module:link/link~LinkConfig#targetDecorator configuration option}, which registers such automatic decorator. When `targetDecorator` option is set to `true`, then all links started with `http://`, `https://` or `//` are decorated with `target` and `rel` attributes, without need to implement own decorator.

Code of automatic decorator comes with `targetDecorator` option:
```js
{
	mode: 'automatic',
	callback: url => /^(https?:)?\/\//.test( url ),
	attributes: {
		target: '_blank',
		rel: 'noopener noreferrer'
	}
}
```

<info-box>
	If it is necessary to have a UI option, where the user decides, which links should be open in a new window, then `targetDecorator` options should remain `undefined` and there should be created a new **manual decorator** with proper configuration.
</info-box>



### Manual decorators

This type of decorator registers a UI element which can be switched by the user. Toggleable elements are located in editing view of the link. Modifying the state of this element and applying changes is reflected in the editor's model, what later is downcasted to attributes defined in {@link module:link/link~LinkDecoratorManualOption the manual decorator}.

Configuration of manual decorator contains a label field used in a UI to describe given attributes set. It should be a compact and descriptive name for the user convenience.

For example, this decorator will add "Downloadable" switch button, which extends link with `download="download"` attribute when is turned on:
```js
{
	mode: 'manual',
	label: 'Downloadable',
	attributes: {
		download: 'download'
	}
}
```

## Installation

<info-box info>
	This feature is enabled by default in all builds. The installation instructions are for developers interested in building their own, custom rich text editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-link`](https://www.npmjs.com/package/@ckeditor/ckeditor5-link) package:

```bash
npm install --save @ckeditor/ckeditor5-link
```

Then add the `Link` plugin to your plugin list:

```js
import Link from '@ckeditor/ckeditor5-link/src/link';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Link, ... ],
		toolbar: [ 'link', ... ],
	} )
	.then( ... )
	.catch( ... );
```

## Common API

The {@link module:link/link~Link} plugin registers the UI button component (`'link'`) and the following commands:

* The `'link'` command implemented by {@link module:link/linkcommand~LinkCommand}.
* The `'unlink'` command implemented by {@link module:link/unlinkcommand~UnlinkCommand}.

The commands can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Applies the link to the selected content.
// When the selection is collapsed, it creates new text wrapped in a link.
editor.execute( 'link', 'http://example.com' );

// Removes the link from the selection.
editor.execute( 'unlink' );
```

Links are represented in the {@link module:engine/model/model~Model model} using the `linkHref` attribute.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-link.
