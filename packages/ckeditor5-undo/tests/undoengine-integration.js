/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from 'tests/core/_utils/modeltesteditor.js';
import Range from 'ckeditor5/engine/model/range.js';
import Position from 'ckeditor5/engine/model/position.js';
import UndoEngine from 'ckeditor5/undo/undoengine.js';

import { setData, getData } from 'ckeditor5/engine/dev-utils/model.js';

let editor, doc, root;

beforeEach( () => {
	return ModelTestEditor.create( {
			plugins: [ UndoEngine ]
		} )
		.then( newEditor => {
			editor = newEditor;
			doc = editor.document;
			doc.schema.registerItem( 'p', '$block' );
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

describe( 'UndoEngine integration', () => {
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
			output( '<p>o</p><p>b[]ar</p>' );

			editor.execute( 'undo' );
			// As above.
			output( '<p>[]foo</p><p>bar</p>' );

			undoDisabled();
		} );

		it( 'add and remove different parts and undo', () => {
			input( '<p>fo[]o</p><p>bar</p>' );

			doc.batch().insert( doc.selection.getFirstPosition(), 'zzz' );
			output( '<p>fozzz[]o</p><p>bar</p>' );

			setSelection( [ 1, 2 ], [ 1, 2 ] );
			doc.batch().remove( Range.createFromPositionAndShift( new Position( root, [ 1, 1 ] ) , 1 ) );
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

			doc.batch().remove( Range.createFromPositionAndShift( new Position( root, [ 0, 2 ] ) , 3 ) );
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
			output( '<p>foo</p><p>[]bar</p>' );

			undoDisabled();
		} );

		it( 'split and undo', () => {
			input( '<p>foo[]bar</p>' );

			doc.batch().split( doc.selection.getFirstPosition() );
			// Because selection is stuck with <p> it ends up in wrong node. We have to manually move it to correct node.
			setSelection( [ 1, 0 ], [ 1, 0 ] );
			output( '<p>foo</p><p>[]bar</p>' );

			editor.execute( 'undo' );
			output( '<p>foo[]bar</p>' );

			undoDisabled();
		} );
	} );

	describe( 'other edge cases', () => {
		it( 'deleteContent between two nodes', () => {
			input( '<p>fo[o</p><p>b]ar</p>' );

			editor.data.deleteContent( doc.selection, doc.batch(), { merge: true } );
			output( '<p>fo[]ar</p>' );

			editor.execute( 'undo' );
			output( '<p>fo[o</p><p>b]ar</p>' );
		} );
	} );
} );
