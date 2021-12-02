/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import StandardEditingModeEditing from '../src/standardeditingmodeediting';
import RestrictedEditingExceptionCommand from '../src/restrictededitingexceptioncommand';

describe( 'StandardEditingModeEditing', () => {
	let editor, model;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( { plugins: [ Paragraph, StandardEditingModeEditing ] } );
		model = editor.model;
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( StandardEditingModeEditing.pluginName ).to.equal( 'StandardEditingModeEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( 'StandardEditingModeEditing' ) ).to.be.instanceOf( StandardEditingModeEditing );
	} );

	it( 'root should have "ck-restricted-editing_mode_standard" class', () => {
		for ( const root of editor.editing.view.document.roots ) {
			expect( root.hasClass( 'ck-restricted-editing_mode_standard' ) ).to.be.true;
		}
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', '$text' ], 'restrictedEditingException' ) ).to.be.true;

		expect( model.schema.checkAttribute( [ '$block', '$text' ], 'restrictedEditingException' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'restrictedEditingException' ) ).to.be.true;

		expect( model.schema.checkAttribute( [ '$block' ], 'restrictedEditingException' ) ).to.be.false;
	} );

	it( 'should register the command', () => {
		const command = editor.commands.get( 'restrictedEditingException' );

		expect( command ).to.be.instanceof( RestrictedEditingExceptionCommand );
	} );

	describe( 'conversion', () => {
		describe( 'upcast', () => {
			it( 'should convert <span class="restricted-editing-exception"> to the model attribute', () => {
				editor.setData( '<p>foo <span class="restricted-editing-exception">bar</span> baz</p>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph>foo <$text restrictedEditingException="true">bar</$text> baz</paragraph>' );
			} );
		} );

		describe( 'downcast', () => {
			it( 'should convert the model attribute to a <span>', () => {
				const expectedView = '<p>foo <span class="restricted-editing-exception">bar</span> baz</p>';

				setModelData( editor.model,
					'<paragraph>foo <$text restrictedEditingException="true">bar</$text> baz</paragraph>'
				);

				expect( editor.getData() ).to.equal( expectedView );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
			} );

			it( 'converted <span> should be outer most element', () => {
				editor.conversion.for( 'downcast' ).attributeToElement( {
					model: 'bold',
					view: 'b'
				} );
				editor.conversion.for( 'downcast' ).attributeToElement( {
					model: 'italic',
					view: 'i'
				} );

				const expectedView = '<p><span class="restricted-editing-exception"><b>foo</b> <i>bar</i> baz</span></p>';

				setModelData( editor.model,
					'<paragraph>' +
						'<$text restrictedEditingException="true" bold="true">foo</$text>' +
						'<$text restrictedEditingException="true"> </$text>' +
						'<$text restrictedEditingException="true" italic="true">bar</$text>' +
						'<$text restrictedEditingException="true"> baz</$text>' +
					'</paragraph>'
				);

				expect( editor.getData() ).to.equalMarkup( expectedView );
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equalMarkup( expectedView );
			} );
		} );
	} );
} );
