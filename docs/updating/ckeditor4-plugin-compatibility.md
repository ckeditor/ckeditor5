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
| [a11yhelp](https://ckeditor.com/cke4/addon/a11yhelp) | CKEditor&nbsp;5 provides an {@link features/accessibility#displaying-keyboard-shortcuts-in-the-editor accessibility help dialog} that lists the available keyboard shortcuts. Users open it with <kbd>Alt</kbd>+<kbd>0</kbd>. |
| [about](https://ckeditor.com/cke4/addon/about) | N/A |
| [ajax](https://ckeditor.com/cke4/addon/ajax) | N/A |
| [autocomplete](https://ckeditor.com/cke4/addon/autocomplete) | Partially covered by {@link features/mentions Mentions} |
| [autoembed](https://ckeditor.com/cke4/addon/autoembed) | {@link features/media-embed#automatic-media-embed-on-paste Auto media embed} |
| [autogrow](https://ckeditor.com/cke4/addon/autogrow) | Core (see {@link examples/builds/classic-editor Classic editor} and {@link framework/how-tos#how-to-set-the-height-of-ckeditor-5 setting its height}) |
| [autolink](https://ckeditor.com/cke4/addon/autolink) | {@link features/link#autolink-feature Autolink} |
| [balloonpanel](https://ckeditor.com/cke4/addon/balloonpanel) | {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView Balloon panel view} |
| [balloontoolbar](https://ckeditor.com/cke4/addon/balloontoolbar) | {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon Contextual balloon} |
| [basicstyles](https://ckeditor.com/cke4/addon/basicstyles) | {@link features/basic-styles Basic styles} |
| [bbcode](https://ckeditor.com/cke4/addon/bbcode) | N/A |
| [bidi](https://ckeditor.com/cke4/addon/bidi) | Partially available {@link getting-started/setup/ui-language#righttoleft-rtl-languages-support via configuration} and the {@link features/language Language plugin} |
| [blockquote](https://ckeditor.com/cke4/addon/blockquote) | {@link features/block-quote Block quote} |
| [button](https://ckeditor.com/cke4/addon/button) | {@link module:ui/button/buttonview~ButtonView Button view} |
| [ckfinder](https://ckeditor.com/cke4/addon/ckfinder) | {@link features/ckfinder CKFinder} |
| [clipboard](https://ckeditor.com/cke4/addon/clipboard) | {@link module:clipboard/clipboard~Clipboard Clipboard} |
| [cloudservices](https://ckeditor.com/cke4/addon/cloudservices) | {@link module:cloud-services/cloudservices~CloudServices Cloud Services} |
| [codesnippet](https://ckeditor.com/cke4/addon/codesnippet) | Partially covered by {@link features/code-blocks Code blocks} |
| [codesnippetgeshi](https://ckeditor.com/cke4/addon/codesnippetgeshi) | The {@link features/code-blocks Code blocks} feature handles blocks of code in CKEditor&nbsp;5. Syntax highlighting runs in the browser, so no server-side highlighter is involved. |
| [colorbutton](https://ckeditor.com/cke4/addon/colorbutton) | {@link features/font#configuring-the-font-color-and-font-background-color-features Font color and Font background color} |
| [colordialog](https://ckeditor.com/cke4/addon/colordialog) | The {@link features/font#configuring-the-font-color-and-font-background-color-features font color and font background color} features include a color picker. Set the <code>colorPicker</code> option to <code>false</code> to offer the predefined palette only. |
| [contextmenu](https://ckeditor.com/cke4/addon/contextmenu) | CKEditor&nbsp;5 does not come with a context menu. Contextual inline toolbars are used instead, offering the actions relevant to the selected element, as for {@link features/tables#table-contextual-toolbar tables} or {@link features/images-overview#image-contextual-toolbar images}. |
| [copyformatting](https://ckeditor.com/cke4/addon/copyformatting) | {@link features/format-painter Format painter} |
| [devtools](https://ckeditor.com/cke4/addon/devtools) | Use the {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} instead. It shows the editor model, view, selection, commands, and schema while you work. |
| [dialog](https://ckeditor.com/cke4/addon/dialog) | CKEditor&nbsp;5 has its own dialog system, which features use to display forms and other content. Refer to the {@link module:ui/dialog/dialog~Dialog <code>Dialog</code>} plugin documentation. |
| [dialogadvtab](https://ckeditor.com/cke4/addon/dialogadvtab) | N/A |
| [dialogui](https://ckeditor.com/cke4/addon/dialogui) | N/A |
| [div](https://ckeditor.com/cke4/addon/div) | Partially covered by {@link features/general-html-support General HTML Support} |
| [divarea](https://ckeditor.com/cke4/addon/divarea) | Core ({@link examples/builds/classic-editor Classic editor}) |
| [docprops](https://ckeditor.com/cke4/addon/docprops) | The {@link features/full-page-html Full page HTML} feature lets you edit the whole document, including the <code>&lt;head&gt;</code> section, the doctype, and metadata such as the page title. |
| [easyimage](https://ckeditor.com/cke4/addon/easyimage) | Easy Image, described in the {@link features/image-upload Image upload} guide. |
| [editorplaceholder](https://ckeditor.com/cke4/addon/editorplaceholder) | {@link features/editor-placeholder Editor placeholder} |
| [elementspath](https://ckeditor.com/cke4/addon/elementspath) | N/A |
| [embed](https://ckeditor.com/cke4/addon/embed) | {@link features/media-embed Media embed} |
| [embedbase](https://ckeditor.com/cke4/addon/embedbase) | {@link module:media-embed/mediaembedconfig~MediaEmbedConfig Media embed} provider configuration |
| [embedsemantic](https://ckeditor.com/cke4/addon/embedsemantic) | {@link module:media-embed/mediaembedconfig~MediaEmbedConfig Media embed} semantic output configuration |
| [emoji](https://ckeditor.com/cke4/addon/emoji) | {@link features/emoji Emoji} |
| [enterkey](https://ckeditor.com/cke4/addon/enterkey) | {@link module:enter/enter~Enter Enter} (except for the <code>ENTER_DIV</code> option) |
| [entities](https://ckeditor.com/cke4/addon/entities) | N/A |
| [fakeobjects](https://ckeditor.com/cke4/addon/fakeobjects) | {@link tutorials/widgets/implementing-a-block-widget Custom widgets} |
| [filebrowser](https://ckeditor.com/cke4/addon/filebrowser) | See {@link features/image-upload image upload} |
| [filetools](https://ckeditor.com/cke4/addon/filetools) | See {@link features/image-upload image upload} |
| [find](https://ckeditor.com/cke4/addon/find) | {@link features/find-and-replace Find and replace} |
| [flash](https://ckeditor.com/cke4/addon/flash) | N/A. Flash is obsolete. To embed video and audio, use the {@link features/media-embed Media embed} feature. |
| [floatingspace](https://ckeditor.com/cke4/addon/floatingspace) | {@link getting-started/setup/editor-types#inline-editor Inline editor} |
| [floatpanel](https://ckeditor.com/cke4/addon/floatpanel) | Partially covered by the {@link module:ui/dropdown/utils~createDropdown createDropdown()} utility |
| [font](https://ckeditor.com/cke4/addon/font) | {@link features/font Font size and Font family} |
| [format](https://ckeditor.com/cke4/addon/format) | Partially covered by the {@link features/headings Heading} and {@link api/paragraph Paragraph} features |
| [forms](https://ckeditor.com/cke4/addon/forms) | N/A. CKEditor&nbsp;5 has no feature for form controls. To keep such markup in legacy content, allow the elements with the {@link features/general-html-support General HTML Support} feature. |
| [horizontalrule](https://ckeditor.com/cke4/addon/horizontalrule) | {@link features/horizontal-line Horizontal line} |
| [htmlwriter](https://ckeditor.com/cke4/addon/htmlwriter) | A custom HTML writer can be implemented using the {@link module:engine/dataprocessor/htmlwriter~DataProcessorHtmlWriter HtmlWriter} interface |
| [iframe](https://ckeditor.com/cke4/addon/iframe) | {@link features/html-embed HTML embed} |
| [iframedialog](https://ckeditor.com/cke4/addon/iframedialog) | N/A |
| [image](https://ckeditor.com/cke4/addon/image) | {@link features/images-overview Image} |
| [image2](https://ckeditor.com/cke4/addon/image2) | {@link features/images-overview Image} |
| [imagebase](https://ckeditor.com/cke4/addon/imagebase) | {@link features/images-overview Image} |
| [indent](https://ckeditor.com/cke4/addon/indent) | {@link features/indent#indenting-lists Indent} |
| [indentblock](https://ckeditor.com/cke4/addon/indentblock) | Introduced by {@link module:indent/indentblock~IndentBlock IndentBlock}, exposed by {@link features/indent Indent} |
| [indentlist](https://ckeditor.com/cke4/addon/indentlist) | Introduced by {@link module:list/list/listediting~ListEditing ListEditing}, exposed by {@link features/indent#indenting-lists Indent} |
| [justify](https://ckeditor.com/cke4/addon/justify) | {@link features/text-alignment Text alignment} |
| [language](https://ckeditor.com/cke4/addon/language) | {@link features/language Text part language} |
| [lineutils](https://ckeditor.com/cke4/addon/lineutils) | Partially covered by {@link module:widget/widgettypearound/widgettypearound~WidgetTypeAround Widget type around} |
| [link](https://ckeditor.com/cke4/addon/link) | {@link features/link Link} |
| [list](https://ckeditor.com/cke4/addon/list) | {@link features/lists List} |
| [listblock](https://ckeditor.com/cke4/addon/listblock) | {@link framework/architecture/ui-library#dropdowns Dropdowns} and the {@link module:ui/dropdown/utils~addListToDropdown addListToDropdown()} utility |
| [liststyle](https://ckeditor.com/cke4/addon/liststyle) | {@link features/lists-properties List properties} |
| [magicline](https://ckeditor.com/cke4/addon/magicline) | {@link module:widget/widgettypearound/widgettypearound~WidgetTypeAround Widget type around} |
| [mathjax](https://ckeditor.com/cke4/addon/mathjax) | {@link features/math-equations MathType} |
| [maximize](https://ckeditor.com/cke4/addon/maximize) | {@link features/fullscreen Fullscreen mode} |
| [mentions](https://ckeditor.com/cke4/addon/mentions) | {@link features/mentions Mentions} |
| [menu](https://ckeditor.com/cke4/addon/menu) | {@link framework/architecture/ui-library#dropdowns Dropdowns} |
| [menubutton](https://ckeditor.com/cke4/addon/menubutton) | {@link framework/architecture/ui-library#dropdowns Dropdowns} |
| [newpage](https://ckeditor.com/cke4/addon/newpage) | N/A. To clear the content programmatically, call <code>editor.setData( '' )</code>. |
| [notification](https://ckeditor.com/cke4/addon/notification) | {@link module:ui/notification/notification~Notification Notification} (provides only the engine, without UI) |
| [notificationaggregator](https://ckeditor.com/cke4/addon/notificationaggregator) | N/A |
| [pagebreak](https://ckeditor.com/cke4/addon/pagebreak) | {@link features/page-break Page break} |
| [panel](https://ckeditor.com/cke4/addon/panel) | {@link framework/architecture/ui-library UI library} |
| [panelbutton](https://ckeditor.com/cke4/addon/panelbutton) | {@link framework/architecture/ui-library UI library} |
| [pastefromgdocs](https://ckeditor.com/cke4/addon/pastefromgdocs) | {@link features/paste-from-google-docs Paste from Google Docs} |
| [pastefromlibreoffice](https://ckeditor.com/cke4/addon/pastefromlibreoffice) | N/A. The {@link features/paste-from-office Paste from Office} features cover Microsoft Word and Excel. LibreOffice is not supported. |
| [pastefromword](https://ckeditor.com/cke4/addon/pastefromword) | {@link features/paste-from-office Paste from Office} |
| [pastetext](https://ckeditor.com/cke4/addon/pastetext) | {@link features/paste-plain-text Paste plain text} |
| [pastetools](https://ckeditor.com/cke4/addon/pastetools) | N/A as a separate utility. Paste handling is built into the editor. |
| [placeholder](https://ckeditor.com/cke4/addon/placeholder) | {@link tutorials/widgets/implementing-an-inline-widget Custom implementation} |
| [popup](https://ckeditor.com/cke4/addon/popup) | N/A |
| [preview](https://ckeditor.com/cke4/addon/preview) | N/A. CKEditor&nbsp;5 does not open a preview window. To share a rendition of the content outside the editor, use {@link features/export-pdf Export to PDF} or {@link features/export-word Export to Word}. |
| [print](https://ckeditor.com/cke4/addon/print) | N/A. CKEditor&nbsp;5 does not add a print command. To produce a printable rendition of the content, use {@link features/export-pdf Export to PDF}. |
| [removeformat](https://ckeditor.com/cke4/addon/removeformat) | {@link features/remove-format Remove format} |
| [resize](https://ckeditor.com/cke4/addon/resize) | N/A. The editor box cannot be resized by the user. Set the dimensions of the editing area with CSS instead, or declare them in the <code>styles</code> field of the {@link module:core/editor/editorconfig~RootConfig <code>config.root.element</code>} option. |
| [richcombo](https://ckeditor.com/cke4/addon/richcombo) | {@link module:ui/dropdown/dropdownview~DropdownView DropdownView} |
| [save](https://ckeditor.com/cke4/addon/save) | See {@link getting-started/setup/getting-and-setting-data Saving data} |
| [selectall](https://ckeditor.com/cke4/addon/selectall) | {@link features/select-all Select all} |
| [sharedspace](https://ckeditor.com/cke4/addon/sharedspace) | Custom implementation - see {@link examples/builds/multi-root-editor multi-root editor} |
| [showblocks](https://ckeditor.com/cke4/addon/showblocks) | {@link features/show-blocks Show blocks} |
| [showborders](https://ckeditor.com/cke4/addon/showborders) | {@link features/tables-styling Table properties} |
| [smiley](https://ckeditor.com/cke4/addon/smiley) | {@link features/emoji Emoji} |
| [sourcearea](https://ckeditor.com/cke4/addon/sourcearea) | {@link features/source-editing Source code editing} |
| [sourcedialog](https://ckeditor.com/cke4/addon/sourcedialog) | {@link features/source-editing-enhanced Enhanced source code editing} |
| [specialchar](https://ckeditor.com/cke4/addon/specialchar) | {@link features/special-characters Special characters} |
| [stylescombo](https://ckeditor.com/cke4/addon/stylescombo) | {@link features/style Style} |
| [stylesheetparser](https://ckeditor.com/cke4/addon/stylesheetparser) | CKEditor&nbsp;5 does not build the list of styles by parsing a style sheet. Declare the available styles explicitly with the {@link features/style Styles} feature instead. |
| [tab](https://ckeditor.com/cke4/addon/tab) | See {@link features/accessibility Keyboard support} |
| [table](https://ckeditor.com/cke4/addon/table) | {@link features/tables Table} |
| [tableresize](https://ckeditor.com/cke4/addon/tableresize) | {@link features/tables-resize Table column resize} |
| [tableselection](https://ckeditor.com/cke4/addon/tableselection) | {@link features/tables#table-selection Table selection} |
| [tabletools](https://ckeditor.com/cke4/addon/tabletools) | {@link features/tables-styling Table properties} |
| [templates](https://ckeditor.com/cke4/addon/templates) | {@link features/template Template} |
| [textmatch](https://ckeditor.com/cke4/addon/textmatch) | The equivalent utility is {@link module:typing/textwatcher~TextWatcher <code>TextWatcher</code>}, which fires events when the text before the caret matches a given pattern. The {@link features/mentions Mentions} feature uses it for autocompletion. |
| [textwatcher](https://ckeditor.com/cke4/addon/textwatcher) | {@link module:typing/textwatcher~TextWatcher Text watcher} |
| [toolbar](https://ckeditor.com/cke4/addon/toolbar) | {@link getting-started/setup/toolbar Editor toolbar} |
| [uicolor](https://ckeditor.com/cke4/addon/uicolor) | See {@link framework/theme-customization Theme customization} |
| [undo](https://ckeditor.com/cke4/addon/undo) | {@link module:undo/undo~Undo Undo} |
| [uploadfile](https://ckeditor.com/cke4/addon/uploadfile) | See {@link features/image-upload image upload} |
| [uploadimage](https://ckeditor.com/cke4/addon/uploadimage) | See {@link features/image-upload image upload} |
| [uploadwidget](https://ckeditor.com/cke4/addon/uploadwidget) | See {@link features/image-upload image upload} |
| [widget](https://ckeditor.com/cke4/addon/widget) | {@link module:widget/widget~Widget Widget} |
| [widgetselection](https://ckeditor.com/cke4/addon/widgetselection) | {@link module:widget/widget~Widget Widget} |
| [wysiwygarea](https://ckeditor.com/cke4/addon/wysiwygarea) | Core ({@link examples/builds/classic-editor Classic editor} - there is no iframe-based editor implementation in CKEditor 5) |
| [xml](https://ckeditor.com/cke4/addon/xml) | {@link module:engine/dataprocessor/xmldataprocessor~XmlDataProcessor XML data processor} |
