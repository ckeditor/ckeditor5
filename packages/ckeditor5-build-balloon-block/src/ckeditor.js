/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import BalloonEditorBase from "@ckeditor/ckeditor5-editor-balloon/src/ballooneditor";

import Autoformat from "@ckeditor/ckeditor5-autoformat/src/autoformat";
import BlockToolbar from "@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar";
import BlockQuote from "@ckeditor/ckeditor5-block-quote/src/blockquote";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Heading from "@ckeditor/ckeditor5-heading/src/heading";
import HorizontalLine from "@ckeditor/ckeditor5-horizontal-line/src/horizontalline";
import Image from "@ckeditor/ckeditor5-image/src/image";
import ImageCaption from "@ckeditor/ckeditor5-image/src/imagecaption";
import ImageStyle from "@ckeditor/ckeditor5-image/src/imagestyle";
import ImageToolbar from "@ckeditor/ckeditor5-image/src/imagetoolbar";
import ImageUpload from "@ckeditor/ckeditor5-image/src/imageupload";
import Indent from "@ckeditor/ckeditor5-indent/src/indent";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import Link from "@ckeditor/ckeditor5-link/src/link";
import LinkImage from "@ckeditor/ckeditor5-link/src/linkimage";
import List from "@ckeditor/ckeditor5-list/src/list";
import MediaEmbed from "@ckeditor/ckeditor5-media-embed/src/mediaembed";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import PasteFromOffice from "@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice";
import Subscript from "@ckeditor/ckeditor5-basic-styles/src/subscript";
import Superscript from "@ckeditor/ckeditor5-basic-styles/src/superscript";
import Title from "@ckeditor/ckeditor5-heading/src/title";
import Table from "@ckeditor/ckeditor5-table/src/table";
import TableToolbar from "@ckeditor/ckeditor5-table/src/tabletoolbar";
import TextTransformation from "@ckeditor/ckeditor5-typing/src/texttransformation";
import WordCount from "@ckeditor/ckeditor5-word-count/src/wordcount";

import "../theme/theme.css";
import "../theme/custom.css";

export default class BalloonEditor extends BalloonEditorBase {}

// Plugins to include in the build.
BalloonEditor.builtinPlugins = [
	Autoformat,
	BlockToolbar,
	BlockQuote,
	Bold,
	Essentials,
	Heading,
	HorizontalLine,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	Italic,
	Link,
	LinkImage,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	Subscript,
	Superscript,
	Title,
	Table,
	TableToolbar,
	TextTransformation,
	WordCount,
];

// Editor configuration.
BalloonEditor.defaultConfig = {
	blockToolbar: [
		"imageUpload",
		"mediaEmbed",
		"|",
		"horizontalLine",
		"heading",
		"|",
		"bulletedList",
		"numberedList",
		"|",
		"indent",
		"outdent",
		"|",
		"insertTable",
		"|",
		"undo",
		"redo",
	],
	toolbar: {
		items: [
			"heading",
			"|",
			"bold",
			"italic",
			"link",
			"blockQuote",
			"indent",
			"outdent",
			"subscript",
			"superscript",
		],
	},
	image: {
		toolbar: [
			"imageStyle:full",
			"imageStyle:side",
			"|",
			"imageTextAlternative",
			"linkImage",
		],
	},
	heading: {
		options: [
			{
				model: "paragraph",
				title: "Paragraph",
				class: "ck-heading_paragraph",
			},
			{
				model: "heading2",
				view: "h2",
				title: "Big title",
				class: "ck-heading_heading2",
			},
			{
				model: "heading3",
				view: "h3",
				title: "Small title",
				class: "ck-heading_heading3",
			},
		],
	},
	table: {
		contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
	},
	title: {
		placeholder: "Title",
	},
	placeholder: "Tell your story...",
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: "en",
};
