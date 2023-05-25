---
category: update-guides
menu-title: Update to v38.x
order: 86
modified_at: 2023-05-12
---

# Update to CKEditor 5 v38.0.0

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

For the entire list of changes introduced in version 38.0.0, see the [release notes for CKEditor 5 v38.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v38.0.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v38.0.0.

## Introduction of the "Powered by CKEditor" logo

Starting from version 38.0.0, all **open source installations** of CKEditor 5 will include a small “Powered by CKEditor” logo in the bottom-right corner of the editing area. This logo is designed to raise awareness of the CKEditor brand and will link to the CKEditor website.

If you have a **commercial license**, you can hide the logo by adding {@link module:core/editor/editorconfig~EditorConfig#licenseKey `config.licenseKey`} to your configuration. If you already use pagination, productivity pack, or non-real-time collaboration features, you don't need to take any action as you should already have `config.licenseKey` in place. The logo will not be visible in your editor.

We have prepared a detailed {@link support/managing-ckeditor-logo Managing the "Powered by CKEditor" logo} guide to help everyone through the transition and explain any concerns.

## Introduction of color pickers to font color and font background color features

Starting with v38.0.0, the user interface of the {@link features/font#configuring-the-font-color-and-font-background-color-features font color and font background color features} will display a {@link features/font#color-picker color picker}. The new feature is **enabled by default**. It supplements existing color palettes to improve the editing experience and boost the creativity of content authors.

However, we are aware that the freedom to choose any color may introduce noise and inconsistency to the content of some integrations with {@link features/font#specifying-available-colors already configured palettes}. If this is your case, you can disable color pickers in both font color and font background color features by setting the {@link module:font/fontconfig~FontColorConfig#colorPicker `colorPicker` option} in their respective configurations to `false`:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		fontColor: {
			// Disable the color picker for the font color feature.
			colorPicker: false
		},
		fontBackgroundColor: {
			// Disable the color picker for the font background color feature.
			colorPicker: false
		},
		toolbar: [
			'heading', 'bulletedList', 'numberedList', 'fontColor', 'fontBackgroundColor', 'undo', 'redo'
		]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
