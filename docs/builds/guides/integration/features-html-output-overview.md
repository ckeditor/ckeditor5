---
menu-title: Features' HTML output
category: builds-integration
order: 90
modified_at: 2021-06-07
---

# Features' HTML output overview

Listed below are all official CKEditor 5 packages as well as some partner packages together with their possible HTML output. If a plugin generates a different HTML output depending on its configuration, it is described in the "HTML output" column.

The classes, styles or attributes applied to an HTML element are all **possible** results. It does not mean they all will always be used.

If a given plugin does not generate any output, the "HTML output" is described as "None".  Wildcard character `*` means any value is possible.

The data used to generate the following tables comes from the package metadata. You can read more about it in the {@link framework/guides/contributing/package-metadata package metadata} guide.

<style>
	table.features-html-output p {
		padding: 0;
	}

	table.features-html-output th.plugin {
		width: 33.333%;
	}

	table.features-html-output td.plugin a,
	table.features-html-output td.plugin code {
		white-space: nowrap;
	}

	table.features-html-output td.html-output > code {
		display: block;
		padding: 0;
		background: none;
		white-space: pre-wrap;
	}

	table.features-html-output td.html-output > code + * {
		margin-top: 1em;
	}
</style>

<!-- Do not edit anything below this comment, as it will be overwritten. Edit the ckeditor5-metadata.json files for respective images instead. -->

<!-- Do not delete the comment below as it indicates the place where the features HTML output will be stored. -->

<!-- features-html-output-marker -->
<h3 id="ckeditor5-adapter-ckfinder"><code>ckeditor5-adapter-ckfinder</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-adapter-ckfinder/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-adapter-ckfinder/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/images/image-upload/image-upload.html#ckfinder">CKFinder Upload Adapter</a>
				</p>
				<p>
					<a href="../../../api/module_adapter-ckfinder_uploadadapter-CKFinderUploadAdapter.html"><code>CKFinderUploadAdapter</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-alignment"><code>ckeditor5-alignment</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-alignment/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-alignment/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin" rowspan="2">
				<p>
					<a href="../../../features/text-alignment.html">Alignment</a>
				</p>
				<p>
					<a href="../../../api/module_alignment_alignment-Alignment.html"><code>Alignment</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>$block</strong> <strong>style</strong>="text-align:*"&gt;</code>
				<p>
					By default, the alignment feature uses the <code>text-align</code> inline style.
				</p>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>$block</strong> <strong>class</strong>="*"&gt;</code>
				<p>
					If <code>config.alignment.options</code> is set, these classes are used for alignment instead of inline styles.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-autoformat"><code>ckeditor5-autoformat</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-autoformat/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-autoformat/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/autoformat.html">Autoformat</a>
				</p>
				<p>
					<a href="../../../api/module_autoformat_autoformat-Autoformat.html"><code>Autoformat</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-autosave"><code>ckeditor5-autosave</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-autosave/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-autosave/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../builds/guides/integration/saving-data.html#autosave-feature">Autosave</a>
				</p>
				<p>
					<a href="../../../api/module_autosave_autosave-Autosave.html"><code>Autosave</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-basic-styles"><code>ckeditor5-basic-styles</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-basic-styles/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-basic-styles/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/basic-styles.html">Bold</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_bold-Bold.html"><code>Bold</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>strong</strong>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/basic-styles.html">Code</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_code-Code.html"><code>Code</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>code</strong>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/basic-styles.html">Italic</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_italic-Italic.html"><code>Italic</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>i</strong>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/basic-styles.html">Strikethrough</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_strikethrough-Strikethrough.html"><code>Strikethrough</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>s</strong>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/basic-styles.html">Subscript</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_subscript-Subscript.html"><code>Subscript</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>sub</strong>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/basic-styles.html">Superscript</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_superscript-Superscript.html"><code>Superscript</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>sup</strong>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/basic-styles.html">Underline</a>
				</p>
				<p>
					<a href="../../../api/module_basic-styles_underline-Underline.html"><code>Underline</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>u</strong>&gt;</code>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-block-quote"><code>ckeditor5-block-quote</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-block-quote/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-block-quote/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/block-quote.html">Block quote</a>
				</p>
				<p>
					<a href="../../../api/module_block-quote_blockquote-BlockQuote.html"><code>BlockQuote</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>blockquote</strong>&gt;</code>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-ckfinder"><code>ckeditor5-ckfinder</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-ckfinder/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-ckfinder/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/images/image-upload/ckfinder.html">CKFinder</a>
				</p>
				<p>
					<a href="../../../api/module_ckfinder_ckfinder-CKFinder.html"><code>CKFinder</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-cloud-services"><code>ckeditor5-cloud-services</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-cloud-services/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-cloud-services/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="https://ckeditor.com/ckeditor-cloud-services">Cloud Services</a>
				</p>
				<p>
					<a href="../../../api/module_cloud-services_cloudservices-CloudServices.html"><code>CloudServices</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-code-block"><code>ckeditor5-code-block</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-code-block/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-code-block/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin" rowspan="2">
				<p>
					<a href="../../../features/code-blocks.html">Code blocks</a>
				</p>
				<p>
					<a href="../../../api/module_code-block_codeblock-CodeBlock.html"><code>CodeBlock</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>pre</strong>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>code</strong> <strong>class</strong>="* language-*"&gt;</code>
				<p>
					By default, the language of the code block is represented as a CSS class prefixed by <code>language-</code>. The CSS class name can be customized via the <code>config.codeBlock.languages</code> array.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-comments"><code>ckeditor5-comments</code></h3>
