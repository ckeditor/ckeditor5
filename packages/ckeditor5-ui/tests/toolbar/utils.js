/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import View from '../../src/view';
import ComponentFactory from '../../src/componentfactory';
import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import ToolbarSeparatorView from '../../src/toolbar/toolbarseparatorview';
import { getItemsFromConfig } from '../../src/toolbar/utils';

describe( 'utils', () => {
	describe( 'getItemsFromConfig()', () => {
		let factory;

		beforeEach( () => {
			factory = new ComponentFactory( new Editor() );

			factory.add( 'foo', viewCreator( 'foo' ) );
			factory.add( 'bar', viewCreator( 'bar' ) );
		} );

		it( 'returns a promise', () => {
			expect( getItemsFromConfig() ).to.be.instanceOf( Promise );
		} );

		it( 'expands the config into collection', () => {
			const collection = new Collection();

			return getItemsFromConfig( [ 'foo', 'bar', '|', 'foo' ], collection, factory )
				.then( () => {
					expect( collection ).to.have.length( 4 );
					expect( collection.get( 0 ).name ).to.equal( 'foo' );
					expect( collection.get( 1 ).name ).to.equal( 'bar' );
					expect( collection.get( 2 ) ).to.be.instanceOf( ToolbarSeparatorView );
					expect( collection.get( 3 ).name ).to.equal( 'foo' );
				} );
		} );
	} );
} );

function viewCreator( name ) {
	return ( locale ) => {
		const view = new View( locale );

		view.name = name;
		view.element = document.createElement( 'a' );

		return view;
	};
}
