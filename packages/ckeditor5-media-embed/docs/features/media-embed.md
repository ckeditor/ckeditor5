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

Then add `'MediaEmbed'` to your plugin list and {@link module:media-embed/mediaembed~MediaEmbedConfig configure} the feature:

```js
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/table';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ MediaEmbed, ... ],
		toolbar: [ 'mediaEmbed', ... ]
		mediaEmbed: {
			...
		}
	} )
	.then( ... )
	.catch( ... );
```

## Configuration

### Output type

The data output format of the feature can be configured using the {@link module:media-embed/mediaembed~MediaEmbedConfig#semanticDataOutput `config.mediaEmbed.semanticDataOutput`}:

* **Non–semantic** (when `false`, default) – outputs media in the same way it works in the editor, i.e. the media preview is saved to the database.

   ```html
   <figure class="media">
   	<div data-oembed-url="https://url">
   		<iframe src="https://preview"></iframe>
   	</div>
   </figure>
   ```

* **Semantic** (when `true`) – does not include the preview of the media, just just the `<oembed>` tag with the `url` attribute. Best when the application processes (expands) the media on the server–side or directly in the front–end, preserving the versatile database representation.

   ```html
   <figure class="media">
   	<oembed url="https://url"></oembed>
   </figure>
   ```

<info-box info>
	You can easily [expand](#using-media-in-the-frontend) the media using popular embed services in the front–end of your application regardless of the data output type you chose in your database.
</info-box>

### Media providers

CKEditor comes with several supported media providers which can be extended or altered.

Names of providers **with previews**:

* `'dailymotion'`,
* `'spotify'`,
* `'youtube'`,
* `'vimeo'`

Names of providers **without previews**:

* `'instagram'`,
* `'twitter'`,
* `'google'`,
* `'flickr'`,
* `'facebook'`

<info-box notice>
	The default media provider configuration may not support all possible media URLs, only the most common are included.
</info-box>

#### Overriding

To override the default providers, use {@link module:media-embed/mediaembed~MediaEmbedConfig#providers `config.mediaEmbed.providers`} and define your set according to the {@link module:media-embed/mediaembed~MediaEmbedProvider provider syntax}:

```js
ClassicEditor
	.create( editorElement, {
		plugins: [ MediaEmbed, ... ],
		mediaEmbed: {
			providers: [
				{
					 name: 'myProvider',
					 url: /^(https:\/\/)?(www\.)?example\.com\/media\/(\w+)/,
					 html: mediaId => '...'
				},
				...
			]
		}
	} )
	.then( ... )
	.catch( ... );
```

#### Extending

To extend the default list of default providers, use {@link module:media-embed/mediaembed~MediaEmbedConfig#extraProviders `config.mediaEmbed.extraProviders`}.

#### Removing

To remove certain providers, use {@link module:media-embed/mediaembed~MediaEmbedConfig#removeProviders `config.mediaEmbed.premoveProviders`}.

## Using media in the front–end

### Iframely

[Iframely](https://iframely.com) offers the [embed.js](https://iframely.com/docs/embedjs) library which converts [various media](https://iframely.com/docs/providers) URLs into rich previews. It works in the front–end and remains fully compatible with the output produced by CKEditor.

First, having [secured the API key](https://iframely.com/docs/allow-origins), load the `embed.js` library from the CDN into your website:

```html
<head>
	...
	<script charset="utf-8" src="//cdn.iframe.ly/embed.js?api_key={API KEY}"></script>
	...
</head>
```

#### Semantic data

You can convert all {@link module:media-embed/mediaembed~MediaEmbedConfig#semanticDataOutput semantic media} like the following Twitter post produced by CKEditor

```html
<figure class="media">
	<oembed url="https://twitter.com/ckeditor/status/1021777799844126720"></oembed>
</figure>
```

using this short code snippet

```html
<script>
	document.querySelectorAll( 'oembed[url]' ).forEach( element => {
		iframely.load( element, element.attributes.url.value ) ;
	} );
</script>
```

#### Non–semantic data

Despite including the media preview, the {@link module:media-embed/mediaembed~MediaEmbedConfig#semanticDataOutput non–semantic} data like the following one

```html
<figure class="media">
	<div data-oembed-url="https://twitter.com/ckeditor/status/1021777799844126720">
		[Media preview]
	</div>
</figure>
```

can still be converted by Iframely with just a few extra lines of code. To do that, use a slightly longer code snippet which discards the media preview saved in the database before using `iframely.load()`:

```html
<script>
	document.querySelectorAll( 'div[data-oembed-url]' ).forEach( element => {
		// Discard the static media preview from the database (empty the <div data-oembed-url="...">).
		while ( element.firstChild ) {
			element.removeChild( element.firstChild );
		}

		// Generate the media preview using Iframely.
		iframely.load( element, element.dataset.oembedUrl ) ;
	} );
</script>
```

### Embedly

Just like Iframely, [Embedly](https://embed.ly) offers the client–side API which converts media URLs into rich previews.

To start using it, load the library from the CDN into your website:

```html
<head>
	...
	<script async charset="utf-8" src="//cdn.embedly.com/widgets/platform.js"></script>
	...
</head>
```

#### Semantic data

You can convert all {@link module:media-embed/mediaembed~MediaEmbedConfig#semanticDataOutput semantic media} like the following Twitter post produced by CKEditor

```html
<figure class="media">
	<oembed url="https://twitter.com/ckeditor/status/1021777799844126720"></oembed>
</figure>
```

using this code snippet

```html
<script>
	document.querySelectorAll( 'oembed[url]' ).forEach( element => {
		// Create the <a href="..." class="embedly-card"></a> element that Embedly uses
		// to discover the media.
		const anchor = document.createElement( 'a' );

		anchor.setAttribute( 'href', element.getAttribute( 'url ') );
		anchor.className = 'embedly-card';

		element.appendChild( anchor );
	} );
</script>
```

Embedly discovers links like `<a href="..." class="embedly-card"></a>` and replaces them with rich media previews.

#### Non–semantic data

The code is almost the same as with the semantic data but you should discard the media preview saved in the database before using embedly to avoid code duplication:

```html
<script>
	document.querySelectorAll( 'div[data-oembed-url]' ).forEach( element => {
		// Discard the static media preview from the database (empty the <div data-oembed-url="...">).
		while ( element.firstChild ) {
			element.removeChild( element.firstChild );
		}

		// Create the <a href="..." class="embedly-card"></a> element that Embedly uses
		// to discover the media.
		const anchor = document.createElement( 'a' );

		anchor.setAttribute( 'href', element.dataset.oembedUrl );
		anchor.className = 'embedly-card';

		element.appendChild( anchor );
	} );
</script>
```

## Common API

The {@link module:media-embed/mediaembed~MediaEmbed} plugin registers:
* the `'mediaEmbed'` UI button component,
* the `'mediaEmbed'` command implemented by {@link module:media-embed/mediaembedcommand~MediaEmbedCommand}.

	You can insert a new media or update the selected media URL by executing the following code:

	```js
	editor.execute( 'mediaEmbed', { url: 'http://url.to.the/media' } );
	```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-media-embed.
