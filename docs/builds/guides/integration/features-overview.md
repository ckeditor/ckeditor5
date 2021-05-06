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
					<a href="../../../features/image-upload/image-upload.html#ckfinder" data-skip-validation>
						CKFinder Upload Adapter
					</a>
				</p>
				<p>
					<a href="../../../api/module_adapter-ckfinder_uploadadapter-CKFinderUploadAdapter.html" data-skip-validation>
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
					<a href="../../../features/image-upload/image-upload.html#ckfinder" data-skip-validation>
						Alignment
					</a>
				</p>
				<p>
					<a href="../../../api/module_alignment_alignment-Alignment.html" data-skip-validation>
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
					<a href="../../../features/autoformat.html" data-skip-validation>
						Autoformat
					</a>
				</p>
				<p>
					<a href="../../../api/module_autoformat_autoformat-Autoformat.html" data-skip-validation>
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
					<a href="../../../builds/guides/integration/saving-data.html#autosave-feature" data-skip-validation>
						Autosave
					</a>
				</p>
				<p>
					<a href="../../../api/module_autosave_autosave-Autosave.html" data-skip-validation>
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
					<a href="../../../features/basic-styles.html" data-skip-validation>
						Bold
					</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_bold-Bold.html" data-skip-validation>
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
					<a href="../../../features/basic-styles.html" data-skip-validation>
						Code
					</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_code-Code.html" data-skip-validation>
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
					<a href="../../../features/basic-styles.html" data-skip-validation>
						Italic
					</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_italic-Italic.html" data-skip-validation>
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
					<a href="../../../features/basic-styles.html" data-skip-validation>
						Strikethrough
					</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_strikethrough-Strikethrough.html" data-skip-validation>
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
					<a href="../../../features/basic-styles.html" data-skip-validation>
						Subscript
					</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_subscript-Subscript.html" data-skip-validation>
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
					<a href="../../../features/basic-styles.html" data-skip-validation>
						Superscript
					</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_superscript-Superscript.html" data-skip-validation>
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
					<a href="../../../features/basic-styles.html" data-skip-validation>
						Underline
					</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_underline-Underline.html" data-skip-validation>
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
					<a href="../../../features/block-quote.html" data-skip-validation>
						Block quote
					</a>
				</p>
				<p>
					<a href="../../../api/module_block-quote_blockquote-BlockQuote.html" data-skip-validation>
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
					<a href="../../../features/image-upload/ckfinder.html" data-skip-validation>
						CKFinder
					</a>
				</p>
				<p>
					<a href="../../../api/module_ckfinder_ckfinder-CKFinder.html" data-skip-validation>
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
					<a href="https://ckeditor.com/ckeditor-cloud-services" data-skip-validation>
						Cloud Services
					</a>
				</p>
				<p>
					<a href="../../../api/module_cloud-services_cloudservices-CloudServices.html" data-skip-validation>
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
					<a href="../../../features/code-blocks.html" data-skip-validation>
						Code block
					</a>
				</p>
				<p>
					<a href="../../../api/module_code-block_codeblock-CodeBlock.html" data-skip-validation>
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
					By default, the language of the code block is represented as a CSS class prefixed by <code>language-</code>. CSS class name can be customized via <code>config.codeBlock.languages</code> array.
				</p>
			</td>
		</tr>
		<tr>
			<td rowspan="3">
				<code class="nowrap">ckeditor5-comments</code>
			</td>
			<td rowspan="3">
				<p>
					<a href="../../../features/collaboration/comments/comments.html" data-skip-validation>
						Comments
					</a>
				</p>
				<p>
					<a href="../../../api/module_comments_comments-Comments.html" data-skip-validation>
						<code class="nowrap">Comments</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>comment</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>id</strong>="*" <strong>type</strong>="*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>comment-end</strong>&gt;</code>, <code>&lt;<strong>comment-start</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>name</strong>="*"&gt;</code>
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<p>
					<code>&lt;<strong>*</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>data-comment-end-after</strong>="*" <strong>data-comment-start-before</strong>="*"&gt;</code>
				</p>
				<p>
					The plugin adds <code>data-comment-end-after</code> and <code>data-comment-start-before</code> attributes to other elements on which comments starts or ends.
				</p>
			</td>
		</tr>
		<tr>
			<td>
				<code class="nowrap">ckeditor5-easy-image</code>
			</td>
			<td>
				<p>
					<a href="../../../features/image-upload/easy-image.html" data-skip-validation>
						Easy Image
					</a>
				</p>
				<p>
					<a href="../../../api/module_easy-image_easyimage-EasyImage.html" data-skip-validation>
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
					<a href="../../../api/module_essentials_essentials-Essentials.html" data-skip-validation>
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
			<td>
				<code class="nowrap">ckeditor5-export-pdf</code>
			</td>
			<td>
				<p>
					<a href="../../../features/export-pdf.html" data-skip-validation>
						Export to PDF
					</a>
				</p>
				<p>
					<a href="../../../api/module_export-pdf_exportpdf-ExportPdf.html" data-skip-validation>
						<code class="nowrap">ExportPdf</code>
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
				<code class="nowrap">ckeditor5-export-word</code>
			</td>
			<td>
				<p>
					<a href="../../../features/export-word.html" data-skip-validation>
						Export to Word
					</a>
				</p>
				<p>
					<a href="../../../api/module_export-word_exportword-ExportWord.html" data-skip-validation>
						<code class="nowrap">ExportWord</code>
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
				<code class="nowrap">ckeditor5-font</code>
			</td>
			<td>
				<p>
					<a href="../../../features/font.html#configuring-the-font-color-and-font-background-color-features" data-skip-validation>
						Font background color
					</a>
				</p>
				<p>
					<a href="../../../api/module_font_fontbackgroundcolor-FontBackgroundColor.html" data-skip-validation>
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
					<a href="../../../features/font.html#configuring-the-font-color-and-font-background-color-features" data-skip-validation>
						Font color
					</a>
				</p>
				<p>
					<a href="../../../api/module_font_fontcolor-FontColor.html" data-skip-validation>
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
					<a href="../../../features/font.html#configuring-the-font-size-feature" data-skip-validation>
						Font size
					</a>
				</p>
				<p>
					<a href="../../../api/module_font_fontsize-FontSize.html" data-skip-validation>
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
					<a href="../../../features/font.html#configuring-the-font-family-feature" data-skip-validation>
						Font family
					</a>
				</p>
				<p>
					<a href="../../../api/module_font_fontfamily-FontFamily.html" data-skip-validation>
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
					<a href="../../../features/title.html" data-skip-validation>
						Title
					</a>
				</p>
				<p>
					<a href="../../../api/module_heading_title-Title.html" data-skip-validation>
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
					<a href="../../../features/headings.html" data-skip-validation>
						Heading
					</a>
				</p>
				<p>
					<a href="../../../api/module_heading_heading-Heading.html" data-skip-validation>
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
					<a href="../../../features/highlight.html" data-skip-validation>
						Highlight
					</a>
				</p>
				<p>
					<a href="../../../api/module_highlight_highlight-Highlight.html" data-skip-validation>
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
					<a href="../../../features/horizontal-line.html" data-skip-validation>
						Horizontal line
					</a>
				</p>
				<p>
					<a href="../../../api/module_horizontal-line_horizontalline-HorizontalLine.html" data-skip-validation>
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
					<a href="../../../features/html-embed.html" data-skip-validation>
						HTML embed
					</a>
				</p>
				<p>
					<a href="../../../api/module_html-embed_htmlembed-HtmlEmbed.html" data-skip-validation>
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
					<a href="../../../features/image.html#inserting-images-via-pasting-url-into-editor" data-skip-validation>
						Auto image
					</a>
				</p>
				<p>
					<a href="../../../api/module_image_autoimage-AutoImage.html" data-skip-validation>
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
					<a href="../../../features/image.html" data-skip-validation>
						Image
					</a>
				</p>
				<p>
					<a href="../../../api/module_image_image-Image.html" data-skip-validation>
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
					<a href="../../../features/image.html#image-captions" data-skip-validation>
						Image caption
					</a>
				</p>
				<p>
					<a href="../../../api/module_image_imagecaption-ImageCaption.html" data-skip-validation>
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
					<a href="../../../features/image.html#resizing-images" data-skip-validation>
						Image resize
					</a>
				</p>
				<p>
					<a href="../../../api/module_image_imageresize-ImageResize.html" data-skip-validation>
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
					<a href="../../../features/image.html#image-styles" data-skip-validation>
						Image style
					</a>
				</p>
				<p>
					<a href="../../../api/module_image_imagestyle-ImageStyle.html" data-skip-validation>
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
					<a href="../../../features/image.html#image-contextual-toolbar" data-skip-validation>
						Image toolbar
					</a>
				</p>
				<p>
					<a href="../../../api/module_image_imagetoolbar-ImageToolbar.html" data-skip-validation>
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
					<a href="../../../features/image.html#image-upload" data-skip-validation>
						Image upload
					</a>
				</p>
				<p>
					<a href="../../../api/module_image_imageupload-ImageUpload.html" data-skip-validation>
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
					<a href="../../../features/image.html#inserting-images-via-source-url" data-skip-validation>
						Image insert
					</a>
				</p>
				<p>
					<a href="../../../api/module_image_imageinsert-ImageInsert.html" data-skip-validation>
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
					<a href="../../../features/indent.html" data-skip-validation>
						Indent
					</a>
				</p>
				<p>
					<a href="../../../api/module_indent_indent-Indent.html" data-skip-validation>
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
					<a href="../../../features/indent.html" data-skip-validation>
						Indent block
					</a>
				</p>
				<p>
					<a href="../../../api/module_indent_indentblock-IndentBlock.html" data-skip-validation>
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
					<a href="../../../features/language.html" data-skip-validation>
						Text part language
					</a>
				</p>
				<p>
					<a href="../../../api/module_language_textpartlanguage-TextPartLanguage.html" data-skip-validation>
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
					<a href="../../../features/link.html#autolink-feature" data-skip-validation>
						Autolink
					</a>
				</p>
				<p>
					<a href="../../../api/module_link_autolink-AutoLink.html" data-skip-validation>
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
					<a href="../../../features/link.html" data-skip-validation>
						Link
					</a>
				</p>
				<p>
					<a href="../../../api/module_link_link-Link.html" data-skip-validation>
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
					<a href="../../../features/image.html#linking-images" data-skip-validation>
						Link image
					</a>
				</p>
				<p>
					<a href="../../../api/module_link_linkimage-LinkImage.html" data-skip-validation>
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
					<a href="../../../features/lists/lists.html" data-skip-validation>
						List
					</a>
				</p>
				<p>
					<a href="../../../api/module_list_list-List.html" data-skip-validation>
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
					<a href="../../../features/lists/todo-lists.html" data-skip-validation>
						Todo list
					</a>
				</p>
				<p>
					<a href="../../../api/module_list_todolist-TodoList.html" data-skip-validation>
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
					<a href="../../../features/lists/lists.html#list-styles" data-skip-validation>
						List style
					</a>
				</p>
				<p>
					<a href="../../../api/module_list_liststyle-ListStyle.html" data-skip-validation>
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
					<a href="../../../features/markdown.html" data-skip-validation>
						Markdown
					</a>
				</p>
				<p>
					<a href="../../../api/module_markdown-gfm_markdown-Markdown.html" data-skip-validation>
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
					<a href="../../../features/media-embed.html" data-skip-validation>
						Media embed
					</a>
				</p>
				<p>
					<a href="../../../api/module_media-embed_mediaembed-MediaEmbed.html" data-skip-validation>
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
					<a href="../../../features/media-embed.html" data-skip-validation>
						Media embed toolbar
					</a>
				</p>
				<p>
					<a href="../../../api/module_media-embed_mediaembedtoolbar-MediaEmbedToolbar.html" data-skip-validation>
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
					<a href="../../../features/mentions.html" data-skip-validation>
						Mention
					</a>
				</p>
				<p>
					<a href="../../../api/module_mention_mention-Mention.html" data-skip-validation>
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
					<a href="../../../features/page-break.html" data-skip-validation>
						Page break
					</a>
				</p>
				<p>
					<a href="../../../api/module_page-break_pagebreak-PageBreak.html" data-skip-validation>
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
				<code class="nowrap">ckeditor5-pagination</code>
			</td>
			<td>
				<p>
					<a href="../../../features/pagination.html" data-skip-validation>
						Pagination
					</a>
				</p>
				<p>
					<a href="../../../api/module_pagination_pagination-Pagination.html" data-skip-validation>
						<code class="nowrap">Pagination</code>
					</a>
				</p>
			</td>
			<td>
				<p>
					<code>&lt;<strong>*</strong>&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>style</strong>="page-break-before:*"&gt;</code>
				</p>
				<p>
					<code>&lt;… <strong>data-pagination-page</strong>="*"&gt;</code>
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
					<a href="../../../api/module_paragraph_paragraph-Paragraph.html" data-skip-validation>
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
					<a href="../../../features/pasting/paste-from-word.html" data-skip-validation>
						Paste from office
					</a>
				</p>
				<p>
					<a href="../../../api/module_paste-from-office_pastefromoffice-PasteFromOffice.html" data-skip-validation>
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
			<td rowspan="4">
				<code class="nowrap">ckeditor5-real-time-collaboration</code>
			</td>
			<td>
				<p>
					<a href="../../../features/collaboration/real-time-collaboration/users-in-real-time-collaboration.html#users-presence-list" data-skip-validation>
						Presence list
					</a>
				</p>
				<p>
					<a href="../../../api/module_real-time-collaboration_presencelist-PresenceList.html" data-skip-validation>
						<code class="nowrap">PresenceList</code>
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
					<a href="../../../features/collaboration/comments/comments.html" data-skip-validation>
						Real-time collaborative comments
					</a>
				</p>
				<p>
					<a href="../../../api/module_real-time-collaboration_realtimecollaborativecomments-RealTimeCollaborativeComments.html" data-skip-validation>
						<code class="nowrap">RealTimeCollaborativeComments</code>
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
					<a href="../../../features/collaboration/real-time-collaboration/real-time-collaboration.html" data-skip-validation>
						Real-time collaborative editing
					</a>
				</p>
				<p>
					<a href="../../../api/module_real-time-collaboration_realtimecollaborativeediting-RealTimeCollaborativeEditing.html" data-skip-validation>
						<code class="nowrap">RealTimeCollaborativeEditing</code>
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
					<a href="../../../features/collaboration/track-changes/track-changes.html" data-skip-validation>
						Real-time collaborative track changes
					</a>
				</p>
				<p>
					<a href="../../../api/module_real-time-collaboration_realtimecollaborativetrackchanges-RealTimeCollaborativeTrackChanges.html" data-skip-validation>
						<code class="nowrap">RealTimeCollaborativeTrackChanges</code>
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
					<a href="../../../features/remove-format.html" data-skip-validation>
						Remove format
					</a>
				</p>
				<p>
					<a href="../../../api/module_remove-format_removeformat-RemoveFormat.html" data-skip-validation>
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
					<a href="../../../features/restricted-editing.html" data-skip-validation>
						Restricted editing mode
					</a>
				</p>
				<p>
					<a href="../../../api/module_restricted-editing_restrictededitingmode-RestrictedEditingMode.html" data-skip-validation>
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
					<a href="../../../features/restricted-editing.html#running-the-standard-editing-mode" data-skip-validation>
						Standard editing mode
					</a>
				</p>
				<p>
					<a href="../../../api/module_restricted-editing_standardeditingmode-StandardEditingMode.html" data-skip-validation>
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
					<a href="../../../features/special-characters.html" data-skip-validation>
						Special characters
					</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharacters-SpecialCharacters.html" data-skip-validation>
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
					<a href="../../../features/special-characters.html" data-skip-validation>
						Special characters essentials
					</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharactersessentials-SpecialCharactersEssentials.html" data-skip-validation>
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
					<a href="../../../features/special-characters.html" data-skip-validation>
						Special characters arrows
					</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharactersarrows-SpecialCharactersArrows.html" data-skip-validation>
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
					<a href="../../../features/special-characters.html" data-skip-validation>
						Special characters currency
					</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharacterscurrency-SpecialCharactersCurrency.html" data-skip-validation>
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
					<a href="../../../features/special-characters.html" data-skip-validation>
						Special characters latin
					</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharacterslatin-SpecialCharactersLatin.html" data-skip-validation>
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
					<a href="../../../features/special-characters.html" data-skip-validation>
						Special characters mathematical
					</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharactersmathematical-SpecialCharactersMathematical.html" data-skip-validation>
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
					<a href="../../../features/special-characters.html" data-skip-validation>
						Special characters text
					</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharacterstext-SpecialCharactersText.html" data-skip-validation>
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
					<a href="../../../features/table.html" data-skip-validation>
						Table
					</a>
				</p>
				<p>
					<a href="../../../api/module_table_table-Table.html" data-skip-validation>
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
					<a href="../../../features/table.html#table-and-cell-styling-tools" data-skip-validation>
						Table cell properties
					</a>
				</p>
				<p>
					<a href="../../../api/module_table_tablecellproperties-TableCellProperties.html" data-skip-validation>
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
					<a href="../../../features/table.html#table-and-cell-styling-tools" data-skip-validation>
						Table properties
					</a>
				</p>
				<p>
					<a href="../../../api/module_table_tableproperties-TableProperties.html" data-skip-validation>
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
					<a href="../../../features/table.html#toolbars" data-skip-validation>
						Table toolbar
					</a>
				</p>
				<p>
					<a href="../../../api/module_table_tabletoolbar-TableToolbar.html" data-skip-validation>
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
				<code class="nowrap">ckeditor5-track-changes</code>
			</td>
			<td>
				<p>
					<a href="../../../features/collaboration/track-changes/track-changes.html" data-skip-validation>
						Track changes
					</a>
				</p>
				<p>
					<a href="../../../api/module_track-changes_trackchanges-TrackChanges.html" data-skip-validation>
						<code class="nowrap">TrackChanges</code>
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
					<a href="../../../features/text-transformation.html" data-skip-validation>
						Text transformation
					</a>
				</p>
				<p>
					<a href="../../../api/module_typing_texttransformation-TextTransformation.html" data-skip-validation>
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
					<a href="../../../features/toolbar/blocktoolbar.html" data-skip-validation>
						Block toolbar
					</a>
				</p>
				<p>
					<a href="../../../api/module_ui_toolbar_block_blocktoolbar-BlockToolbar.html" data-skip-validation>
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
					<a href="../../../features/image-upload/base64-upload-adapter.html" data-skip-validation>
						Base64 upload adapter
					</a>
				</p>
				<p>
					<a href="../../../api/module_upload_adapters_base64uploadadapter-Base64UploadAdapter.html" data-skip-validation>
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
					<a href="../../../features/image-upload/simple-upload-adapter.html" data-skip-validation>
						Simple upload adapter
					</a>
				</p>
				<p>
					<a href="../../../api/module_upload_adapters_simpleuploadadapter-SimpleUploadAdapter.html" data-skip-validation>
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
					<a href="../../../features/watchdog.html" data-skip-validation>
						Watchdog
					</a>
				</p>
				<p>
					<a href="../../../api/module_watchdog_editorwatchdog-EditorWatchdog.html" data-skip-validation>
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
					<a href="../../../features/word-count.html" data-skip-validation>
						Word count
					</a>
				</p>
				<p>
					<a href="../../../api/module_word-count_wordcount-WordCount.html" data-skip-validation>
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
