/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { DomEmitterMixin, EventInfo, keyCodes, toArray, priorities } from '@ckeditor/ckeditor5-utils';
import { ViewDocumentDomEventData, ModelPosition, _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine';
import { TwoStepCaretMovement } from '../src/twostepcaretmovement.js';

import { Input } from '../src/input.js';
import { Delete } from '../src/delete.js';

describe( 'TwoStepCaretMovement', () => {
	let editor, model, emitter, selection, view, plugin;
	let preventDefaultSpy, evtStopSpy;

	beforeEach( () => {
		emitter = new ( DomEmitterMixin() )();

		return VirtualTestEditor.create( {
			plugins: [ TwoStepCaretMovement, Input, Delete ]
		} ).then( newEditor => {
			editor = newEditor;
			model = editor.model;
			selection = model.document.selection;
			view = editor.editing.view;
			plugin = editor.plugins.get( TwoStepCaretMovement );

			preventDefaultSpy = vi.fn();
			evtStopSpy = vi.fn();

			editor.model.schema.extend( '$text', {
				allowAttributes: [ 'a', 'b', 'c' ],
				allowIn: '$root'
			} );
			editor.model.schema.register( 'inlineObject', {
				inheritAllFrom: '$inlineObject',
				allowAttributes: [ 'src' ]
			} );

			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			editor.conversion.for( 'upcast' ).elementToAttribute( { view: 'a', model: 'a' } );
			editor.conversion.for( 'upcast' ).elementToAttribute( { view: 'b', model: 'b' } );
			editor.conversion.for( 'upcast' ).elementToAttribute( { view: 'c', model: 'c' } );
			editor.conversion.elementToElement( { model: 'paragraph', view: 'p' } );
			editor.conversion.elementToElement( { model: 'inlineObject', view: 'inlineObject' } );
			editor.conversion.attributeToAttribute( { model: 'src', view: 'src' } );

			plugin.registerAttribute( 'a' );
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TwoStepCaretMovement.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TwoStepCaretMovement.isPremiumPlugin ).toBe( false );
	} );

	// The `_handleForwardMovement()` and `_handleBackwardMovement()` handlers accept optional event data.
	// When called programmatically without it (the event data is only available when handling a key press),
	// they must still update the selection but skip preventing the caret movement.
	describe( 'handling movement without event data', () => {
		it( 'should engage the forward two-step caret movement and override the gravity', () => {
			_setModelData( model, '<paragraph><$text a="1">foo[]</$text>bar</paragraph>' );

			expect( plugin._handleForwardMovement() ).toBe( true );
			expect( selection.isGravityOverridden ).toBe( true );
		} );

		it( 'should restore the gravity on backward movement when it was overridden', () => {
			_setModelData( model, '<paragraph><$text a="1">foo[]</$text>bar</paragraph>' );

			plugin._handleForwardMovement();
			expect( selection.isGravityOverridden ).toBe( true );

			expect( plugin._handleBackwardMovement() ).toBe( true );
			expect( selection.isGravityOverridden ).toBe( false );
		} );

		it( 'should handle backward movement at the start of a block with the attribute', () => {
			_setModelData( model, '<paragraph><$text a="1">[]foo</$text></paragraph>' );

			expect( plugin._handleBackwardMovement() ).toBe( true );
		} );

		it( 'should handle backward movement between nodes with different values of the same attribute', () => {
			_setModelData( model, '<paragraph><$text a="1">foo</$text>[]<$text a="2">bar</$text></paragraph>' );

			model.change( writer => writer.removeSelectionAttribute( 'a' ) );

			expect( plugin._handleBackwardMovement() ).toBe( true );
		} );

		it( 'should handle backward movement at the end of a block after an attribute boundary', () => {
			_setModelData( model, '<paragraph>foo<$text a="1">b</$text>[]</paragraph>' );

			model.change( writer => writer.removeSelectionAttribute( 'a' ) );

			expect( plugin._handleBackwardMovement() ).toBe( true );
		} );
	} );

	describe( 'moving right', () => {
		it( 'should do nothing for unrelated attribute (at the beginning)', () => {
			_setModelData( model, '[]<$text c="true">foo</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 0 },
				'→',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 1 }
			] );
		} );

		it( 'should do nothing for unrelated attribute (at the end)', () => {
			_setModelData( model, '<$text c="true">foo[]</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 }
			] );
		} );

		it( 'should "enter" the text with attribute in two steps', () => {
			_setModelData( model, '<$text c="true">foo[]</$text><$text a="true" b="true">bar</$text>' );

			testTwoStepCaretMovement( [
				// Gravity is not overridden, caret is at the beginning of the text but is "outside" of the text.
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				// Gravity is overridden, caret movement is blocked, selection at the beginning but "inside" the text.
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: true, preventDefault: 1, evtStop: 1 },
				'→',
				// Caret movement was not blocked this time (still once) so everything works normally.
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1 }
			] );
		} );

		it( 'should "leave" the text with attribute in two steps', () => {
			_setModelData( model, '<$text a="true" b="true">bar[]</$text><$text c="true">foo</$text>' );

			testTwoStepCaretMovement( [
				// Gravity is not overridden, caret is at the end of the text but is "inside" of the text.
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				// Gravity is overridden, caret movement is blocked, selection at the end but "outside" the text.
				{ selectionAttributes: [ 'c' ], isGravityOverridden: true, preventDefault: 1, evtStop: 1 },
				'→',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1 }
			] );
		} );

		it( 'should use two-steps movement when between nodes with the same attribute but different value', () => {
			_setModelData( model, '<$text a="1">bar[]</$text><$text a="2">foo</$text>' );

			expect( selection.getAttribute( 'a' ) ).toBe( 1 );
			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 3 },
				'→',
				// <$text a="1">bar</$text>[]<$text a="2">foo</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: 3 },
				'→',
				// <$text a="1">bar</$text><$text a="2">[]foo</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 2, evtStop: 2, caretPosition: 3 }
			] );
			expect( selection.getAttribute( 'a' ) ).toBe( 2 );
			testTwoStepCaretMovement( [
				'→',
				// <$text a="1">bar</$text><$text a="2">f[]oo</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 2, evtStop: 2, caretPosition: 4 }
			] );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/937
		it( 'should not require two-steps between unrelated attributes inside the initial attribute', () => {
			_setModelData( model, '<$text a="1">fo[]o</$text><$text a="1" b="2">bar</$text><$text a="1">baz</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 }
			] );
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/1301
		it( 'should handle passing through the only character in the block', () => {
			_setModelData( model, '<$text a="1">[]x</$text>' );

			testTwoStepCaretMovement( [
				// <$text a="1">[]x</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 0 },
				'→',
				// <$text a="1">x[]</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 1 },
				'→',
				// <$text a="1">x</$text>[]
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1, evtStop: 1, caretPosition: 1 },
				'→',
				// Stays at <$text a="1">x</$text>[]
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1, evtStop: 1, caretPosition: 1 }
			] );
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/1301
		it( 'should handle passing through the only character in the block (no attribute in the initial selection)', () => {
			_setModelData( model, '[]<$text a="1">x</$text>' );

			model.change( writer => writer.removeSelectionAttribute( 'a' ) );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 1, evtStop: 1 },
				'→',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'→',
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 2, evtStop: 2 },
				'→',
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 2, evtStop: 2 }
			] );
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/1301
		it( 'should handle passing through the only-child with an attribute (multiple characters)', () => {
			_setModelData( model, '[]<$text a="1">xyz</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				// <$text a="1">x{}yz</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				// <$text a="1">xy{}z</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				// <$text a="1">xyz{}</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				// <$text a="1">xyz</$text>{}
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1, evtStop: 1 },
				'→',
				// <$text a="1">xyz</$text>{}
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1, evtStop: 1 }
			] );
		} );

		it( 'should handle leaving an attribute followed by another block', () => {
			_setModelData( model, '<paragraph><$text a="1">foo[]</$text></paragraph><paragraph><$text b="1">bar</$text></paragraph>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				// <paragraph><$text a="1">bar</$text>[]</paragraph><paragraph>foo</paragraph>
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1, evtStop: 1 },
				'→',
				// <paragraph><$text a="1">bar</$text></paragraph><paragraph>f[]oo</paragraph>
				{ selectionAttributes: [ 'b' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'→',
				// <paragraph><$text a="1">bar</$text></paragraph><paragraph>fo[]o</paragraph>
				{ selectionAttributes: [ 'b' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1 }
			] );
		} );

		it( 'should copy attributes from an inline object if are allowed on text', () => {
			_setModelData( model, '<paragraph>fo[]o<inlineObject a="1" b="2" src="3"></inlineObject></paragraph>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: [ 0, 2 ] },
				'→',
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: [ 0, 3 ] },
				'→',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: true, preventDefault: 1, evtStop: 1, caretPosition: [ 0, 3 ] }
			] );
		} );

		it( 'should copy attributes from an inline object if are allowed on text and not disabled by copyFromObject', () => {
			model.schema.setAttributeProperties( 'c', { copyFromObject: false } );
			_setModelData( model, '<paragraph>fo[]o<inlineObject a="1" b="2" c="3"></inlineObject></paragraph>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: [ 0, 2 ] },
				'→',
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: [ 0, 3 ] },
				'→',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: true, preventDefault: 1, evtStop: 1, caretPosition: [ 0, 3 ] }
			] );
		} );
	} );

	describe( 'moving left', () => {
		it( 'should "enter" the text with attribute in two steps', () => {
			_setModelData( model, '<$text>foo</$text><$text a="true" b="true">bar</$text><$text c="true">b[]iz</$text>' );

			testTwoStepCaretMovement( [
				// Gravity is not overridden, caret is a one character after the and of the text.
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				// Caret movement was not blocked but the gravity is overridden.
				{ selectionAttributes: [ 'c' ], isGravityOverridden: true, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'←',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1 }
			] );
		} );

		it( 'should "leave" the text with attribute in two steps', () => {
			_setModelData( model, '<$text c="true">foo</$text><$text a="true" b="true">b[]ar</$text>' );

			testTwoStepCaretMovement( [
				// Gravity is not overridden, caret is a one character after the beginning of the text.
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				// Caret movement was not blocked.
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: true, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1 }
			] );
		} );

		it( 'should do nothing for unrelated attribute (at the beginning)', () => {
			_setModelData( model, '<$text c="true">[]foo</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 }
			] );
		} );

		it( 'should do nothing for unrelated attribute (at the end)', () => {
			_setModelData( model, '<$text c="true">foo</$text>[]' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 }
			] );
		} );

		it( 'should do nothing when caret is at the beginning of block element', () => {
			_setModelData( model, '[]foo', { lastRangeBackward: true } );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0 }
			] );
		} );

		it( 'should require two-steps movement when caret goes between text node with the same attribute but different value', () => {
			_setModelData( model, '<$text a="2">foo</$text><$text a="1">b[]ar</$text>' );

			expect( selection.getAttribute( 'a' ) ).toBe( 1 );
			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 4 },
				'←',
				// <$text a="2">foo</$text><$text a="1">[]bar</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 0, evtStop: 0, caretPosition: 3 },
				'←',
				// <$text a="2">foo</$text>[]<$text a="1">bar</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: 3 },
				'←',
				// <$text a="2">foo[]</$text><$text a="1">bar</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 2, evtStop: 2, caretPosition: 3 }
			] );
			expect( selection.getAttribute( 'a' ) ).toBe( 2 );
			testTwoStepCaretMovement( [
				'←',
				// <$text a="2">fo[]o</$text><$text a="1">bar</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 2, evtStop: 2, caretPosition: 2 }
			] );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/937
		it( 'should not require two-steps between unrelated attributes inside the initial attribute', () => {
			_setModelData( model, '<$text a="1">foo</$text><$text a="1" b="2">bar</$text><$text a="1">b[]az</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 }
			] );
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/1301
		it( 'should handle passing through the only-child with an attribute (single character)', () => {
			_setModelData( model, '<$text a="1">x</$text>[]' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 1 },
				'←',
				// <$text a="1">{}x</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 0, evtStop: 0, caretPosition: 0 },
				'←',
				// {}<$text a="1">x</$text> (because it's a first-child)
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: 0 },
				'←',
				// {}<$text a="1">x</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: 0 }
			] );
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/1301
		it( 'should handle passing through the only character in the block (no attribute in the initial selection)', () => {
			_setModelData( model, '<$text a="1">x</$text>[]' );

			model.change( writer => writer.removeSelectionAttribute( 'a' ) );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'←',
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 1, evtStop: 1 },
				'←',
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 2, evtStop: 2 },
				'←',
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 2, evtStop: 2 }
			] );
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/1301
		it( 'should handle passing through the only-child with an attribute (single character, text before)', () => {
			_setModelData( model, 'abc<$text a="1">x</$text>[]' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				// abc<$text a="1">{}x</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 0, evtStop: 0 },
				'←',
				// abc{}<$text a="1">x</$text> (because it's a first-child)
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'←',
				// abc{}<$text a="1">x</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1 }
			] );
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/1301
		it( 'should handle passing through the only-child with an attribute (multiple characters)', () => {
			_setModelData( model, '<$text a="1">xyz</$text>[]' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				// <$text a="1">xy{}z</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				// <$text a="1">x{}yz</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				// <$text a="1">{}xyz</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 0, evtStop: 0 },
				'←',
				// {}<$text a="1">xyz</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'←',
				// {}<$text a="1">xyz</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1 }
			] );
		} );

		it( 'should handle leaving an attribute preceded by another block', () => {
			_setModelData( model, '<paragraph><$text b="1">foo</$text></paragraph><paragraph><$text a="1">[]bar</$text></paragraph>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: [ 1, 0 ] },
				'←',
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: [ 1, 0 ] },
				'←',
				{ selectionAttributes: [ 'b' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: [ 0, 3 ] }
			] );
		} );

		it( 'should copy attributes from an inline object if are allowed on text', () => {
			_setModelData( model, '<paragraph><inlineObject a="1" b="2" src="3"></inlineObject>f[]oo</paragraph>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: [ 0, 2 ] },
				'←',
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 0, evtStop: 0, caretPosition: [ 0, 1 ] },
				'←',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: [ 0, 1 ] }
			] );
		} );

		it( 'should copy attributes from an inline object if are allowed on text and not disabled by copyFromObject', () => {
			model.schema.setAttributeProperties( 'c', { copyFromObject: false } );
			_setModelData( model, '<paragraph><inlineObject a="1" b="2" c="3"></inlineObject>f[]oo</paragraph>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: [ 0, 2 ] },
				'←',
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 0, evtStop: 0, caretPosition: [ 0, 1 ] },
				'←',
				{ selectionAttributes: [ 'a', 'b' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: [ 0, 1 ] }
			] );
		} );
	} );

	describe( 'moving and typing around the attribute', () => {
		it( 'should handle typing after the attribute', () => {
			_setModelData( model, '<$text a="1">x[]</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 1 },
				'y',
				// <$text a="1">xy[]</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 2 },
				'→',
				// <$text a="1">xy</$text>[]
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1, evtStop: 1, caretPosition: 2 },
				'z',
				// <$text a="1">xy</$text>z[]
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: 3 },
				'←',
				// <$text a="1">xy</$text>[]z
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1, evtStop: 1, caretPosition: 2 },
				'←',
				// <$text a="1">xy[]</$text>z
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 2, evtStop: 2, caretPosition: 2 },
				'w',
				// <$text a="1">xyw[]</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 2, evtStop: 2, caretPosition: 3 }
			] );
		} );

		it( 'should handle typing before the attribute', () => {
			_setModelData( model, '<$text a="1">[]x</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				// []<$text a="1">x</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'z',
				// z[]<$text a="1">x</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'x',
				// zx[]<$text a="1">x</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'→',
				// zx<$text a="1">[]x</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 2, evtStop: 2 },
				'a',
				// zx<$text a="1">a[]x</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 2, evtStop: 2 }
			] );
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/1346
		// https://github.com/ckeditor/ckeditor5/issues/946
		it( 'should correctly re-renter the attribute', () => {
			_setModelData( model, 'fo[]o <$text a="1">bar</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				// foo[] <$text a="1">bar</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				// foo []<$text a="1">bar</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				// foo <$text a="1">[]bar</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 1, evtStop: 1 },
				'→',
				// foo <$text a="1">b[]ar</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'←',
				// foo <$text a="1">[]bar</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 1, evtStop: 1 },
				'←',
				// foo []<$text a="1">bar</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 2, evtStop: 2 },
				'←',
				// foo[] <$text a="1">bar</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 2, evtStop: 2 },
				'←',
				// fo[]o <$text a="1">bar</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 2, evtStop: 2 }
			] );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/922
		it( 'should not lose the new attribute when typing (after)', () => {
			_setModelData( model, '<$text a="1">x[]</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				// <$text a="1">x</$text>[]
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1, evtStop: 1 }
			] );

			model.change( writer => {
				writer.setSelectionAttribute( 'b', 1 );
			} );

			// <$text a="1">x</$text><$text b="1">[]</$text>
			expect( selection.isGravityOverridden ).toBe( true );
			expect( getSelectionAttributesArray( selection ) ).toEqual( [ 'b' ] );

			model.change( writer => {
				writer.insertText( 'yz', selection.getAttributes(), selection.getFirstPosition() );
			} );

			// <$text a="1">x</$text><$text b="1">yz[]</$text>
			expect( selection.isGravityOverridden ).toBe( false );
			expect( getSelectionAttributesArray( selection ) ).toEqual( [ 'b' ] );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/922
		it( 'should not lose the new attribute when typing (before)', () => {
			_setModelData( model, '<$text a="1">[]x</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				// []<$text a="1">x</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1 }
			] );

			model.change( writer => {
				writer.setSelectionAttribute( 'b', 1 );
			} );

			// <$text b="1">[]</$text><$text a="1">x</$text>
			expect( selection.isGravityOverridden ).toBe( false );
			expect( getSelectionAttributesArray( selection ) ).toEqual( [ 'b' ] );

			model.change( writer => {
				writer.insertText( 'yz', selection.getAttributes(), selection.getFirstPosition() );
			} );

			// <$text b="1">yz[]</$text><$text a="1">x</$text>
			expect( selection.isGravityOverridden ).toBe( false );
			expect( getSelectionAttributesArray( selection ) ).toEqual( [ 'b' ] );
		} );
	} );

	describe( 'multiple attributes', () => {
		beforeEach( () => {
			plugin.registerAttribute( 'c' );
		} );

		it( 'should work with the two-step caret movement (moving right)', () => {
			_setModelData( model, 'fo[]o<$text a="true">foo</$text><$text a="true" c="true">bar</$text><$text c="true">baz</$text>qux' );

			testTwoStepCaretMovement( [
				// fo[]o<$text a="true">foo</$text><$text a="true" c="true">bar</$text><$text c="true">baz</$text>qux
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				// foo[]<$text a="true">foo</$text><$text a="true" c="true">bar</$text><$text c="true">baz</$text>qux
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				// foo<$text a="true">[]foo</$text><$text a="true" c="true">bar</$text><$text c="true">baz</$text>qux
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 1, evtStop: 1 },
				'→',
				'→',
				'→',
				// foo<$text a="true">foo[]</$text><$text a="true" c="true">bar</$text><$text c="true">baz</$text>qux
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'→',
				// foo<$text a="true">foo</$text><$text a="true" c="true">[]bar</$text><$text c="true">baz</$text>qux
				{ selectionAttributes: [ 'a', 'c' ], isGravityOverridden: true, preventDefault: 2, evtStop: 2 },
				'→',
				'→',
				'→',
				// foo<$text a="true">foo</$text><$text a="true" c="true">bar[]</$text><$text c="true">baz</$text>qux
				{ selectionAttributes: [ 'a', 'c' ], isGravityOverridden: false, preventDefault: 2, evtStop: 2 },
				'→',
				// foo<$text a="true">foo</$text><$text a="true" c="true">bar</$text><$text c="true">[]baz</$text>qux
				{ selectionAttributes: [ 'c' ], isGravityOverridden: true, preventDefault: 3, evtStop: 3 },
				'→',
				'→',
				'→',
				// foo<$text a="true">foo</$text><$text a="true" c="true">bar</$text><$text c="true">baz[]</$text>qux
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 3, evtStop: 3 },
				'→',
				// foo<$text a="true">foo</$text><$text a="true" c="true">bar</$text><$text c="true">baz</$text>[]qux
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 4, evtStop: 4 },
				'→',
				// foo<$text a="true">foo</$text><$text a="true" c="true">bar</$text><$text c="true">baz</$text>q[]ux
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 4, evtStop: 4 }
			] );
		} );

		it( 'should work with the two-step caret movement (moving left)', () => {
			_setModelData( model, 'foo<$text a="true">foo</$text><$text a="true" c="true">bar</$text><$text c="true">baz</$text>q[]ux' );

			testTwoStepCaretMovement( [
				// foo<$text a="true">foo</$text><$text a="true" c="true">bar</$text><$text c="true">baz</$text>q[]ux
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				// foo<$text a="true">foo</$text><$text a="true" c="true">bar</$text><$text c="true">baz</$text>[]qux
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 0, evtStop: 0 },
				'←',
				// foo<$text a="true">foo</$text><$text a="true" c="true">bar</$text><$text c="true">baz[]</$text>qux
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'←',
				'←',
				'←',
				// foo<$text a="true">foo</$text><$text a="true" c="true">bar</$text><$text c="true">[]baz</$text>qux
				{ selectionAttributes: [ 'c' ], isGravityOverridden: true, preventDefault: 1, evtStop: 1 },
				'←',
				// foo<$text a="true">foo</$text><$text a="true" c="true">bar[]</$text><$text c="true">baz</$text>qux
				{ selectionAttributes: [ 'a', 'c' ], isGravityOverridden: false, preventDefault: 2, evtStop: 2 },
				'←',
				'←',
				'←',
				// foo<$text a="true">foo</$text><$text a="true" c="true">[]bar</$text><$text c="true">baz</$text>qux
				{ selectionAttributes: [ 'a', 'c' ], isGravityOverridden: true, preventDefault: 2, evtStop: 2 },
				'←',
				// foo<$text a="true">foo[]</$text><$text a="true" c="true">bar</$text><$text c="true">baz</$text>qux
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 3, evtStop: 3 },
				'←',
				'←',
				'←',
				// foo<$text a="true">[]foo</$text><$text a="true" c="true">bar</$text><$text c="true">baz</$text>qux
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 3, evtStop: 3 },
				'←',
				// foo[]<$text a="true">foo</$text><$text a="true" c="true">bar</$text><$text c="true">baz</$text>qux
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 4, evtStop: 4 },
				'←',
				// fo[]o<$text a="true">foo</$text><$text a="true" c="true">bar</$text><$text c="true">baz</$text>qux
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 4, evtStop: 4 }
			] );
		} );

		describe( 'when two elements ends at the same position', () => {
			it( 'moving the caret in should take 2 steps', () => {
				_setModelData( model, 'foo<$text a="true">foo</$text><$text a="true" c="true">bar</$text>q[]ux' );

				testTwoStepCaretMovement( [
					// foo<$text a="true">foo</$text><$text a="true" c="true">bar</$text>q[]ux
					{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 10 },
					'←',
					// foo<$text a="true">foo</$text><$text a="true" c="true">bar</$text>[]qux
					{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 0, evtStop: 0, caretPosition: 9 },
					'←',
					// foo<$text a="true">foo</$text><$text a="true" c="true">bar[]</$text>qux
					{ selectionAttributes: [ 'a', 'c' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: 9 },
					'←',
					// foo<$text a="true">foo</$text><$text a="true" c="true">ba[]r</$text>qux
					{ selectionAttributes: [ 'a', 'c' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: 8 }
				] );
			} );

			it( 'moving the caret out should take 2 steps', () => {
				_setModelData( model, 'foo<$text a="true">foo</$text><$text a="true" c="true">ba[]r</$text>qux' );

				testTwoStepCaretMovement( [
					// foo<$text a="true">foo</$text><$text a="true" c="true">ba[]r</$text>qux
					{ selectionAttributes: [ 'a', 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 8 },
					'→',
					// foo<$text a="true">foo</$text><$text a="true" c="true">bar[]</$text>qux
					{ selectionAttributes: [ 'a', 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 9 },
					'→',
					// foo<$text a="true">foo</$text><$text a="true" c="true">bar</$text>[]qux
					{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1, evtStop: 1, caretPosition: 9 },
					'→',
					// foo<$text a="true">foo</$text><$text a="true" c="true">bar</$text>q[]ux
					{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: 10 }
				] );
			} );
		} );

		describe( 'when two elements starts at the same position', () => {
			it( 'moving the caret in should take 2 steps', () => {
				_setModelData( model, 'fo[]o<$text a="true" c="true">bar</$text><$text a="true">baz</$text>qux' );

				testTwoStepCaretMovement( [
					// fo[]o<$text a="true" c="true">bar</$text><$text a="true">baz</$text>qux
					{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 2 },
					'→',
					// foo[]<$text a="true" c="true">bar</$text><$text a="true">baz</$text>qux
					{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 3 },
					'→',
					// foo<$text a="true" c="true">[]bar</$text><$text a="true">baz</$text>qux
					{ selectionAttributes: [ 'a', 'c' ], isGravityOverridden: true, preventDefault: 1, evtStop: 1, caretPosition: 3 },
					'→',
					// foo<$text a="true" c="true">b[]ar</$text><$text a="true">baz</$text>qux
					{ selectionAttributes: [ 'a', 'c' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: 4 }
				] );
			} );

			it( 'moving the caret out should take 2 steps', () => {
				_setModelData( model, 'foo<$text a="true" c="true">b[]ar</$text><$text a="true">baz</$text>qux' );

				testTwoStepCaretMovement( [
					// foo<$text a="true" c="true">b[]ar</$text><$text a="true">baz</$text>qux
					{ selectionAttributes: [ 'a', 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 4 },
					'←',
					// foo<$text a="true" c="true">[]bar</$text><$text a="true">baz</$text>qux
					{ selectionAttributes: [ 'a', 'c' ], isGravityOverridden: true, preventDefault: 0, evtStop: 0, caretPosition: 3 },
					'←',
					// foo[]<$text a="true" c="true">bar</$text><$text a="true">baz</$text>qux
					{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: 3 },
					'←',
					// fo[]o<$text a="true" c="true">bar</$text><$text a="true">baz</$text>qux
					{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: 2 }
				] );
			} );
		} );
	} );

	describe( 'mouse', () => {
		it( 'should not override gravity when selection is placed at the beginning of text', () => {
			_setModelData( model, '<$text a="true">[]foo</$text>' );

			expect( selection.isGravityOverridden ).toBe( false );
		} );

		it( 'should not override gravity when selection is placed at the end of text', () => {
			_setModelData( model, '<$text a="true">foo[]</$text>' );

			expect( selection.isGravityOverridden ).toBe( false );
		} );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/1016
	describe( 'mouse click a the edge of tow-step node', () => {
		it( 'should insert content after the two-step node', () => {
			_setModelData( model, '<paragraph><$text a="1">foo[]</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph><$text a="1">foo</$text>[]</paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'bar', selection.getAttributes() ), selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph><$text a="1">foo</$text>bar[]</paragraph>' );
		} );

		it( 'should insert content after the two-step node (with following text)', () => {
			_setModelData( model, '<paragraph><$text a="1">foo[]</$text><$text b="2">123</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph><$text a="1">foo</$text><$text b="2">[]123</$text></paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'bar', selection.getAttributes() ), selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph><$text a="1">foo</$text><$text b="2">bar[]123</$text></paragraph>' );
		} );

		it( 'should insert content before the two-step node', () => {
			_setModelData( model, '<paragraph><$text a="1">[]foo</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph>[]<$text a="1">foo</$text></paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'bar', selection.getAttributes() ), selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph>bar[]<$text a="1">foo</$text></paragraph>' );
		} );

		it( 'should insert content before the two-step node (with preceding text)', () => {
			_setModelData( model, '<paragraph><$text b="2">123</$text><$text a="1">[]foo</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph><$text b="2">123[]</$text><$text a="1">foo</$text></paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'bar', selection.getAttributes() ), selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph><$text b="2">123bar[]</$text><$text a="1">foo</$text></paragraph>' );
		} );

		it( 'should insert content to the two-step node if clicked inside it', () => {
			_setModelData( model, '<paragraph><$text a="1">f[]oo</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph><$text a="1">f[]oo</$text></paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'bar', selection.getAttributes() ), selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph><$text a="1">fbar[]oo</$text></paragraph>' );
		} );

		it( 'should insert content between two two-step nodes (selection at the end of the first node)', () => {
			_setModelData( model, '<paragraph><$text a="1">foo[]</$text><$text a="2">bar</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph><$text a="1">foo</$text>[]<$text a="2">bar</$text></paragraph>'
			);

			model.change( writer => {
				model.insertContent( writer.createText( '123', selection.getAttributes() ), selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph><$text a="1">foo</$text>123[]<$text a="2">bar</$text></paragraph>'
			);
		} );

		it( 'should insert content between two two-step nodes (selection at the beginning of the second node)', () => {
			_setModelData( model, '<paragraph><$text a="1">foo</$text><$text a="2">[]bar</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph><$text a="1">foo</$text>[]<$text a="2">bar</$text></paragraph>'
			);

			model.change( writer => {
				model.insertContent( writer.createText( '123', selection.getAttributes() ), selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph><$text a="1">foo</$text>123[]<$text a="2">bar</$text></paragraph>'
			);
		} );

		it( 'should do nothing if the text was not clicked', () => {
			_setModelData( model, '<paragraph><$text a="1">foo[]</$text></paragraph>' );

			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph><$text a="1">foo[]</$text></paragraph>' );
		} );

		it( 'should do nothing if the selection is not collapsed after the click', () => {
			_setModelData( model, '<paragraph>[<$text a="1">foo</$text>]</paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph>[<$text a="1">foo</$text>]</paragraph>' );
		} );

		it( 'should do nothing if the text is not a two-step node', () => {
			_setModelData( model, '<paragraph><$text bold="true">foo[]</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph><$text bold="true">foo[]</$text></paragraph>' );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/17171
		it( 'should handle use touchstart event to determine behavior if mousedown is fired after selectionchange on iOS', () => {
			_setModelData( model, '<paragraph><$text a="1">foo[]</$text></paragraph>' );

			editor.editing.view.document.fire( 'touchstart' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			// on safari the mousedown event is called after selectionchange, so we can simulate it here
			editor.editing.view.document.fire( 'mousedown' );

			expect( _getModelData( model ) ).toEqual( '<paragraph><$text a="1">foo</$text>[]</paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'bar', selection.getAttributes() ), selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph><$text a="1">foo</$text>bar[]</paragraph>' );
		} );

		it( 'should not change the already overridden gravity when clicking at the boundary of a two-step node', () => {
			// Selection at the start boundary of an attributed run (preceded by unattributed text) with the
			// plugin gravity already overridden (so the collapsed selection still carries the `a` attribute).
			// The `selectionChange` reaches the `else if ( !this._isGravityOverridden )` branch but does
			// nothing because the gravity is already overridden.
			_setModelData( model, '<paragraph>x[]<$text a="1">foo</$text></paragraph>' );

			// A forward movement at the start boundary of the attribute overrides the plugin gravity, so the
			// collapsed selection inherits the `a` attribute from the text after it (the caret stays in place).
			view.document.fire( 'keydown', {
				keyCode: keyCodes.arrowright,
				preventDefault: () => {},
				domTarget: document.body
			} );

			expect( selection.isGravityOverridden, 'gravity overridden before click' ).toBe( true );
			expect( selection.hasAttribute( 'a' ), 'selection carries the attribute before click' ).toBe( true );
			expect( _getModelData( model ) ).toEqual( '<paragraph>x<$text a="1">[]foo</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			// The handler should leave everything untouched.
			expect( selection.isGravityOverridden, 'gravity still overridden after click' ).toBe( true );
			expect( selection.hasAttribute( 'a' ), 'selection still carries the attribute after click' ).toBe( true );
			expect( _getModelData( model ) ).toEqual( '<paragraph>x<$text a="1">[]foo</$text></paragraph>' );
		} );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/6053
	describe( 'selection attribute management on paste', () => {
		beforeEach( () => {
			model.schema.extend( '$text', { allowAttributes: 'bold' } );
		} );

		it( 'should remove two-step attributes when pasting two-step content', () => {
			_setModelData( model, '<paragraph>foo[]</paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { a: 'abc' } ) );
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph>foo<$text a="abc">INSERTED</$text>[]</paragraph>' );

			expect( [ ...model.document.selection.getAttributeKeys() ] ).toEqual( [] );
		} );

		it( 'should not remove two-step attributes when pasting a non-two-step content', () => {
			_setModelData( model, '<paragraph><$text a="abc">foo[]</$text></paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { bold: 'true' } ) );
			} );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph>' +
					'<$text a="abc">foo</$text>' +
					'<$text bold="true">INSERTED[]</$text>' +
				'</paragraph>'
			);

			expect( model.document.selection.hasAttribute( 'bold' ) ).toBe( true );
		} );

		it( 'should not remove two-step attributes when pasting in the middle of a two-step with the same value', () => {
			_setModelData( model, '<paragraph><$text a="abc">fo[]o</$text></paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { a: 'abc' } ) );
			} );

			expect( _getModelData( model ) ).toEqual( '<paragraph><$text a="abc">foINSERTED[]o</$text></paragraph>' );
			expect( model.document.selection.hasAttribute( 'a' ) ).toBe( true );
		} );

		it( 'should not remove two-step attributes from the selection when pasting before a two-step with overridden gravity', () => {
			_setModelData( model, '<paragraph>foo[]<$text a="abc">bar</$text></paragraph>' );

			view.document.fire( 'keydown', {
				keyCode: keyCodes.arrowright,
				preventDefault: () => {},
				domTarget: document.body
			} );

			expect( model.document.selection.isGravityOverridden ).toBe( true );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { bold: true } ) );
			} );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph>' +
					'foo' +
					'<$text bold="true">INSERTED</$text>[]' +
					'<$text a="abc">bar</$text>' +
				'</paragraph>'
			);

			expect( model.document.selection.isGravityOverridden ).toBe( true );
			expect( [ ...model.document.selection.getAttributeKeys() ] ).toEqual( [] );
		} );

		it( 'should remove two-step attributes when pasting a two-step into another two-step (different value)', () => {
			_setModelData( model, '<paragraph><$text a="abc">f[]oo</$text></paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { a: 'def' } ) );
			} );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph>' +
					'<$text a="abc">f</$text>' +
					'<$text a="def">INSERTED</$text>[]' +
					'<$text a="abc">oo</$text>' +
				'</paragraph>'
			);

			expect( [ ...model.document.selection.getAttributeKeys() ] ).toEqual( [] );
		} );

		it( 'should not remove two-step attributes when pasting before another two-step (different value)', () => {
			_setModelData( model, '<paragraph>[]<$text a="abc">foo</$text></paragraph>' );

			expect( model.document.selection.isGravityOverridden ).toBe( false );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { a: 'def' } ) );
			} );

			expect( _getModelData( model ) ).toEqual(
				'<paragraph>' +
					'<$text a="def">INSERTED</$text>[]' +
					'<$text a="abc">foo</$text>' +
				'</paragraph>'
			);

			expect( [ ...model.document.selection.getAttributeKeys() ] ).toEqual( [] );
		} );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/7521
	describe( 'removing a character before the link element', () => {
		beforeEach( () => {
			vi.spyOn( editor.editing.view, 'scrollToTheSelection' ).mockImplementation( () => {} );
		} );

		it( 'should not preserve the two-step attribute when deleting content after the two-step content', () => {
			_setModelData( model, '<paragraph>Foo <$text a="url">Bar</$text> []</paragraph>' );

			expect( model.document.selection.hasAttribute( 'a' ), 'initial state' ).toEqual( false );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'a' ), 'removing space after the link' ).toEqual( false );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'a' ), 'removing a character in the link' ).toEqual( false );
			expect( _getModelData( model ) ).toEqual( '<paragraph>Foo <$text a="url">Ba</$text>[]</paragraph>' );
		} );

		it( 'should not preserve the two-step attribute when deleting content at the beginning of the two-step content', () => {
			_setModelData( model, '<paragraph><$text a="url">B[]ar</$text></paragraph>' );

			expect( model.document.selection.hasAttribute( 'a' ), 'initial state' ).toEqual( true );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'a' ), 'removing first character' ).toEqual( false );

			expect( _getModelData( model ) ).toEqual( '<paragraph>[]<$text a="url">ar</$text></paragraph>' );
		} );

		it( 'should not preserve the two-step attribute when deleting content before another two-step content', () => {
			_setModelData( model, '<paragraph><$text a="1">Bar</$text><$text a="2">B[]ar</$text></paragraph>' );

			expect( model.document.selection.hasAttribute( 'a' ), 'initial state' ).toEqual( true );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'a' ), 'removing first character' ).toEqual( false );

			expect( _getModelData( model ) ).toEqual( '<paragraph><$text a="1">Bar</$text>[]<$text a="2">ar</$text></paragraph>' );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'a' ) ).toEqual( false );

			expect( _getModelData( model ) ).toEqual( '<paragraph><$text a="1">Ba</$text>[]<$text a="2">ar</$text></paragraph>' );
		} );

		it( 'should preserve the two-step attribute when deleting content and the selection is at the end of the two-step content', () => {
			_setModelData( model, '<paragraph>Foo <$text a="url">Bar []</$text></paragraph>' );

			expect( model.document.selection.hasAttribute( 'a' ), 'initial state' ).toEqual( true );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'a' ), 'removing space after the link' ).toEqual( true );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'a' ), 'removing a character in the link' ).toEqual( true );
			expect( _getModelData( model ) ).toEqual( '<paragraph>Foo <$text a="url">Ba[]</$text></paragraph>' );
		} );

		it( 'should preserve the two-step attribute when deleting content while the selection is inside the two-step content', () => {
			_setModelData( model, '<paragraph>Foo <$text a="url">A long URLLs[] description</$text></paragraph>' );

			expect( model.document.selection.hasAttribute( 'a' ), 'initial state' ).toEqual( true );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'a' ), 'removing space after the link' ).toEqual( true );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'a' ), 'removing a character in the link' ).toEqual( true );
			expect( _getModelData( model ) ).toEqual( '<paragraph>Foo <$text a="url">A long URL[] description</$text></paragraph>' );
		} );

		it( 'should do nothing if there is no two-step attribute', () => {
			model.schema.extend( '$text', { allowAttributes: 'bold' } );
			_setModelData( model, '<paragraph>Foo <$text bold="true">Bolded.</$text> []Bar</paragraph>' );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( _getModelData( model ) ).toEqual( '<paragraph>Foo <$text bold="true">Bolded[]</$text>Bar</paragraph>' );
		} );

		it( 'should not change the already overridden gravity when deleting content at the boundary of a two-step node', () => {
			// Two observed attributes are needed so that the backward delete is not short-circuited by the
			// "preserve attributes" guard (the deleted character sits one step after a `b` boundary) while the
			// resulting selection ends up at a non-strict `a` boundary with the plugin gravity already
			// overridden. In that situation the `deleteContent` handler reaches the
			// `else if ( !this._isGravityOverridden )` branch but does nothing, leaving the attribute intact.
			plugin.registerAttribute( 'b' );

			_setModelData( model, '<paragraph>z<$text b="1">w</$text>x[]<$text a="1">foo</$text></paragraph>' );

			// A forward movement at the start boundary of the `a` run overrides the plugin gravity, so the
			// collapsed selection inherits the `a` attribute from the text after it.
			view.document.fire( 'keydown', {
				keyCode: keyCodes.arrowright,
				preventDefault: () => {},
				domTarget: document.body
			} );

			expect( selection.isGravityOverridden, 'gravity overridden before delete' ).toBe( true );
			expect( selection.hasAttribute( 'a' ), 'selection carries the attribute before delete' ).toBe( true );
			expect( _getModelData( model ) ).toEqual( '<paragraph>z<$text b="1">w</$text>x<$text a="1">[]foo</$text></paragraph>' );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			// The backspace removes the `x` character, leaving the selection at the boundary of the `a` run.
			// The overridden gravity (and thus the `a` attribute) must be preserved.
			expect( selection.isGravityOverridden, 'gravity still overridden after delete' ).toBe( true );
			expect( selection.hasAttribute( 'a' ), 'selection still carries the attribute after delete' ).toBe( true );
			expect( _getModelData( model ) ).toEqual( '<paragraph>z<$text b="1">w</$text><$text a="1">[]foo</$text></paragraph>' );
		} );

		it( 'should preserve the two-step attribute when deleting content using "Delete" key', () => {
			_setModelData( model, '<paragraph>Foo <$text a="url">Bar</$text>[ ]</paragraph>' );

			expect( model.document.selection.hasAttribute( 'a' ), 'initial state' ).toEqual( false );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'forward',
				selectionToRemove: view.document.selection
			} ) );

			expect( _getModelData( model ) ).toEqual( '<paragraph>Foo <$text a="url">Bar[]</$text></paragraph>' );

			expect( model.document.selection.hasAttribute( 'a' ), 'removing space after the link' ).toEqual( true );
		} );
	} );

	it( 'should listen with the higher priority than widget type around', () => {
		const highestPlusPrioritySpy = vi.fn();
		const highestPrioritySpy = vi.fn();
		const highPrioritySpy = vi.fn();
		const normalPrioritySpy = vi.fn();

		_setModelData( model, '<$text c="true">foo[]</$text><$text a="true" b="true">bar</$text>' );

		emitter.listenTo( view.document, 'arrowKey', highestPlusPrioritySpy, { context: '$text', priority: priorities.highest + 1 } );
		emitter.listenTo( view.document, 'arrowKey', highestPrioritySpy, { context: '$text', priority: 'highest' } );
		emitter.listenTo( view.document, 'arrowKey', highPrioritySpy, { context: '$text', priority: 'high' } );
		emitter.listenTo( view.document, 'arrowKey', normalPrioritySpy, { context: '$text', priority: 'normal' } );

		fireKeyDownEvent( {
			keyCode: keyCodes.arrowright,
			preventDefault: preventDefaultSpy
		} );

		expect( highestPlusPrioritySpy ).toHaveBeenCalledTimes( 1 );
		expect( preventDefaultSpy.mock.invocationCallOrder[ 0 ] )
			.toBe( highestPlusPrioritySpy.mock.invocationCallOrder[ 0 ] + 1 );

		expect( highestPrioritySpy ).not.toHaveBeenCalled();
		expect( highPrioritySpy ).not.toHaveBeenCalled();
		expect( normalPrioritySpy ).not.toHaveBeenCalled();
	} );

	it( 'should do nothing when key other then arrow left and right is pressed', () => {
		_setModelData( model, '<$text a="true">foo[]</$text>' );

		expect( () => {
			fireKeyDownEvent( { keyCode: keyCodes.arrowup } );
		} ).not.toThrow();
	} );

	it( 'should do nothing for non-collapsed selection', () => {
		_setModelData( model, '<$text c="true">fo[o]</$text><$text a="true" b="true">bar</$text>' );

		fireKeyDownEvent( { keyCode: keyCodes.arrowright } );

		expect( selection.isGravityOverridden ).toBe( false );
	} );

	it( 'should do nothing when shift key is pressed', () => {
		_setModelData( model, '<$text c="true">foo</$text><$text a="true" b="true">b[]ar</$text>' );

		fireKeyDownEvent( {
			keyCode: keyCodes.arrowleft,
			shiftKey: true
		} );

		expect( selection.isGravityOverridden ).toBe( false );
	} );

	it( 'should do nothing when alt key is pressed', () => {
		_setModelData( model, '<$text c="true">foo</$text><$text a="true" b="true">b[]ar</$text>' );

		fireKeyDownEvent( {
			keyCode: keyCodes.arrowleft,
			altKey: true
		} );

		expect( selection.isGravityOverridden ).toBe( false );
	} );

	it( 'should do nothing when ctrl key is pressed', () => {
		_setModelData( model, '<$text c="true">foo</$text><$text a="true" b="true">b[]ar</$text>' );

		fireKeyDownEvent( {
			keyCode: keyCodes.arrowleft,
			ctrlKey: true
		} );

		expect( selection.isGravityOverridden ).toBe( false );
	} );

	it( 'should do nothing when the not a direct selection change but at the attribute boundary', () => {
		_setModelData( model, '<$text a="true">foo[]</$text>bar' );

		testTwoStepCaretMovement( [
			{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
			'→',
			{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1, evtStop: 1 }
		] );

		// Simulate an external text insertion BEFORE the user selection to trigger #change:range.
		model.enqueueChange( { isUndoable: false }, writer => {
			writer.insertText( 'x', selection.getFirstPosition().getShiftedBy( -2 ) );
		} );

		expect( selection.isGravityOverridden ).toBe( true );
		expect( getSelectionAttributesArray( selection ) ).toEqual( [] );
	} );

	describe( 'right–to–left content', () => {
		it( 'should use the opposite helper methods (RTL content direction)', () => {
			// let model;

			return VirtualTestEditor
				.create( {
					plugins: [ TwoStepCaretMovement ],
					language: {
						content: 'he'
					}
				} )
				.then( newEditor => {
					model = newEditor.model;
					selection = model.document.selection;
					view = newEditor.editing.view;

					newEditor.model.schema.extend( '$text', {
						allowAttributes: [ 'a', 'b', 'c' ],
						allowIn: '$root'
					} );

					model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
					newEditor.conversion.for( 'upcast' ).elementToAttribute( { view: 'a', model: 'a' } );
					newEditor.conversion.for( 'upcast' ).elementToAttribute( { view: 'b', model: 'b' } );
					newEditor.conversion.for( 'upcast' ).elementToAttribute( { view: 'c', model: 'c' } );
					newEditor.conversion.elementToElement( { model: 'paragraph', view: 'p' } );

					newEditor.plugins.get( TwoStepCaretMovement ).registerAttribute( 'a' );

					return newEditor;
				} )
				.then( newEditor => {
					_setModelData( model, '<$text>לזה[]</$text><$text a="true">שיוצג</$text>' );

					testTwoStepCaretMovement( [
						{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 3 },
						'←',
						{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 1, evtStop: 1, caretPosition: 3 }
					], 'rtl' );

					preventDefaultSpy.mockClear();
					evtStopSpy.mockClear();

					_setModelData( model, '<$text>לזה</$text><$text a="true">ש[]יוצג</$text>' );

					testTwoStepCaretMovement( [
						{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0, caretPosition: 4 },
						'→',
						{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 0, evtStop: 0, caretPosition: 3 },
						'→',
						{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: 3 },
						'→',
						{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1, caretPosition: 2 }
					], 'rtl' );

					return newEditor.destroy();
				} );
		} );
	} );

	const keyMap = {
		'→': 'arrowright',
		'←': 'arrowleft'
	};

	function fireKeyDownEvent( options ) {
		const eventInfo = new EventInfo( view.document, 'keydown' );
		const eventData = new ViewDocumentDomEventData( view.document, {
			target: document.body
		}, options );

		vi.spyOn( eventInfo, 'stop' ).mockImplementation( evtStopSpy );

		view.document.fire( eventInfo, eventData );
	}

	function getSelectionAttributesArray( selection ) {
		return Array.from( selection.getAttributeKeys() );
	}

	function testTwoStepCaretMovement( scenario, rtl ) {
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
						if ( step == '→' && !rtl || step == '←' && rtl ) {
							model.change( writer => {
								if ( position.isAtEnd ) {
									const nextBlock = position.parent.nextSibling;

									if ( nextBlock ) {
										writer.setSelection( ModelPosition._createAt( nextBlock, 0 ) );
									}
								} else {
									writer.setSelection( selection.getFirstPosition().getShiftedBy( 1 ) );
								}
							} );
						} else if ( step == '←' && !rtl || step == '→' && rtl ) {
							model.change( writer => {
								if ( position.isAtStart ) {
									const previousBlock = position.parent.previousSibling;

									if ( previousBlock ) {
										writer.setSelection( ModelPosition._createAt( previousBlock, 'end' ) );
									}
								} else {
									writer.setSelection( selection.getFirstPosition().getShiftedBy( -1 ) );
								}
							} );
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
				const stepString = `in step #${ stepIndex }`;

				if ( step.caretPosition !== undefined ) {
					// Normalize position
					const caretPosition = toArray( step.caretPosition );
					expect( selection.getFirstPosition().path, `in step #${ stepIndex }, selection's first position` )
						.toEqual( caretPosition );
				}
				expect( [ ...getSelectionAttributesArray( selection ) ].sort(), `${ stepString }, selection's attributes` )
					.toEqual( [ ...step.selectionAttributes ].sort() );
				expect( selection.isGravityOverridden, `${ stepString }, selection's gravity` )
					.toBe( step.isGravityOverridden );
				expect( preventDefaultSpy, stepString ).toHaveBeenCalledTimes( step.preventDefault );
				expect( evtStopSpy, stepString ).toHaveBeenCalledTimes( step.evtStop );
			}
		}
	}
} );
