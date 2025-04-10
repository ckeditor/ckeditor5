---
category: features
menu-title: Feature digest
meta-title: Feature digest | CKEditor 5 Documentation
meta-description: CKEditor 5 offers over 150 features, from basic editing capabilities like bold or italics to full-blown real-time collaboration - this page collects them all.
modified_at: 2024-11-20
order: -998
---

CKEditor 5 offers over 150 various features, from basic editing capabilities like bold or italics to full-blown real-time collaboration, where multiple people can work on one document at the same time. This page collects them all and groups them into capabilities, features, and sub-features. Let's hope this list will help you grasp and easily digest everything CKEditor 5 has to offer.

## Core editing

Core editing capability provides tools to create, edit, and style content. Here are essentials that every writer needs in their tool belt, like bold or italics. There is also something for coders - advanced HTML editing capabilities where you can directly edit HTML elements.

<table class="feature-digest">
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr id="advanced-html-editing" class="feature">
			<td>
				{@link features/general-html-support Advanced HTML Editing}
			</td>
			<td>
				Advanced HTML Editing provides general HTML support, offering detailed
				control over permissible HTML elements, attributes, and styles. It
				further allows HTML Source Code Editing, handling HTML elements,
				HTML comments, and editing of the full page content, including meta
				tags.
			</td>
		</tr>
		<tr id="full-page-html" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/full-page-html Full page HTML}
				</span>
			</td>
			<td>
				Thanks to the full page HTML feature, you can use CKEditor 5 to edit
				entire HTML pages (from <code>&lt;html&gt;</code> to
				<code>&lt;/html&gt;</code>), including the page metadata. While the
				{@link features/general-html-support General HTML Support}
				feature focuses on elements inside the content (the document's
				<code>&lt;body&gt;</code>), this feature enables markup invisible
				to the end user.
			</td>
		</tr>
		<tr id="general-html-support" class="subfeature background-gray">
			<td>
				 <span>
				 	<span class="subfeature-icon"></span>&nbsp;{@link features/general-html-support General HTML Support (GHS)}
				 </span>
			</td>
			<td>
				With the General HTML Support (GHS) feature, developers can enable HTML
				features that are not supported by any other dedicated CKEditor 5
				plugins. GHS lets you add elements, attributes, classes, and styles to
				the source. It also ensures this markup stays in the editor window and the output.
			</td>
		</tr>
		<tr id="html-comment" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/html-comments HTML comment}
				</span>
			</td>
			<td class="subfeature background-gray">
				By default, the editor filters out all HTML comments on initialization.
				The <code>{@link features/html-comments HTML comment}</code>
				feature lets developers keep HTML comments in the document without
				displaying them to the user.
			</td>
		</tr>
		<tr id="html-embed" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/html-embed HTML embed}
				</span>
			</td>
			<td>
				The HTML embed feature lets you embed any HTML snippet in your content.
				The feature is meant for more advanced users who want to directly
				interact with HTML fragments.
			</td>
		</tr>
		<tr id="show-blocks" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/show-blocks Show blocks}
				</span>
			</td>
			<td>
				The show blocks feature allows the content creators to visualize all
				block-level elements (except for widgets). It surrounds them with an
				outline and displays their element name in the top-left corner of the
				box.
			</td>
		</tr>
		<tr id="source-editing" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/source-editing Source code editing}
				</span>
			</td>
			<td>
				The source code editing feature lets you view and edit the source of your
				document.
			</td>
		</tr>
		<tr id="source-editing-enhanced" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/source-editing-enhanced Enhanced source code editing}
				</span>
			</td>
			<td>
				Enhanced source code editing allows for viewing and editing the source code of the document in a handy modal window (compatible with all editor types) with syntax highlighting, autocompletion and more.
			</td>
		</tr>
		<tr id="block-formatting" class="feature">
			<td>
				{@link features/block-quote Block formatting}
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
		<tr id="block-quotes" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/block-quote Block quote}
				</span>
			</td>
			<td>
				The block quote feature lets you easily include block quotations or pull
				quotes in your content. It is also an attractive way to draw the
				readers' attention to selected parts of the text.
			</td>
		</tr>
		<tr id="headings-paragraph" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/headings Headings/paragraph}
				</span>
			</td>
			<td>
				The heading feature helps you structure your document by adding headings
				to parts of the text. They make your content easier to scan by both
				readers and search engines.
			</td>
		</tr>
		<tr id="horizontal-line" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/horizontal-line Horizontal line}
				</span>
			</td>
			<td>
				The horizontal line feature lets you visually divide your content into
				sections by inserting horizontal lines (also known as horizontal rules).
				It is an easy way to organize the content or indicate a change of topic.
			</td>
		</tr>
		<tr id="block-indentation" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/indent Block indentation}
				</span>
			</td>
			<td>
				The block indentation feature lets you set indentation for text blocks
				such as paragraphs, headings, or lists. This way you can visually
				distinguish parts of your content.
			</td>
		</tr>
		<tr id="bookmark" class="feature">
			<td>
				{@link features/bookmarks Bookmarks}
			</td>
			<td>
				The bookmarks feature allows for adding and managing the bookmarks anchors
				attached to the content of the editor. These provide fast access to important
				content sections, and speed up the navigation boosting efficiency.
			</td>
		</tr>
		<tr id="clipboard" class="feature">
			<td>
				{@link framework/deep-dive/clipboard Clipboard}
			</td>
			<td>
				Copy, cut, and paste content within the editor or from external sources.
			</td>
		</tr>
		<tr id="code-blocks" class="feature">
			<td>
				{@link features/code-blocks Code blocks}
			</td>
			<td>
				Supports the insertion and management of pre-formatted code snippets with
				distinct styling.
			</td>
		</tr>
		<tr id="drag-and-drop" class="feature">
			<td>
				{@link features/drag-drop Drag and drop}
			</td>
			<td>
				Rearrange elements within a document, including moving text blocks,
				images, or other content types.
			</td>
		</tr>
		<tr id="font-formatting" class="feature">
			<td>
				{@link features/font Font formatting}
			</td>
			<td>
				The font feature lets you change font family, size, and color (including
				background color). All of these options are configurable.
			</td>
		</tr>
		<tr id="font-background-color" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/font#configuring-the-font-color-and-font-background-color-features Font background color}
				</span>
			</td>
			<td>
				Effortlessly make the words stand out even more with a colored background.
			</td>
		</tr>
		<tr id="font-color" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/font#configuring-the-font-color-and-font-background-color-features Font color}
				</span>
			</td>
			<td>Effortlessly make the letters stand out with their own color.</td>
		</tr>
		<tr id="font-family" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/font#configuring-the-font-family-feature Font family}
				</span>
			</td>
			<td>
				Choose from a predefined set of fonts, depending on the type of content
				and its destination - print, screen, etc.
			</td>
		</tr>
		<tr id="font-size" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/font#configuring-the-font-size-feature Font size}
				</span>
			</td>
			<td>Easily control the size of the letters.</td>
		</tr>
		<tr id="image" class="feature">
			<td>
				{@link features/images-overview Image}
			</td>
			<td>
				The image feature allows adding images of various kinds to the rich
				content inside the editor. A large set of subfeature background-grays lets the users
				fully control this process. Upload or paste images, insert
				via URL, use responsive images, resize images, add captions, set
				different image styles, and link images.
			</td>
		</tr>
		<tr id="image-all-text" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/images-text-alternative Image alt text}
				</span>
			</td>
			<td>
				Add description text, AKA alternative text, for images. Alt text
				improves accessibility by telling screen readers and search engines what
				the image depicts.
			</td>
		</tr>
		<tr id="image-captions" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/images-captions Image captions}
				</span>
			</td>
			<td>
				Add optional captions for images, which are shown below the picture.
			</td>
		</tr>
		<tr id="image-insert-via-url" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/images-inserting Image insert via URL}
				</span>
			</td>
			<td>
				You can insert images by uploading them directly from your disk, but you
				can also configure CKEditor 5 to let you insert images using URLs. This
				way, you can save time by adding images that are already online.
			</td>
		</tr>
		<tr id="image-linking" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/images-linking Image linking}
				</span>
			</td>
			<td>
				The
				<code>{@link module:link/linkimage~LinkImage}</code>
				plugin lets you use images as links.
			</td>
		</tr>
		<tr id="image-resize" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/images-resizing Image resize}
				</span>
			</td>
			<td>
				The image resize feature lets you change the width of images in your
				content. It is implemented by the
				<code>{@link module:image/imageresize~ImageResize}</code>
				plugin.
			</td>
		</tr>
		<tr id="image-styles" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/images-styles Image styles}
				</span>
			</td>
			<td>
				The image styles feature lets you adjust the appearance of images. It
				works by applying CSS classes to images or changing their type from
				inline to block or vice versa.
			</td>
		</tr>
		<tr id="image-upload" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/image-upload Image upload}
				</span>
			</td>
			<td>
				Inserting
				{@link features/images-overview images}
				into content created with CKEditor 5 is quite a common task. In a
				properly configured rich-text editor, there are several ways for the end
				user to insert images.
			</td>
		</tr>
		<tr id="responsive-images" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/images-responsive Responsive images}
				</span>
			</td>
			<td>
				The ability to have responsive images in the rich-text editor content is
				a great modern feature provided by the {@link features/ckbox CKBox asset manager}.
				With a single image upload, several optimized versions of that image
				are created, each for a different size of the display. The CKBox feature
				produces a <code>&lt;picture&gt;</code> element with a set of optimized
				images. The browser will automatically load the image with the
				dimensions most suitable for the presented page resolution, which makes
				the image load much faster and saves bandwidth.
			</td>
		</tr>
		<tr id="links" class="feature">
			<td>
				{@link features/link Links}
			</td>
			<td>
				Facilitates the addition of hyperlinks to text, automatically converting
				typed or pasted URLs into clickable links, and allowing manual insertion
				and editing of links.
			</td>
		</tr>
		<tr id="lists" class="feature">
			<td>
				{@link features/lists Lists}
			</td>
			<td>
				Lists allow the creation and management of various list types, including
				to-do lists, bulleted and numbered lists, with additional customization
				options such as list styles, setting the start number for lists,
				creating reversed lists, adjusting list indentation, and crafting nested
				lists.
			</td>
		</tr>
		<tr id="list-indentation" class="subfeature background-gray">
			<td>
				{@link features/lists-editing#indenting-lists List indentation}
			</td>
			<td>
				Besides controlling
				{@link features/indent text block indentation},
				the indent and outdent buttons allow for indenting list items
				(nesting them).
			</td>
		</tr>
		<tr id="list-start-index" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/lists#list-start-index List start index}
				</span>
			</td>
			<td>
				The list start index feature allows the user to choose the starting
				point of an ordered list. By default, this would be 1 (or A, or I – see
				the list styles section). Sometimes, you may want to start a list with
				some other digit or letter, though.
			</td>
		</tr>
		<tr id="list-styles" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/lists#list-styles List styles}
				</span>
			</td>
			<td>
				The list style feature introduces some more styles for the list item
				markers. When
				{@link module:list/listconfig~ListPropertiesConfig#member-styles enabled},
				it adds 3 styles for unordered lists and 6 styles for ordered lists
				to choose from. The user will be able to set or change the list style
				via the dropdown. It opens when you click the arrow next to the
				appropriate list button in the toolbar.
			</td>
		</tr>
		<tr id="multi-level-lists" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/multi-level-lists Multi-level lists
						<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
						<span class="tree__item__badge__text">Premium feature</span></span>
					}
				</span>
			</td>
			<td>
				Multi-level lists with the legal style numbering feature allows for easy
				creation and modification of numbered lists with counters (1, 1.1,
				1.1.1). These are crucial for clear referencing and hierarchical
				organization in complex documents. The feature offers full compatibility
				with Microsoft Word.
			</td>
		</tr>
		<tr id="nested-lists" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/lists-editing#indenting-lists Nested lists}
				</span>
			</td>
			<td>
				Besides controlling {@link features/indent text block indentation},
				the indent and outdent buttons allow for indenting list items
				(nesting them).
			</td>
		</tr>
		<tr id="ordered-lists" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/lists Ordered lists}
				</span>
			</td>
			<td>
				The list feature lets you create ordered (numbered) lists. The unique
				thing about them is that you can put any content inside each list item
				(including block elements like paragraphs and tables), retaining the
				continuity of numbering and indentation. You can also easily control the
				list markers type.
			</td>
		</tr>
		<tr id="reversed-list" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/lists#reversed-list Reversed list}
				</span>
			</td>
			<td>
				The reversed list feature lets the user reverse the numbering order of a
				list, changing it from ascending to descending. This is useful in
				countdowns and things-to-do lists that need to reproduce steps in a
				reversed order (for example, in disassembly instructions).
			</td>
		</tr>
		<tr id="to-do-lists" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/todo-lists To-do lists}
				</span>
			</td>
			<td>
				The to-do list feature lets you create a list of interactive checkboxes
				with labels. It supports all features of {@link features/lists bulleted and numbered lists},
				so you can nest a to-do list together with any combination of other
				lists.
			</td>
		</tr>
		<tr id="unordered-lists" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/lists Unordered lists}
				</span>
			</td>
			<td>
				The list feature lets you create unordered (bulleted) lists. The unique
				thing about them is that you can put any content inside each list item
				(including block elements like paragraphs and tables), retaining the
				continuity of numbering and indentation. You can also easily control the
				list markers' shape.
			</td>
		</tr>
		<tr id="mermaid" class="feature">
			<td>
				{@link features/mermaid Mermaid <span class="tree__item__badge tree__item__badge_new"
				data-badge-tooltip="Experimental feature">Exp</span>}
			</td>
			<td>
				You can create flowcharts and diagrams in CKEditor 5 thanks to the
				experimental integration with the Mermaid library. Mermaid uses a
				Markdown-inspired syntax to create and dynamically modify flowcharts,
				Gantt diagrams, pie or quadrant charts, graphs, mindmaps, and more.
			</td>
		</tr>
		<tr id="remove-formatting" class="feature">
			<td>
				{@link features/remove-format Remove formatting}
			</td>
			<td>
				The remove format feature lets you quickly remove any text formatting
				applied using inline HTML elements and CSS styles, like basic text
				styles (bold, italic) or font family, size, and color. This feature does
				not remove block-level formatting (headings, images) or semantic data
				(links).
			</td>
		</tr>
		<tr id="select-all" class="feature">
			<td>
				{@link features/select-all Select all}
			</td>
			<td>
				Enables the selection of all content within the editor with a single
				command or shortcut.
			</td>
		</tr>
		<tr id="tables" class="feature">
			<td>
				{@link features/tables Tables}
			</td>
			<td>
				CKEditor 5 provides robust support for tables, with the ability to merge
				and split cells, resize columns, style tables and individual cells,
				insert and delete columns and rows, as well as create nested tables for
				complex data presentation.
			</td>
		</tr>
		<tr id="columns-resizing" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/tables-resize Columns resizing}
				</span>
			</td>
			<td>
				The
				<code>{@link module:table/tablecolumnresize~TableColumnResize}</code>
				plugin lets you resize tables and individual table columns. It gives you
				complete control over column width.
			</td>
		</tr>
		<tr id="insert-delete-columns-and-rows" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/tables#table-contextual-toolbar Insert/delete columns & rows}
				</span>
			</td>
			<td>
				The basic table features allow users to insert tables into content, add
				or remove columns and rows and merge or split cells.
			</td>
		</tr>
		<tr id="merge-and-split-cells" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/tables#table-contextual-toolbar Merge & split cells}
				</span>
			</td>
			<td>
				The basic table features allow users to insert tables into content, add
				or remove columns and rows, and merge or split cells.
			</td>
		</tr>
		<tr id="nesting" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/tables#nesting-tables Nesting}
				</span>
			</td>
			<td>
				CKEditor 5 allows nesting tables inside other table's cells. This may be
				used for creating advanced charts or layouts based on tables. The nested
				table can be formatted just like a regular one.
			</td>
		</tr>
		<tr id="styling-tables-and-cells" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/tables-styling Styling tables & cells}
				</span>
			</td>
			<td>
				CKEditor 5 comes with some additional tools that help you change the
				look of tables and table cells. You can control border color and style,
				background color, padding, or text alignment.
			</td>
		</tr>
		<tr id="table-headers" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/tables#default-table-headers Table headers}
				</span>
			</td>
			<td>
				To make every inserted table have <code>n</code> number of rows and
				columns as table headers by default, set an optional table configuration
				property <code>defaultHeadings</code>.
			</td>
		</tr>
		<tr id="table-selection" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/tables#table-selection Table selection}
				</span>
			</td>
			<td>
				The
				<code>{@link module:table/tableselection~TableSelection}</code>
				plugin introduces support for the custom selection system for tables
				that lets you:• Select an arbitrary rectangular table fragment – a
				few cells from different rows, a column (or a few of them) or a row (or
				multiple rows).• Apply formatting or add a link to all selected
				cells at once. The table selection plugin is loaded automatically
				by the <code>Table</code> plugin.
			</td>
		</tr>
		<tr id="tables-caption" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/tables-caption Tables caption}
				</span>
			</td>
			<td>
				The
				<code>{@link module:table/tablecaption~TableCaption}</code>
				plugin lets you add captions to your tables. Table captions also improve
				accessibility as they are recognized by screen readers.
			</td>
		</tr>
		<tr id="tables-layout" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/layout-tables Layout tables}
				</span>
			</td>
			<td>
				The
				<code>{@link module:table/tablelayout~TableLayout}</code>
				plugin is used to structure web page content spatially rather than for presenting tabular data.
				It lets integrators create multi-column designs and precise positioning of elements on a page.
			</td>
		</tr>
		<tr id="text-alignment" class="feature">
			<td>
				{@link features/text-alignment Text alignment}
			</td>
			<td>
				Allows the adjustment of text alignment to the left, right, center, or
				justify and permits the alteration of indentation.
			</td>
		</tr>
		<tr id="text-formatting" class="feature">
			<td>
				{@link features/basic-styles Text formatting}
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
		<tr id="bold" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/basic-styles Bold}
				</span>
			</td>
			<td>Making the letters look like the good time were never gone.</td>
		</tr>
		<tr id="code" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/basic-styles Code}
				</span>
			</td>
			<td>Snippet look like a terminal from the 1990s movie.</td>
		</tr>
		<tr id="highlight" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/highlight Highlight}
				</span>
			</td>
			<td>
				Highlight makes important content stand out, either with font color or
				background fill.
			</td>
		</tr>
		<tr id="italic" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/basic-styles Italic}
				</span>
			</td>
			<td>Making the letters look like seashore pines.</td>
		</tr>
		<tr id="strikethrough" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/basic-styles Strikethrough}
				</span>
			</td>
			<td>Never mind, will not need it anymore.</td>
		</tr>
		<tr id="styles" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/style Styles}
				</span>
			</td>
			<td>
				The styles feature lets you easily apply predefined styles available for
				block and inline content.
			</td>
		</tr>
		<tr id="subscript" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/basic-styles Subscript}
				</span>
			</td>
			<td>Fine print at the bottom, like atom numbers.</td>
		</tr>
		<tr id="superscript" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/basic-styles Superscript}
				</span>
			</td>
			<td>Fine print on top, like references in a book.</td>
		</tr>
		<tr id="underline" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/basic-styles Underline}
				</span>
			</td>
			<td>Stuff looks important, yo. Or like a link, too.</td>
		</tr>
		<tr id="undo-redo" class="feature">
			<td>
				{@link features/undo-redo Undo/redo}
			</td>
			<td>Backtrack or repeat actions for editing purposes.</td>
		</tr>
	</tbody>
