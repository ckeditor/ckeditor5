/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import bindTwoStepCaretToAttribute from '../../src/utils/bindtwostepcarettoattribute';
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

			testTwoStepCaretMovement( [
				// Gravity is not overridden, caret is at the beginning of the text but is "outside" of the text.
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				// Gravity is overridden, caret movement is blocked, selection at the beginning but "inside" the text.
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: true, preventDefault: 1 },
				'→',
				// Caret movement was not blocked this time (still once) so everything works normally.
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 1 },
			] );
		} );

		it( 'should "leave" the text with attribute in two steps', () => {
			setData( model, '<$text a="true" b="true">bar[]</$text><$text c="true">foo</$text>' );

			testTwoStepCaretMovement( [
				// Gravity is not overridden, caret is at the end of the text but is "inside" of the text.
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				// Gravity is overridden, caret movement is blocked, selection at the end but "outside" the text.
				{ selectionAttributes: [ 'c' ], isGravityOverridden: true, preventDefault: 1 },
				'→',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 1 },
			] );
		} );

		it( 'should do nothing for not bound attribute (at the beginning)', () => {
			setData( model, '[]<$text c="true">foo</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 },
			] );
		} );

		it( 'should do nothing for not bound attribute (at the end)', () => {
			setData( model, '<$text c="true">foo[]</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 },
			] );
		} );

		it( 'should require two-steps movement when caret goes between text node with the same attribute but different value', () => {
			setData( model, '<$text a="1">bar[]</$text><$text a="2">foo</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 1 },
				'→',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 1 },
			] );
		} );
	} );

	describe( 'moving left', () => {
		it( 'should "enter" the text with attribute in two steps', () => {
			setData( model, '<$text>foo</$text><$text a="true" b="true">bar</$text><$text c="true">b[]iz</$text>' );

			testTwoStepCaretMovement( [
				// Gravity is not overridden, caret is a one character after the and of the text.
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				// Caret movement was not blocked but the gravity is overridden.
				{ selectionAttributes: [ 'c' ], isGravityOverridden: true, preventDefault: 0 },
				'←',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 1 },
				'←',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 1 },
			] );
		} );

		it( 'should "leave" the text with attribute in two steps', () => {
			setData( model, '<$text c="true">foo</$text><$text a="true" b="true">b[]ar</$text>' );

			testTwoStepCaretMovement( [
				// Gravity is not overridden, caret is a one character after the beginning of the text.
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				// Caret movement was not blocked.
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: true, preventDefault: 0 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 1 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 1 }
			] );
		} );

		it( 'should do nothing for not bound attribute (at the beginning)', () => {
			setData( model, '<$text c="true">[]foo</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 }
			] );
		} );

		it( 'should do nothing for not bound attribute (at the end)', () => {
			setData( model, '<$text c="true">foo</$text>[]' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 }
			] );
		} );

		it( 'should do nothing when caret is at the beginning of block element', () => {
			setData( model, '[]foo', { lastRangeBackward: true } );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0 },
				'←',
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0 },
			] );
		} );

		it( 'should require two-steps movement when caret goes between text node with the same attribute but different value', () => {
			setData( model, '<$text a="2">foo</$text><$text a="1">b[]ar</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 0 },
				'←',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 1 },
				'←',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 1 }
			] );
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

	const keyMap = {
		'→': 'arrowright',
		'←': 'arrowleft'
	};

	function fireKeyDownEvent( options ) {
		const eventData = Object.assign( { domTarget: document.body }, options );

		viewDoc.fire( 'keydown', eventData );
	}

	function getSelectionAttributesArray( selection ) {
		return Array.from( selection.getAttributeKeys() );
	}

	function testTwoStepCaretMovement( scenario ) {
		for ( const step of scenario ) {
			if ( typeof step == 'string' ) {
				let preventDefaultCalled;

				fireKeyDownEvent( {
					keyCode: keyCodes[ keyMap[ step ] ],
					preventDefault: () => {
						preventDefaultSpy();

						preventDefaultCalled = true;
					}
				} );

				if ( !preventDefaultCalled ) {
					const position = selection.getFirstPosition();
					let shift;

					if ( step == '→' ) {
						if ( position.isAtEnd ) {
							return;
						}

						shift = 1;
					} else if ( step == '←' ) {
						if ( position.isAtStart ) {
							return;
						}

						shift = -1;
					}

					model.change( writer => {
						writer.setSelection( selection.getFirstPosition().getShiftedBy( shift ) );
					} );
				}
			} else {
				const stepIndex = scenario.indexOf( step );
				const stepString = `in step #${ stepIndex } (${ JSON.stringify( step ) })`;

				expect( getSelectionAttributesArray( selection ) ).to.have.members( step.selectionAttributes, '#attributes ' + stepString );
				expect( selection.isGravityOverridden ).to.equal( step.isGravityOverridden, '#isGravityOverridden ' + stepString );
				expect( preventDefaultSpy.callCount ).to.equal( step.preventDefault, '#preventDefault ' + stepString );
			}
		}
	}
} );

