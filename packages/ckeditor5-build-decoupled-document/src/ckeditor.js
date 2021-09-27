/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import DecoupledEditorBase from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import ListStyle from '@ckeditor/ckeditor5-list/src/liststyle';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Pagination from '@ckeditor/ckeditor5-pagination/src/pagination';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import { Plugin } from '@ckeditor/ckeditor5-core/src';
import { createDropdown, addListToDropdown } from 'ckeditor5/src/ui';
import smartfieldIcon from './smartfieldIcon.svg';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import LineHeight from 'ckeditor5-line-height-plugin/src/lineheight';

class InsertSmartField extends Plugin {
	init() {
		const editor = this.editor;
		const componentFactory = editor.ui.componentFactory;
		const t = editor.t;
		const smartFieldsConfig = editor.config._config.smartFields;
		const {
			cbFn = () => {},
			smartFieldsDropdownList: smartFields = []
		} = smartFieldsConfig;

		componentFactory.add( 'insertSmartField', locale => {
			const dropdownView = createDropdown( locale );

			dropdownView.buttonView.set( {
				class: 'smartfield-icon',
				icon: smartfieldIcon,
				label: t( 'Insert smart field' ),
				tooltip: true
			} );

			// The collection of list items
			const items = new Collection();

			smartFields.map( option =>
				items.add( {
					type: 'button',
					model: new Model( {
						label: option,
						withText: true,
						tooltip: true
					} )
				} )
			);
			// Create a dropdown with list of smartfields inside the panel.
			addListToDropdown( dropdownView, items );
			dropdownView.on( 'execute', evt => {
				const formattedText = `[[${ evt.source.label.replace(
					/ /g,
					''
				) }]]`;
				editor.model.change( () => {
					cbFn( editor, formattedText );
				} );
			} );
			return dropdownView;
		} );
	}
}

export default class DecoupledEditor extends DecoupledEditorBase {}

const customColorPalette = [
	{
		color: 'hsl(4, 90%, 58%)',
		label: 'Red'
	},
	{
		color: 'hsl(340, 82%, 52%)',
		label: 'Pink'
	},
	{
		color: 'hsl(291, 64%, 42%)',
		label: 'Purple'
	},
	{
		color: 'hsl(262, 52%, 47%)',
		label: 'Deep Purple'
	},
	{
		color: 'hsl(231, 48%, 48%)',
		label: 'Indigo'
	},
	{
		color: 'hsl(207, 90%, 54%)',
		label: 'Blue'
	},
	{
		color: 'hsl(207, 90%, 54%, 0)',
		label: 'transparent'
	}
];

// Plugins to include in the build.
DecoupledEditor.builtinPlugins = [
	Essentials,
	Alignment,
	FontSize,
	FontFamily,
	FontColor,
	FontBackgroundColor,
	UploadAdapter,
	Autoformat,
	Bold,
	Italic,
	Strikethrough,
	Underline,
	BlockQuote,
	CKFinder,
	CloudServices,
	EasyImage,
	Heading,
	Image,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	IndentBlock,
	InsertSmartField,
	LineHeight,
	Link,
	List,
	ListStyle,
	MediaEmbed,
	PageBreak,
	Pagination,
	Paragraph,
	PasteFromOffice,
	Table,
	TableCellProperties,
	TableProperties,
	TableToolbar,
	TextTransformation,
	Widget
];

// Editor configuration.
DecoupledEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'|',
			'fontfamily',
			'fontsize',
			'fontColor',
			'fontBackgroundColor',
			'|',
			'bold',
			'italic',
			'underline',
			'strikethrough',
			'|',
			'alignment',
			'|',
			'numberedList',
			'bulletedList',
			'|',
			'outdent',
			'indent',
			'|',
			'lineHeight',
			'|',
			'link',
			'blockquote',
			// Removing image btn until uploading images enabled
			// 'uploadImage',
			'insertTable',
			'mediaEmbed',
			'|',
			'undo',
			'redo',
			'pageBreak',
			'previousPage',
			'nextPage',
			'pageNavigation',
			'|',
			'insertSmartField'
		]
	},
	image: {
		styles: [ 'full', 'alignLeft', 'alignRight' ],
		resizeUnit: 'px',
		toolbar: [
			'imageStyle:inline',
			'imageStyle:wrapText',
			'imageStyle:breakText',
			'|',
			'toggleImageCaption',
			'imageTextAlternative'
		]
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableProperties',
			'tableCellProperties'
		],
		tableProperties: {
			borderColors: customColorPalette,
			backgroundColors: customColorPalette
		},
		tableCellProperties: {
			borderColors: customColorPalette,
			backgroundColors: customColorPalette
		}
	},
	lineHeight: {
		options: [ 1, 1.15, 1.5, 2, 2.5 ]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
