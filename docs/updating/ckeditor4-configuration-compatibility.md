---
# Scope:
# Compare CKEditor 4 configuration options with their CKEditor&nbsp;5 equivalents.

category: ckeditor4-migration
menu-title: Configuration options compatibility
meta-title: Migration from CKEditor 4 - Configuration options compatibility | CKEditor 5 Documentation
meta-description: Learn about the CKEditor 4 configuration options and their equivalent in CKEditor 5.
order: 50
modified_at: 2023-03-21
---

# CKEditor 4 configuration options compatibility

The following table presents CKEditor 4 configuration options and, if available, their equivalent in CKEditor&nbsp;5.

Note: In CKEditor&nbsp;5, the number of options was reduced on purpose. Configuring CKEditor 4 was too troublesome due to the number of available configuration options (around 300). This is why when designing CKEditor&nbsp;5 from scratch, we decided to come up with a simplified editor, with well-thought default behavior, based on the results of the [Editor Recommendations](http://ckeditor.github.io/editor-recommendations/) project.

<style>
/* See: https://github.com/ckeditor/ckeditor5/issues/1718. */
.docsearch-txt {
	table-layout: fixed;
}

.docsearch-txt tr th:nth-child( 1 ),
.docsearch-txt tr td:nth-child( 1 ) {
	width: 280px;
}
</style>

<table class="docsearch-txt">
	<thead>
		<tr>
			<th>CKEditor 4</th>
			<th>CKEditor&nbsp;5</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>
			<p><span id="allowedContent"><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-allowedContent"><code>allowedContent</code></a></span></p>
			</td>
			<td>
				<p>You can extend the list of HTML tags or attributes that CKEditor&nbsp;5 should support via the {@link features/general-html-support GHS (General HTML Support) feature}. The GHS allows adding HTML markup not yet covered by official CKEditor&nbsp;5 features into the editor's content. Such elements can be loaded, pasted, or output. It does not, however, provide a dedicated UI for the extended HTML markup.</p>
				<p>You can get full-fledged HTML support by writing a plugin that (ideally) provides also means to control (insert, edit, delete) such markup. For more information on how to create plugins check the {@link tutorials/creating-simple-plugin-timestamp Creating a basic plugin} article. Looking at the source code of CKEditor&nbsp;5 plugins may also give you a lot of inspiration.</p>
				<p>CKEditor&nbsp;5 will only preserve content that is explicitly converted between the model and the view by the editor plugins. Check the {@link framework/deep-dive/conversion/intro conversion documentation} to learn how to extend the conversion rules.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-applicationTitle"><code>applicationTitle</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autoEmbed_widget"><code>autoEmbed_widget</code></a></td>
			<td>Refer to the {@link features/media-embed Media embed} feature guide to learn more about media embedding in CKEditor&nbsp;5.</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autoGrow_bottomSpace"><code>autoGrow_bottomSpace</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autoGrow_maxHeight"><code>autoGrow_maxHeight</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autoGrow_minHeight"><code>autoGrow_minHeight</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autoGrow_onStartup"><code>autoGrow_onStartup</code></a></p>
			</td>
			<td>
				<p>These settings are no longer needed as CKEditor&nbsp;5 automatically grows with content by default.</p>
				<p>{@link examples/builds/classic-editor Classic editor} in CKEditor&nbsp;5 no longer encapsulates the editing area in an <code>&lt;iframe&gt;</code>. This means that you can control the height (and similar options) of the editing area with CSS. For example, you can set the <code>minHeight</code> and <code>maxHeight</code> options with the following code:</p>
				<pre><code class="language-css">.ck.ck-content:not(.ck-comment__input *) {
	/* Note: You can use min-height and max-height instead here. */
	height: 300px;
	overflow-y: auto;
}</code>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autoUpdateElement"><code>autoUpdateElement</code></a></td>
			<td>CKEditor&nbsp;5 always updates the replaced element. This behavior cannot be disabled.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autocomplete_commitKeystrokes"><code>autocomplete_commitKeystrokes</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autolink_commitKeystrokes"><code>autolink_commitKeystrokes</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autolink_emailRegex"><code>autolink_emailRegex</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autolink_urlRegex"><code>autolink_urlRegex</code></a></td>
			<td>Refer to the {@link features/link#autolink-feature Autolink section} of the Link guide to learn more about support for automatic linking in CKEditor&nbsp;5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-baseFloatZIndex"><code>baseFloatZIndex</code></a></td>
			<td>N/A. There is a dedicated <a href="https://github.com/ckeditor/ckeditor5/issues/5352" target="_blank" rel="noopener">issue about z-index management</a> and making it more open for developers.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-baseHref"><code>baseHref</code></a></td>
			<td>Not supported yet, see <a href="https://github.com/ckeditor/ckeditor5/issues/665" target="_blank" rel="noopener">the relevant GitHub issue</a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-basicEntities"><code>basicEntities</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-blockedKeystrokes"><code>blockedKeystrokes</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-bodyClass"><code>bodyClass</code></a></p>
			</td>
			<td>
				<p>{@link examples/builds/classic-editor Classic editor} in CKEditor&nbsp;5 no longer encapsulates the editing area in an <code>&lt;iframe&gt;</code>, so this setting is no longer needed. Wrap the editor with a <code>&lt;div class=&quot;...&quot;&gt;</code> to achieve a similar result. When using {@link examples/builds/balloon-editor balloon}, {@link examples/builds/balloon-block-editor balloon block}, {@link examples/builds/inline-editor inline}, or {@link examples/builds/document-editor decoupled} editor, you may add a class to the element on which the editor is initialized.</p>
				<p>Additionally, all editor types use <code>.ck-content</code> on their main root editable elements. This class can thus also be used to write style sheet rules for the editor content.</p>
			</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-bodyId"><code>bodyId</code></a></p>
			</td>
			<td>
				<p>{@link examples/builds/classic-editor Classic editor} in CKEditor&nbsp;5 no longer encapsulates the editing area in an <code>&lt;iframe&gt;</code>, so this setting is no longer needed. Wrap the editor with a <code>&lt;div id=&quot;...&quot;&gt;</code> to achieve a similar result. When using {@link examples/builds/balloon-editor balloon}, {@link examples/builds/balloon-block-editor balloon block}, {@link examples/builds/inline-editor inline}, or {@link examples/builds/document-editor decoupled} editor, you may add a class to the element on which the editor is initialized.</p>
				<p>Additionally, all editor types use <code>.ck-content</code> on their main root editable elements. This class can thus also be used to write style sheet rules for the editor content.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-browserContextMenuOnCtrl"><code>browserContextMenuOnCtrl</code></a></td>
			<td>No longer needed as CKEditor&nbsp;5 does not have a context menu and does not block the native browser context menu.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-clipboard_defaultContentType"><code>clipboard_defaultContentType</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-clipboard_handleImages"><code>clipboard_handleImages</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-clipboard_notificationDuration"><code>clipboard_notificationDuration</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-cloudServices_tokenUrl"><code>cloudServices_tokenUrl</code></a></td>
			<td>See {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl `config.cloudServices.tokenUrl`}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-cloudServices_uploadUrl"><code>cloudServices_uploadUrl</code></a></td>
			<td>See {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#uploadUrl `config.cloudServices.uploadUrl`}. Check out the comprehensive {@link features/image-upload Image upload} guide to learn more.</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-codeSnippetGeshi_url"><code>codeSnippetGeshi_url</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-codeSnippet_codeClass"><code>codeSnippet_codeClass</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-codeSnippet_languages"><code>codeSnippet_languages</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-codeSnippet_theme"><code>codeSnippet_theme</code></a></p>
			</td>
			<td>
				<p>Refer to the {@link features/code-blocks Code block} feature guide to learn more about support for blocks of pre-formatted code in CKEditor&nbsp;5.</p>
				<p>A plugin adding support for the inline <code>&lt;code&gt;</code> element is included in the {@link features/basic-styles Basic styles} package.</p>
			</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_backStyle"><code>colorButton_backStyle</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_colors"><code>colorButton_colors</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_colorsPerRow"><code>colorButton_colorsPerRow</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_contentsCss"><code>colorButton_contentsCss</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_enableAutomatic"><code>colorButton_enableAutomatic</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_enableMore"><code>colorButton_enableMore</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_foreStyle"><code>colorButton_foreStyle</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_historyRowLimit"><code>colorButton_historyRowLimit</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_normalizeBackground"><code>colorButton_normalizeBackground</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_renderContentColors"><code>config.colorButton_renderContentColors</code></a>
			</p>
			</td>
			<td>
				<p>Refer to the {@link features/font#configuring-the-font-color-and-font-background-color-features Font family, size, and color} feature guide to learn more about configuring font and background color in CKEditor&nbsp;5.</p>
				<p>CKEditor&nbsp;5 also provides a new highlight plugin. It allows for highlighting parts of the text with the <code>&lt;mark&gt;</code> element with different CSS classes that can be styled. See the {@link features/highlight Highlight} feature guide for more information.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-contentsCss"><code>contentsCss</code></a></td>
			<td>{@link examples/builds/classic-editor Classic editor} in CKEditor&nbsp;5 no longer encapsulates the editing area in an <code>&lt;iframe&gt;</code>, so such file and configuration setting is no longer needed. If for some reason you need to style the contents of the editing area differently, use the <code>.ck-content</code> selector.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-contentsLangDirection"><code>contentsLangDirection</code></a></td>
			<td>Refer to the {@link getting-started/setup/ui-language#setting-the-language-of-the-content Setting the language of the content} guide to learn how to set the content direction using the {@link module:core/editor/editorconfig~EditorConfig#language `config.language`} configuration option.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-contentsLanguage"><code>contentsLanguage</code></a></td>
			<td>Refer to the {@link getting-started/setup/ui-language#setting-the-language-of-the-content Setting the language of the content} guide to learn how to set the content language using the {@link module:core/editor/editorconfig~EditorConfig#language `config.language`} configuration option.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-contextmenu_contentsCss"><code>contextmenu_contentsCss</code></a></td>
			<td>No longer needed as CKEditor&nbsp;5 does not have a context menu.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-copyFormatting_allowRules"><code>copyFormatting_allowRules</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-copyFormatting_allowedContexts"><code>copyFormatting_allowedContexts</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-copyFormatting_disallowRules"><code>copyFormatting_disallowRules</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-copyFormatting_keystrokeCopy"><code>copyFormatting_keystrokeCopy</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-copyFormatting_keystrokePaste"><code>copyFormatting_keystrokePaste</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-copyFormatting_outerCursor"><code>copyFormatting_outerCursor</code></a></td>
			<td>Refer to the {@link features/format-painter Format painter} guide to learn how the copy formatting functionality works in CKEditor&nbsp;5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-coreStyles_bold"><code>coreStyles_bold</code></a></td>
			<td>CKEditor&nbsp;5 uses the <code>&lt;strong&gt;</code> element, see <a href="https://ckeditor.github.io/editor-recommendations/features/bold.html" target="_blank" rel="noopener">Editor Recommendations - Bold</a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-coreStyles_italic"><code>coreStyles_italic</code></a></td>
			<td>CKEditor&nbsp;5 uses the <code>&lt;i&gt;</code> element, see <a href="https://ckeditor.github.io/editor-recommendations/features/italic.html" target="_blank" rel="noopener">Editor Recommendations - Italic</a>.</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-coreStyles_strike"><code>coreStyles_strike</code></a></td>
			<td>CKEditor&nbsp;5 uses the <code>&lt;s&gt;</code> element, see <a href="https://ckeditor.github.io/editor-recommendations/features/strikethrough.html" target="_blank" rel="noopener">Editor Recommendations - Strikethrough</a>.
			</p>
			</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-coreStyles_subscript"><code>coreStyles_subscript</code></a></p>
			</td>
			<td>
				<p>CKEditor&nbsp;5 uses the <code>&lt;sub&gt;</code> element.</p>
			</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-coreStyles_superscript"><code>coreStyles_superscript</code></a></p>
			</td>
			<td>
				<p>CKEditor&nbsp;5 uses the <code>&lt;sup&gt;</code> element.</p>
			</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-coreStyles_toggleSubSup"><code>coreStyles_toggleSubSup</code></a></p>
			</td>
			<td>
				<p>In CKEditor&nbsp;5 it is possible to apply subscript and superscript to the same element.</p>
			</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-coreStyles_underline"><code>coreStyles_underline</code></a></p>
			</td>
			<td>
				<p>CKEditor&nbsp;5 uses the <code>&lt;u&gt;</code> element, see <a href="https://github.com/ckeditor/editor-recommendations/issues/4" target="_blank" rel="noopener">Editor Recommendations - Underline</a>.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-customConfig"><code>customConfig</code></a></td>
			<td>For performance reasons, CKEditor&nbsp;5 no longer loads a separate configuration file. Passing configuration options inline reduces the number of HTTP requests.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-dataIndentationChars"><code>dataIndentationChars</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><span id="defaultLanguage"><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-defaultLanguage"><code>defaultLanguage</code></a></span></td>
			<td>The support for multiple translations is handled by the translations service. See the {@link getting-started/setup/ui-language UI language} feature guide.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-delayIfDetached"><code>delayIfDetached</code></a> <br>
			<a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-delayIfDetached_callback"><code>delayIfDetached_callback</code></a> <br>
			<a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-delayIfDetached_interval"><code>delayIfDetached_interval</code></a> <br></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-devtools_styles"><code>devtools_styles</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-devtools_textCallback"><code>devtools_textCallback</code></a></td>
			<td>The old CKEditor 4 Developer Tools plugin is not available for CKEditor&nbsp;5. However, check out the new {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector}. It is a far more advanced tool that will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-dialog_backgroundCoverColor"><code>dialog_backgroundCoverColor</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-dialog_backgroundCoverOpacity"><code>dialog_backgroundCoverOpacity</code></a></td>
			<td>The use of configuration options to style selected parts of the editor was dropped in favor of much more powerful {@link framework/theme-customization theme customization}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-dialog_buttonsOrder"><code>dialog_buttonsOrder</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-dialog_magnetDistance"><code>dialog_magnetDistance</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-dialog_noConfirmCancel"><code>dialog_noConfirmCancel</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-dialog_startupFocusTab"><code>dialog_startupFocusTab</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-disableNativeSpellChecker"><code>disableNativeSpellChecker</code></a></p>
			</td>
			<td>
				<p>Note: An official integration of the spell and grammar checking functionality for CKEditor&nbsp;5 is provided by a partner solution, {@link features/spelling-and-grammar-checking WProofreader}.</p>
				<p>A dedicated configuration option to disable the native browser spell checker is unavailable. However, in case of inline, balloon, and balloon block editors it can be done by setting the <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/spellcheck" target="_blank" rel="noopener"><code>spellcheck</code></a> attribute directly on the element where CKEditor should be enabled.</p>
				<p>Additionally, for all types of editors, including the classic and decoupled ones, you can also call:</p>
				<pre><code>editor.editing.view.change( writer => {
	writer.setAttribute( 'spellcheck', 'false', editor.editing.view.document.getRoot() );
} );</code></pre>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-disableNativeTableHandles"><code>disableNativeTableHandles</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-disableObjectResizing"><code>disableObjectResizing</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-disableReadonlyStyling"><code>disableReadonlyStyling</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-disallowedContent"><code>disallowedContent</code></a></td>
			<td>See <a href="#allowedContent"><code>config.allowedContent</code></a>. No longer needed as CKEditor&nbsp;5 removes all unwanted markup that cannot be edited with the editor. You can control this by adding plugins to the editor or via the {@link features/general-html-support General HTML Support feature}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-div_wrapTable"><code>div_wrapTable</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-docType"><code>docType</code></a></td>
			<td>N/A. CKEditor&nbsp;5 no longer encapsulates the editing area in an <code>&lt;iframe&gt;</code>, so the editor is using the same DOCTYPE as the page where it operates.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-easyimage_class"><code>easyimage_class</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-easyimage_defaultStyle"><code>easyimage_defaultStyle</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-easyimage_styles"><code>easyimage_styles</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-easyimage_toolbar"><code>easyimage_toolbar</code></a></td>
			<td>Refer to the {@link features/images-overview Images} feature guides to learn more about image-related features in CKEditor&nbsp;5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-editorplaceholder"><code>editorplaceholder</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-editorplaceholder_delay"><code>editorplaceholder_delay</code></a></td>
			<td>Refer to the {@link features/editor-placeholder Editor placeholder} feature guide to learn more about configuring this feature in CKEditor&nbsp;5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-emailProtection"><code>emailProtection</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-embed_provider"><code>embed_provider</code></a></td>
			<td>Refer to the {@link features/media-embed Media embed} feature guide to learn more about media embedding in CKEditor&nbsp;5.</td>
		</tr>
		<tr>
			<td><span id="emoji"><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-emoji_emojiListUrl"><code>emoji_emojiListUrl</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-emoji_followingSpace"><code>emoji_followingSpace</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-emoji_minChars"><code>emoji_minChars</code></a></span></td>
			<td>You can paste emoji into CKEditor&nbsp;5 as Unicode content. You can also use the emoji picker of your operating system to insert emoji characters. Use the <kbd>Ctrl</kbd>+<kbd>Cmd</kbd>+<kbd>Space</kbd> keyboard shortcut (macOS) or <kbd>Win</kbd>+<kbd>.</kbd> (Windows) or the relevant emoji key on the touch keyboard of your device to open the picker. You can configure the {@link features/text-transformation automatic text transformation feature} to deliver emojis with shortcodes, too.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-enableContextMenu"><code>enableContextMenu</code></a></td>
			<td>N/A. CKEditor&nbsp;5 does not come with a context menu. A configurable contextual inline toolbar is preferred instead to offer contextual actions for features such as {@link features/tables#table-contextual-toolbar tables} or {@link features/images-overview#image-contextual-toolbar images}. See also {@link module:core/editor/editorconfig~EditorConfig#toolbar <code>toolbar</code>}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-enableTabKeyTools"><code>enableTabKeyTools</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td>
			<p><span id="enterMode"><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-enterMode"><code>enterMode</code></a></span></p>
			</td>
			<td>
				<p>N/A. CKEditor&nbsp;5 always creates a new paragraph (<code>&lt;p&gt;</code> element) as specified by <a href="http://ckeditor.github.io/editor-recommendations/usability/enter-key.html" target="_blank" rel="noopener">Editor Recommendations - Enter key</a>.</p>
				<p>You can use <kbd>Shift</kbd>+<kbd>Enter</kbd> for creating soft line breaks.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-entities"><code>entities</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-entities_additional"><code>entities_additional</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-entities_greek"><code>entities_greek</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-entities_latin"><code>entities_latin</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-entities_processNumerical"><code>entities_processNumerical</code></a></td>
			<td>N/A</td>
		</tr>
				<tr>
			<td>
			<a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-exportPdf_fileName"><code>exportPdf_fileName</code></a> <br><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-exportPdf_options"><code>exportPdf_options</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-exportPdf_service"><code>exportPdf_service</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-exportPdf_stylesheets"><code>exportPdf_stylesheets</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-exportPdf_tokenUrl"><code>exportPdf_tokenUrl</code></a> <br>
			</td>
			<td>
				Refer to the <a href="https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html">Export to PDF feature</a> guide to learn more about configuring the HTML to PDF converter in CKEditor&nbsp;5.
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-extraAllowedContent"><code>extraAllowedContent</code></a></td>
			<td>See <a href="#allowedContent"><code>config.allowedContent</code></a>. You can also achieve this via the {@link features/general-html-support General HTML Support feature}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-extraPlugins"><code>extraPlugins</code></a></td>
			<td>Learn how to {@link getting-started/setup/configuration install plugins in CKEditor&nbsp;5}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fileTools_defaultFileName"><code>fileTools_defaultFileName</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fileTools_requestHeaders"><code>fileTools_requestHeaders</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserBrowseUrl"><code>filebrowserBrowseUrl</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserFlashBrowseUrl"><code>filebrowserFlashBrowseUrl</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserFlashUploadUrl"><code>filebrowserFlashUploadUrl</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserImageBrowseLinkUrl"><code>filebrowserImageBrowseLinkUrl</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserImageBrowseUrl"><code>filebrowserImageBrowseUrl</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserImageUploadUrl"><code>filebrowserImageUploadUrl</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserUploadMethod"><code>filebrowserUploadMethod</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserUploadUrl"><code>filebrowserUploadUrl</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserWindowFeatures"><code>filebrowserWindowFeatures</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserWindowHeight"><code>filebrowserWindowHeight</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserWindowWidth"><code>filebrowserWindowWidth</code></a></td>
			<td>There is no equivalent of the file browser plugin in CKEditor&nbsp;5 yet. See also <a href="#uploadUrl"><code>config.uploadUrl</code></a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fillEmptyBlocks"><code>fillEmptyBlocks</code></a></td>
			<td>Blocks are always filled in CKEditor&nbsp;5 because this preserves the intention of the content author (who left such empty lines) in the output data.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-find_highlight"><code>find_highlight</code></a></td>
			<td>Refer to the <a href="https://ckeditor.com/docs/ckeditor5/latest/features/find-and-replace.html">Find and replace</a> feature guide.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-flashAddEmbedTag"><code>flashAddEmbedTag</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-flashConvertOnEdit"><code>flashConvertOnEdit</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-flashEmbedTagOnly"><code>flashEmbedTagOnly</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-floatSpaceDockedOffsetX"><code>floatSpaceDockedOffsetX</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-floatSpaceDockedOffsetY"><code>floatSpaceDockedOffsetY</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-floatSpacePinnedOffsetX"><code>floatSpacePinnedOffsetX</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-floatSpacePinnedOffsetY"><code>floatSpacePinnedOffsetY</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-floatSpacePreferRight"><code>floatSpacePreferRight</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fontSize_defaultLabel"><code>fontSize_defaultLabel</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fontSize_sizes"><code>fontSize_sizes</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fontSize_style"><code>fontSize_style</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-font_defaultLabel"><code>font_defaultLabel</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-font_names"><code>font_names</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-font_style"><code>font_style</code></a></td>
			<td>Refer to the {@link features/font Font family, size, and color} feature guide to learn more about font size, family, and color support in CKEditor&nbsp;5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-forceEnterMode"><code>forceEnterMode</code></a></td>
			<td>N/A. Se also <a href="#enterMode"><code>config.enterMode</code></a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-forcePasteAsPlainText"><code>forcePasteAsPlainText</code></a></td>
			<td>N/A. No longer needed as CKEditor&nbsp;5 removes all unwanted markup that cannot be edited with the enabled editor plugins.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-forceSimpleAmpersand"><code>forceSimpleAmpersand</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_address"><code>format_address</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_div"><code>format_div</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_p"><code>format_p</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_pre"><code>format_pre</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_h1"><code>format_h1</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_h2"><code>format_h2</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_h3"><code>format_h3</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_h4"><code>format_h4</code></a> <br>  <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_h5"><code>format_h5</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_h6"><code>format_h6</code></a></td>
			<td>All headings are configurable via {@link module:heading/headingconfig~HeadingConfig#options `config.heading.options`}. See also the {@link features/headings Headings} feature guide.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_tags"><code>format_tags</code></a></td>
			<td>To enable additional block tags in CKEditor&nbsp;5, you may use the {@link features/general-html-support General HTML Support feature}. Alternatively, you must provide a dedicated plugin. See also <a href="#allowedContent"><code>config.allowedContent</code></a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fullPage"><code>fullPage</code></a></td>
			<td>Available through the {@link module:html-support/fullpage~FullPage} API.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-grayt_autoStartup"><code>grayt_autoStartup</a></td>
			<td>An official integration of the spell and grammar checking functionality for CKEditor&nbsp;5 is provided by a partner solution, {@link features/spelling-and-grammar-checking WProofreader}.</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-height"><code>height</code></a></p>
			</td>
			<td>
				<p>{@link examples/builds/classic-editor Classic editor} in CKEditor&nbsp;5 no longer encapsulates the editing area in an <code>&lt;iframe&gt;</code>. This means that you can control the height (and similar options) of the editing area with CSS. For example, you can set the height with <code>.ck-editor__editable_inline { height:400px; }</code>.</p>
				<p>To set the height dynamically (from JavaScript), use the view writer:</p>
				<pre><code>editor.editing.view.change( writer => {
    writer.setStyle( 'height', '400px', editor.editing.view.document.getRoot() );
} );</code></pre>
				<p>See also <a href="https://stackoverflow.com/questions/46559354/how-to-set-the-height-of-ckeditor-5-classic-editor" target="_blank" rel="noopener">How to set the height of CKEditor&nbsp;5 (Classic editor)</a>.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-htmlEncodeOutput"><code>htmlEncodeOutput</code></a></td>
			<td>N/A. CKEditor&nbsp;5 outputs HTML markup. See also <a href="https://stackoverflow.com/questions/47555667/ckeditor-5-htmlencodeoutput-doesnt-work" target="_blank" rel="noopener">this StackOverflow question</a> and a <a href="https://github.com/ckeditor/ckeditor5/issues/698" target="_blank" rel="noopener">dedicated issue</a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-ignoreEmptyParagraph"><code>ignoreEmptyParagraph</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image2_alignClasses"><code>image2_alignClasses</code></a></td>
			<td>Available via more powerful {@link module:image/imageconfig~ImageConfig#styles `config.image.styles`}. This also allows for using custom style definitions, not just left, right, and center alignment. See the {@link features/images-styles Image styles} feature guide.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image2_altRequired"><code>image2_altRequired</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image2_captionedClass"><code>image2_captionedClass</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image2_defaultLockRatio"><code>image2_defaultLockRatio</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image2_disableResizer"><code>image2_disableResizer</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image2_maxSize"><code>image2_maxSize</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image2_prefillDimensions"><code>image2_prefillDimensions</code></a></td>
			<td>Refer to the {@link features/images-overview Image} feature guide to learn more about image-related features and customization options in CKEditor&nbsp;5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-imageUploadUrl"><code>imageUploadUrl</code></a></td>
			<td>See <a href="#uploadUrl"><code>config.uploadUrl</code></a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image_prefillDimensions"><code>image_prefillDimensions</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image_previewText"><code>image_previewText</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image_removeLinkByEmptyURL"><code>image_removeLinkByEmptyURL</code></a></td>
			<td>Refer to the {@link features/images-overview Image} feature guide to learn more about image-related features and customization options in CKEditor&nbsp;5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-indentClasses"><code>indentClasses</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-indentOffset"><code>indentOffset</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-indentUnit"><code>indentUnit</code></a></td>
			<td>Refer to the {@link features/indent#configuring-the-block-indentation-feature Configuring the block indentation} feature guide to learn how to customize the indentation behavior using offsets, units, or classes.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-jqueryOverrideVal"><code>jqueryOverrideVal</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-justifyClasses"><code>justifyClasses</code></a></td>
			<td>Refer to the {@link features/text-alignment Text alignment} feature guide.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-keystrokes"><code>keystrokes</code></a></td>
			<td>You can register keystroke handlers using {@link module:core/editingkeystrokehandler~EditingKeystrokeHandler <code>EditingKeystrokeHandler</code>}. You can find more information and examples in a dedicated {@link framework/architecture/ui-library#keystrokes-and-focus-management Keystrokes and focus management} section.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-language"><code>language</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-language_list"><code>language_list</code></a></td>
			<td>The support for many translations is handled by the translations service. See the {@link getting-started/setup/ui-language UI language} feature guide.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-linkDefaultProtocol"><code>linkDefaultProtocol</code></a></td>
			<td>{@link module:link/linkconfig~LinkConfig#defaultProtocol `config.link.defaultProtocol`}</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-linkJavaScriptLinksAllowed"><code>linkJavaScriptLinksAllowed</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-linkPhoneMsg"><code>linkPhoneMsg</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-linkPhoneRegExp"><code>linkPhoneRegExp</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-linkShowAdvancedTab"><code>linkShowAdvancedTab</code></a></td>
			<td>Refer to the {@link features/link Link} feature guide to read about setting custom link attributes.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-linkShowTargetTab"><code>linkShowTargetTab</code></a></td>
			<td>See {@link module:link/linkconfig~LinkConfig#addTargetToExternalLinks `config.link.addTargetToExternalLinks`}</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-magicline_color"><code>magicline_color</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-magicline_everywhere"><code>magicline_everywhere</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-magicline_holdDistance"><code>magicline_holdDistance</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-magicline_keystrokeNext"><code>magicline_keystrokeNext</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-magicline_keystrokePrevious"><code>magicline_keystrokePrevious</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-magicline_tabuList"><code>magicline_tabuList</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-magicline_triggerOffset"><code>magicline_triggerOffset</code></a></td>
            <td>This functionality is covered by the {@link module:widget/widgettypearound/widgettypearound~WidgetTypeAround `WidgetTypeAround`} plugin. It allows users to type around widgets where normally it is impossible to place the caret due to limitations of web browsers.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-mathJaxClass"><code>mathJaxClass</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-mathJaxLib"><code>mathJaxLib</code></a></td>
			<td>N/A. Math equation functionality for CKEditor&nbsp;5 is provided by a partner solution, {@link features/math-equations MathType}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-maximize_historyIntegration"><code>maximize_historyIntegration</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-mentions"><code>mentions</code></a></td>
			<td>Refer to the {@link features/mentions Mentions} feature guide to learn more about smart autocompletion based on user input in CKEditor&nbsp;5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-menu_groups"><code>menu_groups</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-menu_subMenuDelay"><code>menu_subMenuDelay</code></a></td>
			<td>CKEditor&nbsp;5 does not come with a context menu. A configurable contextual inline toolbar is preferred instead to offer contextual actions for features such as {@link features/tables#table-contextual-toolbar tables} or {@link features/images-overview#image-contextual-toolbar images}. See also {@link module:core/editor/editorconfig~EditorConfig#toolbar <code>toolbar</code>}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-newpage_html"><code>newpage_html</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-notification_duration"><code>notification_duration</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-observableParent"><code>observableParent</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-on"><code>on</code></a></p></td>
			<td>
				<p>Using the configuration file or setting to define event listeners was a bad practice so support for it was dropped.</p>
				<p>When creating an editor, a <code>Promise</code> is returned. Use <code>then/catch()</code> to define a callback when the editor is initialized or fails to start. The promise returns the created editor instance, for example, {@link module:editor-classic/classiceditor~ClassicEditor <code>ClassicEditor</code>}, on which you can listen to its events.</p>
				<p>Note: The editor instance is not the only object on which events are fired. You can also listen to, for example, {@link module:engine/model/document~Document `Document`} events.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-pasteFilter"><code>pasteFilter</code></a></td>
			<td>Not needed as CKEditor&nbsp;5 always trims the pasted content to match what the available plugins can handle. If you would like to filter the pasted content even further, <a href="https://github.com/ckeditor/ckeditor5/issues/new?labels=type%3Afeature&template=2-feature-request.md" target="_blank" rel="noopener">report a ticket</a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-pasteFromWordCleanupFile"><code>pasteFromWordCleanupFile</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-pasteFromWordNumberedHeadingToList"><code>pasteFromWordNumberedHeadingToList</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-pasteFromWordPromptCleanup"><code>pasteFromWordPromptCleanup</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-pasteFromWordRemoveStyles"><code>pasteFromWordRemoveStyles</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-pasteFromWord_heuristicsEdgeList"><code>pasteFromWord_heuristicsEdgeList</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-pasteFromWord_inlineImages"><code>pasteFromWord_inlineImages</code></a></td>
			<td>Refer to the {@link features/paste-from-office Paste from Office} feature guide to learn more about support for pasting from Microsoft Word in CKEditor&nbsp;5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-pasteTools_keepZeroMargins"><code>pasteTools_keepZeroMargins</code></a></td>
			<td>Refer to the {@link features/paste-from-office Paste from Office} and {@link features/paste-from-google-docs Paste from Google Docs} feature guides to learn more about support for pasting from external applications in CKEditor&nbsp;5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-plugins"><code>plugins</code></a></td>
			<td>See the {@link module:core/editor/editorconfig~EditorConfig#plugins <code>plugins</code>} configuration option. The way how plugins are enabled in CKEditor&nbsp;5 has changed in general. Check the articles about {@link framework/architecture/plugins plugins} and {@link getting-started/legacy-getting-started/quick-start-other custom builds} for more information.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-protectedSource"><code>protectedSource</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-readOnly"><code>readOnly</code></a></td>
			<td>See {@link module:core/editor/editor~Editor#isReadOnly <code>editor.isReadOnly</code>} and refer to the {@link features/read-only Read-only} feature guide.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-removeButtons"><code>removeButtons</code></a></td>
			<td>N/A. You can achieve a similar effect by setting the {@link module:core/editor/editorconfig~EditorConfig#toolbar <code>toolbar</code>} option with fewer buttons.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-removeDialogTabs"><code>removeDialogTabs</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-removeFormatAttributes"><code>removeFormatAttributes</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-removeFormatTags"><code>removeFormatTags</code></a></td>
			<td>Refer to the {@link features/remove-format Remove formatting} feature guide to learn how to remove any text formatting applied with inline HTML elements and CSS styles in CKEditor&nbsp;5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-removePlugins"><code>removePlugins</code></a></td>
			<td>See {@link module:core/editor/editorconfig~EditorConfig#removePlugins `config.removePlugins`}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-resize_dir"><code>resize_dir</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-resize_enabled"><code>resize_enabled</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-resize_maxHeight"><code>resize_maxHeight</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-resize_maxWidth"><code>resize_maxWidth</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-resize_minHeight"><code>resize_minHeight</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-resize_minWidth"><code>resize_minWidth</code></a></td>
			<td>No longer needed. The editor automatically grows with content. You can also limit its height with <code>min-height</code> and <code>max-height</code> or set it with <code>height</code> if you need. If you want to allow the users to manually resize the editor, you need to implement this behavior by yourself.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_autoStartup"><code>scayt_autoStartup</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_contextCommands"><code>scayt_contextCommands</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_contextMenuItemsOrder"><code>scayt_contextMenuItemsOrder</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_customDictionaryIds"><code>scayt_customDictionaryIds</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_customPunctuation"><code>scayt_customPunctuation</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_customerId"><code>scayt_customerId</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_disableOptionsStorage"><code>scayt_disableOptionsStorage</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_elementsToIgnore"><code>scayt_elementsToIgnore</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_handleCheckDirty"><code>scayt_handleCheckDirty</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_handleUndoRedo"><code>scayt_handleUndoRedo</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_ignoreAllCapsWords"><code>scayt_ignoreAllCapsWords</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_ignoreDomainNames"><code>scayt_ignoreDomainNames</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_ignoreWordsWithMixedCases"><code>scayt_ignoreWordsWithMixedCases</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_ignoreWordsWithNumbers"><code>scayt_ignoreWordsWithNumbers</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_inlineModeImmediateMarkup"><code>scayt_inlineModeImmediateMarkup</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_maxSuggestions"><code>scayt_maxSuggestions</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_minWordLength"><code>scayt_minWordLength</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_moreSuggestions"><code>scayt_moreSuggestions</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_sLang"><code>scayt_sLang</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_serviceHost"><code>scayt_serviceHost</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_servicePath"><code>scayt_servicePath</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_servicePort"><code>scayt_servicePort</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_serviceProtocol"><code>scayt_serviceProtocol</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_srcUrl"><code>scayt_srcUrl</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_uiTabs"><code>scayt_uiTabs</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_userDictionaryName"><code>scayt_userDictionaryName</code></a></td>
			<td>The spell and grammar checking functionality for CKEditor&nbsp;5 is provided by a partner solution, {@link features/spelling-and-grammar-checking WProofreader}.</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-sharedSpaces"><code>sharedSpaces</code></a></p>
			</td>
			<td>
				<p>N/A.</p>
				<p>The {@link module:editor-decoupled/decouplededitor~DecoupledEditor decoupled editor} allows configuring where to insert the toolbar and the editable element.</p>
				<p>In addition to that, CKEditor&nbsp;5 Framework architecture allows for writing a custom editor that contains many editable elements (document roots). See the {@link examples/builds/multi-root-editor multi-root editor example}.</p>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-shiftEnterMode"><code>shiftEnterMode</code></a></p>
			</td>
			<td>
				<p>N/A. CKEditor&nbsp;5 always creates a new paragraph (<code>&lt;p&gt;</code> element) as specified by <a href="http://ckeditor.github.io/editor-recommendations/usability/enter-key.html" target="_blank" rel="noopener">Editor Recommendations - Enter key</a>.</p>
				<p>You can use <kbd>Shift</kbd>+<kbd>Enter</kbd> for creating soft line breaks.</p>
			</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-shiftLineBreaks"><code>shiftLineBreaks</code></a></p>
			</td>
			<td>
				<p>N/A. CKEditor&nbsp;5 always moves line breaks (<code>&lt;br&gt;</code> elements) outside inline elements.</p>
			</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-skin"><code>skin</code></a></p>
			</td>
			<td>
				<p>In CKEditor&nbsp;5 you can make lots of changes to the interface by changing the default CKEditor theme. See the {@link framework/theme-customization Theme customization} guide.</p>
				<p>For heavy UI modifications, like integrating CKEditor with a custom UI framework, you need to build a custom editor. See the {@link framework/external-ui Third-party UI} guide.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-smiley_columns"><code>smiley_columns</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-smiley_descriptions"><code>smiley_descriptions</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-smiley_images"><code>smiley_images</code></a> <br>  <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-smiley_path"><code>smiley_path</code></a></td>
			<td>There is no dedicated smiley plugin in CKEditor&nbsp;5. However, you can paste the <a href="#emoji">emoji</a> into the rich-text editor as Unicode content. You can also configure the {@link features/text-transformation automatic text transformation feature} to deliver Unicode emojis with shortcodes. You can use the {@link features/special-characters special characters} feature to input emojis as well.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-sourceAreaTabSize"><code>sourceAreaTabSize</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-specialChars"><code>specialChars</code></a></td>
			<td>Refer to the {@link features/special-characters Special characters} feature guide to learn more about support for inserting special characters in CKEditor&nbsp;5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-startupFocus"><code>startupFocus</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-startupMode"><code>startupMode</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-startupOutlineBlocks"><code>startupOutlineBlocks</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-startupShowBorders"><code>startupShowBorders</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-stylesSet"><code>stylesSet</code></a></td>
			<td>Refer to the {@link features/style Styles} feature guide to learn more about applying styles to the editor content.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-stylesheetParser_skipSelectors"><code>stylesheetParser_skipSelectors</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-stylesheetParser_validSelectors"><code>stylesheetParser_validSelectors</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-tabIndex"><code>tabIndex</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-tabletools_scopedHeaders"><code>tabletools_scopedHeaders</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-tabSpaces"><code>tabSpaces</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-templates"><code>templates</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-templates_files"><code>templates_files</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-templates_replaceContent"><code>templates_replaceContent</code></a></td>
			<td>Refer to the {@link features/template Templates} guide to learn about support for templates in CKEditor&nbsp;5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-title"><code>title</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-toolbar"><code>toolbar</code></a></p>
			</td>
			<td>
				<p>See {@link module:core/editor/editorconfig~EditorConfig#toolbar `config.toolbar`}. Refer to the {@link getting-started/setup/toolbar toolbar} feature guide to learn more about managing toolbars in CKEditor&nbsp;5.</p>
				<p>See also {@link module:core/editor/editorconfig~EditorConfig#balloonToolbar `config.balloonToolbar`} to define the toolbar of a balloon editor and the {@link getting-started/setup/toolbar#block-toolbar block toolbar} feature.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-toolbarCanCollapse"><code>toolbarCanCollapse</code></a></td>
			<td>N/A. The user cannot collapse the toolbar manually. For distraction-free editing with the toolbar appearing when you need it, use {@link examples/builds/inline-editor inline}, {@link examples/builds/balloon-editor balloon}, or {@link examples/builds/balloon-block-editor balloon block} editor.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-toolbarGroupCycling"><code>toolbarGroupCycling</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-toolbarGroups"><code>toolbarGroups</code></a></td>
			<td>N/A. {@link module:core/editor/editorconfig~EditorConfig#toolbar The toolbar buttons can be grouped} by using <code>'|'</code> as a separator or divided into lines by using <code>'-'</code>. Refer to the {@link getting-started/setup/toolbar toolbar} guide to learn more about managing toolbar items behavior in CKEditor&nbsp;5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-toolbarLocation"><code>toolbarLocation</code></a></td>
			<td>N/A. You can achieve this by using the {@link module:editor-decoupled/decouplededitor~DecoupledEditor decoupled editor} or writing an editor with a customized UI view, like in this {@link examples/custom/bottom-toolbar-editor editor with bottom toolbar}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-toolbarStartupExpanded"><code>toolbarStartupExpanded</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-uiColor"><code>uiColor</code></a></td>
			<td>CKEditor&nbsp;5 comes with an idea of much more powerful themes, where you can style almost every aspect of the UI. See the {@link framework/theme-customization Theme customization} guide and {@link examples/theme-customization Theme customization example}. Thanks to {@link framework/theme-customization#customization-with-css-variables CSS variables} rebuilding the editor is not needed to change its styles.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-undoStackSize"><code>undoStackSize</code></a></td>
			<td>See {@link module:typing/typingconfig~TypingConfig#undoStep `config.typing.undoStep`}.</td>
		</tr>
		<tr>
			<td>
			<p><span id="uploadUrl"><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-uploadUrl"><code>uploadUrl</code></a></span></p>
			</td>
			<td>
				<p>There are several image upload strategies supported by CKEditor&nbsp;5. Check out the {@link features/image-upload Image upload} guide to learn more.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-useComputedState"><code>useComputedState</code></a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-widget_keystrokeInsertLineAfter"><code>widget_keystrokeInsertLineAfter</code></a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-widget_keystrokeInsertLineBefore"><code>widget_keystrokeInsertLineBefore</code></a></td>
			<td>In CKEditor&nbsp;5 you can insert a new paragraph directly after a widget with <kbd>Enter</kbd> and directly before a widget &ndash; with <kbd>Shift</kbd> + <kbd>Enter</kbd>.</td>
		</tr>
		<tr>
			<td>
			<p><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-width"><code>width</code></a></p>
			</td>
			<td>
				<p>{@link examples/builds/classic-editor Classic editor} in CKEditor&nbsp;5 no longer encapsulates the editing area in an <code>&lt;iframe&gt;</code>. This means that you can control the width (and similar options) of the editing area with CSS. For instance, to set the width of any of the editor types, use <code>.ck-editor__editable_inline { width:400px; }</code>.</p>
				<p>To set the width dynamically (from JavaScript), use the view writer:</p>
				<pre><code>editor.editing.view.change( writer => {
    writer.setStyle( 'width', '400px', editor.editing.view.document.getRoot() );
} );</code></pre>
				<p>See also <a href="https://stackoverflow.com/questions/46559354/how-to-set-the-height-of-ckeditor-5-classic-editor" target="_blank" rel="noopener">How to set the height of CKEditor&nbsp;5 (Classic editor)</a>.</p>
			</td>
		</tr>
	</tbody>
</table>
