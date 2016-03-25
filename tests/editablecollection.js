/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/editor.js';
import Editable from '/ckeditor5/editable.js';
import EditableCollection from '/ckeditor5/editablecollection.js';

describe( 'EditableCollection', () => {
	let collection, editor;

	beforeEach( () => {
		collection = new EditableCollection();
		editor = new Editor();
	} );

	describe( 'constructor', () => {
		it( 'configures collection to use idProperty=name', () => {
			collection.add( new Editable( editor, 'foo' ) );

			expect( collection.get( 'foo' ).name ).to.equal( 'foo' );
		} );

		it( 'sets observable property current', () => {
			expect( collection ).to.have.property( 'current', null );

			const spy = sinon.spy();
			collection.on( 'change:current', spy );

			collection.current = 1;

			expect( spy.calledOnce ).to.be.true;
		} );
	} );

	describe( 'add', () => {
		it( 'binds collection.current to editable.isFocused changes', () => {
			const editable = new Editable( editor, 'foo' );

			collection.add( editable );

			editable.isFocused = true;
			expect( collection ).to.have.property( 'current', editable );

			editable.isFocused = false;
			expect( collection ).to.have.property( 'current', null );
		} );
	} );

	describe( 'remove', () => {
		it( 'stops watching editable.isFocused', () => {
			const editable = new Editable( editor, 'foo' );

			collection.add( editable );

			editable.isFocused = true;

			collection.remove( editable );

			editable.isFocused = false;

			expect( collection ).to.have.property( 'current', editable );
		} );
	} );

	describe( 'destroy', () => {
		let editables;

		beforeEach( () => {
			editables = [ new Editable( editor, 'foo' ), new Editable( editor, 'bar' ) ];

			collection.add( editables[ 0 ] );
			collection.add( editables[ 1 ] );
		} );

		it( 'stops watching all editables', () => {
			collection.destroy();

			editables[ 0 ].isFocused = true;
			editables[ 1 ].isFocused = true;

			expect( collection ).to.have.property( 'current', null );
		} );

		it( 'destroys all children', () => {
			editables.forEach( editable => {
				editable.destroy = sinon.spy();
			} );

			collection.destroy();

			expect( editables.map( editable => editable.destroy.calledOnce ) ).to.deep.equal( [ true, true ] );
		} );

		it( 'removes all children', () => {
			collection.destroy();

			expect( collection ).to.have.lengthOf( 0 );
		} );
	} );
} );
