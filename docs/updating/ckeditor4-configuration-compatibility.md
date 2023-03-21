---
# Scope:
# Compare CKEditor 4 configuration options with their CKEditor 5 equivalents.

category: ckeditor4-migration
menu-title: Configuration options compatibility
order: 50
modified_at: 2023-03-21
---

# CKEditor 4 configuration options compatibility

The following table presents CKEditor 4 configuration options and, if available, their equivalent in CKEditor 5.

Note: In CKEditor 5, the number of options was reduced on purpose. Configuring CKEditor 4 was a bit too troublesome due to the sheer number of available configuration options (over 240). This is why when designing CKEditor 5 from scratch, we decided to come up with a simplified editor, with well-thought default behavior, based on the results of the [Editor Recommendations](http://ckeditor.github.io/editor-recommendations/) project.

<style>
/* See: https://github.com/ckeditor/ckeditor5/issues/1718. */
.docsearch-txt {
	table-layout: fixed;
}

.docsearch-txt tr th:nth-child( 1 ),
.docsearch-txt tr td:nth-child( 1 ) {
	width: 275px;
}
</style>

<table class="docsearch-txt">
	<thead>
		<tr>
			<th>CKEditor 4</th>
			<th>CKEditor 5</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><span id="allowedContent"><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-allowedContent">allowedContent</a></span></td>
			<td>
				<p>Extending the list of HTML tags or attributes that CKEditor 5 should support can be achieved via the {@link features/general-html-support General HTML Support feature}. The GHS allows adding HTML markup not yet covered by official CKEditor 5 features into the editor's content. Such elements can be loaded, pasted, or output. It does not, however, provide a dedicated UI for the extended HTML markup.</p>
				<p> Having full-fledged HTML support can be achieved by writing a plugin that (ideally) provides also means to control (insert, edit, delete) such markup. For more information on how to create plugins check the {@link framework/creating-simple-plugin-timestamp Creating a basic plugin} article. Looking at the source code of CKEditor 5 plugins may also give you a lot of inspiration.</p>
				<p>Note that only content that is explicitly converted between the model and the view by the editor plugins will be preserved in CKEditor 5. Check the {@link framework/deep-dive/conversion/intro conversion documentation} to learn how to extend the conversion rules.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autoEmbed_widget">autoEmbed_widget</a></td>
			<td>Refer to the {@link features/media-embed Media embed} feature guide to learn more about media embedding in CKEditor 5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autoGrow_bottomSpace">autoGrow_bottomSpace</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autoGrow_maxHeight">autoGrow_maxHeight</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autoGrow_minHeight">autoGrow_minHeight</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autoGrow_onStartup">autoGrow_onStartup</a></td>
			<td>
				<p>These settings are no longer needed as CKEditor 5 automatically grows with content by default.</p>
				<p>{@link examples/builds/classic-editor Classic editor} in CKEditor 5 no longer encapsulates the editing area in an <code>&lt;iframe&gt;</code>, which means that the height (and similar options) of the editing area can be easily controlled with CSS. For example, the <code>minHeight</code> and <code>maxHeight</code> options can be set with the following code:</p>
				<pre><code class="language-css">.ck.ck-content:not(.ck-comment__input *) {
	/* Note: You can use min-height and max-height instead here. */
	height: 300px;
	overflow-y: auto;
}</code>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autoUpdateElement">autoUpdateElement</a></td>
			<td>CKEditor 5 always updates the replaced element. This behavior cannot be disabled.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autocomplete_commitKeystrokes">autocomplete_commitKeystrokes</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autolink_commitKeystrokes">autolink_commitKeystrokes</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autolink_emailRegex">autolink_emailRegex</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-autolink_urlRegex">autolink_urlRegex</a></td>
			<td>Refer to the {@link features/link#autolink-feature Autolink section} of the Link guide to learn more about support for automatic linking in CKEditor 5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-baseFloatZIndex">baseFloatZIndex</a></td>
			<td>N/A. There is a dedicated <a href="https://github.com/ckeditor/ckeditor5/issues/5352" target="_blank" rel="noopener">issue about z-index management</a> and making it more open for developers.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-baseHref">baseHref</a></td>
			<td>Not supported yet, see <a href="https://github.com/ckeditor/ckeditor5/issues/665" target="_blank" rel="noopener">the relevant GitHub issue</a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-basicEntities">basicEntities</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-blockedKeystrokes">blockedKeystrokes</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-bodyClass">bodyClass</a></td>
			<td>
				<p>{@link examples/builds/classic-editor Classic editor} in CKEditor 5 no longer encapsulates the editing area in an <code>&lt;iframe&gt;</code>, so this setting is no longer needed. Simply wrap the editor with a <code>&lt;div class=&quot;...&quot;&gt;</code> to achieve a similar result. When using {@link examples/builds/balloon-editor balloon}, {@link examples/builds/balloon-block-editor balloon block}, {@link examples/builds/inline-editor inline}, or {@link examples/builds/document-editor decoupled} editor, you may add a class to the element on which the editor is initialized.</p>
				<p>Additionally, all editor types use <code>.ck-content</code> on their main root editable elements. This class can thus also be used to write stylesheet rules for the editor content.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-bodyId">bodyId</a></td>
			<td>
				<p>{@link examples/builds/classic-editor Classic editor} in CKEditor 5 no longer encapsulates the editing area in an <code>&lt;iframe&gt;</code>, so this setting is no longer needed. Simply wrap the editor with a <code>&lt;div id=&quot;...&quot;&gt;</code> to achieve a similar result. When using {@link examples/builds/balloon-editor balloon}, {@link examples/builds/balloon-block-editor balloon block}, {@link examples/builds/inline-editor inline}, or {@link examples/builds/document-editor decoupled} editor, you may add a class to the element on which the editor is initialized.</p>
				<p>Additionally, all editor types use <code>.ck-content</code> on their main root editable elements. This class can thus also be used to write stylesheet rules for the editor content.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-browserContextMenuOnCtrl">browserContextMenuOnCtrl</a></td>
			<td>No longer needed as CKEditor 5 does not have its own context menu and does not block the native browser context menu.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-clipboard_defaultContentType">clipboard_defaultContentType</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-clipboard_notificationDuration">clipboard_notificationDuration</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-cloudServices_tokenUrl">cloudServices_tokenUrl</a></td>
			<td>See {@link module:cloud-services/cloudservices~CloudServicesConfig#tokenUrl `config.cloudServices.tokenUrl`}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-cloudServices_uploadUrl">cloudServices_uploadUrl</a></td>
			<td>See {@link module:cloud-services/cloudservices~CloudServicesConfig#uploadUrl `config.cloudServices.uploadUrl`}. Check out the comprehensive {@link features/image-upload Image upload} guide to learn more.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-codeSnippetGeshi_url">codeSnippetGeshi_url</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-codeSnippet_codeClass">codeSnippet_codeClass</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-codeSnippet_languages">codeSnippet_languages</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-codeSnippet_theme">codeSnippet_theme</a></td>
			<td>
				<p>Refer to the {@link features/code-blocks Code block} feature guide to learn more about support for blocks of pre–formatted code in CKEditor 5.</p>
				<p>A plugin adding support for the inline <code>&lt;code&gt;</code> element is included in the {@link features/basic-styles Basic styles} package.<br>
				Note: The {@link module:basic-styles/code~Code Code feature} is not available by default in any predefined build, but can be enabled in a {@link installation/getting-started/quick-start-other#building-the-editor-from-source custom build} (see the {@link features/basic-styles Basic styles} feature guide).</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_backStyle">colorButton_backStyle</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_colors">colorButton_colors</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_colorsPerRow">colorButton_colorsPerRow</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_enableAutomatic">colorButton_enableAutomatic</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_enableMore">colorButton_enableMore</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_foreStyle">colorButton_foreStyle</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_historyRowLimit">colorButton_historyRowLimit</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_normalizeBackground">colorButton_normalizeBackground</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-colorButton_renderContentColors">config.colorButton_renderContentColors</a></td>
			<td>
				<p>Refer to the {@link features/font#configuring-the-font-color-and-font-background-color-features Font family, size, and color} feature guide to learn more about configuring font and background color in CKEditor 5.</p>
				<p>CKEditor 5 also provides a new highlight plugin. It allows for highlighting parts of the text with the <code>&lt;mark&gt;</code> element with different CSS classes that can be easily styled. See the {@link features/highlight Highlight} feature guide for more information.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-contentsCss">contentsCss</a></td>
			<td>{@link examples/builds/classic-editor Classic editor} in CKEditor 5 no longer encapsulates the editing area in an <code>&lt;iframe&gt;</code>, so such file and configuration setting is no longer needed. If for some reason you need to style the contents of the editing area differently, use the <code>.ck-content</code> selector.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-contentsLangDirection">contentsLangDirection</a></td>
			<td>Refer to the {@link features/ui-language#setting-the-language-of-the-content Setting the language of the content} guide to learn how to set the content direction using the {@link module:core/editor/editorconfig~EditorConfig#language `config.language`} configuration option.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-contentsLanguage">contentsLanguage</a></td>
			<td>Refer to the {@link features/ui-language#setting-the-language-of-the-content Setting the language of the content} guide to learn how to set the content language using the {@link module:core/editor/editorconfig~EditorConfig#language `config.language`} configuration option.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-contextmenu_contentsCss">contextmenu_contentsCss</a></td>
			<td>No longer needed as CKEditor 5 does not have its own context menu.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-copyFormatting_allowRules">copyFormatting_allowRules</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-copyFormatting_allowedContexts">copyFormatting_allowedContexts</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-copyFormatting_disallowRules">copyFormatting_disallowRules</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-copyFormatting_keystrokeCopy">copyFormatting_keystrokeCopy</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-copyFormatting_keystrokePaste">copyFormatting_keystrokePaste</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-copyFormatting_outerCursor">copyFormatting_outerCursor</a></td>
			<td><a href="https://ckeditor.com/contact/" target="_blank">Coming soon</a>!</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-coreStyles_bold">coreStyles_bold</a></td>
			<td>CKEditor 5 uses the <code>&lt;strong&gt;</code> element, see <a href="https://ckeditor.github.io/editor-recommendations/features/bold.html" target="_blank" rel="noopener">Editor Recommendations - Bold</a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-coreStyles_italic">coreStyles_italic</a></td>
			<td>CKEditor 5 uses the <code>&lt;i&gt;</code> element, see <a href="https://ckeditor.github.io/editor-recommendations/features/italic.html" target="_blank" rel="noopener">Editor Recommendations - Italic</a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-coreStyles_strike">coreStyles_strike</a></td>
			<td>CKEditor 5 uses the <code>&lt;s&gt;</code> element, see <a href="https://ckeditor.github.io/editor-recommendations/features/strikethrough.html" target="_blank" rel="noopener">Editor Recommendations - Strikethrough</a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-coreStyles_subscript">coreStyles_subscript</a></td>
			<td>
				<p>CKEditor 5 uses the <code>&lt;sub&gt;</code> element.
				<p>Note: The {@link module:basic-styles/subscript~Subscript Subscript feature} is not available by default in any predefined build, but can be enabled in a {@link installation/getting-started/quick-start-other#building-the-editor-from-source custom build} (see the {@link features/basic-styles Basic styles} feature guide).</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-coreStyles_superscript">coreStyles_superscript</a></td>
			<td>
				<p>CKEditor 5 uses the <code>&lt;sup&gt;</code> element.
				<p>Note: The {@link module:basic-styles/superscript~Superscript Superscript feature} is not available by default in any predefined build, but can be enabled in a {@link installation/getting-started/quick-start-other#building-the-editor-from-source custom build} (see the {@link features/basic-styles Basic styles} feature guide).</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-coreStyles_underline">coreStyles_underline</a></td>
			<td>
				<p>CKEditor 5 uses the <code>&lt;u&gt;</code> element, see <a href="https://github.com/ckeditor/editor-recommendations/issues/4" target="_blank" rel="noopener">Editor Recommendations - Underline</a>.</p>
				<p>Note: The {@link module:basic-styles/underline~Underline Underline feature} is not available by default in any predefined build, but can be enabled in a {@link installation/getting-started/quick-start-other#building-the-editor-from-source custom build} (see the {@link features/basic-styles Basic styles} feature guide).</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-customConfig">customConfig</a></td>
			<td>For performance reasons, CKEditor 5 no longer loads a separate configuration file. Passing configuration options inline reduces the number of HTTP requests.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-dataIndentationChars">dataIndentationChars</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><span id="defaultLanguage"><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-defaultLanguage">defaultLanguage</a></span></td>
			<td>The support for multiple translations is handled by the translations service. See the {@link features/ui-language UI language} feature guide.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-devtools_styles">devtools_styles</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-devtools_textCallback">devtools_textCallback</a></td>
			<td>The old CKEditor 4 Developer Tools plugin is not available for CKEditor 5. However, check out the new {@link framework/development-tools#ckeditor-5-inspector CKEditor 5 inspector}. It is a far more advanced tool that will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-dialog_backgroundCoverColor">dialog_backgroundCoverColor</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-dialog_backgroundCoverOpacity">dialog_backgroundCoverOpacity</a></td>
			<td>The use of configuration options to style selected parts of the editor was dropped in favor of much more powerful {@link framework/theme-customization theme customization}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-dialog_buttonsOrder">dialog_buttonsOrder</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-dialog_magnetDistance">dialog_magnetDistance</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-dialog_noConfirmCancel">dialog_noConfirmCancel</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-dialog_startupFocusTab">dialog_startupFocusTab</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-disableNativeSpellChecker">disableNativeSpellChecker</a></td>
			<td>
				<p>Note: An official integration of the spell and grammar checking functionality for CKEditor 5 is provided by a partner solution, {@link features/spelling-and-grammar-checking WProofreader}.</p>
				<p>A dedicated configuration option to disable the native browser spell checker is unavailable. However, in case of inline, balloon, and balloon block editors it can be done by setting the <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/spellcheck" target="_blank" rel="noopener"><code>spellcheck</code></a> attribute directly on the element where CKEditor should be enabled.</p>
				<p>Additionally, for all types of editors, including the classic and decoupled ones, you can also call:</p>
				<pre><code>editor.editing.view.change( writer => {
	writer.setAttribute( 'spellcheck', 'false', editor.editing.view.document.getRoot() );
} );</code></pre>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-disableNativeTableHandles">disableNativeTableHandles</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-disableObjectResizing">disableObjectResizing</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-disableReadonlyStyling">disableReadonlyStyling</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-disallowedContent">disallowedContent</a></td>
			<td>See <a href="#allowedContent"><code>config.allowedContent</code></a>. No longer needed as CKEditor 5 removes all unwanted markup that cannot be edited with the editor. This can be controlled by adding plugins to the editor or via the {@link features/general-html-support General HTML Support feature}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-div_wrapTable">div_wrapTable</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-docType">docType</a></td>
			<td>N/A. CKEditor 5 no longer encapsulates the editing area in an <code>&lt;iframe&gt;</code>, so the editor is using the same doctype as the page where it operates.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-easyimage_class">easyimage_class</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-easyimage_defaultStyle">easyimage_defaultStyle</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-easyimage_styles">easyimage_styles</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-easyimage_toolbar">easyimage_toolbar</a></td>
			<td>Refer to the {@link features/easy-image Easy Image} and {@link features/images-overview Images} feature guides to learn more about image-related features and Easy Image integration in CKEditor 5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-editorplaceholder">editorplaceholder</a></td>
			<td>Refer to the {@link features/editor-placeholder Editor placeholder} feature guide to learn more about configuring this feature in CKEditor 5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-emailProtection">emailProtection</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-embed_provider">embed_provider</a></td>
			<td>Refer to the {@link features/media-embed Media embed} feature guide to learn more about media embedding in CKEditor 5.</td>
		</tr>
		<tr>
			<td><span id="emoji"><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-emoji_emojiListUrl">emoji_emojiListUrl</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-emoji_minChars">emoji_minChars</a></span></td>
			<td>Emoji can be pasted into CKEditor 5 as Unicode content. You can use the emoji picker of your operating system to insert emoji characters. Use the <kbd>Ctrl</kbd>+<kbd>Cmd</kbd>+<kbd>Space</kbd> keyboard shortcut (macOS) or <kbd>Win</kbd>+<kbd>.</kbd> (Windows) or the relevant emoji key on the touch keyboard of your device to open the picker. The {@link features/text-transformation Automatic text transformation feature} may be configured to deliver emojis with shortcodes, too.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-enableContextMenu">enableContextMenu</a></td>
			<td>N/A. CKEditor 5 does not come with a context menu. A configurable contextual inline toolbar is preferred instead to offer contextual actions for features such as {@link features/tables#table-contextual-toolbar tables} or {@link features/images-overview#image-contextual-toolbar images}. See also {@link module:core/editor/editorconfig~EditorConfig#toolbar <code>toolbar</code>}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-enableTabKeyTools">enableTabKeyTools</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><span id="enterMode"><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-enterMode">enterMode</a></span></td>
			<td>
				<p>N/A. CKEditor 5 always creates a new paragraph (<code>&lt;p&gt;</code> element) as specified by <a href="http://ckeditor.github.io/editor-recommendations/usability/enter-key.html" target="_blank" rel="noopener">Editor Recommendations - Enter key</a>.</p>
				<p><kbd>Shift</kbd>+<kbd>Enter</kbd> can be used for creating soft line breaks.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-entities">entities</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-entities_additional">entities_additional</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-entities_greek">entities_greek</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-entities_latin">entities_latin</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-entities_processNumerical">entities_processNumerical</a></td>
			<td>N/A</td>
		</tr>
				<tr>
			<td>
			<a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-exportPdf_fileName">exportPdf_fileName</a> <br><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-exportPdf_options">exportPdf_options</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-exportPdf_service">exportPdf_service</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-exportPdf_stylesheets">exportPdf_stylesheets</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-exportPdf_tokenUrl">exportPdf_tokenUrl</a> <br>
			</td>
			<td>
				Refer to the <a href="https://ckeditor.com/docs/ckeditor5/latest/features/export-pdf.html">Export to PDF feature</a> guide to learn more about about configuring the HTML to PDF converter in CKEditor 5.
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-extraAllowedContent">extraAllowedContent</a></td>
			<td>See <a href="#allowedContent"><code>config.allowedContent</code></a>. This can also be achieved via the {@link features/general-html-support General HTML Support feature}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-extraPlugins">extraPlugins</a></td>
			<td>Learn how to {@link installation/plugins/installing-plugins install plugins in CKEditor 5}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fileTools_defaultFileName">fileTools_defaultFileName</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fileTools_requestHeaders">fileTools_requestHeaders</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserBrowseUrl">filebrowserBrowseUrl</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserFlashBrowseUrl">filebrowserFlashBrowseUrl</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserFlashUploadUrl">filebrowserFlashUploadUrl</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserImageBrowseLinkUrl">filebrowserImageBrowseLinkUrl</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserImageBrowseUrl">filebrowserImageBrowseUrl</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserImageUploadUrl"> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserUploadMethod">filebrowserUploadMethod</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserUploadUrl">filebrowserUploadUrl</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserWindowFeatures">filebrowserWindowFeatures</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserWindowHeight">filebrowserWindowHeight</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-filebrowserWindowWidth">filebrowserWindowWidth</a></td>
			<td>There is no equivalent of the file browser plugin in CKEditor 5 yet. See also <a href="#uploadUrl"><code>config.uploadUrl</code></a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fillEmptyBlocks">fillEmptyBlocks</a></td>
			<td>Blocks are always filled in CKEditor 5 because this ensures that the intention of the content author (who left such empty lines) will be preserved in the output data.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-find_highlight">find_highlight</a></td>
			<td>Refer to the <a href="https://ckeditor.com/docs/ckeditor5/latest/features/find-and-replace.html">Find and replace</a> feature guide.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-flashAddEmbedTag">flashAddEmbedTag</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-flashConvertOnEdit">flashConvertOnEdit</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-flashEmbedTagOnly">flashEmbedTagOnly</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-floatSpaceDockedOffsetX">floatSpaceDockedOffsetX</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-floatSpaceDockedOffsetY">floatSpaceDockedOffsetY</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-floatSpacePinnedOffsetX">floatSpacePinnedOffsetX</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-floatSpacePinnedOffsetY">floatSpacePinnedOffsetY</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-floatSpacePreferRight">floatSpacePreferRight</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fontSize_defaultLabel">fontSize_defaultLabel</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fontSize_sizes">fontSize_sizes</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fontSize_style">fontSize_style</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-font_defaultLabel">font_defaultLabel</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-font_names">font_names</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-font_style">font_style</a></td>
			<td>Refer to the {@link features/font Font family, size, and color} feature guide to learn more about font size, family, and color support in CKEditor 5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-forceEnterMode">forceEnterMode</a></td>
			<td>N/A. Se also <a href="#enterMode"><code>config.enterMode</code></a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-forcePasteAsPlainText">forcePasteAsPlainText</a></td>
			<td>N/A. No longer needed as CKEditor 5 removes all unwanted markup that cannot be edited with the enabled editor plugins.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-forceSimpleAmpersand">forceSimpleAmpersand</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_address">format_address</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_div">format_div</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_p">format_p</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_pre">format_pre</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_h1">format_h1</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_h2">format_h2</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_h3">format_h3</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_h4">format_h4</a> <br>  <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_h5">format_h5</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_h6">format_h6</a></td>
			<td>All headings are configurable via {@link module:heading/heading~HeadingConfig#options `config.heading.options`}. See also the {@link features/headings Headings} feature guide.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-format_tags">format_tags</a></td>
			<td>In order to enable additional block tags in CKEditor 5, the {@link features/general-html-support General HTML Support feature} may be used. Alternatively, a dedicated plugin must be provided. See also <a href="#allowedContent"><code>config.allowedContent</code></a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-fullPage">fullPage</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-grayt_autoStartup">grayt_autoStartup</a></td>
			<td>An official integration of the spell and grammar checking functionality for CKEditor 5 is provided by a partner solution, {@link features/spelling-and-grammar-checking WProofreader}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-height">height</a></td>
			<td>
				<p>{@link examples/builds/classic-editor Classic editor} in CKEditor 5 no longer encapsulates the editing area in an <code>&lt;iframe&gt;</code>, which means that the height (and similar options) of the editing area can be easily controlled with CSS. For example, the height setting can be achieved with <code>.ck-editor__editable_inline { height:400px; }</code>.</p>
				<p>To set the height dynamically (from JavaScript), use the view writer:</p>
				<pre><code>editor.editing.view.change( writer => {
    writer.setStyle( 'height', '400px', editor.editing.view.document.getRoot() );
} );</code></pre>
				<p>See also <a href="https://stackoverflow.com/questions/46559354/how-to-set-the-height-of-ckeditor-5-classic-editor" target="_blank" rel="noopener">How to set the height of CKEditor 5 (Classic editor)</a>.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-htmlEncodeOutput">htmlEncodeOutput</a></td>
			<td>N/A. CKEditor 5 outputs HTML markup. See also <a href="https://stackoverflow.com/questions/47555667/ckeditor-5-htmlencodeoutput-doesnt-work" target="_blank" rel="noopener">this StackOverflow question</a> and a <a href="https://github.com/ckeditor/ckeditor5/issues/698" target="_blank" rel="noopener">dedicated issue</a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-ignoreEmptyParagraph">ignoreEmptyParagraph</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image2_alignClasses">image2_alignClasses</a></td>
			<td>Available via more powerful {@link module:image/image~ImageConfig#styles `config.image.styles`}. This also allows for using custom style definitions, not only left, right and center alignment. See the {@link features/images-styles Image styles} feature guide.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image2_altRequired">image2_altRequired</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image2_captionedClass">image2_captionedClass</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image2_disableResizer">image2_disableResizer</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image2_maxSize">image2_maxSize</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image2_prefillDimensions">image2_prefillDimensions</a></td>
			<td>Refer to the {@link features/images-overview Image} feature guide to learn more about image-related features and customization options in CKEditor 5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-imageUploadUrl">imageUploadUrl</a></td>
			<td>See <a href="#uploadUrl"><code>config.uploadUrl</code></a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image_prefillDimensions">image_prefillDimensions</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image_previewText">image_previewText</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-image_removeLinkByEmptyURL">image_removeLinkByEmptyURL</a></td>
			<td>Refer to the {@link features/images-overview Image} feature guide to learn more about image-related features and customization options in CKEditor 5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-indentClasses">indentClasses</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-indentOffset">indentOffset</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-indentUnit">indentUnit</a></td>
			<td>Refer to the {@link features/indent#configuring-the-block-indentation-feature Configuring the block indentation} feature guide to learn how to customize the indentation behavior using offsets, units, or classes.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-jqueryOverrideVal">jqueryOverrideVal</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-justifyClasses">justifyClasses</a></td>
			<td>Refer to the {@link features/text-alignment Text alignment} feature guide.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-keystrokes">keystrokes</a></td>
			<td>
				<p>Keystroke handlers can be registered using {@link module:core/editingkeystrokehandler~EditingKeystrokeHandler <code>EditingKeystrokeHandler</code>}. More information and examples can be found in a dedicated {@link framework/architecture/ui-library#keystrokes-and-focus-management Keystrokes and focus management} section.</p>
				<p>Making keystrokes overridable through <code>config.keystrokes</code> is handled in a <a href="https://github.com/ckeditor/ckeditor5-core/issues/8" target="_blank" rel="noopener">dedicated issue</a>. There is also an issue about <a href="https://github.com/ckeditor/ckeditor5-core/issues/20" target="_blank" rel="noopener">improving keystroke handling</a>.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-language">language</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-language_list">language_list</a></td>
			<td>The support for multiple translations is handled by the translations service. See the {@link features/ui-language UI language} feature guide.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-linkDefaultProtocol">linkDefaultProtocol</a></td>
			<td>{@link module:link/link~LinkConfig#defaultProtocol `config.link.defaultProtocol`}</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-linkJavaScriptLinksAllowed">linkJavaScriptLinksAllowed</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-linkPhoneMsg">linkPhoneMsg</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-linkPhoneRegExp">linkPhoneRegExp</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-linkShowAdvancedTab">linkShowAdvancedTab</a></td>
			<td>Refer to the {@link features/link Link} feature guide to read about setting custom link attributes.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-linkShowTargetTab">linkShowTargetTab</a></td>
			<td>See {@link module:link/link~LinkConfig#addTargetToExternalLinks `config.link.addTargetToExternalLinks`}</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-magicline_color">magicline_color</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-magicline_everywhere">magicline_everywhere</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-magicline_holdDistance">magicline_holdDistance</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-magicline_keystrokeNext">magicline_keystrokeNext</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-magicline_keystrokePrevious">magicline_keystrokePrevious</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-magicline_tabuList">magicline_tabuList</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-magicline_triggerOffset">magicline_triggerOffset</a></td>
            <td>This functionality is covered by the {@link module:widget/widgettypearound~WidgetTypeAround `WidgetTypeAround`} plugin that allows users to type around widgets where normally it is impossible to place the caret due to limitations of web browsers.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-mathJaxClass">mathJaxClass</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-mathJaxLib">mathJaxLib</a></td>
			<td>N/A. Math equation functionality for CKEditor 5 is provided by a partner solution, {@link features/math-equations MathType}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-mentions">mentions</a></td>
			<td>Refer to the {@link features/mentions Mentions} feature guide to learn more about smart autocompletion based on user input in CKEditor 5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-menu_groups">menu_groups</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-menu_subMenuDelay">menu_subMenuDelay</a></td>
			<td>CKEditor 5 does not come with a context menu. A configurable contextual inline toolbar is preferred instead to offer contextual actions for features such as {@link features/tables#table-contextual-toolbar tables} or {@link features/images-overview#image-contextual-toolbar images}. See also {@link module:core/editor/editorconfig~EditorConfig#toolbar <code>toolbar</code>}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-newpage_html">newpage_html</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-notification_duration">notification_duration</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-on">on</a></td>
			<td>
				<p>Using the configuration file or setting to define event listeners was a bad practice so support for it was dropped.</p>
				<p>When creating an editor, a <code>Promise</code> is returned. Use <code>then/catch()</code> to define a callback when the editor is initialized or fails to start. The promise returns the created editor instance, e.g. {@link module:editor-classic/classiceditor~ClassicEditor <code>ClassicEditor</code>}, on which you can listen to its events.</p>
				<p>Note: The editor instance is not the only object on which events are fired. You can also listen to e.g. {@link module:engine/model/document~Document `Document`} events.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-pasteFilter">pasteFilter</a></td>
			<td>Not needed as CKEditor 5 always trims the pasted content to match what the available plugins can handle. If you would like to filter the pasted content even further, please <a href="https://github.com/ckeditor/ckeditor5/issues/new?labels=type%3Afeature&template=2-feature-request.md" target="_blank" rel="noopener">report a ticket</a>.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-pasteFromWordCleanupFile">pasteFromWordCleanupFile</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-pasteFromWordNumberedHeadingToList">pasteFromWordNumberedHeadingToList</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-pasteFromWordPromptCleanup">pasteFromWordPromptCleanup</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-pasteFromWordRemoveStyles">pasteFromWordRemoveStyles</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-pasteFromWord_heuristicsEdgeList">pasteFromWord_heuristicsEdgeList</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-pasteFromWord_inlineImages">pasteFromWord_inlineImages</a></td>
			<td>Refer to the {@link features/paste-from-word Paste from Word} feature guide to learn more about support for pasting from Microsoft Word in CKEditor 5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-pasteTools_keepZeroMargins">pasteTools_keepZeroMargins</a></td>
			<td>Refer to the {@link features/paste-from-word Paste from Word} and {@link features/paste-from-word Paste from Google Docs} feature guides to learn more about support for pasting from external applications in CKEditor 5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-plugins">plugins</a></td>
			<td>See the {@link module:core/editor/editorconfig~EditorConfig#plugins <code>plugins</code>} configuration option. The way how plugins are enabled in CKEditor 5 has changed in general. Check the articles about {@link installation/plugins/plugins plugins} and {@link installation/getting-started/quick-start-other custom builds} for more information.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-protectedSource">protectedSource</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-readOnly">readOnly</a></td>
			<td>See {@link module:core/editor/editor~Editor#isReadOnly <code>editor.isReadOnly</code>} and refer to the {@link features/read-only Read-only} feature guide.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-removeButtons">removeButtons</a></td>
			<td>N/A. A similar effect can be achieved by setting the {@link module:core/editor/editorconfig~EditorConfig#toolbar <code>toolbar</code>} option with fewer buttons.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-removeDialogTabs">removeDialogTabs</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-removeFormatAttributes">removeFormatAttributes</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-removeFormatTags">removeFormatTags</a></td>
			<td>Refer to the {@link features/remove-format Remove formatting} feature guide to learn how to quickly remove any text formatting applied using inline HTML elements and CSS styles in CKEditor 5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-removePlugins">removePlugins</a></td>
			<td>See {@link module:core/editor/editorconfig~EditorConfig#removePlugins `config.removePlugins`}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-resize_dir">resize_dir</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-resize_enabled">resize_enabled</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-resize_maxHeight">resize_maxHeight</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-resize_maxWidth">resize_maxWidth</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-resize_minHeight">resize_minHeight</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-resize_minWidth">resize_minWidth</a></td>
			<td>No longer needed. The editor automatically grows with content. You can also limit its height with <code>min-height</code> and <code>max-height</code> or set it with <code>height</code> if you need. If you want to allow the users to manually resize the editor, you need to implement this behavior by yourself.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_autoStartup">scayt_autoStartup</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_contextCommands">scayt_contextCommands</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_contextMenuItemsOrder">scayt_contextMenuItemsOrder</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_customDictionaryIds">scayt_customDictionaryIds</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_customPunctuation">scayt_customPunctuation</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_customerId">scayt_customerId</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_disableOptionsStorage">scayt_disableOptionsStorage</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_elementsToIgnore">scayt_elementsToIgnore</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_handleCheckDirty">scayt_handleCheckDirty</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_handleUndoRedo">scayt_handleUndoRedo</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_ignoreAllCapsWords">scayt_ignoreAllCapsWords</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_ignoreDomainNames">scayt_ignoreDomainNames</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_ignoreWordsWithMixedCases">scayt_ignoreWordsWithMixedCases</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_ignoreWordsWithNumbers">scayt_ignoreWordsWithNumbers</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_inlineModeImmediateMarkup">scayt_inlineModeImmediateMarkup</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_maxSuggestions">scayt_maxSuggestions</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_minWordLength">scayt_minWordLength</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_moreSuggestions">scayt_moreSuggestions</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_sLang">scayt_sLang</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_serviceHost">scayt_serviceHost</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_servicePath">scayt_servicePath</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_servicePort">scayt_servicePort</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_serviceProtocol">scayt_serviceProtocol</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_srcUrl">scayt_srcUrl</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_uiTabs">scayt_uiTabs</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-scayt_userDictionaryName">scayt_userDictionaryName</a></td>
			<td>The spell and grammar checking functionality for CKEditor 5 is provided by a partner solution, {@link features/spelling-and-grammar-checking WProofreader}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-sharedSpaces">sharedSpaces</a></td>
			<td>
				<p>N/A.</p>
				<p>The {@link module:editor-decoupled/decouplededitor~DecoupledEditor decoupled editor} allows configuring where to insert the toolbar and the editable element.</p>
				<p>In addition to that, CKEditor 5 Framework architecture allows for writing a custom editor that contains multiple editable elements (document roots). See the {@link examples/framework/multi-root-editor multi-root editor example}.</p>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-shiftEnterMode">shiftEnterMode</a></td>
			<td>
				<p>N/A. CKEditor 5 always creates a new paragraph (<code>&lt;p&gt;</code> element) as specified by <a href="http://ckeditor.github.io/editor-recommendations/usability/enter-key.html" target="_blank" rel="noopener">Editor Recommendations - Enter key</a>.</p>
				<p><kbd>Shift</kbd>+<kbd>Enter</kbd> can be used for creating soft line breaks.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-skin">skin</a></td>
			<td>
				<p>In CKEditor 5 lots of changes to the interface can be easily made by changing the default CKEditor theme. See the {@link framework/theme-customization Theme customization} guide.</p>
				<p>For heavy UI modifications, like integrating CKEditor with a custom UI framework, building a custom editor is needed. See the {@link framework/external-ui Third-party UI} guide.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-smiley_columns">smiley_columns</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-smiley_descriptions">smiley_descriptions</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-smiley_images">smiley_images</a> <br>  <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-smiley_path">smiley_path</a></td>
			<td>There is no dedicated smiley plugin in CKEditor 5. However, the <a href="#emoji">emoji</a> can be pasted into the rich-text editor as Unicode content. Also the {@link features/text-transformation Automatic text transformation feature} may be configured to deliver Unicode emojis with shortcodes. The {@link features/special-characters Special characters} feature may be used to input emojis as well.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-sourceAreaTabSize">sourceAreaTabSize</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-specialChars">specialChars</a></td>
			<td>Refer to the {@link features/special-characters Special characters} feature guide to learn more about support for inserting special characters in CKEditor 5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-startupFocus">startupFocus</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-startupMode">startupMode</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-startupOutlineBlocks">startupOutlineBlocks</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-startupShowBorders">startupShowBorders</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-stylesSet">stylesSet</a></td>
			<td>Refer to the {@link features/style Styles} feature guide to learn more about applying styles to the editor content.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-stylesheetParser_skipSelectors">stylesheetParser_skipSelectors</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-stylesheetParser_validSelectors">stylesheetParser_validSelectors</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-tabIndex">tabIndex</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-tabSpaces">tabSpaces</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-templates">templates</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-templates_files">templates_files</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-templates_replaceContent">templates_replaceContent</a></td>
			<td><a href="https://ckeditor.com/contact/" target="_blank">Coming soon</a>!</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-title">title</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-toolbar">toolbar</a></td>
			<td>
				<p>See {@link module:core/editor/editorconfig~EditorConfig#toolbar `config.toolbar`}. Refer to the {@link features/toolbar toolbar} feature guide to learn more about managing toolbars in CKEditor 5.</p>
				<p>See also {@link module:core/editor/editorconfig~EditorConfig#balloonToolbar `config.balloonToolbar`} to define the toolbar of a balloon editor and the {@link features/blocktoolbar block toolbar} feature.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-toolbarCanCollapse">toolbarCanCollapse</a></td>
			<td>N/A. The toolbar cannot be collapsed manually by the user. For distraction-free editing with the toolbar appearing when you need it, use {@link examples/builds/inline-editor inline}, {@link examples/builds/balloon-editor balloon}, or {@link examples/builds/balloon-block-editor balloon block} editor.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-toolbarGroupCycling">toolbarGroupCycling</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-toolbarGroups">toolbarGroups</a></td>
			<td>N/A. {@link module:core/editor/editorconfig~EditorConfig#toolbar The toolbar buttons can be grouped} by using <code>'|'</code> as a separator or divided into multiple lines by using <code>'-'</code>. Refer to the {@link features/toolbar toolbar} guide to learn more about managing toolbar items behavior in CKEditor 5.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-toolbarLocation">toolbarLocation</a></td>
			<td>N/A. Can be achieved by using the {@link module:editor-decoupled/decouplededitor~DecoupledEditor decoupled editor} or writing an editor with a customized UI view, like in this {@link examples/custom/bottom-toolbar-editor editor with bottom toolbar}.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-toolbarStartupExpanded">toolbarStartupExpanded</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-uiColor">uiColor</a></td>
			<td>CKEditor 5 comes with a concept of much more powerful themes, where almost every aspect of the UI can be styled easily. See the {@link framework/theme-customization Theme customization} guide and {@link examples/theme-customization Theme customization example}. Thanks to {@link framework/theme-customization#customization-with-css-variables CSS variables} rebuilding the editor is not needed to change its styles.</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-undoStackSize">undoStackSize</a></td>
			<td>See {@link module:typing/typing~TypingConfig#undoStep `config.typing.undoStep`}.</td>
		</tr>
		<tr>
			<td><span id="uploadUrl"><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-uploadUrl">uploadUrl</a></span></td>
			<td>
				<p>There are several image upload strategies supported by CKEditor 5. Check out the {@link features/image-upload Image upload} guide to learn more.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-useComputedState">useComputedState</a></td>
			<td>N/A</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-width">width</a></td>
			<td>
				<p>{@link examples/builds/classic-editor Classic editor} in CKEditor 5 no longer encapsulates the editing area in an <code>&lt;iframe&gt;</code>, which means that the width (and similar options) of the editing area can be easily controlled with CSS. For instance, to set the width of any of the editor types, use <code>.ck-editor__editable_inline { width:400px; }</code>.</p>
				<p>To set the width dynamically (from JavaScript), use the view writer:</p>
				<pre><code>editor.editing.view.change( writer => {
    writer.setStyle( 'width', '400px', editor.editing.view.document.getRoot() );
} );</code></pre>
				<p>See also <a href="https://stackoverflow.com/questions/46559354/how-to-set-the-height-of-ckeditor-5-classic-editor" target="_blank" rel="noopener">How to set the height of CKEditor 5 (Classic editor)</a>.</p>
			</td>
		</tr>
		<tr>
			<td><a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-wsc_cmd">wsc_cmd</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-wsc_customDictionaryIds">wsc_customDictionaryIds</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-wsc_customLoaderScript">wsc_customLoaderScript</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-wsc_customerId">wsc_customerId</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-wsc_height">wsc_height</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-wsc_lang">wsc_lang</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-wsc_left">wsc_left</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-wsc_top">wsc_top</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-wsc_userDictionaryName">wsc_userDictionaryName</a> <br> <a href="/docs/ckeditor4/latest/api/CKEDITOR_config.html#cfg-wsc_width">wsc_width</a></td>
			<td>The spell and grammar checking functionality for CKEditor 5 is provided by a partner solution, {@link features/spelling-and-grammar-checking WProofreader}.</td>
		</tr>
	</tbody>
</table>
