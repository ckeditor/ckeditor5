---
category: setup
menu-title: Content Security Policy (CSP)
meta-title: Content Security Policy | CKEditor 5 Documentation
meta-description: Learn which Content Security Policy (CSP) directives CKEditor 5 needs, and how to run the editor in applications that enforce Trusted Types.
order: 110
modified_at: 2026-09-21
---

# Content Security Policy

CKEditor&nbsp;5 is compatible with applications that use [<abbr title="Content Security Policy">CSP</abbr> rules](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) and helps developers build a secure web.

## Recommended CSP configuration for Cloud deployments

The recommended CSP configuration for {@link getting-started/licensing/usage-based-billing#cloud-hosted Cloud deployments} that allows the rich-text editor to run out–of–the–box with all standard features using the content like images or media from external hosts looks as follows:

```plain
default-src 'none'; connect-src 'self'; script-src 'self' https://cdn.ckeditor.com https://proxy-event.ckeditor.com ; img-src * data:; style-src 'self' 'unsafe-inline'; frame-src *
```

## Recommended CSP configuration for self-hosted deployments

The recommended CSP configuration for self-hosted deployments (npm/ZIP) that allows the rich-text editor to run out–of–the–box with all standard features using the content like images or media from external hosts looks as follows:

```plain
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

	**Note**: Inline styles are also required when using {@link features/lists-properties#list-item-marker-formatting list item marker formatting}. For example, if you apply font color, size, or family to list markers, the editor uses inline style attributes to render them. Because of this, `unsafe-inline` must be allowed for the styles to display correctly.

* `frame-src *`: Necessary for the {@link features/media-embed media embed} feature to load media with previews (containing `<iframe>`).

	**Note**: Use the more strict `frame-src 'self'` if all the media in the edited content come from the same domain as your application.

<info-box>
	A different set of Content Security Policy directives might be necessary to run {@link features/ckfinder CKFinder} along with CKEditor&nbsp;5. Check out the file manager [documentation](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/guide/dev_integration-section-csp-directives-required-by-ckfinder) to learn more.
</info-box>

## Strictest working configuration

Knowing the role of each directive, the strictest set of rules that allows CKEditor&nbsp;5 to run is as follows:

```plain
default-src 'none'; connect-src 'self'; script-src 'self'; img-src 'self'; style-src 'self'; frame-src 'self'
```

This comes with some trade–offs, though. For example, it requires you to:

* Load images in the content from the same host.
* Load previewable media in the content from the same host.
* Give up certain features that use inline styles like {@link features/font font} or {@link features/text-alignment text alignment}.
* Give up pasting images from the clipboard or {@link features/paste-from-office from Office}.

## Trusted Types

[Trusted Types](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API) is a browser mechanism against DOM-based XSS. It applies to DOM injection sinks: the properties and methods that turn a string into live HTML, such as `innerHTML`, `insertAdjacentHTML()` or `DOMParser#parseFromString()`. Under Trusted Types, a sink rejects a plain string and accepts only a value produced by a policy that the application allows.

CKEditor&nbsp;5 supports running in applications that enforce Trusted Types. The editor creates a single policy named `ckeditor5` and passes through it every piece of markup that it writes to a sink.

### Enabling Trusted Types

Add two directives to the Content Security Policy that your application sends:

```plain
require-trusted-types-for 'script'; trusted-types ckeditor5 lit-html;
```

The first directive turns the mechanism on. The second one lists the policy names that the browser allows. Add both names below to any that your application already lists:

* `ckeditor5` &ndash; the policy of the editor.
* `lit-html` &ndash; a policy that the {@link features/uploadcare Uploadcare} file uploader creates. It does not come from the editor. Add it whenever your build **contains** that feature. The ready-made premium features bundle always contains it.

<info-box warning>
	Under enforcement, the editor cannot recover from a refused policy. The failure happens as soon as the browser loads the editor's code, so no editor is created, and the console names the policy that was refused. What differs is which code reports it.

	* Without `ckeditor5`, the editor also logs the `trusted-types-policy-creation-failed` warning, because it creates that policy itself and catches the refusal.
	* Without `lit-html`, only the browser reports it, because the editor does not create that policy and never sees the refusal.

	A policy is also refused when your application already created one with the same name, even though the name is listed. An application that uses Lit itself can hit this, because the premium features bundle brings its own copy. To allow the same name twice, add `'allow-duplicates'` to the `trusted-types` directive.
</info-box>

### Trusted Types and content safety

The policy of the editor returns every string unchanged. It makes the browser accept the markup that the editor writes, and it does not inspect, clean, or filter anything. Turning Trusted Types on therefore does not make the editor filter content, and the responsibility for the safety of the data loaded into the editor stays with your application, exactly as before.

This matters most for the {@link features/html-embed HTML embed} feature. When it is configured to show previews, the browser runs whatever the embedded snippets contain. Trusted Types does not change that, and the {@link module:html-embed/htmlembedconfig~HtmlEmbedConfig#sanitizeHtml `config.htmlEmbed.sanitizeHtml`} option remains the way to control it.

### Detecting Trusted Types enforcement

To find out whether your application enforces Trusted Types, the editor writes to a sink once and checks whether the browser refuses the value. There is no other reliable way to tell.

The editor catches the refusal, but the browser still logs an error of its own and reports a CSP violation. In Chrome it reads `This document requires 'TrustedHTML' assignment`, and other browsers word it differently. This happens once per page, the first time the editor runs that check. **Nothing is broken by it.**

### Known limitations

Three features are affected when your application enforces Trusted Types. All three come from third-party code that writes HTML the editor cannot route through its policy.

In the first two cases, the editor turns the feature off and logs a warning instead of letting it fail:

1. **The color picker**, everywhere it appears: {@link features/font font color and font background color} and {@link features/tables-styling table properties and table cell properties}. The color palettes and the document colors are not affected, so users keep every predefined color and lose only the custom ones. The editor logs `color-picker-unavailable-with-trusted-types` once for every color selector that it creates. To turn the picker off yourself and stop the warning, set the `colorPicker` option of each of those features to `false`.
2. **The Uploadcare dialog and image editor.** Uploading files by pasting or dropping them keeps working. What is unavailable is the dialog that the toolbar button opens and the image editor. The editor logs `uploadcare-unavailable-with-trusted-types` once while it starts.

The third case is different because it is an error on ordinary content rather than a feature switched off:

3. **Markdown that contains a named character reference**, such as `&nbsp;` or `&amp;`. Parsing such content fails, while Markdown without character references works. This affects every feature that parses Markdown, not only {@link features/markdown Markdown output}.

### Using the `trustedHtml()` helper

To keep your own plugins and UI working under Trusted Types, pass the HTML they write to the DOM through the {@link module:utils/dom/trustedtypes~trustedHtml `trustedHtml()`} helper, which is safe to call in any browser:

```js
import { trustedHtml } from 'ckeditor5';

element.innerHTML = trustedHtml( '<p>Hello world!</p>' );
```

<info-box warning>
	`trustedHtml()` marks as trusted whatever it receives, and it checks nothing. Use it only for markup that your own code produced. Never pass it content that comes from a user, from a server response, or from any other outside source. Sanitize such content first.
</info-box>
