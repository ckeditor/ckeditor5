---
title: Link
category: features
---

The {@link module:link/link~Link} plugin brings the link editing to the editor. It allows links in the edited content and offers the UI to create and edit them.

## Demo

You can edit existing links by clicking them and using the balloon. Use the toolbar button press or press <kbd>Ctrl/⌘</kbd>+<kbd>K</kbd> to create new links.

{@snippet features/link}

### Typing around links

CKEditor allows typing both at inner and outer boundaries of links to make the editing easier for the users.

**To type inside a link**, move the caret to its (start or end) boundary. As long as the link remains highlighted blue, typing and and applying formatting will be done within its boundaries:

{@img assets/img/typing-inside.gif 770 The animation showing typing inside the link.}

**To type before or after a link**, move the caret to its boundary, then press the arrow key (<kbd>→</kbd> or <kbd>←</kbd>) once. The link is no longer highlighted and whatever text you type or formatting you apply will not be enclosed by a link:

{@img assets/img/typing-before.gif 770 The animation showing typing before the link.}

## Installation

<info-box info>
	This feature is enabled by default in all builds. The installation instructions are for developers interested in building their own, custom editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-link`](https://www.npmjs.com/package/@ckeditor/ckeditor5-link) package:

```bash
npm install --save @ckeditor/ckeditor5-link
```

Then add `Link` plugin to your plugin list:

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
* The `'unlink'` command implemented by {@link module:link/unlinkcommand~UnlinkCommand}

which can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Applies the link to the selected content.
// When the selection is collapsed, it creates a new text wrapped in a link.
editor.execute( 'link', 'http://example.com' );

// Removes the link from the selection.
editor.execute( 'unlink' );
```

Links are represented in the {@link module:engine/model/model~Model model} using the `linkHref` attribute.

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-link.
