---
category: features-images
menu-title: Image optimizer
meta-title: Image optimizer | CKEditor 5 Documentation
meta-description: Learn all about image editing capabilities with CKBox and Uploadcare in CKEdiotr 5.
modified_at: 2025-02-03
order: 40
badges: [ premium ]
---

Elevate your images with robust editing tools available through the premium {@link features/ckbox CKBox} and {@link features/uploadcare Uploadcare} integrations. In this guide you will discover how to modify and enhance visuals directly in the editor, giving you greater creative control.

## Image optimizer by Uploadcare

Uploadcare provides not only basic image editing capabilities, but also image properties adjustments and photo filters, further extending CKEditor&nbsp;5 feature set.

### Demo

Click on the image to invoke the image toolbar, then use the image editing button {@icon @ckeditor/ckeditor5-icons/theme/icons/ckbox-image-edit.svg} to access the Uploadcare editor.

{@snippet features/image-image-optimizer-uploadcare}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

### Image editing

Image optimizer by Uploadcare provides a handful of image editing capabilities, such as:

* rotation, mirroring and flipping,
* cropping,
* [image parameters adjustment](#image-parameter-adjustment),
* [filters](#photo-filters).

What is great about image editing in Uploadcare is that all edits are not changing the original image. You can easily go back to the original after the cropping for examples.

### Image parameter adjustment

For more advanced image customization, Image optimizer by Uploadcare lets you fine-tune image parameters, ensuring you get the exact image you need. You can easily adjust brightness, exposure, gamma, contrast, saturation, vibrance and warmth.

If you are not sure which of the options would yield best results for a specific image, you can use the enhance functionality, which will adjust the image’s colors, saturation, and levels to unveil previously hidden details and bring colors to life automatically.

### Photo filters

Image optimizer by Uploadcare also provides a wide range of predefined photo filters that can quickly change the visual style of your image. Each of the over 40 filters can be applied with variable intensity.

### Configuration

To set up the editing capabilities, read the {@link features/uploadcare#adding-image-editing-capabilities Uploadcare documentation}.

All features listed above are available both for images uploaded to Uploadcare before editing and &ndash; if you enable the {@link features/uploadcare#editing-external-images external images editing option} &ndash; for images from other sources (external). Keep in mind that external images will be automatically uploaded to your Uploadcare account, once you click the edit image button {@icon @ckeditor/ckeditor5-icons/theme/icons/ckbox-image-edit.svg} to enable all the editing capabilities.

## Image optimizer by CKBox

CKBox provides image editing tools, straight from the asset manager or CKEditor&nbsp;5, making working on content faster and more efficient. It saves time and resources as there is no need to resort to using a dedicated image editing software.

### Demo

Click on the image to invoke the image toolbar, then use the image editing button {@icon @ckeditor/ckeditor5-icons/theme/icons/ckbox-image-edit.svg} to access the CKBox image editor.

{@snippet features/image-image-optimizer-ckbox}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

### Image editing

CKBox premium feature provides editing capabilities such as:

* rotation, mirroring and flipping,
* cropping (freeform and to defined aspect rations),
* resizing (also to predefined presets).

All edits result in a new image being created on your CKBox account. This is done to preserve the original image, for example if it is used in other places. Editing and overwriting images is possible through the CKBox panel.

### Configuration

To set up the editing capabilities, read the {@link features/ckbox#installation CKBox documentation}.

All the listed features are available both for images uploaded to CKBox before, and &ndash; if you enable  the {@link features/ckbox#editing-external-images external images editing option} &ndash; images from other sources (external). Keep in mind that external images will be instantly uploaded to your CKBox account, once you click the edit image button {@icon @ckeditor/ckeditor5-icons/theme/icons/ckbox-image-edit.svg} to enable all the editing capabilities.
