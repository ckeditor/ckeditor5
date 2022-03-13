/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import PastePlainText from '../src/pasteplaintext';

/* global document */

// https://github.com/ckeditor/ckeditor5/issues/1006
describe( 'PastePlainText', () => {
	let editor, model, viewDocument;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ PastePlainText, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				viewDocument = editor.editing.view.document;

				// VirtualTestEditor has no DOM, so this method must be stubbed for all tests.
				// Otherwise it will throw as it accesses the DOM to do its job.
				sinon.stub( editor.editing.view, 'scrollToTheSelection' );

				model.schema.extend( '$text', { allowAttributes: 'bold' } );
				model.schema.extend( '$text', { allowAttributes: 'test' } );

				editor.model.schema.setAttributeProperties( 'bold', { isFormatting: true } );

				model.schema.register( 'softBreak', {
					allowWhere: '$text',
					isInline: true
				} );

				editor.conversion.elementToElement( {
					model: 'softBreak',
					view: 'br'
				} );
			} );
	} );

	it( 'should inherit selection attributes (collapsed selection)', () => {
		let insertedNode;

		model.on( 'insertContent', ( evt, [ documentFragment ] ) => {
			insertedNode = documentFragment.getChild( 0 );
		}, { priority: Number.POSITIVE_INFINITY } );

		setModelData( model, '<paragraph><$text bold="true">Bolded []text.</$text></paragraph>' );

		const dataTransferMock = createDataTransfer( { 'text/plain': 'foo' } );

		viewDocument.fire( 'paste', {
			dataTransfer: dataTransferMock,
			stopPropagation() {},
			preventDefault() {}
		} );

		expect( getModelData( model ) ).to.equal( '<paragraph><$text bold="true">Bolded foo[]text.</$text></paragraph>' );
		expect( insertedNode.getAttribute( 'bold' ) ).to.equal( true );
	} );

	it( 'should inherit selection attributes (non-collapsed selection)', () => {
		let insertedNode;

		model.on( 'insertContent', ( evt, [ documentFragment ] ) => {
			insertedNode = documentFragment.getChild( 0 );
		}, { priority: Number.POSITIVE_INFINITY } );

		setModelData( model, '<paragraph><$text bold="true">Bolded [text.]</$text></paragraph>' );

		const dataTransferMock = createDataTransfer( { 'text/plain': 'foo' } );

		viewDocument.fire( 'paste', {
			dataTransfer: dataTransferMock,
			stopPropagation() {},
			preventDefault() {}
		} );

		expect( getModelData( model ) ).to.equal( '<paragraph><$text bold="true">Bolded foo[]</$text></paragraph>' );
		expect( insertedNode.getAttribute( 'bold' ) ).to.equal( true );
	} );

	it( 'should inherit selection attributes while pasting a plain text as text/html', () => {
		let insertedNode;

		model.on( 'insertContent', ( evt, [ documentFragment ] ) => {
			insertedNode = documentFragment.getChild( 0 );
		}, { priority: Number.POSITIVE_INFINITY } );

		setModelData( model, '<paragraph><$text bold="true">Bolded []text.</$text></paragraph>' );

		const dataTransferMock = createDataTransfer( {
			'text/html': 'foo',
			'text/plain': 'foo'
		} );

		viewDocument.fire( 'paste', {
			dataTransfer: dataTransferMock,
			stopPropagation() {},
			preventDefault() {}
		} );

		expect( getModelData( model ) ).to.equal( '<paragraph><$text bold="true">Bolded foo[]text.</$text></paragraph>' );
		expect( insertedNode.getAttribute( 'bold' ) ).to.equal( true );
	} );

	it( 'should inherit selection attributes while pasting a plain text as text/html (Chrome style)', () => {
		setModelData( model, '<paragraph><$text bold="true">Bolded []text.</$text></paragraph>' );

		const dataTransferMock = createDataTransfer( {
			'text/html': '<meta http-equiv="content-type" content="text/html; charset=utf-8">foo',
			'text/plain': 'foo'
		} );

		viewDocument.fire( 'paste', {
			dataTransfer: dataTransferMock,
			stopPropagation() {},
			preventDefault() {}
		} );

		expect( getModelData( model ) ).to.equal( '<paragraph><$text bold="true">Bolded foo[]text.</$text></paragraph>' );
	} );

	it( 'should inherit selection attributes while pasting HTML with unsupported attributes', () => {
		setModelData( model, '<paragraph><$text bold="true">Bolded []text.</$text></paragraph>' );

		const dataTransferMock = createDataTransfer( {
			'text/html': '<u>foo</u>',
			'text/plain': 'foo'
		} );

		viewDocument.fire( 'paste', {
			dataTransfer: dataTransferMock,
			stopPropagation() {},
			preventDefault() {}
		} );

		expect( getModelData( model ) ).to.equal( '<paragraph><$text bold="true">Bolded foo[]text.</$text></paragraph>' );
	} );

	it( 'should inherit selection attributes if shift key was pressed while pasting', () => {
		setModelData( model, '<paragraph><$text bold="true">Bolded []text.</$text></paragraph>' );

		const dataTransferMock = createDataTransfer( {
			'text/html': 'foo<br>bar',
			'text/plain': 'foo\nbar'
		} );

		fireKeyEvent( 'v', {
			shiftKey: true,
			ctrlKey: true
		} );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer: dataTransferMock,
			stopPropagation() {},
			preventDefault() {}
		} );

		expect( getModelData( model ) ).to.equal(
			'<paragraph>' +
				'<$text bold="true">Bolded foo</$text>' +
				'<softBreak></softBreak>' +
				'<$text bold="true">bar[]text.</$text>' +
			'</paragraph>'
		);
	} );

	it( 'should discard selection attributes if shift key was not pressed while pasting', () => {
		setModelData( model, '<paragraph><$text bold="true">Bolded []text.</$text></paragraph>' );

		const dataTransferMock = createDataTransfer( {
			'text/html': 'foo<br>bar',
			'text/plain': 'foo\nbar'
		} );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer: dataTransferMock,
			stopPropagation() {},
			preventDefault() {}
		} );

		expect( getModelData( model ) ).to.equal(
			'<paragraph>' +
				'<$text bold="true">Bolded </$text>' +
				'foo<softBreak></softBreak>bar[]' +
				'<$text bold="true">text.</$text>' +
			'</paragraph>' );
	} );

	it( 'should work if the insertContent event is cancelled', () => {
		// (#7887).
		setModelData( model, '<paragraph><$text bold="true">Bolded []text.</$text></paragraph>' );

		const dataTransferMock = createDataTransfer( {
			'text/html': 'foo',
			'text/plain': 'foo'
		} );

		model.on( 'insertContent', event => {
			event.stop();
		}, { priority: 'high' } );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer: dataTransferMock,
			stopPropagation() {},
			preventDefault() {}
		} );

		expect( getModelData( model ) ).to.equal( '<paragraph><$text bold="true">Bolded []text.</$text></paragraph>' );
	} );

	it( 'should preserve non formatting attribute if it was partially selected', () => {
		setModelData( model, '<paragraph><$text test="true">Linked [text].</$text></paragraph>' );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer: createDataTransfer( {
				'text/html': 'foo',
				'text/plain': 'foo'
			} ),
			stopPropagation() {},
			preventDefault() {}
		} );

		expect( getModelData( model ) ).to.equal( '<paragraph><$text test="true">Linked foo[].</$text></paragraph>' );
	} );

	it( 'should not preserve non formatting attribute if it was fully selected', () => {
		setModelData( model, '<paragraph><$text test="true">[Linked text.]</$text></paragraph>' );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer: createDataTransfer( {
				'text/html': 'foo',
				'text/plain': 'foo'
			} ),
			stopPropagation() {},
			preventDefault() {}
		} );

		expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph>' );
	} );

	it( 'should not treat a pasted object as a plain text', () => {
		model.schema.register( 'obj', {
			allowWhere: '$block',
			isObject: true,
			isBlock: true
		} );

		editor.conversion.elementToElement( { model: 'obj', view: 'obj' } );

		setModelData( model, '<paragraph><$text bold="true">Bolded [text].</$text></paragraph>' );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer: createDataTransfer( {
				'text/html': '<obj></obj>',
				'text/plain': 'foo'
			} ),
			stopPropagation() {},
			preventDefault() {}
		} );

		expect( getModelData( model ) ).to.equal(
			'<paragraph><$text bold="true">Bolded </$text></paragraph>' +
			'[<obj></obj>]' +
			'<paragraph><$text bold="true">.</$text></paragraph>'
		);
	} );

	it( 'ignores clipboard input as plain text when shift was released', () => {
		setModelData( model, '<paragraph><$text bold="true">Bolded []text.</$text></paragraph>' );

		const dataTransferMock = createDataTransfer( {
			'text/html': 'foo<br>bar',
			'text/plain': 'foo\nbar'
		} );

		fireKeyEvent( 'a', {
			shiftKey: true
		} );

		fireKeyEvent( 'v', {
			shiftKey: false,
			ctrlKey: true
		} );

		viewDocument.fire( 'clipboardInput', {
			dataTransfer: dataTransferMock,
			stopPropagation() {},
			preventDefault() {}
		} );

		expect( getModelData( model ) ).to.equal(
			'<paragraph>' +
			'<$text bold="true">Bolded </$text>' +
			'foo<softBreak></softBreak>bar[]' +
			'<$text bold="true">text.</$text>' +
			'</paragraph>'
		);
	} );

	function createDataTransfer( data ) {
		return {
			getData( type ) {
				return data[ type ];
			}
		};
	}

	function fireKeyEvent( key, options ) {
		viewDocument.fire( 'keydown', {
			keyCode: getCode( key ),
			preventDefault: () => {},
			domTarget: document.body,
			...options
		} );
	}
} );
