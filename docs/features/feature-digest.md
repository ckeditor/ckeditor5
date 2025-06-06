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

### Advanced HTML Editing

Advanced HTML Editing provides general HTML support, offering detailed control over permissible HTML elements, attributes, and styles. It further allows HTML Source Code Editing, handling HTML elements, HTML comments, and editing of the full page content, including meta tags.

<ck:columns>
	<ck:card>
		<ck:card-title level='4'>
			Full page HTML
		</ck:card-title>
		<ck:card-description>
			Thanks to the full page HTML feature, you can use CKEditor 5 to edit entire HTML pages (from `<html>` to `</html>`), including the page metadata. While the General HTML Support feature focuses on elements inside the content (the document's `<body>`), this feature enables markup invisible to the end user.

			<ck:button-link size='sm' variant='secondary' href='features/full-page-html'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			General HTML Support (GHS)
		</ck:card-title>
		<ck:card-description>
			With the General HTML Support (GHS) feature, developers can enable HTML features that are not supported by any other dedicated CKEditor 5 plugins. GHS lets you add elements, attributes, classes, and styles to the source. It also ensures this markup stays in the editor window and the output.

			<ck:button-link size='sm' variant='secondary' href='features/general-html-support'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			HTML comment
		</ck:card-title>
		<ck:card-description>
			By default, the editor filters out all HTML comments on initialization. The HTML comment feature lets developers keep HTML comments in the document without displaying them to the user.

			<ck:button-link size='sm' variant='secondary' href='features/html-comments'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			HTML embed
		</ck:card-title>
		<ck:card-description>
			The HTML embed feature lets you embed any HTML snippet in your content. The feature is meant for more advanced users who want to directly interact with HTML fragments.

			<ck:button-link size='sm' variant='secondary' href='features/html-embed'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Show blocks
		</ck:card-title>
		<ck:card-description>
			The show blocks feature allows the content creators to visualize all block-level elements (except for widgets). It surrounds them with an outline and displays their element name in the top-left corner of the box.

			<ck:button-link size='sm' variant='secondary' href='features/show-blocks'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Source code editing
		</ck:card-title>
		<ck:card-description>
			The source editing feature lets you view and edit the source of your document.

			<ck:button-link size='sm' variant='secondary' href='features/source-editing'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Enhanced source code editing
		</ck:card-title>
		<ck:card-description>
			Enhanced source code editing allows for viewing and editing the source code of the document in a handy modal window (compatible with all editor types) with syntax highlighting, autocompletion and more.

			<ck:button-link size='sm' variant='secondary' href='features/enhanced-source-editing'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>
</ck:columns>

### Block formatting

Block Formatting allows for the organization and emphasis of content through the use of Headings, Style Headings, Block Quotes, and Horizontal Lines. Users can select from different levels of headings to outline sections and subsections, apply various styles to these headings for visual hierarchy, insert horizontal lines to delineate sections, and use block quotes to highlight excerpts or important passages.

<ck:columns>
	<ck:card>
		<ck:card-title level='4'>
			Block quote
		</ck:card-title>
		<ck:card-description>
			The block quote feature lets you easily include block quotations or pull quotes in your content. It is also an attractive way to draw the readers' attention to selected parts of the text.

			<ck:button-link size='sm' variant='secondary' href='features/block-quote'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Headings/paragraph
		</ck:card-title>
		<ck:card-description>
			The heading feature helps you structure your document by adding headings to parts of the text. They make your content easier to scan by both readers and search engines.

			<ck:button-link size='sm' variant='secondary' href='features/headings'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Horizontal line
		</ck:card-title>
		<ck:card-description>
			The horizontal line feature lets you visually divide your content into sections by inserting horizontal lines (also known as horizontal rules). It is an easy way to organize the content or indicate a change of topic.

			<ck:button-link size='sm' variant='secondary' href='features/horizontal-line'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Block indentation
		</ck:card-title>
		<ck:card-description>
			The block indentation feature lets you set indentation for text blocks such as paragraphs, headings, or lists. This way you can visually distinguish parts of your content.

			<ck:button-link size='sm' variant='secondary' href='features/indent'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>
</ck:columns>

### Bookmarks

The bookmarks feature allows for adding and managing the bookmarks anchors attached to the content of the editor. These provide fast access to important content sections, and speed up the navigation boosting efficiency.

<ck:button-link size='sm' variant='secondary' href='features/bookmarks'>
	Feature page
</ck:button-link>

### Clipboard

Copy, cut, and paste content within the editor or from external sources.

<ck:button-link size='sm' variant='secondary' href='framework/deep-dive/clipboard'>
	Feature page
</ck:button-link>

### Code blocks

Supports the insertion and management of pre-formatted code snippets with distinct styling.

<ck:button-link size='sm' variant='secondary' href='features/code-blocks'>
	Feature page
</ck:button-link>

### Drag and drop

Rearrange elements within a document, including moving text blocks, images, or other content types.

<ck:button-link size='sm' variant='secondary' href='features/drag-drop'>
	Feature page
</ck:button-link>

### Font formatting

The font feature lets you change font family, size, and color (including background color). All of these options are configurable.

<ck:columns>
	<ck:card>
		<ck:card-title level='4'>
			Font background color
		</ck:card-title>
		<ck:card-description>
			Effortlessly make the words stand out even more with a colored background.

			<ck:button-link size='sm' variant='secondary' href='features/font#configuring-the-font-color-and-font-background-color-features'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Font color
		</ck:card-title>
		<ck:card-description>
			Effortlessly make the letters stand out with their own color.

			<ck:button-link size='sm' variant='secondary' href='features/font#configuring-the-font-color-and-font-background-color-features'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Font family
		</ck:card-title>
		<ck:card-description>
			Choose from a predefined set of fonts, depending on the type of content and its destination - print, screen, etc.

			<ck:button-link size='sm' variant='secondary' href='features/font#configuring-the-font-family-feature'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Font size
		</ck:card-title>
		<ck:card-description>
			Easily control the size of the letters.

			<ck:button-link size='sm' variant='secondary' href='features/font#configuring-the-font-size-feature'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>
</ck:columns>

### Image

The image feature allows adding images of various kinds to the rich content inside the editor. A large set of subfeatures lets the users fully control this process. Upload or paste images, insert via URL, use responsive images, resize images, add captions, set different image styles, and link images.

<ck:columns>
	<ck:card>
		<ck:card-title level='4'>
			Image alt text
		</ck:card-title>
		<ck:card-description>
			Add description text, AKA alternative text, for images. Alt text improves accessibility by telling screen readers and search engines what the image depicts.

			<ck:button-link size='sm' variant='secondary' href='features/images-text-alternative'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Image captions
		</ck:card-title>
		<ck:card-description>
			Add optional captions for images, which are shown below the picture.

			<ck:button-link size='sm' variant='secondary' href='features/images-captions'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Image insert via URL
		</ck:card-title>
		<ck:card-description>
			You can insert images by uploading them directly from your disk, but you can also configure CKEditor 5 to let you insert images using URLs. This way, you can save time by adding images that are already online.

			<ck:button-link size='sm' variant='secondary' href='features/images-inserting'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Image linking
		</ck:card-title>
		<ck:card-description>
			The LinkImage plugin lets you use images as links.

			<ck:button-link size='sm' variant='secondary' href='features/images-linking'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Image resize
		</ck:card-title>
		<ck:card-description>
			The image resize feature lets you change the width of images in your content. It is implemented by the ImageResize plugin.

			<ck:button-link size='sm' variant='secondary' href='features/images-resizing'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Image styles
		</ck:card-title>
		<ck:card-description>
			The image styles feature lets you adjust the appearance of images. It works by applying CSS classes to images or changing their type from inline to block or vice versa.

			<ck:button-link size='sm' variant='secondary' href='features/images-styles'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Image upload
		</ck:card-title>
		<ck:card-description>
			Inserting images into content created with CKEditor 5 is quite a common task. In a properly configured rich-text editor, there are several ways for the end user to insert images.

			<ck:button-link size='sm' variant='secondary' href='features/image-upload'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Responsive images
		</ck:card-title>
		<ck:card-description>
			The ability to have responsive images in the rich-text editor content is a great modern feature provided by the CKBox asset manager. With a single image upload, several optimized versions of that image are created, each for a different size of the display. The CKBox feature produces a `<picture>` element with a set of optimized images. The browser will automatically load the image with the dimensions most suitable for the presented page resolution, which makes the image load much faster and saves bandwidth.

			<ck:button-link size='sm' variant='secondary' href='features/images-responsive'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>
</ck:columns>

### Links

Facilitates the addition of hyperlinks to text, automatically converting typed or pasted URLs into clickable links, and allowing manual insertion and editing of links.

<ck:button-link size='sm' variant='secondary' href='features/link'>
	Feature page
</ck:button-link>

### Lists

Lists allow the creation and management of various list types, including to-do lists, bulleted and numbered lists, with additional customization options such as list styles, setting the start number for lists, creating reversed lists, adjusting list indentation, and crafting nested lists.

<ck:columns>
	<ck:card>
		<ck:card-title level='4'>
			List indentation
		</ck:card-title>
		<ck:card-description>
			Besides controlling text block indentation, the indent and outdent buttons allow for indenting list items (nesting them).

			<ck:button-link size='sm' variant='secondary' href='features/lists-editing#indenting-lists'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			List start index
		</ck:card-title>
		<ck:card-description>
			The list start index feature allows the user to choose the starting point of an ordered list. By default, this would be 1 (or A, or I – see the list styles section). Sometimes, you may want to start a list with some other digit or letter, though.

			<ck:button-link size='sm' variant='secondary' href='features/lists#list-start-index'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			List styles
		</ck:card-title>
		<ck:card-description>
			The list style feature introduces more styles for the list item markers. When enabled, it adds 3 styles for unordered lists and 6 styles for ordered lists to choose from. The user will be able to set or change the list style via the dropdown.

			<ck:button-link size='sm' variant='secondary' href='features/lists#list-styles'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Multi-level lists
		</ck:card-title>
		<ck:card-description>
			Multi-level lists with the legal style numbering feature allows for easy creation and modification of numbered lists with counters (1, 1.1, 1.1.1). These are crucial for clear referencing and hierarchical organization in complex documents. The feature offers full compatibility with Microsoft Word.

			<ck:button-link size='sm' variant='secondary' href='features/multi-level-lists'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Nested lists
		</ck:card-title>
		<ck:card-description>
			Besides controlling text block indentation, the indent and outdent buttons allow for indenting list items (nesting them).

			<ck:button-link size='sm' variant='secondary' href='features/lists-editing#indenting-lists'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Ordered lists
		</ck:card-title>
		<ck:card-description>
			The list feature lets you create ordered (numbered) lists. The unique thing about them is that you can put any content inside each list item (including block elements like paragraphs and tables), retaining the continuity of numbering and indentation. You can also easily control the list markers type.

			<ck:button-link size='sm' variant='secondary' href='features/lists'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Reversed list
		</ck:card-title>
		<ck:card-description>
			The reversed list feature lets the user reverse the numbering order of a list, changing it from ascending to descending. This is useful in countdowns and things-to-do lists that need to reproduce steps in a reversed order (for example, in disassembly instructions).

			<ck:button-link size='sm' variant='secondary' href='features/lists#reversed-list'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			To-do lists
		</ck:card-title>
		<ck:card-description>
			The to-do list feature lets you create a list of interactive checkboxes with labels. It supports all features of bulleted and numbered lists, so you can nest a to-do list together with any combination of other lists.

			<ck:button-link size='sm' variant='secondary' href='features/todo-lists'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Unordered lists
		</ck:card-title>
		<ck:card-description>
			The list feature lets you create unordered (bulleted) lists. The unique thing about them is that you can put any content inside each list item (including block elements like paragraphs and tables), retaining the continuity of numbering and indentation. You can also easily control the list markers' shape.

			<ck:button-link size='sm' variant='secondary' href='features/lists'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>
</ck:columns>

### Mermaid

You can create flowcharts and diagrams in CKEditor 5 thanks to the experimental integration with the Mermaid library. Mermaid uses a Markdown-inspired syntax to create and dynamically modify flowcharts, Gantt diagrams, pie or quadrant charts, graphs, mindmaps, and more.

<ck:button-link size='sm' variant='secondary' href='features/mermaid'>
	Feature page
</ck:button-link>

### Remove formatting

The remove format feature lets you quickly remove any text formatting applied using inline HTML elements and CSS styles, like basic text styles (bold, italic) or font family, size, and color. This feature does not remove block-level formatting (headings, images) or semantic data (links).

<ck:button-link size='sm' variant='secondary' href='features/remove-format'>
	Feature page
</ck:button-link>

### Select all

Enables the selection of all content within the editor with a single command or shortcut.

<ck:button-link size='sm' variant='secondary' href='features/select-all'>
	Feature page
</ck:button-link>

### Tables

CKEditor 5 provides robust support for tables, with the ability to merge and split cells, resize columns, style tables and individual cells, insert and delete columns and rows, as well as create nested tables for complex data presentation.

<ck:columns>
	<ck:card>
		<ck:card-title level='4'>
			Columns resizing
		</ck:card-title>
		<ck:card-description>
			The TableColumnResize plugin lets you resize tables and individual table columns. It gives you complete control over column width.

			<ck:button-link size='sm' variant='secondary' href='features/tables-resize'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Insert/delete columns & rows
		</ck:card-title>
		<ck:card-description>
			The basic table features allow users to insert tables into content, add or remove columns and rows and merge or split cells.

			<ck:button-link size='sm' variant='secondary' href='features/tables#table-contextual-toolbar'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Merge & split cells
		</ck:card-title>
		<ck:card-description>
			The basic table features allow users to insert tables into content, add or remove columns and rows, and merge or split cells.

			<ck:button-link size='sm' variant='secondary' href='features/tables#table-contextual-toolbar'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Nesting
		</ck:card-title>
		<ck:card-description>
			CKEditor 5 allows nesting tables inside other table's cells. This may be used for creating advanced charts or layouts based on tables. The nested table can be formatted just like a regular one.

			<ck:button-link size='sm' variant='secondary' href='features/tables#nesting-tables'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Styling tables & cells
		</ck:card-title>
		<ck:card-description>
			CKEditor 5 comes with some additional tools that help you change the look of tables and table cells. You can control border color and style, background color, padding, or text alignment.

			<ck:button-link size='sm' variant='secondary' href='features/tables-styling'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Table headers
		</ck:card-title>
		<ck:card-description>
			To make every inserted table have n number of rows and columns as table headers by default, set an optional table configuration property defaultHeadings.

			<ck:button-link size='sm' variant='secondary' href='features/tables#default-table-headers'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Table selection
		</ck:card-title>
		<ck:card-description>
			The TableSelection plugin introduces support for the custom selection system for tables that lets you:• Select an arbitrary rectangular table fragment – a few cells from different rows, a column (or a few of them) or a row (or multiple rows).• Apply formatting or add a link to all selected cells at once. The table selection plugin is loaded automatically by the Table plugin.

			<ck:button-link size='sm' variant='secondary' href='features/tables#table-selection'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Table caption
		</ck:card-title>
		<ck:card-description>
			The TableCaption plugin lets you add captions to your tables. Table captions also improve accessibility as they are recognized by screen readers.

			<ck:button-link size='sm' variant='secondary' href='features/tables-caption'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Layout tables
		</ck:card-title>
		<ck:card-description>
			The TableLayout plugin is used to structure web page content spatially rather than for presenting tabular data. It lets integrators create multi-column designs and precise positioning of elements on a page.

			<ck:button-link size='sm' variant='secondary' href='features/tables-caption'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>
</ck:columns>

### Text alignment

Allows the adjustment of text alignment to the left, right, center, or justify and permits the alteration of indentation.

<ck:button-link size='sm' variant='secondary' href='features/text-alignment'>
	Feature page
</ck:button-link>


### Text formatting

CKEditor 5 provides developers with text editing and formatting features such as Bold, Italic, Underline, Strikethrough, Subscript, Superscript, Inline Code, Highlight, and Font Styles. These features allow users to style and present their content as needed. This ensures users can style their text to improve readability, match branding guidelines, or highlight important content sections.

<ck:columns>
	<ck:card>
		<ck:card-title level='4'>
			Bold
		</ck:card-title>
		<ck:card-description>
			Making the letters look like the good time were never gone.

			<ck:button-link size='sm' variant='secondary' href='features/basic-styles'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Code
		</ck:card-title>
		<ck:card-description>
			Snippet look like a terminal from the 1990s movie.

			<ck:button-link size='sm' variant='secondary' href='features/basic-styles'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Highlight
		</ck:card-title>
		<ck:card-description>
			Highlight makes important content stand out, either with font color or background fill.

			<ck:button-link size='sm' variant='secondary' href='features/highlight'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Italic
		</ck:card-title>
		<ck:card-description>
			Making the letters look like seashore pines.

			<ck:button-link size='sm' variant='secondary' href='features/basic-styles'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Strikethrough
		</ck:card-title>
		<ck:card-description>
			Never mind, will not need it anymore.

			<ck:button-link size='sm' variant='secondary' href='features/basic-styles'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Styles
		</ck:card-title>
		<ck:card-description>
			The styles feature lets you easily apply predefined styles available for block and inline content.

			<ck:button-link size='sm' variant='secondary' href='features/style'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Subscript
		</ck:card-title>
		<ck:card-description>
			Fine print at the bottom, like atom numbers.

			<ck:button-link size='sm' variant='secondary' href='features/basic-styles'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Superscript
		</ck:card-title>
		<ck:card-description>
			Fine print on top, like references in a book.

			<ck:button-link size='sm' variant='secondary' href='features/basic-styles'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Underline
		</ck:card-title>
		<ck:card-description>
			Stuff looks important, yo. Or like a link, too.

			<ck:button-link size='sm' variant='secondary' href='features/basic-styles'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>
</ck:columns>

### Undo/redo

Backtrack or repeat actions for editing purposes.

<ck:button-link size='sm' variant='secondary' href='features/undo-redo'>
	Feature page
</ck:button-link>

## Collaboration

Collaborate with others - real-time or asynchronously. Comment, co-author, and mention team members in your documents. With collaboration features review process should be a breeze.

### Asynchronous collaboration

Asynchronous Collaboration in CKEditor 5 is designed for teams using a turn-based approach to collaboratively write, review, and discuss content within the application. It integrates Track Changes, Comments, and Revision History features to facilitate collaboration.

<ck:card>
	<ck:card-title level='4'>
		Local data storage
	</ck:card-title>
	<ck:card-description>
		In asynchronous collaboration, data is maintained on the client's servers.

		<ck:button-link size='sm' variant='secondary' href='features/collaboration'>
			Feature page
		</ck:button-link>
	</ck:card-description>
</ck:card>

### Comments

Users can add side notes to marked fragments of the document, including text and block elements such as images. It also allows the users to discuss in threads and remove comments when they finish the discussion.

<ck:columns>
	<ck:card>
		<ck:card-title level='4'>
			Comments archive
		</ck:card-title>
		<ck:card-description>
			Comments threads can be either deleted or resolved. The latter provides a way to archive comments that are no longer relevant, reducing clutter and making it easier to focus on the most important feedback. Users can access the comments archive from the toolbar and use it to view and restore archived comments if necessary. It helps to simplify the feedback management process.

			<ck:button-link size='sm' variant='secondary' href='features/comments'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Comments outside editor
		</ck:card-title>
		<ck:card-description>
			The comments feature API, together with Context, lets you create deeper integrations with your application. One such integration is enabling comments on non-editor form fields.

			<ck:button-link size='sm' variant='secondary' href='features/comments-outside-editor'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Sidebar modes
		</ck:card-title>
		<ck:card-description>
			There are three built-in UIs to display comment threads and suggestion annotations: the wide sidebar, the narrow sidebar, and inline balloons. You can also display them together in more advanced scenarios where various annotation sources (comments, suggestions) are connected to different UIs or even create your UI for annotations.

			<ck:button-link size='sm' variant='secondary' href='features/annotations-display-mode'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>
</ck:columns>

### Mentions

The mention feature supports smart autocompletion triggered by user input. Typing a predetermined marker, like @ or #, prompts a panel to appear, offering autocomplete suggestions.

<ck:button-link size='sm' variant='secondary' href='features/mentions'>
	Feature page
</ck:button-link>

### Real-time collaboration

Real-Time Collaboration in CKEditor 5 is designed for users who are writing, reviewing, and commenting on content simultaneously. It also automatically solves all conflicts if users make changes at the same time.

<ck:columns>
	<ck:card>
		<ck:card-title level='4'>
			Co-authoring
		</ck:card-title>
		<ck:card-description>
			Multiple user real-time editing and content creation feature.

			<ck:button-link size='sm' variant='secondary' href='features/users-in-real-time-collaboration'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			On-premises
		</ck:card-title>
		<ck:card-description>
			On-premises real-time collaboration version to deploy to client's own infrastructure, includes a private cloud.

			<ck:button-link size='sm' variant='secondary' href='@cs'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			SaaS
		</ck:card-title>
		<ck:card-description>
			Real-time collaboration provided as a service by CKSource.

			<ck:button-link size='sm' variant='secondary' href='@cs'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>
</ck:columns>

### Revision history

The revision history feature is a document versioning tool. It allows CKEditor 5 users to create and view the chronological revision history of their content. These versions are listed in the side panel. The preview mode allows for easy viewing of content development between revisions. You can rename, compare, and restore older revisions on the go.

<ck:button-link size='sm' variant='secondary' href='features/revision-history'>
	Feature page
</ck:button-link>

### Track changes

The track changes feature brings automatic suggestion marking for the document as you change it. When editing the document, the user can switch to the track changes mode. All their changes will then create suggestions that they can accept or discard.

<ck:button-link size='sm' variant='secondary' href='features/track-changes'>
	Feature page
</ck:button-link>

### Users list and permissions

The Users plugin and related plugins let you manage user data and permissions. This is essential when many users are working on the same document.

<ck:button-link size='sm' variant='secondary' href='features/users'>
	Feature page
</ck:button-link>

## Content conversion & embedding

Collaborate also regarding different formats. With content conversions, you can integrate content across commonly used business formats. You can also enrich your content with media embeds.

### Content generation

CKEditor 5 may be your universal starting point for generating content in several recognizable formats.

<ck:columns>
	<ck:card>
		<ck:card-title level='4'>
			Export to PDF
		</ck:card-title>
		<ck:card-description>
			Create a PDF from in-editor content seamlessly. Customize headers and footers, include page breaks, embed images, and choose from various fonts.

			<ck:button-link size='sm' variant='secondary' href='features/export-pdf'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Export to Word
		</ck:card-title>
		<ck:card-description>
			Instantly convert content from the editor to a Word document with a single click, maintaining its appearance and formatting. The final document includes suggestions, comments, page breaks, and embedded images.

			<ck:button-link size='sm' variant='secondary' href='features/export-word'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Import from Word
		</ck:card-title>
		<ck:card-description>
			Effortlessly transform Word documents into clean HTML within CKEditor 5 while retaining the original styling, as well as comments and change tracking annotations.

			<ck:button-link size='sm' variant='secondary' href='features/import-word'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>
</ck:columns>

### Export with inline styles

The ExportInlineStyles plugin applies the styles defined by CSS style sheets directly on HTML elements.

<ck:button-link size='sm' variant='secondary' href='features/export-with-inline-styles'>
	Feature page
</ck:button-link>

### Markdown output

Enable Markdown as the default output format instead of HTML with the Markdown plugin. Combined with Autoformatting, CKEditor becomes an efficient Markdown editor, allowing the creation of text documents using the simplified formatting syntax favored by developers.

<ck:button-link size='sm' variant='secondary' href='features/markdown'>
	Feature page
</ck:button-link>

### Media embed

Use the insert media button in the toolbar to embed media. Pasting a media URL directly into the editor content automatically embeds the media.

<ck:button-link size='sm' variant='secondary' href='features/media-embed'>
	Feature page
</ck:button-link>

### Paste Markdown

The paste Markdown feature lets users paste Markdown-formatted content straight into the editor. It will be then converted into rich text on the fly.

<ck:button-link size='sm' variant='secondary' href='features/paste-markdown'>
	Feature page
</ck:button-link>

### XML output

Turn your content into parsable XML files for automation and cross-platform interoperability.

<ck:button-link size='sm' variant='secondary' href='module:engine/dataprocessor/xmldataprocessor~XmlDataProcessor'>
	Feature page
</ck:button-link>

## Page management

Format, organize, and navigate your documents easily with page management features. Create a table of contents, insert page breaks, and manage pagination.

### Document outline

The Document Outline feature automatically detects and lists document headings in a sidebar, enabling faster navigation through large documents. Headings are organized in a structured list, so users can click and jump to different sections quickly. This feature also allows for customization of the outline's location within the user interface, catering to different user preferences for workspace layout.

<ck:button-link size='sm' variant='secondary' href='features/document-outline'>
	Feature page
</ck:button-link>

### Page utilities

CKEditor 5 Page Utilities enables users to dictate the structuring and print formatting of their documents effectively.

<ck:columns>
	<ck:card>
		<ck:card-title level='4'>
			Content minimap
		</ck:card-title>
		<ck:card-description>
			Offers a concise, birds-eye view of the document's content, allowing for quick navigation and content management.

			<ck:button-link size='sm' variant='secondary' href='features/minimap'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Document title
		</ck:card-title>
		<ck:card-description>
			Allows users to set and modify the document's title within the editing interface, ensuring accurate reflection of the contents.

			<ck:button-link size='sm' variant='secondary' href='features/title'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Page break
		</ck:card-title>
		<ck:card-description>
			Facilitates the insertion of manual breaks within the document, enabling the definition of page endings and beginnings for optimal layout and print clarity.

			<ck:button-link size='sm' variant='secondary' href='features/page-break'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>
</ck:columns>

### Pagination

The Pagination feature visually indicates where pages begin and end within a document. This feature is designed to assist users in preparing their documents for printing or export to various document formats, ensuring that the transition between pages is seamless and accurately reflected in the final output. Users may adjust content distribution across pages as they like, ensuring well-organized documents with presented content, whether in digital form or print. By providing a clear view of how text and elements will appear page-by-page, Pagination aids in the creation of professional and polished documents.

<ck:button-link size='sm' variant='secondary' href='features/pagination'>
	Feature page
</ck:button-link>

### Table of contents

The Table of Contents feature is a dynamic tool for organizing documents. It allows for the insertion of a linked table of contents that automatically updates in real time as the document's content changes. This means changes made to headings or structured sections within the document are reflected immediately in the table of contents, accurately representing the document structure.

<ck:button-link size='sm' variant='secondary' href='features/table-of-contents'>
	Feature page
</ck:button-link>

## Productivity

Speed up the content creation process with dedicated productivity utilities. Autoformat your content as you write (or paste from other editors) or even delegate some tasks to an AI Assistant.

### AI Assistant

The AI Assistant feature enhances editing efficiency and creativity with artificial intelligence capabilities. It allows users to generate new content and process data through custom queries or utilize a set of predefined commands that are also customizable. The feature supports integration with multiple AI API providers: OpenAI, Azure OpenAI, and Amazon Bedrock. You can also integrate it with custom models.

<ck:button-link size='sm' variant='secondary' href='features/ai-assistant-overview'>
	Feature page
</ck:button-link>

### Automation

Automate your workflow with CKEditor 5 automation tools, regardless of whether you write, link, or save!

<ck:columns>
	<ck:card>
		<ck:card-title level='4'>
			Autoformatting
		</ck:card-title>
		<ck:card-description>
			Use Autoformatting to get Markdown-like shortcodes for quick formatting without needing to navigate through toolbar buttons or dropdown menus. This feature caters to the most common formatting needs.

			<ck:button-link size='sm' variant='secondary' href='features/autoformat'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Autolink
		</ck:card-title>
		<ck:card-description>
			With Autolink, typing or pasting URLs and email addresses automatically transforms them into clickable links. This functionality is enabled by default, ensuring that links are always ready to use.

			<ck:button-link size='sm' variant='secondary' href='features/link#autolink-feature'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Automatic text transformations
		</ck:card-title>
		<ck:card-description>
			The Automatic Text Transformation autocorrects or transforms predefined text fragments into their designated forms. It comes with a range of popular text transformations pre-configured, and accepts customization by adding or removing autocorrect entries. It is commonly used to automate the expansion of abbreviations or short phrases into their full forms.

			<ck:button-link size='sm' variant='secondary' href='features/text-transformation'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Autosave
		</ck:card-title>
		<ck:card-description>
			The Autosave feature guarantees that your work is never lost. It automatically saves changes - for instance, when content is modified. This could involve sending the latest version of the document to the server, providing peace of mind through continuous backup.

			<ck:button-link size='sm' variant='secondary' href='features/autosave'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>
</ck:columns>

### Case change

The Case Change feature simplifies adjusting text cases within a document. With just a single click, users can shift text between UPPERCASE, lowercase, and Title Case options. The case transformation can be applied to various text blocks (paragraph, heading, or list item) by placing the cursor within the block. Alternatively, users can select a specific fragment of text they wish to modify. This feature enhances the editing workflow by removing the need for manual case adjustments.

<ck:button-link size='sm' variant='secondary' href='features/case-change'>
	Feature page
</ck:button-link>

### Emoji

The Emoji feature lets you insert emojis into the document from the editor toolbar, or on the go while writing the content.

<ck:button-link size='sm' variant='secondary' href='features/emoji'>
	Feature page
</ck:button-link>

### Find and replace

The Find and Replace feature in CKEditor 5's Productivity tools allows you to search for words or phrases in your document and replace them with different text. This function helps speed up editing and maintain content consistency.

<ck:button-link size='sm' variant='secondary' href='features/find-and-replace'>
	Feature page
</ck:button-link>

### Format painter

The Format Painter feature lets users clone formatting from one section and apply it to others within a document. This tool speeds up maintaining style consistency across the document. Once initiated, Format Painter can continue to apply the copied formatting to multiple sections consecutively. This "continuous painting" ensures a uniform style is achieved quickly without the need to repeatedly select the formatting options for each new section.

<ck:button-link size='sm' variant='secondary' href='features/format-painter'>
	Feature page
</ck:button-link>

### Fullscreen mode

The fullscreen mode lets you temporarily expand the editor to the whole browser viewport, giving you more space to comfortably edit content and use editor's UI features.

<ck:button-link size='sm' variant='secondary' href='features/fullscreen'>
	Feature page
</ck:button-link>

### Keyboard shortcuts

CKEditor 5 supports various keyboard shortcuts that boost productivity and provide necessary accessibility to screen reader users.

<ck:button-link size='sm' variant='secondary' href='features/accessibility#keyboard-shortcuts'>
	Feature page
</ck:button-link>

### MathType

Math Equations allows you to add properly formatted mathematical notation and chemical formulas to your documents. This feature supports the inclusion of math equations, which can be handwritten on a tablet and automatically converted into well-formed digital text. It also offers simple numbering of equations and the ability to customize with various fonts and colors, enhancing readability and presentation in your content.

<ck:button-link size='sm' variant='secondary' href='features/math-equations'>
	Feature page
</ck:button-link>

### Merge fields

Merge Fields allows the inclusion of placeholders in your content, facilitating the creation of document templates, especially useful for email templates and document automation. These placeholders can later be replaced with dynamic values by the customer's application, enabling tasks like mass email distribution or generation of personalized documents.

<ck:button-link size='sm' variant='secondary' href='features/merge-fields'>
	Feature page
</ck:button-link>

### Paste from Google Docs

Paste from Google Docs allows you to paste content from Google Docs and preserve its original structure and formatting.

<ck:button-link size='sm' variant='secondary' href='features/paste-from-google-docs'>
	Feature page
</ck:button-link>

### Paste from Office

Paste from Office features let you paste content from Microsoft Word and Microsoft Excel and preserve its original structure and formatting. This is the basic, open-source Paste from Office feature.

<ck:button-link size='sm' variant='secondary' href='features/paste-from-office'>
	Feature page
</ck:button-link>

### Enhanced paste from Office

The Enhanced Paste from Word/Excel feature accurately retains formatting and structure when content is pasted from Microsoft Word documents into the editor. This includes preserving text styles, lists, tables, and layouts. The feature facilitates the transfer of documents from Word to CKEditor 5 without compromising on formatting.

<ck:button-link size='sm' variant='secondary' href='features/paste-from-office-enhanced'>
	Feature page
</ck:button-link>

### Paste plain text

The Paste as Plain Text feature strips formatting from the pasted text. This feature ensures that text pasted into the document adopts the style of the surrounding content, effectively described as "pasting without formatting." Additionally, it intelligently converts double-line breaks into paragraphs and single-line breaks into soft breaks, aiding in maintaining the structural integrity of the document.

<ck:button-link size='sm' variant='secondary' href='features/paste-plain-text'>
	Feature page
</ck:button-link>

### Slash commands

The Slash Commands feature lets users insert block elements and apply styles using just the keyboard. By pressing the / key, a panel with suggested commands appears, enabling quick and mouse-free actions. Users can filter through these commands by typing additional phrases after the /, making it easier to find specific commands. Additionally, the option to customize personal commands is available, allowing for a tailored editing experience.

<ck:button-link size='sm' variant='secondary' href='features/slash-commands'>
	Feature page
</ck:button-link>

### Special characters

The Special Characters feature lets you insert a variety of unique symbols and characters into your document. This includes mathematical operators, currency symbols, punctuation, graphic symbols like arrows or bullets, and Unicode letters that are not typically available on standard keyboards, such as umlauts or diacritics. Additionally, the feature supports the insertion of emojis. This tool is particularly useful for enhancing the detail and accuracy of content that requires specialized symbols.

<ck:button-link size='sm' variant='secondary' href='features/special-characters'>
	Feature page
</ck:button-link>

### Templates

The Templates feature enables the insertion of predefined content structures into documents, ranging from small content pieces, like formatted tables, to complete document frameworks, like formal letter templates. Templates accelerate the document creation process while ensuring adherence to the company's content and document policies.

<ck:button-link size='sm' variant='secondary' href='features/template'>
	Feature page
</ck:button-link>

## Configurations

Configure CKEditor 5 to your liking. Choose the editor type, modify the toolbar, and select a language from our translated language packs.

### Editor placeholder

You can prompt the user to input content by displaying a configurable placeholder text when the editor is empty. This works similarly to the native DOM placeholder attribute used by inputs. Not to be confused with content placeholder.

<ck:button-link size='sm' variant='secondary' href='features/editor-placeholder'>
	Feature page
</ck:button-link>

### Editor UI types

The editor's user interface is dependent on the editor types. The editor provides functionality through specialized features accessible via a configurable toolbar or keyboard shortcuts. Some of these features are only available with certain editor types.

<ck:columns>
	<ck:card>
		<ck:card-title level='4'>
			Balloon block editor
		</ck:card-title>
		<ck:card-description>
			Balloon block is essentially the balloon editor with an extra block toolbar, which can be accessed using the button attached to the editable content area and following the selection in the document. The toolbar gives access to additional block–level editing features.

			<ck:button-link size='sm' variant='secondary' href='getting-started/setup/editor-types#balloon-editor-and-balloon-block-editor'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Balloon editor
		</ck:card-title>
		<ck:card-description>
			Balloon editor is similar to inline editor. The difference between them is that the toolbar appears in a balloon next to the selection (when the selection is not empty).

			<ck:button-link size='sm' variant='secondary' href='getting-started/setup/editor-types#balloon-editor-and-balloon-block-editor'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Classic editor
		</ck:card-title>
		<ck:card-description>
			Classic editor is what most users traditionally learned to associate with a rich-text editor – a toolbar with an editing area placed in a specific position on the page, usually as a part of a form that you use to submit some content to the server.

			<ck:button-link size='sm' variant='secondary' href='getting-started/setup/editor-types#classic-editor'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Decoupled editor
		</ck:card-title>
		<ck:card-description>
			The document editor focuses on a rich-text editing experience similar to large editing packages such as Google Docs or Microsoft Word. It works best for creating documents, which are usually later printed or exported to PDF files.

			<ck:button-link size='sm' variant='secondary' href='getting-started/setup/editor-types#decoupled-editor-document'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Inline editor
		</ck:card-title>
		<ck:card-description>
			The inline editor comes with a floating toolbar that becomes visible when the editor is focused (for example, by clicking it). A common scenario for using the inline editor is offering users the possibility to edit content (such as headings and other small areas) in its real location on a web page instead of doing it in a separate administration section.

			<ck:button-link size='sm' variant='secondary' href='getting-started/setup/editor-types#inline-editor'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Multi-root editor
		</ck:card-title>
		<ck:card-description>
			The multi-root editor is an editor type that features multiple, separate editable areas. The main difference between using a multi-root editor and using multiple separate editors is the fact that in a multi-root editor, the editors are "connected." All editable areas of the same editor instance share the same configuration, toolbar, undo stack, and produce one document.

			<ck:button-link size='sm' variant='secondary' href='getting-started/setup/editor-types#multi-root-editor'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>
</ck:columns>

### Email editing

CKEditor 5 provides a wide variety of tools and functions for editing almost any kind of content. This includes a wide array of tools and solutions to make email editing easier and more compatible with various email clients.

<ck:card>
	<ck:card-title level='4'>
		Email configuration helper
	</ck:card-title>
	<ck:card-description>
		While configuring an email editor looks like a demanding task, the email configuration helper plugin is the best way to start and make this experience more manageable.

		<ck:button-link size='sm' variant='secondary' href='features/email-editing/email-configuration-helper'>
			Feature page
		</ck:button-link>
	</ck:card-description>
</ck:card>

### Professionally translated language packs

CKEditor 5 provides 38 professionally translated language options, along with additional languages provided by community translations. CKEditor 5 also supports right-to-left (RTL) languages natively. When an RTL language is selected, the editor automatically adjusts its interface, including elements like toolbars, dropdowns, and buttons, to ensure an optimal editing experience.

<ck:button-link size='sm' variant='secondary' href='features/ui-language'>
	Feature page
</ck:button-link>

### Toolbar and menus

The Toolbar Configuration feature provides different toolbar interfaces for editing content. The default toolbar includes dropdown menus and buttons for various editing functions. The Balloon Toolbar appears when text is selected, showing relevant tools. The Block Toolbar is accessed by clicking a button on the left-hand side of the editor, providing tools for the active block of content. Additionally, the Multiline Toolbar option allows for the expansion of the standard toolbar over multiple lines to display more tools simultaneously.

<ck:columns>
	<ck:card>
		<ck:card-title level='4'>
			Balloon toolbar
		</ck:card-title>
		<ck:card-description>
			A ballon toolbar is a special instance of the main toolbar, available in the balloon and balloon block editor types. Instead of being fixed to the editing area, it pops up when the user selects some content and provides an editing toolset.

			<ck:button-link size='sm' variant='secondary' href='getting-started/setup/toolbar#balloon-toolbar'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Block toolbar
		</ck:card-title>
		<ck:card-description>
			The block toolbar provides an additional configurable toolbar on the left-hand side of the content area, useful when the main toolbar is not accessible (for example in certain layouts, like balloon block editor).

			<ck:button-link size='sm' variant='secondary' href='getting-started/setup/toolbar#block-toolbar'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Classic toolbar
		</ck:card-title>
		<ck:card-description>
			The toolbar is the most basic user interface element of CKEditor 5 that gives you convenient access to all its features. It has buttons and dropdowns that you can use to format, manage, insert, and change elements of your content.

			<ck:button-link size='sm' variant='secondary' href='getting-started/setup/toolbar#main-editor-toolbar'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Collapsible toolbar
		</ck:card-title>
		<ck:card-description>
			Collapsible toolbar for UI space efficiency.

			<ck:button-link size='sm' variant='secondary' href='getting-started/setup/toolbar#extended-toolbar-configuration-format'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Image contextual toolbar
		</ck:card-title>
		<ck:card-description>
			The {@link module:image/imagetoolbar~ImageToolbar} plugin introduces a contextual toolbar for images. The toolbar appears when an image is selected and can be configured to contain any buttons you want. Usually, these will be image-related options, such as the {@link features/images-text-alternative text alternative} button, the {@link features/images-captions image caption} button, and {@link features/images-styles image styles} buttons. The toolbar can also host the image editing button introduced by the {@link features/ckbox CKBox asset manager}. Shown below is an example contextual toolbar with an extended set of buttons.

			<ck:button-link size='sm' variant='secondary' href='features/images-overview#image-contextual-toolbar'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Menu bar
		</ck:card-title>
		<ck:card-description>
			The menu bar is a user interface component that gives you access to all features provided by the editor, organized in menus and categories. This familiar experience, popular in large editing desktop and online packages, improves the usability of the editor. As the menu bar gathers all the editor features, the toolbar can be simple and tidy, providing only the most essential and commonly used features. This is especially welcome in heavily-featured editor integrations. For your convenience, the menu bar provides a default preset structure based on the plugins loaded in the editor. However, you can arrange it to suit your needs, remove unnecessary items, or add menu items related to your custom features.

			<ck:button-link size='sm' variant='secondary' href='getting-started/setup/menubar'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Multiline toolbar
		</ck:card-title>
		<ck:card-description>
			Multiline toolbar for easy access to all functions.

			<ck:button-link size='sm' variant='secondary' href='getting-started/setup/toolbar#multiline-wrapping-toolbar'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Nesting toolbars in dropdowns
		</ck:card-title>
		<ck:card-description>
			Nested toolbars for space efficiency and task-oriented access.

			<ck:button-link size='sm' variant='secondary' href='getting-started/setup/toolbar#grouping-toolbar-items-in-dropdowns-nested-toolbars'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Wide sidebar
		</ck:card-title>
		<ck:card-description>
			There are three built-in UIs to display comment threads and suggestion annotations: the wide sidebar, the narrow sidebar, and inline balloons. You can also display them together in more advanced scenarios where various annotation sources (comments, suggestions) are connected to different UIs, or even create your own UI for annotations.

			<ck:button-link size='sm' variant='secondary' href='features/annotations-display-mode#wide-sidebar'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Table contextual toolbar
		</ck:card-title>
		<ck:card-description>
			The {@link module:table/tabletoolbar~TableToolbar} plugin introduces a contextual toolbar for the table. The toolbar appears when a table or a cell is selected and contains various table-related buttons. These would typically include adding or removing columns and rows and merging or splitting cells. If these features are configured, the toolbar will also contain buttons for captions and table and cell properties.

			<ck:button-link size='sm' variant='secondary' href='features/tables#table-contextual-toolbar'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>
</ck:columns>

### Watchdog

The watchdog utility protects you from data loss in case the editor crashes. It saves your content just before the crash and creates a new instance of the editor with your content intact.

<ck:button-link size='sm' variant='secondary' href='features/watchdog'>
	Feature page
</ck:button-link>

## Compliance

Make your content accessible to any person or restrict it to specific users.

### Accessibility support

CKEditor 5 includes accessibility functionality designed to ensure content is accessible to all users. These features encompass keyboard navigation for easier content access without a mouse, screen reader compatibility facilitated by ARIA attributes, and semantic output markup for clearer interpretation of content structures. CKEditor 5 meets the requirements of the Web Content Accessibility Guidelines (WCAG) 2.2 at levels A and AA, as well as Section 508 of the Rehabilitation Act, as detailed in the Accessibility Conformance Report, ensuring broad accessibility compliance.

<ck:button-link size='sm' variant='secondary' href='features/accessibility'>
	Feature page
</ck:button-link>

### Read-only support

The Read-Only Mode feature enables content to be locked from editing while still allowing it to be viewed. This mode is often used for restricting editing access based on user roles, allowing only specific users or groups to view the content without being able to modify it. Common uses include viewing sensitive documents like financial reports, software logs, or copyrighted stories that should not be altered but need to be accessible for copying or by screen readers. This mode can be toggled on and off by system triggers.

<ck:button-link size='sm' variant='secondary' href='features/read-only'>
	Feature page
</ck:button-link>

### Restricted editing

The Restricted Editing feature allows some sections of a document to be designated as non-editable while others remain editable. This feature supports two modes: the standard editing mode, where all content can be edited, and the restricted editing mode, where users can only modify parts of the content that are specifically marked as editable. This functionality is useful for workflows where one group of users creates document templates that include protected sections, and a second group fills in editable details such as names, dates, or product names without altering the rest of the document.

<ck:button-link size='sm' variant='secondary' href='features/restricted-editing'>
	Feature page
</ck:button-link>

### Text Part Language

The Text Part Language feature allows users to specify the language of individual sections of text. This capability helps in creating documents that include multiple languages by ensuring that browsers and screen readers correctly interpret each part according to its designated language. This feature is particularly valuable for content that contains text in varying directions, such as an English document with Arabic citations. It supports the WCAG 3.1.2 Language of Parts specification, facilitating the creation of more accessible and comprehensible multilingual content.

<ck:button-link size='sm' variant='secondary' href='features/language'>
	Feature page
</ck:button-link>

### Word and character counter

The Word and Character Count feature provides a real-time tracking tool for monitoring the number of words and characters within the editor. This functionality assists in managing content length and ensuring it meets specific requirements or limits.

<ck:button-link size='sm' variant='secondary' href='features/word-count'>
	Feature page
</ck:button-link>

### WProofreader

The Spelling and Grammar Checker is a proofreading tool that supports over 80 languages and dialects. It checks spelling and grammar in real time and through a separate dialog. Features include spelling autocorrect, text autocomplete, and suggestions that appear on hover. Users can create custom dictionaries for specific terms related to their brand or company. The tool is compliant with WCAG 2.1 and Section 508 accessibility standards. It also detects sentence-level errors and offers context-based correction suggestions.

<ck:button-link size='sm' variant='secondary' href='features/spelling-and-grammar-checking'>
	Feature page
</ck:button-link>

## Customization

Customize your editor even further. Use components and helpers from our UI library to create a UI that will match your design system.

### Editor SDK

Select from numerous toolbar styles and over 100 plugins to tailor an editor that perfectly fits your requirements, all without needing any development expertise. For those looking to go further, the CKEditor API enables the creation of custom plugins or modification of the editor's functionality. To assist the development process, dedicated resources such as a package generator and the CKEditor 5 Inspector - a comprehensive suite of debugging tools - are provided, helping accelerate development work.

<ck:columns>
	<ck:card>
		<ck:card-title level='4'>
			CKEditor 5 inspector
		</ck:card-title>
		<ck:card-description>
			The official CKEditor 5 inspector provides a set of rich debugging tools for editor internals like model, view, and commands.

			<ck:button-link size='sm' variant='secondary' href='framework/development-tools/inspector'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>

	<ck:card>
		<ck:card-title level='4'>
			Cloud Services REST API
		</ck:card-title>
		<ck:card-description>
			The CKEditor Cloud Services is a cloud platform that provides editing and real-time collaboration services. The platform primarily focuses on providing a backend for the CKEditor 5 features, although some features can also be used directly through REST APIs.

			<ck:button-link size='sm' variant='secondary' href='@cs'>
				Feature page
			</ck:button-link>
		</ck:card-description>
	</ck:card>
</ck:columns>

### Themes

Customize the editor theme to match your design needs.

<ck:button-link size='sm' variant='secondary' href='framework/theme-customization'>
	Feature page
</ck:button-link>

### UI Library

The standard UI library of CKEditor 5 is @ckeditor/ckeditor5-ui. It provides base classes and helpers that allow for building a modular UI that seamlessly integrates with other components of the ecosystem.

<ck:button-link size='sm' variant='secondary' href='framework/architecture/ui-library'>
	Feature page
</ck:button-link>

## File management

Upload and manage your files using file management features. Take advantage of CKBox, our file management solution, or create your own using an adapter.

### Base64 Upload Adapter

Convert inserted images into Base64-encoded strings in the editor output. Images are stored with other content in the database without server-side processing.

<ck:button-link size='sm' variant='secondary' href='features/base64-upload-adapter'>
	Feature page
</ck:button-link>

### CKBox

Securely upload, store, edit, and utilize your images and files in CKEditor 5. Simplify media discovery in your uploads with the media browser alongside an intuitive Image Editor for image adjustments. Designed to facilitate organization, CKBox enables integrations, maintains permissions, and uses Workspaces to categorize files according to the user, document, or customer. It guarantees fast loading and optimal display of your images across devices through an efficient CDN. Deployable on-premises or as cloud SaaS.

<ck:button-link size='sm' variant='secondary' href='features/ckbox'>
	Feature page
</ck:button-link>

### CKFinder

The CKFinder feature lets you insert images and links to files into your content. CKFinder is a powerful file manager with various image editing and image upload options.

<ck:button-link size='sm' variant='secondary' href='features/ckfinder'>
	Feature page
</ck:button-link>

### Custom Upload Adapter

Have your own file management solution? Use this adapter to integrate your preferred software with CKEditor.

<ck:button-link size='sm' variant='secondary' href='features/image-upload#implementing-your-own-upload-adapter'>
	Feature page
</ck:button-link>

### Simple Upload Adapter

Upload images to your server using the XMLHttpRequest API with a minimal editor configuration.

<ck:button-link size='sm' variant='secondary' href='features/simple-upload-adapter'>
	Feature page
</ck:button-link>

### Uploadcare

Upload, store, transform, optimize, and deliver images, videos, and documents with this cloud-based file handler. Upload media from local storage, web cameras, cloud services, and social networks with automated media optimization through a CDN for responsive image delivery. Popular features include adaptive image quality, automated image format conversion, progressive JPEG, and options for preview, resize, stretch, crop, content-aware crop, and setting fill color.

<ck:button-link size='sm' variant='secondary' href='https://uploadcare.com/'>
	Feature page
</ck:button-link>
