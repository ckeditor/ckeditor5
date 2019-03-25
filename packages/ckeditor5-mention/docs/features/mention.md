---
category: features
---

{@snippet features/build-mention-source}

# Mention

The {@link module:mention/mention~Mention} feature brings support for smart completion based on user input. When user types a pre-configured marker, such as `@` or `#`, they get an autocomplete suggestions in a balloon panel displayed next to a caret. The selected suggestion is inserted to the content.

## Demo

{@snippet features/mention}

## Installation

<info-box info>
	This feature is enabled by default in all builds. The installation instructions are for developers interested in building their own, custom editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-mention`](https://www.npmjs.com/package/@ckeditor/ckeditor5-mention) package:

```bash
npm install --save @ckeditor/ckeditor5-mention
```

Then add `Mention` to your plugin list and {@link module:mention/mention~MentionConfig configure} the feature (if needed):

```js
import Mention from '@ckeditor/ckeditor5-mention/src/mention';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Mention, ... ],
		mention: {
			// configuration...
		}
	} )
	.then( ... )
	.catch( ... );
```

## Common API

The {@link module:mention/mention~Mention} plugin registers:
* the `'mention'` command implemented by {@link module:mention/mentioncommand~MentionCommand}.

	You can insert a mention element by executing the following code:

	```js
	editor.execute( 'mention', { marker: '@', mention: 'John' } );
	```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-mention.
