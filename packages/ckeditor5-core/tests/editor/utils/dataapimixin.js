/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DataApiMixin from '../../../src/editor/utils/dataapimixin';
import Editor from '../../../src/editor/editor';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import testUtils from '../../../tests/_utils/utils';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'DataApiMixin', () => {
	let editor;

	beforeEach( () => {
		class CustomEditor extends Editor {}
		mix( CustomEditor, DataApiMixin );

		editor = new CustomEditor();
		editor.data.processor = new HtmlDataProcessor( editor.stylesProcessor );
		editor.model.document.createRoot( '$root', 'main' );
		editor.model.document.createRoot( '$root', 'secondRoot' );
		editor.model.schema.extend( '$text', { allowIn: '$root' } );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	describe( 'setData()', () => {
		it( 'should be added to editor interface', () => {
			expect( editor ).have.property( 'setData' ).to.be.a( 'function' );
		} );

		it( 'should set data of the first root', () => {
			editor.setData( 'foo' );

			expect( getData( editor.model, { rootName: 'main', withoutSelection: true } ) ).to.equal( 'foo' );
		} );
	} );

	describe( 'getData()', () => {
		testUtils.createSinonSandbox();

		it( 'should be added to editor interface', () => {
			expect( editor ).have.property( 'getData' ).to.be.a( 'function' );
		} );

		it( 'should get data of the first root', () => {
			setData( editor.model, 'foo' );

			expect( editor.getData() ).to.equal( 'foo' );
		} );

		it( 'should get data of the second root', () => {
			setData( editor.model, 'bar', { rootName: 'secondRoot' } );

			expect( editor.getData( { rootName: 'secondRoot' } ) ).to.equal( 'bar' );
		} );

		it( 'should pass options object to data.get() method internally', () => {
			const spy = testUtils.sinon.spy( editor.data, 'get' );
			const options = { rootName: 'main', trim: 'none' };

			setData( editor.model, 'foo' );

			expect( editor.getData( options ) ).to.equal( 'foo' );

			testUtils.sinon.assert.calledOnce( spy );
			testUtils.sinon.assert.calledWith( spy, options );
		} );
	} );
} );
