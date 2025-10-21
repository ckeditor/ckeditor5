/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { _getViewData, _getModelData, _setModelData, _parseModel } from '@ckeditor/ckeditor5-engine';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { TableEditing } from '@ckeditor/ckeditor5-table';

import { StandardEditingModeEditing } from '../src/standardeditingmodeediting.js';
import { RestrictedEditingExceptionCommand } from '../src/restrictededitingexceptioncommand.js';
import { RestrictedEditingExceptionBlockCommand } from '../src/index.js';

describe( 'StandardEditingModeEditing', () => {
	let editor, model;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( { plugins: [ Paragraph, StandardEditingModeEditing, TableEditing ] } );
		model = editor.model;
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( StandardEditingModeEditing.pluginName ).to.equal( 'StandardEditingModeEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( StandardEditingModeEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( StandardEditingModeEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( 'StandardEditingModeEditing' ) ).to.be.instanceOf( StandardEditingModeEditing );
	} );

	it( 'root should have "ck-restricted-editing_mode_standard" class', () => {
		for ( const root of editor.editing.view.document.roots ) {
			expect( root.hasClass( 'ck-restricted-editing_mode_standard' ) ).to.be.true;
		}
	} );

	describe( 'schema', () => {
		it( 'should set proper schema rules for inline exception', () => {
			expect( model.schema.checkAttribute( [ '$root', '$text' ], 'restrictedEditingException' ) ).to.be.true;

			expect( model.schema.checkAttribute( [ '$block', '$text' ], 'restrictedEditingException' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'restrictedEditingException' ) ).to.be.true;

			expect( model.schema.checkAttribute( [ '$block' ], 'restrictedEditingException' ) ).to.be.false;
		} );

		it( 'should set proper schema rules for block exception', () => {
			expect( model.schema.checkChild( '$root', 'restrictedEditingException' ) ).to.be.true;
			expect( model.schema.checkChild( '$container', 'restrictedEditingException' ) ).to.be.true;

			expect( model.schema.checkChild( 'restrictedEditingException', '$block' ) ).to.be.true;
			expect( model.schema.checkChild( 'restrictedEditingException', '$container' ) ).to.be.true;
		} );

		it( 'should not allow nesting of block exceptions', () => {
			expect( model.schema.checkChild(
				[ '$root', 'restrictedEditingException' ],
				'restrictedEditingException'
			) ).to.be.false;

			expect( model.schema.checkChild(
				[ '$root', 'restrictedEditingException', '$container', 'paragraph' ],
				'restrictedEditingException'
			) ).to.be.false;
		} );

		it( 'should not allow inline exceptions inside block exceptions', () => {
			expect( model.schema.checkAttribute(
				'restrictedEditingException',
				'restrictedEditingException'
			) ).to.be.false;

			expect( model.schema.checkAttribute(
				[ 'restrictedEditingException', '$text' ],
				'restrictedEditingException'
			) ).to.be.false;

			expect( model.schema.checkAttribute(
				[ 'restrictedEditingException', 'paragraph', '$text' ],
				'restrictedEditingException'
			) ).to.be.false;

			expect( model.schema.checkAttribute(
				[ 'restrictedEditingException', '$container', 'paragraph', '$text' ],
				'restrictedEditingException'
			) ).to.be.false;
		} );
	} );

	describe( 'commands', () => {
		it( 'should register the inline command', () => {
			const command = editor.commands.get( 'restrictedEditingException' );

			expect( command ).to.be.instanceof( RestrictedEditingExceptionCommand );
		} );

		it( 'should register the block command', () => {
			const command = editor.commands.get( 'restrictedEditingExceptionBlock' );

			expect( command ).to.be.instanceof( RestrictedEditingExceptionBlockCommand );
		} );
	} );

	describe( 'conversion', () => {
		describe( 'upcast', () => {
			it( 'should convert <span class="restricted-editing-exception"> to the model attribute', () => {
				editor.setData( '<p>foo <span class="restricted-editing-exception">bar</span> baz</p>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph>foo <$text restrictedEditingException="true">bar</$text> baz</paragraph>' );
			} );

			it( 'should upcast empty editing exception inside a table cell', () => {
				editor.setData( '<table><tr><td><span class="restricted-editing-exception">&nbsp;</span></td></tr></table>' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph><$text restrictedEditingException="true"> </$text></paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should not upcast empty span inside a table cell as exception', () => {
				editor.setData( '<table><tr><td><span class="foo">&nbsp;</span></td></tr></table>' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph></paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>'
				);
			} );

			it( 'should not upcast empty editing exception inside a table cell when disabled by schema', () => {
				editor.model.schema.register( 'object', { inheritAllFrom: '$blockObject' } );
				editor.conversion.elementToElement( { model: 'object', view: 'div' } );

				editor.setData(
					'<p>x<span class="restricted-editing-exception">&nbsp;</span></p>' +
					'<div><span class="restricted-editing-exception">&nbsp;</span></div>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>x<$text restrictedEditingException="true"> </$text></paragraph>' +
					'<object></object>'
				);
			} );

			it( 'should upcast block exception', () => {
				editor.setData(
					'<p>foo</p>' +
					'<div class="restricted-editing-exception">' +
						'<p>bar</p>' +
					'</div>' +
					'<p>baz</p>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>bar</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>baz</paragraph>'
				);
			} );
		} );

		describe( 'downcast', () => {
			it( 'should convert the model attribute to a <span>', () => {
				const expectedView = '<p>foo <span class="restricted-editing-exception">bar</span> baz</p>';

				_setModelData( editor.model,
					'<paragraph>foo <$text restrictedEditingException="true">bar</$text> baz</paragraph>'
				);

				expect( editor.getData() ).to.equal( expectedView );
				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( expectedView );
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

				_setModelData( editor.model,
					'<paragraph>' +
						'<$text restrictedEditingException="true" bold="true">foo</$text>' +
						'<$text restrictedEditingException="true"> </$text>' +
						'<$text restrictedEditingException="true" italic="true">bar</$text>' +
						'<$text restrictedEditingException="true"> baz</$text>' +
					'</paragraph>'
				);

				expect( editor.getData() ).to.equalMarkup( expectedView );
				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equalMarkup( expectedView );
			} );

			it( 'should downcast block exception', () => {
				const expectedView =
					'<p>foo</p>' +
					'<div class="restricted-editing-exception">' +
						'<p>bar</p>' +
					'</div>' +
					'<p>baz</p>';

				_setModelData( editor.model,
					'<paragraph>foo</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>bar</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>baz</paragraph>'
				);

				expect( editor.getData() ).to.equalMarkup( expectedView );
				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equalMarkup( expectedView );
			} );
		} );
	} );

	describe( 'post-fixer', () => {
		it( 'should unwrap nested block exceptions', () => {
			_setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<restrictedEditingException>' +
								'<paragraph>bar</paragraph>' +
							'</restrictedEditingException>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>' +
				'<paragraph>baz</paragraph>'
			);

			model.change( writer => {
				writer.wrap( writer.createRangeOn( model.document.getRoot().getChild( 1 ) ), 'restrictedEditingException' );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<restrictedEditingException>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>bar</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>' +
				'</restrictedEditingException>' +
				'<paragraph>baz</paragraph>'
			);
		} );

		it( 'should unwrap nested block exceptions when inserted as nested structure', () => {
			_setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>abc[]</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>baz</paragraph>'
			);

			model.change( writer => {
				const content =
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<restrictedEditingException>' +
									'<paragraph>bar</paragraph>' +
								'</restrictedEditingException>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>';

				const fragment = _parseModel( content, model.schema, {
					context: [ '$clipboardHolder' ]
				} );

				writer.insert( fragment, model.document.getRoot().getChild( 1 ), 1 );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>abc</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>bar</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>' +
				'</restrictedEditingException>' +
				'<paragraph>baz</paragraph>'
			);
		} );

		it( 'should remove block exceptions - inserted empty', () => {
			_setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'<paragraph>baz</paragraph>'
			);

			model.change( writer => {
				writer.insertElement( 'restrictedEditingException', model.document.getRoot(), 1 );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<paragraph>baz</paragraph>'
			);
		} );

		it( 'should remove empty block exceptions - content removed', () => {
			_setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>bar</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>baz</paragraph>'
			);

			model.change( writer => {
				writer.remove( model.document.getRoot().getChild( 1 ).getChild( 0 ) );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<paragraph>baz</paragraph>'
			);
		} );
	} );
} );
