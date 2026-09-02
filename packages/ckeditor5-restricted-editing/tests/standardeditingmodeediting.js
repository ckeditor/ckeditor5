/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { _getViewData, _getModelData, _setModelData, _parseModel } from '@ckeditor/ckeditor5-engine';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { TableEditing } from '@ckeditor/ckeditor5-table';

import {
	StandardEditingModeEditing,
	RestrictedEditingExceptionCommand,
	RestrictedEditingExceptionBlockCommand,
	RestrictedEditingExceptionAutoCommand
} from '../src/index.js';

describe( 'StandardEditingModeEditing', () => {
	let editor, model;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( { plugins: [ Paragraph, StandardEditingModeEditing, TableEditing ] } );
		model = editor.model;
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( StandardEditingModeEditing.pluginName ).toEqual( 'StandardEditingModeEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( StandardEditingModeEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( StandardEditingModeEditing.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( 'StandardEditingModeEditing' ) ).to.be.instanceOf( StandardEditingModeEditing );
	} );

	it( 'root should have "ck-restricted-editing_mode_standard" class', () => {
		for ( const root of editor.editing.view.document.roots ) {
			expect( root.hasClass( 'ck-restricted-editing_mode_standard' ) ).toBe( true );
		}
	} );

	describe( 'schema', () => {
		it( 'should set proper schema rules for inline exception', () => {
			expect( model.schema.checkAttribute( [ '$root', '$text' ], 'restrictedEditingException' ) ).toBe( true );

			expect( model.schema.checkAttribute( [ '$block', '$text' ], 'restrictedEditingException' ) ).toBe( true );
			expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'restrictedEditingException' ) ).toBe( true );

			expect( model.schema.checkAttribute( [ '$block' ], 'restrictedEditingException' ) ).toBe( false );
		} );

		it( 'should set proper schema rules for block exception', () => {
			expect( model.schema.checkChild( '$root', 'restrictedEditingException' ) ).toBe( true );
			expect( model.schema.checkChild( '$container', 'restrictedEditingException' ) ).toBe( true );

			expect( model.schema.checkChild( 'restrictedEditingException', '$block' ) ).toBe( true );
			expect( model.schema.checkChild( 'restrictedEditingException', '$container' ) ).toBe( true );
		} );

		it( 'should not allow nesting of block exceptions', () => {
			expect( model.schema.checkChild(
				[ '$root', 'restrictedEditingException' ],
				'restrictedEditingException'
			) ).toBe( false );

			expect( model.schema.checkChild(
				[ '$root', 'restrictedEditingException', '$container', 'paragraph' ],
				'restrictedEditingException'
			) ).toBe( false );
		} );

		it( 'should not allow inline exceptions inside block exceptions', () => {
			expect( model.schema.checkAttribute(
				'restrictedEditingException',
				'restrictedEditingException'
			) ).toBe( false );

			expect( model.schema.checkAttribute(
				[ 'restrictedEditingException', '$text' ],
				'restrictedEditingException'
			) ).toBe( false );

			expect( model.schema.checkAttribute(
				[ 'restrictedEditingException', 'paragraph', '$text' ],
				'restrictedEditingException'
			) ).toBe( false );

			expect( model.schema.checkAttribute(
				[ 'restrictedEditingException', '$container', 'paragraph', '$text' ],
				'restrictedEditingException'
			) ).toBe( false );
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

		it( 'should register the auto command', () => {
			const command = editor.commands.get( 'restrictedEditingExceptionAuto' );

			expect( command ).to.be.instanceof( RestrictedEditingExceptionAutoCommand );
		} );
	} );

	describe( 'conversion', () => {
		describe( 'upcast', () => {
			it( 'should convert <span class="restricted-editing-exception"> to the model attribute', () => {
				editor.setData( '<p>foo <span class="restricted-editing-exception">bar</span> baz</p>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toEqual( '<paragraph>foo <$text restrictedEditingException="true">bar</$text> baz</paragraph>' );
			} );

			it( 'should upcast empty editing exception inside a table cell', () => {
				editor.setData( '<table><tr><td><span class="restricted-editing-exception">&nbsp;</span></td></tr></table>' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph><$text restrictedEditingException="true"> </$text></paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>' );
			} );

			it( 'should not upcast empty span inside a table cell as exception', () => {
				editor.setData( '<table><tr><td><span class="foo">&nbsp;</span></td></tr></table>' );

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph></paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>' );
			} );

			it( 'should not upcast empty editing exception inside a table cell when disabled by schema', () => {
				editor.model.schema.register( 'object', { inheritAllFrom: '$blockObject' } );
				editor.conversion.elementToElement( { model: 'object', view: 'div' } );

				editor.setData(
					'<p>x<span class="restricted-editing-exception">&nbsp;</span></p>' +
					'<div><span class="restricted-editing-exception">&nbsp;</span></div>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) )
					.toEqual( '<paragraph>x<$text restrictedEditingException="true"> </$text></paragraph>' +
					'<object></object>' );
			} );

			it( 'should upcast block exception', () => {
				editor.setData(
					'<p>foo</p>' +
					'<div class="restricted-editing-exception">' +
						'<p>bar</p>' +
					'</div>' +
					'<p>baz</p>'
				);

				expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>foo</paragraph>' +
					'<restrictedEditingException>' +
						'<paragraph>bar</paragraph>' +
					'</restrictedEditingException>' +
					'<paragraph>baz</paragraph>' );
			} );
		} );

		describe( 'downcast', () => {
			it( 'should convert the model attribute to a <span>', () => {
				const expectedView = '<p>foo <span class="restricted-editing-exception">bar</span> baz</p>';

				_setModelData( editor.model,
					'<paragraph>foo <$text restrictedEditingException="true">bar</$text> baz</paragraph>'
				);

				expect( editor.getData() ).toEqual( expectedView );
				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toEqual( expectedView );
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

				expect( editor.getData() ).toEqual( expectedView );
				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toEqual( expectedView );
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

				expect( editor.getData() ).toEqual( expectedView );
				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toEqual( expectedView );
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

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>foo</paragraph>' +
				'<restrictedEditingException>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>bar</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>' +
				'</restrictedEditingException>' +
				'<paragraph>baz</paragraph>' );
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

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>foo</paragraph>' +
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
				'<paragraph>baz</paragraph>' );
		} );

		it( 'should remove block exceptions - inserted empty', () => {
			_setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'<paragraph>baz</paragraph>'
			);

			model.change( writer => {
				writer.insertElement( 'restrictedEditingException', model.document.getRoot(), 1 );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>foo</paragraph>' +
				'<paragraph>baz</paragraph>' );
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

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>foo</paragraph>' +
				'<paragraph>baz</paragraph>' );
		} );

		it( 'should remove nested inline exceptions from block exceptions', () => {
			_setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>b[]ar</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>baz</paragraph>'
			);

			model.change( writer => {
				writer.insert(
					writer.createText( '123', { restrictedEditingException: true } ),
					model.document.selection.focus
				);
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>foo</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>b123ar</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>baz</paragraph>' );
		} );

		it( 'should remove nested inline exceptions from block exceptions when inserted bigger structure', () => {
			_setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>b[]ar</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>baz</paragraph>'
			);

			model.change( writer => {
				const content =
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>a<$text restrictedEditingException="true">123</$text>z</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>';

				const fragment = _parseModel( content, model.schema, {
					context: [ '$clipboardHolder' ]
				} );

				writer.insert( fragment, model.document.getRoot().getChild( 1 ), 1 );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>foo</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>bar</paragraph>' +
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>a123z</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>' +
				'</restrictedEditingException>' +
				'<paragraph>baz</paragraph>' );
		} );

		it( 'should merge sibling block exceptions on insert', () => {
			_setModelData( editor.model,
				'<paragraph>foo</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>bar</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>baz</paragraph>'
			);

			model.change( writer => {
				const content =
					'<restrictedEditingException>' +
						'<paragraph>123</paragraph>' +
					'</restrictedEditingException>';

				const fragment = _parseModel( content, model.schema, {
					context: [ '$clipboardHolder' ]
				} );

				writer.insert( fragment, model.document.getRoot(), 2 );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<paragraph>foo</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>bar</paragraph>' +
					'<paragraph>123</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>baz</paragraph>' );
		} );

		it( 'should merge sibling block exceptions on remove block between exceptions', () => {
			_setModelData( editor.model,
				'<restrictedEditingException>' +
					'<paragraph>foo</paragraph>' +
				'</restrictedEditingException>' +
				'<paragraph>bar</paragraph>' +
				'<restrictedEditingException>' +
					'<paragraph>baz</paragraph>' +
				'</restrictedEditingException>'
			);

			model.change( writer => {
				writer.remove( model.document.getRoot().getChild( 1 ) );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqual( '<restrictedEditingException>' +
					'<paragraph>foo</paragraph>' +
					'<paragraph>baz</paragraph>' +
				'</restrictedEditingException>' );
		} );
	} );
} );
