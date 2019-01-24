---
# Scope:
# * Guide developers through the Content Security Policy directives that have an impact on the editor.
# * List the recommended Content Security Policy settings.
# * List the minimal Content Security Policy settings.

category: builds-integration
order: 70
---

# Content Security Policy

CKEditor 5 is compatible with applications that use [<abbr title="Content Security Policy">CSP</abbr> rules](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) and helps developers build secure web.

## Recommended CSP configuration

The recommended CSP configuration that allows the rich text editor to run out–of–the–box with all standard features using the content like images or media from external hosts looks as follows:

```
default-src 'none'; connect-src 'self; script-src 'self'; img-src * data:; style-src 'self' 'unsafe-inline'; frame-src *
```

## Impact of CSP on editor features

Some CSP directives have an impact on certain rich text editor features. Here's the round-up of directives and their specific roles in the editor:

* `default-src 'none'`: resets the policy and blocks everything. All successive directives work as a white–list. By itself, as long as followed by other directives, it has no impact on the editor.
* `connect-src 'self'`
	* Allows the [editor upload features](https://ckeditor.com/docs/ckeditor5/latest/features/image-upload/image-upload.html) to use XMLHttpReqests (AJAX) to upload files to the server, for instance when an image is pasted or dropped into the editor content. The `'self`' value ensures the requests remain within the same host.
	* Allows [auto–saving editor data](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/saving-data.html#autosave-feature) using XMLHttpReqests.

	**Note**: To use [CKFinder](https://ckeditor.com/docs/ckeditor5/latest/features/image-upload/ckfinder.html) hosted from another domain, make sure the domain is also included in the directive value.

	**Note**: To use [CKEditor Cloud Services](https://ckeditor.com/docs/cs/latest/guides/overview.html), include the `http://*.cke-cs.com` domain in the `connect-src` directive, for instance `connect-src 'self' http://*.cke-cs.com`.
* `script-src 'self'`: allows the execution of JavaScript from the current host only and can be applied only if the CKEditor 5 script file (`<script src="[ckeditor-build-path]/ckeditor.js"></script>`) is also served from that host.

    **Note**: If CKEditor 5 is served from another host, for instance the [official CDN](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/installation.html#cdn), make sure the value of `script-src` includes that host (`script-src 'self' https://cdn.ckeditor.com`).

    **Note**: To use [CKFinder](https://ckeditor.com/docs/ckeditor5/latest/features/image-upload/ckfinder.html) hosted from another domain, make sure the domain is also included in the directive value.
* `img-src * data:`
	* The `*` directive value allows images in the editor content to come from any hosts.
	* The `data:` value allows:
		* [pasting images from the clipboard](https://ckeditor.com/docs/ckeditor5/latest/features/image-upload/image-upload.html)  and [from Word](https://ckeditor.com/docs/ckeditor5/latest/features/paste-from-word.html) into editor content. Pasted images are usually represented as Base64–encoded strings (`<img src="data:..." />`) and without `data:` they cannot be displayed and uploaded.
		* displaying the [Media embed](https://ckeditor.com/docs/ckeditor5/latest/features/media-embed.html) feature placeholders for the inserted media.

    **Note**: Use the more strict `img-src 'self'` if all images in the editor content are hosted from the same domain and you do **not** want to enable the [Media embed]((https://ckeditor.com/docs/ckeditor5/latest/features/media-embed.html) and [Paste from Word](https://ckeditor.com/docs/ckeditor5/latest/features/paste-from-word.html) features.
* `style-src 'self' 'unsafe-inline'`
	* `'unsafe-inline'` is necessary for webpack's [style-loader](https://github.com/webpack-contrib/style-loader) to load [editor UI styles](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/ui/theme-customization.html#styles-processing-and-bundling).
	    **Note**: You can [extract styles to a separate `.css` file](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/advanced-setup.html#option-extracting-css) during the editor building process and remove this directive.
	* `'unsafe-inline'` is necessary for certain editor content styles to work properly. For instance, you are going to need it if you want to enable editor features like [Font](https://ckeditor.com/docs/ckeditor5/latest/features/font.html) or [Text alignment](https://ckeditor.com/docs/ckeditor5/latest/features/text-alignment.html) or any other feature that uses inline `style="..."` attributes in the content.
* `frame-src *`: Necessary for the [Media embed]((https://ckeditor.com/docs/ckeditor5/latest/features/media-embed.html) feature to load media with previews (containing `<iframe>`).

    **Note**: Use the more strict `frame-src 'self'` if all the media in the edited content come from the same domain as your application.

## Minimal configuration

Knowing the role of each directive, the most strict set of rules that allows CKEditor 5 to run is as follows:

```
default-src 'none'; connect-src 'self'; script-src 'self'; img-src 'self'; style-src 'self'; frame-src 'self'
```

but it comes with some trade–offs, for instance it requires you to:

* use an editor build with the [styles extracted to the separate file]((https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/advanced-setup.html#option-extracting-css) (no style-loader),
* load images in the content from the same host,
* load previewable media in the content from the same host,
* give up certain features that use inline styles like [Font](https://ckeditor.com/docs/ckeditor5/latest/features/font.html) or [Text alignment](https://ckeditor.com/docs/ckeditor5/latest/features/text-alignment.html),
* give up pasting images from the clipboard or [from Word](https://ckeditor.com/docs/ckeditor5/latest/features/paste-from-word.html),
