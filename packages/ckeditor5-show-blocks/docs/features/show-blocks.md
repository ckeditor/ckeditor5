---
title: Show blocks
menu-title: Show blocks
category: features
contributeUrl: false
modified_at: 2023-06-20
---

The show blocks feature allows to visualize all block-level elements by surrounding them with an outline and displaying their element name at the top-left.

## Demo

To see the show blocks plugin in action, toggle the block elements visibility with {@icon @ckeditor/ckeditor5-show-blocks/theme/icons/show-blocks.svg Show blocks} toolbar button. The editor content is still editable, so you can see how the blocks adjust to their internals on the go.

{@snippet features/show-blocks}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

## Installation

To add this feature to your editor, install the [`@ckeditor/ckeditor5-show-blocks`](https://www.npmjs.com/package/@ckeditor/ckeditor5-show-blocks) package:

```
npm install --save @ckeditor/ckeditor5-show-blocks
```

Then add the `ShowBlocks` plugin to your plugin list and to the toolbar:

```js
import { ShowBlocks } from '@ckeditor/ckeditor5-show-blocks';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// Load the plugin.
		plugins: [ ShowBlocks, /* ... */ ],

		// Display the "Show blocks" button in the toolbar.
		toolbar: [ 'showBlocks', /* ... */ ],
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box info>
	Read more about {@link installation/plugins/installing-plugins installing plugins} and {@link features/toolbar toolbar configuration}.
</info-box>

## Related features

## Common API

The {@link module:show-blocks/showblocks~ShowBlocks} plugin registers the `'showBlocks'` UI button component and the `'showBlocks'` command implemented by {@link module:show-blocks/showblockscommand~ShowBlocksCommand}.

The command can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Toggle the visibility of block-level elements outline.
editor.execute( 'showBlocks' );
```

<info-box>
	We recommend using the official {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-show-blocks](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-show-blocks).
