---
category: features
menu-title: Media embed
meta-title: Media embed | CKEditor 5 Documentation
modified_at: 2021-10-08
---

{@snippet features/build-media-source}

# Media embed

The media embed feature lets you insert embeddable media such as YouTube or Vimeo videos and tweets into your rich text content.

## Demo

You can use the insert media button in the toolbar {@icon @ckeditor/ckeditor5-icons/theme/icons/media.svg Insert media} to embed media. You can also paste a media URL directly into the editor content, and it will be [automatically embedded](#automatic-media-embed-on-paste). Try both approaches with the following URLs:

* <input class="example-input" type="text" value="https://www.youtube.com/watch?v=H08tGjXNHO4">
* <input class="example-input" type="text" value="https://open.spotify.com/album/2IXlgvecaDqOeF3viUZnPI?si=ogVw7KlcQAGZKK4Jz9QzvA">
* <input class="example-input" type="text" value="https://www.instagram.com/p/BmMZgokAGGQ/?taken-by=nasa">

{@snippet features/media-embed}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, MediaEmbed } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ MediaEmbed, /* ... */ ],
		toolbar: [ 'mediaEmbed', /* ... */ ]
		mediaEmbed: {
			// Configuration.
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

<info-box>
	Depending on how you will configure this feature, you may need to use services like [Iframely](https://iframely.com/) or [Embedly](https://embed.ly/) to display content of embedded media on your target website. Read more about [displaying embedded media](#displaying-embedded-media-on-your-website).
</info-box>

## Previewable and non-previewable media

When the media embed feature is asked to embed a specific media element via its URL it needs to make a decision how the media will be displayed in the editor.

### Previewable media

If, for instance, the URL to embed is `https://www.youtube.com/watch?v=H08tGjXNHO4`, the feature can predict that it needs to produce the following HTML to show this YouTube video:

```html
<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">
	<iframe src="https://www.youtube.com/embed/${ videoId }"
		style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;"
		frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
	</iframe>
</div>
```

Yes, it is quite complex, but this is the cost of creating responsive content for today's web. The crucial part, though, is the iframe element's `src` which the media embed feature can predict based on the given video URL and the aspect ratio (which affects `padding-bottom`).

Thanks to the ability to hardcode this URL to HTML transformation, the media embed feature can show previews of YouTube, Dailymotion, or Vimeo videos, and Spotify widgets without requesting any external service.

### Non-previewable media

Unfortunately, to show previews of media such as tweets, Instagram photos, or Facebook posts, the editor would need to retrieve the content of these from an external service. Some of these media providers expose [oEmbed endpoints](https://oembed.com/) but not all. These endpoint responses often require further processing to be embeddable. Most importantly, though, the media embed feature is often not able to request these services due to the [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy).

 Also, the media embed feature [does not support asynchronous preview providers](https://github.com/ckeditor/ckeditor5-media-embed/issues/16) yet. Therefore, to still allow embedding tweets or Instagram photos, we chose to:

1. Show a placeholder of the embedded media in the editor (see how a tweet is presented in the [demo](#demo) above).
2. Produce a [semantic `<oembed url="...">` tag](#semantic-data-output-default) in the data output from the editor. This output makes it possible to later use proxy services to [display the content of these media on your website](#displaying-embedded-media-on-your-website).

You can overcome these limitations with the help of proxy services like Iframely or Embedly. This is explained in the [configuration guide below](#using-external-services-for-preview).

## Configuration

### Data output format

You can configure the data output format of the feature using the {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#previewsInData `config.mediaEmbed.previewsInData`} option.

<info-box info>
	This option does not change how the media are displayed inside the editor. The previewable ones will still be displayed with previews. It only affects the output data (see below).
</info-box>

#### Semantic data output (default)

By default, the media embed feature outputs semantic `<oembed url="...">` tags for previewable and non-previewable media. That being so, it works best when the application processes (expands) the media on the server side or [directly in the frontend](#displaying-embedded-media-on-your-website), preserving the versatile database representation:

```html
<figure class="media">
	<oembed url="https://media-url"></oembed>
</figure>
```

You can achieve further customization of the semantic data output through the {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#elementName `config.mediaEmbed.elementName`} configuration. As an example, if you set `elementName` to `o-embed`:

```html
<figure class="media">
	<o-embed url="https://media-url"></o-embed>
</figure>
```

If `elementName` is overridden to something other than the default value, the existing `<oembed>` elements will still be shown for backward compatibility purposes.

#### Including previews in data

Optionally, by setting `mediaEmbed.previewsInData` to `true` you can configure the media embed feature to output media in the same way they look in the editor. If the media element is "previewable", the media preview (HTML) is saved to the database:

```html
<figure class="media">
	<div data-oembed-url="https://media-url">
		<iframe src="https://media-preview-url"></iframe>
	</div>
</figure>
```

Currently, the preview is only available for content providers for which CKEditor&nbsp;5 can predict the `<iframe>` code: YouTube, Vimeo, Dailymotion, Spotify, etc. For other providers like X (Twitter) or Instagram, the editor cannot produce an `<iframe>` code. It also does not allow retrieving this code from an external oEmbed service. Therefore, for non-previewable media, it produces the default semantic output:

```html
<figure class="media">
	<oembed url="https://media-url"></oembed>
</figure>
```

This means that, unless you [limit the list of providers](#media-providers) to only those which are previewable, you need to [make sure that the media are displayed on your website](#displaying-embedded-media-on-your-website).

Read more about [non-previewable media](#previewable-and-non-previewable-media).

### Media providers

CKEditor&nbsp;5 comes with several supported media providers that you can extend or alter.

Names of providers **with previews**:

* `'dailymotion'`,
* `'spotify'`,
* `'youtube'`,
* `'vimeo'`.

Names of providers **without previews**:

* `'instagram'`,
* `'twitter'`,
* `'googleMaps'`,
* `'flickr'`,
* `'facebook'`.

<info-box notice>
	The default media provider configuration does not support all possible media URLs &ndash; only the most common are included. Services like Iframely or Embedly support thousands of media providers. It is up to you to define which you want to allow.
</info-box>

#### Extending media providers

To extend the default list of providers, use {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#extraProviders `config.mediaEmbed.extraProviders`}.

#### Removing media providers

To remove certain providers, use {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#removeProviders `config.mediaEmbed.removeProviders`}.

For instance, to leave only the previewable providers, configure this feature as follows:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		mediaEmbed: {
			removeProviders: [ 'instagram', 'twitter', 'googleMaps', 'flickr', 'facebook' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

#### Overriding media providers

To override the default providers, use {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#providers `config.mediaEmbed.providers`} and define your set according to the {@link module:media-embed/mediaembedconfig~MediaEmbedProvider provider syntax}:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other configuration options ...
		mediaEmbed: {
			providers: [
				{
					// A URL regular expression or an array of URL regular expressions:
					url: /^example\.com\/media\/(\w+)/,

					// To be defined only if the media are previewable:
					html: match => '...'
				},
				// More providers.
				// ...
			]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

You can take inspiration from the default configuration of this feature. You can find it in [https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-media-embed/src/mediaembedediting.ts](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-media-embed/src/mediaembedediting.ts)

## Using external services for preview

To get around the limitations of showing media embed previews, you can use services like [Iframely](https://iframely.com/). This will allow a rich preview of the content inside CKEditor&nbsp;5. By inserting an Iframely-hosted `<iframe>`, you can preview the content from hundreds of media providers.

Follow the [Iframely integration with CKEditor&nbsp;5](https://iframely.com/docs/ckeditor) page for a detailed explanation. You can also check the final result in the demo below. If you are using ad-blocking software, it might also block the previews inside the editor.

{@snippet features/media-embed-preview}

## Displaying embedded media on your website

By default, the media embed feature produces output that does not contain previews of embedded media, called the [semantic output](#semantic-data-output-default). This means that you need to transform the output `<oembed>` elements into real media on your target website.

There are many ways to do that. The simplest, plug-and-play solutions are described here. You can also implement this transformation as part of your backend service or you can use different services than described in this section.

<info-box>
	While the easiest solution (described below) is to replace embedded media on the client side, it is not necessarily the most optimal way. A more powerful and flexible solution is to request these services on your backend. Refer to the documentation of the service of your choice for more information.
</info-box>

### Iframely

[Iframely](https://iframely.com) offers the [embed.js](https://iframely.com/docs/embedjs) library which converts [various media](https://iframely.com/docs/providers) URLs into rich previews. It works in the frontend and remains fully compatible with the output produced by CKEditor&nbsp;5.

First, having [secured the API key](https://iframely.com/docs/allow-origins), load the `embed.js` library from the CDN into your website:

```html
<head>
	...
	<script charset="utf-8" src="//cdn.iframe.ly/embed.js?api_key={API KEY}"></script>
	...
</head>
```

#### Semantic data

You can convert all `<oembed>` elements like the following X (Twitter) post produced by CKEditor&nbsp;5:

```html
<figure class="media">
	<oembed url="https://x.com/ckeditor/status/1021777799844126720"></oembed>
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

When you configure the feature to [include media previews](#including-previews-in-data) in the output, you can still use Iframely for media embeds like the following one:

```html
<figure class="media">
	<div data-oembed-url="https://x.com/ckeditor/status/1021777799844126720">
		[Media preview]
	</div>
</figure>
```

You can still convert this data by Iframely with just a few extra lines of code. To do that, in addition to the code snippet from the previous section, use a slightly longer code snippet that discards the media preview saved in the database before using `iframely.load()`:

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

You can convert `<oembed>` elements like the following Twitter (X) post produced by CKEditor&nbsp;5:

```html
<figure class="media">
	<oembed url="https://x.com/ckeditor/status/1021777799844126720"></oembed>
</figure>
```

using this code snippet:

```html
<script>
	document.querySelectorAll( 'oembed[url]' ).forEach( element => {
		// Create the <a href="..." class="embedly-card"></a> element that Embedly uses
		// to discover the media.
		const anchor = document.createElement( 'a' );

		anchor.setAttribute( 'href', element.getAttribute( 'url' ) );
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

## Automatic media embed on paste

By default, the {@link module:media-embed/mediaembed~MediaEmbed} plugin loads the {@link module:media-embed/automediaembed~AutoMediaEmbed} as a dependency.

The {@link module:media-embed/automediaembed~AutoMediaEmbed} plugin recognizes media links in the pasted content and embeds them shortly after they are injected into the document to speed up the editing. Just like the "traditional" embedding (using the toolbar button), automatic embedding works for all media providers specified in the [configuration](#media-providers).

<info-box>
	The media URL must be the only content pasted to be properly embedded. Multiple links (`"http://media.url http://another.media.url"`) as well as bigger chunks of content (`"This link http://media.url will not be auto–embedded when pasted."`) are ignored.
</info-box>

If the automatic embedding was unexpected, for instance when the link was meant to remain in the content as text, undo the action (by clicking the "Undo" button in the toolbar or using the <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Z</kbd> keystrokes).

## Styling media in the editor content

While the editor comes with default styles for popular media providers like Facebook, Instagram or X, you can create additional styles for non-previewable media in your editor content to help users identify them.

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
			</a>
		</div>
	</div>
</figure>
```

For example, you can create a dedicated style for media coming from the [ckeditor.com](https://ckeditor.com) domain. To do that, you will need some additional styles included in your website.

First, you must hide the generic media icon displayed for non-previewable media:

```css
.ck-media__wrapper[data-oembed-url*="ckeditor.com"] .ck-media__placeholder__icon * {
	display: none;
}
```

Then, give the media a distinctive background color:

```css
.ck-media__wrapper[data-oembed-url*="ckeditor.com"] .ck-media__placeholder {
	background: hsl(282, 44%, 47%);
}
```

and introduce the custom icon identifying the media:

```css
.ck-media__wrapper[data-oembed-url*="ckeditor.com"] .ck-media__placeholder__icon {
	background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIxMDFweCIgaGVpZ2h0PSIxMDFweCIgdmlld0JveD0iMCAwIDEwMSAxMDEiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+ICAgICAgICA8dGl0bGU+bG9nby1lY29zeXN0ZW0tM2NhYTI3MDIxODwvdGl0bGU+ICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPiAgICA8ZGVmcz48L2RlZnM+ICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPiAgICAgICAgPGcgaWQ9ImxvZ28tZWNvc3lzdGVtLTNjYWEyNzAyMTgiIGZpbGw9IiNGRkZGRkYiIGZpbGwtcnVsZT0ibm9uemVybyI+ICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZSIgZmlsbC1vcGFjaXR5PSIwIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTAxIiBoZWlnaHQ9IjEwMSI+PC9yZWN0PiAgICAgICAgICAgIDxwYXRoIGQ9Ik02NC44LDM4Ljg5MTIzODIgQzY2LjEwODU1MzgsMzkuOTE3NzU4MiA2Ny43MjMxODI2LDQwLjQ3MzI5MyA2OS4zODQ0NTk1LDQwLjQ2ODU4MzQgQzczLjQzMTIxNjIsNDAuNDY4NTgzNCA3Ni43MTE1MTM1LDM3LjI1Nzc4MTkgNzYuNzExNTEzNSwzMy4yOTUwOTE4IEM3Ni43MTE1MTM1LDI5LjMzMzAyNTIgNzMuNDMxMjE2MiwyNi4xMjA5NzY4IDY5LjM4NDQ1OTUsMjYuMTIwOTc2OCBDNjUuMzM3NzAyNywyNi4xMjA5NzY4IDYyLjA1ODAyNywyOS4zMzMwMjUyIDYyLjA1ODAyNywzMy4yOTUwOTE4IEM2Mi4wNTgwMjcsMzQuMzY0MzE5OSA2Mi4yOTY3Mjk3LDM1LjM3ODY4MzggNjIuNzI1MDI3LDM2LjI5MDE3NzMgTDU4LjM3MzA1NDEsNDAuNTUwODc5NyBDNTYuMjU3MjU2OCwzOS4xMjEwNDg1IDUzLjc2MjYxNjcsMzguMzYwMzA1NSA1MS4yMTEzNTE0LDM4LjM2NjkxMTIgQzQ4LjMzMzg2NDksMzguMzY2OTExMiA0NS42ODIwMjcsMzkuMzEwODI0NSA0My41NjEwNTQxLDQwLjg5OTM5MTkgTDM5LjY1NjY0ODYsMzcuMDc2MzU2MSBDNDAuMzc1NDcxNiwzNS45NDcwNDM1IDQwLjc1Njg0NDgsMzQuNjM0OTA3OSA0MC43NTU2NzU3LDMzLjI5NTA5MTggQzQwLjc1NTY3NTcsMjkuMzMzMDI1MiAzNy40NzUzNzg0LDI2LjEyMDk3NjggMzMuNDI4NjIxNiwyNi4xMjA5NzY4IEMyOS4zODE4NjQ5LDI2LjEyMDk3NjggMjYuMTAxNTY3NiwyOS4zMzMwMjUyIDI2LjEwMTU2NzYsMzMuMjk1MDkxOCBDMjYuMTAxNTY3NiwzNy4yNTcxNTg1IDI5LjM4MTg2NDksNDAuNDY5MjA2OSAzMy40Mjg2MjE2LDQwLjQ2OTIwNjkgQzM0Ljg0NTkxODksNDAuNDY5MjA2OSAzNi4xNjkzNTE0LDQwLjA3NTE4MjMgMzcuMjkwMTM1MSwzOS4zOTMxMjA4IEw0MS4xOTUxNjIyLDQzLjIxNjE1NjYgQzM5LjU3MjcyOTcsNDUuMjkyODkwNSAzOC42MDc5NzMsNDcuODg5NTg3MiAzOC42MDc5NzMsNTAuNzA2OTg3NiBDMzguNjA2NjIzNyw1My4yMjAyMjEzIDM5LjM4NjcwNSw1NS42NzEzMjggNDAuODM5NTk0Niw1Ny43MTkwMDM5IEwzNi40ODcsNjEuOTgwMzI5NyBDMzUuNTI1MTEwNSw2MS41NDc5NzY5IDM0LjQ4MjY4OTMsNjEuMzI1Mjc3MyAzMy40Mjg2MjE2LDYxLjMyNjk0NzIgQzI5LjM4MTg2NDksNjEuMzI2OTQ3MiAyNi4xMDE1Njc2LDY0LjUzODk5NTYgMjYuMTAxNTY3Niw2OC41MDEwNjIzIEMyNi4xMDE1Njc2LDcyLjQ2Mzc1MjQgMjkuMzgxODY0OSw3NS42NzUxNzczIDMzLjQyODYyMTYsNzUuNjc1MTc3MyBDMzcuNDc1Mzc4NCw3NS42NzUxNzczIDQwLjc1NTY3NTcsNzIuNDYzNzUyNCA0MC43NTU2NzU3LDY4LjUwMTA2MjMgQzQwLjc1NTY3NTcsNjYuODAyMTQzIDQwLjE1MjcwMjcsNjUuMjQxMDA3NyAzOS4xNDM4MTA4LDY0LjAxMjE3NDggTDQzLjA5MjM1MTQsNjAuMTQ2MTIwNCBDNDUuMjg1NDMyNCw2MS45NTYwMTQ5IDQ4LjExODE2MjIsNjMuMDQ3MDY0IDUxLjIxMDcyOTcsNjMuMDQ3MDY0IEM1NC4wODg4Mzc4LDYzLjA0NzA2NCA1Ni43NDAwNTQxLDYyLjEwMzE1MDcgNTguODYxNjQ4Niw2MC41MTM5NTk4IEw2My4xNTcwNTQxLDY0LjcxOTc5OCBDNjIuNDM4MjMxMSw2NS44NDkxMTA2IDYyLjA1Njg1NzksNjcuMTYxMjQ2MiA2Mi4wNTgwMjcsNjguNTAxMDYyMyBDNjIuMDU4MDI3LDcyLjQ2Mzc1MjQgNjUuMzM4MzI0Myw3NS42NzUxNzczIDY5LjM4NDQ1OTUsNzUuNjc1MTc3MyBDNzMuNDMxMjE2Miw3NS42NzUxNzczIDc2LjcxMTUxMzUsNzIuNDYzNzUyNCA3Ni43MTE1MTM1LDY4LjUwMTA2MjMgQzc2LjcxMTUxMzUsNjQuNTM4OTk1NiA3My40MzEyMTYyLDYxLjMyNjk0NzIgNjkuMzg0NDU5NSw2MS4zMjY5NDcyIEM2Ny45NjcxNjIyLDYxLjMyNjk0NzIgNjYuNjQ0MzUxNCw2MS43MjA5NzE4IDY1LjUyMjk0NTksNjIuNDAzNjU2OCBMNjEuMjI3NTQwNSw1OC4xOTc4MTg2IEM2Mi44NDk5NzMsNTYuMTIwNDYxMiA2My44MTQxMDgxLDUzLjUyMzc2NDUgNjMuODE0MTA4MSw1MC43MDY5ODc2IEM2My44MTQxMDgxLDQ3LjY3ODIzNTUgNjIuNzAwMTYyMiw0NC45MDUxMDA1IDYwLjg1MTQ1OTUsNDIuNzU3OTE2IEw2NC44LDM4Ljg5MTIzODIgWiBNNTUuOTc5MTg5MiwxLjMwNjc4MDg3IEw5Mi4wMjA4MTA4LDIxLjY4MDcxODkgQzk1LjEwMTU2NzYsMjMuNDIyNjU2NiA5NywyNi42NDIxODY1IDk3LDMwLjEyNjA2MTkgTDk3LDcwLjg3MzkzODEgQzk3LDc0LjM1NzgxMzUgOTUuMTAxNTY3Niw3Ny41NzczNDM0IDkyLjAyMDgxMDgsNzkuMzE5MjgxMSBMNTUuOTc5MTg5Miw5OS42OTM4NDI2IEM1Mi44ODY4MTA4LDEwMS40MzUzODYgNDkuMTEzMTg5MiwxMDEuNDM1Mzg2IDQ2LjAyMDgxMDgsOTkuNjkzODQyNiBMOS45NzkxODkxOSw3OS4zMTkyODExIEM2Ljg5ODQzMjQzLDc3LjU3NzM0MzQgNSw3NC4zNTc4MTM1IDUsNzAuODczOTM4MSBMNSwzMC4xMjYwNjE5IEM1LDI2LjY0MjE4NjUgNi44OTg0MzI0MywyMy40MjI2NTY2IDkuOTc5MTg5MTksMjEuNjgwNzE4OSBMNDYuMDIwODEwOCwxLjMwNjE1NzQxIEM0OS4xMTMxODkyLC0wLjQzNTM4NTgwMyA1Mi44ODY4MTA4LC0wLjQzNTM4NTgwMyA1NS45NzkxODkyLDEuMzA2MTU3NDEgTDU1Ljk3OTE4OTIsMS4zMDY3ODA4NyBaIE01MS4yMTEzNTE0LDU5Ljc5NjM2MTMgQzQ2LjA4NDIxNjIsNTkuNzk2MzYxMyA0MS45MjgwNTQxLDU1LjcyNzA2MDEgNDEuOTI4MDU0MSw1MC43MDYzNjQxIEM0MS45MjgwNTQxLDQ1LjY4NjkxNTEgNDYuMDg0MjE2Miw0MS42MTY5OTA0IDUxLjIxMTM1MTQsNDEuNjE2OTkwNCBDNTYuMzM4NDg2NSw0MS42MTY5OTA0IDYwLjQ5NDY0ODYsNDUuNjg2OTE1MSA2MC40OTQ2NDg2LDUwLjcwNjk4NzYgQzYwLjQ5NDY0ODYsNTUuNzI3MDYwMSA1Ni4zMzg0ODY1LDU5Ljc5Njk4NDcgNTEuMjExMzUxNCw1OS43OTY5ODQ3IEw1MS4yMTEzNTE0LDU5Ljc5NjM2MTMgWiBNNjkuMzg0NDU5NSw3Mi40MjUwOTgxIEM2Ny4xNzE0ODY1LDcyLjQyNTA5ODEgNjUuMzc3NDg2NSw3MC42NjgxOTc0IDY1LjM3NzQ4NjUsNjguNTAxMDYyMyBDNjUuMzc3NDg2NSw2Ni4zMzQ1NTA2IDY3LjE3MTQ4NjUsNjQuNTc3NjQ5OSA2OS4zODQ0NTk1LDY0LjU3NzY0OTkgQzcxLjU5NzQzMjQsNjQuNTc3NjQ5OSA3My4zOTIwNTQxLDY2LjMzNDU1MDYgNzMuMzkyMDU0MSw2OC41MDEwNjIzIEM3My4zOTIwNTQxLDcwLjY2ODE5NzQgNzEuNTk4MDU0MSw3Mi40MjUwOTgxIDY5LjM4NDQ1OTUsNzIuNDI1MDk4MSBaIE0zMy40Mjg2MjE2LDcyLjQyNTA5ODEgQzMxLjIxNTY0ODYsNzIuNDI1MDk4MSAyOS40MjE2NDg2LDcwLjY2ODE5NzQgMjkuNDIxNjQ4Niw2OC41MDEwNjIzIEMyOS40MjE2NDg2LDY2LjMzNDU1MDYgMzEuMjE1NjQ4Niw2NC41Nzc2NDk5IDMzLjQyODYyMTYsNjQuNTc3NjQ5OSBDMzUuNjQxNTk0Niw2NC41Nzc2NDk5IDM3LjQzNTU5NDYsNjYuMzM0NTUwNiAzNy40MzU1OTQ2LDY4LjUwMTA2MjMgQzM3LjQzNTU5NDYsNzAuNjY4MTk3NCAzNS42NDE1OTQ2LDcyLjQyNTA5ODEgMzMuNDI4NjIxNiw3Mi40MjUwOTgxIFogTTMzLjQyODYyMTYsMzcuMjE4NTA0MiBDMzEuMjE1NjQ4NiwzNy4yMTg1MDQyIDI5LjQyMTY0ODYsMzUuNDYyMjI2OSAyOS40MjE2NDg2LDMzLjI5NTA5MTggQzI5LjQyMTY0ODYsMzEuMTI3OTU2NyAzMS4yMTU2NDg2LDI5LjM3MTY3OTUgMzMuNDI4NjIxNiwyOS4zNzE2Nzk1IEMzNS42NDE1OTQ2LDI5LjM3MTY3OTUgMzcuNDM1NTk0NiwzMS4xMjc5NTY3IDM3LjQzNTU5NDYsMzMuMjk1MDkxOCBDMzcuNDM1NTk0NiwzNS40NjIyMjY5IDM1LjY0MTU5NDYsMzcuMjE4NTA0MiAzMy40Mjg2MjE2LDM3LjIxODUwNDIgWiBNNjkuMzg0NDU5NSwzNy4yMTg1MDQyIEM2Ny4xNzE0ODY1LDM3LjIxODUwNDIgNjUuMzc3NDg2NSwzNS40NjIyMjY5IDY1LjM3NzQ4NjUsMzMuMjk1MDkxOCBDNjUuMzc3NDg2NSwzMS4xMjc5NTY3IDY3LjE3MTQ4NjUsMjkuMzcxNjc5NSA2OS4zODQ0NTk1LDI5LjM3MTY3OTUgQzcxLjU5NzQzMjQsMjkuMzcxNjc5NSA3My4zOTIwNTQxLDMxLjEyNzk1NjcgNzMuMzkyMDU0MSwzMy4yOTUwOTE4IEM3My4zOTIwNTQxLDM1LjQ2MjIyNjkgNzEuNTk4MDU0MSwzNy4yMTg1MDQyIDY5LjM4NDQ1OTUsMzcuMjE4NTA0MiBaIiBpZD0iU2hhcGUiPjwvcGF0aD4gICAgICAgIDwvZz4gICAgPC9nPjwvc3ZnPg==);
}
```

Finally, make sure the URL in the placeholder has the right contrast:

```css
.ck-media__wrapper[data-oembed-url*="ckeditor.com"] .ck-media__placeholder__url .ck-media__placeholder__url__text {
	color: hsl(282, 100%, 93%);
}

.ck-media__wrapper[data-oembed-url*="ckeditor.com"] .ck-media__placeholder__url .ck-media__placeholder__url__text:hover {
	color: hsl(0, 100%, 100%);
}
```

Before you load the data, make sure the `ckeditor.com` provider is [enabled in your configuration](#extending-media-providers). In its most basic form it could look like this:

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

Having your styles defined and the media provider configured, insert the new media into your editor, for example, the following URL: `https://ckeditor.com/path/to/media`. You should see something like this:

{@img assets/img/features-media-embed-ckeditor.png 791 The example media style of the media}

## Common API

The {@link module:media-embed/mediaembed~MediaEmbed} plugin registers:
* the `'mediaEmbed'` UI button component,
* the `'mediaEmbed'` command implemented by {@link module:media-embed/mediaembedcommand~MediaEmbedCommand}.

	You can insert a new media element or update the selected media URL by executing the following code:

	```js
	editor.execute( 'mediaEmbed', 'http://url.to.the/media' );
	```

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-media-embed](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-media-embed).
