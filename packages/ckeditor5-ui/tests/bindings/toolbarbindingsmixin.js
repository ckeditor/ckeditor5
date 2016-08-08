/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, bindings, toolbar */

import mix from '/ckeditor5/utils/mix.js';
import Editor from '/ckeditor5/core/editor/editor.js';
import Collection from '/ckeditor5/utils/collection.js';
import Model from '/ckeditor5/ui/model.js';
import Controller from '/ckeditor5/ui/controller.js';
import ToolbarBindingsMixin from '/ckeditor5/ui/bindings/toolbarbindingsmixin.js';

describe( 'ToolbarBindingsMixin', () => {
	const editor = new Editor();
	let mixinInstance;

	editor.ui = {
		featureComponents: {
			create: () => new Controller()
		}
	};

	class MixClass extends Controller {
		constructor( model, view ) {
			super( model, view );

			this.editor = editor;
			this.addCollection( 'items' );
		}
	}

	mix( MixClass, ToolbarBindingsMixin );

	beforeEach( () => {
		mixinInstance = new MixClass( new Model( {
			config: [ 'bold', 'italic' ]
		} ) );
	} );

	describe( 'bindToolbarItems', () => {
		it( 'creates item collection', () => {
			mixinInstance.bindToolbarItems();

			expect( mixinInstance.items ).to.be.instanceOf( Collection );
			expect( mixinInstance.items.map( i => i.name ) ).to.have.members( [ 'bold', 'italic' ] );
		} );

		it( 'works when no config specified in the model', () => {
			mixinInstance = new MixClass( new Model( {} ) );
			mixinInstance.bindToolbarItems();

			expect( mixinInstance.items ).to.be.instanceOf( Collection );
			expect( mixinInstance.items ).to.have.length( 0 );
		} );

		it( 'binds item collection to "items" controller collection', () => {
			const items = mixinInstance.collections.get( 'items' );

			expect( items ).to.have.length( 0 );

			mixinInstance.bindToolbarItems();

			expect( items ).to.have.length( 2 );
		} );
	} );
} );