<p>
	Source file: <code>@ckeditor/ckeditor5-comments/ckeditor5-metadata.json</code>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin" rowspan="3">
				<p>
					<a href="../../../features/collaboration/comments/comments.html" data-skip-validation>Comments</a>
				</p>
				<p>
					<a href="../../../api/module_comments_comments-Comments.html" data-skip-validation><code>Comments</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>comment</strong><br>    <strong>id</strong>="*"<br>    <strong>type</strong>="*"<br>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>comment-end</strong> <strong>name</strong>="*"&gt;</code><code>&lt;<strong>comment-start</strong> <strong>name</strong>="*"&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>*</strong><br>    <strong>data-comment-end-after</strong>="*"<br>    <strong>data-comment-start-before</strong>="*"<br>&gt;</code>
				<p>
					The plugin adds <code>data-comment-end-after</code> and <code>data-comment-start-before</code> attributes to other elements on which comments starts or ends.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-easy-image"><code>ckeditor5-easy-image</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-easy-image/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-easy-image/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/images/image-upload/easy-image.html">Easy Image</a>
				</p>
				<p>
					<a href="../../../api/module_easy-image_easyimage-EasyImage.html"><code>EasyImage</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-essentials"><code>ckeditor5-essentials</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-essentials/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-essentials/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					Essentials
				</p>
				<p>
					<a href="../../../api/module_essentials_essentials-Essentials.html"><code>Essentials</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>br</strong>&gt;</code>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-export-pdf"><code>ckeditor5-export-pdf</code></h3>
<p>
	Source file: <code>@ckeditor/ckeditor5-export-pdf/ckeditor5-metadata.json</code>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/export-pdf.html" data-skip-validation>Export to PDF</a>
				</p>
				<p>
					<a href="../../../api/module_export-pdf_exportpdf-ExportPdf.html" data-skip-validation><code>ExportPdf</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-export-word"><code>ckeditor5-export-word</code></h3>
