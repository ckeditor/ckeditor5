---
category: features
menu-title: Feature digest
meta-title: Feature digest | CKEditor 5 Documentation
classes: main__content--no-toc
toc: false
modified_at: 2024-10-17
order: -997
---

## Core editing

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr id="advanced-html-editing">
			<td>
				<a href="#">Advanced HTML Editing</a>
			</td>
			<td>
				Advanced HTML Editing provides general HTML support, offering detailed
				control over permissible HTML elements, attributes, and styles. It
				further allows HTML Source Code Editing, handling any HTML elements,
				HTML comments, and editing of the full page content, including meta
				tags.
			</td>
		</tr>
		<tr id="full-page-html">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/html/full-page-html.html">Full page
					HTML</a>
			</td>
			<td>
				Thanks to the full page HTML feature you can use CKEditor 5 to edit
				entire HTML pages (from <code>&lt;html&gt;</code> to
				<code>&lt;/html&gt;</code>), including the page metadata. While the
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/html/general-html-support.html">General
					HTML Support</a>
				feature focuses on elements inside the content (the document’s
				<code>&lt;body&gt;</code>), this feature enables markup mostly invisible
				to the end user.
			</td>
		</tr>
		<tr id="general-html-support">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/html/general-html-support.html">General
					HTML Support (GHS)</a>
			</td>
			<td>
				With the General HTML Support (GHS) feature, developers can enable HTML
				features that are not supported by any other dedicated CKEditor 5
				plugins. GHS lets you add elements, attributes, classes, and styles to
				the source. It also ensures this markup stays in the editor window and
				in the output.
			</td>
		</tr>
		<tr id="html-comment">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/html/html-comments.html">HTML comment</a>
			</td>
			<td>
				By default, the editor filters out all HTML comments on initialization.
				The
				<code><a
				  href="https://ckeditor.com/docs/ckeditor5/latest/api/module_html-support_htmlcomment-HtmlComment.html"
				  >HtmlComment</a
				></code>
				feature lets developers keep HTML comments in the document without
				displaying them to the user.
			</td>
		</tr>
		<tr id="html-embed">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/html/html-embed.html">HTML embed</a>
			</td>
			<td>
				The HTML embed feature lets you embed any HTML snippet in your content.
				The feature is meant for more advanced users who want to directly
				interact with HTML fragments.
			</td>
		</tr>
		<tr id="show-blocks">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/show-blocks.html">Show blocks</a>
			</td>
			<td>
				The show blocks feature allows the content creators to visualize all
				block-level elements (except for widgets). It surrounds them with an
				outline and displays their element name in the top-left corner of the
				box.
			</td>
		</tr>
		<tr id="source-editing">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/source-editing.html">Source editing</a>
			</td>
			<td>
				he source editing feature lets you view and edit the source of your
				document.
			</td>
		</tr>
		<tr id="block-formatting">
			<td>
				<a href="#">Block formatting</a>
			</td>
			<td>
				Block Formatting allows for the organization and emphasis of content
				through the use of Headings, Style Headings, Block Quotes, and
				Horizontal Lines. Users can select from different levels of headings to
				outline sections and subsections, apply various styles to these headings
				for visual hierarchy, insert horizontal lines to delineate sections, and
				use block quotes to highlight excerpts or important passages.
			</td>
		</tr>
		<tr id="block-quotes">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/block-quote.html">Block quotes</a>
			</td>
			<td>
				The block quote feature lets you easily include block quotations or pull
				quotes in your content. It is also an attractive way to draw the
				readers’ attention to selected parts of the text.
			</td>
		</tr>
		<tr id="headings-paragraph">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/headings.html">Headings/paragraph</a>
			</td>
			<td>
				The heading feature helps you structure your document by adding headings
				to parts of the text. They make your content easier to scan by both
				readers and search engines.
			</td>
		</tr>
		<tr id="horizontal-line">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/horizontal-line.html">Horizontal line</a>
			</td>
			<td>
				The horizontal line feature lets you visually divide your content into
				sections by inserting horizontal lines (also known as horizontal rules).
				It is an easy way to organize the content or indicate a change of topic.
			</td>
		</tr>
		<tr id="block-indentation">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/indent.html">Block indentation</a>
			</td>
			<td>
				The block indentation feature lets you set indentation for text blocks
				such as paragraphs, headings, or lists. This way you can visually
				distinguish parts of your content.
			</td>
		</tr>
		<tr id="clipboard">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/clipboard.html">Clipboard</a>
			</td>
			<td>
				Copy, cut, and paste content within the editor or from external sources.
			</td>
		</tr>
		<tr id="code-blocks">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/code-blocks.html">Code blocks</a>
			</td>
			<td>
				Supports the insertion and management of preformatted code snippets with
				distinct styling.
			</td>
		</tr>
		<tr id="drag-and-drop">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/drag-drop.html">Drag and drop</a>
			</td>
			<td>
				Rearrange elements within a document, including moving text blocks,
				images, or other content types.
			</td>
		</tr>
		<tr id="font-formatting">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/font.html">Font formatting</a>
			</td>
			<td>
				The font feature lets you change font family, size, and color (including
				background color). All of these options are configurable.
			</td>
		</tr>
		<tr id="font-background-color">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/font.html">Font background color</a>
			</td>
			<td>
				Effortless make the words stand out even more with a colored background.
			</td>
		</tr>
		<tr id="font-color">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/font.html">Font color</a>
			</td>
			<td>Effortlessly make the letters stand out with their own color.</td>
		</tr>
		<tr id="font-family">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/font.html">Font family</a>
			</td>
			<td>
				Choose from a predefined set of fonts, depending on the type of content
				and its destination - print, screen, etc.
			</td>
		</tr>
		<tr id="font-size">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/font.html">Font size</a>
			</td>
			<td>Easily control the size of the letters.</td>
		</tr>
		<tr id="image">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-overview.html">Image</a>
			</td>
			<td>
				The image feature allows adding images of various kinds to the rich
				content inside the editor. A large set of subfeatures lets the users
				fully control this process.<br /><br />Upload or paste images, insert
				via URL, use responsive images, resize images, add captions, set
				different image styles, link images<br />
			</td>
		</tr>
		<tr id="image-all-text">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-text-alternative.html">Image
					alt text</a>
			</td>
			<td>
				Add description text, AKA alternative text, for images. Alt text
				improves accessibility by telling screen readers and search engines what
				the image depicts.
			</td>
		</tr>
		<tr id="image-captions">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-captions.html">Image
					captions</a>
			</td>
			<td>
				Add optional captions for images, which are shown below the picture.
			</td>
		</tr>
		<tr id="image-insert-via-url">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-inserting.html">Image insert
					via URL</a>
			</td>
			<td>
				You can insert images by uploading them directly from your disk, but you
				can also configure CKEditor 5 to let you insert images using URLs. This
				way you can save time by adding images that are already online.
			</td>
		</tr>
		<tr id="image-linking">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-linking.html">Image
					linking</a>
			</td>
			<td>
				The
				<code><a
				  href="https://ckeditor.com/docs/ckeditor5/latest/api/module_link_linkimage-LinkImage.html"
				  >LinkImage</a
				></code>
				plugin lets you use images as links.
			</td>
		</tr>
		<tr id="image-resize">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-resizing.html">Image
					resize</a>
			</td>
			<td>
				The image resize feature lets you change the width of images in your
				content. It is implemented by the
				<code><a
				  href="https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imageresize-ImageResize.html"
				  >ImageResize</a
				></code>
				plugin.
			</td>
		</tr>
		<tr id="image-styles">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-styles.html">Image styles</a>
			</td>
			<td>
				The image styles feature lets you adjust the appearance of images. It
				works by applying CSS classes to images or changing their type from
				inline to block or vice versa.
			</td>
		</tr>
		<tr id="image-upload">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html">Image
					upload</a>
			</td>
			<td>
				Inserting
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-overview.html">images</a>
				into content created with CKEditor 5 is quite a common task. In a
				properly configured rich-text editor, there are several ways for the end
				user to insert images.
			</td>
		</tr>
		<tr id="responsive-images">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-responsive.html">Responsive
					images</a>
			</td>
			<td>
				The ability to have responsive images in the rich-text editor content is
				a great modern feature provided by the
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/file-management/ckbox.html">CKBox asset
					manager</a>. With a single image upload, several optimized versions of that image
				are created, each for a different size of the display. The CKBox feature
				produces a <code>&lt;picture&gt;</code> element with a set of optimized
				images. The browser will automatically load the image with the
				dimensions most suitable for the presented page resolution, which makes
				the image load much faster and saves bandwidth.
			</td>
		</tr>
		<tr id="links">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/link.html">Links</a>
			</td>
			<td>
				Facilitates the addition of hyperlinks to text, automatically converting
				typed or pasted URLs into clickable links, and allowing manual insertion
				and editing of links.
			</td>
		</tr>
		<tr id="lists">
			<td>
				<a href="#">Lists</a>
			</td>
			<td>
				Lists allow the creation and management of various list types, including
				to-do lists, bulleted and numbered lists, with additional customization
				options such as list styles, setting the start number for lists,
				creating reversed lists, adjusting list indentation, and crafting nested
				lists.
			</td>
		</tr>
		<tr id="list-indentation">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists-editing.html#indenting-lists">List
					indentation</a>
			</td>
			<td>
				Besides controlling
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/indent.html">text block indentation</a>,
				the indent and outdent buttons allow for indenting list items
				(nesting them).
			</td>
		</tr>
		<tr id="list-start-index">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists.html#list-start-index">List
					start index</a>
			</td>
			<td>
				The list start index feature allows the user to choose the starting
				point of an ordered list. By default, this would be 1 (or A, or I – see
				the list styles section). Sometimes you may want to start a list with
				some other digit or letter, though.
			</td>
		</tr>
		<tr id="list-styles">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists.html#list-styles">List
					styles</a>
			</td>
			<td>
				The list style feature introduces some more styles for the list item
				markers. When
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/api/module_list_listconfig-ListPropertiesConfig.html#member-styles">enabled</a>,
				it adds 3 styles for unordered lists and 6 styles for ordered lists
				to choose from. The user will be able to set or change the list style
				via the dropdown. It opens when you click the arrow next to the
				appropriate list button in the toolbar.
			</td>
		</tr>
		<tr id="multi-level-lists">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/lists/multi-level-lists.html">Multi-level
					lists<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				Multi-level lists with the legal style numbering feature allows for easy
				creation and modification of numbered lists with counters (1, 1.1,
				1.1.1). These are crucial for clear referencing and hierarchical
				organization in complex documents. The feature offers full compatibility
				with Microsoft Word.
			</td>
		</tr>
		<tr id="nested-lists">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists-editing.html#indenting-lists">Nested
					lists</a>
			</td>
			<td>
				Besides controlling
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/indent.html">text block indentation</a>,
				the indent and outdent buttons allow for indenting list items
				(nesting them).
			</td>
		</tr>
		<tr id="ordered-lists">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists.html">Ordered lists</a>
			</td>
			<td>
				The list feature lets you create ordered (numbered) lists. The unique
				thing about them is that you can put any content inside each list item
				(including block elements like paragraphs and tables), retaining the
				continuity of numbering and indentation. You can also easily control the
				list markers type.
			</td>
		</tr>
		<tr id="reversed-list">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists.html#reversed-list">Reversed
					list</a>
			</td>
			<td>
				The reversed list feature lets the user reverse the numbering order of a
				list, changing it from ascending to descending. This is useful in
				countdowns and things-to-do lists that need to reproduce steps in a
				reversed order (for example, in disassembly instructions).
			</td>
		</tr>
		<tr id="to-do-lists">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/lists/todo-lists.html">To-do lists</a>
			</td>
			<td>
				The to-do list feature lets you create a list of interactive checkboxes
				with labels. It supports all features of
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists.html">bulleted and numbered
					lists</a>, so you can nest a to-do list together with any combination of other
				lists.
			</td>
		</tr>
		<tr id="unordered-lists">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/lists/lists.html">Unordered lists</a>
			</td>
			<td>
				The list feature lets you create unordered (bulleted) lists. The unique
				thing about them is that you can put any content inside each list item
				(including block elements like paragraphs and tables), retaining the
				continuity of numbering and indentation. You can also easily control the
				list markers’ shape.
			</td>
		</tr>
		<tr id="mermaid">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/mermaid.html">Mermaid<span
						class="tree__item__badge tree__item__badge_new"
						data-badge-tooltip="New or updated content">Experimental</span></a>
			</td>
			<td>
				You can create flowcharts and diagrams in CKEditor 5 thanks to the
				experimental integration with the Mermaid library. Mermaid uses a
				Markdown-inspired syntax to create and dynamically modify flowcharts,
				Gantt diagrams, pie or quadrant charts, graphs, mindmaps, and more.
			</td>
		</tr>
		<tr id="remove-formatting">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/remove-format.html">Remove formatting</a>
			</td>
			<td>
				The remove format feature lets you quickly remove any text formatting
				applied using inline HTML elements and CSS styles, like basic text
				styles (bold, italic) or font family, size, and color. This feature does
				not remove block-level formatting (headings, images) or semantic data
				(links).
			</td>
		</tr>
		<tr id="select-all">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/select-all.html">Select all</a>
			</td>
			<td>
				Enables the selection of all content within the editor with a single
				command or shortcut.
			</td>
		</tr>
		<tr id="tables">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables.html">Tables</a>
			</td>
			<td>
				CKEditor 5 provides robust support for tables, with the ability to merge
				and split cells, resize columns, style tables and individual cells,
				insert and delete columns and rows, as well as create nested tables for
				complex data presentation.
			</td>
		</tr>
		<tr id="columns-resizing">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables-resize.html">Columns
					resizing</a>
			</td>
			<td>
				The
				<code><a
				  href="https://ckeditor.com/docs/ckeditor5/latest/api/module_table_tablecolumnresize-TableColumnResize.html"
				  >TableColumnResize</a
				></code>
				plugin lets you resize tables and individual table columns. It gives you
				complete control over column width.
			</td>
		</tr>
		<tr id="insert-delete-columns-and-rows">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables.html#table-contextual-toolbar">Insert/delete
					Columns &amp; Rows</a>
			</td>
			<td>
				The basic table features allow users to insert tables into content, add
				or remove columns and rows and merge or split cells.
			</td>
		</tr>
		<tr id="merge-and-split-cells">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables.html#table-contextual-toolbar">Merge
					&amp; split cells</a>
			</td>
			<td>
				The basic table features allow users to insert tables into content, add
				or remove columns and rows and merge or split cells.
			</td>
		</tr>
		<tr id="nesting">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables.html#nesting-tables">Nesting</a>
			</td>
			<td>
				CKEditor 5 allows nesting tables inside other table’s cells. This may be
				used for creating advanced charts or layouts based on tables. The nested
				table can be formatted just like a regular one.
			</td>
		</tr>
		<tr id="styling-tables-and-cells">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables-styling.html">Styling tables
					&amp; cells</a>
			</td>
			<td>
				CKEditor 5 comes with some additional tools that help you change the
				look of tables and table cells. You can control border color and style,
				background color, padding, or text alignment.
			</td>
		</tr>
		<tr id="table-headers">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables.html#default-table-headers">Table
					headers</a>
			</td>
			<td>
				To make every inserted table have <code>n</code> number of rows and
				columns as table headers by default, set an optional table configuration
				property <code>defaultHeadings</code> .
			</td>
		</tr>
		<tr id="table-selection">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables.html#table-selection">Table
					selection</a>
			</td>
			<td>
				The
				<code><a
				  href="https://ckeditor.com/docs/ckeditor5/latest/api/module_table_tableselection-TableSelection.html"
				  >TableSelection</a
				></code>
				plugin introduces support for the custom selection system for tables
				that lets you:<br />• Select an arbitrary rectangular table fragment – a
				few cells from different rows, a column (or a few of them) or a row (or
				multiple rows).<br />• Apply formatting or add a link to all selected
				cells at once.<br />The table selection plugin is loaded automatically
				by the <br /><code>Table</code> plugin.
			</td>
		</tr>
		<tr id="tables-caption">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables-caption.html">Tables
					caption</a>
			</td>
			<td>
				The
				<code><a
				  href="https://ckeditor.com/docs/ckeditor5/latest/api/module_table_tablecaption-TableCaption.html"
				  >TableCaption</a
				></code>
				plugin lets you add captions to your tables. Table captions also improve
				accessibility as they are recognized by screen readers.
			</td>
		</tr>
		<tr id="text-alignment">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/text-alignment.html">Text alignment</a>
			</td>
			<td>
				Allows the adjustment of text alignment to the left, right, center, or
				justify and permits the alteration of indentation.
			</td>
		</tr>
		<tr id="text-formatting">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/basic-styles.html">Text formatting</a>
			</td>
			<td>
				CKEditor 5 provides developers with text editing and formatting features
				such as Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
				Inline Code, Highlight, and Font Styles. These features allow users to
				style and present their content as needed. This ensures users can style
				their text to improve readability, match branding guidelines, or
				highlight important content sections.
			</td>
		</tr>
		<tr id="bold">
			<td>
				<a href="#">Bold</a>
			</td>
			<td>Making the letters look like the good time were never gone.</td>
		</tr>
		<tr id="code">
			<td>
				<a href="#">Code</a>
			</td>
			<td>Snippet look, like a terminal from the 1990s movie.</td>
		</tr>
		<tr id="highlight">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/highlight.html">Highlight</a>
			</td>
			<td>
				Highlight makes important content stand out, either with font color or
				background fill.
			</td>
		</tr>
		<tr id="italic">
			<td>
				<a href="#">Italic</a>
			</td>
			<td>Making the letters look like seashore pines.</td>
		</tr>
		<tr id="strikethrough">
			<td>
				<a href="#">Strikethrough</a>
			</td>
			<td>Never mind, won’t need it anymore.</td>
		</tr>
		<tr id="styles">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/style.html">Styles</a>
			</td>
			<td>
				The styles feature lets you easily apply predefines styles available for
				block and inline content.
			</td>
		</tr>
		<tr id="subscript">
			<td>
				<a href="#">Subscript</a>
			</td>
			<td>Fine print at the bottom, like atom numbers.</td>
		</tr>
		<tr id="superscript">
			<td>
				<a href="#">Superscript</a>
			</td>
			<td>Fine print on top, like references in a book.</td>
		</tr>
		<tr id="underline">
			<td>
				<a href="#">Underline</a>
			</td>
			<td>Stuff looks important, yo. Or like a link, too.</td>
		</tr>
		<tr id="undo-redo">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/undo-redo.html">Undo/redo</a>
			</td>
			<td>Backtrack or repeat actions for editing purposes.</td>
		</tr>
	</tbody>
