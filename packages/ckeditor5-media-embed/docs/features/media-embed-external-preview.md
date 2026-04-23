---
category: features-media-embed
menu-title: External services
meta-title: Using external services for media previews | CKEditor 5 Documentation
meta-description: Use Iframely or Embedly to show media previews inside CKEditor 5 and to render media from the editor's output on your target website.
order: 40
---

# Using external services for media previews

You can use proxy services like [Iframely](https://iframely.com/) or [Embedly](https://embed.ly/) for two related purposes:

* To show previews of non-previewable providers (X, Instagram, Facebook, and others) **inside the editor**.
* To render the `<oembed>` tags produced by CKEditor&nbsp;5 as rich previews **on your target website**.

Both use the same underlying services but are set up in different places.

## In the editor

To get around the limitations of showing media embed previews, you can use services like [Iframely](https://iframely.com/). This will allow a rich preview of the content inside CKEditor&nbsp;5. By inserting an Iframely-hosted `<iframe>`, you can preview the content from hundreds of media providers.

Follow the [Iframely integration with CKEditor&nbsp;5](https://iframely.com/docs/ckeditor) page for a detailed explanation. You can also check the final result in the demo below. If you are using ad-blocking software, it might also block the previews inside the editor.

{@snippet features/media-embed-preview}

## On your website

By default, the media embed feature produces output that does not contain previews of embedded media, called the {@link features/media-embed-configuration#semantic-data-output-default semantic output}. This means that you need to transform the output `<oembed>` elements into real media on your target website.

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

When you configure the feature to {@link features/media-embed-configuration#including-previews-in-data include media previews} in the output, you can still use Iframely for media embeds like the following one:

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