<p>
	Source file: <code>@ckeditor/ckeditor5-export-word/ckeditor5-metadata.json</code>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/export-word.html" data-skip-validation>Export to Word</a>
				</p>
				<p>
					<a href="../../../api/module_export-word_exportword-ExportWord.html" data-skip-validation><code>ExportWord</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-find-and-replace"><code>ckeditor5-find-and-replace</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-find-and-replace/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-find-and-replace/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/find-and-replace.html">Find and replace</a>
				</p>
				<p>
					<a href="../../../api/module_find-and-replace_findandreplace-FindAndReplace.html"><code>FindAndReplace</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-font"><code>ckeditor5-font</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-font/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-font/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/font.html#configuring-the-font-color-and-font-background-color-features">Font background color</a>
				</p>
				<p>
					<a href="../../../api/module_font_fontbackgroundcolor-FontBackgroundColor.html"><code>FontBackgroundColor</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>span</strong> <strong>style</strong>="background-color:*"&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/font.html#configuring-the-font-color-and-font-background-color-features">Font color</a>
				</p>
				<p>
					<a href="../../../api/module_font_fontcolor-FontColor.html"><code>FontColor</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>span</strong> <strong>style</strong>="color:*"&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin" rowspan="3">
				<p>
					<a href="../../../features/font.html#configuring-the-font-size-feature">Font size</a>
				</p>
				<p>
					<a href="../../../api/module_font_fontsize-FontSize.html"><code>FontSize</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>span</strong> <strong>class</strong>="text-tiny text-small text-big text-huge"&gt;</code>
				<p>
					If the <code>config.fontSize.options</code> option is not set or it contains predefined named presets, the feature uses class names.
				</p>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>span</strong> <strong>style</strong>="font-size:*"&gt;</code>
				<p>
					If the <code>config.fontSize.options</code> option contains numerical values, the font size feature uses the <code>font-size</code> inline style.
				</p>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>*</strong><br>    <strong>class</strong>="*"<br>    <strong>style</strong>="*:*"<br>&gt;</code>
				<p>
					The plugin can be configured to return any element with any classes and any inline styles.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin" rowspan="2">
				<p>
					<a href="../../../features/font.html#configuring-the-font-family-feature">Font family</a>
				</p>
				<p>
					<a href="../../../api/module_font_fontfamily-FontFamily.html"><code>FontFamily</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>span</strong> <strong>style</strong>="font-family:*"&gt;</code>
				<p>
					By default, the font family feature uses the <code>font-family</code> inline style.
				</p>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>*</strong><br>    <strong>class</strong>="*"<br>    <strong>style</strong>="*:*"<br>&gt;</code>
				<p>
					The plugin can be configured to return any element with any classes and any inline styles.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-heading"><code>ckeditor5-heading</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-heading/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-heading/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/title.html">Title</a>
				</p>
				<p>
					<a href="../../../api/module_heading_title-Title.html"><code>Title</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>h1</strong>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin" rowspan="2">
				<p>
					<a href="../../../features/headings.html">Heading</a>
				</p>
				<p>
					<a href="../../../api/module_heading_heading-Heading.html"><code>Heading</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>h2</strong>&gt;</code><code>&lt;<strong>h3</strong>&gt;</code><code>&lt;<strong>h4</strong>&gt;</code>
				<p>
					HTML element may contain classes, styles or attributes, that are created by other plugins, which alter the <code>&lt;$block&gt;</code> element.
				</p>
				<p>
					The HTML element may contain classes, styles or attributes that are created by other plugins, which alter the &lt;code&gt;<code>$block</code></code> element.
				</p>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>*</strong>&gt;</code>
				<p>
					The plugin can be configured to return any element name as a heading.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-highlight"><code>ckeditor5-highlight</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-highlight/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-highlight/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin" rowspan="2">
				<p>
					<a href="../../../features/highlight.html">Highlight</a>
				</p>
				<p>
					<a href="../../../api/module_highlight_highlight-Highlight.html"><code>Highlight</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>mark</strong> <strong>class</strong>="marker-yellow marker-green marker-pink marker-blue pen-red pen-green"&gt;</code>
				<p>
					By default, this plugin has 4 markers and 2 pens preconfigured.
				</p>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>mark</strong> <strong>class</strong>="*"&gt;</code>
				<p>
					The plugin can be configured to set any classes on the <code>&lt;mark&gt;</code> element.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-horizontal-line"><code>ckeditor5-horizontal-line</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-horizontal-line/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-horizontal-line/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/horizontal-line.html">Horizontal line</a>
				</p>
				<p>
					<a href="../../../api/module_horizontal-line_horizontalline-HorizontalLine.html"><code>HorizontalLine</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>hr</strong>&gt;</code>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-html-embed"><code>ckeditor5-html-embed</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-html-embed/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-html-embed/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin" rowspan="2">
				<p>
					<a href="../../../features/html-embed.html">HTML embed</a>
				</p>
				<p>
					<a href="../../../api/module_html-embed_htmlembed-HtmlEmbed.html"><code>HtmlEmbed</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>div</strong> <strong>class</strong>="raw-html-embed"&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>*</strong><br>    <strong>class</strong>="*"<br>    <strong>style</strong>="*:*"<br>&gt;</code>
				<p>
					The plugin can output any arbitrary HTML provided by the user. That HTML is always wrapped with a <code>&lt;div class="raw-html-embed"&gt;</code> element.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-html-support"><code>ckeditor5-html-support</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-html-support/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-html-support/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/general-html-support.html">General HTML Support</a>
				</p>
				<p>
					<a href="../../../api/module_html-support_generalhtmlsupport-GeneralHtmlSupport.html"><code>GeneralHtmlSupport</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>*</strong><br>    <strong>class</strong>="*"<br>    <strong>style</strong>="*:*"<br>    <strong>*</strong>="*"<br>&gt;</code>
				<p>
					The plugin can output any arbitrary HTML configured by config.htmlSupport option.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					Data Filter
				</p>
				<p>
					<a href="../../../api/module_html-support_datafilter-DataFilter.html"><code>DataFilter</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>*</strong><br>    <strong>class</strong>="*"<br>    <strong>style</strong>="*:*"<br>    <strong>*</strong>="*"<br>&gt;</code>
				<p>
					The plugin can output any arbitrary HTML depending on its configuration.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					Data Schema
				</p>
				<p>
					<a href="../../../api/module_html-support_dataschema-DataSchema.html"><code>DataSchema</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-image"><code>ckeditor5-image</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-image/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-image/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/images/image-upload/images-inserting.html#inserting-images-via-pasting-url-into-editor">Auto image</a>
				</p>
				<p>
					<a href="../../../api/module_image_autoimage-AutoImage.html"><code>AutoImage</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin" rowspan="2">
				<p>
					<a href="../../../features/images/images-installation.html#inline-and-block-images">Block image</a>
				</p>
				<p>
					<a href="../../../api/module_image_imageblock-ImageBlock.html"><code>ImageBlock</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>figure</strong> <strong>class</strong>="image"&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>img</strong><br>    <strong>alt</strong>="*"<br>    <strong>sizes</strong>="*"<br>    <strong>src</strong>="*"<br>    <strong>srcset</strong>="*"<br>    <strong>width</strong>="*"<br>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/images/images-installation.html#inline-and-block-images">Inline image</a>
				</p>
				<p>
					<a href="../../../api/module_image_imageinline-ImageInline.html"><code>ImageInline</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>img</strong><br>    <strong>alt</strong>="*"<br>    <strong>sizes</strong>="*"<br>    <strong>src</strong>="*"<br>    <strong>srcset</strong>="*"<br>    <strong>width</strong>="*"<br>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/images/images-overview.html">Image</a>
				</p>
				<p>
					<a href="../../../api/module_image_image-Image.html"><code>Image</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/images/images-captions.html">Image caption</a>
				</p>
				<p>
					<a href="../../../api/module_image_imagecaption-ImageCaption.html"><code>ImageCaption</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>figcaption</strong>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/images/images-resizing.html">Image resize</a>
				</p>
				<p>
					<a href="../../../api/module_image_imageresize-ImageResize.html"><code>ImageResize</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>figure</strong><br>    <strong>class</strong>="image_resized"<br>    <strong>style</strong>="width:*"<br>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin" rowspan="2">
				<p>
					<a href="../../../features/images/images-styles.html">Image style</a>
				</p>
				<p>
					<a href="../../../api/module_image_imagestyle-ImageStyle.html"><code>ImageStyle</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>figure</strong> <strong>class</strong>="image-style-side image-style-align-left image-style-align-right image-style-block-align-center image-style-block-align-left image-style-block-align-right"&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>figure</strong> <strong>class</strong>="*"&gt;</code>
				<p>
					The plugin can be configured to set any class names on the <code>&lt;figure&gt;</code> element.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/images/images-overview.html#image-contextual-toolbar">Image toolbar</a>
				</p>
				<p>
					<a href="../../../api/module_image_imagetoolbar-ImageToolbar.html"><code>ImageToolbar</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/images/image-upload/image-upload.html">Image upload</a>
				</p>
				<p>
					<a href="../../../api/module_image_imageupload-ImageUpload.html"><code>ImageUpload</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/images/image-upload/images-inserting.html#inserting-images-via-source-url">Image insert</a>
				</p>
				<p>
					<a href="../../../api/module_image_imageinsert-ImageInsert.html"><code>ImageInsert</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-indent"><code>ckeditor5-indent</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-indent/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-indent/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/indent.html">Indent</a>
				</p>
				<p>
					<a href="../../../api/module_indent_indent-Indent.html"><code>Indent</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin" rowspan="2">
				<p>
					<a href="../../../features/indent.html">Indent block</a>
				</p>
				<p>
					<a href="../../../api/module_indent_indentblock-IndentBlock.html"><code>IndentBlock</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>$block</strong> <strong>style</strong>="margin-left:*; margin-right:*"&gt;</code>
				<p>
					By default, the plugin uses inline styles for indentation.
				</p>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>$block</strong> <strong>class</strong>="*"&gt;</code>
				<p>
					If classes are defined in <code>config.indentBlock.classes</code>, they are used instead of inline styles.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-language"><code>ckeditor5-language</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-language/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-language/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/language.html">Text part language</a>
				</p>
				<p>
					<a href="../../../api/module_language_textpartlanguage-TextPartLanguage.html"><code>TextPartLanguage</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>span</strong><br>    <strong>dir</strong>="*"<br>    <strong>lang</strong>="*"<br>&gt;</code>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-link"><code>ckeditor5-link</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-link/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-link/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/link.html#autolink-feature">Autolink</a>
				</p>
				<p>
					<a href="../../../api/module_link_autolink-AutoLink.html"><code>AutoLink</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin" rowspan="3">
				<p>
					<a href="../../../features/link.html">Link</a>
				</p>
				<p>
					<a href="../../../api/module_link_link-Link.html"><code>Link</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>a</strong> <strong>href</strong>="*"&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>a</strong><br>    <strong>rel</strong>="*"<br>    <strong>target</strong>="*"<br>&gt;</code>
				<p>
					If <code>config.link.addTargetToExternalLinks</code> is enabled, then the external links are decorated with <code>rel</code> and <code>target</code> attributes.
				</p>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>a</strong><br>    <strong>class</strong>="*"<br>    <strong>style</strong>="*:*"<br>    <strong>*</strong>="*"<br>&gt;</code>
				<p>
					The plugin can be configured to set any classes, styles or attributes on the <code>&lt;a&gt;</code> tag via custom <code>config.link.decorators</code> configuration.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/images/images-linking.html">Link image</a>
				</p>
				<p>
					<a href="../../../api/module_link_linkimage-LinkImage.html"><code>LinkImage</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>a</strong> <strong>href</strong>="*"&gt;</code>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-list"><code>ckeditor5-list</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-list/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-list/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin" rowspan="2">
				<p>
					<a href="../../../features/lists/lists.html">List</a>
				</p>
				<p>
					<a href="../../../api/module_list_list-List.html"><code>List</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>ol</strong>&gt;</code><code>&lt;<strong>ul</strong>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>li</strong>&gt;</code>
				<p>
					HTML element may contain classes, styles or attributes, that are created by other plugins, which alter the <code>&lt;$block&gt;</code> element.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin" rowspan="5">
				<p>
					<a href="../../../features/lists/todo-lists.html">To-do list</a>
				</p>
				<p>
					<a href="../../../api/module_list_todolist-TodoList.html"><code>TodoList</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>ul</strong> <strong>class</strong>="todo-list"&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>li</strong>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>label</strong> <strong>class</strong>="todo-list__label"&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>span</strong> <strong>class</strong>="todo-list__label__description"&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>input</strong><br>    <strong>checked</strong>="*"<br>    <strong>disabled</strong>="*"<br>    <strong>type</strong>="*"<br>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/lists/lists.html#list-styles">List style</a>
				</p>
				<p>
					<a href="../../../api/module_list_liststyle-ListStyle.html"><code>ListStyle</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>ol</strong> <strong>style</strong>="list-style-type:*"&gt;</code><code>&lt;<strong>ul</strong> <strong>style</strong>="list-style-type:*"&gt;</code>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-markdown-gfm"><code>ckeditor5-markdown-gfm</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-markdown-gfm/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-markdown-gfm/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/markdown.html">Markdown</a>
				</p>
				<p>
					<a href="../../../api/module_markdown-gfm_markdown-Markdown.html"><code>Markdown</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-media-embed"><code>ckeditor5-media-embed</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-media-embed/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-media-embed/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin" rowspan="7">
				<p>
					<a href="../../../features/media-embed.html">Media embed</a>
				</p>
				<p>
					<a href="../../../api/module_media-embed_mediaembed-MediaEmbed.html"><code>MediaEmbed</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>figure</strong> <strong>class</strong>="media"&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>oembed</strong> <strong>url</strong>="*"&gt;</code>
				<p>
					If <code>config.mediaEmbed.previewsInData</code> is turned off, the media preview is not displayed and the media is represented using only the <code>&lt;oembed&gt;</code> tag (by default).
				</p>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>div</strong> <strong>data-oembed-url</strong>="*"&gt;</code>
				<p>
					If <code>config.mediaEmbed.previewsInData</code> is turned on, the media preview is displayed in the view.
				</p>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>*</strong> <strong>url</strong>="*"&gt;</code>
				<p>
					If <code>config.mediaEmbed.previewsInData</code> is turned off, the plugin can be configured to return any element name specified by <code>config.mediaEmbed.elementName</code>.
				</p>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>div</strong> <strong>style</strong>="height:*; padding-bottom:*; position:*"&gt;</code>
				<p>
					If <code>config.mediaEmbed.previewsInData</code> is turned on, the media preview is displayed in the view.
				</p>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>iframe</strong><br>    <strong>style</strong>="height:*; left:*; position:*; top:*; width:*"<br>    <strong>*allow*</strong>="*"<br>    <strong>frameborder</strong>="*"<br>    <strong>src</strong>="*"<br>&gt;</code>
				<p>
					If <code>config.mediaEmbed.previewsInData</code> is turned on, the media preview is displayed in the view.
				</p>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>*</strong><br>    <strong>class</strong>="*"<br>    <strong>style</strong>="*:*"<br>    <strong>*</strong>="*"<br>&gt;</code>
				<p>
					The plugin can be configured to return any element with any class, inline style, and attribute, via <code>config.mediaEmbed.providers</code> for previewable media.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/media-embed.html">Media embed toolbar</a>
				</p>
				<p>
					<a href="../../../api/module_media-embed_mediaembedtoolbar-MediaEmbedToolbar.html"><code>MediaEmbedToolbar</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-mention"><code>ckeditor5-mention</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-mention/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-mention/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/mentions.html">Mention</a>
				</p>
				<p>
					<a href="../../../api/module_mention_mention-Mention.html"><code>Mention</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>span</strong><br>    <strong>class</strong>="mention"<br>    <strong>data-mention</strong>="*"<br>&gt;</code>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-page-break"><code>ckeditor5-page-break</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-page-break/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-page-break/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin" rowspan="2">
				<p>
					<a href="../../../features/page-break.html">Page break</a>
				</p>
				<p>
					<a href="../../../api/module_page-break_pagebreak-PageBreak.html"><code>PageBreak</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>div</strong><br>    <strong>class</strong>="page-break"<br>    <strong>style</strong>="page-break-after:*"<br>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>span</strong> <strong>style</strong>="display:*"&gt;</code>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-pagination"><code>ckeditor5-pagination</code></h3>
