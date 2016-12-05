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
import DomEventData from 'ckeditor5/engine/view/observer/domeventdata.js';
import AttributeContainer from 'ckeditor5/engine/view/attributeelement.js';
import { setData as setModelData, getData as getModelData } from 'ckeditor5/engine/dev-utils/model.js';
import { keyCodes } from 'ckeditor5/utils/keyboard.js';

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
				document.schema.objects.add( 'widget' );
				document.schema.registerItem( 'paragraph', '$block' );
				document.schema.registerItem( 'inline', '$inline' );
				document.schema.objects.add( 'inline' );

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

				buildModelConverter().for( editor.editing.modelToView )
					.fromElement( 'inline' )
					.toElement( 'figure' );
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

	describe( 'delete and backspace handling', () => {
		test(
			'should select widget when backspace is pressed',
			'<widget></widget><paragraph>[]foo</paragraph>',
			keyCodes.backspace,
			'[<widget></widget>]<paragraph>foo</paragraph>'
		);

		test(
			'should remove empty element after selecting widget when backspace is pressed',
			'<widget></widget><paragraph>[]</paragraph>',
			keyCodes.backspace,
			'[<widget></widget>]'
		);

		test(
			'should select widget when delete is pressed',
			'<paragraph>foo[]</paragraph><widget></widget>',
			keyCodes.delete,
			'<paragraph>foo</paragraph>[<widget></widget>]'
		);

		test(
			'should remove empty element after selecting widget when delete is pressed',
			'<paragraph>[]</paragraph><widget></widget>',
			keyCodes.delete,
			'[<widget></widget>]'
		);

		test(
			'should not respond to other keys',
			'<widget></widget><paragraph>[]foo</paragraph>',
			65,
			'<widget></widget><paragraph>[]foo</paragraph>'
		);

		test(
			'should do nothing on non-collapsed selection',
			'<widget></widget><paragraph>[f]oo</paragraph>',
			keyCodes.backspace,
			'<widget></widget><paragraph>[f]oo</paragraph>'
		);

		test(
			'should do nothing on non-object elements',
			'<paragraph>foo</paragraph><paragraph>[]bar</paragraph>',
			keyCodes.backspace,
			'<paragraph>foo</paragraph><paragraph>[]bar</paragraph>'
		);

		test(
			'should work correctly with modifier key: backspace + ctrl',
			'<widget></widget><paragraph>[]foo</paragraph>',
			{ keyCode: keyCodes.backspace, ctrlKey: true, preventDefault: () => {} },
			'[<widget></widget>]<paragraph>foo</paragraph>'
		);

		test(
			'should work correctly with modifier key: backspace + alt',
			'<widget></widget><paragraph>[]foo</paragraph>',
			{ keyCode: keyCodes.backspace, altKey: true, preventDefault: () => {} },
			'[<widget></widget>]<paragraph>foo</paragraph>'
		);

		test(
			'should work correctly with modifier key: backspace + shift',
			'<widget></widget><paragraph>[]foo</paragraph>',
			{ keyCode: keyCodes.backspace, shiftKey: true, preventDefault: () => {} },
			'[<widget></widget>]<paragraph>foo</paragraph>'
		);

		test(
			'should work correctly with modifier key: delete + ctrl',
			'<paragraph>foo[]</paragraph><widget></widget>',
			{ keyCode: keyCodes.delete, ctrlKey: true, preventDefault: () => {} },
			'<paragraph>foo</paragraph>[<widget></widget>]'
		);

		test(
			'should work correctly with modifier key: delete + alt',
			'<paragraph>foo[]</paragraph><widget></widget>',
			{ keyCode: keyCodes.delete, altKey: true, preventDefault: () => {} },
			'<paragraph>foo</paragraph>[<widget></widget>]'
		);

		test(
			'should work correctly with modifier key: delete + shift',
			'<paragraph>foo[]</paragraph><widget></widget>',
			{ keyCode: keyCodes.delete, shiftKey: true, preventDefault: () => {} },
			'<paragraph>foo</paragraph>[<widget></widget>]'
		);

		test(
			'should not modify backspace default behaviour in single paragraph boundaries',
			'<paragraph>[]foo</paragraph>',
			keyCodes.backspace,
			'<paragraph>[]foo</paragraph>'
		);

		test(
			'should not modify delete default behaviour in single paragraph boundaries',
			'<paragraph>foo[]</paragraph>',
			keyCodes.delete,
			'<paragraph>foo[]</paragraph>'
		);

		test(
			'should do nothing on selected widget preceded by a paragraph - backspace',
			'<paragraph>foo</paragraph>[<widget></widget>]',
			keyCodes.backspace,
			'<paragraph>foo</paragraph>[<widget></widget>]'
		);

		test(
			'should do nothing on selected widget preceded by another widget - backspace',
			'<widget></widget>[<widget></widget>]',
			keyCodes.backspace,
			'<widget></widget>[<widget></widget>]'
		);

		test(
			'should do nothing on selected widget before paragraph - backspace',
			'[<widget></widget>]<paragraph>foo</paragraph>',
			keyCodes.backspace,
			'[<widget></widget>]<paragraph>foo</paragraph>'
		);

		test(
			'should do nothing on selected widget before another widget - backspace',
			'[<widget></widget>]<widget></widget>',
			keyCodes.backspace,
			'[<widget></widget>]<widget></widget>'
		);

		test(
			'should do nothing on selected widget between paragraphs - backspace',
			'<paragraph>bar</paragraph>[<widget></widget>]<paragraph>foo</paragraph>',
			keyCodes.backspace,
			'<paragraph>bar</paragraph>[<widget></widget>]<paragraph>foo</paragraph>'
		);

		test(
			'should do nothing on selected widget between other widgets - backspace',
			'<widget></widget>[<widget></widget>]<widget></widget>',
			keyCodes.backspace,
			'<widget></widget>[<widget></widget>]<widget></widget>'
		);

		test(
			'should do nothing on selected widget preceded by a paragraph - delete',
			'<paragraph>foo</paragraph>[<widget></widget>]',
			keyCodes.delete,
			'<paragraph>foo</paragraph>[<widget></widget>]'
		);

		test(
			'should do nothing on selected widget preceded by another widget - delete',
			'<widget></widget>[<widget></widget>]',
			keyCodes.delete,
			'<widget></widget>[<widget></widget>]'
		);

		test(
			'should do nothing on selected widget before paragraph - delete',
			'[<widget></widget>]<paragraph>foo</paragraph>',
			keyCodes.delete,
			'[<widget></widget>]<paragraph>foo</paragraph>'
		);

		test(
			'should do nothing on selected widget before another widget - delete',
			'[<widget></widget>]<widget></widget>',
			keyCodes.delete,
			'[<widget></widget>]<widget></widget>'
		);

		test(
			'should do nothing on selected widget between paragraphs - delete',
			'<paragraph>bar</paragraph>[<widget></widget>]<paragraph>foo</paragraph>',
			keyCodes.delete,
			'<paragraph>bar</paragraph>[<widget></widget>]<paragraph>foo</paragraph>'
		);

		test(
			'should do nothing on selected widget between other widgets - delete',
			'<widget></widget>[<widget></widget>]<widget></widget>',
			keyCodes.delete,
			'<widget></widget>[<widget></widget>]<widget></widget>'
		);

		test(
			'should select inline objects - backspace',
			'<paragraph>foo<inline></inline>[]bar</paragraph>',
			keyCodes.backspace,
			'<paragraph>foo[<inline></inline>]bar</paragraph>'
		);

		test(
			'should select inline objects - delete',
			'<paragraph>foo[]<inline></inline>bar</paragraph>',
			keyCodes.delete,
			'<paragraph>foo[<inline></inline>]bar</paragraph>'
		);

		test(
			'should do nothing on selected inline objects - backspace',
			'<paragraph>foo[<inline></inline>]bar</paragraph>',
			keyCodes.backspace,
			'<paragraph>foo[<inline></inline>]bar</paragraph>'
		);

		test(
			'should do nothing on selected inline objects - delete',
			'<paragraph>foo[<inline></inline>]bar</paragraph>',
			keyCodes.delete,
			'<paragraph>foo[<inline></inline>]bar</paragraph>'
		);

		it( 'should prevent default behaviour and stop event propagation', () => {
			const keydownHandler = sinon.spy();
			const domEventDataMock = {
				keyCode: keyCodes.delete,
				preventDefault: sinon.spy(),
			};
			setModelData( document, '<paragraph>foo[]</paragraph><widget></widget>' );
			viewDocument.on( 'keydown',  keydownHandler );

			viewDocument.fire( 'keydown', domEventDataMock );

			expect( getModelData( document ) ).to.equal( '<paragraph>foo</paragraph>[<widget></widget>]' );
			sinon.assert.calledOnce( domEventDataMock.preventDefault );
			sinon.assert.notCalled( keydownHandler );
		} );

		function test( name, data, keyCodeOrMock, expected ) {
			it( name, () => {
				const domEventDataMock = ( typeof keyCodeOrMock == 'object' ) ? keyCodeOrMock : {
					keyCode: keyCodeOrMock
				};

				setModelData( document, data );
				viewDocument.fire( 'keydown', new DomEventData(
					viewDocument,
					{ target: null, preventDefault: () => {} },
					domEventDataMock
				) );

				expect( getModelData( document ) ).to.equal( expected );
			} );
		}
	} );
} );
