/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import PastePlainText from '../src/pasteplaintext';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';

/* global document */

describe( 'PastePlainText', () => {
	let editor, viewDocument;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ PastePlainText, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				viewDocument = editor.editing.view.document;
			} );
	} );

	it( 'marks clipboard input as plain text with shift pressed', () => {
		const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );

		viewDocument.on( 'clipboardInput', ( event, data ) => {
			expect( data.asPlainText ).to.be.true;

			// No need for further execution.
			event.stop();
		} );

		viewDocument.fire( 'keydown', {
			keyCode: getCode( 'v' ),
			shiftKey: true,
			ctrlKey: true,
			preventDefault: () => {},
			domTarget: document.body
		} );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer: dataTransferMock
		} );
	} );

	it( 'ignores clipboard input as plain text when shift was released', () => {
		const dataTransferMock = createDataTransfer( { 'text/html': '<p>x</p>', 'text/plain': 'y' } );

		viewDocument.on( 'clipboardInput', ( event, data ) => {
			expect( data.asPlainText ).to.be.undefined;

			// No need for further execution.
			event.stop();
		} );

		viewDocument.fire( 'keydown', {
			keyCode: getCode( 'a' ),
			shiftKey: true,
			preventDefault: () => {},
			domTarget: document.body
		} );

		viewDocument.fire( 'keyup', {
			keyCode: getCode( 'a' ),
			shiftKey: true,
			preventDefault: () => {},
			domTarget: document.body
		} );

		viewDocument.fire( 'keydown', {
			keyCode: getCode( 'v' ),
			shiftKey: false,
			ctrlKey: true,
			preventDefault: () => {},
			domTarget: document.body
		} );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer: dataTransferMock
		} );
	} );

	function createDataTransfer( data ) {
		return {
			getData( type ) {
				return data[ type ];
			}
		};
	}
} );
