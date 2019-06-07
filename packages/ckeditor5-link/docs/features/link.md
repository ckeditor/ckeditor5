---
title: Link
category: features
---

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

## Link decorators

Link decorators is a feature that allows on extending HTML anchor with custom predefined attributes. There are 2 types of decorators: "automatic" and "manual". More information about each of them might be found in sections below. There might be applied multiple decorators to the same link (including manual and automatic decorators in one editor).
<info-box warning>
	**Warning:** It is not recommended to modify the same attribute through two or more decorators. All decorators works independent and its state is not reflected between them in any way. This also includes mixing manual and automatic decorators.
</info-box>

{@snippet features/linkdecorators}

### Automatic decorators

These types of decorators work during downcasting data ({@link framework/guides/architecture/editing-engine#conversion read more about conversion}). You can specify your own rules as a callback function. Function gets a link's href as an input argument and when the callback function returns `true`, then given attributes are applied for a processed link. There might be applied multiple rules for the same link, however you should never process the same attribute through different decorators. Rules how to define automatic decorators can be found in {@linkapi module:link/link~LinkDecoratorAutomaticOption automatic decorator definition}.

For example this decorator will add `download="download"` attribute to every link ending with `.pdf`:
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

There is also predefined configuration option {@linkapi module:link/link~LinkConfig#targetDecorator} which adds automatic decorator. This decorator adds two attributes ( `target="_blank"` and `rel="noopener noreferrer"` ) to all external links.
Target decorator comes with followed configuration underneath:
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

### Manual decorators

These types of decorators adds switch button in user interface, which allows on toggling predefined attributes over a link. Switch buttons are visible in editing option of a link and requires applying changes to be set up over the link. Manual decorators doesn't have a callback property and are available for every link in editor. There is required `label` property, which is using as label for switch button in UI.

For example this decorator will add "Downloadable" switch button:
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
