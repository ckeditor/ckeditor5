/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import StandardEditor from 'ckeditor5-core/src/editor/standardeditor';
import VirtualTestEditor from 'ckeditor5-core/tests/_utils/virtualtesteditor';

import Plugin from 'ckeditor5-core/src/plugin';
import HtmlDataProcessor from 'ckeditor5-engine/src/dataprocessor/htmldataprocessor';

import testUtils from 'ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'VirtualTestEditor', () => {
	describe( 'constructor()', () => {
		it( 'creates an instance of editor', () => {
			const editor = new VirtualTestEditor( { foo: 1 } );

			expect( editor ).to.be.instanceof( StandardEditor );

			expect( editor.config.get( 'foo' ) ).to.equal( 1 );
		} );

		it( 'creates model and view roots', () => {
			const editor = new VirtualTestEditor( { foo: 1 } );

			expect( editor.document.getRoot() ).to.have.property( 'name', '$root' );
			expect( editor.editing.view.getRoot() ).to.have.property( 'name', 'div' );
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );
	} );

	describe( 'create', () => {
		it( 'creates an instance of editor', () => {
			return VirtualTestEditor.create( { foo: 1 } )
				.then( editor => {
					expect( editor ).to.be.instanceof( VirtualTestEditor );

					expect( editor.config.get( 'foo' ) ).to.equal( 1 );
				} );
		} );

		it( 'fires all events in the right order', () => {
			const fired = [];

			function spy( evt ) {
				fired.push( evt.name );
			}

			class EventWatcher extends Plugin {
				init() {
					this.editor.on( 'pluginsReady', spy );
					this.editor.on( 'dataReady', spy );
					this.editor.on( 'ready', spy );
				}
			}

			return VirtualTestEditor.create( {
					plugins: [ EventWatcher ]
				} )
				.then( () => {
					expect( fired ).to.deep.equal( [ 'pluginsReady', 'dataReady', 'ready' ] );
				} );
		} );
	} );
} );
