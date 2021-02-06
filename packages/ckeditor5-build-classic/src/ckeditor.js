/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import Alignment from "@ckeditor/ckeditor5-alignment/src/alignment.js";
import AutoImage from "@ckeditor/ckeditor5-image/src/autoimage.js";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import UploadAdapter from "@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter";
import Autoformat from "@ckeditor/ckeditor5-autoformat/src/autoformat";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import FontSize from "@ckeditor/ckeditor5-font/src/fontsize.js";
import FontColor from "@ckeditor/ckeditor5-font/src/fontcolor.js";
import FontBackgroundColor from "@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js";
import FontFamily from "@ckeditor/ckeditor5-font/src/fontfamily.js";
import RemoveFormat from "@ckeditor/ckeditor5-remove-format/src/removeformat.js";
import IndentBlock from "@ckeditor/ckeditor5-indent/src/indentblock.js";
import Highlight from "@ckeditor/ckeditor5-highlight/src/highlight.js";
import BlockQuote from "@ckeditor/ckeditor5-block-quote/src/blockquote";
import CKFinder from "@ckeditor/ckeditor5-ckfinder/src/ckfinder";
import EasyImage from "@ckeditor/ckeditor5-easy-image/src/easyimage.js";
import ImageInsert from "@ckeditor/ckeditor5-image/src/imageinsert.js";
import ImageResize from "@ckeditor/ckeditor5-image/src/imageresize.js";
import Heading from "@ckeditor/ckeditor5-heading/src/heading";
import Image from "@ckeditor/ckeditor5-image/src/image.js";
import ImageCaption from "@ckeditor/ckeditor5-image/src/imagecaption";
import ImageStyle from "@ckeditor/ckeditor5-image/src/imagestyle";
import ImageToolbar from "@ckeditor/ckeditor5-image/src/imagetoolbar.js";
import ImageUpload from "@ckeditor/ckeditor5-image/src/imageupload";
import Indent from "@ckeditor/ckeditor5-indent/src/indent";
import Link from "@ckeditor/ckeditor5-link/src/link";
import LinkImage from "@ckeditor/ckeditor5-link/src/linkimage.js";
import List from "@ckeditor/ckeditor5-list/src/list";
import ListStyle from "@ckeditor/ckeditor5-list/src/liststyle.js";
import MediaEmbed from "@ckeditor/ckeditor5-media-embed/src/mediaembed";
import MediaEmbedToolbar from "@ckeditor/ckeditor5-media-embed/src/mediaembedtoolbar.js";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import PasteFromOffice from "@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice";
import SpecialCharacters from "@ckeditor/ckeditor5-special-characters/src/specialcharacters.js";
import SpecialCharactersArrows from "@ckeditor/ckeditor5-special-characters/src/specialcharactersarrows.js";
import SpecialCharactersCurrency from "@ckeditor/ckeditor5-special-characters/src/specialcharacterscurrency.js";
import SpecialCharactersEssentials from "@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials.js";
import SpecialCharactersLatin from "@ckeditor/ckeditor5-special-characters/src/specialcharacterslatin.js";
import SpecialCharactersMathematical from "@ckeditor/ckeditor5-special-characters/src/specialcharactersmathematical.js";
import SpecialCharactersText from "@ckeditor/ckeditor5-special-characters/src/specialcharacterstext.js";
import Table from "@ckeditor/ckeditor5-table/src/table";
import TableCellProperties from "@ckeditor/ckeditor5-table/src/tablecellproperties";
import TableProperties from "@ckeditor/ckeditor5-table/src/tableproperties";
import TableToolbar from "@ckeditor/ckeditor5-table/src/tabletoolbar";
import HorizontalLine from "@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js";
import TextTransformation from "@ckeditor/ckeditor5-typing/src/texttransformation";
import CloudServices from "@ckeditor/ckeditor5-cloud-services/src/cloudservices";
import Underline from "@ckeditor/ckeditor5-basic-styles/src/underline.js";

export default class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	Essentials,
	Alignment,
	AutoImage,
	UploadAdapter,
	Autoformat,
	Bold,
	Italic,
	Underline,
	FontSize,
	FontColor,
	FontBackgroundColor,
	FontFamily,
	RemoveFormat,
	IndentBlock,
	Highlight,
	BlockQuote,
	CKFinder,
	CloudServices,
	EasyImage,
	ImageInsert,
	ImageResize,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	Link,
	LinkImage,
	List,
	ListStyle,
	MediaEmbed,
	MediaEmbedToolbar,
	Paragraph,
	PasteFromOffice,
	SpecialCharacters,
	SpecialCharactersArrows,
	SpecialCharactersCurrency,
	SpecialCharactersEssentials,
	SpecialCharactersLatin,
	SpecialCharactersMathematical,
	SpecialCharactersText,
	Table,
	TableCellProperties,
	TableProperties,
	TableToolbar,
	HorizontalLine,
	TextTransformation,
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			"heading",
			"|",
			"bold",
			"italic",
			"underline",
			"link",
			"alignment",
			"|",
			"bulletedList",
			"numberedList",
			"|",
			"FontSize",
			"fontFamily",
			"fontColor",
			"fontBackgroundColor",
			"highlight",
			"removeFormat",
			"|",
			"indentBlock",
			"indent",
			"outdent",
			"specialCharacters",
			"blockQuote",
			"|",
			"imageUpload",
			"linkImage",
			"insertTable",
			"mediaEmbed",
			"mediaEmbedToolbar",
			"|",
			"undo",
			"redo",
		],
	},
	image: {
		toolbar: [
			"imageStyle:full",
			"imageStyle:side",
			"|",
			"imageTextAlternative",
		],
	},
	table: {
		contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: "en",
};
