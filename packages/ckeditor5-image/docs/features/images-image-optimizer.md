---
category: features-images
menu-title: Image optimizer
meta-title: Image optimizer | CKEditor 5 Documentation
meta-description: Learn all about image editing capabilities with CKBox and Uploadcare in CKEdiotr 5.
modified_at: 2025-01-29
order: 31
badges: [ premium ]
---

{@snippet features/build-image-optimizer-source}

While the image feature does not provide native image editing support, the {@link features/ckbox CKBox} and {@link features/uploadcare Uploadcare} premium features provide editing capabilities. Below you can find more details about image editing camabilities of each of the aforementioned features.

## Uploadcare

Image optimizer by Uploadcare provides not only basic image editing capbilities but also image properties adjustments and photo filters, further extending CKEditor 5 featureset. 

<info-box>
	This is a premium add-on that is a part of CKEditor Custom Plan, and delivered by our partner, [Uploadcare](https://uploadcare.com/). [Choose the Custom Plan](https://ckeditor.com/pricing/) to enable it.
</info-box>

### Before you begin

All features listed below are available for both - images uploaded to Uploadcare before editing and external images. Keep in mind that external images will be instantly uploaded to your Uploadcare account, once you click the edit image button {@icon @ckeditor/ckeditor5-ckbox/theme/icons/ckbox-image-edit.svg} to enable all the editing capabilities.

* Instructions on {@link features/uploadcare#adding-image-editing-capabilities how to enable editing external images}

### Image editing

Image optimizer by Uploadcare provides all the necessary image editing capabilities such as rotate, flip, resize and crop.

### Image parameter adjustment

For more advanced image customization, Image optimizer by Uploadcare lets you fine-tune image parameters, ensuring you get the exact image you need. You can easily adjust brightness, exposure, gamma, contrast, saturation, vibrance and warmth.

If you're not sure which of the options would yield best results for a specific image, you can use the enhance functionality, which will adjust the image’s colors, saturation, and levels to unveil previously hidden details and bring colors to life automatically.

### Photo filters

Image optimizer by Uploadcare is also providing a wide range of predefined photo filters that can quickly change the visual style of your image. Each of the over 40 filters can be applied with variable intensity.

### Demo

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

{@snippet features/image-image-optimizer-uploadcare}


## CKBox

CKBox provides image editing tools, straight from the asset manager or CKEditor 5, making working on content faster and more efficient. It saves time and resources as there is no need to resort to using a dedicated image editing software.

### Before you begin 

All the listed features are available for both - images uploaded to CKBox before editing as well as external images (if you enable this option). Keep in mind that external images will be instantly uploaded to your CKBox account, once you click the edit image button {@icon @ckeditor/ckeditor5-ckbox/theme/icons/ckbox-image-edit.svg} to enable all the editing capabilities.

* Instructions on {@link features/ckbox#editing-external-images how to enable editing external images}

### Image editing

CKBox premium feature provides basic editing capabilities such as cropping to presets, flipping, or rotating. By default, images hosted in CKBox are always editable.

### Demo

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

{@snippet features/image-image-optimizer-ckbox}