<p>
	Source file: <code>@ckeditor/ckeditor5-pagination/ckeditor5-metadata.json</code>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/pagination.html" data-skip-validation>Pagination</a>
				</p>
				<p>
					<a href="../../../api/module_pagination_pagination-Pagination.html" data-skip-validation><code>Pagination</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>*</strong><br>    <strong>style</strong>="page-break-before:*"<br>    <strong>data-pagination-page</strong>="*"<br>&gt;</code>
				<p>
					When using <code>editor.getData( { pagination: true } )</code>. Otherwise, no additional elements are generated.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-paragraph"><code>ckeditor5-paragraph</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-paragraph/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-paragraph/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					Paragraph
				</p>
				<p>
					<a href="../../../api/module_paragraph_paragraph-Paragraph.html"><code>Paragraph</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>p</strong>&gt;</code>
				<p>
					HTML element may contain classes, styles or attributes, that are created by other plugins, which alter the <code>&lt;$block&gt;</code> element.
				</p>
				<p>
					The HTML element may contain classes, styles or attributes that are created by other plugins, which alter the &lt;code&gt;<code>$block</code></code> element.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-paste-from-office"><code>ckeditor5-paste-from-office</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-paste-from-office/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-paste-from-office/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/pasting/paste-from-word.html">Paste from Office</a>
				</p>
				<p>
					<a href="../../../api/module_paste-from-office_pastefromoffice-PasteFromOffice.html"><code>PasteFromOffice</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-real-time-collaboration"><code>ckeditor5-real-time-collaboration</code></h3>
