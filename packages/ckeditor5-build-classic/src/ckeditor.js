/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';
import SelectAll from '@ckeditor/ckeditor5-select-all/src/selectall';
import List from '@ckeditor/ckeditor5-list/src/list';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import Font from '@ckeditor/ckeditor5-font/src/font';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TableColumnResize from '@ckeditor/ckeditor5-table/src/tablecolumnresize';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import Link from '@ckeditor/ckeditor5-link/src/link';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { icons } from '@ckeditor/ckeditor5-core';
import {
	AutoImage,
	Image,
	ImageCaption,
	ImageInsert,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload
} from '@ckeditor/ckeditor5-image';

/* globals $ */

export default class ClassicEditor extends ClassicEditorBase {}

class References extends Plugin {
	init() {
		const editor = this.editor;

		// The button must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add( 'references', ( ) => {
			// The button will be an instance of ButtonView.
			const button = new ButtonView();

			button.set( {
				icon: icons.references,
				label: 'References',
				tooltip: true
			} );

			button.on( 'execute', editor => {
				const $referencesModalContainer = $( '#references-modal-container' );
				$referencesModalContainer.removeClass( 'display-none' );
				$referencesModalContainer.attr( 'data-references-label-id', editor.source.labelView.element.id );
				$referencesModalContainer.find( '.modal-title' ).text( 'References' );
				$referencesModalContainer.modal( {
					dismissible: false
				} );
			} );

			return button;
		} );
	}
}

class AssetLink extends Plugin {
	init() {
		const editor = this.editor;

		// The button must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add( 'assetlink', () => {
		// The button will be an instance of ButtonView.
			const button = new ButtonView();

			button.set( {
				icon: icons.assetlink,
				label: 'Asset Link',
				tooltip: true
			} );

			button.on( 'execute', editor => {
				const $assetlinkModalContainer = $( '#assetlink-modal-container' );
				$assetlinkModalContainer.removeClass( 'display-none' );
				$assetlinkModalContainer.attr( 'data-assetlink-label-id', editor.source.labelView.element.id );
				$assetlinkModalContainer.find( '.modal-title' ).text( 'Asset Link' );
				$assetlinkModalContainer.modal( {
					dismissible: false
				} );
			} );

			return button;
		} );
	}
}

class SpecialCharactersAdditional extends Plugin {
	init() {
		const editor = this.editor;
		const specialCharacters = editor.plugins.get( 'SpecialCharacters' );
		specialCharacters.addItems( 'Arrows', [
			{ title: 'arrow right', character: '►' },
			{ title: 'arrow left', character: '◄' }
		] );
		specialCharacters.addItems( 'Mathematical', [
			{ title: 'alpha', character: 'α' },
			{ title: 'beta', character: 'β' },
			{ title: 'gamma', character: 'γ' }
		] );
	}
}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	AssetLink,
	Clipboard,
	GeneralHtmlSupport,
	References,
	SourceEditing,
	Essentials,
	FindAndReplace,
	SelectAll,
	List,
	TodoList,
	Indent,
	BlockQuote,
	Alignment,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Subscript,
	Superscript,
	RemoveFormat,
	Font,
	SpecialCharacters,
	SpecialCharactersAdditional,
	SpecialCharactersEssentials,
	Table,
	TableCaption,
	TableCellProperties,
	TableColumnResize,
	TableProperties,
	TableToolbar,
	Link,
	Paragraph,
	ParagraphButtonUI,
	PasteFromOffice,
	AutoImage,
	Image,
	ImageCaption,
	ImageInsert,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en',
	table: {
		contentToolbar: [
			'tableCellProperties',
			'tableColumn',
			'tableRow',
			'tableProperties',
			'toggleTableCaption',
			'mergeTableCells'
		]
	},
	toolbar: {
		items: [
			'assetLink', 'references',
			'sourceEditing', '|',
			'undo', 'redo', '|',
			'findAndReplace', 'selectAll', '|',
			'numberedList', 'bulletedList', 'todoList', 'paragraph', '|',
			'outdent', 'indent', '|',
			'blockquote', '|',
			'alignment', '-',
			'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'removeFormat', '|',
			'link', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
			'specialCharacters', 'insertTable', '|',
			'insertImage', '|'
		],
		shouldNotGroupWhenFull: true
	},
	link: {
		decorators: {
			openInNewTab: {
				mode: 'manual',
				label: 'Open in a new tab',
				defaultValue: true,
				attributes: {
					target: '_blank',
					class: 'customlink'
				}
			}
		}
	}
};
