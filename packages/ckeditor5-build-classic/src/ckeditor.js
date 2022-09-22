/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

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
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import Table from '@ckeditor/ckeditor5-table/src/table';
import Link from '@ckeditor/ckeditor5-link/src/link';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { ButtonView } from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { icons } from '@ckeditor/ckeditor5-core';

/* globals $ */

export default class ClassicEditor extends ClassicEditorBase {}

class References extends Plugin {
	init() {
		const editor = this.editor;

		// The button must be registered among the UI components of the editor
		// to be displayed in the toolbar.

		editor.ui.componentFactory.add( 'references', () => {
		// The button will be an instance of ButtonView.
			const button = new ButtonView();

			button.set( {
				icon: icons.references,
				label: 'References', // window.polyglot.t('app.asset.editlink'),
				tooltip: true
			} );

			button.on( 'execute', () => {
				const $modelContainer = $( '#references-modal-container' );
				$modelContainer.removeClass( 'display-none' );
				$modelContainer.find( '.modal-title' ).text( 'References' ); // window.polyglot.t('app.references.title')
				// $modelContainer.find('.modal-body').text('References');
				$modelContainer.modal( {
					dismissible: false
				} );
				// on modal show
				this.onModalShow( editor );
				// on ok, write to the model
				$modelContainer.find( '.model-button-ok' ).on( 'click', () => {
					const checked = $( 'input[name="references-list"]' ).filter( ':checked' );

					if ( checked.length === 0 || this.insertMode ) {
						return;
					}

					editor.model.change( writer => {
						const id = checked[ 0 ].value;
						this.addAttributesToLink( editor, id );

						const insertPosition = editor.model.document.selection.getFirstPosition();
						writer.insertText( '[' + id + ']', { linkHref: '#', 'reference': id }, insertPosition );
					} );
				} );
			} );

			return button;
		} );
	}

	onModalShow( editor ) {
		this.insertMode = false;
		this.elementTest = editor.model.document.selection.getFirstRange();

		// $( editor.sourceElement ).find( 'a' );

		if ( !this.element ||
			!this.element.start ||
			!this.element.start.textNode ||
			!this.element.start.textNode.getAttributeKeys().next().value === 'linkHref' ) {
			return;
		}
		// element = document.createElement( 'a' );
		this.insertMode = true;
	}

	addAttributesToLink( editor, id ) {
		editor.conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'attribute:reference', ( evt, data, conversionApi ) => {
				const viewWriter = conversionApi.writer;
				const viewSelection = viewWriter.document.selection;
				const viewElement = viewWriter.createAttributeElement( 'a', {
					class: 'reference',
					'data-reference-link': id
				}, {
					priority: 5
				} );

				if ( data.item.is( 'selection' ) ) {
					viewWriter.wrap( viewSelection.getFirstRange(), viewElement );
				} else {
					viewWriter.wrap( conversionApi.mapper.toViewRange( data.range ), viewElement );
				}
			}, { priority: 'low' } );
		} );
	}
}

class AssetLink extends Plugin {
	init() {
		// console.log( 'test' );
		const editor = this.editor;

		// The button must be registered among the UI components of the editor
		// to be displayed in the toolbar.
		editor.ui.componentFactory.add( 'assetlink', () => {
		// The button will be an instance of ButtonView.
			const button = new ButtonView();

			button.set( {
				icon: icons.assetlink,
				label: 'Asset Link', // window.polyglot.t('app.asset.editlink'),
				tooltip: true
			} );

			button.on( 'execute', () => {
				const now = new Date();

				// Change the model using the model writer.
				editor.model.change( writer => {
					// Insert the text at the user's current position.
					editor.model.insertContent( writer.createText( now.toString() ) );
				} );
			} );

			return button;
		} );
	}
}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	AssetLink,
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
	// UploadAdapter,
	// Autoformat,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Subscript,
	Superscript,
	RemoveFormat,
	Font,
	Highlight,
	SpecialCharacters,
	Table,
	// CKBox,
	// CKFinder,
	// CloudServices,
	// EasyImage,
	// Heading,
	// Image,
	// ImageCaption,
	// ImageStyle,
	// ImageToolbar,
	// ImageUpload,
	// Indent,
	Link,
	// MediaEmbed,
	Paragraph,
	PasteFromOffice
	// PictureEditing
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	placeholder: '',
	toolbar: {
		items: [
			'assetLink', 'references',
			'sourceEditing', '|',
			'undo', 'redo', '|',
			'findAndReplace', 'selectAll', '|',
			'numberedList', 'bulletedList', 'todoList', '|', 'outdent', 'indent', '|', 'blockquote', '|',
			'alignment', '-',
			'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'removeFormat', '|',
			'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', 'highlight', '|',
			'specialCharacters', 'insertTable', '|'
		],
		shouldNotGroupWhenFull: true
	},
	// image: {
	// 	toolbar: [
	// 		'imageStyle:inline',
	// 		'imageStyle:block',
	// 		'imageStyle:side',
	// 		'|',
	// 		'toggleImageCaption',
	// 		'imageTextAlternative'
	// 	]
	// },
	// table: {
	// 	contentToolbar: [
	// 		'tableColumn',
	// 		'tableRow',
	// 		'mergeTableCells'
	// 	]
	// },
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