<p>
	Source file: <code>@ckeditor/ckeditor5-real-time-collaboration/ckeditor5-metadata.json</code>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/collaboration/real-time-collaboration/users-in-real-time-collaboration.html#users-presence-list" data-skip-validation>Presence list</a>
				</p>
				<p>
					<a href="../../../api/module_real-time-collaboration_presencelist-PresenceList.html" data-skip-validation><code>PresenceList</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/collaboration/comments/comments.html" data-skip-validation>Real-time collaborative comments</a>
				</p>
				<p>
					<a href="../../../api/module_real-time-collaboration_realtimecollaborativecomments-RealTimeCollaborativeComments.html" data-skip-validation><code>RealTimeCollaborativeComments</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/collaboration/real-time-collaboration/real-time-collaboration.html" data-skip-validation>Real-time collaborative editing</a>
				</p>
				<p>
					<a href="../../../api/module_real-time-collaboration_realtimecollaborativeediting-RealTimeCollaborativeEditing.html" data-skip-validation><code>RealTimeCollaborativeEditing</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/collaboration/track-changes/track-changes.html" data-skip-validation>Real-time collaborative track changes</a>
				</p>
				<p>
					<a href="../../../api/module_real-time-collaboration_realtimecollaborativetrackchanges-RealTimeCollaborativeTrackChanges.html" data-skip-validation><code>RealTimeCollaborativeTrackChanges</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-remove-format"><code>ckeditor5-remove-format</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-remove-format/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-remove-format/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/remove-format.html">Remove format</a>
				</p>
				<p>
					<a href="../../../api/module_remove-format_removeformat-RemoveFormat.html"><code>RemoveFormat</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-restricted-editing"><code>ckeditor5-restricted-editing</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-restricted-editing/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-restricted-editing/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/restricted-editing.html">Restricted editing mode</a>
				</p>
				<p>
					<a href="../../../api/module_restricted-editing_restrictededitingmode-RestrictedEditingMode.html"><code>RestrictedEditingMode</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>span</strong> <strong>class</strong>="restricted-editing-exception"&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/restricted-editing.html#running-the-standard-editing-mode">Standard editing mode</a>
				</p>
				<p>
					<a href="../../../api/module_restricted-editing_standardeditingmode-StandardEditingMode.html"><code>StandardEditingMode</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>span</strong> <strong>class</strong>="restricted-editing-exception"&gt;</code>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-revision-history"><code>ckeditor5-revision-history</code></h3>