</table>

## Collaboration

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr id="asynchronous-collaboration">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/collaboration.html">Asynchronous
					collaboration<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				Asynchronous Collaboration in CKEditor 5 is designed for teams using a
				turn-based approach to collaboratively write, review, and discuss
				content within the application. It integrates Track Changes, Comments,
				and Revision History features to facilitate collaboration.
			</td>
		</tr>
		<tr id="local-data-storage">
			<td>
				<a href="#">Local data storage<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				In asynchronous collaboration, data is maintained on the client’s
				servers.
			</td>
		</tr>
		<tr id="comments">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/comments/comments.html">Comments<span
						class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature"><span
							class="tree__item__badge__text">Premium feature</span></span></a>
			</td>
			<td>
				Users can add side notes to marked fragments of the document, including
				text and block elements such as images. It also allows the users to
				discuss in threads and remove comments when they finish the discussion.
			</td>
		</tr>
		<tr id="comments-archive">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/comments/comments.html">Comments
					archive<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				Comments threads can be either deleted or resolved. The latter provides
				a way to archive comments that are no longer relevant, reducing clutter
				and making it easier to focus on the most important feedback. Users can
				access the comments archive from the toolbar and use it to view and
				restore archived comments if necessary. It helps to simplify the
				feedback management process.
			</td>
		</tr>
		<tr id="comments-outside-editor">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/comments/comments-outside-editor.html">Comments
					outside editor<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				The comments feature API, together with
				<code><a
				  href="https://ckeditor.com/docs/ckeditor5/latest/api/module_core_context-Context.html"
				  >Context</a
				></code>, lets you create deeper integrations with your application. One such
				integration is enabling comments on non-editor form fields.
			</td>
		</tr>
		<tr id="mentions">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html">Mentions</a>
			</td>
			<td>
				The mention feature supports smart autocompletion triggered by user
				input. Typing a predetermined marker, like @ or #, prompts a panel to
				appear, offering autocomplete suggestions.
			</td>
		</tr>
		<tr id="real-time-collaboration">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/real-time-collaboration/real-time-collaboration.html">Real-time
					collaboration<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				Real-Time Collaboration in CKEditor 5 is designed for users who are
				writing, reviewing, and commenting on content simultaneously. It also
				automatically solves all conflicts if users make changes at the same
				time.
			</td>
		</tr>
		<tr id="co-authoring">
			<td>
				<a href="#">Co-authoring<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>Multiple user real-time editing and content creation feature.</td>
		</tr>
		<tr id="on-premises">
			<td>
				<a href="https://ckeditor.com/docs/cs/latest/onpremises/index.html">On-premises<span
						class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature"><span
							class="tree__item__badge__text">Premium feature</span></span></a>
			</td>
			<td>
				On-premises real-time collaboration version to deploy to client’s own
				infrastructure, includes a private cloud.
			</td>
		</tr>
		<tr id="saas">
			<td>
				<a href="https://ckeditor.com/docs/cs/latest/guides/overview.html">SaaS<span
						class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature"><span
							class="tree__item__badge__text">Premium feature</span></span></a>
			</td>
			<td>Real-time collaboration provided as a service by CKSource.</td>
		</tr>
		<tr id="revision-history">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/revision-history/revision-history.html">Revision
					history<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				The revision history feature is a document versioning tool. It allows
				CKEditor 5 users to create and view the chronological revision history
				of their content. These versions are listed in the side panel. The
				preview mode allows for easy viewing of content development between
				revisions. You can rename, compare, and restore older revisions on the
				go.
			</td>
		</tr>
		<tr id="track-changes">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/track-changes/track-changes.html">Track
					changes<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				The track changes feature brings automatic suggestion marking for the
				document as you change it. When editing the document, the user can
				switch to the track changes mode. All their changes will then create
				suggestions that they can accept or discard.
			</td>
		</tr>
		<tr id="sidebar-modes">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/annotations/annotations-display-mode.html">Sidebar
					modes<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				There are three built-in UIs to display comment threads and suggestion
				annotations: the wide sidebar, the narrow sidebar, and inline balloons.
				You can also display them together in more advanced scenarios where
				various annotation sources (comments, suggestions) are connected to
				different UIs, or even create your own UI for annotations.
			</td>
		</tr>
		<tr id="users-list-and-permissions">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/users.html">Users list and
					permissions<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				The
				<code><a
				  href="https://ckeditor.com/docs/ckeditor5/latest/api/module_collaboration-core_users-Users.html"
				  >Users</a
				></code>
				plugin and related plugins let you manage user data and permissions.
				This is essential when many users are working on the same document.
			</td>
		</tr>
	</tbody>
