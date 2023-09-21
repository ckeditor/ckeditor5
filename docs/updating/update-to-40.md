---
category: update-guides
meta-title: Update to version 40.x | CKEditor 5 Documentation
menu-title: Update to v40.x
order: 84
modified_at: 2023-09-13
---

# Update to CKEditor&nbsp;5 v40.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v40.0.0

For the entire list of changes introduced in version 40.0.0, see the [release notes for CKEditor&nbsp;5 v40.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v40.0.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v40.0.0.

### Changes to the image feature

This release introduces changes connected with the image `width` and `height` attributes. These are now preserved while loading editor content. Images without their size specified will automatically gain natural image size on any interaction with the image within the editor. Due to this new behavior, the `width` and `height` attributes are now used to preserve the image's natural width and height and the model attribute name of a resized image is now changed to `resizedWidth`.

The `srcset` model attribute which provides parameters for responsive images, has been simplified. It is no longer an object `{ data: "...", width: "..." }`, but the value that was previously stored in the `data` part.

Last but not least, content styles have been updated with this release, which means you need to update them in your editor implementation to avoid any discrepancies. Please refer to the {@link installation/advanced/content-styles Content styles} guide to learn how to generate the stylesheet.

### New Balloon Block editor icon

We have changed the default Balloon Block editor indicator icon from the pilcrow icon (`¶`) to the braille pattern dots icon (`⠿`). The new icon better corresponds to the dual function of the indicator, which may be used to both invoke the balloon toolbar and to drag to content block around.

While `⠿` is now a default, the icon can still be configured by the integrator, for example:
<!-- add this to balloon toolbar config guide-->
```js
	blockToolbar: {
		items: [
			'bold',
			'italic',
			'link'
		],
		icon: 'pilcrow' // or SVG.
	},
```

### A new default lists plugin coming

The regular lists feature will be replaced with the new {@link features/document-lists document lists} in one of the upcoming releases and it will be sunset at the beginning of 2024. The change will be seamless for the users, but there are significant changes between these plugins. We will update the information about this process as it unfolds.

See [#14767](https://github.com/ckeditor/ckeditor5/issues/14767) for more details.