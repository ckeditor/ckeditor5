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
					url: /^example\.com\/media\/(\w+)/,

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

## Styling media in editor content

While the editor comes with default styles for popular media providers like Facebook, Instagram or Twitter, you can create additional styles for non-previewable media in your editor content to help users identify them.

### Styling non-previewable media

The HTML structure of every non-previewable media in the editor is as follows:

```html
<figure class="media ck-widget" contenteditable="false">
	<div class="ck-media__wrapper" data-oembed-url="[ URL of the media ]">
		<div class="ck ck-reset_all ck-media__placeholder">
			<div class="ck-media__placeholder__icon">
				<svg class="ck ck-icon" ...>...</svg>
			</div>
			<a class="ck-media__placeholder__url" target="new" href="[ URL of the media]">
				<span class="ck-media__placeholder__url__text">[ URL of the media]</span>
				<span class="ck ck-tooltip ck-tooltip_s">...</span>
			</a>
		</div>
	</div>
</figure>
```

Let's create the dedicated style for media coming from the [ckeditor.com](https://ckeditor.com) domain. To do that, you'll need some additional styles included in your website.

First, we must hide the generic media icon displayed for non-previewable media:

```css
.ck-media__wrapper[data-oembed-url*="ckeditor.com"] .ck-media__placeholder__icon * {
	display: none;
}
```

Then, let's give the media a distinctive background color

```css
.ck-media__wrapper[data-oembed-url*="ckeditor.com"] .ck-media__placeholder {
	background: hsl(282, 44%, 47%);
}
```

and introduce the custom icon identifying the media

