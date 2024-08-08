---
category: update-guides
meta-title: Update to version 38.x | CKEditor 5 Documentation
menu-title: Update to v38.x
order: 86
---

# Update to CKEditor&nbsp;5 v38.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v38.1.0

_Released on June 28, 2023._

For the entire list of changes introduced in version 38.0.0, see the [release notes for CKEditor&nbsp;5 v38.1.0](https://github.com/ckeditor/ckeditor5/releases/tag/v38.1.0).

Listed below is the minor breaking change that requires your attention when upgrading to CKEditor&nbsp;5 v38.1.0.

### Changes in the General HTML Support feature

The CKEditor&nbsp;5 version 38.1.0 introduces a minor breaking change. Until this release, the {@link features/general-html-support General HTML Support} (GHS) plugin kept all HTML-specific data in the `htmlAttributes` model attribute, regardless of the element type. However, this approach made it difficult to ensure that attributes did not leak to elements of other types. For example, if you applied some styles to a list, you probably expect new elements in that list to have the same styles, but you do not want them present in the next paragraph or heading.

GHS used to deal with this problem on a case-by-case basis. However, to fix this once and for all, in this release, we have renamed `htmlAttributes` to `html*Attributes`. The `*` stands for an element name, for example, `htmlH1Attributes` or `htmlUlAttributes`. This allows the feature to easily determine whether a given attribute is allowed on any given element.

For example, `htmlH1Attributes` is allowed on `H1` elements, but not on paragraph elements.

Upgrading to CKEditor&nbsp;5 v38.1.0 you will need to modify your GHS-related code accordingly by replacing all instances of `htmlAttributes` with proper `html*Attributes` for the respective view elements.

## Update to CKEditor&nbsp;5 v38.0.0

_Released on May 22, 2023._

For the entire list of changes introduced in version 38.0.0, see the [release notes for CKEditor&nbsp;5 v38.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v38.0.0).

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v38.0.0.

### Introduction of the "Powered by CKEditor" logo

Starting from version 38.0.0, all **open source installations** of CKEditor&nbsp;5 will include a small “Powered by CKEditor” logo in the bottom-right corner of the editing area. This logo is designed to raise awareness of the CKEditor brand and will link to the CKEditor website.

If you have a **commercial license**, you can hide the logo by adding {@link module:core/editor/editorconfig~EditorConfig#licenseKey `config.licenseKey`} to your configuration. If you already use pagination, productivity pack, or asynchronous collaboration features, you do not need to take any action as you should already have `config.licenseKey` in place. The logo will not be visible in your editor.

We have prepared a detailed {@link getting-started/licensing/managing-ckeditor-logo Managing the "Powered by CKEditor" logo} guide to help everyone through the transition and explain any concerns.

### Introduction of color pickers to font color and font background color features

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
