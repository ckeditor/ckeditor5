/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import DocumentListPropertiesEditing from '../../src/documentlistproperties/documentlistpropertiesediting';
import { modelList } from '../documentlist/_utils/utils';
import stubUid from '../documentlist/_utils/uid';

describe( 'DocumentListPropertiesEditing', () => {
	let editor, model;

	testUtils.createSinonSandbox();

	it( 'should have pluginName', () => {
		expect( DocumentListPropertiesEditing.pluginName ).to.equal( 'DocumentListPropertiesEditing' );
	} );

	describe( 'config', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ DocumentListPropertiesEditing ]
			} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'should have default values', () => {
			expect( editor.config.get( 'list' ) ).to.deep.equal( {
				properties: {
					styles: true,
					startIndex: false,
					reversed: false
				}
			} );
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( DocumentListPropertiesEditing ) ).to.be.instanceOf( DocumentListPropertiesEditing );
		} );
	} );

	describe( 'listStyle', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, DocumentListPropertiesEditing, UndoEditing ],
				list: {
					properties: { styles: true, startIndex: false, reversed: false }
				}
			} );

			model = editor.model;

			stubUid();
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'command', () => {
			it( 'should register `listStyle` command with support for all style types', () => {
				const command = editor.commands.get( 'listStyle' );

				expect( command.isStyleTypeSupported( 'disc' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'circle' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'square' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'decimal' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'decimal-leading-zero' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'lower-roman' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'upper-roman' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'lower-alpha' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'upper-alpha' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'lower-latin' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'upper-latin' ) ).to.be.true;
			} );
		} );

		describe( 'schema rules', () => {
			it( 'should allow set `listStyle` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listStyle' ) ).to.be.true;
			} );

			it( 'should not allow set `listReversed` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listReversed' ) ).to.be.false;
			} );

			it( 'should not allow set `listStart` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listStart' ) ).to.be.false;
			} );
		} );

		describe( 'post-fixer', () => {
			it( 'should ensure that all item in a single list have the same `listStyle` attribute', () => {
				setData( model, modelList( `
					* 1. {style:circle}
					* 2.
					* 3. {style:square}
					* 4.
					  # 4.1. {style:default}
					  # 4.2. {style:upper-roman}
					  # 4.3. {style:decimal}
					    # 4.3.1. {style:decimal}
					    # 4.3.2. {style:upper-roman}
					* 5. {style:disc}
				` ) );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
					* 1. {style:circle}
					* 2.
					* 3.
					* 4.
					  # 4.1. {style:default}
					  # 4.2.
					  # 4.3.
					    # 4.3.1. {style:decimal}
					    # 4.3.2.
					* 5.
				` ) );
			} );

			it( 'should ensure that all list item have the same `listStyle` after removing a block between them', () => {
				setData( model,
					'<paragraph listItemId="01" listStyle="circle" listType="bulleted">1.</paragraph>' +
					'<paragraph listItemId="02" listStyle="circle" listType="bulleted">2.</paragraph>' +
					'<paragraph>Foo</paragraph>' +
					'<paragraph listItemId="03" listStyle="square" listType="bulleted">3.</paragraph>' +
					'<paragraph listItemId="04" listStyle="square" listType="bulleted">4.</paragraph>'
				);

				model.change( writer => {
					writer.remove( model.document.getRoot().getChild( 2 ) );
				} );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listItemId="01" listStyle="circle" listType="bulleted">1.</paragraph>' +
					'<paragraph listItemId="02" listStyle="circle" listType="bulleted">2.</paragraph>' +
					'<paragraph listItemId="03" listStyle="circle" listType="bulleted">3.</paragraph>' +
					'<paragraph listItemId="04" listStyle="circle" listType="bulleted">4.</paragraph>'
				);
			} );

			it( 'should restore `listStyle` attribute after it\'s changed in one of the following items', () => {
				setData( model, modelList( `
					# 1. {style:upper-roman}
					# 2.
					# 3.
				` ) );

				model.change( writer => {
					writer.setAttribute( 'listStyle', 'decimal', model.document.getRoot().getChild( 2 ) );
				} );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
					# 1. {style:upper-roman}
					# 2.
					# 3.
				` ) );
			} );

			it( 'should change `listStyle` attribute for all the following items after the first one is changed', () => {
				setData( model, modelList( `
					# 1. {style:upper-roman}
					# 2.
					# 3.
				` ) );

				model.change( writer => {
					writer.setAttribute( 'listStyle', 'decimal', model.document.getRoot().getChild( 0 ) );
				} );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
					# 1. {style:decimal}
					# 2.
					# 3.
				` ) );
			} );
		} );

		describe( 'conversion', () => {
			describe( 'upcast', () => {
				it( 'should upcast to `listStyle` property (bulleted, default)', () => {
					editor.setData( '<ul><li>Foo</li></ul>' );

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
						* Foo {id:a00} {style:default}
					` ) );
				} );

				it( 'should upcast to `listStyle` property (numbered, default)', () => {
					editor.setData( '<ol><li>Foo</li></ol>' );

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
						# Foo {id:a00} {style:default}
					` ) );
				} );

				it( 'should upcast to `listStyle` property (bulleted, listStyleType="circle")', () => {
					editor.setData( '<ul style="list-style-type:circle;"><li>Foo</li></ul>' );

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
						* Foo {id:a00} {style:circle}
					` ) );
				} );

				it( 'should upcast to `listStyle` property (numbered, listStyleType="decimal")', () => {
					editor.setData( '<ol style="list-style-type:decimal;"><li>Foo</li></ol>' );

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
						# Foo {id:a00} {style:decimal}
					` ) );
				} );

				it( 'should upcast to `listStyle` property (bulleted, type="square")', () => {
					editor.setData( '<ul type="square"><li>Foo</li></ul>' );

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
						* Foo {id:a00} {style:square}
					` ) );
				} );

				it( 'should upcast to `listStyle` property (numbered, type="A")', () => {
					editor.setData( '<ol type="A"><li>Foo</li></ol>' );

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
						# Foo {id:a00} {style:upper-latin}
					` ) );
				} );

				it( 'should upcast to `listStyle` property (bulleted, list-style-type="circle" type="square")', () => {
					editor.setData( '<ul style="list-style-type:circle;" type="circle"><li>Foo</li></ul>' );

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
						* Foo {id:a00} {style:circle}
					` ) );
				} );

				it( 'should upcast to `listStyle` property (numbered, list-style-type="decimal" type="A")', () => {
					editor.setData( '<ol type="A" style="list-style-type:decimal"><li>Foo</li></ol>' );

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
						# Foo {id:a00} {style:decimal}
					` ) );
				} );
			} );

			describe( 'downcast', () => {
				it( 'should downcast to `list-style-type` style (bulleted, default)', () => {
					setData( model, modelList( `
						* Foo {style:default}
					` ) );

					expect( editor.getData() ).to.equal( '<ul><li>Foo</li></ul>' );
				} );

				it( 'should downcast to `list-style-type` style (bulleted, circle)', () => {
					setData( model, modelList( `
						* Foo {style:circle}
					` ) );

					expect( editor.getData() ).to.equal( '<ul style="list-style-type:circle;"><li>Foo</li></ul>' );
				} );

				it( 'should downcast to `list-style-type` style (numbered, default)', () => {
					setData( model, modelList( `
						# Foo {style:default}
					` ) );

					expect( editor.getData() ).to.equal( '<ol><li>Foo</li></ol>' );
				} );

				it( 'should downcast to `list-style-type` style (numbered, decimal)', () => {
					setData( model, modelList( `
						# Foo {style:decimal}
					` ) );

					expect( editor.getData() ).to.equal( '<ol style="list-style-type:decimal;"><li>Foo</li></ol>' );
				} );
			} );
		} );

		describe( 'indenting lists', () => {
			it( 'should reset `listStyle` attribute after indenting a single item', () => {
				setData( model, modelList( `
					* 1. {style:circle}
					  * 1a. {style:square}
					* 2.
					* 3.[]
					* 4.
				` ) );

				editor.execute( 'indentList' );

				expect( getData( model ) ).to.equalMarkup( modelList( `
					* 1. {style:circle}
					  * 1a. {style:square}
					* 2.
					  * 3.[] {style:default}
					* 4.
				` ) );
			} );

			it( 'should reset `listStyle` attribute after indenting a few items', () => {
				setData( model, modelList( `
					# 1. {style:decimal}
					# [2.
					# 3.]
				` ) );

				editor.execute( 'indentList' );

				expect( getData( model ) ).to.equalMarkup( modelList( `
					# 1. {style:decimal}
					  # [2. {style:default}
					  # 3.]
				` ) );
			} );

			it( 'should copy `listStyle` attribute after indenting a single item into previously nested list', () => {
				setData( model, modelList( `
					* 1. {style:circle}
					  * 1a. {style:square}
					  * 1b.
					* 2.[]
					* 3.
				` ) );

				editor.execute( 'indentList' );

				expect( getData( model ) ).to.equalMarkup( modelList( `
					* 1. {style:circle}
					  * 1a. {style:square}
					  * 1b.
					  * 2.[]
					* 3.
				` ) );
			} );

			it( 'should copy `listStyle` attribute after indenting a few items into previously nested list', () => {
				setData( model, modelList( `
					* 1. {style:circle}
					  * 1a. {style:square}
					  * 1b.
					* [2.
					* 3.]
					* 4.
				` ) );

				editor.execute( 'indentList' );

				expect( getData( model ) ).to.equalMarkup( modelList( `
					* 1. {style:circle}
					  * 1a. {style:square}
					  * 1b.
					  * [2.
					  * 3.]
					* 4.
				` ) );
			} );
		} );
	} );

	describe( 'listStyle (type attribute)', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, DocumentListPropertiesEditing, UndoEditing ],
				list: {
					properties: { styles: { useAttribute: true }, startIndex: false, reversed: false }
				}
			} );

			model = editor.model;

			stubUid();
		} );

		describe( 'command', () => {
			it( 'should register `listStyle` command with support for all style types except `decimal-leading-zero`', () => {
				const command = editor.commands.get( 'listStyle' );

				expect( command.isStyleTypeSupported( 'disc' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'circle' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'square' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'decimal' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'decimal-leading-zero' ) ).to.be.false;
				expect( command.isStyleTypeSupported( 'lower-roman' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'upper-roman' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'lower-alpha' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'upper-alpha' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'lower-latin' ) ).to.be.true;
				expect( command.isStyleTypeSupported( 'upper-latin' ) ).to.be.true;
			} );
		} );

		describe( 'conversion', () => {
			describe( 'upcast', () => {
				it( 'should upcast to `listStyle` property (bulleted, default)', () => {
					editor.setData( '<ul><li>Foo</li></ul>' );

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
						* Foo {id:a00} {style:default}
					` ) );
				} );

				it( 'should upcast to `listStyle` property (numbered, default)', () => {
					editor.setData( '<ol><li>Foo</li></ol>' );

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
						# Foo {id:a00} {style:default}
					` ) );
				} );

				it( 'should upcast to `listStyle` property (bulleted, listStyleType="circle")', () => {
					editor.setData( '<ul style="list-style-type:circle;"><li>Foo</li></ul>' );

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
						* Foo {id:a00} {style:circle}
					` ) );
				} );

				it( 'should upcast to `listStyle` property (numbered, listStyleType="decimal")', () => {
					editor.setData( '<ol style="list-style-type:decimal;"><li>Foo</li></ol>' );

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
						# Foo {id:a00} {style:decimal}
					` ) );
				} );

				it( 'should upcast to `listStyle` property (bulleted, type="square")', () => {
					editor.setData( '<ul type="square"><li>Foo</li></ul>' );

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
						* Foo {id:a00} {style:square}
					` ) );
				} );

				it( 'should upcast to `listStyle` property (numbered, type="A")', () => {
					editor.setData( '<ol type="A"><li>Foo</li></ol>' );

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
						# Foo {id:a00} {style:upper-latin}
					` ) );
				} );

				it( 'should upcast to `listStyle` property (bulleted, list-style-type="circle" type="square")', () => {
					editor.setData( '<ul style="list-style-type:circle;" type="circle"><li>Foo</li></ul>' );

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
						* Foo {id:a00} {style:circle}
					` ) );
				} );

				it( 'should upcast to `listStyle` property (numbered, list-style-type="decimal" type="A")', () => {
					editor.setData( '<ol type="A" style="list-style-type:decimal"><li>Foo</li></ol>' );

					expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
						# Foo {id:a00} {style:decimal}
					` ) );
				} );
			} );

			describe( 'downcast', () => {
				it( 'should downcast to `type` attribute (bulleted, default)', () => {
					setData( model, modelList( `
						* Foo {style:default}
					` ) );

					expect( editor.getData() ).to.equal( '<ul><li>Foo</li></ul>' );
				} );

				it( 'should downcast to `type` attribute (bulleted, circle)', () => {
					setData( model, modelList( `
						* Foo {style:circle}
					` ) );

					expect( editor.getData() ).to.equal( '<ul type="circle"><li>Foo</li></ul>' );
				} );

				it( 'should downcast to `type` attribute (numbered, default)', () => {
					setData( model, modelList( `
						# Foo {style:default}
					` ) );

					expect( editor.getData() ).to.equal( '<ol><li>Foo</li></ol>' );
				} );

				it( 'should downcast to `type` attribute (numbered, decimal)', () => {
					setData( model, modelList( `
						# Foo {style:decimal}
					` ) );

					expect( editor.getData() ).to.equal( '<ol type="1"><li>Foo</li></ol>' );
				} );

				it( 'should downcast to `type` attribute (numbered, decimal-leading-zero)', () => {
					setData( model, modelList( `
						# Foo {style:decimal-leading-zero}
					` ) );

					expect( editor.getData() ).to.equal( '<ol><li>Foo</li></ol>' );
				} );
			} );
		} );
	} );

	describe( 'listReversed', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, DocumentListPropertiesEditing, UndoEditing ],
				list: {
					properties: { styles: false, startIndex: false, reversed: true }
				}
			} );

			model = editor.model;
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'schema rules', () => {
			it( 'should not allow set `listStyle` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listStyle' ) ).to.be.false;
			} );

			it( 'should not allow set `listReversed` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listReversed' ) ).to.be.true;
			} );

			it( 'should allow set `listStart` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listStart' ) ).to.be.false;
			} );
		} );

		describe( 'post-fixer', () => {
			it( 'should ensure that all item in a single list have the same `listReversed` attribute', () => {
				setData( model, modelList( `
					# 1. {reversed:true}
					# 2.
					# 3. {reversed:false}
					# 4.
					  # 4.1. {reversed:false}
					  # 4.2. {reversed:true}
					  # 4.3. {reversed:false}
					    # 4.3.1. {reversed:true}
						# 4.3.2. {reversed:false}
					# 5. {reversed:true}
				` ) );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
					# 1. {reversed:true}
					# 2.
					# 3.
					# 4.
					  # 4.1. {reversed:false}
					  # 4.2.
					  # 4.3.
					    # 4.3.1. {reversed:true}
					    # 4.3.2.
					# 5.
				` ) );
			} );

			it( 'should ensure that all list item have the same `listReversed` after removing a block between them', () => {
				setData( model,
					'<paragraph listItemId="01" listReversed="true" listType="numbered">1.</paragraph>' +
					'<paragraph listItemId="02" listReversed="true" listType="numbered">2.</paragraph>' +
					'<paragraph>Foo</paragraph>' +
					'<paragraph listItemId="03" listReversed="false" listType="numbered">3.</paragraph>' +
					'<paragraph listItemId="04" listReversed="false" listType="numbered">4.</paragraph>'
				);

				model.change( writer => {
					writer.remove( model.document.getRoot().getChild( 2 ) );
				} );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listItemId="01" listReversed="true" listType="numbered">1.</paragraph>' +
					'<paragraph listItemId="02" listReversed="true" listType="numbered">2.</paragraph>' +
					'<paragraph listItemId="03" listReversed="true" listType="numbered">3.</paragraph>' +
					'<paragraph listItemId="04" listReversed="true" listType="numbered">4.</paragraph>'
				);
			} );

			it( 'should restore `listReversed` attribute after it\'s changed in one of the following items', () => {
				setData( model, modelList( `
					# 1. {reversed:true}
					# 2.
					# 3.
				` ) );

				model.change( writer => {
					writer.setAttribute( 'listReversed', false, model.document.getRoot().getChild( 2 ) );
				} );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
					# 1. {reversed:true}
					# 2.
					# 3.
				` ) );
			} );

			it( 'should change `listReversed` attribute for all the following items after the first one is changed', () => {
				setData( model, modelList( `
					# 1. {reversed:false}
					# 2.
					# 3.
				` ) );

				model.change( writer => {
					writer.setAttribute( 'listReversed', true, model.document.getRoot().getChild( 0 ) );
				} );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
					# 1. {reversed:true}
					# 2.
					# 3.
				` ) );
			} );
		} );

		describe( 'indenting lists', () => {
			it( 'should reset `listReversed` attribute after indenting a single item', () => {
				setData( model, modelList( `
					# 1. {reversed:true}
					  # 1a. {reversed:true}
					# 2.
					# 3.[]
					# 4.
				` ) );

				editor.execute( 'indentList' );

				expect( getData( model ) ).to.equalMarkup( modelList( `
					# 1. {reversed:true}
					  # 1a. {reversed:true}
					# 2.
					  # 3.[] {reversed:false}
					# 4.
				` ) );
			} );

			it( 'should reset `listReversed` attribute after indenting a few items', () => {
				setData( model, modelList( `
					# 1. {reversed:true}
					# [2.
					# 3.]
				` ) );

				editor.execute( 'indentList' );

				expect( getData( model ) ).to.equalMarkup( modelList( `
					# 1. {reversed:true}
					  # [2. {reversed:false}
					  # 3.]
				` ) );
			} );

			it( 'should copy `listReversed` attribute after indenting a single item into previously nested list', () => {
				setData( model, modelList( `
					# 1. {reversed:false}
					  # 1a. {reversed:true}
					  # 1b.
					# 2.[]
					# 3.
				` ) );

				editor.execute( 'indentList' );

				expect( getData( model ) ).to.equalMarkup( modelList( `
					# 1. {reversed:false}
					  # 1a. {reversed:true}
					  # 1b.
					  # 2.[]
					# 3.
				` ) );
			} );

			it( 'should copy `listReversed` attribute after indenting a few items into previously nested list', () => {
				setData( model, modelList( `
					# 1. {reversed:false}
					  # 1a. {reversed:true}
					  # 1b.
					# [2.
					# 3.]
					# 4.
				` ) );

				editor.execute( 'indentList' );

				expect( getData( model ) ).to.equalMarkup( modelList( `
					# 1. {reversed:false}
					  # 1a. {reversed:true}
					  # 1b.
					  # [2.
					  # 3.]
					# 4.
				` ) );
			} );

			it( 'should not do anything with bulleted lists', () => {
				setData( model, modelList( `
					* 1.
					* 2.[]
				` ) );

				editor.execute( 'indentList' );

				expect( getData( model ) ).to.equalMarkup( modelList( `
					* 1.
					  * 2.[]
				` ) );
			} );
		} );
	} );

	describe( 'listStart', () => {
		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, DocumentListPropertiesEditing, UndoEditing ],
				list: {
					properties: { styles: false, startIndex: true, reversed: false }
				}
			} );

			model = editor.model;
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		describe( 'schema rules', () => {
			it( 'should allow set `listStyle` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listStyle' ) ).to.be.false;
			} );

			it( 'should not allow set `listReversed` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listReversed' ) ).to.be.false;
			} );

			it( 'should not allow set `listStart` on the `paragraph`', () => {
				expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listStart' ) ).to.be.true;
			} );
		} );

		describe( 'post-fixer', () => {
			it( 'should ensure that all item in a single list have the same `listStart` attribute', () => {
				setData( model, modelList( `
					# 1. {start:2}
					# 2.
					# 3. {start:5}
					# 4.
					  # 4.1. {start:3}
					  # 4.2. {start:7}
					  # 4.3. {start:1}
					    # 4.3.1. {start:42}
					    # 4.3.2. {start:1}
					# 5. {start:8}
				` ) );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
					# 1. {start:2}
					# 2.
					# 3.
					# 4.
					  # 4.1. {start:3}
					  # 4.2.
					  # 4.3.
					    # 4.3.1. {start:42}
					    # 4.3.2.
					# 5.
				` ) );
			} );

			it( 'should ensure that all list item have the same `listStart` after removing a block between them', () => {
				setData( model,
					'<paragraph listItemId="01" listStart="2" listType="numbered">1.</paragraph>' +
					'<paragraph listItemId="02" listStart="2" listType="numbered">2.</paragraph>' +
					'<paragraph>Foo</paragraph>' +
					'<paragraph listItemId="03" listStart="7" listType="numbered">3.</paragraph>' +
					'<paragraph listItemId="04" listStart="7" listType="numbered">4.</paragraph>'
				);

				model.change( writer => {
					writer.remove( model.document.getRoot().getChild( 2 ) );
				} );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup(
					'<paragraph listItemId="01" listStart="2" listType="numbered">1.</paragraph>' +
					'<paragraph listItemId="02" listStart="2" listType="numbered">2.</paragraph>' +
					'<paragraph listItemId="03" listStart="2" listType="numbered">3.</paragraph>' +
					'<paragraph listItemId="04" listStart="2" listType="numbered">4.</paragraph>'
				);
			} );

			it( 'should restore `listStart` attribute after it\'s changed in one of the following items', () => {
				setData( model, modelList( `
					# 1. {start:2}
					# 2.
					# 3.
				` ) );

				model.change( writer => {
					writer.setAttribute( 'listStart', 5, model.document.getRoot().getChild( 2 ) );
				} );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
					# 1. {start:2}
					# 2.
					# 3.
				` ) );
			} );

			it( 'should change `listStart` attribute for all the following items after the first one is changed', () => {
				setData( model, modelList( `
					# 1. {start:2}
					# 2.
					# 3.
				` ) );

				model.change( writer => {
					writer.setAttribute( 'listStart', 5, model.document.getRoot().getChild( 0 ) );
				} );

				expect( getData( model, { withoutSelection: true } ) ).to.equalMarkup( modelList( `
					# 1. {start:5}
					# 2.
					# 3.
				` ) );
			} );
		} );

		describe( 'indenting lists', () => {
			it( 'should reset `listStart` attribute after indenting a single item', () => {
				setData( model, modelList( `
					# 1. {start:5}
					  # 1a. {start:3}
					# 2.
					# 3.[]
					# 4.
				` ) );

				editor.execute( 'indentList' );

				expect( getData( model ) ).to.equalMarkup( modelList( `
					# 1. {start:5}
					  # 1a. {start:3}
					# 2.
					  # 3.[] {start:1}
					# 4.
				` ) );
			} );

			it( 'should reset `listStart` attribute after indenting a few items', () => {
				setData( model, modelList( `
					# 1. {start:2}
					# [2.
					# 3.]
				` ) );

				editor.execute( 'indentList' );

				expect( getData( model ) ).to.equalMarkup( modelList( `
					# 1. {start:2}
					  # [2. {start:1}
					  # 3.]
				` ) );
			} );

			it( 'should copy `listStart` attribute after indenting a single item into previously nested list', () => {
				setData( model, modelList( `
					# 1. {start:3}
					  # 1a. {start:7}
					  # 1b.
					# 2.[]
					# 3.
				` ) );

				editor.execute( 'indentList' );

				expect( getData( model ) ).to.equalMarkup( modelList( `
					# 1. {start:3}
					  # 1a. {start:7}
					  # 1b.
					  # 2.[]
					# 3.
				` ) );
			} );

			it( 'should copy `listStart` attribute after indenting a few items into previously nested list', () => {
				setData( model, modelList( `
					# 1. {start:42}
					  # 1a. {start:2}
					  # 1b.
					# [2.
					# 3.]
					# 4.
				` ) );

				editor.execute( 'indentList' );

				expect( getData( model ) ).to.equalMarkup( modelList( `
					# 1. {start:42}
					  # 1a. {start:2}
					  # 1b.
					  # [2.
					  # 3.]
					# 4.
				` ) );
			} );

			it( 'should not do anything with bulleted lists', () => {
				setData( model, modelList( `
					* 1.
					* 2.[]
				` ) );

				editor.execute( 'indentList' );

				expect( getData( model ) ).to.equalMarkup( modelList( `
					* 1.
					  * 2.[]
				` ) );
			} );
		} );
	} );
} );
