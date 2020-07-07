/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import DomEmitterMixin from '@ckeditor/ckeditor5-utils/src/dom/emittermixin';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import TwoStepCaretMovement, { TwoStepCaretHandler } from '../src/twostepcaretmovement';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'TwoStepCaretMovement()', () => {
	let editor, model, emitter, selection, view, plugin;
	let preventDefaultSpy, evtStopSpy;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		emitter = Object.create( DomEmitterMixin );

		return VirtualTestEditor.create( { plugins: [ TwoStepCaretMovement ] } ).then( newEditor => {
			editor = newEditor;
			model = editor.model;
			selection = model.document.selection;
			view = editor.editing.view;
			plugin = editor.plugins.get( TwoStepCaretMovement );

			preventDefaultSpy = sinon.spy().named( 'preventDefault' );
			evtStopSpy = sinon.spy().named( 'evt.stop' );

			editor.model.schema.extend( '$text', {
				allowAttributes: [ 'a', 'b', 'c' ],
				allowIn: '$root'
			} );

			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			editor.conversion.for( 'upcast' ).elementToAttribute( { view: 'a', model: 'a' } );
			editor.conversion.for( 'upcast' ).elementToAttribute( { view: 'b', model: 'b' } );
			editor.conversion.for( 'upcast' ).elementToAttribute( { view: 'c', model: 'c' } );
			editor.conversion.elementToElement( { model: 'paragraph', view: 'p' } );

			plugin.registerAttribute( 'a' );
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'moving right', () => {
		it( 'should do nothing for unrelated attribute (at the beginning)', () => {
			setData( model, '[]<$text c="true">foo</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 }
			] );
		} );

		it( 'should do nothing for unrelated attribute (at the end)', () => {
			setData( model, '<$text c="true">foo[]</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 }
			] );
		} );

		it( 'should "enter" the text with attribute in two steps', () => {
			setData( model, '<$text c="true">foo[]</$text><$text a="true" b="true">bar</$text>' );

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
			setData( model, '<$text a="true" b="true">bar[]</$text><$text c="true">foo</$text>' );

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
			setData( model, '<$text a="1">bar[]</$text><$text a="2">foo</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				// <$text a="1">bar</$text>[]<$text a="2">foo</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'→',
				// <$text a="1">bar</$text><$text a="2">[]foo</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 2, evtStop: 2 },
				'→',
				// <$text a="1">bar</$text><$text a="2">f[]oo</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 2, evtStop: 2 }
			] );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/937
		it( 'should not require two-steps between unrelated attributes inside the initial attribute', () => {
			setData( model, '<$text a="1">fo[]o</$text><$text a="1" b="2">bar</$text><$text a="1">baz</$text>' );

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
			setData( model, '<$text a="1">[]x</$text>' );

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
			setData( model, '[]<$text a="1">x</$text>' );

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
			setData( model, '[]<$text a="1">xyz</$text>' );

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
			setData( model, '<paragraph><$text a="1">foo[]</$text></paragraph><paragraph><$text b="1">bar</$text></paragraph>' );

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
	} );

	describe( 'moving left', () => {
		it( 'should "enter" the text with attribute in two steps', () => {
			setData( model, '<$text>foo</$text><$text a="true" b="true">bar</$text><$text c="true">b[]iz</$text>' );

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
			setData( model, '<$text c="true">foo</$text><$text a="true" b="true">b[]ar</$text>' );

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
			setData( model, '<$text c="true">[]foo</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 }
			] );
		} );

		it( 'should do nothing for unrelated attribute (at the end)', () => {
			setData( model, '<$text c="true">foo</$text>[]' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [ 'c' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 }
			] );
		} );

		it( 'should do nothing when caret is at the beginning of block element', () => {
			setData( model, '[]foo', { lastRangeBackward: true } );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 0, evtStop: 0 }
			] );
		} );

		it( 'should require two-steps movement when caret goes between text node with the same attribute but different value', () => {
			setData( model, '<$text a="2">foo</$text><$text a="1">b[]ar</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				// <$text a="2">foo</$text><$text a="1">[]bar</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 0, evtStop: 0 },
				'←',
				// <$text a="2">foo</$text>[]<$text a="1">bar</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'←',
				// <$text a="2">foo[]</$text><$text a="1">bar</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 2, evtStop: 2 },
				'←',
				// <$text a="2">fo[]o</$text><$text a="1">bar</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 2, evtStop: 2 }
			] );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/937
		it( 'should not require two-steps between unrelated attributes inside the initial attribute', () => {
			setData( model, '<$text a="1">foo</$text><$text a="1" b="2">bar</$text><$text a="1">b[]az</$text>' );

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
			setData( model, '<$text a="1">x</$text>[]' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				// <$text a="1">{}x</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: true, preventDefault: 0, evtStop: 0 },
				'←',
				// {}<$text a="1">x</$text> (because it's a first-child)
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'←',
				// {}<$text a="1">x</$text>
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1 }
			] );
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/1301
		it( 'should handle passing through the only character in the block (no attribute in the initial selection)', () => {
			setData( model, '<$text a="1">x</$text>[]' );

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
			setData( model, 'abc<$text a="1">x</$text>[]' );

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
			setData( model, '<$text a="1">xyz</$text>[]' );

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
			setData( model, '<paragraph><$text b="1">foo</$text></paragraph><paragraph><$text a="1">[]bar</$text></paragraph>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'←',
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'←',
				{ selectionAttributes: [ 'b' ], isGravityOverridden: false, preventDefault: 1, evtStop: 1 }
			] );
		} );
	} );

	describe( 'moving and typing around the attribute', () => {
		it( 'should handle typing after the attribute', () => {
			setData( model, '<$text a="1">x[]</$text>' );

			testTwoStepCaretMovement( [
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'y',
				// <$text a="1">xy[]</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
				'→',
				// <$text a="1">xy</$text>[]
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1, evtStop: 1 },
				'z',
				// <$text a="1">xy</$text>z[]
				{ selectionAttributes: [], isGravityOverridden: false, preventDefault: 1, evtStop: 1 },
				'←',
				// <$text a="1">xy</$text>[]z
				{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1, evtStop: 1 },
				'←',
				// <$text a="1">xy[]</$text>z
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 2, evtStop: 2 },
				'w',
				// <$text a="1">xyw[]</$text>
				{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 2, evtStop: 2 }
			] );
		} );

		it( 'should handle typing before the attribute', () => {
			setData( model, '<$text a="1">[]x</$text>' );

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
			setData( model, 'fo[]o <$text a="1">bar</$text>' );

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
			setData( model, '<$text a="1">x[]</$text>' );

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
			expect( selection ).to.have.property( 'isGravityOverridden', true );
			expect( getSelectionAttributesArray( selection ) ).to.have.members( [ 'b' ] );

			model.change( writer => {
				writer.insertText( 'yz', selection.getAttributes(), selection.getFirstPosition() );
			} );

			// <$text a="1">x</$text><$text b="1">yz[]</$text>
			expect( selection ).to.have.property( 'isGravityOverridden', false );
			expect( getSelectionAttributesArray( selection ) ).to.have.members( [ 'b' ] );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/922
		it( 'should not lose the new attribute when typing (before)', () => {
			setData( model, '<$text a="1">[]x</$text>' );

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
			expect( selection ).to.have.property( 'isGravityOverridden', false );
			expect( getSelectionAttributesArray( selection ) ).to.have.members( [ 'b' ] );

			model.change( writer => {
				writer.insertText( 'yz', selection.getAttributes(), selection.getFirstPosition() );
			} );

			// <$text b="1">yz[]</$text><$text a="1">x</$text>
			expect( selection ).to.have.property( 'isGravityOverridden', false );
			expect( getSelectionAttributesArray( selection ) ).to.have.members( [ 'b' ] );
		} );
	} );

	describe( 'multiple attributes', () => {
		beforeEach( () => {
			plugin.registerAttribute( 'c' );
		} );

		it( 'should work with the two-step caret movement (moving right)', () => {
			setData( model, 'fo[]o<$text a="true">foo</$text><$text a="true" c="true">bar</$text><$text c="true">baz</$text>qux' );

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
			setData( model, 'foo<$text a="true">foo</$text><$text a="true" c="true">bar</$text><$text c="true">baz</$text>q[]ux' );

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
				setData( model, 'foo<$text a="true">foo</$text><$text a="true" c="true">bar</$text>q[]ux' );

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
				setData( model, 'foo<$text a="true">foo</$text><$text a="true" c="true">ba[]r</$text>qux' );

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
				setData( model, 'fo[]o<$text a="true" c="true">bar</$text><$text a="true">baz</$text>qux' );

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
				setData( model, 'foo<$text a="true" c="true">b[]ar</$text><$text a="true">baz</$text>qux' );

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
			setData( model, '<$text a="true">[]foo</$text>' );

			expect( selection ).to.have.property( 'isGravityOverridden', false );
		} );

		it( 'should not override gravity when selection is placed at the end of text', () => {
			setData( model, '<$text a="true">foo[]</$text>' );

			expect( selection ).to.have.property( 'isGravityOverridden', false );
		} );
	} );

	it( 'should listen with the high+1 priority on view.document#keydown', () => {
		const highestPrioritySpy = sinon.spy().named( 'highestPrioritySpy' );
		const highPrioritySpy = sinon.spy().named( 'highPrioritySpy' );
		const normalPrioritySpy = sinon.spy().named( 'normalPrioritySpy' );

		setData( model, '<$text c="true">foo[]</$text><$text a="true" b="true">bar</$text>' );

		emitter.listenTo( view.document, 'keydown', highestPrioritySpy, { priority: 'highest' } );
		emitter.listenTo( view.document, 'keydown', highPrioritySpy, { priority: 'high' } );
		emitter.listenTo( view.document, 'keydown', normalPrioritySpy, { priority: 'normal' } );

		fireKeyDownEvent( {
			keyCode: keyCodes.arrowright,
			preventDefault: preventDefaultSpy
		} );

		sinon.assert.callOrder(
			highestPrioritySpy,
			preventDefaultSpy );

		sinon.assert.notCalled( highPrioritySpy );
		sinon.assert.notCalled( normalPrioritySpy );
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

		expect( selection ).to.have.property( 'isGravityOverridden', false );
	} );

	it( 'should do nothing when shift key is pressed', () => {
		setData( model, '<$text c="true">foo</$text><$text a="true" b="true">b[]ar</$text>' );

		fireKeyDownEvent( {
			keyCode: keyCodes.arrowleft,
			shiftKey: true
		} );

		expect( selection ).to.have.property( 'isGravityOverridden', false );
	} );

	it( 'should do nothing when alt key is pressed', () => {
		setData( model, '<$text c="true">foo</$text><$text a="true" b="true">b[]ar</$text>' );

		fireKeyDownEvent( {
			keyCode: keyCodes.arrowleft,
			altKey: true
		} );

		expect( selection ).to.have.property( 'isGravityOverridden', false );
	} );

	it( 'should do nothing when ctrl key is pressed', () => {
		setData( model, '<$text c="true">foo</$text><$text a="true" b="true">b[]ar</$text>' );

		fireKeyDownEvent( {
			keyCode: keyCodes.arrowleft,
			ctrlKey: true
		} );

		expect( selection ).to.have.property( 'isGravityOverridden', false );
	} );

	it( 'should do nothing when the not a direct selection change but at the attribute boundary', () => {
		setData( model, '<$text a="true">foo[]</$text>bar' );

		testTwoStepCaretMovement( [
			{ selectionAttributes: [ 'a' ], isGravityOverridden: false, preventDefault: 0, evtStop: 0 },
			'→',
			{ selectionAttributes: [], isGravityOverridden: true, preventDefault: 1, evtStop: 1 }
		] );

		// Simulate an external text insertion BEFORE the user selection to trigger #change:range.
		model.enqueueChange( 'transparent', writer => {
			writer.insertText( 'x', selection.getFirstPosition().getShiftedBy( -2 ) );
		} );

		expect( selection ).to.have.property( 'isGravityOverridden', true );
		expect( getSelectionAttributesArray( selection ) ).to.have.members( [] );
	} );

	describe( 'left–to–right and right–to–left content', () => {
		it( 'should call methods associated with the keys (LTR content direction)', () => {
			const forwardStub = testUtils.sinon.stub( TwoStepCaretHandler.prototype, 'handleForwardMovement' );
			const backwardStub = testUtils.sinon.stub( TwoStepCaretHandler.prototype, 'handleBackwardMovement' );

			setData( model, '<$text>foo[]</$text><$text a="true">bar</$text>' );

			fireKeyDownEvent( {
				keyCode: keyCodes.arrowright
			} );

			sinon.assert.calledOnce( forwardStub );
			sinon.assert.notCalled( backwardStub );

			setData( model, '<$text>foo</$text><$text a="true">[]bar</$text>' );

			fireKeyDownEvent( {
				keyCode: keyCodes.arrowleft
			} );

			sinon.assert.calledOnce( backwardStub );
			sinon.assert.calledOnce( forwardStub );
		} );

		it( 'should use the opposite helper methods (RTL content direction)', () => {
			const forwardStub = testUtils.sinon.stub( TwoStepCaretHandler.prototype, 'handleForwardMovement' );
			const backwardStub = testUtils.sinon.stub( TwoStepCaretHandler.prototype, 'handleBackwardMovement' );

			let model;

			return VirtualTestEditor
				.create( {
					plugins: [ TwoStepCaretMovement ],
					language: {
						content: 'ar'
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
					setData( model, '<$text>foo[]</$text><$text a="true">bar</$text>' );

					fireKeyDownEvent( {
						keyCode: keyCodes.arrowleft
					} );

					sinon.assert.calledOnce( forwardStub );
					sinon.assert.notCalled( backwardStub );

					setData( model, '<$text>foo</$text><$text a="true">[]bar</$text>' );

					fireKeyDownEvent( {
						keyCode: keyCodes.arrowright
					} );

					sinon.assert.calledOnce( backwardStub );
					sinon.assert.calledOnce( forwardStub );

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
		const eventData = new DomEventData( view.document, {
			target: document.body
		}, options );

		sinon.stub( eventInfo, 'stop' ).callsFake( evtStopSpy );

		view.document.fire( eventInfo, eventData );
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
							model.change( writer => {
								if ( position.isAtEnd ) {
									const nextBlock = position.parent.nextSibling;

									if ( nextBlock ) {
										writer.setSelection( Position._createAt( nextBlock, 0 ) );
									}
								} else {
									writer.setSelection( selection.getFirstPosition().getShiftedBy( 1 ) );
								}
							} );
						} else if ( step == '←' ) {
							model.change( writer => {
								if ( position.isAtStart ) {
									const previousBlock = position.parent.previousSibling;

									if ( previousBlock ) {
										writer.setSelection( Position._createAt( previousBlock, 'end' ) );
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
				const stepString = `in step #${ stepIndex } ${ JSON.stringify( step ) }`;

				if ( step.caretPosition !== undefined ) {
					expect( selection.getFirstPosition(), `in step #${ stepIndex }, selection's first position` )
						.to.have.deep.property( 'path', [ step.caretPosition ] );
				}
				expect( getSelectionAttributesArray( selection ), `in step #${ stepIndex }, selection's gravity` )
					.to.have.members( step.selectionAttributes, `#attributes ${ stepString }` );
				expect( selection, `in step #${ stepIndex }, selection's gravity` )
					.to.have.property( 'isGravityOverridden', step.isGravityOverridden );
				expect( preventDefaultSpy.callCount ).to.equal( step.preventDefault, `#preventDefault ${ stepString }` );
				expect( evtStopSpy.callCount ).to.equal( step.evtStop, `#evtStop ${ stepString }` );
			}
		}
	}
} );

