---
category: features
---

{@snippet features/build-media-source}

# Media embed

The {@link module:mediaembed/mediaembed~MediaEmbed} feature brings a basic support for embeddable, synchronous media in the editor content.

## Demo

### Example URLs

* <input class="example-input" type="text" value="https://www.youtube.com/watch?v=H08tGjXNHO4">
* <input class="example-input" type="text" value="https://open.spotify.com/album/2IXlgvecaDqOeF3viUZnPI?si=ogVw7KlcQAGZKK4Jz9QzvA">
* <input class="example-input" type="text" value="https://www.instagram.com/p/BmMZgokAGGQ/?taken-by=nasa">

{@snippet features/media-embed}

## Installation

To add this feature to your editor, install the [`@ckeditor/ckeditor5-media-embed`](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed) package:

```bash
npm install --save @ckeditor/ckeditor5-media-embed
```

Then add `'MediaEmbed'` to your plugin list and configure the media providers:

```js
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/table';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ MediaEmbed, ... ],
		toolbar: [ 'insertMedia', ... ]
		mediaEmbed: {
			...
		}
	} )
	.then( ... )
	.catch( ... );
```

## Configuring the media

TODO

## Common API

The {@link module:mediaembed/mediaembed~MediaEmbed} plugin registers:
* the `'insertMedia'` UI button component,
* the `'insertMedia'` command implemented by {@link module:mediaembed/insertmediacommand~InsertMediaCommand}.

	You can insert a new media or update the selected media URL by executing the following code:

	```js
	editor.execute( 'insertMedia', { url: 'http://url.to.the/media' } );
	```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-media-embed.
