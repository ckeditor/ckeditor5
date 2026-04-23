---
category: features-media-embed
menu-title: Basics
meta-title: Media embed | CKEditor 5 Documentation
meta-description: Embed rich media content like videos and social media posts in CKEditor 5 to enhance engagement and interactivity in your documents.
modified_at: 2021-10-08
order: 10
---

{@snippet features/build-media-source empty}

# Media embed

The media embed feature lets you insert embeddable media such as YouTube or Vimeo videos and tweets into your rich text content.

## Demo

You can use the insert media button in the toolbar {@icon @ckeditor/ckeditor5-icons/theme/icons/media.svg Insert media} to embed media. You can also paste a media URL directly into the editor content, and it will be [automatically embedded](#automatic-media-embed-on-paste). Try both approaches with the following URLs:

<ck:preload-svg-spritesheet-icon icon='link' />

* <ck:input class="example-input" type="text" value="https://www.youtube.com/watch?v=H08tGjXNHO4" icon='link' expanded readonly />
* <ck:input class="example-input" type="text" value="https://open.spotify.com/album/2IXlgvecaDqOeF3viUZnPI?si=ogVw7KlcQAGZKK4Jz9QzvA" icon='link' expanded readonly />
* <ck:input class="example-input" type="text" value="https://www.instagram.com/p/BmMZgokAGGQ/?taken-by=nasa" icon='link' expanded readonly />

{@snippet features/media-embed}

<snippet-footer>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</snippet-footer>

## Installation

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, MediaEmbed } from 'ckeditor5';

ClassicEditor
	.create( {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ MediaEmbed, /* ... */ ],
		toolbar: [ 'mediaEmbed', /* ... */ ],
		mediaEmbed: {
			// Configuration.
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

<info-box>
	Depending on how you will configure this feature, you may need to use services like [Iframely](https://iframely.com/) or [Embedly](https://embed.ly/) to display content of embedded media on your target website. Read more about {@link features/media-embed-external-preview displaying embedded media}.
</info-box>

## Media embed features

The [`@ckeditor/ckeditor5-media-embed`](https://www.npmjs.com/package/@ckeditor/ckeditor5-media-embed) package contains multiple plugins that implement media-related features:

* {@link features/media-embed-configuration Configuration} &ndash; set the data output format and extend, remove, or override the default media providers.
* {@link features/media-embed-external-preview External services} &ndash; use Iframely or Embedly to render rich previews inside the editor and on your target website.
* {@link features/media-embed-resize Resizing media embeds} &ndash; enable drag-to-resize handles for media widgets (premium).
* {@link features/media-embed-styles Styling media} &ndash; create dedicated styles for specific non-previewable media providers.

## Previewable and non-previewable media

When the media embed feature is asked to embed a specific media element via its URL it needs to make a decision how the media will be displayed in the editor.

### Previewable media

If, for instance, the URL to embed is `https://www.youtube.com/watch?v=H08tGjXNHO4`, the feature can predict that it needs to produce the following HTML to show this YouTube video:

```html
<iframe src="https://www.youtube.com/embed/${ videoId }"
	width="1280" height="720"
	style="width: 100%; height: auto; aspect-ratio: 16 / 9; border: 0; display: block;"
	frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
</iframe>
```

The CSS `aspect-ratio` property keeps the video responsive while the HTML `width` and `height` attributes provide an intrinsic size so the iframe behaves well in table cells and other layout contexts. The crucial part is the iframe element's `src` which the media embed feature predicts based on the given video URL.

Thanks to the ability to hardcode this URL to HTML transformation, the media embed feature can show previews of YouTube, Dailymotion, or Vimeo videos, and Spotify widgets without requesting any external service.

### Non-previewable media

Unfortunately, to show previews of media such as tweets, Instagram photos, or Facebook posts, the editor would need to retrieve the content of these from an external service. Some of these media providers expose [oEmbed endpoints](https://oembed.com/) but not all. These endpoint responses often require further processing to be embeddable. Most importantly, though, the media embed feature is often not able to request these services due to the [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy).

 Also, the media embed feature [does not support asynchronous preview providers](https://github.com/ckeditor/ckeditor5-media-embed/issues/16) yet. Therefore, to still allow embedding tweets or Instagram photos, we chose to:

1. Show a placeholder of the embedded media in the editor (see how a tweet is presented in the [demo](#demo) above).
2. Produce a {@link features/media-embed-configuration#semantic-data-output-default semantic `<oembed url="...">` tag} in the data output from the editor. This output makes it possible to later use proxy services to {@link features/media-embed-external-preview display the content of these media on your website}.

You can overcome these limitations with the help of proxy services like Iframely or Embedly. See {@link features/media-embed-external-preview Using external services for media previews}.

## Automatic media embed on paste

By default, the {@link module:media-embed/mediaembed~MediaEmbed} plugin loads the {@link module:media-embed/automediaembed~AutoMediaEmbed} as a dependency.

The {@link module:media-embed/automediaembed~AutoMediaEmbed} plugin recognizes media links in the pasted content and embeds them shortly after they are injected into the document to speed up the editing. Just like the "traditional" embedding (using the toolbar button), automatic embedding works for all media providers specified in the {@link features/media-embed-configuration#media-providers configuration}.

<info-box>
	The media URL must be the only content pasted to be properly embedded. Multiple links (`"http://media.url http://another.media.url"`) as well as bigger chunks of content (`"This link http://media.url will not be auto–embedded when pasted."`) are ignored.
</info-box>

If the automatic embedding was unexpected, for instance when the link was meant to remain in the content as text, undo the action (by clicking the "Undo" button in the toolbar or using the <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Z</kbd> keystrokes).

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