</table>

## Content conversion & embedding

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr id="content-generation">
			<td>
				<a href="#">Content generation</a>
			</td>
			<td></td>
		</tr>
		<tr id="export-to-pdf">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-pdf.html">Export to
					PDF<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				Create a PDF from in-editor content seamlessly. Customize headers and
				footers, include page breaks, embed images, and choose from various
				fonts.
			</td>
		</tr>
		<tr id="export-to-word">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/converters/export-word.html">Export to
					Word<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				Instantly convert content from the editor to a Word document with a
				single click, maintaining its appearance and formatting. The final
				document includes suggestions, comments, page breaks, and embedded
				images.
			</td>
		</tr>
		<tr id="import-from-word">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/converters/import-word/import-word.html">Import
					from Word<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				Effortlessly transform Word documents into clean HTML within CKEditor 5
				while retaining the original styling, as well as comments and change
				tracking annotations.
			</td>
		</tr>
		<tr id="markdown-output">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/markdown.html">Markdown output</a>
			</td>
			<td>
				nable Markdown as the default output format instead of HTML with the
				Markdown plugin. Combined with Autoformatting, CKEditor becomes an
				efficient Markdown editor, allowing the creation of text documents using
				the simplified formatting syntax favored by developers.
			</td>
		</tr>
		<tr id="media-embed">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/media-embed.html">Media embed</a>
			</td>
			<td>
				Use the insert media button in the toolbar Insert media to embed media.
				Pasting a media URL directly into the editor content automatically
				embeds the media.
			</td>
		</tr>
		<tr id="paste-markdown">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/pasting/paste-markdown.html">Paste
					Markdown<span class="tree__item__badge tree__item__badge_new"
						data-badge-tooltip="New or updated content">Experimental</span></a>
			</td>
			<td>
				The paste Markdown feature lets users paste Markdown-formatted content
				straight into the editor. It will be then converted into rich text on
				the fly.
			</td>
		</tr>
		<tr id="xml-output">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_dataprocessor_xmldataprocessor-XmlDataProcessor.html">XML
					output</a>
			</td>
			<td>
				Turn your content into parsable XML files for automation and
				cross-platform interoperability.
			</td>
		</tr>
	</tbody>
