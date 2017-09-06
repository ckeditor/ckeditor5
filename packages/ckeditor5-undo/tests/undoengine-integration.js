/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import UndoEngine from '../src/undoengine';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingEngine from '@ckeditor/ckeditor5-heading/src/headingengine';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import BoldEngine from '@ckeditor/ckeditor5-basic-styles/src/boldengine';

import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'UndoEngine integration', () => {
	let editor, doc, root, div;

	beforeEach( () => {
		div = document.createElement( 'div' );
		document.body.appendChild( div );

		return ClassicEditor.create( div, { plugins: [ Paragraph, HeadingEngine, Typing, Enter, Clipboard, BoldEngine, UndoEngine ] } )
			.then( newEditor => {
				editor = newEditor;

				doc = editor.document;

				// Add "div feature".
				doc.schema.registerItem( 'div', '$block' );
				buildModelConverter().for( editor.data.modelToView, editor.editing.modelToView ).fromElement( 'div' ).toElement( 'div' );
				buildViewConverter().for( editor.data.viewToModel ).fromElement( 'div' ).toElement( 'div' );

				root = doc.getRoot();
			} );
	} );

	function setSelection( pathA, pathB ) {
		doc.selection.setRanges( [ new Range( new Position( root, pathA ), new Position( root, pathB ) ) ] );
	}

	function input( input ) {
		setData( doc, input );
	}

	function output( output ) {
		expect( getData( doc ) ).to.equal( output );
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

			doc.enqueueChanges( () => {
				doc.batch().insert( doc.selection.getFirstPosition(), 'zzz' );
			} );
			output( '<paragraph>fozzz[]o</paragraph><paragraph>bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fo[]o</paragraph><paragraph>bar</paragraph>' );

			undoDisabled();
		} );

		it( 'multiple adding and undo', () => {
			input( '<paragraph>fo[]o</paragraph><paragraph>bar</paragraph>' );

			doc.enqueueChanges( () => {
				doc.batch()
					.insert( doc.selection.getFirstPosition(), 'zzz' )
					.insert( new Position( root, [ 1, 0 ] ), 'xxx' );
			} );

			output( '<paragraph>fozzz[]o</paragraph><paragraph>xxxbar</paragraph>' );

			doc.enqueueChanges( () => {
				setSelection( [ 1, 0 ], [ 1, 0 ] );
				doc.batch().insert( doc.selection.getFirstPosition(), 'yyy' );
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

			doc.enqueueChanges( () => {
				doc.batch().insert( doc.selection.getFirstPosition(), 'zzz' );
			} );
			output( '<paragraph>fozzz[]o</paragraph><paragraph>bar</paragraph>' );

			doc.enqueueChanges( () => {
				setSelection( [ 1, 0 ], [ 1, 0 ] );
				doc.batch().insert( doc.selection.getFirstPosition(), 'yyy' );
			} );

			output( '<paragraph>fozzzo</paragraph><paragraph>yyy[]bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fozzzo</paragraph><paragraph>[]bar</paragraph>' );

			doc.enqueueChanges( () => {
				setSelection( [ 0, 0 ], [ 0, 0 ] );
				doc.batch().insert( doc.selection.getFirstPosition(), 'xxx' );
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

			doc.enqueueChanges( () => {
				doc.batch().remove( Range.createFromPositionAndShift( doc.selection.getFirstPosition(), 2 ) );
			} );
			output( '<paragraph>[]o</paragraph><paragraph>bar</paragraph>' );

			doc.enqueueChanges( () => {
				setSelection( [ 1, 1 ], [ 1, 1 ] );
				doc.batch().remove( Range.createFromPositionAndShift( doc.selection.getFirstPosition(), 2 ) );
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

			doc.enqueueChanges( () => {
				doc.batch().insert( doc.selection.getFirstPosition(), 'zzz' );
			} );
			output( '<paragraph>fozzz[]o</paragraph><paragraph>bar</paragraph>' );

			doc.enqueueChanges( () => {
				setSelection( [ 1, 2 ], [ 1, 2 ] );
				doc.batch().remove( Range.createFromPositionAndShift( new Position( root, [ 1, 1 ] ), 1 ) );
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

			doc.enqueueChanges( () => {
				doc.batch().insert( doc.selection.getFirstPosition(), 'zzz' );
			} );
			output( '<paragraph>fozzz[]o</paragraph><paragraph>bar</paragraph>' );

			doc.enqueueChanges( () => {
				doc.batch().remove( Range.createFromPositionAndShift( new Position( root, [ 0, 2 ] ), 3 ) );
			} );
			output( '<paragraph>fo[]o</paragraph><paragraph>bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fozzz[]o</paragraph><paragraph>bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fo[]o</paragraph><paragraph>bar</paragraph>' );

			undoDisabled();
		} );
	} );

	describe( 'moving', () => {
		it( 'move same content twice then undo', () => {
			input( '<paragraph>f[o]z</paragraph><paragraph>bar</paragraph>' );

			doc.enqueueChanges( () => {
				doc.batch().move( doc.selection.getFirstRange(), new Position( root, [ 1, 0 ] ) );
			} );
			output( '<paragraph>fz</paragraph><paragraph>[o]bar</paragraph>' );

			doc.enqueueChanges( () => {
				doc.batch().move( doc.selection.getFirstRange(), new Position( root, [ 0, 2 ] ) );
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

			doc.enqueueChanges( () => {
				doc.batch().move( doc.selection.getFirstRange(), new Position( root, [ 1, 0 ] ) );
			} );
			output( '<paragraph>fz</paragraph><paragraph>[o]bar</paragraph>' );

			doc.enqueueChanges( () => {
				setSelection( [ 1 ], [ 2 ] );
				doc.batch().move( doc.selection.getFirstRange(), new Position( root, [ 0 ] ) );
			} );
			output( '[<paragraph>obar</paragraph>]<paragraph>fz</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fz</paragraph>[<paragraph>obar</paragraph>]' );

			editor.execute( 'undo' );
			output( '<paragraph>f[o]z</paragraph><paragraph>bar</paragraph>' );

			undoDisabled();
		} );
	} );

	describe( 'attributes with other', () => {
		it( 'attributes then insert inside then undo', () => {
			input( '<paragraph>fo[ob]ar</paragraph>' );

			doc.enqueueChanges( () => {
				doc.batch().setAttribute( doc.selection.getFirstRange(), 'bold', true );
			} );
			output( '<paragraph>fo[<$text bold="true">ob</$text>]ar</paragraph>' );

			doc.enqueueChanges( () => {
				setSelection( [ 0, 3 ], [ 0, 3 ] );
				doc.batch().insert( doc.selection.getFirstPosition(), 'zzz' );
			} );
			output( '<paragraph>fo<$text bold="true">o</$text>zzz<$text bold="true">[]b</$text>ar</paragraph>' );
			expect( doc.selection.getAttribute( 'bold' ) ).to.true;

			editor.execute( 'undo' );
			output( '<paragraph>fo<$text bold="true">o[]b</$text>ar</paragraph>' );
			expect( doc.selection.getAttribute( 'bold' ) ).to.true;

			editor.execute( 'undo' );
			output( '<paragraph>fo[ob]ar</paragraph>' );

			undoDisabled();
		} );
	} );

	describe( 'wrapping, unwrapping, merging, splitting', () => {
		it( 'wrap and undo', () => {
			doc.schema.allow( { name: '$text', inside: '$root' } );
			input( 'fo[zb]ar' );

			doc.enqueueChanges( () => {
				doc.batch().wrap( doc.selection.getFirstRange(), 'paragraph' );
			} );
			output( 'fo<paragraph>[zb]</paragraph>ar' );

			editor.execute( 'undo' );
			output( 'fo[zb]ar' );

			undoDisabled();
		} );

		it( 'wrap, move and undo', () => {
			doc.schema.allow( { name: '$text', inside: '$root' } );
			input( 'fo[zb]ar' );

			doc.enqueueChanges( () => {
				doc.batch().wrap( doc.selection.getFirstRange(), 'paragraph' );
			} );
			// Would be better if selection was inside P.
			output( 'fo<paragraph>[zb]</paragraph>ar' );

			doc.enqueueChanges( () => {
				setSelection( [ 2, 0 ], [ 2, 1 ] );
				doc.batch().move( doc.selection.getFirstRange(), new Position( root, [ 0 ] ) );
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

			doc.enqueueChanges( () => {
				doc.batch().unwrap( doc.selection.getFirstPosition().parent );
			} );
			output( 'foo[]bar' );

			editor.execute( 'undo' );
			output( '<paragraph>foo[]bar</paragraph>' );

			undoDisabled();
		} );

		it( 'merge and undo', () => {
			input( '<paragraph>foo</paragraph><paragraph>[]bar</paragraph>' );

			doc.enqueueChanges( () => {
				doc.batch().merge( new Position( root, [ 1 ] ) );
				// Because selection is stuck with <paragraph> it ends up in graveyard. We have to manually move it to correct node.
				setSelection( [ 0, 3 ], [ 0, 3 ] );
			} );
			output( '<paragraph>foo[]bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>foo</paragraph><paragraph>bar[]</paragraph>' );

			undoDisabled();
		} );

		it( 'split and undo', () => {
			input( '<paragraph>foo[]bar</paragraph>' );

			doc.enqueueChanges( () => {
				doc.batch().split( doc.selection.getFirstPosition() );
				// Because selection is stuck with <paragraph> it ends up in wrong node. We have to manually move it to correct node.
				setSelection( [ 1, 0 ], [ 1, 0 ] );
			} );
			output( '<paragraph>foo</paragraph><paragraph>[]bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>foobar[]</paragraph>' );

			undoDisabled();
		} );
	} );

	// Restoring selection in those examples may be completely off.
	describe( 'multiple enters, deletes and typing', () => {
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

		it( 'split, split, split', () => {
			input( '<paragraph>12345678</paragraph>' );

			split( [ 0, 3 ] );
			output( '<paragraph>123</paragraph><paragraph>[]45678</paragraph>' );

			split( [ 1, 4 ] );
			output( '<paragraph>123</paragraph><paragraph>4567</paragraph><paragraph>[]8</paragraph>' );

			split( [ 1, 2 ] );
			output( '<paragraph>123</paragraph><paragraph>45</paragraph><paragraph>[]67</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>4567[]</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>45678[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345678[]</paragraph>' );

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
			output( '<paragraph>12345</paragraph><paragraph>678[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345</paragraph><paragraph>67</paragraph><paragraph>8[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>45[]</paragraph><paragraph>67</paragraph><paragraph>8</paragraph>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<paragraph>12345[]</paragraph><paragraph>67</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345</paragraph><paragraph>678[]</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345678[]</paragraph>' );

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
			output( '<paragraph>123</paragraph><paragraph>45678[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345678[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>45678[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345678[]</paragraph>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<paragraph>123[]</paragraph><paragraph>45678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345678[]</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123[]</paragraph><paragraph>45678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345678[]</paragraph>' );

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
			output( '<paragraph>12345</paragraph><paragraph>678[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345</paragraph><paragraph>67</paragraph><paragraph>8[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>45[]</paragraph><paragraph>67</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>4567[]</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>45678[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345678[]</paragraph>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<paragraph>123[]</paragraph><paragraph>45678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123</paragraph><paragraph>4567[]</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123</paragraph><paragraph>45[]</paragraph><paragraph>67</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345[]</paragraph><paragraph>67</paragraph><paragraph>8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345</paragraph><paragraph>678[]</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345678[]</paragraph>' );

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
			output( '<paragraph>12345</paragraph><paragraph>6[]</paragraph><paragraph>78</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345</paragraph><paragraph>678[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>45[]</paragraph><paragraph>678</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>45678[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345678[]</paragraph>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<paragraph>123[]</paragraph><paragraph>45678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123</paragraph><paragraph>45[]</paragraph><paragraph>678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345[]</paragraph><paragraph>678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345</paragraph><paragraph>6[]</paragraph><paragraph>78</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123456[]</paragraph><paragraph>78</paragraph>' );

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
			output( '<paragraph>1234</paragraph><paragraph>58[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>4[]</paragraph><paragraph>58</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>458[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>4567[]8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345678[]</paragraph>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<paragraph>123[]</paragraph><paragraph>45678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123</paragraph><paragraph>458[]</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123</paragraph><paragraph>4[]</paragraph><paragraph>58</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>1234[]</paragraph><paragraph>58</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123458[]</paragraph>' );

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
			output( '<paragraph>12345</paragraph><paragraph>67xy8[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>45[]</paragraph><paragraph>67xy8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>4567xy8[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>123</paragraph><paragraph>4567[]8</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>12345678[]</paragraph>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<paragraph>123[]</paragraph><paragraph>45678</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123</paragraph><paragraph>4567xy8[]</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>123</paragraph><paragraph>45[]</paragraph><paragraph>67xy8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>12345[]</paragraph><paragraph>67xy8</paragraph>' );

			editor.execute( 'redo' );
			output( '<paragraph>1234567xy8[]</paragraph>' );

			redoDisabled();
		} );
	} );

	describe( 'other reported cases', () => {
		// ckeditor5-engine#t/1051
		it( 'rename leaks to other elements on undo #1', () => {
			input( '<heading1>[]Foo</heading1><paragraph>Bar</paragraph>' );

			doc.batch().rename( root.getChild( 0 ), 'paragraph' );
			output( '<paragraph>[]Foo</paragraph><paragraph>Bar</paragraph>' );

			doc.batch().split( Position.createAt( root.getChild( 0 ), 1 ) );
			output( '<paragraph>[]F</paragraph><paragraph>oo</paragraph><paragraph>Bar</paragraph>' );

			doc.batch().merge( Position.createAt( root, 2 ) );
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

			doc.batch().rename( root.getChild( 0 ), 'heading2' );
			output( '<heading2>[]Foo</heading2><paragraph>Bar</paragraph>' );

			doc.batch().merge( Position.createAt( root, 1 ) );
			output( '<heading2>[]FooBar</heading2>' );

			editor.execute( 'undo' );
			output( '<heading2>[]Foo</heading2><paragraph>Bar</paragraph>' );

			editor.execute( 'undo' );
			output( '<heading1>[]Foo</heading1><paragraph>Bar</paragraph>' );
		} );

		// Reverse issue, this time first operation is merge and then rename.
		it( 'merge, rename, undo, undo is correct', () => {
			input( '<heading1>[]Foo</heading1><paragraph>Bar</paragraph>' );

			doc.batch().merge( Position.createAt( root, 1 ) );
			output( '<heading1>[]FooBar</heading1>' );

			doc.batch().rename( root.getChild( 0 ), 'heading2' );
			output( '<heading2>[]FooBar</heading2>' );

			editor.execute( 'undo' );
			output( '<heading1>[]FooBar</heading1>' );

			editor.execute( 'undo' );
			output( '<heading1>[]Foo</heading1><paragraph>Bar</paragraph>' );
		} );

		// ckeditor5-engine#t/1053
		it( 'wrap, split, undo, undo is correct', () => {
			input( '<paragraph>[]Foo</paragraph><paragraph>Bar</paragraph>' );

			doc.batch().wrap( Range.createIn( root ), 'div' );
			output( '<div><paragraph>[]Foo</paragraph><paragraph>Bar</paragraph></div>' );

			doc.batch().split( new Position( root, [ 0, 0, 1 ] ) );
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
	} );

	describe( 'pasting', () => {
		function pasteHtml( editor, html ) {
			editor.editing.view.fire( 'paste', {
				dataTransfer: createDataTransfer( { 'text/html': html } ),
				preventDefault() {}
			} );
		}

		function createDataTransfer( data ) {
			return {
				getData( type ) {
					return data[ type ];
				}
			};
		}

		// ckeditor5-engine#t/1065
		it( 'undo paste into non empty element should not throw and be correct', () => {
			doc.enqueueChanges( () => {
				input( '<paragraph>Foo[]</paragraph>' );
			} );

			doc.enqueueChanges( () => {
				pasteHtml( editor, '<p>a</p><p>b</p>' );
			} );

			output( '<paragraph>Fooa</paragraph><paragraph>b[]</paragraph>' );

			doc.enqueueChanges( () => {
				pasteHtml( editor, '<p>c</p><p>d</p>' );
			} );

			output( '<paragraph>Fooa</paragraph><paragraph>bc</paragraph><paragraph>d[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>Fooa</paragraph><paragraph>b[]</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>Foo[]</paragraph>' );
		} );
	} );

	describe( 'other edge cases', () => {
		it( 'deleteContent between two nodes', () => {
			input( '<paragraph>fo[o</paragraph><paragraph>b]ar</paragraph>' );

			doc.enqueueChanges( () => {
				editor.data.deleteContent( doc.selection, doc.batch() );
			} );
			output( '<paragraph>fo[]ar</paragraph>' );

			editor.execute( 'undo' );
			output( '<paragraph>fo[o</paragraph><paragraph>b]ar</paragraph>' );
		} );

		// Related to ckeditor5-engine#891 and ckeditor5-list#51.
		it( 'change attribute of removed node then undo and redo', () => {
			input( '<paragraph></paragraph>' );

			const gy = doc.graveyard;
			const p = doc.getRoot().getChild( 0 );

			doc.enqueueChanges( () => {
				doc.batch().remove( p );
				doc.batch().setAttribute( p, 'bold', true );
			} );

			editor.execute( 'undo' );
			editor.execute( 'redo' );

			expect( p.root ).to.equal( gy );
			expect( p.getAttribute( 'bold' ) ).to.be.true;
		} );
	} );
} );