<p>
	Source file: <code>@ckeditor/ckeditor5-revision-history/ckeditor5-metadata.json</code>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/revision-history/revision-history" data-skip-validation>Revision History</a>
				</p>
				<p>
					<a href="../../../api/module_revision-history_revisionhistory-RevisionHistory.html" data-skip-validation><code>RevisionHistory</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-source-editing"><code>ckeditor5-source-editing</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-source-editing/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-source-editing/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/source-editing.html">Source editing</a>
				</p>
				<p>
					<a href="../../../api/module_source-editing_sourceediting-SourceEditing.html"><code>SourceEditing</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-special-characters"><code>ckeditor5-special-characters</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-special-characters/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-special-characters/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/special-characters.html">Special characters</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharacters-SpecialCharacters.html"><code>SpecialCharacters</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/special-characters.html">Special characters essentials</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharactersessentials-SpecialCharactersEssentials.html"><code>SpecialCharactersEssentials</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/special-characters.html">Special characters arrows</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharactersarrows-SpecialCharactersArrows.html"><code>SpecialCharactersArrows</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/special-characters.html">Special characters currency</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharacterscurrency-SpecialCharactersCurrency.html"><code>SpecialCharactersCurrency</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/special-characters.html">Special characters latin</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharacterslatin-SpecialCharactersLatin.html"><code>SpecialCharactersLatin</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/special-characters.html">Special characters mathematical</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharactersmathematical-SpecialCharactersMathematical.html"><code>SpecialCharactersMathematical</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/special-characters.html">Special characters text</a>
				</p>
				<p>
					<a href="../../../api/module_special-characters_specialcharacterstext-SpecialCharactersText.html"><code>SpecialCharactersText</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-table"><code>ckeditor5-table</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-table/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-table/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin" rowspan="3">
				<p>
					<a href="../../../features/table.html">Table</a>
				</p>
				<p>
					<a href="../../../api/module_table_table-Table.html"><code>Table</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>figure</strong> <strong>class</strong>="table"&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>table</strong>&gt;</code><code>&lt;<strong>thead</strong>&gt;</code><code>&lt;<strong>tbody</strong>&gt;</code><code>&lt;<strong>tr</strong>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>td</strong><br>    <strong>colspan</strong>="*"<br>    <strong>rowspan</strong>="*"<br>&gt;</code><code>&lt;<strong>th</strong><br>    <strong>colspan</strong>="*"<br>    <strong>rowspan</strong>="*"<br>&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/table.html#table-and-cell-styling-tools">Table cell properties</a>
				</p>
				<p>
					<a href="../../../api/module_table_tablecellproperties-TableCellProperties.html"><code>TableCellProperties</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>td</strong> <strong>style</strong>="background-color:*; border:*; border-*:*; height:*; padding:*; text-align:*; vertical-align:*; width:*"&gt;</code><code>&lt;<strong>th</strong> <strong>style</strong>="background-color:*; border:*; border-*:*; height:*; padding:*; text-align:*; vertical-align:*; width:*"&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin" rowspan="2">
				<p>
					<a href="../../../features/table.html#table-and-cell-styling-tools">Table properties</a>
				</p>
				<p>
					<a href="../../../api/module_table_tableproperties-TableProperties.html"><code>TableProperties</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>figure</strong> <strong>style</strong>="float:*; height:*; width:*"&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="html-output">
				<code>&lt;<strong>table</strong> <strong>style</strong>="background-color:*; border:*; border-*:*"&gt;</code>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/table.html#toolbars">Table toolbar</a>
				</p>
				<p>
					<a href="../../../api/module_table_tabletoolbar-TableToolbar.html"><code>TableToolbar</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/table.html#table-caption">Table caption</a>
				</p>
				<p>
					<a href="../../../api/module_table_tablecaption-TableCaption.html"><code>TableCaption</code></a>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>figcaption</strong> <strong>data-placeholder</strong>="*"&gt;</code>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-track-changes"><code>ckeditor5-track-changes</code></h3>