</table>

## Page management

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr id="document-outline">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/document-outline.html">Document
					outline<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				The Document Outline feature automatically detects and lists document
				headings in a sidebar, enabling faster navigation through large
				documents. Headings are organized in a structured list, so users can
				click and jump to different sections quickly.<br />This feature also
				allows for customization of the outline&#x27;s location within the user
				interface, catering to different user preferences for workspace layout.
				<br />
			</td>
		</tr>
		<tr id="page-utilities">
			<td>
				<a href="#">Page utilities</a>
			</td>
			<td>
				CKEditor 5 Page Utilities enables users to dictate the structuring and
				print formatting of their documents effectively.
			</td>
		</tr>
		<tr id="content-minimap">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/minimap.html">Content minimap</a>
			</td>
			<td>
				Offers a concise, birds-eye view of the document&#x27;s content,
				allowing for quick navigation and content management.
			</td>
		</tr>
		<tr id="document-title">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/title.html">Document title</a>
			</td>
			<td>
				llows users to set and modify the document&#x27;s title within the
				editing interface, ensuring accurate reflection of the contents.
			</td>
		</tr>
		<tr id="page-break">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/page-break.html">Page break</a>
			</td>
			<td>
				Facilitates the insertion of manual breaks within the document, enabling
				the definition of page endings and beginnings for optimal layout and
				print clarity.
			</td>
		</tr>
		<tr id="pagination">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/pagination/pagination.html">Pagination<span
						class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature"><span
							class="tree__item__badge__text">Premium feature</span></span></a>
			</td>
			<td>
				The Pagination feature visually indicates where pages begin and end
				within a document. This feature is designed to assist users in preparing
				their documents for printing or for export to various document formats,
				ensuring that the transition between pages is seamless and accurately
				reflected in the final output.<br />Users may adjust content
				distribution across pages as they like, ensuring well-organized
				documents with clearly presented content, whether in digital form or in
				print. By providing a clear view of how text and elements will appear
				page-by-page, Pagination aids in the creation of professional and
				polished documents.<br />
			</td>
		</tr>
		<tr id="table-of-contents">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/table-of-contents.html">Table of
					contents<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				The Table of Contents feature is a dynamic tool for organizing
				documents. It allows for the insertion of a linked table of contents
				that automatically updates in real time as the document’s content
				changes. This means changes made to headings or structured sections
				within the document are reflected immediately in the table of contents,
				accurately representing the document structure.
			</td>
		</tr>
	</tbody>
