/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ListEditing from '../../src/list/listediting.js';

import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range.js';

import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import IndentEditing from '@ckeditor/ckeditor5-indent/src/indentediting.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import AlignmentEditing from '@ckeditor/ckeditor5-alignment/src/alignmentediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { getData as getModelData, parse as parseModel, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import stubUid from './_utils/uid.js';

describe( 'ListEditing - converters', () => {
	let editor, model, modelDoc, modelRoot, view, viewDoc, viewRoot;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, IndentEditing, ClipboardPipeline, BoldEditing, ListEditing, UndoEditing,
				BlockQuoteEditing, TableEditing, HeadingEditing, AlignmentEditing ]
		} );

		model = editor.model;
		modelDoc = model.document;
		modelRoot = modelDoc.getRoot();

		view = editor.editing.view;
		viewDoc = view.document;
		viewRoot = viewDoc.getRoot();

		model.schema.register( 'foo', {
			allowWhere: '$block',
			allowAttributesOf: '$container',
			isBlock: true,
			isObject: true
		} );

		// Stub `view.scrollToTheSelection` as it will fail on VirtualTestEditor without DOM.
		sinon.stub( view, 'scrollToTheSelection' ).callsFake( () => {} );
		stubUid();
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'position mapping', () => {
		describe( 'flat lists', () => {
			let mapper;

			beforeEach( () => {
				mapper = editor.editing.mapper;

				editor.setData(
					'<p>a</p>' +
					'<ul>' +
						'<li><p>b</p></li>' +
						'<li><p>c</p></li>' +
						'<li><p>d</p></li>' +
					'</ul>' +
					'<p>e</p>' +
					'<ol>' +
						'<li><p>f</p></li>' +
					'</ol>' +
					'<p>g</p>'
				);
			} );

			/*
				<paragraph>a</paragraph>
				<paragraph listIndent=0 listType="bulleted">b</paragraph>
				<paragraph listIndent=0 listType="bulleted">c</paragraph>
				<paragraph listIndent=0 listType="bulleted">d</paragraph>
				<paragraph>e</paragraph>
				<paragraph listIndent=0 listType="numbered">f</paragraph>
				<paragraph>g</paragraph>
			 */

			describe( 'view to model', () => {
				function testList( viewPath, modelPath ) {
					const viewPos = getViewPosition( viewRoot, viewPath, view );
					const modelPos = mapper.toModelPosition( viewPos );

					expect( modelPos.root ).to.equal( modelRoot );
					expect( modelPos.path ).to.deep.equal( modelPath );
				}

				it( 'before ul --> before first list item', () => {
					testList( [ 1 ], [ 1 ] );
				} );

				it( 'before first li --> before first list item', () => {
					testList( [ 1, 0 ],	[ 1 ] );
				} );

				it( 'beginning of li --> before first list item', () => {
					testList( [ 1, 0, 0 ], [ 1 ] );
				} );

				it( 'end of li --> after first list item', () => {
					testList( [ 1, 0, 1 ], [ 2 ] );
				} );

				it( 'beginning of p in li --> beginning of first list item paragraph', () => {
					testList( [ 1, 0, 0, 0 ], [ 1, 0 ] );
				} );

				it( 'end of p in li --> end of first list item paragraph', () => {
					testList( [ 1, 0, 0, 1 ], [ 1, 1 ] );
				} );

				it( 'before middle li --> before middle list item', () => {
					testList( [ 1, 1 ], [ 2 ] );
				} );

				it( 'before last li --> before last list item', () => {
					testList( [ 1, 2 ], [ 3 ] );
				} );

				it( 'after last li --> after last list item / before paragraph', () => {
					testList( [ 1, 3 ], [ 4 ] );
				} );

				it( 'after ul --> after last list item / before paragraph', () => {
					testList( [ 2 ], [ 4 ] );
				} );

				it( 'before ol --> before numbered list item', () => {
					testList( [ 3 ], [ 5 ] );
				} );

				it( 'before only li --> before numbered list item', () => {
					testList( [ 3, 0 ], [ 5 ] );
				} );

				it( 'after only li --> after numbered list item', () => {
					testList( [ 3, 1 ], [ 6 ] );
				} );

				it( 'after ol --> after numbered list item', () => {
					testList( [ 4 ], [ 6 ] );
				} );
			} );

			describe( 'model to view', () => {
				function testList( modelPath, viewPath ) {
					const modelPos = model.createPositionFromPath( modelRoot, modelPath );
					const viewPos = mapper.toViewPosition( modelPos );

					expect( viewPos.root ).to.equal( viewRoot );
					expect( getViewPath( viewPos ) ).to.deep.equal( viewPath );
				}

				it( 'before first list item --> before ul', () => {
					testList( [ 1 ], [ 1 ] );
				} );

				it( 'beginning of first list item --> beginning of `b` text node', () => {
					testList( [ 1, 0 ], [ 1, 0, 0, 0, 0 ] );
				} );

				it( 'end of first list item --> end of `b` text node', () => {
					testList( [ 1, 1 ], [ 1, 0, 0, 0, 1 ] );
				} );

				it( 'before middle list item --> before middle li', () => {
					testList( [ 2 ], [ 1, 1 ] );
				} );

				it( 'before last list item --> before last li', () => {
					testList( [ 3 ], [ 1, 2 ] );
				} );

				it( 'after last list item --> after ul', () => {
					testList( [ 4 ], [ 2 ] );
				} );

				it( 'before numbered list item --> before ol', () => {
					testList( [ 5 ], [ 3 ] );
				} );

				it( 'after numbered list item --> after ol', () => {
					testList( [ 6 ], [ 4 ] );
				} );
			} );
		} );

		describe( 'nested lists', () => {
			let mapper;

			beforeEach( () => {
				mapper = editor.editing.mapper;

				editor.setData(
					'<ul>' +
						'<li><p>a</p></li>' +
						'<li>' +
							'<p>bbb</p>' +
							'<ol>' +
								'<li><p>c</p></li>' +
								'<li><p>d</p></li>' +
								'<li><p>e</p></li>' +
								'<li>' +
									'<p></p>' +
									'<ul>' +
										'<li><p>g</p></li>' +
										'<li><p>h</p></li>' +
										'<li><p>i</p></li>' +
									'</ul>' +
								'</li>' +
								'<li><p>j</p></li>' +
							'</ol>' +
						'</li>' +
						'<li><p>k</p></li>' +
					'</ul>'
				);
			} );

			/*
				<paragraph listIndent=0 listType="bulleted">a</paragraph>
				<paragraph listIndent=0 listType="bulleted">bbb</paragraph>
				<paragraph listIndent=1 listType="numbered">c</paragraph>
				<paragraph listIndent=1 listType="numbered">d</paragraph>
				<paragraph listIndent=1 listType="numbered">e</paragraph>
				<paragraph listIndent=1 listType="numbered"></paragraph>
				<paragraph listIndent=2 listType="bulleted">g</paragraph>
				<paragraph listIndent=2 listType="bulleted">h</paragraph>
				<paragraph listIndent=2 listType="bullered">i</paragraph>
				<paragraph listIndent=1 listType="numbered">j</paragraph>
				<paragraph listIndent=0 listType="bulleted">k</paragraph>
			 */

			describe( 'view to model', () => {
				function testList( viewPath, modelPath ) {
					const viewPos = getViewPosition( viewRoot, viewPath, view );
					const modelPos = mapper.toModelPosition( viewPos );

					expect( modelPos.root ).to.equal( modelRoot );
					expect( modelPos.path ).to.deep.equal( modelPath );
				}

				it( 'before ul#1 --> before listItem "a"', () => {
					testList( [ 0 ], [ 0 ] );
				} );

				it( 'before li "a" --> before listItem "a"', () => {
					testList( [ 0, 0 ], [ 0 ] );
				} );

				it( 'before "a" paragraph --> beginning of listItem "a"', () => {
					testList( [ 0, 0, 0 ], [ 0 ] );
				} );

				it( 'before "a" --> beginning of listItem "a"', () => {
					testList( [ 0, 0, 0, 0 ], [ 0, 0 ] );
				} );

				it( 'after "a" --> end of listItem "a"', () => {
					testList( [ 0, 0, 0, 1 ], [ 0, 1 ] );
				} );

				it( 'after "a" paragraph --> end of listItem "a"', () => {
					testList( [ 0, 0, 1 ], [ 1 ] );
				} );

				it( 'before li "bbb" --> before listItem "bbb"', () => {
					testList( [ 0, 1 ], [ 1 ] );
				} );

				it( 'before "bbb" paragraph --> beginning of listItem "bbb"', () => {
					testList( [ 0, 1, 0 ], [ 1 ] );
				} );

				it( 'before "bbb" --> beginning of listItem "bbb"', () => {
					testList( [ 0, 1, 0, 0 ], [ 1, 0 ] );
				} );

				it( 'after "bbb" --> end of listItem "bbb"', () => {
					testList( [ 0, 1, 0, 1 ], [ 1, 3 ] );
				} );

				it( 'after "bbb" paragraph --> end of listItem "bbb"', () => {
					testList( [ 0, 1, 1 ], [ 2 ] );
				} );

				it( 'before li "c" --> before listItem "c"', () => {
					testList( [ 0, 1, 1, 0 ], [ 2 ] );
				} );

				it( 'before "c" paragraph --> beginning of listItem "c"', () => {
					testList( [ 0, 1, 1, 0, 0 ], [ 2 ] );
				} );

				it( 'before "c" --> beginning of listItem "c"', () => {
					testList( [ 0, 1, 1, 0, 0, 0 ], [ 2, 0 ] );
				} );

				it( 'after "c" --> end of listItem "c"', () => {
					testList( [ 0, 1, 1, 0, 0, 1 ], [ 2, 1 ] );
				} );

				it( 'after "c" paragraph --> end of listItem "c"', () => {
					testList( [ 0, 1, 1, 0, 1 ], [ 3 ] );
				} );

				it( 'before li "d" --> before listItem "d"', () => {
					testList( [ 0, 1, 1, 1 ], [ 3 ] );
				} );

				it( 'before li "e" --> before listItem "e"', () => {
					testList( [ 0, 1, 1, 2 ], [ 4 ] );
				} );

				it( 'before "empty" li --> before "empty" listItem', () => {
					testList( [ 0, 1, 1, 3 ], [ 5 ] );
				} );

				it( 'before ul#2 --> inside "empty" listItem', () => {
					testList( [ 0, 1, 1, 3, 0, 0 ], [ 5, 0 ] );
				} );

				it( 'before li "g" --> before listItem "g"', () => {
					testList( [ 0, 1, 1, 3, 1, 0, 0 ], [ 6 ] );
				} );

				it( 'before li "h" --> before listItem "h"', () => {
					testList( [ 0, 1, 1, 3, 1, 1 ], [ 7 ] );
				} );

				it( 'before li "i" --> before listItem "i"', () => {
					testList( [ 0, 1, 1, 3, 1, 2 ], [ 8 ] );
				} );

				it( 'after li "i" --> before listItem "j"', () => {
					testList( [ 0, 1, 1, 3, 1, 3 ], [ 9 ] );
				} );

				it( 'after ul#2 --> before listItem "j"', () => {
					testList( [ 0, 1, 1, 3, 2 ], [ 9 ] );
				} );

				it( 'before li "j" --> before listItem "j"', () => {
					testList( [ 0, 1, 1, 4 ], [ 9 ] );
				} );

				it( 'after li "j" --> before listItem "k"', () => {
					testList( [ 0, 1, 1, 5 ], [ 10 ] );
				} );

				it( 'end of li "bbb" --> before listItem "k"', () => {
					testList( [ 0, 1, 2 ], [ 10 ] );
				} );

				it( 'before li "k" --> before listItem "k"', () => {
					testList( [ 0, 2 ], [ 10 ] );
				} );

				it( 'after li "k" --> after listItem "k"', () => {
					testList( [ 0, 3 ], [ 11 ] );
				} );

				it( 'after ul --> after listItem "k"', () => {
					testList( [ 1 ], [ 11 ] );
				} );
			} );

			describe( 'model to view', () => {
				function testList( modelPath, viewPath ) {
					const modelPos = model.createPositionFromPath( modelRoot, modelPath );
					const viewPos = mapper.toViewPosition( modelPos );

					expect( viewPos.root ).to.equal( viewRoot );
					expect( getViewPath( viewPos ) ).to.deep.equal( viewPath );
				}

				it( 'before listItem "a" --> before ul', () => {
					testList( [ 0 ], [ 0 ] );
				} );

				it( 'beginning of listItem "a" --> beginning of "a" text node', () => {
					testList( [ 0, 0 ], [ 0, 0, 0, 0, 0 ] );
				} );

				it( 'end of listItem "a" --> end of "a" text node', () => {
					testList( [ 0, 1 ], [ 0, 0, 0, 0, 1 ] );
				} );

				it( 'before listItem "bbb" --> before li "bbb"', () => {
					testList( [ 1 ], [ 0, 1 ] );
				} );

				it( 'beginning of listItem "bbb" --> beginning of "bbb" text node', () => {
					testList( [ 1, 0 ], [ 0, 1, 0, 0, 0 ] );
				} );

				it( 'end of listItem "bbb" --> end of "bbb" text node', () => {
					testList( [ 1, 3 ], [ 0, 1, 0, 0, 3 ] );
				} );

				it( 'before listItem "c" --> before li "c"', () => {
					testList( [ 2 ], [ 0, 1, 1 ] );
				} );

				it( 'beginning of listItem "c" --> beginning of "c" text node', () => {
					testList( [ 2, 0 ], [ 0, 1, 1, 0, 0, 0, 0 ] );
				} );

				it( 'end of listItem "c" --> end of "c" text node', () => {
					testList( [ 2, 1 ], [ 0, 1, 1, 0, 0, 0, 1 ] );
				} );

				it( 'before listItem "d" --> before li "d"', () => {
					testList( [ 3 ], [ 0, 1, 1, 1 ] );
				} );

				it( 'before listItem "e" --> before li "e"', () => {
					testList( [ 4 ], [ 0, 1, 1, 2 ] );
				} );

				it( 'before "empty" listItem --> before "empty" li', () => {
					testList( [ 5 ], [ 0, 1, 1, 3 ] );
				} );

				it( 'inside "empty" listItem --> before ul', () => {
					testList( [ 5, 0 ], [ 0, 1, 1, 3, 0, 0 ] );
				} );

				it( 'before listItem "g" --> before li "g"', () => {
					testList( [ 6 ], [ 0, 1, 1, 3, 1 ] );
				} );

				it( 'before listItem "h" --> before li "h"', () => {
					testList( [ 7 ], [ 0, 1, 1, 3, 1, 1 ] );
				} );

				it( 'before listItem "i" --> before li "i"', () => {
					testList( [ 8 ], [ 0, 1, 1, 3, 1, 2 ] );
				} );

				it( 'before listItem "j" --> before li "j"', () => {
					testList( [ 9 ], [ 0, 1, 1, 4 ] );
				} );

				it( 'before listItem "k" --> before li "k"', () => {
					testList( [ 10 ], [ 0, 2 ] );
				} );

				it( 'after listItem "k" --> after ul', () => {
					testList( [ 11 ], [ 1 ] );
				} );
			} );
		} );
	} );

	describe( 'other', () => {
		describe( 'bogus paragraph', () => {
			it( 'should refresh bogus paragraph on setting attribute from a different feature', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>'
				);

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				const spy = sinon.spy( editor.editing, 'reconvertItem' );

				model.change( writer => {
					writer.setAttribute( 'alignment', 'right', modelRoot.getChild( 0 ) );
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li><p style="text-align:right">a</p></li>' +
						'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
					'<ul>' +
						'<li><p style="text-align:right;">a</p></li>' +
						'<li>b</li>' +
					'</ul>'
				);

				expect( spy.calledOnce ).to.be.true;
			} );

			it( 'should not refresh bogus paragraph on setting selection attribute in an empty block', () => {
				setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted"></paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>'
				);

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph"></span></li>' +
						'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				const spy = sinon.spy( editor.editing, 'reconvertItem' );

				model.change( writer => {
					writer.setSelectionAttribute( 'bold', true );
				} );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" selection:bold="true"></paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>'
				);

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph"><strong></strong></span></li>' +
						'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
					'<ul>' +
						'<li>&nbsp;</li>' +
						'<li>b</li>' +
					'</ul>'
				);

				expect( spy.notCalled ).to.be.true;
			} );

			it( 'should not refresh bogus paragraph on setting attribute from a different feature on non-item element', () => {
				setModelData( model,
					'<paragraph>a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>'
				);

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<p>a</p>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				const spy = sinon.spy( editor.editing, 'reconvertItem' );

				model.change( writer => {
					writer.setAttribute( 'alignment', 'right', modelRoot.getChild( 0 ) );
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<p style="text-align:right">a</p>' +
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
					'<p style="text-align:right;">a</p>' +
					'<ul>' +
						'<li>b</li>' +
					'</ul>'
				);

				expect( spy.notCalled ).to.be.true;
			} );

			describe( 'consuming', () => {
				it( 'model bogus paragraph converter should not fire if change was already consumed', () => {
					editor.conversion.for( 'downcast' )
						.elementToElement( {
							model: 'paragraph',
							view: 'div',
							converterPriority: 'highest'
						} );

					const input = parseModel(
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>',
						model.schema
					);

					model.change( writer => {
						writer.remove( writer.createRangeIn( modelRoot ) );
						writer.insert( input, modelRoot, 0 );
					} );

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<ul><li><div>foo</div></li></ul>'
					);

					expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
						'<ul><li><div>foo</div></li></ul>'
					);
				} );
			} );
		} );

		describe( 'consuming', () => {
			it( 'model change indent converter should not fire if change was already consumed', () => {
				editor.editing.downcastDispatcher.on( 'attribute:listIndent', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, 'attribute:listIndent' );
				}, { priority: 'highest' } );

				setModelData( model,
					'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted">b</paragraph>'
				);

				model.change( writer => {
					writer.setAttribute( 'listIndent', 1, modelRoot.getChild( 1 ) );
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<span class="ck-list-bogus-paragraph">a</span>' +
					'<span class="ck-list-bogus-paragraph">b</span>'
				);
			} );

			it( 'view li converter should not fire if change was already consumed', () => {
				editor.data.upcastDispatcher.on( 'element:li', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { name: true } );
				}, { priority: 'highest' } );

				editor.setData( '<p></p><ul><li></li></ul>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph></paragraph>' );
			} );

			it( 'view li converter should not set list attributes if change was already consumed to some non listable element', () => {
				model.schema.addAttributeCheck( ( context, attributeName ) => {
					if ( context.endsWith( 'heading1' ) && attributeName == 'listItemId' ) {
						return false;
					}
				} );

				editor.conversion.for( 'upcast' ).elementToElement( { view: 'li', model: 'heading1', converterPriority: 'highest' } );

				editor.setData( '<ul><li></li></ul>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<heading1></heading1>' );
			} );

			it( 'view ul converter should not fire if change was already consumed', () => {
				editor.data.upcastDispatcher.on( 'element:ul', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { name: true } );
				}, { priority: 'highest' } );

				editor.setData( '<p></p><ul><li></li></ul>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph></paragraph>' );
			} );

			it( 'view converter should pass model range in data.modelRange', () => {
				editor.data.upcastDispatcher.on( 'element:ul', ( evt, data ) => {
					expect( data.modelRange ).to.be.instanceof( ModelRange );
				}, { priority: 'lowest' } );

				editor.setData( '<ul><li>Foo</li><li>Bar</li></ul>' );
			} );
		} );

		describe( 'UIElement', () => {
			it( 'ul and ol should not be inserted before ui element - change indent of the second list item', () => {
				editor.setData(
					'<ul>' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ul>'
				);

				// Append ui element at the end of first <li> (inside the bogus paragraph).
				view.change( writer => {
					const firstChild = viewDoc.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 );

					writer.insert( writer.createPositionAt( firstChild, 'end' ), writer.createUIElement( 'span' ) );
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">Foo<span></span></span></li>' +
						'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
					'</ul>'
				);

				model.change( writer => {
					// Change indent of the second list item.
					writer.setAttribute( 'listIndent', 1, modelRoot.getChild( 1 ) );
				} );

				// Check if the new <ul> was added at correct position.
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">Foo<span></span></span>' +
							'<ul>' +
								'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'ul and ol should not be inserted before ui element - remove second list item', () => {
				editor.setData(
					'<ul>' +
						'<li>Foo</li>' +
						'<li>' +
							'Bar' +
							'<ul>' +
								'<li>Xxx</li>' +
								'<li>Yyy</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				// Append ui element at the end of first <li> (inside the bogus paragraph).
				view.change( writer => {
					const firstChild = viewDoc.getRoot().getChild( 0 ).getChild( 0 ).getChild( 0 );

					writer.insert( writer.createPositionAt( firstChild, 'end' ), writer.createUIElement( 'span' ) );
				} );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li><span class="ck-list-bogus-paragraph">Foo<span></span></span></li>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">Bar</span>' +
							'<ul>' +
								'<li><span class="ck-list-bogus-paragraph">Xxx</span></li>' +
								'<li><span class="ck-list-bogus-paragraph">Yyy</span></li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				model.change( writer => {
					// Remove second list item. Expect that its sub-list will be moved to first list item.
					writer.remove( modelRoot.getChild( 1 ) );
				} );

				// Check if the <ul> was added at correct position.
				expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">Foo<span></span></span>' +
							'<ul>' +
								'<li><span class="ck-list-bogus-paragraph">Xxx</span></li>' +
								'<li><span class="ck-list-bogus-paragraph">Yyy</span></li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			describe( 'remove converter should properly handle ui elements', () => {
				let liFoo, liBar;

				beforeEach( () => {
					editor.setData( '<ul><li>Foo</li><li>Bar</li></ul>' );

					liFoo = modelRoot.getChild( 0 );
					liBar = modelRoot.getChild( 1 );
				} );

				it( 'ui element before <ul>', () => {
					view.change( writer => {
						// Append ui element before <ul>.
						writer.insert( writer.createPositionAt( viewRoot, 0 ), writer.createUIElement( 'span' ) );
					} );

					model.change( writer => {
						writer.remove( liFoo );
					} );

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<span></span>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
						'</ul>'
					);
				} );

				it( 'ui element before first <li>', () => {
					view.change( writer => {
						// Append ui element before <ll>.
						writer.insert( writer.createPositionAt( viewRoot.getChild( 0 ), 0 ), writer.createUIElement( 'span' ) );
					} );

					model.change( writer => {
						writer.remove( liFoo );
					} );

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<ul>' +
							'<span></span>' +
							'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
						'</ul>'
					);
				} );

				it( 'ui element in the middle of list', () => {
					view.change( writer => {
						// Append ui element after <li>.
						writer.insert( writer.createPositionAt( viewRoot.getChild( 0 ), 'end' ), writer.createUIElement( 'span' ) );
					} );

					model.change( writer => {
						writer.remove( liBar );
					} );

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">Foo</span></li>' +
							'<span></span>' +
						'</ul>'
					);
				} );
			} );
		} );

		it( 'outdent outer list item with nested blockquote', () => {
			setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">b1</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">b2</paragraph>' +
				'<blockQuote listIndent="2" listItemId="c" listType="bulleted">' +
					'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="0" listItemId="e" listType="bulleted">e</paragraph>' +
				'</blockQuote>'
			);

			const spy = sinon.spy( editor.editing, 'reconvertItem' );

			model.change( writer => {
				writer.setAttribute( 'listIndent', 1, modelRoot.getChild( 3 ) );
				writer.setAttribute( 'listItemId', 'b', modelRoot.getChild( 3 ) );
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">b1</paragraph>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">b2</paragraph>' +
				'<blockQuote listIndent="1" listItemId="b" listType="bulleted">' +
					'<paragraph listIndent="0" listItemId="d" listType="bulleted">d</paragraph>' +
					'<paragraph listIndent="0" listItemId="e" listType="bulleted">e</paragraph>' +
				'</blockQuote>'
			);

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<ul>' +
					'<li>' +
						'<span class="ck-list-bogus-paragraph">a</span>' +
						'<ul>' +
							'<li>' +
								'<p>b1</p>' +
								'<p>b2</p>' +
								'<blockquote>' +
									'<ul>' +
										'<li><span class="ck-list-bogus-paragraph">d</span></li>' +
										'<li><span class="ck-list-bogus-paragraph">e</span></li>' +
									'</ul>' +
								'</blockquote>' +
							'</li>' +
						'</ul>' +
					'</li>' +
				'</ul>'
			);

			expect( spy.callCount ).to.equal( 0 );
		} );
	} );

	describe( 'schema checking and parent splitting', () => {
		beforeEach( () => {
			// Since this part of test tests only view->model conversion editing pipeline is not necessary.
			editor.editing.destroy();
		} );

		it( 'list should be not converted when modelCursor and its ancestors disallow to insert list', () => {
			model.document.createRoot( '$title', 'title' );

			model.schema.register( '$title', {
				disallow: '$block',
				allow: 'inline'
			} );

			editor.data.set( { title: '<ul><li>foo</li></ul>' } );

			expect( getModelData( model, { rootName: 'title', withoutSelection: true } ) ).to.equal( '' );
		} );

		it( 'should split parent element when one of modelCursor ancestors allows to insert list - in the middle', () => {
			editor.conversion.for( 'upcast' ).elementToElement( { view: 'div', model: 'div' } );
			model.schema.register( 'div', { inheritAllFrom: '$block' } );

			editor.setData(
				'<div>' +
					'abc' +
					'<ul>' +
						'<li>foo</li>' +
					'</ul>' +
					'def' +
				'</div>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<div>abc</div>' +
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>' +
				'<div>def</div>'
			);
		} );

		it( 'should split parent element when one of modelCursor ancestors allows to insert list - at the end', () => {
			editor.conversion.for( 'upcast' ).elementToElement( { view: 'div', model: 'div' } );
			model.schema.register( 'div', { inheritAllFrom: '$block' } );

			editor.setData(
				'<div>' +
					'abc' +
					'<ul>' +
						'<li>foo</li>' +
					'</ul>' +
				'</div>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<div>abc</div>' +
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>'
			);
		} );

		it( 'should split parent element when one of modelCursor ancestors allows to insert list - at the beginning', () => {
			editor.conversion.for( 'upcast' ).elementToElement( { view: 'div', model: 'div' } );
			model.schema.register( 'div', { inheritAllFrom: '$block' } );

			editor.setData(
				'<div>' +
					'<ul>' +
						'<li>foo</li>' +
					'</ul>' +
					'def' +
				'</div>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>' +
				'<div>def</div>'
			);
		} );

		// https://github.com/ckeditor/ckeditor5-list/issues/121
		it( 'should correctly set data.modelCursor', () => {
			editor.setData(
				'<ul>' +
					'<li>a</li>' +
					'<li>b</li>' +
				'</ul>' +
				'c'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">a</paragraph>' +
				'<paragraph listIndent="0" listItemId="a01" listType="bulleted">b</paragraph>' +
				'<paragraph>c</paragraph>'
			);
		} );
	} );

	function getViewPosition( root, path, view ) {
		let parent = root;

		while ( path.length > 1 ) {
			parent = parent.getChild( path.shift() );
		}

		return view.createPositionAt( parent, path[ 0 ] );
	}

	function getViewPath( position ) {
		const path = [ position.offset ];
		let parent = position.parent;

		while ( parent.parent ) {
			path.unshift( parent.index );
			parent = parent.parent;
		}

		return path;
	}
} );