<p>
	Source file: <code>@ckeditor/ckeditor5-track-changes/ckeditor5-metadata.json</code>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/collaboration/track-changes/track-changes.html" data-skip-validation>Track changes</a>
				</p>
				<p>
					<a href="../../../api/module_track-changes_trackchanges-TrackChanges.html" data-skip-validation><code>TrackChanges</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-typing"><code>ckeditor5-typing</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-typing/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-typing/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/text-transformation.html">Text transformation</a>
				</p>
				<p>
					<a href="../../../api/module_typing_texttransformation-TextTransformation.html"><code>TextTransformation</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-ui"><code>ckeditor5-ui</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-ui/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-ui/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/toolbar/blocktoolbar.html">Block toolbar</a>
				</p>
				<p>
					<a href="../../../api/module_ui_toolbar_block_blocktoolbar-BlockToolbar.html"><code>BlockToolbar</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-upload"><code>ckeditor5-upload</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-upload/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-upload/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/images/image-upload/base64-upload-adapter.html">Base64 upload adapter</a>
				</p>
				<p>
					<a href="../../../api/module_upload_adapters_base64uploadadapter-Base64UploadAdapter.html"><code>Base64UploadAdapter</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/images/image-upload/simple-upload-adapter.html">Simple upload adapter</a>
				</p>
				<p>
					<a href="../../../api/module_upload_adapters_simpleuploadadapter-SimpleUploadAdapter.html"><code>SimpleUploadAdapter</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-watchdog"><code>ckeditor5-watchdog</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-watchdog/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-watchdog/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/watchdog.html">Watchdog</a>
				</p>
				<p>
					<a href="../../../api/module_watchdog_editorwatchdog-EditorWatchdog.html"><code>EditorWatchdog</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="ckeditor5-word-count"><code>ckeditor5-word-count</code></h3>
