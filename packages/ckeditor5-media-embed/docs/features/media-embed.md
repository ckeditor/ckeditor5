---
category: features
---

{@snippet features/build-media-source}

# Media embed

The {@link module:media-embed/mediaembed~MediaEmbed} feature brings a basic support for embeddable, synchronous media in the editor content.

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

## Configuration

### Output type

To satisfy most of the use–cases, the feature can be configured using the {@link module:media-embed/mediaembed~MediaEmbedConfig#semanticDataOutput `semanticDataOutput`} option to output different kind data:

* **Non–semantic** (default) – outputs media in the same way it works in the editor, i.e. the media preview is saved to the database.

   ```html
   <figure class="media">
   	<div data-oembed-url="https://url">
   		<iframe src="https://preview"></iframe>
   	</div>
   </figure>
   ```

* **Semantic** – does not include the preview of the media, just just the `<oembed>` tag with the `url` attribute. Best when the application processes (expands) the media on the server–side or directly in the front–end, preserving the versatile database representation.

   ```html
   <figure class="media">
   	<oembed url="https://url"></oembed>
   </figure>
   ```

### Media providers

## Common API

The {@link module:media-embed/mediaembed~MediaEmbed} plugin registers:
* the `'insertMedia'` UI button component,
* the `'insertMedia'` command implemented by {@link module:media-embed/insertmediacommand~InsertMediaCommand}.

	You can insert a new media or update the selected media URL by executing the following code:

	```js
	editor.execute( 'insertMedia', { url: 'http://url.to.the/media' } );
	```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-media-embed.
