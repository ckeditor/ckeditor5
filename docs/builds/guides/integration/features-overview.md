---
category: builds-integration
order: 90
---

# Features overview

Below there is a table containing all CKEditor 5 packages, plugins that the package delivers and their possible HTML output. There are plugins, that generate different HTML output depending on its configuration, which is described in the "HTML output" column. On the other hand, if given plugin does not generate any output, the one and only row in the "HTML output" column for that plugin contains the word "None".

How to read the generated output? There is one simple rule: CSS classes, inline styles, attributes and comments in a given cell in the "HTML output" column **apply only** to HTML elements, that are listed at the top in that cell. The classes, styles or attributes, that are included there do not mean that they will always be used in the HTML element, but rather show **possible** results. Wildcard character `*` is used to mark any value.

<style>
    table.features-overview code.nowrap {
        white-space: nowrap;
    }
</style>

<!-- Do not delete the comment below as it indicates the place, where the features overview output will be stored. -->

<!-- features-overview-output-marker -->
<table class="features-overview">
	<thead>
		<tr>
			<th>
				Package
			</th>
			<th>
				Plugin
			</th>
			<th>
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-adapter-ckfinder</code>
			</td>
			<td>
				<p>
					<a href="../../../features/image-upload/image-upload.html#ckfinder">
						CKFinder Upload Adapter
					</a>
				</p>
				<p>
					<a href="../../../api/module_adapter-ckfinder_uploadadapter-CKFinderUploadAdapter.html">
						<code class="nowrap">CKFinderUploadAdapter</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="2">
				<code class="nowrap">ckeditor5-alignment</code>
			</td>
			<td rowspan="2">
				<p>
					<a href="../../../features/image-upload/image-upload.html#ckfinder">
						Alignment
					</a>
				</p>
				<p>
					<a href="../../../api/module_alignment_alignment-Alignment.html">
						<code class="nowrap">Alignment</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>$block</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="text-align:*"&gt;</code>
				</p>
				<p>
					By default, the alignment is set inline using <code>text-align</code> CSS property.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>$block</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="*"&gt;</code>
				</p>
				<p>
					If class names are defined in <code>config.alignment.options</code>, then these classes are used for alignment instead of inline styles.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-autoformat</code>
			</td>
			<td>
				<p>
					<a href="../../../features/autoformat.html">
						Autoformat
					</a>
				</p>
				<p>
					<a href="../../../api/module_autoformat_autoformat-Autoformat.html">
						<code class="nowrap">Autoformat</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-autosave</code>
			</td>
			<td>
				<p>
					<a href="../../../builds/guides/integration/saving-data.html#autosave-feature">
						Autosave
					</a>
				</p>
				<p>
					<a href="../../../api/module_autosave_autosave-Autosave.html">
						<code class="nowrap">Autosave</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="7">
				<code class="nowrap">ckeditor5-basic-styles</code>
			</td>
			<td>
				<p>
					<a href="../../../features/basic-styles.html">
						Bold
					</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_bold-Bold.html">
						<code class="nowrap">Bold</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>strong</strong>&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/basic-styles.html">
						Code
					</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_code-Code.html">
						<code class="nowrap">Code</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>code</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="ck-code_selected"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/basic-styles.html">
						Italic
					</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_italic-Italic.html">
						<code class="nowrap">Italic</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>i</strong>&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/basic-styles.html">
						Strikethrough
					</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_strikethrough-Strikethrough.html">
						<code class="nowrap">Strikethrough</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>s</strong>&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/basic-styles.html">
						Subscript
					</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_subscript-Subscript.html">
						<code class="nowrap">Subscript</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>sub</strong>&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/basic-styles.html">
						Superscript
					</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_superscript-Superscript.html">
						<code class="nowrap">Superscript</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>sup</strong>&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/basic-styles.html">
						Underline
					</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_underline-Underline.html">
						<code class="nowrap">Underline</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>u</strong>&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-block-quote</code>
			</td>
			<td>
				<p>
					<a href="../../../features/block-quote.html">
						Block quote
					</a>
				</p>
				<p>
					<a href="../../../api/module_block-quote_blockquote-BlockQuote.html">
						<code class="nowrap">BlockQuote</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>blockquote</strong>&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-ckfinder</code>
			</td>
			<td>
				<p>
					<a href="../../../features/image-upload/ckfinder.html">
						CKFinder
					</a>
				</p>
				<p>
					<a href="../../../api/module_ckfinder_ckfinder-CKFinder.html">
						<code class="nowrap">CKFinder</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-cloud-services</code>
			</td>
			<td>
				<p>
					<a href="https://ckeditor.com/ckeditor-cloud-services">
						Cloud Services
					</a>
				</p>
				<p>
					<a href="../../../api/module_cloud-services_cloudservices-CloudServices.html">
						<code class="nowrap">CloudServices</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="2">
				<code class="nowrap">ckeditor5-code-block</code>
			</td>
			<td rowspan="2">
				<p>
					<a href="../../../features/code-blocks.html">
						Code block
					</a>
				</p>
				<p>
					<a href="../../../api/module_code-block_codeblock-CodeBlock.html">
						<code class="nowrap">CodeBlock</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>pre</strong>&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>code</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="* language-*"&gt;</code>
				</p>
				<p>
					By default, the language of the code block is represented as a CSS class prefixed by 'language-'. CSS class name can be customized via <code>config.codeBlock.languages</code> array.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-easy-image</code>
			</td>
			<td>
				<p>
					<a href="../../../features/image-upload/easy-image.html">
						Easy Image
					</a>
				</p>
				<p>
					<a href="../../../api/module_easy-image_easyimage-EasyImage.html">
						<code class="nowrap">EasyImage</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-essentials</code>
			</td>
			<td>
				<p>
					Essentials
				</p>
				<p>
					<a href="../../../api/module_essentials_essentials-Essentials.html">
						<code class="nowrap">Essentials</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>br</strong>&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="7">
				<code class="nowrap">ckeditor5-font</code>
			</td>
			<td>
				<p>
					<a href="../../../features/font.html#configuring-the-font-color-and-font-background-color-features">
						Font background color
					</a>
				</p>
				<p>
					<a href="../../../api/module_font_fontbackgroundcolor-FontBackgroundColor.html">
						<code class="nowrap">FontBackgroundColor</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>span</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="background-color:*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/font.html#configuring-the-font-color-and-font-background-color-features">
						Font color
					</a>
				</p>
				<p>
					<a href="../../../api/module_font_fontcolor-FontColor.html">
						<code class="nowrap">FontColor</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>span</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="color:*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="3">
				<p>
					<a href="../../../features/font.html#configuring-the-font-size-feature">
						Font size
					</a>
				</p>
				<p>
					<a href="../../../api/module_font_fontsize-FontSize.html">
						<code class="nowrap">FontSize</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>span</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="text-tiny text-small text-big text-huge"&gt;</code>
				</p>
				<p>
					If the configuration <code>config.fontSize.options</code> is not set or it contains predefined named presets, then the font size is configured by the class name.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>span</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="font-size:*"&gt;</code>
				</p>
				<p>
					If the configuration <code>config.fontSize.options</code> contains numerical values, the font size is configured inline using the <code>font-size</code> CSS property.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>*</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="*"&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="*:*"&gt;</code>
				</p>
				<p>
					The plugin can be configured to return any element with any classes and any inline styles.
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="2">
				<p>
					<a href="../../../features/font.html#configuring-the-font-family-feature">
						Font family
					</a>
				</p>
				<p>
					<a href="../../../api/module_font_fontfamily-FontFamily.html">
						<code class="nowrap">FontFamily</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>span</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="font-family:*"&gt;</code>
				</p>
				<p>
					By default, the font family is configured inline using the <code>font-family</code> CSS property.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>*</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="*"&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="*:*"&gt;</code>
				</p>
				<p>
					The plugin can be configured to return any element with any classes and any custom inline styles.
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="3">
				<code class="nowrap">ckeditor5-heading</code>
			</td>
			<td>
				<p>
					<a href="../../../features/title.html">
						Title
					</a>
				</p>
				<p>
					<a href="../../../api/module_heading_title-Title.html">
						<code class="nowrap">Title</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>h1</strong>&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="2">
				<p>
					<a href="../../../features/headings.html">
						Heading
					</a>
				</p>
				<p>
					<a href="../../../api/module_heading_heading-Heading.html">
						<code class="nowrap">Heading</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>h1</strong>&gt;</code>, <code>&lt;<strong>h2</strong>&gt;</code>, <code>&lt;<strong>h3</strong>&gt;</code>, <code>&lt;<strong>h4</strong>&gt;</code>
				</p>
				<p>
					HTML element may contain classes, styles or attributes, that are created by other plugins, which alter the <code>&lt;$block&gt;</code> element.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>*</strong>&gt;</code>
				</p>
				<p>
					The plugin can be configured to return any element name as a heading.
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="2">
				<code class="nowrap">ckeditor5-highlight</code>
			</td>
			<td rowspan="2">
				<p>
					<a href="../../../features/highlight.html">
						Highlight
					</a>
				</p>
				<p>
					<a href="../../../api/module_highlight_highlight-Highlight.html">
						<code class="nowrap">Highlight</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>mark</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="marker-yellow marker-green marker-pink marker-blue pen-red pen-green"&gt;</code>
				</p>
				<p>
					By default, this plugin has 4 markers and 2 pens preconfigured.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>mark</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="*"&gt;</code>
				</p>
				<p>
					The plugin can be configured to set any classes on the <code>&lt;mark&gt;</code> element.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-horizontal-line</code>
			</td>
			<td>
				<p>
					<a href="../../../features/horizontal-line.html">
						Horizontal line
					</a>
				</p>
				<p>
					<a href="../../../api/module_horizontal-line_horizontalline-HorizontalLine.html">
						<code class="nowrap">HorizontalLine</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>hr</strong>&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-html-embed</code>
			</td>
			<td>
				<p>
					<a href="../../../features/html-embed.html">
						HTML embed
					</a>
				</p>
				<p>
					<a href="../../../api/module_html-embed_htmlembed-HtmlEmbed.html">
						<code class="nowrap">HtmlEmbed</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>div</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="raw-html-embed"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="10">
				<code class="nowrap">ckeditor5-image</code>
			</td>
			<td>
				<p>
					<a href="../../../features/image.html#inserting-images-via-pasting-url-into-editor">
						Auto image
					</a>
				</p>
				<p>
					<a href="../../../api/module_image_autoimage-AutoImage.html">
						<code class="nowrap">AutoImage</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="2">
				<p>
					<a href="../../../features/image.html">
						Image
					</a>
				</p>
				<p>
					<a href="../../../api/module_image_image-Image.html">
						<code class="nowrap">Image</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>figure</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="image"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>img</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>alt</strong>="*" <strong>sizes</strong>="*" <strong>src</strong>="*" <strong>srcset</strong>="*" <strong>width</strong>="*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/image.html#image-captions">
						Image caption
					</a>
				</p>
				<p>
					<a href="../../../api/module_image_imagecaption-ImageCaption.html">
						<code class="nowrap">ImageCaption</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>figcaption</strong>&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/image.html#resizing-images">
						Image resize
					</a>
				</p>
				<p>
					<a href="../../../api/module_image_imageresize-ImageResize.html">
						<code class="nowrap">ImageResize</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>figure</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="image_resized"&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="width:*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="2">
				<p>
					<a href="../../../features/image.html#image-styles">
						Image style
					</a>
				</p>
				<p>
					<a href="../../../api/module_image_imagestyle-ImageStyle.html">
						<code class="nowrap">ImageStyle</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>figure</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="image-style-side image-style-align-left image-style-align-center image-style-align-right"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>figure</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="*"&gt;</code>
				</p>
				<p>
					The plugin can be configured to set any class names on the <code>&lt;figure&gt;</code> element.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/image.html#image-contextual-toolbar">
						Image toolbar
					</a>
				</p>
				<p>
					<a href="../../../api/module_image_imagetoolbar-ImageToolbar.html">
						<code class="nowrap">ImageToolbar</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/image.html#image-upload">
						Image upload
					</a>
				</p>
				<p>
					<a href="../../../api/module_image_imageupload-ImageUpload.html">
						<code class="nowrap">ImageUpload</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/image.html#inserting-images-via-source-url">
						Image insert
					</a>
				</p>
				<p>
					<a href="../../../api/module_image_imageinsert-ImageInsert.html">
						<code class="nowrap">ImageInsert</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="3">
				<code class="nowrap">ckeditor5-indent</code>
			</td>
			<td>
				<p>
					<a href="../../../features/indent.html">
						Indent
					</a>
				</p>
				<p>
					<a href="../../../api/module_indent_indent-Indent.html">
						<code class="nowrap">Indent</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="2">
				<p>
					<a href="../../../features/indent.html">
						Indent block
					</a>
				</p>
				<p>
					<a href="../../../api/module_indent_indentblock-IndentBlock.html">
						<code class="nowrap">IndentBlock</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>$block</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="margin-left:*; margin-right:*"&gt;</code>
				</p>
				<p>
					By default, the plugin uses inline styles for indentation.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>$block</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="*"&gt;</code>
				</p>
				<p>
					If classes are defined in <code>config.indentBlock.classes</code>, they are used instead of inline styles.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-language</code>
			</td>
			<td>
				<p>
					<a href="../../../features/language.html">
						Text part language
					</a>
				</p>
				<p>
					<a href="../../../api/module_language_textpartlanguage-TextPartLanguage.html">
						<code class="nowrap">TextPartLanguage</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>span</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>dir</strong>="*" <strong>lang</strong>="*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="5">
				<code class="nowrap">ckeditor5-link</code>
			</td>
			<td>
				<p>
					<a href="../../../features/link.html#autolink-feature">
						Autolink
					</a>
				</p>
				<p>
					<a href="../../../api/module_link_autolink-AutoLink.html">
						<code class="nowrap">AutoLink</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="3">
				<p>
					<a href="../../../features/link.html">
						Link
					</a>
				</p>
				<p>
					<a href="../../../api/module_link_link-Link.html">
						<code class="nowrap">Link</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>a</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>href</strong>="*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>a</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>rel</strong>="*" <strong>target</strong>="*"&gt;</code>
				</p>
				<p>
					If <code>config.link.addTargetToExternalLinks</code> is enabled, then the external links are decorated with <code>rel</code> and <code>target</code> attributes.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>a</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="*"&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="*:*"&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>*</strong>="*"&gt;</code>
				</p>
				<p>
					The plugin can be configured to set any classes, styles or attributes on the <code>&lt;a&gt;</code> tag via custom <code>config.link.decorators</code> configuration.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/image.html#linking-images">
						Link image
					</a>
				</p>
				<p>
					<a href="../../../api/module_link_linkimage-LinkImage.html">
						<code class="nowrap">LinkImage</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>a</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>href</strong>="*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="8">
				<code class="nowrap">ckeditor5-list</code>
			</td>
			<td rowspan="2">
				<p>
					<a href="../../../features/lists/lists.html">
						List
					</a>
				</p>
				<p>
					<a href="../../../api/module_list_list-List.html">
						<code class="nowrap">List</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>ol</strong>&gt;</code>, <code>&lt;<strong>ul</strong>&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>li</strong>&gt;</code>
				</p>
				<p>
					HTML element may contain classes, styles or attributes, that are created by other plugins, which alter the <code>&lt;$block&gt;</code> element.
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="5">
				<p>
					<a href="../../../features/lists/todo-lists.html">
						Todo list
					</a>
				</p>
				<p>
					<a href="../../../api/module_list_todolist-TodoList.html">
						<code class="nowrap">TodoList</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>ul</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="todo-list"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>li</strong>&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>label</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="todo-list__label"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>span</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="todo-list__label__description"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>input</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>checked</strong>="*" <strong>disabled</strong>="*" <strong>type</strong>="*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/lists/lists.html#list-styles">
						List style
					</a>
				</p>
				<p>
					<a href="../../../api/module_list_liststyle-ListStyle.html">
						<code class="nowrap">ListStyle</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>ol</strong>&gt;</code>, <code>&lt;<strong>ul</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="list-style-type:*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-markdown-gfm</code>
			</td>
			<td>
				<p>
					<a href="../../../features/markdown.html">
						Markdown
					</a>
				</p>
				<p>
					<a href="../../../api/module_markdown-gfm_markdown-Markdown.html">
						<code class="nowrap">Markdown</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="8">
				<code class="nowrap">ckeditor5-media-embed</code>
			</td>
			<td rowspan="7">
				<p>
					<a href="../../../features/media-embed.html">
						Media embed
					</a>
				</p>
				<p>
					<a href="../../../api/module_media-embed_mediaembed-MediaEmbed.html">
						<code class="nowrap">MediaEmbed</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>figure</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="media"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>oembed</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>url</strong>="*"&gt;</code>
				</p>
				<p>
					If <code>config.mediaEmbed.previewsInData</code> is turned off, the media preview is not displayed and the media is represented using only the <code>&lt;oembed&gt;</code> tag (by default).
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>div</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>data-oembed-url</strong>="*"&gt;</code>
				</p>
				<p>
					If <code>config.mediaEmbed.previewsInData</code> is turned on, the media preview is displayed in the view.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>*</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>url</strong>="*"&gt;</code>
				</p>
				<p>
					If preview configuration <code>config.mediaEmbed.previewsInData</code> is turned off, the plugin can be configured to return any element name specified by <code>config.mediaEmbed.elementName</code>.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>div</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="height:*; padding-bottom:*; position:*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>iframe</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="height:*; left:*; position:*; top:*; width:*"&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>*allow*</strong>="*" <strong>frameborder</strong>="*" <strong>src</strong>="*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>*</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="*"&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="*:*"&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>*</strong>="*"&gt;</code>
				</p>
				<p>
					The plugin can be configured to return any element with any class, inline style, and attribute, via <code>config.mediaEmbed.providers</code> for previewable media.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/media-embed.html">
						Media embed toolbar
					</a>
				</p>
				<p>
					<a href="../../../api/module_media-embed_mediaembedtoolbar-MediaEmbedToolbar.html">
						<code class="nowrap">MediaEmbedToolbar</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-mention</code>
			</td>
			<td>
				<p>
					<a href="../../../features/mentions.html">
						Mention
					</a>
				</p>
				<p>
					<a href="../../../api/module_mention_mention-Mention.html">
						<code class="nowrap">Mention</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>span</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="mention"&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>data-mention</strong>="*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="2">
				<code class="nowrap">ckeditor5-page-break</code>
			</td>
			<td rowspan="2">
				<p>
					<a href="../../../features/page-break.html">
						Page break
					</a>
				</p>
				<p>
					<a href="../../../api/module_page-break_pagebreak-PageBreak.html">
						<code class="nowrap">PageBreak</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>div</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="page-break"&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="page-break-after:*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>span</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="display:*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-paragraph</code>
			</td>
			<td>
				<p>
					Paragraph
				</p>
				<p>
					<a href="../../../api/module_paragraph_paragraph-Paragraph.html">
						<code class="nowrap">Paragraph</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>p</strong>&gt;</code>
				</p>
				<p>
					HTML element may contain classes, styles or attributes, that are created by other plugins, which alter the <code>&lt;$block&gt;</code> element.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-paste-from-office</code>
			</td>
			<td>
				<p>
					<a href="../../../features/pasting/paste-from-word.html">
						Paste from office
					</a>
				</p>
				<p>
					<a href="../../../api/module_paste-from-office_pastefromoffice-PasteFromOffice.html">
						<code class="nowrap">PasteFromOffice</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-remove-format</code>
			</td>
			<td>
				<p>
					<a href="../../../features/remove-format.html">
						Remove format
					</a>
				</p>
				<p>
					<a href="../../../api/module_remove-format_removeformat-RemoveFormat.html">
						<code class="nowrap">RemoveFormat</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="2">
				<code class="nowrap">ckeditor5-restricted-editing</code>
			</td>
			<td>
				<p>
					<a href="../../../features/restricted-editing.html">
						Restricted editing mode
					</a>
				</p>
				<p>
					<a href="../../../api/module_restricted-editing_restrictededitingmode-RestrictedEditingMode.html">
						<code class="nowrap">RestrictedEditingMode</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>span</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="restricted-editing-exception"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/restricted-editing.html#running-the-standard-editing-mode">
						Standard editing mode
					</a>
				</p>
				<p>
					<a href="../../../api/module_restricted-editing_standardeditingmode-StandardEditingMode.html">
						<code class="nowrap">StandardEditingMode</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>span</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="restricted-editing-exception"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="7">
				<code class="nowrap">ckeditor5-special-characters</code>
			</td>
			<td>
				<p>
					<a href="../../../features/special-characters.html">
						Special characters
					</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharacters-SpecialCharacters.html">
						<code class="nowrap">SpecialCharacters</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/special-characters.html">
						Special characters essentials
					</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharactersessentials-SpecialCharactersEssentials.html">
						<code class="nowrap">SpecialCharactersEssentials</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/special-characters.html">
						Special characters arrows
					</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharactersarrows-SpecialCharactersArrows.html">
						<code class="nowrap">SpecialCharactersArrows</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/special-characters.html">
						Special characters currency
					</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharacterscurrency-SpecialCharactersCurrency.html">
						<code class="nowrap">SpecialCharactersCurrency</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/special-characters.html">
						Special characters latin
					</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharacterslatin-SpecialCharactersLatin.html">
						<code class="nowrap">SpecialCharactersLatin</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/special-characters.html">
						Special characters mathematical
					</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharactersmathematical-SpecialCharactersMathematical.html">
						<code class="nowrap">SpecialCharactersMathematical</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/special-characters.html">
						Special characters text
					</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharacterstext-SpecialCharactersText.html">
						<code class="nowrap">SpecialCharactersText</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="7">
				<code class="nowrap">ckeditor5-table</code>
			</td>
			<td rowspan="3">
				<p>
					<a href="../../../features/table.html">
						Table
					</a>
				</p>
				<p>
					<a href="../../../api/module_table_table-Table.html">
						<code class="nowrap">Table</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>figure</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>class</strong>="table"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>table</strong>&gt;</code>, <code>&lt;<strong>thead</strong>&gt;</code>, <code>&lt;<strong>tbody</strong>&gt;</code>, <code>&lt;<strong>tr</strong>&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>td</strong>&gt;</code>, <code>&lt;<strong>th</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>colspan</strong>="*" <strong>rowspan</strong>="*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/table.html#table-and-cell-styling-tools">
						Table cell properties
					</a>
				</p>
				<p>
					<a href="../../../api/module_table_tablecellproperties-TableCellProperties.html">
						<code class="nowrap">TableCellProperties</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>td</strong>&gt;</code>, <code>&lt;<strong>th</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="background-color:*; border:*; border-*:*; height:*; padding:*; text-align:*; vertical-align:*; width:*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="2">
				<p>
					<a href="../../../features/table.html#table-and-cell-styling-tools">
						Table properties
					</a>
				</p>
				<p>
					<a href="../../../api/module_table_tableproperties-TableProperties.html">
						<code class="nowrap">TableProperties</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>figure</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="float:*; height:*; width:*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>table</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="background-color:*; border:*; border-*:*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/table.html#toolbars">
						Table toolbar
					</a>
				</p>
				<p>
					<a href="../../../api/module_table_tabletoolbar-TableToolbar.html">
						<code class="nowrap">TableToolbar</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-typing</code>
			</td>
			<td>
				<p>
					<a href="../../../features/text-transformation.html">
						Text transformation
					</a>
				</p>
				<p>
					<a href="../../../api/module_typing_texttransformation-TextTransformation.html">
						<code class="nowrap">TextTransformation</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-ui</code>
			</td>
			<td>
				<p>
					<a href="../../../features/toolbar/blocktoolbar.html">
						Block toolbar
					</a>
				</p>
				<p>
					<a href="../../../api/module_ui_toolbar_block_blocktoolbar-BlockToolbar.html">
						<code class="nowrap">BlockToolbar</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="2">
				<code class="nowrap">ckeditor5-upload</code>
			</td>
			<td>
				<p>
					<a href="../../../features/image-upload/base64-upload-adapter.html">
						Base64 upload adapter
					</a>
				</p>
				<p>
					<a href="../../../api/module_upload_adapters_base64uploadadapter-Base64UploadAdapter.html">
						<code class="nowrap">Base64UploadAdapter</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<a href="../../../features/image-upload/simple-upload-adapter.html">
						Simple upload adapter
					</a>
				</p>
				<p>
					<a href="../../../api/module_upload_adapters_simpleuploadadapter-SimpleUploadAdapter.html">
						<code class="nowrap">SimpleUploadAdapter</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-watchdog</code>
			</td>
			<td>
				<p>
					<a href="../../../features/watchdog.html">
						Watchdog
					</a>
				</p>
				<p>
					<a href="../../../api/module_watchdog_editorwatchdog-EditorWatchdog.html">
						<code class="nowrap">EditorWatchdog</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-word-count</code>
			</td>
			<td>
				<p>
					<a href="../../../features/word-count.html">
						Word count
					</a>
				</p>
				<p>
					<a href="../../../api/module_word-count_wordcount-WordCount.html">
						<code class="nowrap">WordCount</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