```css
.ck-media__wrapper[data-oembed-url*="ckeditor.com"] .ck-media__placeholder__icon {
	background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIxMDFweCIgaGVpZ2h0PSIxMDFweCIgdmlld0JveD0iMCAwIDEwMSAxMDEiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+ICAgICAgICA8dGl0bGU+bG9nby1lY29zeXN0ZW0tM2NhYTI3MDIxODwvdGl0bGU+ICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPiAgICA8ZGVmcz48L2RlZnM+ICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPiAgICAgICAgPGcgaWQ9ImxvZ28tZWNvc3lzdGVtLTNjYWEyNzAyMTgiIGZpbGw9IiNGRkZGRkYiIGZpbGwtcnVsZT0ibm9uemVybyI+ICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZSIgZmlsbC1vcGFjaXR5PSIwIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTAxIiBoZWlnaHQ9IjEwMSI+PC9yZWN0PiAgICAgICAgICAgIDxwYXRoIGQ9Ik02NC44LDM4Ljg5MTIzODIgQzY2LjEwODU1MzgsMzkuOTE3NzU4MiA2Ny43MjMxODI2LDQwLjQ3MzI5MyA2OS4zODQ0NTk1LDQwLjQ2ODU4MzQgQzczLjQzMTIxNjIsNDAuNDY4NTgzNCA3Ni43MTE1MTM1LDM3LjI1Nzc4MTkgNzYuNzExNTEzNSwzMy4yOTUwOTE4IEM3Ni43MTE1MTM1LDI5LjMzMzAyNTIgNzMuNDMxMjE2MiwyNi4xMjA5NzY4IDY5LjM4NDQ1OTUsMjYuMTIwOTc2OCBDNjUuMzM3NzAyNywyNi4xMjA5NzY4IDYyLjA1ODAyNywyOS4zMzMwMjUyIDYyLjA1ODAyNywzMy4yOTUwOTE4IEM2Mi4wNTgwMjcsMzQuMzY0MzE5OSA2Mi4yOTY3Mjk3LDM1LjM3ODY4MzggNjIuNzI1MDI3LDM2LjI5MDE3NzMgTDU4LjM3MzA1NDEsNDAuNTUwODc5NyBDNTYuMjU3MjU2OCwzOS4xMjEwNDg1IDUzLjc2MjYxNjcsMzguMzYwMzA1NSA1MS4yMTEzNTE0LDM4LjM2NjkxMTIgQzQ4LjMzMzg2NDksMzguMzY2OTExMiA0NS42ODIwMjcsMzkuMzEwODI0NSA0My41NjEwNTQxLDQwLjg5OTM5MTkgTDM5LjY1NjY0ODYsMzcuMDc2MzU2MSBDNDAuMzc1NDcxNiwzNS45NDcwNDM1IDQwLjc1Njg0NDgsMzQuNjM0OTA3OSA0MC43NTU2NzU3LDMzLjI5NTA5MTggQzQwLjc1NTY3NTcsMjkuMzMzMDI1MiAzNy40NzUzNzg0LDI2LjEyMDk3NjggMzMuNDI4NjIxNiwyNi4xMjA5NzY4IEMyOS4zODE4NjQ5LDI2LjEyMDk3NjggMjYuMTAxNTY3NiwyOS4zMzMwMjUyIDI2LjEwMTU2NzYsMzMuMjk1MDkxOCBDMjYuMTAxNTY3NiwzNy4yNTcxNTg1IDI5LjM4MTg2NDksNDAuNDY5MjA2OSAzMy40Mjg2MjE2LDQwLjQ2OTIwNjkgQzM0Ljg0NTkxODksNDAuNDY5MjA2OSAzNi4xNjkzNTE0LDQwLjA3NTE4MjMgMzcuMjkwMTM1MSwzOS4zOTMxMjA4IEw0MS4xOTUxNjIyLDQzLjIxNjE1NjYgQzM5LjU3MjcyOTcsNDUuMjkyODkwNSAzOC42MDc5NzMsNDcuODg5NTg3MiAzOC42MDc5NzMsNTAuNzA2OTg3NiBDMzguNjA2NjIzNyw1My4yMjAyMjEzIDM5LjM4NjcwNSw1NS42NzEzMjggNDAuODM5NTk0Niw1Ny43MTkwMDM5IEwzNi40ODcsNjEuOTgwMzI5NyBDMzUuNTI1MTEwNSw2MS41NDc5NzY5IDM0LjQ4MjY4OTMsNjEuMzI1Mjc3MyAzMy40Mjg2MjE2LDYxLjMyNjk0NzIgQzI5LjM4MTg2NDksNjEuMzI2OTQ3MiAyNi4xMDE1Njc2LDY0LjUzODk5NTYgMjYuMTAxNTY3Niw2OC41MDEwNjIzIEMyNi4xMDE1Njc2LDcyLjQ2Mzc1MjQgMjkuMzgxODY0OSw3NS42NzUxNzczIDMzLjQyODYyMTYsNzUuNjc1MTc3MyBDMzcuNDc1Mzc4NCw3NS42NzUxNzczIDQwLjc1NTY3NTcsNzIuNDYzNzUyNCA0MC43NTU2NzU3LDY4LjUwMTA2MjMgQzQwLjc1NTY3NTcsNjYuODAyMTQzIDQwLjE1MjcwMjcsNjUuMjQxMDA3NyAzOS4xNDM4MTA4LDY0LjAxMjE3NDggTDQzLjA5MjM1MTQsNjAuMTQ2MTIwNCBDNDUuMjg1NDMyNCw2MS45NTYwMTQ5IDQ4LjExODE2MjIsNjMuMDQ3MDY0IDUxLjIxMDcyOTcsNjMuMDQ3MDY0IEM1NC4wODg4Mzc4LDYzLjA0NzA2NCA1Ni43NDAwNTQxLDYyLjEwMzE1MDcgNTguODYxNjQ4Niw2MC41MTM5NTk4IEw2My4xNTcwNTQxLDY0LjcxOTc5OCBDNjIuNDM4MjMxMSw2NS44NDkxMTA2IDYyLjA1Njg1NzksNjcuMTYxMjQ2MiA2Mi4wNTgwMjcsNjguNTAxMDYyMyBDNjIuMDU4MDI3LDcyLjQ2Mzc1MjQgNjUuMzM4MzI0Myw3NS42NzUxNzczIDY5LjM4NDQ1OTUsNzUuNjc1MTc3MyBDNzMuNDMxMjE2Miw3NS42NzUxNzczIDc2LjcxMTUxMzUsNzIuNDYzNzUyNCA3Ni43MTE1MTM1LDY4LjUwMTA2MjMgQzc2LjcxMTUxMzUsNjQuNTM4OTk1NiA3My40MzEyMTYyLDYxLjMyNjk0NzIgNjkuMzg0NDU5NSw2MS4zMjY5NDcyIEM2Ny45NjcxNjIyLDYxLjMyNjk0NzIgNjYuNjQ0MzUxNCw2MS43MjA5NzE4IDY1LjUyMjk0NTksNjIuNDAzNjU2OCBMNjEuMjI3NTQwNSw1OC4xOTc4MTg2IEM2Mi44NDk5NzMsNTYuMTIwNDYxMiA2My44MTQxMDgxLDUzLjUyMzc2NDUgNjMuODE0MTA4MSw1MC43MDY5ODc2IEM2My44MTQxMDgxLDQ3LjY3ODIzNTUgNjIuNzAwMTYyMiw0NC45MDUxMDA1IDYwLjg1MTQ1OTUsNDIuNzU3OTE2IEw2NC44LDM4Ljg5MTIzODIgWiBNNTUuOTc5MTg5MiwxLjMwNjc4MDg3IEw5Mi4wMjA4MTA4LDIxLjY4MDcxODkgQzk1LjEwMTU2NzYsMjMuNDIyNjU2NiA5NywyNi42NDIxODY1IDk3LDMwLjEyNjA2MTkgTDk3LDcwLjg3MzkzODEgQzk3LDc0LjM1NzgxMzUgOTUuMTAxNTY3Niw3Ny41NzczNDM0IDkyLjAyMDgxMDgsNzkuMzE5MjgxMSBMNTUuOTc5MTg5Miw5OS42OTM4NDI2IEM1Mi44ODY4MTA4LDEwMS40MzUzODYgNDkuMTEzMTg5MiwxMDEuNDM1Mzg2IDQ2LjAyMDgxMDgsOTkuNjkzODQyNiBMOS45NzkxODkxOSw3OS4zMTkyODExIEM2Ljg5ODQzMjQzLDc3LjU3NzM0MzQgNSw3NC4zNTc4MTM1IDUsNzAuODczOTM4MSBMNSwzMC4xMjYwNjE5IEM1LDI2LjY0MjE4NjUgNi44OTg0MzI0MywyMy40MjI2NTY2IDkuOTc5MTg5MTksMjEuNjgwNzE4OSBMNDYuMDIwODEwOCwxLjMwNjE1NzQxIEM0OS4xMTMxODkyLC0wLjQzNTM4NTgwMyA1Mi44ODY4MTA4LC0wLjQzNTM4NTgwMyA1NS45NzkxODkyLDEuMzA2MTU3NDEgTDU1Ljk3OTE4OTIsMS4zMDY3ODA4NyBaIE01MS4yMTEzNTE0LDU5Ljc5NjM2MTMgQzQ2LjA4NDIxNjIsNTkuNzk2MzYxMyA0MS45MjgwNTQxLDU1LjcyNzA2MDEgNDEuOTI4MDU0MSw1MC43MDYzNjQxIEM0MS45MjgwNTQxLDQ1LjY4NjkxNTEgNDYuMDg0MjE2Miw0MS42MTY5OTA0IDUxLjIxMTM1MTQsNDEuNjE2OTkwNCBDNTYuMzM4NDg2NSw0MS42MTY5OTA0IDYwLjQ5NDY0ODYsNDUuNjg2OTE1MSA2MC40OTQ2NDg2LDUwLjcwNjk4NzYgQzYwLjQ5NDY0ODYsNTUuNzI3MDYwMSA1Ni4zMzg0ODY1LDU5Ljc5Njk4NDcgNTEuMjExMzUxNCw1OS43OTY5ODQ3IEw1MS4yMTEzNTE0LDU5Ljc5NjM2MTMgWiBNNjkuMzg0NDU5NSw3Mi40MjUwOTgxIEM2Ny4xNzE0ODY1LDcyLjQyNTA5ODEgNjUuMzc3NDg2NSw3MC42NjgxOTc0IDY1LjM3NzQ4NjUsNjguNTAxMDYyMyBDNjUuMzc3NDg2NSw2Ni4zMzQ1NTA2IDY3LjE3MTQ4NjUsNjQuNTc3NjQ5OSA2OS4zODQ0NTk1LDY0LjU3NzY0OTkgQzcxLjU5NzQzMjQsNjQuNTc3NjQ5OSA3My4zOTIwNTQxLDY2LjMzNDU1MDYgNzMuMzkyMDU0MSw2OC41MDEwNjIzIEM3My4zOTIwNTQxLDcwLjY2ODE5NzQgNzEuNTk4MDU0MSw3Mi40MjUwOTgxIDY5LjM4NDQ1OTUsNzIuNDI1MDk4MSBaIE0zMy40Mjg2MjE2LDcyLjQyNTA5ODEgQzMxLjIxNTY0ODYsNzIuNDI1MDk4MSAyOS40MjE2NDg2LDcwLjY2ODE5NzQgMjkuNDIxNjQ4Niw2OC41MDEwNjIzIEMyOS40MjE2NDg2LDY2LjMzNDU1MDYgMzEuMjE1NjQ4Niw2NC41Nzc2NDk5IDMzLjQyODYyMTYsNjQuNTc3NjQ5OSBDMzUuNjQxNTk0Niw2NC41Nzc2NDk5IDM3LjQzNTU5NDYsNjYuMzM0NTUwNiAzNy40MzU1OTQ2LDY4LjUwMTA2MjMgQzM3LjQzNTU5NDYsNzAuNjY4MTk3NCAzNS42NDE1OTQ2LDcyLjQyNTA5ODEgMzMuNDI4NjIxNiw3Mi40MjUwOTgxIFogTTMzLjQyODYyMTYsMzcuMjE4NTA0MiBDMzEuMjE1NjQ4NiwzNy4yMTg1MDQyIDI5LjQyMTY0ODYsMzUuNDYyMjI2OSAyOS40MjE2NDg2LDMzLjI5NTA5MTggQzI5LjQyMTY0ODYsMzEuMTI3OTU2NyAzMS4yMTU2NDg2LDI5LjM3MTY3OTUgMzMuNDI4NjIxNiwyOS4zNzE2Nzk1IEMzNS42NDE1OTQ2LDI5LjM3MTY3OTUgMzcuNDM1NTk0NiwzMS4xMjc5NTY3IDM3LjQzNTU5NDYsMzMuMjk1MDkxOCBDMzcuNDM1NTk0NiwzNS40NjIyMjY5IDM1LjY0MTU5NDYsMzcuMjE4NTA0MiAzMy40Mjg2MjE2LDM3LjIxODUwNDIgWiBNNjkuMzg0NDU5NSwzNy4yMTg1MDQyIEM2Ny4xNzE0ODY1LDM3LjIxODUwNDIgNjUuMzc3NDg2NSwzNS40NjIyMjY5IDY1LjM3NzQ4NjUsMzMuMjk1MDkxOCBDNjUuMzc3NDg2NSwzMS4xMjc5NTY3IDY3LjE3MTQ4NjUsMjkuMzcxNjc5NSA2OS4zODQ0NTk1LDI5LjM3MTY3OTUgQzcxLjU5NzQzMjQsMjkuMzcxNjc5NSA3My4zOTIwNTQxLDMxLjEyNzk1NjcgNzMuMzkyMDU0MSwzMy4yOTUwOTE4IEM3My4zOTIwNTQxLDM1LjQ2MjIyNjkgNzEuNTk4MDU0MSwzNy4yMTg1MDQyIDY5LjM4NDQ1OTUsMzcuMjE4NTA0MiBaIiBpZD0iU2hhcGUiPjwvcGF0aD4gICAgICAgIDwvZz4gICAgPC9nPjwvc3ZnPg==);
}
```

Finally, let's make sure the URL in the placeholder has the right contrast:

```css
.ck-media__wrapper[data-oembed-url*="ckeditor.com"] .ck-media__placeholder__url .ck-media__placeholder__url__text {
	color: hsl(282, 100%, 93%);
}

.ck-media__wrapper[data-oembed-url*="ckeditor.com"] .ck-media__placeholder__url .ck-media__placeholder__url__text:hover {
	color: hsl(0, 100%, 100%);
}
```

Before you load the data, make sure the `ckeditor.com` provider is [enabled in your configuration](#extending). In its most basic form it could look like this:

```js
mediaEmbed: {
	extraProviders: [
		{
			name: 'ckeditor',
			url: /^ckeditor\.com/
		}
	]
}
```

Having your styles defined and the media provider configured, insert the new media into your editor, e.g. the following URL `https://ckeditor.com/path/to/media`. You should see something like this:

{@img assets/img/features-media-embed-ckeditor.png 791 The example media style of the media}

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
