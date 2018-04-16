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
		it( 'should do nothing for unrelated attribute (at the beginning)', () => {
			setData( model, '[]<$text c="true">foo</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 },
			] );
		} );

		it( 'should do nothing for unrelated attribute (at the end)', () => {
			setData( model, '<$text c="true">foo[]</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 },
			] );
		} );

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

		it( 'should use two-steps movement when between nodes with the same attribute but different value', () => {
			setData( model, '<$text a="1">bar[]</$text><$text a="2">foo</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				// <$text a="1">bar</$text>[]<$text a="2">foo</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1 },
				'→',
				// <$text a="1">bar</$text><$text a="2">[]foo</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 2 },
				'→',
				// <$text a="1">bar</$text><$text a="2">f[]oo</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 2 }
			] );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/937
		it( 'should not require two-steps between unrelated attributes inside the initial attribute', () => {
			setData( model, '<$text a="1">fo[]o</$text><$text a="1" b="2">bar</$text><$text a="1">baz</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 }
			] );
		} );

		it( 'should handle passing through the only character in the block', () => {
			setData( model, '[]<$text a="1">x</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1 },
				'→',
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1 }
			] );
		} );

		it( 'should handle passing through the only character in the block (no attribute in the initial selection)', () => {
			setData( model, '[]<$text a="1">x</$text>' );

			model.change( writer => writer.removeSelectionAttribute( 'a' ) );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0 },
				'→',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 1 },
				'→',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 1 },
				'→',
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 2 },
				'→',
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 2 }
			] );
		} );

		it( 'should handle passing through the only-child with an attribute (multiple characters)', () => {
			setData( model, '[]<$text a="1">xyz</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				// <$text a="1">x{}yz</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				// <$text a="1">xy{}z</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				// <$text a="1">xyz{}</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				// <$text a="1">xyz</$text>{}
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1 },
				'→',
				// <$text a="1">xyz</$text>{}
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1 }
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

		it( 'should do nothing for unrelated attribute (at the beginning)', () => {
			setData( model, '<$text c="true">[]foo</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0 }
			] );
		} );

		it( 'should do nothing for unrelated attribute (at the end)', () => {
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
				// <$text a="2">foo</$text><$text a="1">[]bar</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 0 },
				'←',
				// <$text a="2">foo</$text>[]<$text a="1">bar</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1 },
				'←',
				// <$text a="2">foo[]</$text><$text a="1">bar</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 2 },
				'←',
				// <$text a="2">fo[]o</$text><$text a="1">bar</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 2 }
			] );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/937
		it( 'should not require two-steps between unrelated attributes inside the initial attribute', () => {
			setData( model, '<$text a="1">foo</$text><$text a="1" b="2">bar</$text><$text a="1">b[]az</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 }
			] );
		} );

		it( 'should handle passing through the only-child with an attribute (single character)', () => {
			setData( model, '<$text a="1">x</$text>[]' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				// <$text a="1">{}x</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				// {}<$text a="1">x</$text> (because it's a first-child)
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0 },
				'←',
				// {}<$text a="1">x</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0 }
			] );
		} );

		it( 'should handle passing through the only character in the block (no attribute in the initial selection)', () => {
			setData( model, '<$text a="1">x</$text>[]' );

			model.change( writer => writer.removeSelectionAttribute( 'a' ) );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0 },
				'←',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 1 },
				'←',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 1 },
				'←',
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1 },
				'←',
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1 }
			] );
		} );

		it( 'should handle passing through the only-child with an attribute (multiple characters)', () => {
			setData( model, '<$text a="1">xyz</$text>[]' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				// <$text a="1">xy{}z</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				// <$text a="1">x{}yz</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				// <$text a="1">{}xyz</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 0 },
				'←',
				// {}<$text a="1">xyz</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1 },
				'←',
				// {}<$text a="1">xyz</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1 }
			] );
		} );
	} );

	describe( 'moving and typing around the attribute', () => {
		it( 'should handle typing after the attribute', () => {
			setData( model, '<$text a="1">x[]</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'y',
				// <$text a="1">xy[]</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'→',
				// <$text a="1">xy</$text>[]
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1 },
				'z',
				// <$text a="1">xy</$text>z[]
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1 },
				'←',
				// <$text a="1">xy</$text>[]z
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1 },
				'←',
				// <$text a="1">xy[]</$text>z
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 2 },
				'w',
				// <$text a="1">xyw[]</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 2 },
			] );
		} );

		it( 'should handle typing before the attribute', () => {
			setData( model, '<$text a="1">[]x</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
				'←',
				// []<$text a="1">x</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0 },
				'z',
				// z[]<$text a="1">x</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0 },
				'x',
				// zx[]<$text a="1">x</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0 },
				'→',
				// zx<$text a="1">[]x</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 1 },
				'a',
				// zx<$text a="1">a[]x</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 1 },
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

	it( 'should do nothing when the not a direct selection change but at the attribute boundary', () => {
		setData( model, '<$text a="true">foo[]</$text>bar' );

		testTwoStepCaretMovement( [
			{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0 },
			'→',
			{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1 },
		] );

		// Simulate an external text insertion BEFORE the user selection to trigger #change:range.
		model.enqueueChange( 'transparent', writer => {
			writer.insertText( 'x', selection.getFirstPosition().getShiftedBy( -2 ) );
		} );

		expect( selection.isGravityOverridden ).to.true;
		expect( getSelectionAttributesArray( selection ) ).to.have.members( [] );
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
				// An arrow key pressed. Fire the view event and update the model selection.
				if ( keyMap[ step ] ) {
					let preventDefaultCalled;

					fireKeyDownEvent( {
						keyCode: keyCodes[ keyMap[ step ] ],
						preventDefault: () => {
							preventDefaultSpy();

							preventDefaultCalled = true;
						}
					} );

					const position = selection.getFirstPosition();

					if ( !preventDefaultCalled ) {
						if ( step == '→' ) {
							if ( !position.isAtEnd ) {
								model.change( writer => {
									writer.setSelection( selection.getFirstPosition().getShiftedBy( 1 ) );
								} );
							}
						} else if ( step == '←' ) {
							if ( !position.isAtStart ) {
								model.change( writer => {
									writer.setSelection( selection.getFirstPosition().getShiftedBy( -1 ) );
								} );
							}
						}
					}
				}

				// A regular key pressed. Type some text in the model.
				else {
					model.change( writer => {
						writer.insertText( step, selection.getAttributes(), selection.getFirstPosition() );
					} );
				}
			}

			// If not a key, then it's an assertion.
			else {
				const stepIndex = scenario.indexOf( step );
				const stepString = `in step #${ stepIndex } ${ JSON.stringify( step ) }`;

				expect( getSelectionAttributesArray( selection ) ).to.have.members( step.selectionAttributes, '#attributes ' + stepString );
				expect( selection.isGravityOverridden ).to.equal( step.isGravityOverridden, '#isGravityOverridden ' + stepString );
				expect( preventDefaultSpy.callCount ).to.equal( step.preventDefault, '#preventDefault ' + stepString );
			}
		}
	}
} );

