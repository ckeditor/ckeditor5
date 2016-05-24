/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: editor */

'use strict';

import Editor from '/ckeditor5/editor.js';
import Command from '/ckeditor5/command/command.js';
import Locale from '/ckeditor5/utils/locale.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import Document from '/ckeditor5/engine/model/document.js';
import DataController from '/ckeditor5/engine/datacontroller.js';
import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';
import { getData, setData } from '/tests/engine/_utils/model.js';

describe( 'Editor', () => {
	describe( 'locale', () => {
		it( 'is instantiated and t() is exposed', () => {
			const editor = new Editor();

			expect( editor.locale ).to.be.instanceof( Locale );
			expect( editor.t ).to.equal( editor.locale.t );
		} );

		it( 'is configured with the config.lang', () => {
			const editor = new Editor( null, { lang: 'pl' } );

			expect( editor.locale.lang ).to.equal( 'pl' );
		} );
	} );

	describe( 'destroy', () => {
		it( 'should fire "destroy"', () => {
			const editor = new Editor();
			let spy = sinon.spy();

			editor.on( 'destroy', spy );

			return editor.destroy().then( () => {
				expect( spy.calledOnce ).to.be.true;
			} );
		} );

		// Note: Tests for destroying creators are in creator/creator.js.
		// When destroying creator will be generalized to destroying plugins,
		// move that code here.
	} );

	describe( 'execute', () => {
		it( 'should execute specified command', () => {
			const editor = new Editor();

			let command = new Command( editor );
			sinon.spy( command, '_execute' );

			editor.commands.set( 'commandName', command );
			editor.execute( 'commandName' );

			expect( command._execute.calledOnce ).to.be.true;
		} );

		it( 'should throw an error if specified command has not been added', () => {
			const editor = new Editor();

			expect( () => {
				editor.execute( 'command' );
			} ).to.throw( CKEditorError, /^editor-command-not-found:/ );
		} );
	} );

	describe( 'setData', () => {
		let editor;

		beforeEach( () => {
			editor = new Editor();

			editor.document = new Document();
			editor.data = {
				set: sinon.spy()
			};
		} );

		it( 'should set data of the first root', () => {
			editor.document.createRoot( 'firstRoot', 'div' );

			editor.setData( 'foo' );

			expect( editor.data.set.calledOnce ).to.be.true;
			expect( editor.data.set.calledWithExactly( 'foo', 'firstRoot' ) ).to.be.true;
		} );

		it( 'should set data of the specified root', () => {
			editor.setData( 'foo', 'someRoot' );

			expect( editor.data.set.calledOnce ).to.be.true;
			expect( editor.data.set.calledWithExactly( 'foo', 'someRoot' ) ).to.be.true;
		} );

		it( 'should throw when no roots', () => {
			expect( () => {
				editor.setData( 'foo' );
			} ).to.throw( CKEditorError, /^editor-no-editable-roots:/ );
		} );

		it( 'should throw when more than one root and no root name given', () => {
			editor.document.createRoot( 'firstRoot', 'div' );
			editor.document.createRoot( 'secondRoot', 'div' );

			expect( () => {
				editor.setData( 'foo' );
			} ).to.throw( CKEditorError, /^editor-editable-root-name-missing:/ );
		} );

		it( 'should throw when no data controller', () => {
			expect( () => {
				editor.data = null;

				editor.setData( 'foo' );
			} ).to.throw( CKEditorError, /^editor-no-datacontroller:/ );
		} );

		describe( 'integrational tests', () => {
			beforeEach( () => {
				editor.data = new DataController( editor.document, new HtmlDataProcessor() );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
			} );

			it( 'should set data of the first root', () => {
				editor.document.createRoot( 'firstRoot', 'div' );

				editor.setData( 'foo' );

				expect( getData( editor.document, { rootName: 'firstRoot', withoutSelection: true } ) ).to.equal( 'foo' );
			} );

			it( 'should set data of the specified root', () => {
				editor.document.createRoot( 'firstRoot', 'div' );
				editor.document.createRoot( 'secondRoot', 'div' );

				editor.setData( 'foo', 'secondRoot' );

				expect( getData( editor.document, { rootName: 'secondRoot', withoutSelection: true } ) ).to.equal( 'foo' );
			} );
		} );
	} );

	describe( 'getData', () => {
		let editor;

		beforeEach( () => {
			editor = new Editor();

			editor.document = new Document();
			editor.data = {
				get( rootName ) {
					return `data for ${ rootName }`;
				}
			};
		} );

		it( 'should get data from the first root', () => {
			editor.document.createRoot( 'firstRoot', 'div' );

			expect( editor.getData() ).to.equal( 'data for firstRoot' );
		} );

		it( 'should get data from the specified root', () => {
			expect( editor.getData( 'someRoot' ) ).to.equal( 'data for someRoot' );
		} );

		it( 'should throw when no roots', () => {
			expect( () => {
				editor.getData();
			} ).to.throw( CKEditorError, /^editor-no-editable-roots:/ );
		} );

		it( 'should throw when more than one root and no root name given', () => {
			editor.document.createRoot( 'firstRoot', 'div' );
			editor.document.createRoot( 'secondRoot', 'div' );

			expect( () => {
				editor.getData();
			} ).to.throw( CKEditorError, /^editor-editable-root-name-missing:/ );
		} );

		it( 'should throw when no data controller', () => {
			expect( () => {
				editor.data = null;

				editor.getData();
			} ).to.throw( CKEditorError, /^editor-no-datacontroller:/ );
		} );

		describe( 'integrational tests', () => {
			beforeEach( () => {
				editor.data = new DataController( editor.document, new HtmlDataProcessor() );

				editor.document.schema.allow( { name: '$text', inside: '$root' } );
			} );

			it( 'should set data of the first root', () => {
				editor.document.createRoot( 'firstRoot', 'div' );

				setData( editor.document, 'foo', { rootName: 'firstRoot' } );

				expect( editor.getData() ).to.equal( 'foo' );
			} );

			it( 'should set data of the specified root', () => {
				editor.document.createRoot( 'firstRoot', 'div' );
				editor.document.createRoot( 'secondRoot', 'div' );

				setData( editor.document, 'foo', { rootName: 'secondRoot' } );

				expect( editor.getData( 'secondRoot' ) ).to.equal( 'foo' );
			} );
		} );
	} );
} );