<p>
	Source file: <a href="https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-word-count/ckeditor5-metadata.json"><code>@ckeditor/ckeditor5-word-count/ckeditor5-metadata.json</code></a>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/word-count.html">Word count</a>
				</p>
				<p>
					<a href="../../../api/module_word-count_wordcount-WordCount.html"><code>WordCount</code></a>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="mathtype-ckeditor5"><code>mathtype-ckeditor5</code></h3>
<p>
	Source file: <i>not published yet</i>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/math-equations.html">MathType</a>
				</p>
				<p>
					<code>MathType</code>
				</p>
			</td>
			<td class="html-output">
				<code>&lt;<strong>*</strong> <strong>*</strong>="*"&gt;</code>
				<p>
					For a complete list of available MathML element and attribute names, visit <a href="https://developer.mozilla.org/en-US/docs/Web/MathML" target="_blank" rel="noopener">MDN Web Docs for MathML</a>.
				</p>
			</td>
		</tr>
	</tbody>
</table>
<h3 id="wproofreader-ckeditor5"><code>wproofreader-ckeditor5</code></h3>
<p>
	Source file: <i>not published yet</i>
</p>
<table class="features-html-output">
	<thead>
		<tr>
			<th class="plugin">
				Plugin
			</th>
			<th class="html-output">
				HTML output
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="plugin">
				<p>
					<a href="../../../features/spelling-and-grammar-checking.html">WProofreader</a>
				</p>
				<p>
					<code>WProofreader</code>
				</p>
			</td>
			<td class="html-output">
				<p>
					None.
				</p>
			</td>
		</tr>
	</tbody>
</table>
