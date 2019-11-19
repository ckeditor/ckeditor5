/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import RestrictedEditing from './../src/restrictedediting';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'RestrictedEditing', () => {
	let editor, element;

	testUtils.createSinonSandbox();

	describe( 'plugin', () => {
		beforeEach( async () => {
			element = document.createElement( 'div' );
			document.body.appendChild( element );

			editor = await ClassicTestEditor.create( element, { plugins: [ RestrictedEditing ] } );
		} );

		afterEach( () => {
			element.remove();

			return editor.destroy();
		} );

		it( 'should be named', () => {
			expect( RestrictedEditing.pluginName ).to.equal( 'RestrictedEditing' );
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( RestrictedEditing ) ).to.be.instanceOf( RestrictedEditing );
		} );
	} );

	describe( 'conversion', () => {
		let model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Paragraph, RestrictedEditing ] } );
			model = editor.model;
		} );

		afterEach( () => {
			return editor.destroy();
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
		} );
	} );
} );