</table>

## Productivity

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr id="ai-assistant">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/ai-assistant/ai-assistant-overview.html">AI
					Assistant<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				The AI Assistant feature enhances editing efficiency and creativity with
				artificial intelligence capabilities. It allows users to generate new
				content and process data through custom queries or utilize a set of
				predefined commands that are also customizable. The feature supports
				integration with multiple AI API providers: OpenAI, Azure OpenAI, and
				Amazon Bedrock. You can also integrate it with custom models.
			</td>
		</tr>
		<tr id="automation">
			<td>
				<a href="#">Automation</a>
			</td>
			<td></td>
		</tr>
		<tr id="autoformatting">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/autoformat.html">Autoformatting</a>
			</td>
			<td>
				Use <strong>Autoformatting </strong>to get Markdown-like shortcodes for
				quick formatting without needing to navigate through toolbar buttons or
				drop-down menus. This feature caters to the most common formatting needs
				effortlessly.
			</td>
		</tr>
		<tr id="autolink">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/link.html#autolink-feature">Autolink</a>
			</td>
			<td>
				With <strong>Autolink</strong>, typing or pasting URLs and email
				addresses automatically transforms them into clickable links. This
				functionality is enabled by default, ensuring that links are always
				ready to use.
			</td>
		</tr>
		<tr id="automatic-text-transformation">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/text-transformation.html">Automatic text
					transformations</a>
			</td>
			<td>
				The <strong>Automatic Text Transformation </strong>autocorrects or
				transforms predefined text fragments into their designated forms. It
				comes with a range of popular text transformations pre-configured, and
				accepts customization by adding or removing autocorrect entries. It is
				commonly used to automate the expansion of abbreviations or short
				phrases into their full forms.
			</td>
		</tr>
		<tr id="autosave">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/autosave.html">Autosave</a>
			</td>
			<td>
				The <strong>Autosave </strong>feature guarantees that your work is never
				lost. It automatically saves changes - for instance, when content is
				modified. This could involve sending the latest version of the document
				to the server, providing peace of mind through continuous backup.
			</td>
		</tr>
		<tr id="case-change">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/case-change.html">Case change<span
						class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature"><span
							class="tree__item__badge__text">Premium feature</span></span></a>
			</td>
			<td>
				The Case Change feature simplifies adjusting text cases within a
				document. With just a single click, users can shift text between
				UPPERCASE, lowercase, and Title Case options. The case transformation
				can be applied to various text blocks (paragraph, heading, or list item)
				by placing the cursor within the block. Alternatively, users can select
				a specific fragment of text they wish to modify.<br />This feature
				enhances the editing workflow by removing the need for manual case
				adjustments.<br />
			</td>
		</tr>
		<tr id="find-and-replace">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/find-and-replace.html">Find and replace</a>
			</td>
			<td>
				The Find and Replace feature in CKEditor 5&#x27;s Productivity tools
				allows you to search for words or phrases in your document and replace
				them with different text. This function helps speed up editing and
				maintain content consistency.
			</td>
		</tr>
		<tr id="format-painter">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/format-painter.html">Format painter<span
						class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature"><span
							class="tree__item__badge__text">Premium feature</span></span></a>
			</td>
			<td>
				The Format Painter feature lets users clone formatting from one section
				and apply it to others within a document. This tool speeds up
				maintaining style consistency across the document.<br />Once initiated,
				Format Painter can continue to apply the copied formatting to multiple
				sections consecutively. This &quot;continuous painting&quot; ensures a
				uniform style is achieved quickly without the need to repeatedly select
				the formatting options for each new section. <br />
			</td>
		</tr>
		<tr id="keyboard-shortcuts">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/accessibility.html#keyboard-shortcuts">Keyboard
					shortcuts</a>
			</td>
			<td>
				CKEditor 5 supports various keyboard shortcuts that boost productivity
				and provide necessary accessibility to screen reader users.
			</td>
		</tr>
		<tr id="mathtype">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/math-equations.html">MathType<span
						class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature"><span
							class="tree__item__badge__text">Premium feature</span></span></a>
			</td>
			<td>
				Math Equations allows you to add properly formatted mathematical
				notation and chemical formulas to your documents. This feature supports
				the inclusion of math equations, which can be handwritten on a tablet
				and automatically converted into well-formed digital text. It also
				offers simple numbering of equations and the ability to customize with
				various fonts and colors, enhancing readability and presentation in your
				content.
			</td>
		</tr>
		<tr id="merge-fields">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/math-equations.html">Merge fields<span
						class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature"><span
							class="tree__item__badge__text">Premium feature</span></span></a>
			</td>
			<td>
				Merge Fields allows the inclusion of placeholders in your content,
				facilitating the creation of document templates, especially useful for
				email templates and document automation. These placeholders can later be
				replaced with dynamic values by the customer&#x27;s application,
				enabling tasks like mass email distribution or generation of
				personalized documents.
			</td>
		</tr>
		<tr id="paste-from-google-docs">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/pasting/paste-from-google-docs.html">Paste
					from Google Docs</a>
			</td>
			<td>
				Paste from Office features let you paste content from Microsoft Word and
				Microsoft Excel and preserve its original structure and formatting. This
				is the basic, open-source Paste from Office feature.
			</td>
		</tr>
		<tr id="paste-from-office">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/pasting/paste-from-office.html">Paste from
					Office</a>
			</td>
			<td>
				Paste from Office features let you paste content from Microsoft Word and
				Microsoft Excel and preserve its original structure and formatting. This
				is the basic, open-source Paste from Office feature.
			</td>
		</tr>
		<tr id="paste-from-office-enhanced">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/pasting/paste-from-office-enhanced.html">Paste
					from Office Enhanced<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a>
			</td>
			<td>
				The Enhanced Paste from Word/Excel feature accurately retains formatting
				and structure when content is pasted from Microsoft Word documents into
				the editor. This includes preserving text styles, lists, tables, and
				layouts. The feature facilitates the transfer of documents from Word to
				CKEditor 5 without compromising on formatting.
			</td>
		</tr>
		<tr id="paste-plain-text">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/pasting/paste-plain-text.html">Paste plain
					text</a>
			</td>
			<td>
				The Paste as Plain Text feature strips formatting from the pasted text.
				This feature ensures that text pasted into the document adopts the style
				of the surrounding content, effectively described as &quot;pasting
				without formatting.&quot; Additionally, it intelligently converts double
				line breaks into paragraphs and single line breaks into soft breaks,
				aiding in maintaining the structural integrity of the document.
			</td>
		</tr>
		<tr id="slash-commands">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/slash-commands.html">Slash commands<span
						class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature"><span
							class="tree__item__badge__text">Premium feature</span></span></a>
			</td>
			<td>
				The Slash Commands feature lets users insert block elements and apply
				styles using just the keyboard. By pressing the / key, a panel with
				suggested commands appears, enabling quick and mouse-free actions. Users
				can filter through these commands by typing additional phrases after the
				/, making it easier to find specific commands. Additionally, the option
				to customize personal commands is available, allowing for a tailored
				editing experience.
			</td>
		</tr>
		<tr id="special-characters">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/special-characters.html">Special
					characters</a>
			</td>
			<td>
				Insert a variety of unique symbols and characters into your document
				with CKEditor 5’s Special Characters feature. This includes mathematical
				operators, currency symbols, punctuation, graphic symbols like arrows or
				bullets, and Unicode letters that are not typically available on
				standard keyboards, such as umlauts or diacritics. Additionally, the
				feature supports the insertion of emojis. This tool is particularly
				useful for enhancing the detail and accuracy of content that requires
				specialized symbols.
			</td>
		</tr>
		<tr id="templates">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/template.html">Templates<span
						class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature"><span
							class="tree__item__badge__text">Premium feature</span></span></a>
			</td>
			<td>
				The Templates feature enables insertion of predefined content structures
				into documents, ranging from small content pieces, like formatted
				tables, to complete document frameworks, like formal letter templates.
				Templates accelerate the document creation process while ensuring
				adherence to the company&#x27;s content and document policies.
			</td>
		</tr>
	</tbody>
