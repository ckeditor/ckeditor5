/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ListEditing from '../../src/list/listediting.js';

import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import IndentEditing from '@ckeditor/ckeditor5-indent/src/indentediting.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import AlignmentEditing from '@ckeditor/ckeditor5-alignment/src/alignmentediting.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { getData as getModelData, setData as setModelData, parse as parseModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import ListIndentCommand from '../../src/list/listindentcommand.js';
import ListSplitCommand from '../../src/list/listsplitcommand.js';

import stubUid from './_utils/uid.js';
import { prepareTest } from './_utils/utils.js';

describe( 'ListEditing (multiBlock=false)', () => {
	let editor, model, view;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			list: {
				multiBlock: false
			},
			plugins: [ Paragraph, ClipboardPipeline, BoldEditing, ListEditing, UndoEditing,
				BlockQuoteEditing, TableEditing, HeadingEditing, AlignmentEditing ]
		} );

		model = editor.model;
		view = editor.editing.view;

		model.schema.extend( 'paragraph', {
			allowAttributes: 'foo'
		} );

		// Stub `view.scrollToTheSelection` as it will fail on VirtualTestEditor without DOM.
		sinon.stub( view, 'scrollToTheSelection' ).callsFake( () => {} );
		stubUid();
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listItemId' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listIndent' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listType' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listItemId' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listIndent' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'paragraph' ], 'listType' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'heading1' ], 'listItemId' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'heading1' ], 'listIndent' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'heading1' ], 'listType' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'blockQuote' ], 'listItemId' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'blockQuote' ], 'listIndent' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'blockQuote' ], 'listType' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'listItemId' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'listIndent' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'listType' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'listItemId' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'listIndent' ) ).to.be.false;
		expect( model.schema.checkAttribute( [ '$root', 'tableCell' ], 'listType' ) ).to.be.false;
	} );

	describe( 'commands', () => {
		it( 'should register indent list command', () => {
			const command = editor.commands.get( 'indentList' );

			expect( command ).to.be.instanceOf( ListIndentCommand );
		} );

		it( 'should register outdent list command', () => {
			const command = editor.commands.get( 'outdentList' );

			expect( command ).to.be.instanceOf( ListIndentCommand );
		} );

		it( 'should register the splitListItemBefore command', () => {
			const command = editor.commands.get( 'splitListItemBefore' );

			expect( command ).to.be.instanceOf( ListSplitCommand );
		} );

		it( 'should register the splitListItemAfter command', () => {
			const command = editor.commands.get( 'splitListItemAfter' );

			expect( command ).to.be.instanceOf( ListSplitCommand );
		} );

		it( 'should add indent list command to indent command', async () => {
			const editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, IndentEditing, ListEditing ]
			} );

			const indentListCommand = editor.commands.get( 'indentList' );
			const indentCommand = editor.commands.get( 'indent' );

			const spy = sinon.stub( indentListCommand, 'execute' );

			indentListCommand.isEnabled = true;
			indentCommand.execute();

			sinon.assert.calledOnce( spy );

			await editor.destroy();
		} );

		it( 'should add outdent list command to outdent command', async () => {
			const editor = await VirtualTestEditor.create( {
				plugins: [ Paragraph, IndentEditing, ListEditing ]
			} );

			const outdentListCommand = editor.commands.get( 'outdentList' );
			const outdentCommand = editor.commands.get( 'outdent' );

			const spy = sinon.stub( outdentListCommand, 'execute' );

			outdentListCommand.isEnabled = true;
			outdentCommand.execute();

			sinon.assert.calledOnce( spy );

			await editor.destroy();
		} );
	} );

	describe( 'post fixer', () => {
		describe( 'insert', () => {
			function testList( input, inserted, output ) {
				const selection = prepareTest( model, input );

				model.change( () => {
					model.change( writer => {
						writer.insert( parseModel( inserted, model.schema ), selection.getFirstPosition() );
					} );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( output );
			}

			it( 'should make sure that all list items have a unique IDs (insert after)', () => {
				testList(
					'<listItem listIndent="0" listItemId="a" listType="bulleted">a</listItem>' +
					'[]',

					'<listItem listIndent="0" listItemId="a" listType="bulleted">x</listItem>',

					'<listItem listIndent="0" listItemId="a" listType="bulleted">a</listItem>' +
					'<listItem listIndent="0" listItemId="a00" listType="bulleted">x</listItem>'
				);
			} );

			it( 'should make sure that all list items have a unique IDs (insert before)', () => {
				testList(
					'[]' +
					'<listItem listIndent="0" listItemId="a" listType="bulleted">a</listItem>',

					'<listItem listIndent="0" listItemId="a" listType="bulleted">x</listItem>',

					'<listItem listIndent="0" listItemId="a" listType="bulleted">x</listItem>' +
					'<listItem listIndent="0" listItemId="a00" listType="bulleted">a</listItem>'
				);
			} );
		} );

		describe( 'rename', () => {
			it( 'to element that does not allow list attributes', () => {
				const modelBefore =
					'<listItem listIndent="0" listItemId="a" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listItemId="b" listType="bulleted">b</listItem>' +
					'[<listItem listIndent="2" listItemId="c" listType="bulleted" foo="123">c</listItem>]' +
					'<listItem listIndent="2" listItemId="d" listType="bulleted">d</listItem>' +
					'<listItem listIndent="3" listItemId="e" listType="bulleted">e</listItem>' +
					'<listItem listIndent="1" listItemId="f" listType="bulleted">f</listItem>' +
					'<listItem listIndent="2" listItemId="g" listType="bulleted">g</listItem>' +
					'<listItem listIndent="1" listItemId="h" listType="bulleted">h</listItem>' +
					'<listItem listIndent="2" listItemId="i" listType="bulleted">i</listItem>';

				const expectedModel =
					'<listItem listIndent="0" listItemId="a" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listItemId="b" listType="bulleted">b</listItem>' +
					'<paragraph foo="123">c</paragraph>' +
					'<listItem listIndent="0" listItemId="d" listType="bulleted">d</listItem>' +
					'<listItem listIndent="1" listItemId="e" listType="bulleted">e</listItem>' +
					'<listItem listIndent="0" listItemId="f" listType="bulleted">f</listItem>' +
					'<listItem listIndent="1" listItemId="g" listType="bulleted">g</listItem>' +
					'<listItem listIndent="0" listItemId="h" listType="bulleted">h</listItem>' +
					'<listItem listIndent="1" listItemId="i" listType="bulleted">i</listItem>';

				const selection = prepareTest( model, modelBefore );

				model.change( writer => {
					writer.rename( selection.getFirstPosition().nodeAfter, 'paragraph' );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( expectedModel );
			} );
		} );

		describe( 'changing list attributes', () => {
			it( 'remove list attributes', () => {
				const modelBefore =
					'<listItem listIndent="0" listItemId="a" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listItemId="b" listType="bulleted">b</listItem>' +
					'[<listItem listIndent="2" listItemId="c" listType="bulleted">c</listItem>]' +
					'<listItem listIndent="2" listItemId="d" listType="bulleted">d</listItem>' +
					'<listItem listIndent="3" listItemId="e" listType="bulleted">e</listItem>' +
					'<listItem listIndent="1" listItemId="f" listType="bulleted">f</listItem>' +
					'<listItem listIndent="2" listItemId="g" listType="bulleted">g</listItem>' +
					'<listItem listIndent="1" listItemId="h" listType="bulleted">h</listItem>' +
					'<listItem listIndent="2" listItemId="i" listType="bulleted">i</listItem>';

				const expectedModel =
					'<listItem listIndent="0" listItemId="a" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listItemId="b" listType="bulleted">b</listItem>' +
					'<paragraph>c</paragraph>' +
					'<listItem listIndent="0" listItemId="d" listType="bulleted">d</listItem>' +
					'<listItem listIndent="1" listItemId="e" listType="bulleted">e</listItem>' +
					'<listItem listIndent="0" listItemId="f" listType="bulleted">f</listItem>' +
					'<listItem listIndent="1" listItemId="g" listType="bulleted">g</listItem>' +
					'<listItem listIndent="0" listItemId="h" listType="bulleted">h</listItem>' +
					'<listItem listIndent="1" listItemId="i" listType="bulleted">i</listItem>';

				const selection = prepareTest( model, modelBefore );
				const element = selection.getFirstPosition().nodeAfter;

				model.change( writer => {
					writer.removeAttribute( 'listItemId', element );
					writer.removeAttribute( 'listIndent', element );
					writer.removeAttribute( 'listType', element );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( expectedModel );
			} );

			it( 'add list attributes', () => {
				const modelBefore =
					'<listItem listIndent="0" listItemId="a" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listItemId="b" listType="bulleted">b</listItem>' +
					'[<paragraph>c</paragraph>]' +
					'<listItem listIndent="0" listItemId="d" listType="bulleted">d</listItem>' +
					'<listItem listIndent="1" listItemId="e" listType="bulleted">e</listItem>' +
					'<listItem listIndent="2" listItemId="f" listType="bulleted">f</listItem>' +
					'<listItem listIndent="1" listItemId="g" listType="bulleted">g</listItem>';

				const expectedModel =
					'<listItem listIndent="0" listItemId="a" listType="bulleted">a</listItem>' +
					'<listItem listIndent="1" listItemId="b" listType="bulleted">b</listItem>' +
					'<listItem listIndent="2" listItemId="c" listType="bulleted">c</listItem>' +
					'<listItem listIndent="2" listItemId="d" listType="bulleted">d</listItem>' +
					'<listItem listIndent="1" listItemId="e" listType="bulleted">e</listItem>' +
					'<listItem listIndent="2" listItemId="f" listType="bulleted">f</listItem>' +
					'<listItem listIndent="1" listItemId="g" listType="bulleted">g</listItem>';

				const selection = prepareTest( model, modelBefore );
				const element = selection.getFirstPosition().nodeAfter;

				model.change( writer => {
					writer.setAttribute( 'listItemId', 'c', element );
					writer.setAttribute( 'listIndent', 2, element );
					writer.setAttribute( 'listType', 'bulleted', element );
					writer.setAttribute( 'listIndent', 2, element.nextSibling );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup( expectedModel );
			} );
		} );
	} );

	describe( 'upcast', () => {
		it( 'should split multi block to a separate list items', () => {
			editor.setData(
				'<ul>' +
					'<li>' +
						'<p>foo</p>' +
						'<p>bar</p>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a00" listType="bulleted">foo</listItem>' +
				'<listItem listIndent="0" listItemId="a01" listType="bulleted">bar</listItem>'
			);
		} );

		it( 'should split multi block nested list to a separate list items', () => {
			editor.setData(
				'<ul>' +
					'<li>' +
						'<ul>' +
							'<li>' +
								'<p>foo</p>' +
								'<p>bar</p>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a01" listType="bulleted"></listItem>' +
				'<listItem listIndent="1" listItemId="a00" listType="bulleted">foo</listItem>' +
				'<listItem listIndent="1" listItemId="a02" listType="bulleted">bar</listItem>'
			);
		} );

		it( 'should split multi block nested block to a separate list items', () => {
			editor.setData(
				'<ul>' +
					'<li>' +
						'<p>foo</p>' +
						'<ul>' +
							'<li>' +
								'<p>a</p>' +
								'<p>b</p>' +
							'</li>' +
						'</ul>' +
						'<p>bar</p>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="a01" listType="bulleted">foo</listItem>' +
				'<listItem listIndent="1" listItemId="a00" listType="bulleted">a</listItem>' +
				'<listItem listIndent="1" listItemId="a02" listType="bulleted">b</listItem>' +
				'<listItem listIndent="0" listItemId="a03" listType="bulleted">bar</listItem>'
			);
		} );

		it( 'should upcast `data-list-item-id` attribute as listItemId', () => {
			editor.setData(
				'<ul>' +
					'<li data-list-item-id="c">' +
						'<p>foo</p>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="c" listType="bulleted">foo</listItem>'
			);
		} );

		it( 'should consume `data-list-item-id` attribute', () => {
			editor.conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on(
					'element:li', ( evt, data, conversionApi ) => {
						const viewElement = data.viewItem;
						const attributeName = 'secondListItemId';

						if ( !data.modelRange ) {
							Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
						}

						if ( conversionApi.consumable.test( viewElement, { attributes: 'data-list-item-id' } ) ) {
							for ( const item of data.modelRange.getItems( { shallow: true } ) ) {
								conversionApi.writer.setAttribute( attributeName, viewElement.getAttribute( 'data-list-item-id' ), item );
							}
						}
					}, { priority: 'low' }
				);
			} );

			editor.setData(
				'<ul>' +
					'<li data-list-item-id="c">' +
						'<p>foo</p>' +
					'</li>' +
				'</ul>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<listItem listIndent="0" listItemId="c" listType="bulleted">foo</listItem>'
			);
		} );
	} );

	describe( 'downcast - editing', () => {
		it( 'should use bogus paragraph', () => {
			setModelData( model,
				'<listItem listIndent="0" listItemId="a" listType="bulleted">foo</listItem>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li><span class="ck-list-bogus-paragraph">foo</span></li>' +
				'</ul>'
			);
		} );

		it( 'should use paragraph if there are any non-list attributes on the block', () => {
			setModelData( model,
				'<listItem listIndent="0" listItemId="a" listType="bulleted" alignment="center">foo</listItem>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li><p style="text-align:center">foo</p></li>' +
				'</ul>'
			);
		} );

		it( 'should refresh item after adding non-list attribute', () => {
			setModelData( model,
				'<listItem listIndent="0" listItemId="a" listType="bulleted">foo</listItem>'
			);

			editor.execute( 'alignment', { value: 'center' } );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li><p style="text-align:center">foo</p></li>' +
				'</ul>'
			);
		} );

		it( 'should refresh item after removing non-list attribute', () => {
			setModelData( model,
				'<listItem listIndent="0" listItemId="a" listType="bulleted" alignment="center">foo</listItem>'
			);

			editor.execute( 'alignment', { value: 'left' } );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li><span class="ck-list-bogus-paragraph">foo</span></li>' +
				'</ul>'
			);
		} );

		it( 'should add `data-list-item-id` attribute', () => {
			setModelData( model,
				'<listItem listIndent="0" listItemId="a" listType="bulleted" alignment="center">foo</listItem>'
			);

			editor.execute( 'alignment', { value: 'left' } );

			expect( getViewData( view, { withoutSelection: true, skipListItemIds: false } ) ).to.equalMarkup(
				'<ul>' +
					'<li data-list-item-id="a"><span class="ck-list-bogus-paragraph">foo</span></li>' +
				'</ul>'
			);
		} );
	} );

	describe( 'downcast - data', () => {
		it( 'should add `data-list-item-id` attribute', () => {
			setModelData( model,
				'<listItem listIndent="0" listItemId="a" listType="bulleted" alignment="center">foo</listItem>'
			);

			editor.execute( 'alignment', { value: 'left' } );

			expect( editor.getData() ).to.equalMarkup(
				'<ul>' +
					'<li data-list-item-id="a">foo</li>' +
				'</ul>'
			);
		} );

		it( 'should not add `data-list-item-id` attribute if `skipListItemIds` flag was used', () => {
			setModelData( model,
				'<listItem listIndent="0" listItemId="a" listType="bulleted" alignment="center">foo</listItem>'
			);

			editor.execute( 'alignment', { value: 'left' } );

			expect( editor.getData( { skipListItemIds: true } ) ).to.equalMarkup(
				'<ul>' +
					'<li>foo</li>' +
				'</ul>'
			);
		} );
	} );
} );
