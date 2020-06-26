/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import UndoEditing from '../src/undoediting';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'UndoEditing integration', () => {
	let editor, model, doc, root, div;

	beforeEach( () => {
		div = document.createElement( 'div' );
		document.body.appendChild( div );

		return ClassicEditor.create( div, { plugins: [ Paragraph, HeadingEditing, Typing, Enter, Clipboard, BoldEditing, UndoEditing ] } )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
				doc = model.document;

				root = doc.getRoot();
			} );
	} );

	afterEach( () => {
		div.remove();

		return editor.destroy();
	} );

	function setSelection( pathA, pathB ) {
		model.change( writer => {
			writer.setSelection( writer.createRange(
				writer.createPositionFromPath( root, pathA ), writer.createPositionFromPath( root, pathB )
			) );
		} );
	}

	function input( input ) {
		model.enqueueChange( 'transparent', () => {
			setData( model, input );
		} );
	}

	function output( output ) {
		expect( getData( model ) ).to.equal( output );
	}

	function undoDisabled() {
		expect( editor.commands.get( 'undo' ).isEnabled ).to.be.false;
	}

	function redoDisabled() {
		expect( editor.commands.get( 'redo' ).isEnabled ).to.be.false;
	}

	describe( 'adding and removing content', () => {
		it( 'add and undo', () => {
			input( '<paragraph>fo[]o</paragraph><paragraph>bar</paragraph>' );

			model.change( writer => {
				writer.insertText( 'zzz', doc.selection.getFirstPosition() );
			} );
			output( '<paragraph>fozzz[]o</paragraph><paragraph>bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fo[]o</paragraph><paragraph>bar</paragraph>' );

			undoDisabled();
		} );

		it( 'multiple adding and undo', () => {
			input( '<paragraph>fo[]o</paragraph><paragraph>bar</paragraph>' );

			model.change( writer => {
				writer.insertText( 'zzz', doc.selection.getFirstPosition() );
				writer.insertText( 'xxx', writer.createPositionFromPath( root, [ 1, 0 ] ) );
			} );

			output( '<paragraph>fozzz[]o</paragraph><paragraph>xxxbar</paragraph>' );

			model.change( writer => {
				setSelection( [ 1, 0 ], [ 1, 0 ] );
				writer.insertText( 'yyy', doc.selection.getFirstPosition() );
			} );

			output( '<paragraph>fozzzo</paragraph><paragraph>yyy[]xxxbar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fozzzo</paragraph><paragraph>[]xxxbar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fo[]o</paragraph><paragraph>bar</paragraph>' );

			undoDisabled();
		} );

		it( 'multiple adding mixed with undo', () => {
			input( '<paragraph>fo[]o</paragraph><paragraph>bar</paragraph>' );

			model.change( writer => {
				writer.insertText( 'zzz', doc.selection.getFirstPosition() );
			} );
			output( '<paragraph>fozzz[]o</paragraph><paragraph>bar</paragraph>' );

			model.change( writer => {
				setSelection( [ 1, 0 ], [ 1, 0 ] );
				writer.insertText( 'yyy', doc.selection.getFirstPosition() );
			} );

			output( '<paragraph>fozzzo</paragraph><paragraph>yyy[]bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fozzzo</paragraph><paragraph>[]bar</paragraph>' );

			model.change( writer => {
				setSelection( [ 0, 0 ], [ 0, 0 ] );
				writer.insertText( 'xxx', doc.selection.getFirstPosition() );
			} );
			output( '<paragraph>xxx[]fozzzo</paragraph><paragraph>bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>[]fozzzo</paragraph><paragraph>bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fo[]o</paragraph><paragraph>bar</paragraph>' );

			undoDisabled();
		} );

		it( 'multiple remove and undo', () => {
			input( '<paragraph>[]foo</paragraph><paragraph>bar</paragraph>' );

			model.change( writer => {
				const start = doc.selection.getFirstPosition();
				writer.remove( writer.createRange( start, start.getShiftedBy( 2 ) ) );
			} );
			output( '<paragraph>[]o</paragraph><paragraph>bar</paragraph>' );

			model.change( writer => {
				setSelection( [ 1, 1 ], [ 1, 1 ] );
				const start = doc.selection.getFirstPosition();
				writer.remove( writer.createRange( start, start.getShiftedBy( 2 ) ) );
			} );
			output( '<paragraph>o</paragraph><paragraph>b[]</paragraph>' );

			editor.execute( 'undo' );
			// Here is an edge case that selection could be before or after `ar`.
			output( '<paragraph>o</paragraph><paragraph>bar[]</paragraph>' );

			editor.execute( 'undo' );
			// As above.
			output( '<paragraph>fo[]o</paragraph><paragraph>bar</paragraph>' );

			undoDisabled();
		} );

		it( 'add and remove different parts and undo', () => {
			input( '<paragraph>fo[]o</paragraph><paragraph>bar</paragraph>' );

			model.change( writer => {
				writer.insertText( 'zzz', doc.selection.getFirstPosition() );
			} );
			output( '<paragraph>fozzz[]o</paragraph><paragraph>bar</paragraph>' );

			model.change( writer => {
				setSelection( [ 1, 2 ], [ 1, 2 ] );
				const start = writer.createPositionFromPath( root, [ 1, 1 ] );
				writer.remove( writer.createRange( start, start.getShiftedBy( 1 ) ) );
			} );
			output( '<paragraph>fozzzo</paragraph><paragraph>b[]r</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fozzzo</paragraph><paragraph>ba[]r</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fo[]o</paragraph><paragraph>bar</paragraph>' );

			undoDisabled();
		} );

		it( 'add and remove same part and undo', () => {
			input( '<paragraph>fo[]o</paragraph><paragraph>bar</paragraph>' );

			model.change( writer => {
				writer.insertText( 'zzz', doc.selection.getFirstPosition() );
			} );
			output( '<paragraph>fozzz[]o</paragraph><paragraph>bar</paragraph>' );

			model.change( writer => {
				const start = writer.createPositionFromPath( root, [ 0, 2 ] );
				writer.remove( writer.createRange( start, start.getShiftedBy( 3 ) ) );
			} );
			output( '<paragraph>fo[]o</paragraph><paragraph>bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fozzz[]o</paragraph><paragraph>bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fo[]o</paragraph><paragraph>bar</paragraph>' );

			undoDisabled();
		} );

		it( 'undo remove all content', () => {
			input( '<paragraph>foo[]</paragraph>' );

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
			} );
			output( '<paragraph>[]</paragraph>' ); // All hail our king and savior, autoparagraphing!

			editor.execute( 'undo' );
			output( '<paragraph>foo[]</paragraph>' );

			undoDisabled();
		} );

		it( 'undo insert first content', () => {
			input( '' );
			output( '<paragraph>[]</paragraph>' ); // All hail our king and savior, autoparagraphing!

			model.change( writer => {
				writer.remove( writer.createRangeIn( root ) );
				writer.insertElement( 'heading1', doc.selection.getFirstPosition() );
			} );

			output( '<heading1>[]</heading1>' );

			editor.execute( 'undo' );
			output( '<paragraph>[]</paragraph>' );

			undoDisabled();
		} );

		// #72.
		it( 'undo paste multiple elements simulation', () => {
			input( '<paragraph></paragraph>' );

			const p = root.getChild( 0 );
			const pos = model.createPositionFromPath( root, [ 0 ] );

			model.change( writer => {
				writer.remove( p );
				writer.insertElement( 'heading1', pos );
				writer.insertElement( 'heading2', pos.getShiftedBy( 1 ) );
			} );

			output( '<heading1>[]</heading1><heading2></heading2>' );

			editor.execute( 'undo' );

			output( '<paragraph>[]</paragraph>' );

			undoDisabled();
		} );
	} );

	describe( 'moving', () => {
		it( 'move same content twice then undo', () => {
			input( '<paragraph>f[o]z</paragraph><paragraph>bar</paragraph>' );

			model.change( writer => {
				writer.move( doc.selection.getFirstRange(), writer.createPositionFromPath( root, [ 1, 0 ] ) );
			} );
			output( '<paragraph>fz</paragraph><paragraph>[o]bar</paragraph>' );

			model.change( writer => {
				writer.move( doc.selection.getFirstRange(), writer.createPositionFromPath( root, [ 0, 2 ] ) );
			} );
			output( '<paragraph>fz[o]</paragraph><paragraph>bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fz</paragraph><paragraph>[o]bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>f[o]z</paragraph><paragraph>bar</paragraph>' );

			undoDisabled();
		} );

		it( 'move content and new parent then undo', () => {
			input( '<paragraph>f[o]z</paragraph><paragraph>bar</paragraph>' );

			model.change( writer => {
				writer.move( doc.selection.getFirstRange(), writer.createPositionFromPath( root, [ 1, 0 ] ) );
			} );
			output( '<paragraph>fz</paragraph><paragraph>[o]bar</paragraph>' );

			model.change( writer => {
				setSelection( [ 1 ], [ 2 ] );
				writer.move( doc.selection.getFirstRange(), writer.createPositionFromPath( root, [ 0 ] ) );
			} );
			output( '<paragraph>[obar]</paragraph><paragraph>fz</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fz</paragraph><paragraph>[obar]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>f[o]z</paragraph><paragraph>bar</paragraph>' );

			undoDisabled();
		} );
	} );

	describe( 'attributes with other', () => {
		it( 'attributes then insert inside then undo', () => {
			input( '<paragraph>fo[ob]ar</paragraph>' );

			model.change( writer => {
				writer.setAttribute( 'bold', true, doc.selection.getFirstRange() );
			} );
			output( '<paragraph>fo[<$text bold="true">ob</$text>]ar</paragraph>' );
			expect( doc.selection.getAttribute( 'bold' ) ).to.be.true;

			model.change( writer => {
				setSelection( [ 0, 3 ], [ 0, 3 ] );
				writer.insertText( 'zzz', doc.selection.getFirstPosition() );
			} );
			output( '<paragraph>fo<$text bold="true">o</$text>zzz[]<$text bold="true">b</$text>ar</paragraph>' );
			expect( doc.selection.getAttribute( 'bold' ) ).to.be.undefined;

			editor.execute( 'undo' );
			output( '<paragraph>fo<$text bold="true">o[]b</$text>ar</paragraph>' );
			expect( doc.selection.getAttribute( 'bold' ) ).to.be.true;

			editor.execute( 'undo' );
			output( '<paragraph>fo[ob]ar</paragraph>' );
			expect( doc.selection.getAttribute( 'bold' ) ).to.be.undefined;

			undoDisabled();
		} );
	} );

	describe( 'wrapping, unwrapping, merging, splitting', () => {
		it( 'wrap and undo', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );
			input( 'fo[zb]ar' );

			model.change( writer => {
				writer.wrap( doc.selection.getFirstRange(), 'paragraph' );
			} );
			output( 'fo<paragraph>[zb]</paragraph>ar' );

			editor.execute( 'undo' );
			output( 'fo[zb]ar' );

			undoDisabled();
		} );

		it( 'wrap, move and undo', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );
			input( 'fo[zb]ar' );

			model.change( writer => {
				writer.wrap( doc.selection.getFirstRange(), 'paragraph' );
			} );
			// Would be better if selection was inside P.
			output( 'fo<paragraph>[zb]</paragraph>ar' );

			model.change( writer => {
				setSelection( [ 2, 0 ], [ 2, 1 ] );
				writer.move( doc.selection.getFirstRange(), writer.createPositionFromPath( root, [ 0 ] ) );
			} );
			output( '[z]fo<paragraph>b</paragraph>ar' );

			editor.execute( 'undo' );
			output( 'fo<paragraph>[z]b</paragraph>ar' );

			editor.execute( 'undo' );
			output( 'fo[zb]ar' );

			undoDisabled();
		} );

		it( 'unwrap and undo', () => {
			input( '<paragraph>foo[]bar</paragraph>' );

			model.change( writer => {
				writer.unwrap( doc.selection.getFirstPosition().parent );
			} );
			output( 'foo[]bar' );

			editor.execute( 'undo' );
			output( '<paragraph>foo[]bar</paragraph>' );

			undoDisabled();
		} );

		it( 'merge and undo', () => {
			input( '<paragraph>foo</paragraph><paragraph>[]bar</paragraph>' );

			model.change( writer => {
				writer.merge( writer.createPositionFromPath( root, [ 1 ] ) );
			} );
			output( '<paragraph>foo[]bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

			undoDisabled();
		} );

		it( 'split and undo', () => {
			input( '<paragraph>foo[]bar</paragraph>' );

			model.change( writer => {
				writer.split( doc.selection.getFirstPosition() );
			} );
			output( '<paragraph>foo[]</paragraph><paragraph>bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>foo[]bar</paragraph>' );

			undoDisabled();
		} );

		it.skip( 'move, merge and undo', () => {
			// Add a "div feature".
			model.schema.register( 'div', {
				allowWhere: '$block',
				allowContentOf: '$root'
			} );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'div', view: 'div' } );
			editor.conversion.for( 'upcast' ).elementToElement( { model: 'div', view: 'div' } );

			input(
				'<div><paragraph>[]00.</paragraph><paragraph>01.</paragraph><paragraph>02.</paragraph></div>' +
				'<div><paragraph>10.</paragraph><paragraph>11.</paragraph><paragraph>12.</paragraph></div>'
			);

			const elements = [
				root.getNodeByPath( [ 0, 1 ] ),
				root.getNodeByPath( [ 1, 0 ] ),
				root.getNodeByPath( [ 1, 1 ] )
			];

			model.change( writer => {
				for ( let i = elements.length - 1; i > 0; i-- ) {
					merge( elements[ i ], elements[ i - 1 ], writer );
				}
			} );
			output(
				'<div><paragraph>[]00.</paragraph><paragraph>01.10.11.</paragraph><paragraph>02.</paragraph></div>' +
				'<div><paragraph>12.</paragraph></div>'
			);

			editor.execute( 'undo' );
			output(
				'<div><paragraph>[]00.</paragraph><paragraph>01.</paragraph><paragraph>02.</paragraph></div>' +
				'<div><paragraph>10.</paragraph><paragraph>11.</paragraph><paragraph>12.</paragraph></div>'
			);

			function merge( element, targetElement, writer ) {
				const positionAfterTarget = writer.createPositionAfter( targetElement );
				const positionBeforeElement = writer.createPositionBefore( element );

				if ( !positionAfterTarget.isEqual( positionBeforeElement ) ) {
					writer.move( writer.createRangeOn( element ), positionAfterTarget );
				}

				writer.merge( positionAfterTarget );
			}
		} );
	} );

	// Restoring selection in those examples may be completely off.
	describe( 'multiple enters, deletes and typing', () => {
		it( 'split, split, split', () => {
			input( '<paragraph>12345678</paragraph>' );

			split( [ 0, 3 ] );
			output( '<paragraph>123</paragraph><paragraph>[]45678</paragraph>' );

			split( [ 1, 4 ] );
			output( '<paragraph>123</paragraph><paragraph>4567</paragraph><paragraph>[]8</paragraph>' );

			split( [ 1, 2 ] );
			output( '<paragraph>123</paragraph><paragraph>45</paragraph><paragraph>[]67</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>45[]67</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>4567[]8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123[]45678</paragraph>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<paragraph>123[]</paragraph><paragraph>45678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123</paragraph><paragraph>4567[]</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123</paragraph><paragraph>45[]</paragraph><paragraph>67</paragraph><paragraph>8</paragraph>' );

			redoDisabled();
		} );

		it( 'merge, merge, merge', () => {
			input( '<paragraph>123</paragraph><paragraph>45</paragraph><paragraph>67</paragraph><paragraph>8</paragraph>' );

			merge( [ 1 ] );
			output( '<paragraph>123[]45</paragraph><paragraph>67</paragraph><paragraph>8</paragraph>' );

			merge( [ 2 ] );
			output( '<paragraph>12345</paragraph><paragraph>67[]8</paragraph>' );

			merge( [ 1 ] );
			output( '<paragraph>12345[]678</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345[]</paragraph><paragraph>678</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345</paragraph><paragraph>67[]</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123[]</paragraph><paragraph>45</paragraph><paragraph>67</paragraph><paragraph>8</paragraph>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<paragraph>123[]45</paragraph><paragraph>67</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345</paragraph><paragraph>67[]8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345[]678</paragraph>' );

			redoDisabled();
		} );

		it( 'split, merge, split, merge (same position)', () => {
			input( '<paragraph>12345678</paragraph>' );

			split( [ 0, 3 ] );
			output( '<paragraph>123</paragraph><paragraph>[]45678</paragraph>' );

			merge( [ 1 ] );
			output( '<paragraph>123[]45678</paragraph>' );

			split( [ 0, 3 ] );
			output( '<paragraph>123</paragraph><paragraph>[]45678</paragraph>' );

			merge( [ 1 ] );
			output( '<paragraph>123[]45678</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123[]</paragraph><paragraph>45678</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123[]45678</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123[]</paragraph><paragraph>45678</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123[]45678</paragraph>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<paragraph>123[]</paragraph><paragraph>45678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123[]45678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123[]</paragraph><paragraph>45678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123[]45678</paragraph>' );

			redoDisabled();
		} );

		it( 'split, split, split, merge, merge, merge', () => {
			input( '<paragraph>12345678</paragraph>' );

			split( [ 0, 3 ] );
			output( '<paragraph>123</paragraph><paragraph>[]45678</paragraph>' );

			split( [ 1, 4 ] );
			output( '<paragraph>123</paragraph><paragraph>4567</paragraph><paragraph>[]8</paragraph>' );

			split( [ 1, 2 ] );
			output( '<paragraph>123</paragraph><paragraph>45</paragraph><paragraph>[]67</paragraph><paragraph>8</paragraph>' );

			merge( [ 1 ] );
			output( '<paragraph>123[]45</paragraph><paragraph>67</paragraph><paragraph>8</paragraph>' );

			merge( [ 2 ] );
			output( '<paragraph>12345</paragraph><paragraph>67[]8</paragraph>' );

			merge( [ 1 ] );
			output( '<paragraph>12345[]678</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345[]</paragraph><paragraph>678</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345</paragraph><paragraph>67[]</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123[]</paragraph><paragraph>45</paragraph><paragraph>67</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>45[]67</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>4567[]8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123[]45678</paragraph>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<paragraph>123[]</paragraph><paragraph>45678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123</paragraph><paragraph>4567[]</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123</paragraph><paragraph>45[]</paragraph><paragraph>67</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123[]45</paragraph><paragraph>67</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345</paragraph><paragraph>67[]8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345[]678</paragraph>' );

			redoDisabled();
		} );

		it( 'split, split, merge, split, merge (different order)', () => {
			input( '<paragraph>12345678</paragraph>' );

			split( [ 0, 3 ] );
			output( '<paragraph>123</paragraph><paragraph>[]45678</paragraph>' );

			split( [ 1, 2 ] );
			output( '<paragraph>123</paragraph><paragraph>45</paragraph><paragraph>[]678</paragraph>' );

			merge( [ 1 ] );
			output( '<paragraph>123[]45</paragraph><paragraph>678</paragraph>' );

			split( [ 1, 1 ] );
			output( '<paragraph>12345</paragraph><paragraph>6</paragraph><paragraph>[]78</paragraph>' );

			merge( [ 1 ] );
			output( '<paragraph>12345[]6</paragraph><paragraph>78</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345[]</paragraph><paragraph>6</paragraph><paragraph>78</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345</paragraph><paragraph>6[]78</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123[]</paragraph><paragraph>45</paragraph><paragraph>678</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>45[]678</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123[]45678</paragraph>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<paragraph>123[]</paragraph><paragraph>45678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123</paragraph><paragraph>45[]</paragraph><paragraph>678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123[]45</paragraph><paragraph>678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345</paragraph><paragraph>6[]</paragraph><paragraph>78</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345[]6</paragraph><paragraph>78</paragraph>' );

			redoDisabled();
		} );

		it( 'split, remove, split, merge, merge', () => {
			input( '<paragraph>12345678</paragraph>' );

			split( [ 0, 3 ] );
			output( '<paragraph>123</paragraph><paragraph>[]45678</paragraph>' );

			remove( [ 1, 4 ] );
			remove( [ 1, 3 ] );
			output( '<paragraph>123</paragraph><paragraph>45[]8</paragraph>' );

			split( [ 1, 1 ] );
			output( '<paragraph>123</paragraph><paragraph>4</paragraph><paragraph>[]58</paragraph>' );

			merge( [ 1 ] );
			output( '<paragraph>123[]4</paragraph><paragraph>58</paragraph>' );

			merge( [ 1 ] );
			output( '<paragraph>1234[]58</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>1234[]</paragraph><paragraph>58</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123[]</paragraph><paragraph>4</paragraph><paragraph>58</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>4[]58</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>4567[]8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123[]45678</paragraph>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<paragraph>123[]</paragraph><paragraph>45678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123</paragraph><paragraph>45[]8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123</paragraph><paragraph>4[]</paragraph><paragraph>58</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123[]4</paragraph><paragraph>58</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>1234[]58</paragraph>' );

			redoDisabled();
		} );

		it( 'split, typing, split, merge, merge', () => {
			input( '<paragraph>12345678</paragraph>' );

			split( [ 0, 3 ] );
			output( '<paragraph>123</paragraph><paragraph>[]45678</paragraph>' );

			type( [ 1, 4 ], 'x' );
			type( [ 1, 5 ], 'y' );
			output( '<paragraph>123</paragraph><paragraph>4567xy[]8</paragraph>' );

			split( [ 1, 2 ] );
			output( '<paragraph>123</paragraph><paragraph>45</paragraph><paragraph>[]67xy8</paragraph>' );

			merge( [ 1 ] );
			output( '<paragraph>123[]45</paragraph><paragraph>67xy8</paragraph>' );

			merge( [ 1 ] );
			output( '<paragraph>12345[]67xy8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345[]</paragraph><paragraph>67xy8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123[]</paragraph><paragraph>45</paragraph><paragraph>67xy8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>45[]67xy8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>4567[]8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123[]45678</paragraph>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<paragraph>123[]</paragraph><paragraph>45678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123</paragraph><paragraph>4567xy[]8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123</paragraph><paragraph>45[]</paragraph><paragraph>67xy8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123[]45</paragraph><paragraph>67xy8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345[]67xy8</paragraph>' );

			redoDisabled();
		} );
	} );

	describe( 'other reported cases', () => {
		// ckeditor5-engine#t/1051
		it( 'rename leaks to other elements on undo #1', () => {
			input( '<heading1>[]Foo</heading1><paragraph>Bar</paragraph>' );

			model.change( writer => {
				writer.rename( root.getChild( 0 ), 'paragraph' );
			} );
			output( '<paragraph>[]Foo</paragraph><paragraph>Bar</paragraph>' );

			model.change( writer => {
				writer.split( writer.createPositionAt( root.getChild( 0 ), 1 ) );
			} );
			output( '<paragraph>[]F</paragraph><paragraph>oo</paragraph><paragraph>Bar</paragraph>' );

			model.change( writer => {
				writer.merge( writer.createPositionAt( root, 2 ) );
			} );
			output( '<paragraph>[]F</paragraph><paragraph>ooBar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>[]F</paragraph><paragraph>oo</paragraph><paragraph>Bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>[]Foo</paragraph><paragraph>Bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<heading1>[]Foo</heading1><paragraph>Bar</paragraph>' );
		} );

		// Similar issue that bases on the same error as above, however here we first merge (above we first split).
		it( 'rename leaks to other elements on undo #2', () => {
			input( '<heading1>[]Foo</heading1><paragraph>Bar</paragraph>' );

			model.change( writer => {
				writer.rename( root.getChild( 0 ), 'heading2' );
			} );
			output( '<heading2>[]Foo</heading2><paragraph>Bar</paragraph>' );

			model.change( writer => {
				writer.merge( writer.createPositionAt( root, 1 ) );
			} );
			output( '<heading2>[]FooBar</heading2>' );

			editor.execute( 'undo' );
			output( '<heading2>[]Foo</heading2><paragraph>Bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<heading1>[]Foo</heading1><paragraph>Bar</paragraph>' );
		} );

		// Reverse issue, this time first operation is merge and then rename.
		it( 'merge, rename, undo, undo is correct', () => {
			input( '<heading1>[]Foo</heading1><paragraph>Bar</paragraph>' );

			model.change( writer => {
				writer.merge( writer.createPositionAt( root, 1 ) );
			} );
			output( '<heading1>[]FooBar</heading1>' );

			model.change( writer => {
				writer.rename( root.getChild( 0 ), 'heading2' );
			} );
			output( '<heading2>[]FooBar</heading2>' );

			editor.execute( 'undo' );
			output( '<heading1>[]FooBar</heading1>' );

			editor.execute( 'undo' );
			output( '<heading1>[]Foo</heading1><paragraph>Bar</paragraph>' );
		} );

		// ckeditor5-engine#t/1053
		it( 'wrap, split, undo, undo is correct', () => {
			// Add a "div feature".
			model.schema.register( 'div', {
				allowWhere: '$block',
				allowContentOf: '$root'
			} );

			editor.conversion.for( 'downcast' ).elementToElement( { model: 'div', view: 'div' } );
			editor.conversion.for( 'upcast' ).elementToElement( { model: 'div', view: 'div' } );

			input( '<paragraph>[]Foo</paragraph><paragraph>Bar</paragraph>' );

			model.change( writer => {
				writer.wrap( writer.createRangeIn( root ), 'div' );
			} );
			output( '<div><paragraph>[]Foo</paragraph><paragraph>Bar</paragraph></div>' );

			model.change( writer => {
				writer.split( writer.createPositionFromPath( root, [ 0, 0, 1 ] ) );
			} );
			output( '<div><paragraph>[]F</paragraph><paragraph>oo</paragraph><paragraph>Bar</paragraph></div>' );

			editor.execute( 'undo' );
			output( '<div><paragraph>[]Foo</paragraph><paragraph>Bar</paragraph></div>' );

			editor.execute( 'undo' );
			output( '<paragraph>[]Foo</paragraph><paragraph>Bar</paragraph>' );
		} );

		// ckeditor5-engine#t/1055
		it( 'selection attribute setting: split, bold, merge, undo, undo, undo', () => {
			input( '<paragraph>Foo[]</paragraph><paragraph>Bar</paragraph>' );

			editor.execute( 'enter' );
			output( '<paragraph>Foo</paragraph><paragraph>[]</paragraph><paragraph>Bar</paragraph>' );

			editor.execute( 'bold' );
			output(
				'<paragraph>Foo</paragraph>' +
				'<paragraph selection:bold="true"><$text bold="true">[]</$text></paragraph>' +
				'<paragraph>Bar</paragraph>'
			);

			editor.execute( 'forwardDelete' );
			output( '<paragraph>Foo</paragraph><paragraph>[]Bar</paragraph>' );

			editor.execute( 'undo' );
			output(
				'<paragraph>Foo</paragraph>' +
				'<paragraph selection:bold="true"><$text bold="true">[]</$text></paragraph>' +
				'<paragraph>Bar</paragraph>'
			);

			editor.execute( 'undo' );
			output( '<paragraph>Foo</paragraph><paragraph>[]</paragraph><paragraph>Bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>Foo[]</paragraph><paragraph>Bar</paragraph>' );
		} );

		// https://github.com/ckeditor/ckeditor5-undo/issues/65#issuecomment-323682195
		it( 'undoing split after the element created by split has been removed', () => {
			input( '<paragraph>Foo[]bar</paragraph>' );

			editor.execute( 'enter' );

			model.change( writer => {
				const range = writer.createRange(
					writer.createPositionFromPath( root, [ 0, 3 ] ),
					writer.createPositionFromPath( root, [ 1, 3 ] )
				);

				writer.setSelection( range );

				editor.execute( 'delete' );
			} );
			output( '<paragraph>Foo[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>Foo[</paragraph><paragraph>bar]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>Foo[]bar</paragraph>' );
		} );
	} );

	describe( 'clipboard', () => {
		function pasteHtml( editor, html ) {
			editor.editing.view.document.fire( 'paste', {
				dataTransfer: createDataTransfer( { 'text/html': html } ),
				stopPropagation() {},
				preventDefault() {}
			} );
		}

		function createDataTransfer( data ) {
			return {
				getData( type ) {
					return data[ type ];
				},
				setData() {}
			};
		}

		// ckeditor5-engine#t/1065
		it( 'undo paste into non empty element should not throw and be correct', () => {
			model.change( () => {
				input( '<paragraph>Foo[]</paragraph>' );
			} );

			model.change( () => {
				pasteHtml( editor, '<p>a</p><p>b</p>' );
			} );

			output( '<paragraph>Fooa</paragraph><paragraph>b[]</paragraph>' );

			model.change( () => {
				pasteHtml( editor, '<p>c</p><p>d</p>' );
			} );

			output( '<paragraph>Fooa</paragraph><paragraph>bc</paragraph><paragraph>d[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>Fooa</paragraph><paragraph>b[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>Foo[]</paragraph>' );
		} );

		// ckeditor5#781
		it( 'cutting should not create empty undo step', () => {
			input( '<paragraph>Fo[oba]r</paragraph>' );

			editor.editing.view.document.fire( 'cut', {
				dataTransfer: createDataTransfer(),
				preventDefault() {},
				method: 'cut'
			} );

			editor.execute( 'undo' );

			output( '<paragraph>Fo[oba]r</paragraph>' );
			undoDisabled();
		} );
	} );

	describe( 'other edge cases', () => {
		it( 'deleteContent between two nodes', () => {
			input( '<paragraph>fo[o</paragraph><paragraph>b]ar</paragraph>' );

			editor.model.deleteContent( doc.selection );
			output( '<paragraph>fo[]ar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fo[o</paragraph><paragraph>b]ar</paragraph>' );
		} );

		// Related to ckeditor5-engine#891 and ckeditor5-list#51.
		it( 'change attribute of removed node then undo and redo', () => {
			input( '<paragraph></paragraph>' );

			const gy = doc.graveyard;
			const p = doc.getRoot().getChild( 0 );

			model.change( writer => {
				writer.remove( p );
			} );

			model.change( writer => {
				writer.setAttribute( 'bold', true, p );
			} );

			editor.execute( 'undo' );
			editor.execute( 'redo' );

			expect( p.root ).to.equal( gy );
			expect( p.getAttribute( 'bold' ) ).to.be.true;
		} );
	} );

	it( 'postfixers should not add another undo step when fixing undo changes', () => {
		input( '<paragraph>[]</paragraph>' );
		const paragraph = root.getChild( 0 );

		// 1. Step - add text and marker to the paragraph.
		model.change( writer => {
			writer.appendText( 'foo', paragraph );
			writer.addMarker( 'marker', { range: writer.createRangeIn( paragraph ), usingOperation: true } );
		} );

		// 2. Step - remove text from paragraph.
		model.change( writer => {
			writer.remove( writer.createRangeIn( paragraph ) );
		} );

		// Register post fixer to remove marker from non-empty paragraph.
		model.document.registerPostFixer( writer => {
			const hasMarker = model.markers.has( 'marker' );
			const isEmpty = paragraph.childCount === 0;

			// Remove marker when paragraph is empty.
			if ( hasMarker && !isEmpty ) {
				writer.removeMarker( 'marker' );

				return true;
			}

			return false;
		} );

		editor.execute( 'undo' );

		// Check if postfixer changes are executed together with undo and there is no additional undo steps.
		expect( model.markers.has( 'marker' ) ).to.be.false;
		expect( editor.commands.get( 'undo' )._stack.length ).to.equal( 1 );
		output( '<paragraph>foo[]</paragraph>' );
	} );

	function split( path ) {
		setSelection( path.slice(), path.slice() );
		editor.execute( 'enter' );
	}

	function merge( path ) {
		const selPath = path.slice();
		selPath.push( 0 );
		setSelection( selPath, selPath.slice() );
		editor.execute( 'delete' );
	}

	function type( path, text ) {
		setSelection( path.slice(), path.slice() );
		editor.execute( 'input', { text } );
	}

	function remove( path ) {
		setSelection( path.slice(), path.slice() );
		editor.execute( 'delete' );
	}
} );
