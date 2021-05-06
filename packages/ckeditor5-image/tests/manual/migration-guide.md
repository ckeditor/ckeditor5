<div style="max-width: 600px; margin: 0 auto;">

# Migration guide to CKEditor 5 28.0.0 for the `Image`, `ImageStyle`, `ImageCaption` and `EasyImage` plugins

## Important changes

#### Inline images
In the new version of CKEditor5 we introduced the new `ImageInline` plugin.

TODO: A few words about: Why actually did we develop this plugin, how it can be used, how does it work?

Since the `InlineImage` is being introduced as a part of the `Image` plugin, it is included in all of the editor builds by default. The default behavior of the `Image` plugin changed in the following matters:

* An image inserted (or pasted/dropped) into a non-empty paragraph will be upcasted to the inline image. This behavior is configurable while creating the editor instance (See *link*). The image inserted into the empty paragraph will be still upcasted to a block image.

* ...

#### Image caption
An image caption will not be automatically showing up when selecting the image widget anymore. Its visibility can now be toggled by a `caption` button registered by the `ImageCaption` plugin. The default location of this button in the predefined builds is in the image toolbar.

To provide a valid HTML data output, an image caption is supported for the block images only. Adding a caption to an inline image will result in converting it to the block image.

#### Image styles
Since the appearance of the image in the document depends on the image type (block/inline), the `ImageStyle` plugin is now in charge of switching between these types. Thus, the following changes have been introduced:

* The format of the `config.image.styles` has changed. The list of the supported styles has to be declared in the `options` field. Read more about the *`image.styles` configuration (link)*.

<pre style="background-color: gray; color: white; padding: 12px; border-radius: 4px;">
Editor.create( document.querySelector( '#editor' ), {
	...
	image: {
		styles: {
			options: [ 'inline', 'full', 'side' ]
		}
	}
} );
</pre>

* The format of the `imageStyle` has changed. It should now provide information about supported image types. Read more about the *`imageStyle` format (link)*.

<pre style="background-color: gray; color: white; padding: 12px; border-radius: 4px;">
Editor.create( document.querySelector( '#editor' ), {
	...
	image: {
		styles: {
			options: [ {
				name: 'alignLeft',
				title: 'Left aligned image',
				icon: objectLeft,
				// Supported image types (names of the model elements)
				modelElements: [ 'imageBlock', 'imageInline' ],
				className: 'image-style-align-left'
			} ]
		}
	}
} );
</pre>

* *A new set of buttons (link)* has been introduced by the plugin to manage the image type and appearance.
* There is a possibility to group the buttons provided by the `ImageStyle` plugin into the dropdowns. A few *default dropdowns (link)* have been provided and *custom dropdown (link)* can be declared in the editor configuration.

#### Image toolbar

Due to the changes mentioned above, the image toolbar became crucial in terms of providing the user with proper interaction with images.

Thus, we recommend using one of the following configurations as the minimum set-up for the image toolbar:

* For the purposes of the structured content editing (the classic, balloon, balloon-block, and inline builds):

	<pre style="background-color: gray; color: white; padding: 12px; border-radius: 4px;">
	Editor.create( document.querySelector( '#editor' ), {
		...
		image: {
			toolbar: [
				'imageCaption',
				'imageStyle:inline',
				'imageStyle:full',
				'imageStyle:side'
			]
		}
	} );
	</pre>

	*Read more about *editing the structured content (link)*.

* For the purposes of the document-like editing (the decoupled document build).

	<pre style="background-color: gray; color: white; padding: 12px; border-radius: 4px;">
	Editor.create( document.querySelector( '#editor' ), {
		...
		image: {
			toolbar: [
				'imageCaption',
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText'
			]
		}
	} );
	</pre>

	Read more about *editing the document content (link)*.

To view the above configurations, see the *editor examples (link)* below.

#### `EasyImage` plugin

Please note that the {@link module:easy-image/easyimage~EasyImage} plugin is no longer automatically importing the {@link module:image/image~Image} plugin as a dependency. This allows using it alone with either {@link module:image/image~ImageBlock} or {@link module:image/image~ImageInline} without loading the other.

This decoupling does not have an impact on integrations based on on {@link builds/guides/overview#available-builds official editor builds} or using [the CKEditor 5 online builder](https://ckeditor.com/ckeditor-5/online-builder/).

However, for integrations that {@link builds/guides/integration/advanced-setup build the editor from source}, this means that in order to get Easy Image working properly, the `Image` plugin (or one of {@link module:image/image~ImageBlock} or {@link module:image/image~ImageInline}) must be imported separately:

<pre style="background-color: gray; color: white; padding: 12px; border-radius: 4px;">
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
</pre>

Check out the comprehensive {@link features/image#installation guide to images} in CKEditor 5 to learn more.

---

### The editor in 28.0.0 version examples

#### Classic editor with the article plugins set
<div id="editor-article">
TODO: editor content
</div>

#### Document editor with the document plugins set
<div id="editor-document-toolbar"></div>
<div id="editor-document-editing"></div>
<div id="editor-document">
TODO: editor content
</div>

For the entire list of the changes concerning the `Image` and other related plugins introduced in version 28.0.0 of the CKEditor 5 see the *changelog (link)*.

*Note:* Using the new functionalities will not affect or limit the editing, appearance, or behavior of the previously created content.

---

## Migration paths

### Introducing the inline images in the editor integration

#### Default build with no custom configuration

Just update or re-download your build. See the [installation instructions](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/installation.html).

#### Default build with custom editor configuration

* The `ImageStyle`, `ImageToolbar`, and `ImageCaption` plugins became crucial in terms of providing the user with proper interaction with images. If you removed them from the editor configuration, consider re-adding them. Read the *Important changes (link)* section to find out why.

* If you're making any adjustments in the image toolbar, they will override the new default toolbar configuration. To provide the users proper interaction with the inline images, and an image caption, please review your image toolbar configuration. Check the *recommended configurations (link)*.

#### Custom integration

* The `ImageStyle`, `ImageToolbar`, and `ImageCaption` plugins became crucial in terms of providing the user with proper interaction with images. If they are missing in your editor configuration, consider adding them. Read the *Important changes (link)* section to find out why.
* To provide the users proper interaction with the inline images, and an image caption, please review your image toolbar configuration. Check the *recommended configurations (link)*.
* If you are using the `EasyImage` plugin, note that it is no longer being imported as the `Image` or `ImageBlock` plugin dependency. Read more about the *changes in the `EasyImage` (link)* plugin.
### Keeping the previous configuration

#### Default build

At this moment it is not possible to remove the `ImageInline` while keeping the `ImageBlock` plugin. That is because they are both part of the `Image` plugin and can not be separated in already built editor. If you want to use the `ImageBlock` or `ImageInline` plugin only, consider *building the editor from source (link)*.

#### Build generated with the Online builder

* Add only the `ImageBlock` instead of the `Image` plugin while creating the build.
* Adjust your configuration of the *`ImageStyle` (link)* and *`ImageToolbar` (link)* plugins, especially to support the *caption button (link)*.

#### Custom integration

* Since the `ImageInline` is now a part of the `Image` plugin, you have to load the `ImageBlock` plugin instead of the `Image`.
* If you are using the `EasyImage` plugin, note that it is no longer being imported as the `Image` or `ImageBlock` plugin dependency. Read more about the *changes in the `EasyImage` (link)* plugin.
* Adjust your configuration of the *`ImageStyle` (link)* and *`ImageToolbar` (link)* plugins, especially to support the *caption button (link)*.

</div>
