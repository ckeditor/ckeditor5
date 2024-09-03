---
category: setup
meta-title: HTML security | CKEditor 5 documentation
order: 110
---

# HTML security

While creating and editing the HTML content, it is important to prevent the execution of any malicious code. This guide describes how to secure the editor from this happening.

## Data loading

The data provided at the editor initialization is by default stripped out of any potentially harmful content. You don't have to provide any additional security measures here.

## Features previewing the HTML snippets

If you configure the HTML embed feature to {@link features/html-embed#content-previews show content previews} or the merge fields feature to render the {@link features/merge-fields#using-html-tags-in-merge-fields-values values defined as HTML strings}, the HTML is then rendered to the user. If the HTML was rendered as-is, **the browser would execute any JavaScript code included in these HTML snippets in the context of your website**.

This, in turn, is a plain security risk (especially in HTML embed feature, where user can input any content). The HTML provided by the user might be mistakenly copied from a malicious website. It could also end up in the user's clipboard (as it would usually be copied and pasted) by any other means.

You can instruct some advanced users to never use the HTML code from untrusted sources. However, in most cases, it is highly recommended to secure the editor by setting an HTML sanitizer and, optionally, by setting strict {@link getting-started/setup/csp Content Security Policy (CSP) rules}.

<info-box>
	The tricky part is that some HTML snippets require executing JavaScript to render any meaningful previews (for example, Facebook embeds). Some, in turn, do not make sense to execute (like analytics code).

	Therefore, when configuring the sanitizer and CSP rules, you can take these situations into consideration and for instance, allow `<script>` tags pointing only to certain domains (like a trusted external page that requires JavaScript).
</info-box>

### Configuring the sanitizer function

The {@link module:core/editor/editorconfig~EditorConfig#sanitizeHtml `config.sanitizeHtml`} option allows for plugging an external sanitizer.

Some popular JavaScript libraries that you can use include [`sanitize-html`](https://www.npmjs.com/package/sanitize-html) and [`DOMPurify`](https://www.npmjs.com/package/dompurify).

The default settings of these libraries usually strip all potentially malicious content including `<iframe>`, `<video>`, or similar elements and JavaScript code coming from trusted sources. You may need to adjust their settings to match your needs.
