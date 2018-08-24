---
category: features
---

{@snippet features/build-media-source}

# Media embed

The {@link module:media-embed/mediaembed~MediaEmbed} feature brings support for embeddable media (such as YouTube videos or tweets) in the editor content.

## Demo

Example URLs:

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
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ MediaEmbed, ... ],
		toolbar: [ 'mediaEmbed', ... ]
		mediaEmbed: {
			// configuration...
		}
	} )
	.then( ... )
	.catch( ... );
```

<info-box>
	Depending on how you will configure this feature, you may need to use services like [Iframely](http://iframe.ly/) or [Embedly](https://embed.ly/) to display content of embedded media on your target website. Read more about [displaying embedded media](#displaying-embedded-media-on-your-website).
</info-box>

## Configuration

### Output type

The data output format of the feature can be configured using the {@link module:media-embed/mediaembed~MediaEmbedConfig#semanticDataOutput `config.mediaEmbed.semanticDataOutput`} option.

#### Non–semantic output

By default the media embed feature outputs media in the same way it works in the editor, this is, if this media is "previewable", the media preview (HTML) is saved to the database:

```html
<figure class="media">
	<div data-oembed-url="https://media-url">
		<iframe src="https://media-preview-url"></iframe>
	</div>
</figure>
```

Currently, the preview is only available for content providers for which CKEditor 5 can predict an `<iframe>` code – this is YouTube, Vimeo, Dailymotion, Spotify, etc. For other providers like Twitter or Instagram the editor cannot produce an `<iframe>` code and it does not, so far, allows retriving this code from an external oEmbed service. Therefore, for non previewable media it produces the semantic output:

```html
<figure class="media">
	<oembed url="https://media-url"></oembed>
</figure>
```

This means that, unless you [limited the list of providers](#media-providers) to only those which are previewable, you need to [make sure that media are displayed on your website](#displaying-embedded-media-on-your-website).

#### Semantic output

Optionally, by setting `mediaEmbed.semanticDataOutput` to `true` you can configure the media embed feature to output semantic `<oembed>` tags for previewable and non-previewable media. This option works best when the application processes (expands) the media on the server–side or [directly in the front–end](#displaying-embedded-media-on-your-website), preserving the versatile database representation:

```html
<figure class="media">
	<oembed url="https://media-url"></oembed>
</figure>
```

<info-box info>
	This option does not change how media are displayed inside the editor – the previewable ones will still be displayed with previews.
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
* `'googleMaps'`,
* `'flickr'`,
* `'facebook'`

<info-box notice>
	The default media provider configuration does not support all possible media URLs, only the most common are included. Services like Iframely or Embedly support thousands of media providers and it is up to you to define which you want to allow.
</info-box>

#### Extending

To extend the default list of default providers, use {@link module:media-embed/mediaembed~MediaEmbedConfig#extraProviders `config.mediaEmbed.extraProviders`}.

#### Removing

To remove certain providers, use {@link module:media-embed/mediaembed~MediaEmbedConfig#removeProviders `config.mediaEmbed.removeProviders`}.

For instance, to leave only the previewable providers use this

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ MediaEmbed, ... ],
		toolbar: [ 'mediaEmbed', ... ]
		mediaEmbed: {
			removeProviders: [ 'instagram', 'twitter', 'googleMaps', 'flickr', 'facebook' ]
		}
	} )
	.then( ... )
	.catch( ... );
```

#### Overriding

To override the default providers, use {@link module:media-embed/mediaembed~MediaEmbedConfig#providers `config.mediaEmbed.providers`} and define your set according to the {@link module:media-embed/mediaembed~MediaEmbedProvider provider syntax}:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ MediaEmbed, ... ],,
		toolbar: [ 'mediaEmbed', ... ]
		mediaEmbed: {
			providers: [
				{
					// An URL regexp or array of URL regexps:
					url: /^(https:\/\/)?(www\.)?example\.com\/media\/(\w+)/,

					// To be defined only if the media is previewable:
					html: mediaId => '...'
				},
				...
			]
		}
	} )
	.then( ... )
	.catch( ... );
```

## Displaying embedded media on your website

The media embed feature produces output that may not contain previews of some embedded media. That happens for all media types when the feature is configured to produce a [semantic output](#semantic-output) and for non-previewable media in the default configuration. That means that you need to transform the output `<oembed>` elements into real media on your target website.

There are many ways to do that. The simplest, plug-and-play solutions are described here. You can also implement this transformation as part of your backend service and you can use different services than described in this section.

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

You can convert all `<oembed>` elements like the following Twitter post produced by CKEditor 5:

```html
<figure class="media">
	<oembed url="https://twitter.com/ckeditor/status/1021777799844126720"></oembed>
</figure>
```

using this short code snippet:

```html
<script>
	document.querySelectorAll( 'oembed[url]' ).forEach( element => {
		iframely.load( element, element.attributes.url.value );
	} );
</script>
```

#### Non-semantic data

Additionally, despite the fact that the media preview is included for some media types (unless you [configured the media embed feature otherwise](#semantic-output)), you can still use Iframely for media embeds like the following one:

```html
<figure class="media">
	<div data-oembed-url="https://twitter.com/ckeditor/status/1021777799844126720">
		[Media preview]
	</div>
</figure>
```

The above data can still be converted by Iframely with just a few extra lines of code. To do that, in addition to the code snippet from the previous section, use a slightly longer code snippet which discards the media preview saved in the database before using `iframely.load()`:

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

You can convert `<oembed>` elements like the following Twitter post produced by CKEditor 5:

```html
<figure class="media">
	<oembed url="https://twitter.com/ckeditor/status/1021777799844126720"></oembed>
</figure>
```

using this code snippet:

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

Embedly automatically discovers links like `<a href="..." class="embedly-card"></a>` and replaces them with rich media previews.

#### Non-semantic data

In this case, the code is almost the same as with the semantic data but you should discard the media preview saved in the database before using Embedly to avoid code duplication:

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
