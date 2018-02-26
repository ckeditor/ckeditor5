/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import bindTwoStepCaretToAttribute from '../../src/utils/bindtwostepcarettoattribute';
import Position from '../../src/model/position';
import Range from '../../src/model/range';
import { upcastElementToAttribute } from '../../src/conversion/upcast-converters';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

import { setData } from '../../src/dev-utils/model';

describe( 'bindTwoStepCaretToAttribute()', () => {
	let editor, model, emitter, selection, viewDoc, preventDefaultSpy;

	beforeEach( () => {
		emitter = Object.create( DomEmitterMixin );

		return VirtualTestEditor.create().then( newEditor => {
			editor = newEditor;
			model = editor.model;
			selection = model.document.selection;
			viewDoc = editor.editing.view.document;
			preventDefaultSpy = sinon.spy();

			editor.model.schema.extend( '$text', {
				allowAttributes: [ 'a', 'b', 'c' ],
				allowIn: '$root'
			} );

			editor.conversion.for( 'upcast' ).add( upcastElementToAttribute( { view: 'a', model: 'a' } ) );
			editor.conversion.for( 'upcast' ).add( upcastElementToAttribute( { view: 'b', model: 'b' } ) );
			editor.conversion.for( 'upcast' ).add( upcastElementToAttribute( { view: 'c', model: 'c' } ) );

			bindTwoStepCaretToAttribute( editor.editing.view, editor.model, emitter, 'a' );
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'moving right', () => {
		it( 'should "enter" the text with attribute in two steps', () => {
			setData( model, '<$text c="true">foo[]</$text><$text a="true" b="true">bar</$text>' );

			// Gravity is not overridden, caret is at the beginning of the text but is "outside" of the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'c' ] );
			expect( selection.isGravityOverridden ).to.false;

			// Press right key.
			fireKeyDownEvent( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} );

			// Gravity is overridden, caret movement is blocked, selection at the beginning but "inside" the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'a', 'b' ] );
			expect( selection.isGravityOverridden ).to.true;
			sinon.assert.calledOnce( preventDefaultSpy );

			// Press right key.
			fireKeyDownEvent( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} );

			// Caret movement was not blocked this time (still once) so everything works normally.
			sinon.assert.calledOnce( preventDefaultSpy );
		} );

		it( 'should "leave" the text with attribute in two steps', () => {
			setData( model, '<$text a="true" b="true">bar[]</$text><$text c="true">foo</$text>' );

			// Gravity is not overridden, caret is at the end of the text but is "inside" of the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'a', 'b' ] );
			expect( selection.isGravityOverridden ).to.false;

			// Press right key.
			fireKeyDownEvent( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} );

			// Gravity is overridden, caret movement is blocked, selection at the end but "outside" the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'c' ] );
			expect( selection.isGravityOverridden ).to.true;
			sinon.assert.calledOnce( preventDefaultSpy );

			// Press right key.
			fireKeyDownEvent( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} );

			// Caret movement was not blocked this time (still once) so everything works normally.
			sinon.assert.calledOnce( preventDefaultSpy );
		} );

		it( 'should do nothing for not bound attribute (at the beginning)', () => {
			setData( model, '[]<$text c="true">foo</$text>' );

			fireKeyDownEvent( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} );

			sinon.assert.notCalled( preventDefaultSpy );
			expect( selection.isGravityOverridden ).to.false;
		} );

		it( 'should do nothing for not bound attribute (at the end)', () => {
			setData( model, '<$text c="true">foo[]</$text>' );

			fireKeyDownEvent( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} );

			sinon.assert.notCalled( preventDefaultSpy );
			expect( selection.isGravityOverridden ).to.false;
		} );

		it( 'should require two-steps movement when caret goes between text node with the same attribute but different value', () => {
			setData( model, '<$text a="1">bar[]</$text><$text a="2">foo</$text>' );

			// Gravity is not overridden.
			expect( selection.isGravityOverridden ).to.false;

			// Press right key.
			fireKeyDownEvent( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} );

			// Gravity is overridden, caret movement is blocked.
			expect( selection.isGravityOverridden ).to.true;
			sinon.assert.calledOnce( preventDefaultSpy );
		} );
	} );

	describe( 'moving left', () => {
		it( 'should "enter" the text with attribute in two steps', () => {
			setData( model, '<$text>foo</$text><$text a="true" b="true">bar</$text><$text c="true">b[]iz</$text>' );

			// Gravity is not overridden, caret is a one character after the and of the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'c' ] );
			expect( selection.isGravityOverridden ).to.false;

			// Press left key.
			fireKeyDownEvent( {
				keyCode: keyCodes.arrowleft,
				preventDefault: preventDefaultSpy
			} );

			// Caret movement was not blocked.
			sinon.assert.notCalled( preventDefaultSpy );

			// So we need to move caret one character left like it should be done in the real world.
			// Caret should ends up at the end of text with attribute but still outside of it.
			model.change( writer => writer.setSelection( new Range( new Position( model.document.getRoot(), [ 6 ] ) ) ) );

			// Gravity is overridden.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'c' ] );
			expect( selection.isGravityOverridden ).to.true;

			// Press left key.
			fireKeyDownEvent( {
				keyCode: keyCodes.arrowleft,
				preventDefault: preventDefaultSpy
			} );

			// Caret movement was blocked but now is "inside" the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'a', 'b' ] );
			expect( selection.isGravityOverridden ).to.false;
			sinon.assert.calledOnce( preventDefaultSpy );

			// Press left key.
			fireKeyDownEvent( {
				keyCode: keyCodes.arrowleft,
				preventDefault: preventDefaultSpy
			} );

			// Caret movement was not blocked this time (still once) so everything works normally.
			sinon.assert.calledOnce( preventDefaultSpy );

			// And again we need to move the caret like it should be done in the real world to be shure that everything is
			// like it should to be.
			model.change( writer => writer.setSelection( new Range( new Position( model.document.getRoot(), [ 5 ] ) ) ) );
		} );

		it( 'should "leave" the text with attribute in two steps', () => {
			setData( model, '<$text c="true">foo</$text><$text a="true" b="true">b[]ar</$text>' );

			// Gravity is not overridden, caret is a one character after the beginning of the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'a', 'b' ] );
			expect( selection.isGravityOverridden ).to.false;

			// Press left key.
			fireKeyDownEvent( {
				keyCode: keyCodes.arrowleft,
				preventDefault: preventDefaultSpy
			} );

			// Caret movement was not blocked.
			sinon.assert.notCalled( preventDefaultSpy );

			// So we need to move caret one character left like it should be done in the real world.
			// Caret should ends up at the beginning of text with attribute but still inside of it.
			model.change( writer => writer.setSelection( new Range( new Position( model.document.getRoot(), [ 3 ] ) ) ) );

			// Gravity is overridden, caret is at the beginning of the text and is "inside" of the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'a', 'b' ] );
			expect( selection.isGravityOverridden ).to.true;

			// Press left key.
			fireKeyDownEvent( {
				keyCode: keyCodes.arrowleft,
				preventDefault: preventDefaultSpy
			} );

			// Gravity is not overridden, caret movement was blocked but now is "outside" the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'c' ] );
			expect( selection.isGravityOverridden ).to.false;
			sinon.assert.calledOnce( preventDefaultSpy );

			// Press left key.
			fireKeyDownEvent( {
				keyCode: keyCodes.arrowleft,
				preventDefault: preventDefaultSpy
			} );

			// Caret movement was not blocked this time (still once) so everything works normally.
			sinon.assert.calledOnce( preventDefaultSpy );
		} );

		it( 'should do nothing for not bound attribute (at the beginning)', () => {
			setData( model, '<$text c="true">[]foo</$text>' );

			fireKeyDownEvent( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} );

			sinon.assert.notCalled( preventDefaultSpy );
			expect( selection.isGravityOverridden ).to.false;
		} );

		it( 'should do nothing for not bound attribute (at the end)', () => {
			setData( model, '<$text c="true">foo</$text>[]' );

			fireKeyDownEvent( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} );

			sinon.assert.notCalled( preventDefaultSpy );
			expect( selection.isGravityOverridden ).to.false;
		} );

		it( 'should do nothing when caret is at the beginning of block element', () => {
			setData( model, '[]foo', { lastRangeBackward: true } );

			expect( () => {
				fireKeyDownEvent( { keyCode: keyCodes.arrowleft } );
			} ).to.not.throw();
		} );

		it( 'should require two-steps movement when caret goes between text node with the same attribute but different value', () => {
			setData( model, '<$text a="2">foo</$text><$text a="1">b[]ar</$text>' );

			// Gravity is not overridden.
			expect( selection.isGravityOverridden ).to.false;

			// Press left key.
			fireKeyDownEvent( {
				keyCode: keyCodes.arrowleft,
				preventDefault: preventDefaultSpy
			} );

			// Gravity is overridden, caret movement was not blocked.
			sinon.assert.notCalled( preventDefaultSpy );
			expect( selection.isGravityOverridden ).to.true;
		} );
	} );

	describe( 'mouse', () => {
		it( 'should not override gravity when selection is placed at the beginning of text', () => {
			setData( model, '<$text a="true">[]foo</$text>' );

			expect( selection.isGravityOverridden ).to.false;
		} );

		it( 'should not override gravity when selection is placed at the end of text', () => {
			setData( model, '<$text a="true">foo[]</$text>' );

			expect( selection.isGravityOverridden ).to.false;
		} );
	} );

	it( 'should do nothing when key other then arrow left and right is pressed', () => {
		setData( model, '<$text a="true">foo[]</$text>' );

		expect( () => {
			fireKeyDownEvent( { keyCode: keyCodes.arrowup } );
		} ).to.not.throw();
	} );

	it( 'should do nothing for non-collapsed selection', () => {
		setData( model, '<$text c="true">fo[o]</$text><$text a="true" b="true">bar</$text>' );

		fireKeyDownEvent( { keyCode: keyCodes.arrowright } );

		expect( selection.isGravityOverridden ).to.false;
	} );

	it( 'should do nothing when shift key is pressed', () => {
		setData( model, '<$text c="true">foo</$text><$text a="true" b="true">b[]ar</$text>' );

		fireKeyDownEvent( {
			keyCode: keyCodes.arrowleft,
			shiftKey: true
		} );

		expect( selection.isGravityOverridden ).to.false;
	} );

	it( 'should do nothing when alt key is pressed', () => {
		setData( model, '<$text c="true">foo</$text><$text a="true" b="true">b[]ar</$text>' );

		fireKeyDownEvent( {
			keyCode: keyCodes.arrowleft,
			altKey: true
		} );

		expect( selection.isGravityOverridden ).to.false;
	} );

	it( 'should do nothing when ctrl key is pressed', () => {
		setData( model, '<$text c="true">foo</$text><$text a="true" b="true">b[]ar</$text>' );

		fireKeyDownEvent( {
			keyCode: keyCodes.arrowleft,
			ctrlKey: true
		} );

		expect( selection.isGravityOverridden ).to.false;
	} );

	function fireKeyDownEvent( options ) {
		const eventData = Object.assign( { domTarget: document.body }, options );

		viewDoc.fire( 'keydown', eventData );
	}
} );
