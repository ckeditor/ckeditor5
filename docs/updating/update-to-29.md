---
category: update-guides
meta-title: Update to version 29.x | CKEditor 5 Documentation
menu-title: Update to v29.x
order: 95
---
# Update to CKEditor&nbsp;5 v29.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v29.1.0

_Released on August 4, 2021._

For the entire list of changes introduced in version 29.1.0, see the [release notes for CKEditor&nbsp;5 v29.1.0](https://github.com/ckeditor/ckeditor5/releases/tag/v29.1.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v29.1.0.

### Matcher pattern API change

Starting from v29.1.0, the {@link module:engine/view/matcher~Matcher} feature deprecated matching `style` and `class` HTML attributes using `attributes` key-value pairs pattern.

The {@link module:engine/view/matcher~Matcher} feature allows to match styles and classes by using dedicated `styles` and `classes` patterns. Since v29.0.0 it is also possible to match every possible value for these attributes by using the Boolean type with the `true` value. To avoid confusion about which pattern to use to match classes and styles, we decided to deprecate matching classes and styles using the `attributes` pattern.

Here is an example of changes you may need for proper integration with the {@link module:engine/view/matcher~Matcher} feature new API:

```js
// Old code.
new Matcher( {
	name: 'a',
	attributes: {
		'data-custom-attribute-1': /.*/,
		'data-custom-attribute-2': /.*/,
		style: true,
		class: true
	}
} );

// New code.
new Matcher( {
	name: 'a',
	attributes: {
		'data-custom-attribute-1': /.*/,
		'data-custom-attribute-2': /.*/
	},
	styles: true,
	classes: true
} );
```

### Link decorators API change

{@link updating/update-to-29#matcher-pattern-api-change Matcher pattern API change} also improves how to define the {@link module:link/linkconfig~LinkDecoratorDefinition link decorators} (both {@link module:link/linkconfig~LinkDecoratorManualDefinition manual decorator} and {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition automatic decorator}). Similar to the {@link module:engine/view/matcher~Matcher} feature API, you should define the `style` and `class` HTML attributes using the `classes` and `styles` properties.

Here is an example of changes you may need for proper integration with the {@link module:link/linkconfig~LinkDecoratorDefinition link decorators} API change:

```js
// Old code.
ClassicEditor
	.create( ..., {
		// ...
		link: {
			decorators: {
				addGreenLink: {
					mode: 'automatic',
					attributes: {
						class: 'my-green-link',
						style: 'color:green;'
					}
				}
			}
		}
	} )
// New code.
ClassicEditor
	.create( ..., {
		// ...
		link: {
			decorators: {
				addGreenLink: {
					mode: 'automatic',
					classes: 'my-green-link',
					styles: {
						color: 'green'
					}
				}
			}
		}
	} )
```

## Update to CKEditor&nbsp;5 v29.0.0

_Released on July 7, 2021._

This migration guide enumerates the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v29.0.0 due to changes introduced in the {@link module:image/image~Image} plugin and some other image-related features.

For the entire list of changes introduced in version 29.0.0, see the [release notes for CKEditor&nbsp;5 v29.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v29.0.0).

To get to know the new editor UI for the image features, visit the {@link features/images-overview image feature guide}, especially:
* {@link features/images-styles#semantical-styles Images in the structured content}
* {@link features/images-styles#presentational-styles Images in the document-like content}

### Inline images

Starting from v29.0.0, the existing {@link module:image/image~Image} plugin loads two independent plugins: {@link module:image/imageinline~ImageInline} and {@link module:image/imageblock~ImageBlock}, therefore both of them are included in all of the {@link getting-started/legacy-getting-started/predefined-builds#available-builds predefined editor builds} by default.
* The {@link module:image/imageinline~ImageInline} is a newly introduced plugin supporting the inline `<img>` tag nested in text (for example inside a paragraph).
* The {@link module:image/imageblock~ImageBlock} maintains the functionality of the previous {@link module:image/image~Image} plugin before v29.0.0. In the model, it uses the `imageBlock` element (known as `image` before v29.0.0).

<info-box>
	**Note:** It is possible to load only one of these plugins, but only when {@link getting-started/advanced/integrating-from-source-webpack building the editor from source}.
</info-box>

### Image caption

An image caption is no longer automatically shown when selecting the image widget. You can now toggle its visibility with a {@link module:image/imagecaption/toggleimagecaptioncommand~ToggleImageCaptionCommand} executed by the `'toggleImageCaption'` toolbar button, both registered by the {@link module:image/imagecaption~ImageCaption} plugin. The button is added to the default image toolbar in all the {@link getting-started/legacy-getting-started/predefined-builds#available-builds predefined editor builds}.

<info-box>
	To provide a valid data output, you can only add captions to block images. Adding a caption to an inline image will automatically convert it to a block image (which can be undone by the user).
</info-box>

### Image styles

Since the appearance of the image in the document depends on the image type (block/inline), the {@link module:image/imagestyle~ImageStyle} plugin is now in charge of switching between these types. Thus, we introduced the following changes:

* {@link module:image/imageconfig~ImageConfig#styles A new set of buttons} is available to manage the image type and appearance.

* You can group the buttons provided by the {@link module:image/imagestyle~ImageStyle} plugin into dropdowns.
	* A few {@link module:image/imagestyle/utils#DEFAULT_DROPDOWN_DEFINITIONS default dropdowns} are provided.
	* In the editor configuration, you can declare a {@link module:image/imageconfig~ImageStyleDropdownDefinition custom dropdown}.

* The name of the default block image style has changed from `full` to `block` (as the default style for the inline images is called `inline`), the default {@link getting-started/advanced/content-styles content styles} for these images remain the same. The button label has also changed and now reads `Centered image` so that it reflects the actual appearance of the image. If you customized the default appearance of the block images, you can change the button label by {@link module:image/imageconfig~ImageConfig#styles modifying the existing image style}.

* The format of the `config.image.styles` has changed. You must wrap the list of the styles with the `options` array. Read more about the {@link module:image/imageconfig~ImageConfig#styles `image.styles` configuration}.

	```js
	// Before v29.0.0.
	Editor.create( document.querySelector( '#editor' ), {
		...
		image: {
			styles: [ 'inline', 'full', 'side' ]
		}
	} );

	// Since v29.0.0.
	Editor.create( document.querySelector( '#editor' ), {
		...
		image: {
			styles: {
				options: [ 'inline', 'block', 'side' ]
			}
		}
	} );
	```

* The format of the `imageStyle` has changed. It must now provide information about the image types supporting a particular style. Read more about the {@link module:image/imageconfig~ImageStyleOptionDefinition}.

	```js
	// Before v29.0.0.
	Editor.create( document.querySelector( '#editor' ), {
		...
		image: {
			styles: [ {
				name: 'alignLeft',
				title: 'Left aligned image',
				icon: objectLeft,
				className: 'image-style-align-left'
			} ]
		}
	} );

	// Since v29.0.0.
	Editor.create( document.querySelector( '#editor' ), {
		...
		image: {
			styles: {
				options: [ {
					name: 'alignLeft',
					title: 'Left aligned image',
					icon: objectLeft,
					// Image types (names of the model elements) supporting this style.
					modelElements: [ 'imageBlock', 'imageInline' ],
					className: 'image-style-align-left'
				} ]
			}
		}
	} );
	```

* Several changes have been also made to the {@link module:image/imagestyle~ImageStyle} plugin API:
	* In the {@link module:image/imagestyle/utils image style utilities} module:
		* The `defaultIcons` were renamed to {@link module:image/imagestyle/utils~DEFAULT_ICONS}.
		* The `defaultStyles` were renamed to {@link module:image/imagestyle/utils~DEFAULT_OPTIONS}.
		* The `normalizeImageStyles()` function was removed from the public API.
	* The `ImageStyleCommand#defaultStyle` and `ImageStyleCommand#styles` were removed from the public API.

### Image toolbar

Until v29.0.0, custom editor builds without {@link module:image/imagestyle~ImageStyle} and {@link module:image/imagetoolbar~ImageToolbar} plugins were possible. Only block images were supported and captions were added by the user upon selecting the image.

Since v29.0.0, {@link features/images-styles image styles} and {@link features/images-overview#image-contextual-toolbar toolbar} allow users to choose the type of image (inline or block) and give them a way to add or remove captions from block images via configurable buttons.

The user experience will degrade if either of these features is missing and this makes the {@link module:image/imageconfig~ImageConfig#toolbar image toolbar} configuration essential.

<info-box>
	{@link getting-started/legacy-getting-started/predefined-builds Pre-configured editor builds} come with {@link module:image/imagestyle~ImageStyle} and {@link module:image/imagetoolbar~ImageToolbar} plugins (and configuration) out-of-the-box. This information is mainly for developers who use {@link getting-started/legacy-getting-started/quick-start-other custom editor builds} in their integrations.
</info-box>

We recommend one of the following configurations as the minimum setup for the image toolbar:

* For structured content editing (implemented by default in the classic, balloon, balloon block, and inline {@link getting-started/legacy-getting-started/predefined-builds editor builds}):

	```js
	Editor.create( document.querySelector( '#editor' ), {
		...
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		}
	} );
	```

* For document-like editing (implemented by default in the {@link getting-started/legacy-getting-started/predefined-builds#document-editor decoupled document build}).

	```js
	Editor.create( document.querySelector( '#editor' ), {
		...
		image: {
			toolbar: [
				'toggleImageCaption',
				'imageStyle:inline',
				// A dropdown containing `alignLeft` and `alignRight` options.
				'imageStyle:wrapText',
				// A dropdown containing `alignBlockLeft`, `block` (default) and  `alignBlockRight` options.
				'imageStyle:breakText'
			]
		}
	} );
	```

See the {@link features/images-overview#image-contextual-toolbar image feature guide} to learn more about the configuration of the image toolbar.

### Inserting images

Since v29.0.0 inserting (also: pasting, dropping) an image in the middle of text will no longer split it if the {@link module:image/imageinline~ImageInline} plugin is loaded (default). If you prefer the old behavior in your integration, you can specify this in the {@link module:image/imageconfig~ImageInsertConfig `ImageInsert` plugin configuration}.

### Image utilities

* The image utilities are now wrapped by the {@link module:image/imageutils~ImageUtils} plugin.

	```js
	// Before v29.0.0.
	import { isImage } from './utils';

	const selectedElement = editor.model.document.selection.getSelectedElement();

	if ( isImage( selectedElement ) ) {
		// ...
	}

	// Since v29.0.0.
	// ...
	const imageUtils = this.editor.plugins.get( 'ImageUtils' );
	const selectedElement = editor.model.document.selection.getSelectedElement();

	if ( imageUtils.isImage( selectedElement ) ) {
		// ...
	}
	```

* The {@link module:image/imageutils~ImageUtils#insertImage `insertImage()`} function:
	* No longer requires the `model` model instance to run.
	* Allows {@link module:engine/model/selection~Selectable} as a second argument (before only {@link module:engine/model/position~Position} was accepted).
	* Supports the optional `imageType` argument to force the type of the image to be inserted.

	```js
	// Before v29.0.0.
	import { insertImage } from './utils';

	const src = 'path/to/image.jpg';
	const model = ths.editor.model;
	const selection = model.document.selection;
	const position = model.createPositionAt( selection.getSelectedElement() );

	insertImage( model, { src }, position );

	// Since v29.0.0.
	const src = 'path/to/image.jpg';
	const selection = this.editor.model.document.selection;
	const imageUtils = this.editor.plugins.get( 'ImageUtils' );
	const imageType = 'imageBlock';

	imageUtils.insertImage( { src }, selection, imageType );
	```

* The {@link module:image/imageutils~ImageUtils#isImage `isImage()`} function recognizes both inline and block images (before only block images).
* There are two new helpers: {@link module:image/imageutils~ImageUtils#isBlockImageView `isBlockImageView()`} and {@link module:image/imageutils~ImageUtils#isInlineImageView `isInlineImageView()`}.

We removed the following helpers from the public API:

* `getSelectedImageWidget()`,
* `getViewImgFromWidget()`,
* `isImageAllowed()`,
* `isImageWidget()`,
* `toImageWidget()`

### `EasyImage` plugin

The {@link module:easy-image/easyimage~EasyImage} plugin is no longer automatically importing the {@link module:image/image~Image} plugin as a dependency. This allows using it alone with either {@link module:image/imageblock~ImageBlock} or {@link module:image/imageinline~ImageInline} without loading the other one.

This decoupling does not have an impact on integrations based on {@link getting-started/legacy-getting-started/predefined-builds predefined builds} or using the [CKEditor&nbsp;5 Builder](https://ckeditor.com/ckeditor-5/builder?redirect=docs).

However, for integrations that {@link getting-started/advanced/integrating-from-source-webpack build the editor from source}, this means that to get Easy Image working properly, the `Image` plugin (or either the {@link module:image/imageblock~ImageBlock} or {@link module:image/imageinline~ImageInline} plugin) must be imported separately:

```js
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Image from '@ckeditor/ckeditor5-image/src/image';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ EasyImage, Image, ... ],
		toolbar: [ 'uploadImage', ... ],

		// ...
	} )
	.then( ... )
	.catch( ... );
```
Check out the comprehensive {@link features/images-installation installation guide to images} in CKEditor&nbsp;5 to learn more.

### `CKFinder` plugin

The {@link module:ckfinder/ckfinder~CKFinder} plugin is no longer automatically importing the {@link module:image/image~Image} plugin as a dependency. This allows using it alone with either {@link module:image/imageblock~ImageBlock} or {@link module:image/imageinline~ImageInline} without loading the other one.

This decoupling does not have an impact on integrations based on {@link getting-started/legacy-getting-started/predefined-builds predefined builds} or using the [CKEditor&nbsp;5 Builder](https://ckeditor.com/ckeditor-5/builder?redirect=docs).

However, for integrations that {@link getting-started/advanced/integrating-from-source-webpack build the editor from source}, this means that to get CKFinder working properly, you must import the `Image` plugin (or either the {@link module:image/imageblock~ImageBlock} or {@link module:image/imageinline~ImageInline} plugin) separately:

```js
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfider';
import Image from '@ckeditor/ckeditor5-image/src/image';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, Image, ... ],
		toolbar: [ 'uploadImage', ... ],
		ckfinder: {
			// Feature configuration.
		}
	} )
	.then( ... )
	.catch( ... );
```
Check out the comprehensive {@link features/images-installation installation guide to images} in CKEditor&nbsp;5 to learn more.
