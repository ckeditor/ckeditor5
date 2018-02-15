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
import DomEventData from '../../src/view/observer/domeventdata';
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
			viewDoc = editor.editing.view;
			preventDefaultSpy = sinon.spy();

			editor.model.schema.extend( '$text', {
				allowAttributes: [ 'a', 'b', 'c' ],
				allowIn: '$root'
			} );

			editor.conversion.for( 'upcast' ).add( upcastElementToAttribute( { view: 'a', model: 'a' } ) );
			editor.conversion.for( 'upcast' ).add( upcastElementToAttribute( { view: 'b', model: 'b' } ) );
			editor.conversion.for( 'upcast' ).add( upcastElementToAttribute( { view: 'c', model: 'c' } ) );

			bindTwoStepCaretToAttribute( editor, emitter, 'a' );
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'moving right', () => {
		it( 'should "enter" the text with attribute in two steps', () => {
			setData( model, '<$text c="true">foo[]</$text><$text a="true" b="true">bar</$text>' );

			// Firing keyup event will simulate that caret is here as a result of right arrow key press.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowright } ) );

			// Gravity is not overridden, caret is at the beginning of the text but is "outside" of the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'c' ] );
			expect( selection.isGravityOverridden ).to.false;

			// Press right key.
			viewDoc.fire( 'keydown', getEventData( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} ) );

			// Gravity is overridden, caret movement is blocked, selection at the beginning but "inside" the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'a', 'b' ] );
			expect( selection.isGravityOverridden ).to.true;
			sinon.assert.calledOnce( preventDefaultSpy );

			// Press right key.
			viewDoc.fire( 'keydown', getEventData( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} ) );

			// Caret movement was not blocked this time (still once) so everything works normally.
			sinon.assert.calledOnce( preventDefaultSpy );
		} );

		it( 'should "leave" the text with attribute in two steps', () => {
			setData( model, '<$text a="true" b="true">bar[]</$text><$text c="true">foo</$text>' );

			// Firing keyup event will simulate that caret is here as a result of right arrow key press.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowright } ) );

			// Gravity is not overridden, caret is at the end of the text but is "inside" of the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'a', 'b' ] );
			expect( selection.isGravityOverridden ).to.false;

			// Press right key.
			viewDoc.fire( 'keydown', getEventData( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} ) );

			// Gravity is overridden, caret movement is blocked, selection at the beginning but "outside" the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'c' ] );
			expect( selection.isGravityOverridden ).to.true;
			sinon.assert.calledOnce( preventDefaultSpy );

			// Press right key.
			viewDoc.fire( 'keydown', getEventData( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} ) );

			// Caret movement was not blocked this time (still once) so everything works normally.
			sinon.assert.calledOnce( preventDefaultSpy );
		} );

		it( 'should do nothing for not bound attribute (at the beginning)', () => {
			setData( model, '[]<$text c="true">foo</$text>' );

			// Firing keyup event will simulate that caret is here as a result of right arrow key press.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowright } ) );

			viewDoc.fire( 'keydown', getEventData( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} ) );

			sinon.assert.notCalled( preventDefaultSpy );
			expect( selection.isGravityOverridden ).to.false;
		} );

		it( 'should do nothing for not bound attribute (at the end)', () => {
			setData( model, '<$text c="true">foo[]</$text>' );

			// Firing keyup event will simulate that caret is here as a result of right arrow key press.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowright } ) );

			viewDoc.fire( 'keydown', getEventData( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} ) );

			sinon.assert.notCalled( preventDefaultSpy );
			expect( selection.isGravityOverridden ).to.false;
		} );

		it( 'should do nothing for non-collapsed selection', () => {
			setData( model, '<$text c="true">fo[o]</$text><$text a="true" b="true">bar</$text>' );

			// Firing keyup event will simulate that caret is here as a result of left arrow key press.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowleft } ) );

			viewDoc.fire( 'keydown', getEventData( { keyCode: keyCodes.arrowright } ) );

			expect( selection.isGravityOverridden ).to.false;
		} );
	} );

	describe( 'moving left', () => {
		it( 'should "enter" the text with attribute in two steps', () => {
			setData( model, '<$text>foo</$text><$text a="true" b="true">bar[]</$text><$text c="true">biz</$text>' );

			// Firing keyup event will simulate that caret is here as a result of left arrow key press.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowleft } ) );

			// Gravity is overridden, caret is at the end of the text but is "outside" of the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'c' ] );
			expect( selection.isGravityOverridden ).to.true;

			// Press left key.
			viewDoc.fire( 'keydown', getEventData( {
				keyCode: keyCodes.arrowleft,
				preventDefault: preventDefaultSpy
			} ) );
			// Moving left needs additional keyup event to check that everything is right.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowleft } ) );

			// Caret movement was blocked but now is "inside" the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'a', 'b' ] );
			expect( selection.isGravityOverridden ).to.false;
			sinon.assert.calledOnce( preventDefaultSpy );

			// Press left key.
			viewDoc.fire( 'keydown', getEventData( {
				keyCode: keyCodes.arrowleft,
				preventDefault: preventDefaultSpy
			} ) );
			// Moving left needs additional keyup event to check that everything is right.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowleft } ) );

			// Caret movement was not blocked this time (still once) so everything works normally.
			sinon.assert.calledOnce( preventDefaultSpy );
		} );

		it( 'should "leave" the text with attribute in two steps', () => {
			setData( model, '<$text c="true">foo</$text><$text a="true" b="true">[]bar</$text>' );

			// Firing keyup event will simulate that caret is here as a result of left arrow key press.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowleft } ) );

			// Gravity is overridden, caret is at the beginning of the text and is "inside" of the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'a', 'b' ] );
			expect( selection.isGravityOverridden ).to.true;

			// Press left key.
			viewDoc.fire( 'keydown', getEventData( {
				keyCode: keyCodes.arrowleft,
				preventDefault: preventDefaultSpy
			} ) );
			// Moving left needs additional keyup event to check that everything is right.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowleft } ) );

			// Gravity is not overridden, caret movement was blocked but now is "outside" the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'c' ] );
			expect( selection.isGravityOverridden ).to.false;
			sinon.assert.calledOnce( preventDefaultSpy );

			// Press left key.
			viewDoc.fire( 'keydown', getEventData( {
				keyCode: keyCodes.arrowleft,
				preventDefault: preventDefaultSpy
			} ) );
			// Moving left needs additional keyup event to check that everything is right.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowleft } ) );

			// Caret movement was not blocked this time (still once) so everything works normally.
			sinon.assert.calledOnce( preventDefaultSpy );
		} );

		it( 'should do nothing for not bound attribute (at the beginning)', () => {
			setData( model, '<$text c="true">[]foo</$text>' );

			// Firing keyup event will simulate that caret is here as a result of left arrow key press.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowleft } ) );

			viewDoc.fire( 'keydown', getEventData( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} ) );
			// Moving left needs additional keyup event to check that everything is right.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowleft } ) );

			sinon.assert.notCalled( preventDefaultSpy );
			expect( selection.isGravityOverridden ).to.false;
		} );

		it( 'should do nothing for not bound attribute (at the end)', () => {
			setData( model, '<$text c="true">foo</$text>[]' );

			// Firing keyup event will simulate that caret is here as a result of left arrow key press.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowleft } ) );

			viewDoc.fire( 'keydown', getEventData( {
				keyCode: keyCodes.arrowright,
				preventDefault: preventDefaultSpy
			} ) );
			// Moving left needs additional keyup event to check that everything is right.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowleft } ) );

			sinon.assert.notCalled( preventDefaultSpy );
			expect( selection.isGravityOverridden ).to.false;
		} );

		it( 'should do nothing for non-collapsed selection', () => {
			setData( model, '<$text c="true">foo</$text><$text a="true" b="true">[b]ar</$text>', { lastRangeBackward: true } );

			// Firing keyup event will simulate that caret is here as a result of left arrow key press.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowleft } ) );

			expect( selection.isGravityOverridden ).to.false;
		} );

		// There is no need to test it while moving right, because moving right does not use additional state.
		it( 'should work when external changes are made meanwhile', () => {
			setData( model, '<$text>foo</$text><$text a="true" b="true">bar[]</$text><$text c="true">biz</$text>' );

			// Firing keyup event will simulate that caret is here as a result of left arrow key press.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowleft } ) );

			// Gravity is overridden, caret is at the end of the text but is "outside" of the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'c' ] );
			expect( selection.isGravityOverridden ).to.true;

			// External changes.
			model.change( writer => {
				writer.insertText( 'abc', Position.createAt( editor.model.document.getRoot() ) );
			} );

			// Press left key.
			viewDoc.fire( 'keydown', getEventData( {
				keyCode: keyCodes.arrowleft,
				preventDefault: preventDefaultSpy
			} ) );
			// Moving left needs additional keyup event to check that everything is right.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowleft } ) );

			// Caret movement was blocked but now is "inside" the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'a', 'b' ] );
			expect( selection.isGravityOverridden ).to.false;
			sinon.assert.calledOnce( preventDefaultSpy );
		} );

		// There is no need to test it while moving right, because moving right does not use additional state.
		it( 'should not block caret when while doing two steps movement and text is removed by external change', () => {
			setData( model, '<$text c="true">foo</$text><$text a="true" b="true">[]bar</$text>biz' );

			// Firing keyup event will simulate that caret is here as a result of left arrow key press.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowleft } ) );

			// Gravity is overridden, caret is at the beginning of the text and is "inside" of the text.
			expect( Array.from( selection.getAttributeKeys() ) ).to.have.members( [ 'a', 'b' ] );
			expect( selection.isGravityOverridden ).to.true;

			// External changes.
			model.change( writer => {
				writer.remove( Range.createFromPositionAndShift( new Position( editor.model.document.getRoot(), [ 2 ] ), 5 ) );
			} );

			// Press left key.
			viewDoc.fire( 'keydown', getEventData( {
				keyCode: keyCodes.arrowleft,
				preventDefault: preventDefaultSpy
			} ) );
			// Moving left needs additional keyup event to check that everything is right.
			viewDoc.fire( 'keyup', getEventData( { keyCode: keyCodes.arrowleft } ) );

			sinon.assert.notCalled( preventDefaultSpy );
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
			viewDoc.fire( 'keydown', getEventData( { keyCode: keyCodes.arrowup } ) );
		} ).to.not.throw();
	} );

	function getEventData( data ) {
		data.target = document.body;

		return new DomEventData( viewDoc, data, { keyCode: data.keyCode } );
	}
} );
