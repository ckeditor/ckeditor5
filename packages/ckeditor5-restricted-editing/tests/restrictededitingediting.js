/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import RestrictedEditingEditing from './../src/restrictededitingediting';

describe( 'RestrictedEditingEditing', () => {
	let editor;

	testUtils.createSinonSandbox();

	describe( 'plugin', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ RestrictedEditingEditing ] } );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should be named', () => {
			expect( RestrictedEditingEditing.pluginName ).to.equal( 'RestrictedEditingEditing' );
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( RestrictedEditingEditing ) ).to.be.instanceOf( RestrictedEditingEditing );
		} );
	} );

	describe( 'conversion', () => {
		let model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, RestrictedEditingEditing ] } );
			model = editor.model;
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'upcast', () => {
			it( 'should convert <span class="ck-restricted-editing-exception"> to marker', () => {
				editor.setData( '<p>foo <span class="ck-restricted-editing-exception">bar</span> baz</p>' );

				expect( model.markers.has( 'restricted-editing-exception:1' ) ).to.be.true;

				const marker = model.markers.get( 'restricted-editing-exception:1' );

				expect( marker.getStart().path ).to.deep.equal( [ 0, 4 ] );
				expect( marker.getEnd().path ).to.deep.equal( [ 0, 7 ] );
			} );

			it( 'should convert multiple <span class="ck-restricted-editing-exception">', () => {
				editor.setData(
					'<p>foo <span class="ck-restricted-editing-exception">bar</span> baz</p>' +
					'<p>ABCDEF<span class="ck-restricted-editing-exception">GHIJK</span>LMNOPQRST</p>'
				);

				expect( model.markers.has( 'restricted-editing-exception:1' ) ).to.be.true;
				expect( model.markers.has( 'restricted-editing-exception:2' ) ).to.be.true;

				// Data for the first marker is the same as in previous tests so no need to test it again.
				const secondMarker = model.markers.get( 'restricted-editing-exception:2' );

				expect( secondMarker.getStart().path ).to.deep.equal( [ 1, 6 ] );
				expect( secondMarker.getEnd().path ).to.deep.equal( [ 1, 11 ] );
			} );

			it( 'should not convert other <span> elements', () => {
				editor.setData( '<p>foo <span class="foo bar">bar</span> baz</p>' );

				expect( model.markers.has( 'restricted-editing-exception:1' ) ).to.be.false;
			} );
		} );

		describe( 'downcast', () => {
			it( 'should convert model marker to <span>', () => {
				setModelData( model, '<paragraph>foo bar baz</paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.addMarker( 'restricted-editing-exception:1', {
						range: writer.createRange( writer.createPositionAt( paragraph, 4 ), writer.createPositionAt( paragraph, 7 ) ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				const expectedView = '<p>foo <span class="ck-restricted-editing-exception">bar</span> baz</p>';
				expect( editor.getData() ).to.equal( expectedView );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
			} );

			it( 'converted <span> should be the outermost attribute element', () => {
				editor.conversion.for( 'downcast' ).attributeToElement( { model: 'bold', view: 'b' } );
				setModelData( model, '<paragraph><$text bold="true">foo bar baz</$text></paragraph>' );

				const paragraph = model.document.getRoot().getChild( 0 );

				model.change( writer => {
					writer.addMarker( 'restricted-editing-exception:1', {
						range: writer.createRange( writer.createPositionAt( paragraph, 0 ), writer.createPositionAt( paragraph, 'end' ) ),
						usingOperation: true,
						affectsData: true
					} );
				} );

				const expectedView = '<p><span class="ck-restricted-editing-exception"><b>foo bar baz</b></span></p>';
				expect( editor.getData() ).to.equal( expectedView );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
			} );
		} );
	} );
} );
