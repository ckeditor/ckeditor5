---
category: examples-framework
order: 90
toc: false
meta-title: Theme customization example | CKEditor 5 Documentation
meta-description: Customize the CKEditor 5 theme to match your app's look and feel by modifying styles, icons, and UI components.
classes: main__content--no-toc
---

# Theme customization

The [default theme](https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark) of CKEditor&nbsp;5 can be customized to match most visual integration requirements.

Below, you can see an editor with the dark theme as a result of customizations described in a {@link framework/theme-customization dedicated guide}.

**Mode:**

<div class="u-flex-horizontal u-gap-5">
	<ck:checkbox id="theme-mode-light" type="radio" name="theme-mode" value="light" label="Light" />
	<ck:checkbox id="theme-mode-dark" type="radio" name="theme-mode" value="dark" label="Dark" checked />
</div>

{@snippet examples/theme-lark}

## Detailed guide

If you would like to create such a widget on your own, read the {@link framework/theme-customization dedicated tutorial} that shows how to achieve this step by step with the source code provided.
