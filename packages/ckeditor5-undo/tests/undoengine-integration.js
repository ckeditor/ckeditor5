/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import UndoEngine from '../src/undoengine';

import DeleteCommand from '@ckeditor/ckeditor5-typing/src/deletecommand';
import InputCommand from '@ckeditor/ckeditor5-typing/src/inputcommand';
import EnterCommand from '@ckeditor/ckeditor5-enter/src/entercommand';
import AttributeCommand from '@ckeditor/ckeditor5-basic-styles/src/attributecommand';

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'UndoEngine integration', () => {
	let editor, doc, root;

	beforeEach( () => {
		return ModelTestEditor.create( { plugins: [ UndoEngine ] } )
			.then( newEditor => {
				editor = newEditor;

				editor.commands.add( 'delete', new DeleteCommand( editor, 'backward' ) );
				editor.commands.add( 'forwardDelete', new DeleteCommand( editor, 'forward' ) );
				editor.commands.add( 'enter', new EnterCommand( editor ) );
				editor.commands.add( 'input', new InputCommand( editor, 5 ) );
				editor.commands.add( 'bold', new AttributeCommand( editor, 'bold' ) );

				doc = editor.document;

				doc.schema.registerItem( 'p', '$block' );
				doc.schema.registerItem( 'h1', '$block' );
				doc.schema.registerItem( 'h2', '$block' );
				doc.schema.allow( { name: '$inline', attributes: 'bold', inside: '$block' } );

				doc.schema.registerItem( 'div', '$block' );
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
			input( '<p>fo[]o</p><p>bar</p>' );

			doc.batch().insert( doc.selection.getFirstPosition(), 'zzz' );
			output( '<p>fozzz[]o</p><p>bar</p>' );

			editor.execute( 'undo' );
			output( '<p>fo[]o</p><p>bar</p>' );

			undoDisabled();
		} );

		it( 'multiple adding and undo', () => {
			input( '<p>fo[]o</p><p>bar</p>' );

			doc.batch()
				.insert( doc.selection.getFirstPosition(), 'zzz' )
				.insert( new Position( root, [ 1, 0 ] ), 'xxx' );
			output( '<p>fozzz[]o</p><p>xxxbar</p>' );

			setSelection( [ 1, 0 ], [ 1, 0 ] );
			doc.batch().insert( doc.selection.getFirstPosition(), 'yyy' );
			output( '<p>fozzzo</p><p>yyy[]xxxbar</p>' );

			editor.execute( 'undo' );
			output( '<p>fozzzo</p><p>[]xxxbar</p>' );

			editor.execute( 'undo' );
			output( '<p>fo[]o</p><p>bar</p>' );

			undoDisabled();
		} );

		it( 'multiple adding mixed with undo', () => {
			input( '<p>fo[]o</p><p>bar</p>' );

			doc.batch().insert( doc.selection.getFirstPosition(), 'zzz' );
			output( '<p>fozzz[]o</p><p>bar</p>' );

			setSelection( [ 1, 0 ], [ 1, 0 ] );
			doc.batch().insert( doc.selection.getFirstPosition(), 'yyy' );
			output( '<p>fozzzo</p><p>yyy[]bar</p>' );

			editor.execute( 'undo' );
			output( '<p>fozzzo</p><p>[]bar</p>' );

			setSelection( [ 0, 0 ], [ 0, 0 ] );
			doc.batch().insert( doc.selection.getFirstPosition(), 'xxx' );
			output( '<p>xxx[]fozzzo</p><p>bar</p>' );

			editor.execute( 'undo' );
			output( '<p>[]fozzzo</p><p>bar</p>' );

			editor.execute( 'undo' );
			output( '<p>fo[]o</p><p>bar</p>' );

			undoDisabled();
		} );

		it( 'multiple remove and undo', () => {
			input( '<p>[]foo</p><p>bar</p>' );

			doc.batch().remove( Range.createFromPositionAndShift( doc.selection.getFirstPosition(), 2 ) );
			output( '<p>[]o</p><p>bar</p>' );

			setSelection( [ 1, 1 ], [ 1, 1 ] );
			doc.batch().remove( Range.createFromPositionAndShift( doc.selection.getFirstPosition(), 2 ) );
			output( '<p>o</p><p>b[]</p>' );

			editor.execute( 'undo' );
			// Here is an edge case that selection could be before or after `ar`.
			output( '<p>o</p><p>bar[]</p>' );

			editor.execute( 'undo' );
			// As above.
			output( '<p>fo[]o</p><p>bar</p>' );

			undoDisabled();
		} );

		it( 'add and remove different parts and undo', () => {
			input( '<p>fo[]o</p><p>bar</p>' );

			doc.batch().insert( doc.selection.getFirstPosition(), 'zzz' );
			output( '<p>fozzz[]o</p><p>bar</p>' );

			setSelection( [ 1, 2 ], [ 1, 2 ] );
			doc.batch().remove( Range.createFromPositionAndShift( new Position( root, [ 1, 1 ] ), 1 ) );
			output( '<p>fozzzo</p><p>b[]r</p>' );

			editor.execute( 'undo' );
			output( '<p>fozzzo</p><p>ba[]r</p>' );

			editor.execute( 'undo' );
			output( '<p>fo[]o</p><p>bar</p>' );

			undoDisabled();
		} );

		it( 'add and remove same part and undo', () => {
			input( '<p>fo[]o</p><p>bar</p>' );

			doc.batch().insert( doc.selection.getFirstPosition(), 'zzz' );
			output( '<p>fozzz[]o</p><p>bar</p>' );

			doc.batch().remove( Range.createFromPositionAndShift( new Position( root, [ 0, 2 ] ), 3 ) );
			output( '<p>fo[]o</p><p>bar</p>' );

			editor.execute( 'undo' );
			output( '<p>fozzz[]o</p><p>bar</p>' );

			editor.execute( 'undo' );
			output( '<p>fo[]o</p><p>bar</p>' );

			undoDisabled();
		} );
	} );

	describe( 'moving', () => {
		it( 'move same content twice then undo', () => {
			input( '<p>f[o]z</p><p>bar</p>' );

			doc.batch().move( doc.selection.getFirstRange(), new Position( root, [ 1, 0 ] ) );
			output( '<p>fz</p><p>[o]bar</p>' );

			doc.batch().move( doc.selection.getFirstRange(), new Position( root, [ 0, 2 ] ) );
			output( '<p>fz[o]</p><p>bar</p>' );

			editor.execute( 'undo' );
			output( '<p>fz</p><p>[o]bar</p>' );

			editor.execute( 'undo' );
			output( '<p>f[o]z</p><p>bar</p>' );

			undoDisabled();
		} );

		it( 'move content and new parent then undo', () => {
			input( '<p>f[o]z</p><p>bar</p>' );

			doc.batch().move( doc.selection.getFirstRange(), new Position( root, [ 1, 0 ] ) );
			output( '<p>fz</p><p>[o]bar</p>' );

			setSelection( [ 1 ], [ 2 ] );
			doc.batch().move( doc.selection.getFirstRange(), new Position( root, [ 0 ] ) );
			output( '[<p>obar</p>]<p>fz</p>' );

			editor.execute( 'undo' );
			output( '<p>fz</p>[<p>obar</p>]' );

			editor.execute( 'undo' );
			output( '<p>f[o]z</p><p>bar</p>' );

			undoDisabled();
		} );
	} );

	describe( 'attributes with other', () => {
		it( 'attributes then insert inside then undo', () => {
			input( '<p>fo[ob]ar</p>' );

			doc.batch().setAttribute( doc.selection.getFirstRange(), 'bold', true );
			output( '<p>fo[<$text bold="true">ob</$text>]ar</p>' );

			setSelection( [ 0, 3 ], [ 0, 3 ] );
			doc.batch().insert( doc.selection.getFirstPosition(), 'zzz' );
			output( '<p>fo<$text bold="true">o</$text>zzz<$text bold="true">[]b</$text>ar</p>' );
			expect( doc.selection.getAttribute( 'bold' ) ).to.true;

			editor.execute( 'undo' );
			output( '<p>fo<$text bold="true">o[]b</$text>ar</p>' );
			expect( doc.selection.getAttribute( 'bold' ) ).to.true;

			editor.execute( 'undo' );
			output( '<p>fo[ob]ar</p>' );

			undoDisabled();
		} );
	} );

	describe( 'wrapping, unwrapping, merging, splitting', () => {
		it( 'wrap and undo', () => {
			doc.schema.allow( { name: '$text', inside: '$root' } );
			input( 'fo[zb]ar' );

			doc.batch().wrap( doc.selection.getFirstRange(), 'p' );
			output( 'fo<p>[zb]</p>ar' );

			editor.execute( 'undo' );
			output( 'fo[zb]ar' );

			undoDisabled();
		} );

		it( 'wrap, move and undo', () => {
			doc.schema.allow( { name: '$text', inside: '$root' } );
			input( 'fo[zb]ar' );

			doc.batch().wrap( doc.selection.getFirstRange(), 'p' );
			// Would be better if selection was inside P.
			output( 'fo<p>[zb]</p>ar' );

			setSelection( [ 2, 0 ], [ 2, 1 ] );
			doc.batch().move( doc.selection.getFirstRange(), new Position( root, [ 0 ] ) );
			output( '[z]fo<p>b</p>ar' );

			editor.execute( 'undo' );
			output( 'fo<p>[z]b</p>ar' );

			editor.execute( 'undo' );
			output( 'fo[zb]ar' );

			undoDisabled();
		} );

		it( 'unwrap and undo', () => {
			input( '<p>foo[]bar</p>' );

			doc.batch().unwrap( doc.selection.getFirstPosition().parent );
			output( 'foo[]bar' );

			editor.execute( 'undo' );
			output( '<p>foo[]bar</p>' );

			undoDisabled();
		} );

		it( 'merge and undo', () => {
			input( '<p>foo</p><p>[]bar</p>' );

			doc.batch().merge( new Position( root, [ 1 ] ) );
			// Because selection is stuck with <p> it ends up in graveyard. We have to manually move it to correct node.
			setSelection( [ 0, 3 ], [ 0, 3 ] );
			output( '<p>foo[]bar</p>' );

			editor.execute( 'undo' );
			output( '<p>foo</p><p>bar[]</p>' );

			undoDisabled();
		} );

		it( 'split and undo', () => {
			input( '<p>foo[]bar</p>' );

			doc.batch().split( doc.selection.getFirstPosition() );
			// Because selection is stuck with <p> it ends up in wrong node. We have to manually move it to correct node.
			setSelection( [ 1, 0 ], [ 1, 0 ] );
			output( '<p>foo</p><p>[]bar</p>' );

			editor.execute( 'undo' );
			output( '<p>foobar[]</p>' );

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
			input( '<p>12345678</p>' );

			split( [ 0, 3 ] );
			output( '<p>123</p><p>[]45678</p>' );

			split( [ 1, 4 ] );
			output( '<p>123</p><p>4567</p><p>[]8</p>' );

			split( [ 1, 2 ] );
			output( '<p>123</p><p>45</p><p>[]67</p><p>8</p>' );

			editor.execute( 'undo' );
			output( '<p>123</p><p>4567[]</p><p>8</p>' );

			editor.execute( 'undo' );
			output( '<p>123</p><p>45678[]</p>' );

			editor.execute( 'undo' );
			output( '<p>12345678[]</p>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<p>123[]</p><p>45678</p>' );

			editor.execute( 'redo' );
			output( '<p>123</p><p>4567[]</p><p>8</p>' );

			editor.execute( 'redo' );
			output( '<p>123</p><p>45[]</p><p>67</p><p>8</p>' );

			redoDisabled();
		} );

		it( 'merge, merge, merge', () => {
			input( '<p>123</p><p>45</p><p>67</p><p>8</p>' );

			merge( [ 1 ] );
			output( '<p>123[]45</p><p>67</p><p>8</p>' );

			merge( [ 2 ] );
			output( '<p>12345</p><p>67[]8</p>' );

			merge( [ 1 ] );
			output( '<p>12345[]678</p>' );

			editor.execute( 'undo' );
			output( '<p>12345</p><p>678[]</p>' );

			editor.execute( 'undo' );
			output( '<p>12345</p><p>67</p><p>8[]</p>' );

			editor.execute( 'undo' );
			output( '<p>123</p><p>45[]</p><p>67</p><p>8</p>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<p>12345[]</p><p>67</p><p>8</p>' );

			editor.execute( 'redo' );
			output( '<p>12345</p><p>678[]</p>' );

			editor.execute( 'redo' );
			output( '<p>12345678[]</p>' );

			redoDisabled();
		} );

		it( 'split, merge, split, merge (same position)', () => {
			input( '<p>12345678</p>' );

			split( [ 0, 3 ] );
			output( '<p>123</p><p>[]45678</p>' );

			merge( [ 1 ] );
			output( '<p>123[]45678</p>' );

			split( [ 0, 3 ] );
			output( '<p>123</p><p>[]45678</p>' );

			merge( [ 1 ] );
			output( '<p>123[]45678</p>' );

			editor.execute( 'undo' );
			output( '<p>123</p><p>45678[]</p>' );

			editor.execute( 'undo' );
			output( '<p>12345678[]</p>' );

			editor.execute( 'undo' );
			output( '<p>123</p><p>45678[]</p>' );

			editor.execute( 'undo' );
			output( '<p>12345678[]</p>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<p>123[]</p><p>45678</p>' );

			editor.execute( 'redo' );
			output( '<p>12345678[]</p>' );

			editor.execute( 'redo' );
			output( '<p>123[]</p><p>45678</p>' );

			editor.execute( 'redo' );
			output( '<p>12345678[]</p>' );

			redoDisabled();
		} );

		it( 'split, split, split, merge, merge, merge', () => {
			input( '<p>12345678</p>' );

			split( [ 0, 3 ] );
			output( '<p>123</p><p>[]45678</p>' );

			split( [ 1, 4 ] );
			output( '<p>123</p><p>4567</p><p>[]8</p>' );

			split( [ 1, 2 ] );
			output( '<p>123</p><p>45</p><p>[]67</p><p>8</p>' );

			merge( [ 1 ] );
			output( '<p>123[]45</p><p>67</p><p>8</p>' );

			merge( [ 2 ] );
			output( '<p>12345</p><p>67[]8</p>' );

			merge( [ 1 ] );
			output( '<p>12345[]678</p>' );

			editor.execute( 'undo' );
			output( '<p>12345</p><p>678[]</p>' );

			editor.execute( 'undo' );
			output( '<p>12345</p><p>67</p><p>8[]</p>' );

			editor.execute( 'undo' );
			output( '<p>123</p><p>45[]</p><p>67</p><p>8</p>' );

			editor.execute( 'undo' );
			output( '<p>123</p><p>4567[]</p><p>8</p>' );

			editor.execute( 'undo' );
			output( '<p>123</p><p>45678[]</p>' );

			editor.execute( 'undo' );
			output( '<p>12345678[]</p>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<p>123[]</p><p>45678</p>' );

			editor.execute( 'redo' );
			output( '<p>123</p><p>4567[]</p><p>8</p>' );

			editor.execute( 'redo' );
			output( '<p>123</p><p>45[]</p><p>67</p><p>8</p>' );

			editor.execute( 'redo' );
			output( '<p>12345[]</p><p>67</p><p>8</p>' );

			editor.execute( 'redo' );
			output( '<p>12345</p><p>678[]</p>' );

			editor.execute( 'redo' );
			output( '<p>12345678[]</p>' );

			redoDisabled();
		} );

		it( 'split, split, merge, split, merge (different order)', () => {
			input( '<p>12345678</p>' );

			split( [ 0, 3 ] );
			output( '<p>123</p><p>[]45678</p>' );

			split( [ 1, 2 ] );
			output( '<p>123</p><p>45</p><p>[]678</p>' );

			merge( [ 1 ] );
			output( '<p>123[]45</p><p>678</p>' );

			split( [ 1, 1 ] );
			output( '<p>12345</p><p>6</p><p>[]78</p>' );

			merge( [ 1 ] );
			output( '<p>12345[]6</p><p>78</p>' );

			editor.execute( 'undo' );
			output( '<p>12345</p><p>6[]</p><p>78</p>' );

			editor.execute( 'undo' );
			output( '<p>12345</p><p>678[]</p>' );

			editor.execute( 'undo' );
			output( '<p>123</p><p>45[]</p><p>678</p>' );

			editor.execute( 'undo' );
			output( '<p>123</p><p>45678[]</p>' );

			editor.execute( 'undo' );
			output( '<p>12345678[]</p>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<p>123[]</p><p>45678</p>' );

			editor.execute( 'redo' );
			output( '<p>123</p><p>45[]</p><p>678</p>' );

			editor.execute( 'redo' );
			output( '<p>12345[]</p><p>678</p>' );

			editor.execute( 'redo' );
			output( '<p>12345</p><p>6[]</p><p>78</p>' );

			editor.execute( 'redo' );
			output( '<p>123456[]</p><p>78</p>' );

			redoDisabled();
		} );

		it( 'split, remove, split, merge, merge', () => {
			input( '<p>12345678</p>' );

			split( [ 0, 3 ] );
			output( '<p>123</p><p>[]45678</p>' );

			remove( [ 1, 4 ] );
			remove( [ 1, 3 ] );
			output( '<p>123</p><p>45[]8</p>' );

			split( [ 1, 1 ] );
			output( '<p>123</p><p>4</p><p>[]58</p>' );

			merge( [ 1 ] );
			output( '<p>123[]4</p><p>58</p>' );

			merge( [ 1 ] );
			output( '<p>1234[]58</p>' );

			editor.execute( 'undo' );
			output( '<p>1234</p><p>58[]</p>' );

			editor.execute( 'undo' );
			output( '<p>123</p><p>4[]</p><p>58</p>' );

			editor.execute( 'undo' );
			output( '<p>123</p><p>458[]</p>' );

			editor.execute( 'undo' );
			output( '<p>123</p><p>4567[]8</p>' );

			editor.execute( 'undo' );
			output( '<p>12345678[]</p>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<p>123[]</p><p>45678</p>' );

			editor.execute( 'redo' );
			output( '<p>123</p><p>458[]</p>' );

			editor.execute( 'redo' );
			output( '<p>123</p><p>4[]</p><p>58</p>' );

			editor.execute( 'redo' );
			output( '<p>1234[]</p><p>58</p>' );

			editor.execute( 'redo' );
			output( '<p>123458[]</p>' );

			redoDisabled();
		} );

		it( 'split, typing, split, merge, merge', () => {
			input( '<p>12345678</p>' );

			split( [ 0, 3 ] );
			output( '<p>123</p><p>[]45678</p>' );

			type( [ 1, 4 ], 'x' );
			type( [ 1, 5 ], 'y' );
			output( '<p>123</p><p>4567xy[]8</p>' );

			split( [ 1, 2 ] );
			output( '<p>123</p><p>45</p><p>[]67xy8</p>' );

			merge( [ 1 ] );
			output( '<p>123[]45</p><p>67xy8</p>' );

			merge( [ 1 ] );
			output( '<p>12345[]67xy8</p>' );

			editor.execute( 'undo' );
			output( '<p>12345</p><p>67xy8[]</p>' );

			editor.execute( 'undo' );
			output( '<p>123</p><p>45[]</p><p>67xy8</p>' );

			editor.execute( 'undo' );
			output( '<p>123</p><p>4567xy8[]</p>' );

			editor.execute( 'undo' );
			output( '<p>123</p><p>4567[]8</p>' );

			editor.execute( 'undo' );
			output( '<p>12345678[]</p>' );

			undoDisabled();

			editor.execute( 'redo' );
			output( '<p>123[]</p><p>45678</p>' );

			editor.execute( 'redo' );
			output( '<p>123</p><p>4567xy8[]</p>' );

			editor.execute( 'redo' );
			output( '<p>123</p><p>45[]</p><p>67xy8</p>' );

			editor.execute( 'redo' );
			output( '<p>12345[]</p><p>67xy8</p>' );

			editor.execute( 'redo' );
			output( '<p>1234567xy8[]</p>' );

			redoDisabled();
		} );
	} );

	describe( 'other reported cases', () => {
		// ckeditor5-engine#t/1051
		it( 'rename leaks to other elements on undo #1', () => {
			input( '<h1>[]Foo</h1><p>Bar</p>' );

			doc.batch().rename( root.getChild( 0 ), 'p' );
			output( '<p>[]Foo</p><p>Bar</p>' );

			doc.batch().split( Position.createAt( root.getChild( 0 ), 1 ) );
			output( '<p>[]F</p><p>oo</p><p>Bar</p>' );

			doc.batch().merge( Position.createAt( root, 2 ) );
			output( '<p>[]F</p><p>ooBar</p>' );

			editor.execute( 'undo' );
			output( '<p>[]F</p><p>oo</p><p>Bar</p>' );

			editor.execute( 'undo' );
			output( '<p>[]Foo</p><p>Bar</p>' );

			editor.execute( 'undo' );
			output( '<h1>[]Foo</h1><p>Bar</p>' );
		} );

		// Similar issue that bases on the same error as above, however here we first merge (above we first split).
		it( 'rename leaks to other elements on undo #2', () => {
			input( '<h1>[]Foo</h1><p>Bar</p>' );

			doc.batch().rename( root.getChild( 0 ), 'h2' );
			output( '<h2>[]Foo</h2><p>Bar</p>' );

			doc.batch().merge( Position.createAt( root, 1 ) );
			output( '<h2>[]FooBar</h2>' );

			editor.execute( 'undo' );
			output( '<h2>[]Foo</h2><p>Bar</p>' );

			editor.execute( 'undo' );
			output( '<h1>[]Foo</h1><p>Bar</p>' );
		} );

		// Reverse issue, this time first operation is merge and then rename.
		it( 'merge, rename, undo, undo is correct', () => {
			input( '<h1>[]Foo</h1><p>Bar</p>' );

			doc.batch().merge( Position.createAt( root, 1 ) );
			output( '<h1>[]FooBar</h1>' );

			doc.batch().rename( root.getChild( 0 ), 'h2' );
			output( '<h2>[]FooBar</h2>' );

			editor.execute( 'undo' );
			output( '<h1>[]FooBar</h1>' );

			editor.execute( 'undo' );
			output( '<h1>[]Foo</h1><p>Bar</p>' );
		} );

		// ckeditor5-engine#t/1053
		it( 'wrap, split, undo, undo is correct', () => {
			input( '<p>[]Foo</p><p>Bar</p>' );

			doc.batch().wrap( Range.createIn( root ), 'div' );
			output( '<div><p>[]Foo</p><p>Bar</p></div>' );

			doc.batch().split( new Position( root, [ 0, 0, 1 ] ) );
			output( '<div><p>[]F</p><p>oo</p><p>Bar</p></div>' );

			editor.execute( 'undo' );
			output( '<div><p>[]Foo</p><p>Bar</p></div>' );

			editor.execute( 'undo' );
			output( '<p>[]Foo</p><p>Bar</p>' );
		} );

		// ckeditor5-engine#t/1055
		it( 'selection attribute setting: split, bold, merge, undo, undo, undo', () => {
			input( '<p>Foo[]</p><p>Bar</p>' );

			editor.execute( 'enter' );
			output( '<p>Foo</p><p>[]</p><p>Bar</p>' );

			editor.execute( 'bold' );
			output( '<p>Foo</p><p selection:bold="true"><$text bold="true">[]</$text></p><p>Bar</p>' );

			editor.execute( 'forwardDelete' );
			output( '<p>Foo</p><p>[]Bar</p>' );

			editor.execute( 'undo' );
			output( '<p>Foo</p><p selection:bold="true"><$text bold="true">[]</$text></p><p>Bar</p>' );

			editor.execute( 'undo' );
			output( '<p>Foo</p><p>[]</p><p>Bar</p>' );

			editor.execute( 'undo' );
			output( '<p>Foo[]</p><p>Bar</p>' );
		} );
	} );

	describe( 'other edge cases', () => {
		it( 'deleteContent between two nodes', () => {
			input( '<p>fo[o</p><p>b]ar</p>' );

			editor.data.deleteContent( doc.selection, doc.batch() );
			output( '<p>fo[]ar</p>' );

			editor.execute( 'undo' );
			output( '<p>fo[o</p><p>b]ar</p>' );
		} );

		// Related to ckeditor5-engine#891 and ckeditor5-list#51.
		it( 'change attribute of removed node then undo and redo', () => {
			const gy = doc.graveyard;
			const batch = doc.batch();
			const p = new Element( 'p' );

			root.appendChildren( p );

			batch.remove( p );
			batch.setAttribute( p, 'bold', true );

			editor.execute( 'undo' );
			editor.execute( 'redo' );

			expect( p.root ).to.equal( gy );
			expect( p.getAttribute( 'bold' ) ).to.be.true;
		} );

		// Related to ckeditor5-engine#891.
		it( 'change attribute of removed node then undo and redo', () => {
			const gy = doc.graveyard;
			const batch = doc.batch();
			const p1 = new Element( 'p' );
			const p2 = new Element( 'p' );
			const p3 = new Element( 'p' );

			root.appendChildren( [ p1, p2 ] );

			batch.remove( p1 ).remove( p2 ).insert( new Position( root, [ 0 ] ), p3 );

			editor.execute( 'undo' );
			editor.execute( 'redo' );

			expect( p1.root ).to.equal( gy );
			expect( p2.root ).to.equal( gy );
			expect( p3.root ).to.equal( root );
		} );
	} );
} );
