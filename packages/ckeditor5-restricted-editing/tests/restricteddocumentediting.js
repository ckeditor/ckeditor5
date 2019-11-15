/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import RestrictedDocumentEditing from '../src/restricteddocumentediting';
import RestrictedDocumentCommand from '../src/restricteddocumentcommand';

describe( 'RestrictedDocumentEditing', () => {
	let editor, model;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( { plugins: [ Paragraph, RestrictedDocumentEditing ] } );
		model = editor.model;
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( RestrictedDocumentEditing.pluginName ).to.equal( 'RestrictedDocumentEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( 'RestrictedDocumentEditing' ) ).to.be.instanceOf( RestrictedDocumentEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', '$text' ], 'restrictedEditingException' ) ).to.be.true;

		expect( model.schema.checkAttribute( [ '$block', '$text' ], 'restrictedEditingException' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'restrictedEditingException' ) ).to.be.true;

		expect( model.schema.checkAttribute( [ '$block' ], 'restrictedEditingException' ) ).to.be.false;
	} );

	it( 'should register command', () => {
		const command = editor.commands.get( 'nonRestricted' );

		expect( command ).to.be.instanceof( RestrictedDocumentCommand );
	} );

	describe( 'conversion', () => {
		describe( 'upcast', () => {
			it( 'should convert <span class="ck-non-restricted"> to model attribute', () => {
				editor.setData( '<p>foo <span class="ck-non-restricted">bar</span> baz</p>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph>foo <$text restrictedEditingException="true">bar</$text> baz</paragraph>' );
			} );
		} );

		describe( 'downcast', () => {
			it( 'should convert model attribute to <span>', () => {
				const expectedView = '<p>foo <span class="ck-non-restricted">bar</span> baz</p>';

				setModelData( editor.model,
					'<paragraph>foo <$text restrictedEditingException="true">bar</$text> baz</paragraph>'
				);

				expect( editor.getData() ).to.equal( expectedView );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
			} );
		} );
	} );
} );