</table>

## Configurations

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr id="editor-placeholder">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/editor-placeholder.html">Editor
					placeholder</a>
			</td>
			<td>
				You can prompt the user to input content by displaying a configurable
				placeholder text when the editor is empty. This works similarly to the
				native DOM placeholder attribute used by inputs. Not to be confused with
				content placeholder.
			</td>
		</tr>
		<tr id="editor-ui-types">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/editor-types.html">Editor UI
					types</a>
			</td>
			<td>
				The editor’s user interface is dependent on the editor types. The editor
				provides functionality through specialized features accessible via a
				configurable toolbar or keyboard shortcuts. Some of these features are
				only available with certain editor types.
			</td>
		</tr>
		<tr id="balloon-block-editor">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/editor-types.html#balloon-editor-and-balloon-block-editor">Balloon
					block editor</a>
			</td>
			<td>
				Balloon block is essentially the balloon editor with an extra block
				toolbar, which can be accessed using the button attached to the editable
				content area and following the selection in the document. The toolbar
				gives access to additional block–level editing features.
			</td>
		</tr>
		<tr id="balloon-editor">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/editor-types.html#balloon-editor-and-balloon-block-editor">Balloon
					editor</a>
			</td>
			<td>
				Balloon editor is similar to inline editor. The difference between them
				is that the toolbar appears in a balloon next to the selection (when the
				selection is not empty).
			</td>
		</tr>
		<tr id="classic-editor">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/editor-types.html#classic-editor">Classic
					editor</a>
			</td>
			<td>
				Classic editor is what most users traditionally learned to associate
				with a rich-text editor – a toolbar with an editing area placed in a
				specific position on the page, usually as a part of a form that you use
				to submit some content to the server.
			</td>
		</tr>
		<tr id="decoupled-editor">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/editor-types.html#decoupled-editor-document">Decoupled
					editor</a>
			</td>
			<td>
				The document editor focuses on a rich-text editing experience similar to
				large editing packages such as Google Docs or Microsoft Word. It works
				best for creating documents, which are usually later printed or exported
				to PDF files.
			</td>
		</tr>
		<tr id="inline-editor">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/editor-types.html#inline-editor">Inline
					editor</a>
			</td>
			<td>
				The inline editor comes with a floating toolbar that becomes visible
				when the editor is focused (for example, by clicking it). A common
				scenario for using the inline editor is offering users the possibility
				to edit content (such as headings and other small areas) in its real
				location on a web page instead of doing it in a separate administration
				section.
			</td>
		</tr>
		<tr id="multi-root-editor">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/editor-types.html#multi-root-editor">Multi-root
					editor</a>
			</td>
			<td>
				The multi-root editor is an editor type that features multiple, separate
				editable areas. The main difference between using a multi-root editor
				and using multiple separate editors is the fact that in a multi-root
				editor, the editors are “connected.” All editable areas of the same
				editor instance share the same configuration, toolbar, undo stack, and
				produce one document.
			</td>
		</tr>
		<tr id="professionally-translated-language-packs">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/ui-language.html">Professionally
					translated language packs</a>
			</td>
			<td>
				CKEditor 5 provides 38 professionally translated language options, along
				with additional languages provided by community translations. CKEditor 5
				also supports right-to-left (RTL) languages natively. When an RTL
				language is selected, the editor automatically adjusts its interface,
				including elements like toolbars, dropdowns, and buttons, to ensure an
				optimal editing experience.1
			</td>
		</tr>
		<tr id="toolbar-and-menus">
			<td>
				<a href="#">Toolbar and menus</a>
			</td>
			<td>
				The Toolbar Configuration feature provides different toolbar interfaces
				for editing content. The default toolbar includes dropdown menus and
				buttons for various editing functions. The Balloon Toolbar appears when
				text is selected, showing relevant tools. The Block Toolbar is accessed
				by clicking a button on the left-hand side of the editor, providing
				tools for the active block of content. Additionally, the Multiline
				Toolbar option allows for the expansion of the standard toolbar over
				multiple lines, to display more tools simultaneously.
			</td>
		</tr>
		<tr id="balloon-toolbar">
			<td>
				<a href="#">Balloon toolbar</a>
			</td>
			<td>
				The block toolbar provides an additional configurable toolbar on the
				left-hand side of the content area, useful when the main toolbar is not
				accessible (for example in certain layouts, like balloon block editor).
			</td>
		</tr>
		<tr id="block-toolbar">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/toolbar.html#block-toolbar">Block
					toolbar</a>
			</td>
			<td>
				The block toolbar provides an additional configurable toolbar on the
				left-hand side of the content area, useful when the main toolbar is not
				accessible (for example in certain layouts, like balloon block editor).
			</td>
		</tr>
		<tr id="classic-toolbar">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/toolbar.html#main-editor-toolbar">Classic
					toolbar</a>
			</td>
			<td>
				The toolbar is the most basic user interface element of CKEditor 5 that
				gives you convenient access to all its features. It has buttons and
				dropdowns that you can use to format, manage, insert, and change
				elements of your content.
			</td>
		</tr>
		<tr id="collapsible-toolbar">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/toolbar.html#extended-toolbar-configuration-format">Collapsible
					toolbar</a>
			</td>
			<td>Collapsible toolbar for UI space efficiency.</td>
		</tr>
		<tr id="image-contextual-toolbar">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-overview.html#image-contextual-toolbar">Image
					contextual toolbar</a>
			</td>
			<td>
				The
				<code><a
				  href="https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imagetoolbar-ImageToolbar.html"
				  >ImageToolbar</a
				></code>
				plugin introduces a contextual toolbar for images. The toolbar appears
				when an image is selected and can be configured to contain any buttons
				you want. Usually, these will be image-related options such as the
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-text-alternative.html">text
					alternative</a>
				button, the
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-captions.html">image
					caption</a>
				button, and
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/images/images-styles.html">image styles</a>
				buttons. The toolbar can also host the image editing button introduced
				by the
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/file-management/ckbox.html">CKBox asset
					manager</a>. Shown below is an example contextual toolbar with an extended set of
				buttons.
			</td>
		</tr>
		<tr id="menu-bar">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/menubar.html">Menu bar</a>
			</td>
			<td>
				The menu bar is a user interface component that gives you access to all
				features provided by the editor, organized in menus and categories. This
				familiar experience popular in large editing desktop and online packages
				improves usability of the editor.<br /><br />As the menu bar gathers all
				the editor features, the toolbar can be simple and tidy, providing only
				the most essential and commonly used features. This is especially
				welcome in heavily-featured editor integrations.<br /><br />For your
				convenience, the menu bar provides a default preset structure, based on
				the plugins loaded in the editor. However, you can arrange it to suit
				your needs, remove unnecessary items, as well as add menu items related
				to your custom features.<br />
			</td>
		</tr>
		<tr id="multiline-toolbar">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/toolbar.html#multiline-wrapping-toolbar">Multiline
					toolbar</a>
			</td>
			<td>Multiline toolbar for easy access to all functions.</td>
		</tr>
		<tr id="nesting-toolbars-in-dropdowns">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/toolbar.html#grouping-toolbar-items-in-dropdowns-nested-toolbars">Nesting
					toolbars in dropdowns</a>
			</td>
			<td>Nested toolbars for space efficiency and task-oriented acces</td>
		</tr>
		<tr id="sidebar-annotations-bar">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/annotations/annotations-display-mode.html#wide-sidebar">Sidebar
					/ annotations bar</a>
			</td>
			<td>
				There are three built-in UIs to display comment threads and suggestion
				annotations: the wide sidebar, the narrow sidebar, and inline balloons.
				You can also display them together in more advanced scenarios where
				various annotation sources (comments, suggestions) are connected to
				different UIs, or even create your own UI for annotations.
			</td>
		</tr>
		<tr id="table-contextual-toolbar">
			<td>
				<a
					href="https://ckeditor.com/docs/ckeditor5/latest/features/tables/tables.html#table-contextual-toolbar">Table
					contextual toolbar</a>
			</td>
			<td>
				The
				<code><a
				  href="https://ckeditor.com/docs/ckeditor5/latest/api/module_table_tabletoolbar-TableToolbar.html"
				  >TableToolbar</a
				></code>
				plugin introduces a contextual toolbar for table. The toolbar appears
				when a table or a cell is selected and contains various table-related
				buttons. These would typically include add or remove columns and rows
				and merge or split cells . If these features are configured, the toolbar
				will also contain buttons for captions and table and cell properties.
			</td>
		</tr>
		<tr id="watchdog">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/watchdog.html">Watchdog</a>
			</td>
			<td>
				The watchdog utility protects you from data loss in case the editor
				crashes. It saves your content just before the crash and creates a new
				instance of the editor with your content intact.
			</td>
		</tr>
	</tbody>
