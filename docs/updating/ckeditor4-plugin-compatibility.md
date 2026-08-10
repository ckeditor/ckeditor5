---
category: ckeditor4-migration
menu-title: Plugin equivalents
meta-title: Migration from CKEditor 4 - Plugin equivalents | CKEditor 5 Documentation
meta-description: This guide presents plugins available in CKEditor 4 and their equivalent in CKEditor 5.
order: 40
modified_at: 2026-08-05
---

# CKEditor 4 plugin equivalents

The following table presents plugins available in CKEditor 4 and their equivalent in CKEditor&nbsp;5.

<style>
.doc.b-table {
	table-layout: fixed;
}
</style>

| CKEditor&nbsp;4 | CKEditor&nbsp;5 |
|---|---|
| [a11yhelp](https://ckeditor.com/cke4/addon/a11yhelp) | CKEditor&nbsp;5 provides an [accessibility help dialog](https://ckeditor.com/docs/ckeditor5/latest/features/accessibility.html#displaying-keyboard-shortcuts-in-the-editor) that lists the available keyboard shortcuts. Users open it with <kbd>Alt</kbd>+<kbd>0</kbd>. |
| [about](https://ckeditor.com/cke4/addon/about) | N/A |
| [ajax](https://ckeditor.com/cke4/addon/ajax) | N/A |
| [autocomplete](https://ckeditor.com/cke4/addon/autocomplete) | Partially covered by [Mentions](https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html) |
| [autoembed](https://ckeditor.com/cke4/addon/autoembed) | [Auto media embed](https://ckeditor.com/docs/ckeditor5/latest/features/media-embed/media-embed.html#automatic-media-embed-on-paste) |
| [autogrow](https://ckeditor.com/cke4/addon/autogrow) | Core (see [Classic editor](https://ckeditor.com/docs/ckeditor5/latest/examples/builds/classic-editor.html) and [setting its height](https://ckeditor.com/docs/ckeditor5/latest/framework/how-tos.html#how-to-set-the-height-of-ckeditor-5)) |
| [autolink](https://ckeditor.com/cke4/addon/autolink) | [Autolink](https://ckeditor.com/docs/ckeditor5/latest/features/link.html#autolink-feature) |
| [balloonpanel](https://ckeditor.com/cke4/addon/balloonpanel) | [Balloon panel view](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_panel_balloon_balloonpanelview-BalloonPanelView.html) |
| [balloontoolbar](https://ckeditor.com/cke4/addon/balloontoolbar) | [Contextual balloon](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_panel_balloon_contextualballoon-ContextualBalloon.html) |
| [basicstyles](https://ckeditor.com/cke4/addon/basicstyles) | [Basic styles](https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html) |
| [bbcode](https://ckeditor.com/cke4/addon/bbcode) | N/A |
| [bidi](https://ckeditor.com/cke4/addon/bidi) | Partially available [via configuration](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/ui-language.html#righttoleft-rtl-languages-support) and the [Language plugin](https://ckeditor.com/docs/ckeditor5/latest/features/language.html) |
| [blockquote](https://ckeditor.com/cke4/addon/blockquote) | [Block quote](https://ckeditor.com/docs/ckeditor5/latest/features/block-quote.html) |
| [button](https://ckeditor.com/cke4/addon/button) | [Button view](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_button_buttonview-ButtonView.html) |
| [ckfinder](https://ckeditor.com/cke4/addon/ckfinder) | [CKFinder](https://ckeditor.com/docs/ckeditor5/latest/features/file-management/ckfinder.html) |
| [clipboard](https://ckeditor.com/cke4/addon/clipboard) | [Clipboard](https://ckeditor.com/docs/ckeditor5/latest/api/module_clipboard_clipboard-Clipboard.html) |
| [cloudservices](https://ckeditor.com/cke4/addon/cloudservices) | [Cloud Services](https://ckeditor.com/docs/ckeditor5/latest/api/module_cloud-services_cloudservices-CloudServices.html) |
| [codesnippet](https://ckeditor.com/cke4/addon/codesnippet) | Partially covered by [Code blocks](https://ckeditor.com/docs/ckeditor5/latest/features/code-blocks.html) |
| [codesnippetgeshi](https://ckeditor.com/cke4/addon/codesnippetgeshi) | The [Code blocks](https://ckeditor.com/docs/ckeditor5/latest/features/code-blocks.html) feature handles blocks of code in CKEditor&nbsp;5. Syntax highlighting runs in the browser, so no server-side highlighter is involved. |
| [colorbutton](https://ckeditor.com/cke4/addon/colorbutton) | [Font color and Font background color](https://ckeditor.com/docs/ckeditor5/latest/features/font.html#configuring-the-font-color-and-font-background-color-features) |
| [colordialog](https://ckeditor.com/cke4/addon/colordialog) | The [font color and font background color](https://ckeditor.com/docs/ckeditor5/latest/features/font.html#configuring-the-font-color-and-font-background-color-features) features include a color picker. Set the <code>colorPicker</code> option to <code>false</code> to offer the predefined palette only. |
| [contextmenu](https://ckeditor.com/cke4/addon/contextmenu) | CKEditor&nbsp;5 does not come with a context menu. Contextual inline toolbars are used instead, offering the actions relevant to the selected element, as for [tables](https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables.html#table-contextual-toolbar) or [images](https://ckeditor.com/docs/ckeditor5/latest/features/images/images-overview.html#image-contextual-toolbar). |
| [copyformatting](https://ckeditor.com/cke4/addon/copyformatting) | [Format painter](https://ckeditor.com/docs/ckeditor5/latest/features/format-painter.html) |
| [devtools](https://ckeditor.com/cke4/addon/devtools) | Use the [CKEditor&nbsp;5 inspector](https://ckeditor.com/docs/ckeditor5/latest/framework/development-tools/inspector.html) instead. It shows the editor model, view, selection, commands, and schema while you work. |
| [dialog](https://ckeditor.com/cke4/addon/dialog) | CKEditor&nbsp;5 has its own dialog system, which features use to display forms and other content. Refer to the [<code>Dialog</code>](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_dialog_dialog-Dialog.html) plugin documentation. |
| [dialogadvtab](https://ckeditor.com/cke4/addon/dialogadvtab) | N/A |
| [dialogui](https://ckeditor.com/cke4/addon/dialogui) | N/A |
| [div](https://ckeditor.com/cke4/addon/div) | Partially covered by [General HTML Support](https://ckeditor.com/docs/ckeditor5/latest/features/html/general-html-support.html) |
| [divarea](https://ckeditor.com/cke4/addon/divarea) | Core ([Classic editor](https://ckeditor.com/docs/ckeditor5/latest/examples/builds/classic-editor.html)) |
| [docprops](https://ckeditor.com/cke4/addon/docprops) | The [Full page HTML](https://ckeditor.com/docs/ckeditor5/latest/features/html/full-page-html.html) feature lets you edit the whole document, including the <code>&lt;head&gt;</code> section, the doctype, and metadata such as the page title. |
| [easyimage](https://ckeditor.com/cke4/addon/easyimage) | Easy Image, described in the [Image upload](https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html) guide. |
| [editorplaceholder](https://ckeditor.com/cke4/addon/editorplaceholder) | [Editor placeholder](https://ckeditor.com/docs/ckeditor5/latest/features/editor-placeholder.html) |
| [elementspath](https://ckeditor.com/cke4/addon/elementspath) | N/A |
| [embed](https://ckeditor.com/cke4/addon/embed) | [Media embed](https://ckeditor.com/docs/ckeditor5/latest/features/media-embed/media-embed.html) |
| [embedbase](https://ckeditor.com/cke4/addon/embedbase) | [Media embed](https://ckeditor.com/docs/ckeditor5/latest/api/module_media-embed_mediaembedconfig-MediaEmbedConfig.html) provider configuration |
| [embedsemantic](https://ckeditor.com/cke4/addon/embedsemantic) | [Media embed](https://ckeditor.com/docs/ckeditor5/latest/api/module_media-embed_mediaembedconfig-MediaEmbedConfig.html) semantic output configuration |
| [emoji](https://ckeditor.com/cke4/addon/emoji) | [Emoji](https://ckeditor.com/docs/ckeditor5/latest/features/emoji.html) |
| [enterkey](https://ckeditor.com/cke4/addon/enterkey) | [Enter](https://ckeditor.com/docs/ckeditor5/latest/api/module_enter_enter-Enter.html) (except for the <code>ENTER_DIV</code> option) |
| [entities](https://ckeditor.com/cke4/addon/entities) | N/A |
| [fakeobjects](https://ckeditor.com/cke4/addon/fakeobjects) | [Custom widgets](https://ckeditor.com/docs/ckeditor5/latest/framework/tutorials/widgets/implementing-a-block-widget.html) |
| [filebrowser](https://ckeditor.com/cke4/addon/filebrowser) | See [image upload](https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html) |
| [filetools](https://ckeditor.com/cke4/addon/filetools) | See [image upload](https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html) |
| [find](https://ckeditor.com/cke4/addon/find) | [Find and replace](https://ckeditor.com/docs/ckeditor5/latest/features/find-and-replace.html) |
| [flash](https://ckeditor.com/cke4/addon/flash) | N/A. Flash is obsolete. To embed video and audio, use the [Media embed](https://ckeditor.com/docs/ckeditor5/latest/features/media-embed/media-embed.html) feature. |
| [floatingspace](https://ckeditor.com/cke4/addon/floatingspace) | [Inline editor](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/editor-types.html#inline-editor) |
| [floatpanel](https://ckeditor.com/cke4/addon/floatpanel) | Partially covered by the [createDropdown()](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_dropdown_utils.html#function-createDropdown) utility |
| [font](https://ckeditor.com/cke4/addon/font) | [Font size and Font family](https://ckeditor.com/docs/ckeditor5/latest/features/font.html) |
| [format](https://ckeditor.com/cke4/addon/format) | Partially covered by the [Heading](https://ckeditor.com/docs/ckeditor5/latest/features/headings.html) and [Paragraph](https://ckeditor.com/docs/ckeditor5/latest/api/paragraph.html) features |
| [forms](https://ckeditor.com/cke4/addon/forms) | N/A. CKEditor&nbsp;5 has no feature for form controls. To keep such markup in legacy content, allow the elements with the [General HTML Support](https://ckeditor.com/docs/ckeditor5/latest/features/html/general-html-support.html) feature. |
| [horizontalrule](https://ckeditor.com/cke4/addon/horizontalrule) | [Horizontal line](https://ckeditor.com/docs/ckeditor5/latest/features/horizontal-line.html) |
| [htmlwriter](https://ckeditor.com/cke4/addon/htmlwriter) | A custom HTML writer can be implemented using the [HtmlWriter](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_dataprocessor_htmlwriter-DataProcessorHtmlWriter.html) interface |
| [iframe](https://ckeditor.com/cke4/addon/iframe) | [HTML embed](https://ckeditor.com/docs/ckeditor5/latest/features/html/html-embed.html) |
| [iframedialog](https://ckeditor.com/cke4/addon/iframedialog) | N/A |
| [image](https://ckeditor.com/cke4/addon/image) | [Image](https://ckeditor.com/docs/ckeditor5/latest/features/images/images-overview.html) |
| [image2](https://ckeditor.com/cke4/addon/image2) | [Image](https://ckeditor.com/docs/ckeditor5/latest/features/images/images-overview.html) |
| [imagebase](https://ckeditor.com/cke4/addon/imagebase) | [Image](https://ckeditor.com/docs/ckeditor5/latest/features/images/images-overview.html) |
| [indent](https://ckeditor.com/cke4/addon/indent) | [Indent](https://ckeditor.com/docs/ckeditor5/latest/features/indent.html#indenting-lists) |
| [indentblock](https://ckeditor.com/cke4/addon/indentblock) | Introduced by [IndentBlock](https://ckeditor.com/docs/ckeditor5/latest/api/module_indent_indentblock-IndentBlock.html), exposed by [Indent](https://ckeditor.com/docs/ckeditor5/latest/features/indent.html) |
| [indentlist](https://ckeditor.com/cke4/addon/indentlist) | Introduced by [ListEditing](https://ckeditor.com/docs/ckeditor5/latest/api/module_list_list_listediting-ListEditing.html), exposed by [Indent](https://ckeditor.com/docs/ckeditor5/latest/features/indent.html#indenting-lists) |
| [justify](https://ckeditor.com/cke4/addon/justify) | [Text alignment](https://ckeditor.com/docs/ckeditor5/latest/features/text-alignment.html) |
| [language](https://ckeditor.com/cke4/addon/language) | [Text part language](https://ckeditor.com/docs/ckeditor5/latest/features/language.html) |
| [lineutils](https://ckeditor.com/cke4/addon/lineutils) | Partially covered by [Widget type around](https://ckeditor.com/docs/ckeditor5/latest/api/module_widget_widgettypearound_widgettypearound-WidgetTypeAround.html) |
| [link](https://ckeditor.com/cke4/addon/link) | [Link](https://ckeditor.com/docs/ckeditor5/latest/features/link.html) |
| [list](https://ckeditor.com/cke4/addon/list) | [List](https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists.html) |
| [listblock](https://ckeditor.com/cke4/addon/listblock) | [Dropdowns](https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/ui-library.html#dropdowns) and the [addListToDropdown()](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_dropdown_utils.html#function-addListToDropdown) utility |
| [liststyle](https://ckeditor.com/cke4/addon/liststyle) | [List properties](https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists-properties.html) |
| [magicline](https://ckeditor.com/cke4/addon/magicline) | [Widget type around](https://ckeditor.com/docs/ckeditor5/latest/api/module_widget_widgettypearound_widgettypearound-WidgetTypeAround.html) |
| [mathjax](https://ckeditor.com/cke4/addon/mathjax) | [MathType](https://ckeditor.com/docs/ckeditor5/latest/features/math-equations.html) |
| [maximize](https://ckeditor.com/cke4/addon/maximize) | [Fullscreen mode](https://ckeditor.com/docs/ckeditor5/latest/features/fullscreen.html) |
| [mentions](https://ckeditor.com/cke4/addon/mentions) | [Mentions](https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html) |
| [menu](https://ckeditor.com/cke4/addon/menu) | [Dropdowns](https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/ui-library.html#dropdowns) |
| [menubutton](https://ckeditor.com/cke4/addon/menubutton) | [Dropdowns](https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/ui-library.html#dropdowns) |
| [newpage](https://ckeditor.com/cke4/addon/newpage) | N/A. To clear the content programmatically, call <code>editor.setData( '' )</code>. |
| [notification](https://ckeditor.com/cke4/addon/notification) | [Notification](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_notification_notification-Notification.html) (provides only the engine, without UI) |
| [notificationaggregator](https://ckeditor.com/cke4/addon/notificationaggregator) | N/A |
| [pagebreak](https://ckeditor.com/cke4/addon/pagebreak) | [Page break](https://ckeditor.com/docs/ckeditor5/latest/features/page-break.html) |
| [panel](https://ckeditor.com/cke4/addon/panel) | [UI library](https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/ui-library.html) |
| [panelbutton](https://ckeditor.com/cke4/addon/panelbutton) | [UI library](https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/ui-library.html) |
| [pastefromgdocs](https://ckeditor.com/cke4/addon/pastefromgdocs) | [Paste from Google Docs](https://ckeditor.com/docs/ckeditor5/latest/features/pasting/paste-from-google-docs.html) |
| [pastefromlibreoffice](https://ckeditor.com/cke4/addon/pastefromlibreoffice) | N/A. The [Paste from Office](https://ckeditor.com/docs/ckeditor5/latest/features/pasting/paste-from-office.html) features cover Microsoft Word and Excel. LibreOffice is not supported. |
| [pastefromword](https://ckeditor.com/cke4/addon/pastefromword) | [Paste from Office](https://ckeditor.com/docs/ckeditor5/latest/features/pasting/paste-from-office.html) |
| [pastetext](https://ckeditor.com/cke4/addon/pastetext) | [Paste plain text](https://ckeditor.com/docs/ckeditor5/latest/features/pasting/paste-plain-text.html) |
| [pastetools](https://ckeditor.com/cke4/addon/pastetools) | N/A as a separate utility. Paste handling is built into the editor. |
| [placeholder](https://ckeditor.com/cke4/addon/placeholder) | [Custom implementation](https://ckeditor.com/docs/ckeditor5/latest/framework/tutorials/widgets/implementing-an-inline-widget.html) |
| [popup](https://ckeditor.com/cke4/addon/popup) | N/A |
| [preview](https://ckeditor.com/cke4/addon/preview) | N/A. CKEditor&nbsp;5 does not open a preview window. To share a rendition of the content outside the editor, use [Export to PDF](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html) or [Export to Word](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-word.html). |
| [print](https://ckeditor.com/cke4/addon/print) | N/A. CKEditor&nbsp;5 does not add a print command. To produce a printable rendition of the content, use [Export to PDF](https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html). |
| [removeformat](https://ckeditor.com/cke4/addon/removeformat) | [Remove format](https://ckeditor.com/docs/ckeditor5/latest/features/remove-format.html) |
| [resize](https://ckeditor.com/cke4/addon/resize) | N/A. The editor box cannot be resized by the user. Set the dimensions of the editing area with CSS instead, or declare them in the <code>styles</code> field of the [<code>config.root.element</code>](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editorconfig-RootConfig.html) option. |
| [richcombo](https://ckeditor.com/cke4/addon/richcombo) | [DropdownView](https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_dropdown_dropdownview-DropdownView.html) |
| [save](https://ckeditor.com/cke4/addon/save) | See [Saving data](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/getting-and-setting-data.html) |
| [selectall](https://ckeditor.com/cke4/addon/selectall) | [Select all](https://ckeditor.com/docs/ckeditor5/latest/features/select-all.html) |
| [sharedspace](https://ckeditor.com/cke4/addon/sharedspace) | Custom implementation - see [multi-root editor](https://ckeditor.com/docs/ckeditor5/latest/examples/builds/multi-root-editor.html) |
| [showblocks](https://ckeditor.com/cke4/addon/showblocks) | [Show blocks](https://ckeditor.com/docs/ckeditor5/latest/features/show-blocks.html) |
| [showborders](https://ckeditor.com/cke4/addon/showborders) | [Table properties](https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables-styling.html) |
| [smiley](https://ckeditor.com/cke4/addon/smiley) | [Emoji](https://ckeditor.com/docs/ckeditor5/latest/features/emoji.html) |
| [sourcearea](https://ckeditor.com/cke4/addon/sourcearea) | [Source code editing](https://ckeditor.com/docs/ckeditor5/latest/features/source-editing/source-editing.html) |
| [sourcedialog](https://ckeditor.com/cke4/addon/sourcedialog) | [Enhanced source code editing](https://ckeditor.com/docs/ckeditor5/latest/features/source-editing/source-editing-enhanced.html) |
| [specialchar](https://ckeditor.com/cke4/addon/specialchar) | [Special characters](https://ckeditor.com/docs/ckeditor5/latest/features/special-characters.html) |
| [stylescombo](https://ckeditor.com/cke4/addon/stylescombo) | [Style](https://ckeditor.com/docs/ckeditor5/latest/features/style.html) |
| [stylesheetparser](https://ckeditor.com/cke4/addon/stylesheetparser) | CKEditor&nbsp;5 does not build the list of styles by parsing a style sheet. Declare the available styles explicitly with the [Styles](https://ckeditor.com/docs/ckeditor5/latest/features/style.html) feature instead. |
| [tab](https://ckeditor.com/cke4/addon/tab) | See [Keyboard support](https://ckeditor.com/docs/ckeditor5/latest/features/accessibility.html) |
| [table](https://ckeditor.com/cke4/addon/table) | [Table](https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables.html) |
| [tableresize](https://ckeditor.com/cke4/addon/tableresize) | [Table column resize](https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables-resize.html) |
| [tableselection](https://ckeditor.com/cke4/addon/tableselection) | [Table selection](https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables.html#table-selection) |
| [tabletools](https://ckeditor.com/cke4/addon/tabletools) | [Table properties](https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables-styling.html) |
| [templates](https://ckeditor.com/cke4/addon/templates) | [Template](https://ckeditor.com/docs/ckeditor5/latest/features/template.html) |
| [textmatch](https://ckeditor.com/cke4/addon/textmatch) | The equivalent utility is [<code>TextWatcher</code>](https://ckeditor.com/docs/ckeditor5/latest/api/module_typing_textwatcher-TextWatcher.html), which fires events when the text before the caret matches a given pattern. The [Mentions](https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html) feature uses it for autocompletion. |
| [textwatcher](https://ckeditor.com/cke4/addon/textwatcher) | [Text watcher](https://ckeditor.com/docs/ckeditor5/latest/api/module_typing_textwatcher-TextWatcher.html) |
| [toolbar](https://ckeditor.com/cke4/addon/toolbar) | [Editor toolbar](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/toolbar.html) |
| [uicolor](https://ckeditor.com/cke4/addon/uicolor) | See [Theme customization](https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/ui/theme-customization.html) |
| [undo](https://ckeditor.com/cke4/addon/undo) | [Undo](https://ckeditor.com/docs/ckeditor5/latest/api/module_undo_undo-Undo.html) |
| [uploadfile](https://ckeditor.com/cke4/addon/uploadfile) | See [image upload](https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html) |
| [uploadimage](https://ckeditor.com/cke4/addon/uploadimage) | See [image upload](https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html) |
| [uploadwidget](https://ckeditor.com/cke4/addon/uploadwidget) | See [image upload](https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html) |
| [widget](https://ckeditor.com/cke4/addon/widget) | [Widget](https://ckeditor.com/docs/ckeditor5/latest/api/module_widget_widget-Widget.html) |
| [widgetselection](https://ckeditor.com/cke4/addon/widgetselection) | [Widget](https://ckeditor.com/docs/ckeditor5/latest/api/module_widget_widget-Widget.html) |
| [wysiwygarea](https://ckeditor.com/cke4/addon/wysiwygarea) | Core ([Classic editor](https://ckeditor.com/docs/ckeditor5/latest/examples/builds/classic-editor.html) - there is no iframe-based editor implementation in CKEditor 5) |
| [xml](https://ckeditor.com/cke4/addon/xml) | [XML data processor](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_dataprocessor_xmldataprocessor-XmlDataProcessor.html) |
