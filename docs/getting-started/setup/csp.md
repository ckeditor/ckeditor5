---
category: setup
meta-title: Content Security Policy | CKEditor 5 Documentation
meta-description: Learn about the CKEditor 5 Content Security Policy (CSP).
menu-title: Content Security Policy (CSP)
order: 110
---

# Content Security Policy

CKEditor&nbsp;5 is compatible with applications that use [<abbr title="Content Security Policy">CSP</abbr> rules](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) and helps developers build a secure web.

## Recommended CSP configuration for Cloud deployments

The recommended CSP configuration for {@link getting-started/licensing/usage-based-billing#cloud-hosted Cloud deployments} that allows the rich-text editor to run out–of–the–box with all standard features using the content like images or media from external hosts looks as follows:

```
default-src 'none'; connect-src 'self'; script-src 'self' https://cdn.ckeditor.com https://proxy-event.ckeditor.com ; img-src * data:; style-src 'self' 'unsafe-inline'; frame-src *
```

## Recommended CSP configuration for self-hosted deployments

The recommended CSP configuration for self-hosted deployments (npm/ZIP) that allows the rich-text editor to run out–of–the–box with all standard features using the content like images or media from external hosts looks as follows:

```
default-src 'none'; connect-src 'self'; script-src 'self'; img-src * data:; style-src 'self' 'unsafe-inline'; frame-src *
```

## Impact of CSP on editor features

Some CSP directives have an impact on certain rich-text editor features. Here is the round-up of directives and their specific roles in the editor:

* `default-src 'none'`: Resets the policy and blocks everything. All successive directives work as a whitelist. By itself, as long as it is followed by other directives, it has no impact on the editor.
* `connect-src 'self'`
	* Allows the {@link features/image-upload editor upload features} to use [`XMLHttpReqests`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) (Ajax) to upload files to the server, for instance, when an image is pasted or dropped into the editor content. The `'self`' value ensures the requests remain within the same host.
	* Allows {@link features/autosave auto–saving editor data} using `XMLHttpRequest`.

	**Note**: To use [CKEditor Cloud Services](https://ckeditor.com/ckeditor-cloud-services/), include the `http://*.cke-cs.com` domain in the `connect-src` directive, for instance: `connect-src 'self' http://*.cke-cs.com`.
* `script-src 'self'`: Allows the execution of JavaScript from the current host only and can be applied only if the CKEditor&nbsp;5 script file (`<script src="[ckeditor-build-path]/ckeditor.js"></script>`) is also served from that host.

	**Note**: If CKEditor&nbsp;5 is served from {@link getting-started/licensing/usage-based-billing#cloud-hosted Cloud}, make sure the value of `script-src` includes the required hosts, one for the CDN, and one for the {@link getting-started/licensing/usage-based-billing#license-check-and-usage-data license check server}: `script-src 'self' https://cdn.ckeditor.com https://proxy-event.ckeditor.com`.
* `img-src * data:`
	* The `*` directive value allows images in the editor content to come from any hosts.
	* The `data:` value allows:
		* Pasting {@link features/image-upload images from the clipboard} and {@link features/paste-from-office from MS Office} into the editor content. Pasted images are usually represented as Base64–encoded strings (`<img src="data:..." />`) and without `data:` they cannot be displayed and uploaded.
		* Displaying the {@link features/media-embed media embed} feature placeholders for the inserted media.

	**Note**: Use the more strict `img-src 'self'` if all images in the editor content are hosted from the same domain and you do **not** want to enable the {@link features/media-embed media embed} and {@link features/paste-from-office paste from Word} features.
* `style-src 'self' 'unsafe-inline'`:
	* The `self` directive allows to load styles from the site's own domain. Since v42.0.0, the editor {@link getting-started/setup/css distributes its stylesheets}. If you need to load styles from some other domain, add them explicitly: `style-src https://trusted-styles.example.com;`.
	* The directive `unsafe-inline` is required to make the styles of certain features work properly. For instance, you are going to need it if you want to enable such editor features as {@link features/font font} or {@link features/text-alignment text alignment} or any other feature that uses the inline `style="..."` attributes in the content.
* `frame-src *`: Necessary for the {@link features/media-embed media embed} feature to load media with previews (containing `<iframe>`).

	**Note**: Use the more strict `frame-src 'self'` if all the media in the edited content come from the same domain as your application.

<info-box>
	A different set of Content Security Policy directives might be necessary to run {@link features/ckfinder CKFinder} along with CKEditor&nbsp;5. Check out the file manager [documentation](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/guide/dev_integration-section-csp-directives-required-by-ckfinder) to learn more.
</info-box>

## Strictest working configuration

Knowing the role of each directive, the strictest set of rules that allows CKEditor&nbsp;5 to run is as follows:

```
default-src 'none'; connect-src 'self'; script-src 'self'; img-src 'self'; style-src 'self'; frame-src 'self'
```

This comes with some trade–offs, though. For example, it requires you to:

* Load images in the content from the same host.
* Load previewable media in the content from the same host.
* Give up certain features that use inline styles like {@link features/font font} or {@link features/text-alignment text alignment}.
* Give up pasting images from the clipboard or {@link features/paste-from-office from Office}.
