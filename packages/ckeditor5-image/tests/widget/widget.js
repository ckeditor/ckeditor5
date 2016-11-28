/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from 'tests/core/_utils/virtualtesteditor.js';
import Widget from 'ckeditor5/image/widget/widget.js';
import MouseObserver from 'ckeditor5/engine/view/observer/mouseobserver.js';
import buildModelConverter from 'ckeditor5/engine/conversion/buildmodelconverter.js';
import { widgetize } from 'ckeditor5/image/widget/utils.js';
import ViewContainer from 'ckeditor5/engine/view/containerelement.js';
import AttributeContainer from 'ckeditor5/engine/view/attributeelement.js';
import { setData as setModelData, getData as getModelData } from 'ckeditor5/engine/dev-utils/model.js';

describe( 'Widget', () => {
	let editor, document, viewDocument;

	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ Widget ]
		} )
			.then( newEditor => {
				editor = newEditor;
				document = editor.document;
				viewDocument = editor.editing.view;

				document.schema.registerItem( 'widget', '$block' );
				document.schema.registerItem( 'paragraph', '$block' );

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'paragraph' )
					.toElement( 'p' );

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'widget' )
					.toElement( () => {
						const b = new AttributeContainer( 'b' );
						const div = new ViewContainer( 'div', null, b );

						return widgetize( div );
					} );
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Widget ) ).to.be.instanceOf( Widget );
	} );

	it( 'should add MouseObserver', () => {
		expect( editor.editing.view.getObserver( MouseObserver ) ).to.be.instanceof( MouseObserver );
	} );

	it( 'should create selection over clicked widget', () => {
		setModelData( document, '[]<widget></widget>' );
		const viewDiv = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = {
			target: viewDiv,
			preventDefault: sinon.spy()
		};

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( getModelData( document ) ).to.equal( '[<widget></widget>]' );
		sinon.assert.calledOnce( domEventDataMock.preventDefault );
	} );

	it( 'should create selection when clicked in nested element', () => {
		setModelData( document, '[]<widget></widget>' );
		const viewDiv = viewDocument.getRoot().getChild( 0 );
		const viewB = viewDiv.getChild( 0 );
		const domEventDataMock = {
			target: viewB,
			preventDefault: sinon.spy()
		};

		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( getModelData( document ) ).to.equal( '[<widget></widget>]' );
		sinon.assert.calledOnce( domEventDataMock.preventDefault );
	} );

	it( 'should do nothing if clicked in non-widget element', () => {
		setModelData( document, '<paragraph>[]foo bar</paragraph><widget></widget>' );
		const viewP = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = {
			target: viewP,
			preventDefault: sinon.spy()
		};

		viewDocument.focus();
		viewDocument.fire( 'mousedown', domEventDataMock );

		expect( getModelData( document ) ).to.equal( '<paragraph>[]foo bar</paragraph><widget></widget>' );
		sinon.assert.notCalled( domEventDataMock.preventDefault );
	} );

	it( 'should not focus editable if already is focused', () => {
		setModelData( document, '<widget></widget>' );
		const widget = viewDocument.getRoot().getChild( 0 );
		const domEventDataMock = {
			target: widget,
			preventDefault: sinon.spy()
		};
		const focusSpy = sinon.spy( viewDocument, 'focus' );

		viewDocument.isFocused = true;
		viewDocument.fire( 'mousedown', domEventDataMock );

		sinon.assert.calledOnce( domEventDataMock.preventDefault );
		sinon.assert.notCalled( focusSpy );
		expect( getModelData( document ) ).to.equal( '[<widget></widget>]' );
	} );
} );
