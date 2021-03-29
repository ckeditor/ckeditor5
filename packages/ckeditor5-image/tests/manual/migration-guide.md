<div style="max-width: 600px; margin: 0 auto;">

# Migration guide to CKEditor 5 28.0.0 for the `Image`, `ImageStyle` and `ImageCaption` plugins

## Important changes

#### Inline images
In the new version of CKEditor5 we introduced the new `ImageInline` plugin.

TODO: A few words about: Why actually did we develop this plugin, how it can be used, how does it work?

Since the `InlineImage` is being introduced as a part of the `Image` plugin, it is included in all of the editor builds by default. The default behavior of the `Image` plugin changed in the following matters:

* An image inserted (or pasted/dropped) into a non-empty paragraph will be upcasted to the inline image. This behavior is configurable while creating the editor instance (See *link*). The image inserted into the empty paragraph will be still upcasted to a block image.

* ...

#### Image caption
An image caption will not be automatically showing up as the image widget gets selected. Its visibility can be toggled now by a `caption` button introduced by the `ImageCaption` plugin. The default location of this button is in the image toolbar.

To provide a valid HTML data output, an image caption is supported by the block images only. Adding a caption to an inline image will result in converting it to the block image.

#### Image styles
Since the appearance of the image in the document depends on the image type (block/inline), the `ImageStyle` plugin will be in charge of switching between the image types. Thus, the following changes have been introduced:

* The format of the `config.image.styles` has changed. The list of the supported styles has to be declared in the `options` field. Read more about the *`image.styles` configuration (link)*.

<pre style="background-color: gray; color: white; padding: 12px; border-radius: 4px;">
Editor.create( document.querySelector( '#editor' ), {
	...
	image: {
		styles: {
			options: [ 'full', 'side' ]
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
				modelElements: [ 'image', 'imageInline' ],
				className: 'image-style-align-left'
			} ]
		}
	}
} );
</pre>

* The plugin introduced a new set of buttons for the image toolbar to manage the image type and appearance. There is also a possibility to group these buttons in dropdowns. A few default dropdowns are provided, but a *custom dropdown (link)* can be added at any time.

	TODO: A list of the available buttons and dropdowns.

	Read the *Image toolbar (link)* section for more information.

* TODO: A few words about the 'isDefault' configuration.

#### Image toolbar

Due to the changes mentioned above, the image toolbar became crucial in terms of providing the user with a proper interaction with images.

Thus, we recommend using one of the following configurations as the minimum set-up for the image toolbar:

* For the purposes of the structured content editing (introduced in the classic, balloon, balloon-block, and inline builds). Read more about *editing the structured content*.

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

* For the purposes of the document-like editing (introduced in the document build). Read more about *editing the document content (link)*.

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

To see the above configurations in action, see the *editor examples (link)* below.

To overview all the new image style buttons and dropdowns we offer for the toolbar customization, visit the *image toolbar configuration API documentation (link)*.

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

## Migration from the default builds (If you are using cdn, online builder, npm, or ready-made zip package)

### I want to use the new functions
<!--
Ktoś używa online buildera i wyrzucił imageStyle. Zazwyczaj wtedy nie używa już image toolbara. Ale gdyby używał to musi mieć go customowego, więc nie ma o czym gadać.

Ktoś w ogóle nie używa plugina imageStyle - i tyle.
-->

#### I'm using the default build with no custom configuration

Just update or re-download your build. See the [installation instructions](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/installation.html).

#### I'm using a custom build or applying a custom editor configuration

* The `ImageStyle`, `ImageToolbar` or `ImageCaption` plugins are crucial for delivering the proper interaction with the image to the user. If you removed them from the editor configuration, consider re-adding them. Read the *Important changes (link)* section to find out why.

* If you have made any adjustments in the image toolbar, the new configuration won't be loaded by default. To provide your users proper interaction with the inline images, and an image caption, you should review your custom image toolbar configuration. Check the *recommended configurations (link)*.

### I want to keep my previous configuration

#### Removing the `ImageInline` plugin
* If you are using one of the default editor builds, you need to remove the `ImageInline` plugin from your editor configuration. Read more about [removing editor features](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/configuration.html#removing-features).

<pre style="background-color: gray; color: white; padding: 12px; border-radius: 4px;">
Editor.create( document.querySelector( '#editor' ), {
	removePlugins: [ 'ImageInline' ],
	...
} );
</pre>

* If you are using the online builder, add only the `ImageBlock` instead of the `Image` plugin while creating the build.

#### Overriding the default image toolbar

If you're not using the `ImageStyle` or `ImageToolbar` plugins or applied a custom image toolbar configuration you can skip this section.

If you are using the default image toolbar configuration, you will have to adjust it, so it will not contain the buttons for supporting the inline images. To do this, simply override the default configuration.

* For the classic, balloon, balloon-block and inline editor builds

<pre style="background-color: gray; color: white; padding: 12px; border-radius: 4px;">
Editor.create( document.querySelector( '#editor' ), {
	...
	image: {
		toolbar: [ 'imageStyle:full', 'imageStyle:side' ]
	}
} );
</pre>

* For the document editor build

<pre style="background-color: gray; color: white; padding: 12px; border-radius: 4px;">
Editor.create( document.querySelector( '#editor' ), {
	...
	image: {
		toolbar: [ 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight' ]
	}
} );
</pre>

## Migration from a custom build

### I want to use the new functions

If you load the 'Image' plugin, the inline images will work out of the box.

However, to provide your users a proper interaction with various types of images, you should remember that the image toolbar is now crucial in terms of the interaction with the image. It should be used for:
* adding a caption to the image,
* switching between the image types (block/inline)

Check the *recommended configurations (link)* to find out how to set the image toolbar properly.

### I want to keep my previous configuration

Since the `ImageInline` is now a part of the `Image` plugin, you have to load the `ImageBlock` plugin instead of the `Image`.

</div>
