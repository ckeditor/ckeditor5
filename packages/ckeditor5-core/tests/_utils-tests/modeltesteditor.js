/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Editor from '../../src/editor/editor';
import ModelTestEditor from '../../tests/_utils/modeltesteditor';

import Plugin from '../../src/plugin';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import testUtils from '../../tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'ModelTestEditor', () => {
	describe( 'constructor()', () => {
		it( 'creates an instance of editor', () => {
			const editor = new ModelTestEditor( { foo: 1 } );

			expect( editor ).to.be.instanceof( Editor );

			expect( editor.config.get( 'foo' ) ).to.equal( 1 );
		} );

		it( 'creates model and view roots', () => {
			const editor = new ModelTestEditor( { foo: 1 } );

			expect( editor.document.getRoot() ).to.have.property( 'name', '$root' );
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );
	} );

	describe( 'create', () => {
		it( 'creates an instance of editor', () => {
			return ModelTestEditor.create( { foo: 1 } )
				.then( editor => {
					expect( editor ).to.be.instanceof( ModelTestEditor );

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

			return ModelTestEditor
				.create( {
					plugins: [ EventWatcher ]
				} )
				.then( () => {
					expect( fired ).to.deep.equal( [ 'pluginsReady', 'dataReady', 'ready' ] );
				} );
		} );
	} );

	describe( 'setData', () => {
		let editor;

		beforeEach( () => {
			return ModelTestEditor.create()
				.then( newEditor => {
					editor = newEditor;

					editor.document.schema.allow( { name: '$text', inside: '$root' } );
				} );
		} );

		it( 'should set data of the first root', () => {
			editor.document.createRoot( '$root', 'secondRoot' );

			editor.setData( 'foo' );

			expect( getData( editor.document, { rootName: 'main', withoutSelection: true } ) ).to.equal( 'foo' );
		} );
	} );

	describe( 'getData', () => {
		let editor;

		beforeEach( () => {
			return ModelTestEditor.create()
				.then( newEditor => {
					editor = newEditor;

					editor.document.schema.allow( { name: '$text', inside: '$root' } );
				} );
		} );

		it( 'should set data of the first root', () => {
			setData( editor.document, 'foo' );

			expect( editor.getData() ).to.equal( 'foo' );
		} );
	} );
} );
