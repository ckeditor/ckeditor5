---
category: features-media-embed
menu-title: Configuration
meta-title: Media embed configuration | CKEditor 5 Documentation
meta-description: Configure the media embed data output format and extend, remove, or override the default media providers.
order: 30
---

# Media embed configuration

You can configure the data output format and the list of supported media providers used by the {@link module:media-embed/mediaembed~MediaEmbed} plugin.

## Data output format

You can configure the data output format of the feature using the {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#previewsInData `config.mediaEmbed.previewsInData`} option.

<info-box info>
	This option does not change how the media are displayed inside the editor. The previewable ones will still be displayed with previews. It only affects the output data (see below).
</info-box>

### Semantic data output (default)

By default, the media embed feature outputs semantic `<oembed url="...">` tags for previewable and non-previewable media. That being so, it works best when the application processes (expands) the media on the server side or {@link features/media-embed-external-preview directly in the frontend}, preserving the versatile database representation:

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

### Including previews in data

Optionally, by setting `mediaEmbed.previewsInData` to `true` you can configure the media embed feature to output media in the same way they look in the editor. If the media element is "previewable," the media preview (HTML) is saved to the database:

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

This means that, unless you [limit the list of providers](#media-providers) to only those that are previewable, you need to {@link features/media-embed-external-preview make sure that the media are displayed on your website}.

Read more about {@link features/media-embed#previewable-and-non-previewable-media non-previewable media}.

## Media providers

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

### Extending media providers

To extend the default list of providers, use {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#extraProviders `config.mediaEmbed.extraProviders`}.

### Removing media providers

To remove certain providers, use {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#removeProviders `config.mediaEmbed.removeProviders`}.

For instance, to leave only the previewable providers, configure this feature as follows:

```js
ClassicEditor
	.create( {
		// ... Other configuration options ...
		mediaEmbed: {
			removeProviders: [ 'instagram', 'twitter', 'googleMaps', 'flickr', 'facebook' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Overriding media providers

To override the default providers, use {@link module:media-embed/mediaembedconfig~MediaEmbedConfig#providers `config.mediaEmbed.providers`} and define your set according to the {@link module:media-embed/mediaembedconfig~MediaEmbedProvider provider syntax}:

```js
ClassicEditor
	.create( {
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