</table>

## Compliance

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr id="accessibility-support">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/accessibility.html">Accessibility
					support</a>
			</td>
			<td>
				CKEditor 5 includes accessibility functionality designed to ensure
				content is accessible to all users. These features encompass keyboard
				navigation for easier content access without a mouse, screen reader
				compatibility facilitated by ARIA attributes, and semantic output markup
				for clearer interpretation of content structures. CKEditor 5 meets the
				requirements of the Web Content Accessibility Guidelines (WCAG) 2.2 at
				levels A and AA, as well as Section 508 of the Rehabilitation Act, as
				detailed in the Accessibility Conformance Report, ensuring broad
				accessibility compliance.
			</td>
		</tr>
		<tr id="read-only-support">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/read-only.html">Read-only support</a>
			</td>
			<td>
				The Read-Only Mode feature enables content to be locked from editing
				while still allowing it to be viewed. This mode is often used for
				restricting editing access based on user roles, allowing only specific
				users or groups to view the content without being able to modify it.
				Common uses include viewing sensitive documents like financial reports,
				software logs, or copyrighted stories that should not be altered but
				need to be accessible for copying or by screen readers. This mode can be
				toggled on and off by system triggers.
			</td>
		</tr>
		<tr id="restricted-editing">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/restricted-editing.html">Restricted
					editing</a>
			</td>
			<td>
				The Restricted Editing feature allows some sections of a document to be
				designated as non editable while others remain editable. This feature
				supports two modes: the standard editing mode, where all content can be
				edited, and the restricted editing mode, where users can only modify
				parts of the content that are specifically marked as editable. This
				functionality is useful for workflows where one group of users creates
				document templates that include protected sections, and a second group
				fills in editable details such as names, dates, or product names without
				altering the rest of the document.
			</td>
		</tr>
		<tr id="text-part-language">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/language.html">Text part language</a>
			</td>
			<td>
				The Text Part Language feature allows users to specify the language of
				individual sections of text. This capability helps in creating documents
				that include multiple languages by ensuring that browsers and screen
				readers correctly interpret each part according to its designated
				language. This feature is particularly valuable for content that
				contains text in varying directions, such as an English document with
				Arabic citations. It supports the WCAG 3.1.2 Language of Parts
				specification, facilitating the creation of more accessible and
				comprehensible multilingual content.
			</td>
		</tr>
		<tr id="word-and-character-counter">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/word-count.html">Word and character
					counter</a>
			</td>
			<td>
				The Word and Character Count feature provides a real-time tracking tool
				for monitoring the number of words and characters within the editor.
				This functionality assists in managing content length and ensuring it
				meets specific requirements or limits.
			</td>
		</tr>
		<tr id="wproofreader">
			<td>
				<a href="https://ckeditor.com/docs/ckeditor5/latest/features/spelling-and-grammar-checking.html">WPRoofreader<span
						class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature"><span
							class="tree__item__badge__text">Premium feature</span></span></a>
			</td>
			<td>
				The Spelling and Grammar Checker is a proofreading tool that supports
				over 80 languages and dialects. It checks spelling and grammar in real
				time and through a separate dialog. Features include spelling
				autocorrect, text autocomplete, and suggestions that appear on hover.<br />Users
				can create custom dictionaries for specific terms related to their brand
				or company. The tool is compliant with WCAG 2.1 and Section 508
				accessibility standards. It also detects sentence-level errors and
				offers context-based correction suggestions.<br />
			</td>
		</tr>
	</tbody>