</table>

## Collaboration

Collaborate with others - real-time or asynchronously. Comment, co-author, and mention team members in your documents. With collaboration features review process should be a breeze.

<table class="feature-digest">
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr id="asynchronous-collaboration" class="feature">
			<td>
				{@link features/collaboration Asynchronous collaboration
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>
				Asynchronous Collaboration in CKEditor 5 is designed for teams using a
				turn-based approach to collaboratively write, review, and discuss
				content within the application. It integrates Track Changes, Comments,
				and Revision History features to facilitate collaboration.
			</td>
		</tr>
		<tr id="local-data-storage" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/collaboration Local data storage
						<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
						<span class="tree__item__badge__text">Premium feature</span></span>
					}
				</span>
			</td>
			<td>
				In asynchronous collaboration, data is maintained on the client's
				servers.
			</td>
		</tr>
		<tr id="comments" class="feature">
			<td>
				{@link features/comments Comments
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>
				Users can add side notes to marked fragments of the document, including
				text and block elements such as images. It also allows the users to
				discuss in threads and remove comments when they finish the discussion.
			</td>
		</tr>
		<tr id="comments-archive" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/comments Comments archive
						<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
						<span class="tree__item__badge__text">Premium feature</span></span>
					}
				</span>
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
		<tr id="comments-outside-editor" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/comments-outside-editor Comments outside editor
						<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
						<span class="tree__item__badge__text">Premiumfeature</span></span>
					}
				</span>
			</td>
			<td>
				The comments feature API, together with
				<code>{@link module:core/context~Context}</code>, lets you create deeper integrations with your application. One such
				integration is enabling comments on non-editor form fields.
			</td>
		</tr>
		<tr id="sidebar-modes" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/annotations-display-mode Sidebar modes
						<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
						<span class="tree__item__badge__text">Premium feature</span></span>
					}
				</span>
			</td>
			<td>
				There are three built-in UIs to display comment threads and suggestion
				annotations: the wide sidebar, the narrow sidebar, and inline balloons.
				You can also display them together in more advanced scenarios where
				various annotation sources (comments, suggestions) are connected to
				different UIs or even create your UI for annotations.
			</td>
		</tr>
		<tr id="mentions" class="feature">
			<td>
				{@link features/mentions Mentions}
			</td>
			<td>
				The mention feature supports smart autocompletion triggered by user
				input. Typing a predetermined marker, like @ or #, prompts a panel to
				appear, offering autocomplete suggestions.
			</td>
		</tr>
		<tr id="real-time-collaboration" class="feature">
			<td>
				{@link features/real-time-collaboration Real-time collaboration
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>
				Real-Time Collaboration in CKEditor 5 is designed for users who are
				writing, reviewing, and commenting on content simultaneously. It also
				automatically solves all conflicts if users make changes at the same
				time.
			</td>
		</tr>
		<tr id="co-authoring" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/users-in-real-time-collaboration Co-authoring
						<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
						<span class="tree__item__badge__text">Premium feature</span></span>
					}
				</span>
			</td>
			<td>Multiple user real-time editing and content creation feature.</td>
		</tr>
		<tr id="on-premises" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;
					<a href="https://ckeditor.com/docs/cs/latest/onpremises/index.html">
						On-premises
						<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
							<span class="tree__item__badge__text">Premium feature</span>
						</span>
					</a>
				</span>
			</td>
			<td>
				On-premises real-time collaboration version to deploy to client's own
				infrastructure, includes a private cloud.
			</td>
		</tr>
		<tr id="saas" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;
					<a href="https://ckeditor.com/docs/cs/latest/guides/collaboration/quick-start.html">
						SaaS
						<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
							<span class="tree__item__badge__text">Premium feature</span>
						</span>
					</a>
				</span>
			</td>
			<td>Real-time collaboration provided as a service by CKSource.</td>
		</tr>
		<tr id="revision-history" class="feature">
			<td>
				{@link features/revision-history Revision history
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
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
		<tr id="track-changes" class="feature">
			<td>
				{@link features/track-changes Track changes
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>
				The track changes feature brings automatic suggestion marking for the
				document as you change it. When editing the document, the user can
				switch to the track changes mode. All their changes will then create
				suggestions that they can accept or discard.
			</td>
		</tr>
		<tr id="users-list-and-permissions" class="feature">
			<td>
				{@link features/users Users list and permissions
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>
				The
				<code>{@link module:collaboration-core/users~Users}</code>
				plugin and related plugins let you manage user data and permissions.
				This is essential when many users are working on the same document.
			</td>
		</tr>
	</tbody>
</table>

## Content conversion & embedding

Collaborate also regarding different formats. With content conversions, you can integrate content across commonly used business formats. You can also enrich your content with media embeds.

<table class="feature-digest">
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr id="content-generation" class="feature">
			<td>
				{@link features/export-pdf Content generation
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>CKEditor 5 may be your universal starting point for generating content in several recognizable formats.</td>
		</tr>
		<tr id="export-to-pdf" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/export-pdf Export to PDF
						<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
						<span class="tree__item__badge__text">Premium feature</span></span>
					}
				</span>
			</td>
			<td>
				Create a PDF from in-editor content seamlessly. Customize headers and
				footers, include page breaks, embed images, and choose from various
				fonts.
			</td>
		</tr>
		<tr id="export-to-word" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/export-word Export to Word
						<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
						<span class="tree__item__badge__text">Premium feature</span></span>
					}
				</span>
			</td>
			<td>
				Instantly convert content from the editor to a Word document with a
				single click, maintaining its appearance and formatting. The final
				document includes suggestions, comments, page breaks, and embedded
				images.
			</td>
		</tr>
		<tr id="import-from-word" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/import-word Import from Word
						<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
						<span class="tree__item__badge__text">Premium feature</span></span>
					}
				</span>
			</td>
			<td>
				Effortlessly transform Word documents into clean HTML within CKEditor 5
				while retaining the original styling, as well as comments and change
				tracking annotations.
			</td>
		</tr>
		<tr id="tables-layout" class="feature">
			<td>
				{@link features/export-with-inline-styles Export with inline styles}
						<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
						<span class="tree__item__badge__text">Premium feature</span></span>
			</td>
			<td>
				The
				<code>{@link module:export-inline-styles/exportinlinestyles~ExportInlineStyles}</code>
				plugin applies the styles defined by CSS style sheets directly on HTML elements.
			</td>
		</tr>
		<tr id="markdown-output" class="feature">
			<td>
				{@link features/markdown Markdown output}
			</td>
			<td>
				Enable Markdown as the default output format instead of HTML with the
				Markdown plugin. Combined with Autoformatting, CKEditor becomes an
				efficient Markdown editor, allowing the creation of text documents using
				the simplified formatting syntax favored by developers.
			</td>
		</tr>
		<tr id="media-embed" class="feature">
			<td>
				{@link features/media-embed Media embed}
			</td>
			<td>
				Use the insert media button in the toolbar to embed media.
				Pasting a media URL directly into the editor content automatically
				embeds the media.
			</td>
		</tr>
		<tr id="paste-markdown" class="feature">
			<td>
				{@link features/paste-markdown Paste Markdown
					<span class="tree__item__badge tree__item__badge_new" data-badge-tooltip="Experimental feature">Exp</span>
				}
			</td>
			<td>
				The paste Markdown feature lets users paste Markdown-formatted content
				straight into the editor. It will be then converted into rich text on
				the fly.
			</td>
		</tr>
		<tr id="xml-output" class="feature">
			<td>
				{@link module:engine/dataprocessor/xmldataprocessor~XmlDataProcessor XML output}
			</td>
			<td>
				Turn your content into parsable XML files for automation and
				cross-platform interoperability.
			</td>
		</tr>
	</tbody>
</table>

## Page management

Format, organize, and navigate your documents easily with page management features. Create a table of contents, insert page breaks, and manage pagination.

<table class="feature-digest">
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr id="document-outline" class="feature">
			<td>
				{@link features/document-outline Document outline
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>
				The Document Outline feature automatically detects and lists document
				headings in a sidebar, enabling faster navigation through large
				documents. Headings are organized in a structured list, so users can
				click and jump to different sections quickly. This feature also
				allows for customization of the outline's location within the user
				interface, catering to different user preferences for workspace layout.
			</td>
		</tr>
		<tr id="page-utilities" class="feature">
			<td>
				{@link features/minimap Page utilities}
			</td>
			<td>
				CKEditor 5 Page Utilities enables users to dictate the structuring and
				print formatting of their documents effectively.
			</td>
		</tr>
		<tr id="content-minimap" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/minimap Content minimap}
				</span>
			</td>
			<td>
				Offers a concise, birds-eye view of the document's content,
				allowing for quick navigation and content management.
			</td>
		</tr>
		<tr id="document-title" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/title Document title}
				</span>
			</td>
			<td>
				Allows users to set and modify the document's title within the
				editing interface, ensuring accurate reflection of the contents.
			</td>
		</tr>
		<tr id="page-break" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/page-break Page break}
				</span>
			</td>
			<td>
				Facilitates the insertion of manual breaks within the document, enabling
				the definition of page endings and beginnings for optimal layout and
				print clarity.
			</td>
		</tr>
		<tr id="pagination" class="feature">
			<td>
				{@link features/pagination Pagination
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>
				The Pagination feature visually indicates where pages begin and end within a document. This feature is
				designed to assist users in preparing their documents for printing or export to various document
				formats, ensuring that the transition between pages is seamless and accurately reflected in the final
				output. Users may adjust content distribution across pages as they like, ensuring well-organized
				documents with presented content, whether in digital form or print. By providing a clear view of how
				text and elements will appear page-by-page, Pagination aids in the creation of professional and polished
				documents.
			</td>
		</tr>
		<tr id="table-of-contents" class="feature">
			<td>
				{@link features/table-of-contents Table of contents
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>
				The Table of Contents feature is a dynamic tool for organizing
				documents. It allows for the insertion of a linked table of contents
				that automatically updates in real time as the document's content
				changes. This means changes made to headings or structured sections
				within the document are reflected immediately in the table of contents,
				accurately representing the document structure.
			</td>
		</tr>
	</tbody>
</table>

## Productivity

Speed up the content creation process with dedicated productivity utilities. Autoformat your content as you write (or paste from other editors) or even delegate some tasks to an AI Assistant.

<table class="feature-digest">
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr id="ai-assistant" class="feature">
			<td>
				{@link features/ai-assistant-overview AI Assistant
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
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
		<tr id="automation" class="feature">
			<td>
				{@link features/autoformat Automation}
			</td>
			<td>Automate your workflow with CKEditor 5 automation tools, regardless of whether you write, link, or save!
			</td>
		</tr>
		<tr id="autoformatting" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/autoformat Autoformatting}
				</span>
			</td>
			<td>
				Use <strong>Autoformatting </strong>to get Markdown-like shortcodes for
				quick formatting without needing to navigate through toolbar buttons or
				dropdown menus. This feature caters to the most common formatting needs.
			</td>
		</tr>
		<tr id="autolink" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/link#autolink-feature Autolink}
				</span>
			</td>
			<td>
				With <strong>Autolink</strong>, typing or pasting URLs and email
				addresses automatically transforms them into clickable links. This
				functionality is enabled by default, ensuring that links are always
				ready to use.
			</td>
		</tr>
		<tr id="automatic-text-transformation" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/text-transformation Automatic text transformations}
				</span>
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
		<tr id="autosave" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/autosave Autosave}
				</span>
			</td>
			<td>
				The <strong>Autosave </strong>feature guarantees that your work is never
				lost. It automatically saves changes - for instance, when content is
				modified. This could involve sending the latest version of the document
				to the server, providing peace of mind through continuous backup.
			</td>
		</tr>
		<tr id="case-change" class="feature">
			<td>
				{@link features/case-change Case change
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>
				The Case Change feature simplifies adjusting text cases within a
				document. With just a single click, users can shift text between
				UPPERCASE, lowercase, and Title Case options. The case transformation
				can be applied to various text blocks (paragraph, heading, or list item)
				by placing the cursor within the block. Alternatively, users can select
				a specific fragment of text they wish to modify. This feature
				enhances the editing workflow by removing the need for manual case
				adjustments.
			</td>
		</tr>
				<tr id="emoji" class="feature">
			<td>
				{@link features/emoji Emoji}
			</td>
			<td>
				The Emoji feature lets you insert emojis into the document from the editor
				toolbar, or on the go while writing the content.
			</td>
		</tr>
		<tr id="find-and-replace" class="feature">
			<td>
				{@link features/find-and-replace Find and replace}
			</td>
			<td>
				The Find and Replace feature in CKEditor 5's Productivity tools
				allows you to search for words or phrases in your document and replace
				them with different text. This function helps speed up editing and
				maintain content consistency.
			</td>
		</tr>
		<tr id="format-painter" class="feature">
			<td>
				{@link features/format-painter Format painter
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>
				The Format Painter feature lets users clone formatting from one section
				and apply it to others within a document. This tool speeds up
				maintaining style consistency across the document. Once initiated,
				Format Painter can continue to apply the copied formatting to multiple
				sections consecutively. This "continuous painting" ensures a
				uniform style is achieved quickly without the need to repeatedly select
				the formatting options for each new section.
			</td>
		</tr>
		<tr id="fullscreen" class="feature">
			<td>
				{@link features/fullscreen Fullscreen mode}
			</td>
			<td>The fullscreen mode lets you temporarily expand the editor to the whole browser viewport, giving you more space to comfortably edit content and use editor's UI features.
			</td>
		</tr>
		<tr id="keyboard-shortcuts" class="feature">
			<td>
				{@link features/accessibility#keyboard-shortcuts Keyboard shortcuts}
			</td>
			<td>
				CKEditor 5 supports various keyboard shortcuts that boost productivity
				and provide necessary accessibility to screen reader users.
			</td>
		</tr>
		<tr id="mathtype" class="feature">
			<td>
				{@link features/math-equations MathType
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
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
		<tr id="merge-fields" class="feature">
			<td>
				{@link features/merge-fields Merge fields
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>
				Merge Fields allows the inclusion of placeholders in your content,
				facilitating the creation of document templates, especially useful for
				email templates and document automation. These placeholders can later be
				replaced with dynamic values by the customer's application,
				enabling tasks like mass email distribution or generation of
				personalized documents.
			</td>
		</tr>
		<tr id="paste-from-google-docs" class="feature">
			<td>
				{@link features/paste-from-google-docs Paste from Google Docs}
			</td>
			<td>
				Paste from Office features let you paste content from Microsoft Word and
				Microsoft Excel and preserve its original structure and formatting. This
				is the basic, open-source Paste from Office feature.
			</td>
		</tr>
		<tr id="paste-from-office" class="feature">
			<td>
				{@link features/paste-from-office Paste from Office}
			</td>
			<td>
				Paste from Office features let you paste content from Microsoft Word and
				Microsoft Excel and preserve its original structure and formatting. This
				is the basic, open-source Paste from Office feature.
			</td>
		</tr>
		<tr id="paste-from-office-enhanced" class="feature">
			<td>
				{@link features/paste-from-office-enhanced Enhanced paste from Office
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>
				The Enhanced paste from Word/Excel feature accurately retains formatting
				and structure when content is pasted from Microsoft Word documents into
				the editor. This includes preserving text styles, lists, tables, and
				layouts. The feature facilitates the transfer of documents from Word to
				CKEditor 5 without compromising on formatting.
			</td>
		</tr>
		<tr id="paste-plain-text" class="feature">
			<td>
				{@link features/paste-plain-text Paste plain text}
			</td>
			<td>
				The Paste as Plain Text feature strips formatting from the pasted text. This feature ensures that text
				pasted into the document adopts the style of the surrounding content, effectively described as "pasting
				without formatting." Additionally, it intelligently converts double-line breaks into paragraphs and
				single-line breaks into soft breaks, aiding in maintaining the structural integrity of the document.
			</td>
		</tr>
		<tr id="slash-commands" class="feature">
			<td>
				{@link features/slash-commands Slash commands
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
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
		<tr id="special-characters" class="feature">
			<td>
				{@link features/special-characters Special characters}
			</td>
			<td>
				Insert a variety of unique symbols and characters into your document
				with CKEditor 5's Special Characters feature. This includes mathematical
				operators, currency symbols, punctuation, graphic symbols like arrows or
				bullets, and Unicode letters that are not typically available on
				standard keyboards, such as umlauts or diacritics. Additionally, the
				feature supports the insertion of emojis. This tool is particularly
				useful for enhancing the detail and accuracy of content that requires
				specialized symbols.
			</td>
		</tr>
		<tr id="templates" class="feature">
			<td>
				{@link features/template Templates
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>
				The Templates feature enables the insertion of predefined content structures
				into documents, ranging from small content pieces, like formatted
				tables, to complete document frameworks, like formal letter templates.
				Templates accelerate the document creation process while ensuring
				adherence to the company's content and document policies.
			</td>
		</tr>
	</tbody>
</table>

## Configurations

Configure CKEditor 5 to your liking. Choose the editor type, modify the toolbar, and select a language from our translated language packs.

<table class="feature-digest">
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr id="editor-placeholder" class="feature">
			<td>
				{@link features/editor-placeholder Editor placeholder}
			</td>
			<td>
				You can prompt the user to input content by displaying a configurable
				placeholder text when the editor is empty. This works similarly to the
				native DOM placeholder attribute used by inputs. Not to be confused with
				content placeholder.
			</td>
		</tr>
		<tr id="editor-ui-types" class="feature">
			<td>
				{@link getting-started/setup/editor-types Editor UI types}
			</td>
			<td>
				The editor's user interface is dependent on the editor types. The editor
				provides functionality through specialized features accessible via a
				configurable toolbar or keyboard shortcuts. Some of these features are
				only available with certain editor types.
			</td>
		</tr>
		<tr id="balloon-block-editor" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link getting-started/setup/editor-types#balloon-editor-and-balloon-block-editor Balloon block editor}
				</span>
			</td>
			<td>
				Balloon block is essentially the balloon editor with an extra block
				toolbar, which can be accessed using the button attached to the editable
				content area and following the selection in the document. The toolbar
				gives access to additional block–level editing features.
			</td>
		</tr>
		<tr id="balloon-editor" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link getting-started/setup/editor-types#balloon-editor-and-balloon-block-editor Balloon block editor}
				</span>
			</td>
			<td>
				Balloon editor is similar to inline editor. The difference between them
				is that the toolbar appears in a balloon next to the selection (when the
				selection is not empty).
			</td>
		</tr>
		<tr id="classic-editor" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link getting-started/setup/editor-types#classic-editor Classic editor}
				</span>
			</td>
			<td>
				Classic editor is what most users traditionally learned to associate
				with a rich-text editor – a toolbar with an editing area placed in a
				specific position on the page, usually as a part of a form that you use
				to submit some content to the server.
			</td>
		</tr>
		<tr id="decoupled-editor" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link getting-started/setup/editor-types#decoupled-editor-document Decoupled editor}
				</span>
			</td>
			<td>
				The document editor focuses on a rich-text editing experience similar to
				large editing packages such as Google Docs or Microsoft Word. It works
				best for creating documents, which are usually later printed or exported
				to PDF files.
			</td>
		</tr>
		<tr id="inline-editor" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link getting-started/setup/editor-types#inline-editor Inline editor}
				</span>
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
		<tr id="multi-root-editor" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link getting-started/setup/editor-types#multi-root-editor Multi-root editor}
				</span>
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
		<tr id="email-editing" class="feature">
			<td>
				{@link features/email Email editing}
			</td>
			<td>
				CKEditor 5 provides a wide variety of tools and functions for editing almost
				any kind of content. This includes a wide array of tools and solutions to make
				email editing easier and more compatible with various email clients.
			</td>
		</tr>
		<tr id="email-configuration-helper" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/email-configuration-helper Email configuration helper}
						<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
						<span class="tree__item__badge__text">Premium feature</span></span>
			</td>
			<td>
				While configuring an email editor looks like a demanding task, the email configuration
				helper plugin is the best way to start and make this experience more manageable.
			</td>
		</tr>
		<tr id="professionally-translated-language-packs" class="feature">
			<td>
				{@link getting-started/setup/ui-language Professionally translated language packs}
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
		<tr id="toolbar-and-menus" class="feature">
			<td>
				{@link getting-started/setup/toolbar Toolbar and menus}
			</td>
			<td>
				The Toolbar Configuration feature provides different toolbar interfaces
				for editing content. The default toolbar includes dropdown menus and
				buttons for various editing functions. The Balloon Toolbar appears when
				text is selected, showing relevant tools. The Block Toolbar is accessed
				by clicking a button on the left-hand side of the editor, providing
				tools for the active block of content. Additionally, the Multiline
				Toolbar option allows for the expansion of the standard toolbar over
				multiple lines to display more tools simultaneously.
			</td>
		</tr>
		<tr id="balloon-toolbar" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link getting-started/setup/toolbar#balloon-toolbar Balloon toolbar}
				</span>
			</td>
			<td>
				A ballon toolbar is a special instance of the main toolbar, available in the balloon and balloon block editor types. Instead of being fixed to the editing area, it pops up when the user selects some content and provides an editing toolset.
			</td>
		</tr>
		<tr id="block-toolbar" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link getting-started/setup/toolbar#block-toolbar Block toolbar}
				</span>
			</td>
			<td>
				The block toolbar provides an additional configurable toolbar on the
				left-hand side of the content area, useful when the main toolbar is not
				accessible (for example in certain layouts, like balloon block editor).
			</td>
		</tr>
		<tr id="classic-toolbar" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link getting-started/setup/toolbar#main-editor-toolbar Classic toolbar}
				</span>
			</td>
			<td>
				The toolbar is the most basic user interface element of CKEditor 5 that
				gives you convenient access to all its features. It has buttons and
				dropdowns that you can use to format, manage, insert, and change
				elements of your content.
			</td>
		</tr>
		<tr id="collapsible-toolbar" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link getting-started/setup/toolbar#extended-toolbar-configuration-format Collapsible toolbar}
				</span>
			</td>
			<td>Collapsible toolbar for UI space efficiency.</td>
		</tr>
		<tr id="image-contextual-toolbar" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/images-overview#image-contextual-toolbar Image contextual toolbar}
				</span>
			</td>
			<td>
				The
				<code>{@link module:image/imagetoolbar~ImageToolbar}</code>
				plugin introduces a contextual toolbar for images. The toolbar appears
				when an image is selected and can be configured to contain any buttons
				you want. Usually, these will be image-related options, such as the
				{@link features/images-text-alternative text alternative}
				button, the
				{@link features/images-captions image caption}
				button, and
				{@link features/images-styles image styles}
				buttons. The toolbar can also host the image editing button introduced
				by the {@link features/ckbox CKBox asset manager}.
				Shown below is an example contextual toolbar with an extended set of buttons.
			</td>
		</tr>
		<tr id="menu-bar" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link getting-started/setup/menubar Menu bar}
				</span>
			</td>
			<td>
				The menu bar is a user interface component that gives you access to all features provided by the editor,
				organized in menus and categories. This familiar experience, popular in large editing desktop and online
				packages, improves the usability of the editor. As the menu bar gathers all the editor features, the
				toolbar can be simple and tidy, providing only the most essential and commonly used features. This is
				especially welcome in heavily-featured editor integrations. For your convenience, the menu bar provides
				a default preset structure based on the plugins loaded in the editor. However, you can arrange it to
				suit your needs, remove unnecessary items, or add menu items related to your custom features.
			</td>
		</tr>
		<tr id="multiline-toolbar" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link getting-started/setup/toolbar#multiline-wrapping-toolbar Multiline toolbar}
				</span>
			</td>
			<td>Multiline toolbar for easy access to all functions.</td>
		</tr>
		<tr id="nesting-toolbars-in-dropdowns" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link getting-started/setup/toolbar#grouping-toolbar-items-in-dropdowns-nested-toolbars Nesting toolbars in dropdowns}
				</span>
			</td>
			<td>Nested toolbars for space efficiency and task-oriented access.</td>
		</tr>
		<tr id="sidebar-annotations-bar" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/annotations-display-mode#wide-sidebar Wide sidebar}
				</span>
			</td>
			<td>
				There are three built-in UIs to display comment threads and suggestion
				annotations: the wide sidebar, the narrow sidebar, and inline balloons.
				You can also display them together in more advanced scenarios where
				various annotation sources (comments, suggestions) are connected to
				different UIs, or even create your own UI for annotations.
			</td>
		</tr>
		<tr id="table-contextual-toolbar" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link features/tables#table-contextual-toolbar Table contextual toolbar}
				</span>
			</td>
			<td>
				The
				<code>{@link module:table/tabletoolbar~TableToolbar}</code>
				plugin introduces a contextual toolbar for the table. The toolbar appears when a table or a cell is
				selected and contains various table-related buttons. These would typically include adding or removing
				columns and rows and merging or splitting cells. If these features are configured, the toolbar will also
				contain buttons for captions and table and cell properties.
			</td>
		</tr>
		<!-- Link & bookmark contextual toolbar coming soon, it's closer than it appears in the mirror -->
		<tr id="watchdog" class="feature">
			<td>
				{@link features/watchdog Watchdog}
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

Make your content accessible to any person or restrict it to specific users.

<table class="feature-digest">
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr id="accessibility-support" class="feature">
			<td>
				{@link features/accessibility Accessibility support}
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
		<tr id="read-only-support" class="feature">
			<td>
				{@link features/read-only Read-only support}
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
		<tr id="restricted-editing" class="feature">
			<td>
				{@link features/restricted-editing Restricted editing}
			</td>
			<td>
				The Restricted Editing feature allows some sections of a document to be
				designated as non-editable while others remain editable. This feature
				supports two modes: the standard editing mode, where all content can be
				edited, and the restricted editing mode, where users can only modify
				parts of the content that are specifically marked as editable. This
				functionality is useful for workflows where one group of users creates
				document templates that include protected sections, and a second group
				fills in editable details such as names, dates, or product names without
				altering the rest of the document.
			</td>
		</tr>
		<tr id="text-part-language" class="feature">
			<td>
				{@link features/language Text Part Language}
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
		<tr id="word-and-character-counter" class="feature">
			<td>
				{@link features/word-count Word and character counter}
			</td>
			<td>
				The Word and Character Count feature provides a real-time tracking tool
				for monitoring the number of words and characters within the editor.
				This functionality assists in managing content length and ensuring it
				meets specific requirements or limits.
			</td>
		</tr>
		<tr id="wproofreader" class="feature">
			<td>
				{@link features/spelling-and-grammar-checking WProofreader
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>
				The Spelling and Grammar Checker is a proofreading tool that supports
				over 80 languages and dialects. It checks spelling and grammar in real
				time and through a separate dialog. Features include spelling
				autocorrect, text autocomplete, and suggestions that appear on hover. Users
				can create custom dictionaries for specific terms related to their brand
				or company. The tool is compliant with WCAG 2.1 and Section 508
				accessibility standards. It also detects sentence-level errors and
				offers context-based correction suggestions.
			</td>
		</tr>
	</tbody>
</table>

## Customization

Customize your editor even further. Use components and helpers from our UI library to create a UI that will match your design system.

<table class="feature-digest">
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr id="editor-sdk" class="feature">
			<td>
				{@link framework/index Editor SDK}<!-- missing in docs -->
			</td>
			<td>
				Select from numerous toolbar styles and over 100 plugins to tailor an
				editor that perfectly fits your requirements, all without needing any
				development expertise. For those looking to go further, the CKEditor API
				enables the creation of custom plugins or modification of the
				editor's functionality. To assist the development process,
				dedicated resources such as a package generator and the CKEditor 5
				Inspector - a comprehensive suite of debugging tools - are provided,
				helping accelerate development work.
			</td>
		</tr>
		<tr id="ckeditor5-inspector" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;{@link framework/development-tools/inspector CKEditor&nbsp;5 inspector}
				</span>
			</td>
			<td>The official CKEditor 5 inspector provides a set of rich debugging tools for editor internals like
				{@link framework/architecture/editing-engine#model model}, {@link
				framework/architecture/editing-engine#view view}, and {@link
				framework/architecture/core-editor-architecture#commands commands}.</td>
		</tr>
		<tr id="cloud-services-rest-api" class="subfeature background-gray">
			<td>
				<span>
					<span class="subfeature-icon"></span>&nbsp;<a href="https://ckeditor.com/docs/cs/latest/developer-resources/apis/overview.html">Cloud Services REST API</a>
				</span>
			</td>
			<td>The CKEditor Cloud Services is a cloud platform that provides editing and real-time collaboration
				services. The platform primarily focuses on providing a backend for the CKEditor 5 features, although
				some features can also be used directly through REST APIs.</td>
		</tr>
		<tr id="themes" class="feature">
			<td>
				{@link framework/theme-customization Themes}
			</td>
			<td>
				The default theme of CKEditor 5 can be customized to match most visual
				integration requirements.
			</td>
		</tr>
		<tr id="ui-library" class="feature">
			<td>
				{@link framework/architecture/ui-library UI Library}
			</td>
			<td>
				The standard UI library of CKEditor 5 is
				<code><a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-ui"
				>@ckeditor/ckeditor5-ui</a
				></code>. It provides base classes and helpers that allow for building a
				modular UI that seamlessly integrates with other components of the
				ecosystem.
			</td>
		</tr>
	</tbody>
</table>

## File management

Upload and manage your files using file management features. Take advantage of CKBox, our file management solution, or create your own using an adapter.

<table class="feature-digest">
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr id="base64-upload-adapter" class="feature">
			<td>
				{@link features/base64-upload-adapter Base64 Upload Adapter}
			</td>
			<td>
				Convert inserted images into Base64-encoded strings in the editor
				output. Images are stored with other content in the database without
				server-side processing.
			</td>
		</tr>
		<tr id="ckbox" class="feature">
			<td>
				{@link features/ckbox CKBox
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>
				Securely upload, store, edit, and utilize your images and files in CKEditor 5. Simplify media discovery
				in your uploads with the media browser alongside an intuitive Image Editor for image adjustments.
				Designed to facilitate organization, CKBox enables integrations, maintains permissions, and uses
				Workspaces to categorize files according to the user, document, or customer. It guarantees fast loading
				and optimal display of your images across devices through an efficient CDN. Deployable on-premises or as
				cloud SaaS.
			</td>
		</tr>
		<tr id="ckfinder" class="feature">
			<td>
				{@link features/ckfinder CKFinder
					<span class="tree__item__badge tree__item__badge_premium" data-badge-tooltip="Premium feature">
					<span class="tree__item__badge__text">Premium feature</span></span>
				}
			</td>
			<td>
				The CKFinder feature lets you insert images and links to files into your
				content. CKFinder is a powerful file manager with various image editing
				and image upload options.
			</td>
		</tr>
		<tr id="custom-upload-adapter" class="feature">
			<td>
				{@link features/image-upload#implementing-your-own-upload-adapter Custom Upload Adapter}
			</td>
			<td>
				Have your own file management solution? Use this adapter to integrate
				your preferred software with CKEditor.
			</td>
		</tr>
		<tr id="simple-upload-adapter" class="feature">
			<td>
				{@link features/simple-upload-adapter Simple Upload Adapter}
			</td>
			<td>
				Upload images to your server using the <code>XMLHttpRequest</code> API with a
				minimal editor configuration.
			</td>
		</tr>
		<tr id="uploadcare" class="feature">
			<td>
				<a href="https://uploadcare.com/">Uploadcare<span class="tree__item__badge tree__item__badge_premium"
						data-badge-tooltip="Premium feature"><span class="tree__item__badge__text">Premium
							feature</span></span></a><!-- missing in docs -->
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
	</tbody>
</table>

{@snippet features/feature-digest}
