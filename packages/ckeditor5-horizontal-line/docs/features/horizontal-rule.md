---
category: features
menu-title: Horizontal rule
---

# Horizontal rule

The {@link module:horizontal-rule/horizontalrule~HorizontalRule} plugin provides a possibility to insert a horizontal rule in the rich-text editor.

## Demo

Use the editor below to see the {@link module:horizontal-rule/horizontalrule~HorizontalRule} plugin in action.

{@snippet features/horizontal-rule}

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-horizontal-rule`](https://www.npmjs.com/package/@ckeditor/ckeditor5-horizontal-rule) package:

```bash
npm install --save @ckeditor/ckeditor5-horizontal-rule
```

And add it to your plugin list configuration:

```js
import HorizontalRule from '@ckeditor/ckeditor5-horizontal-rule/src/horizontalrule';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ HorizontalRule, ... ],
		toolbar: [ 'horizontalRule', ... ],
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:horizontal-rule/horizontalrule~HorizontalRule} plugin registers the UI button component (`'horizontalRule'`) and the `'horizontalRule'` command implemented by {@link module:horizontal-rule/horizontalrulecommand~HorizontalRuleCommand}. 

The command can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Inserts the horizontal rule to the selected content.
editor.execute( 'horizontalRule' );
```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-horizontal-rule.