</table>

## Customization

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td></td>
			<td></td>
		</tr>
	</tbody>
</table>

## File management

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td></td>
			<td></td>
		</tr>
	</tbody>
</table>

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
  	<tr id="sidebar-modes">
		<td>
			<a
				href="https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/annotations/annotations-display-mode.html">Sidebar
				modes<span class="tree__item__badge tree__item__badge_premium"
					data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
						feature</span></span></a>
		</td>
		<td>
			There are three built-in UIs to display comment threads and suggestion
			annotations: the wide sidebar, the narrow sidebar, and inline balloons.
			You can also display them together in more advanced scenarios where
			various annotation sources (comments, suggestions) are connected to
			different UIs, or even create your own UI for annotations.
		</td>
	</tr>
    <tr id="cloud-services-rest-api">
      <td>
        <a href="#">Cloud Services REST API </a>
      </td>
      <td></td>
    </tr>
    <tr id="ckeditor5-inspector">
      <td>
        <a href="#">CKEditor 5 Inspector</a>
      </td>
      <td></td>
    </tr>
    <tr id="ui-library">
      <td>
        <a
          href="https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/ui-library.html"
          >UI Library</a
        >
      </td>
      <td>
        The standard UI library of CKEditor 5 is
        <code
          ><a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-ui"
            >@ckeditor/ckeditor5-ui</a
          ></code
        >. It provides base classes and helpers that allow for building a
        modular UI that seamlessly integrates with other components of the
        ecosystem.
      </td>
    </tr>
    <tr id="themes">
      <td>
        <a
          href="https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/ui/theme-customization.html"
          >Themes</a
        >
      </td>
      <td>
        The default theme of CKEditor 5 can be customized to match most visual
        integration requirements.
      </td>
    </tr>
    <tr id="editor-sdk">
      <td>
        <a href="#">Editor SDK</a>
      </td>
      <td>
        Select from numerous toolbar styles and over 100 plugins to tailor an
        editor that perfectly fits your requirements, all without needing any
        development expertise. For those looking to go further, the CKEditor API
        enables the creation of custom plugins or modification of the
        editor&#x27;s functionality. To assist the development process,
        dedicated resources such as a package generator and the CKEditor 5
        Inspector - a comprehensive suite of debugging tools - are provided,
        helping accelerate development work.
      </td>
    </tr>
    <tr id="uploadcare">
      <td>
        <a href="#"
          >Uploadcare<span
            class="tree__item__badge tree__item__badge_premium"
            data-badge-tooltip="Premium feature"
            ><span class="tree__item__badge__text">Premium feature</span></span
          ></a
        >
      </td>
      <td>
        Upload, store, transform, optimize, and deliver images, videos, and
        documents with this cloud-based file handler. Upload media from local
        storage, web cameras, cloud services, and social networks with automated
        media optimization through a CDN for responsive image delivery. Popular
        features include adaptive image quality, automated image format
        conversion, progressive JPEG, and options for preview, resize, stretch,
        crop, content-aware crop, and setting fill color.
      </td>
    </tr>
    <tr id="custom-upload-adapter">
      <td>
        <a
          href="https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html#implementing-your-own-upload-adapter"
          >Custom Upload Adapter</a
        >
      </td>
      <td>
        Have your own file management solution? Use this adapter to integrate
        your preferred software with CKEditor.
      </td>
    </tr>
    <tr id="simple-upload-adapter">
      <td>
        <a
          href="https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/simple-upload-adapter.html"
          >Simple Upload Adapter</a
        >
      </td>
      <td>
        Upload images to your server using the `XMLHttpRequest` API with a
        minimal editor configuration.
      </td>
    </tr>
    <tr id="base64-upload-adapter">
      <td>
        <a
          href="https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/base64-upload-adapter.html"
          >Base 64 Upload Adapter</a
        >
      </td>
      <td>
        Convert inserted images into Base64-encoded strings in the editor
        output. Images are stored with other content in the database without
        server-side processing.
      </td>
    </tr>
    <tr id="ckfinder">
      <td>
        <a
          href="https://ckeditor.com/docs/ckeditor5/latest/features/file-management/ckfinder.html"
          >CKFinder<span
            class="tree__item__badge tree__item__badge_premium"
            data-badge-tooltip="Premium feature"
            ><span class="tree__item__badge__text">Premium feature</span></span
          ></a
        >
      </td>
      <td>
        The CKFinder feature lets you insert images and links to files into your
        content. CKFinder is a powerful file manager with various image editing
        and image upload options.
      </td>
    </tr>
    <tr id="ckbox">
      <td>
        <a
          href="https://ckeditor.com/docs/ckeditor5/latest/features/file-management/ckbox.html"
          >CKBox<span
            class="tree__item__badge tree__item__badge_premium"
            data-badge-tooltip="Premium feature"
            ><span class="tree__item__badge__text">Premium feature</span></span
          ></a
        >
      </td>
      <td>
        Securely upload, store, edit, and utilize your images and files in
        CKEditor 5. Simplify media discovery in your uploads with the media
        browser, alongside an intuitive Image Editor for image adjustments.
        Designed to facilitate organization, CKBox enables integrations,
        maintains permissions, and uses Workspaces for categorizing files
        according to the user, document, or customer. It guarantees fast loading
        and optimal display of your images across devices through an efficient
        CDN.<br />Deployable on-premise or as cloud SaaS.<br />
      </td>
    </tr>
    <tr id="easy-image">
      <td>
        <a
          href="https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/easy-image.html"
          >Easy Image</a
        >
      </td>
      <td>
        <strong>DON’T ADD TO DOCS. </strong>The Easy Image is an intuitive tool
        for uploading images. Unlike the CKBox feature, which is a full-fledged
        file manager, Easy Image concentrates on upload only.
      </td>
    </tr>
  </tbody>
</table>
