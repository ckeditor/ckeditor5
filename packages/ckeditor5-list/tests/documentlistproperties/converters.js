/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';
import IndentEditing from '@ckeditor/ckeditor5-indent/src/indentediting';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting';
import AlignmentEditing from '@ckeditor/ckeditor5-alignment/src/alignmentediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import stubUid from '../documentlist/_utils/uid';
import DocumentListPropertiesEditing from '../../src/documentlistproperties/documentlistpropertiesediting';
import { modelList, setupTestHelpers } from '../documentlist/_utils/utils';

describe( 'DocumentListPropertiesEditing - converters', () => {
	let editor, model, modelDoc, modelRoot, view, viewDoc, viewRoot, test;

	testUtils.createSinonSandbox();

	describe( 'list style', () => {
		beforeEach( () => setupEditor( {
			list: {
				properties: {
					styles: true,
					startIndex: false,
					reversed: false
				}
			}
		} ) );

		afterEach( async () => {
			await editor.destroy();
		} );

		describe( 'data pipeline', () => {
			beforeEach( () => {
				stubUid( 0 );
			} );

			it( 'should convert single list (type: bulleted)', () => {
				test.data(
					'<ul>' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ul>',

					modelList( `
						* Foo {style:default}
						* Bar
					` )
				);
			} );

			it( 'should convert single list (type: numbered)', () => {
				test.data(
					'<ol>' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {style:default}
						# Bar
					` )
				);
			} );

			it( 'should convert single list (type: bulleted, style: circle)', () => {
				test.data(
					'<ul style="list-style-type:circle;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ul>',

					modelList( `
						* Foo {style:circle}
						* Bar
					` )
				);
			} );

			it( 'should convert single list (type: numbered, style: upper-alpha)', () => {
				test.data(
					'<ol style="list-style-type:upper-alpha;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {style:upper-alpha}
						# Bar
					` )
				);
			} );

			it( 'should convert mixed lists', () => {
				test.data(
					'<ol style="list-style-type:upper-alpha;">' +
						'<li>OL 1</li>' +
						'<li>OL 2</li>' +
					'</ol>' +
					'<ul style="list-style-type:circle;">' +
						'<li>UL 1</li>' +
						'<li>UL 2</li>' +
					'</ul>',

					modelList( `
						# OL 1 {style:upper-alpha}
						# OL 2
						* UL 1 {style:circle}
						* UL 2
					` )
				);
			} );

			it( 'should convert nested and mixed lists', () => {
				test.data(
					'<ol style="list-style-type:upper-alpha;">' +
						'<li>OL 1</li>' +
						'<li>OL 2' +
							'<ul style="list-style-type:circle;">' +
								'<li>UL 1</li>' +
								'<li>UL 2</li>' +
							'</ul>' +
						'</li>' +
						'<li>OL 3</li>' +
					'</ol>',

					modelList( `
						# OL 1 {id:000} {style:upper-alpha}
						# OL 2 {id:003}
						  * UL 1 {id:001} {style:circle}
						  * UL 2 {id:002}
						# OL 3 {id:004} 
					` )
				);
			} );

			it( 'should convert when the list is in the middle of the content', () => {
				test.data(
					'<p>Paragraph.</p>' +
					'<ol style="list-style-type:upper-alpha;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>' +
					'<p>Paragraph.</p>',

					modelList( `
						Paragraph.
						# Foo {id:000} {style:upper-alpha}
						# Bar {id:001}
						Paragraph.
					` )
				);
			} );

			it( 'should convert style on a nested list', () => {
				test.data(
					'<ul>' +
						'<li>' +
							'cd' +
							'<ol style="list-style-type:upper-alpha;">' +
								'<li>efg</li>' +
							'</ol>' +
						'</li>' +
					'</ul>',

					modelList( `
						* cd {id:001} {style:default}
						  # efg {id:000} {style:upper-alpha}
					` )
				);
			} );

			it( 'view ol converter should not fire if change was already consumed', () => {
				editor.data.upcastDispatcher.on( 'element:ol', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { styles: 'list-style-type' } );
				}, { priority: 'highest' } );

				test.data(
					'<ol style="list-style-type:upper-alpha;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {style:default}
						# Bar
					` ),

					'<ol>' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>'
				);
			} );

			it( 'view ul converter should not fire if change was already consumed', () => {
				editor.data.upcastDispatcher.on( 'element:ul', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { styles: 'list-style-type' } );
				}, { priority: 'highest' } );

				test.data(
					'<ul style="list-style-type:circle;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ul>',

					modelList( `
						* Foo {style:default}
						* Bar
					` ),

					'<ul>' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ul>'
				);
			} );

			it( 'should use modeRange provided from higher priority converter', () => {
				editor.data.upcastDispatcher.on( 'element:ol', ( evt, data, conversionApi ) => {
					const { modelRange, modelCursor } = conversionApi.convertChildren( data.viewItem, data.modelCursor );

					data.modelRange = modelRange;
					data.modelCursor = modelCursor;
				}, { priority: 'highest' } );

				test.data(
					'<ol style="list-style-type:upper-alpha;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {style:upper-alpha}
						# Bar
					` ),

					'<ol style="list-style-type:upper-alpha;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>'
				);
			} );

			it( 'should not apply attribute on elements that does not accept it', () => {
				model.schema.register( 'block', {
					allowWhere: '$block',
					allowContentOf: '$block'
				} );
				editor.conversion.elementToElement( { view: 'div', model: 'block' } );

				test.data(
					'<ol style="list-style-type:upper-alpha;">' +
						'<li>Foo</li>' +
						'<li><div>x</div></li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {style:upper-alpha}
						<block>x</block>
						# Bar {style:upper-alpha}
					` ),

					'<ol style="list-style-type:upper-alpha;">' +
						'<li>Foo</li>' +
					'</ol>' +
					'<div>x</div>' +
					'<ol style="list-style-type:upper-alpha;">' +
						'<li>Bar</li>' +
					'</ol>'
				);
			} );

			it( 'should not consume attribute while upcasting if not applied', () => {
				const spy = sinon.spy();

				model.schema.addAttributeCheck( ( ctx, attributeName ) => attributeName != 'listStyle' );
				editor.conversion.for( 'upcast' ).add(
					dispatcher => dispatcher.on( 'element:ol', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { styles: 'list-style-type' } ) ).to.be.true;
						spy();
					}, { priority: 'lowest' } )
				);

				test.data(
					'<ol style="list-style-type:upper-alpha;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {style:default}
						# Bar
					` ),

					'<ol>' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>'
				);

				expect( spy.calledOnce ).to.be.true;
			} );

			describe( 'list conversion with surrounding text nodes', () => {
				it( 'should convert a list if raw text is before the list', () => {
					test.data(
						'Foo' +
						'<ul style="list-style-type:square;"><li>Bar</li></ul>',

						modelList( `
							Foo
							* Bar {id:000} {style:square}
						` ),

						'<p>Foo</p>' +
						'<ul style="list-style-type:square;"><li>Bar</li></ul>'
					);
				} );

				it( 'should convert a list if raw text is after the list', () => {
					test.data(
						'<ul style="list-style-type:square;"><li>Foo</li></ul>' +
						'Bar',

						modelList( `
							* Foo {style:square}
							Bar
						` ),

						'<ul style="list-style-type:square;"><li>Foo</li></ul>' +
						'<p>Bar</p>'
					);
				} );

				it( 'should convert a list if it is surrounded by two text nodes', () => {
					test.data(
						'Foo' +
						'<ul style="list-style-type:square;"><li>Bar</li></ul>' +
						'Baz',

						modelList( `
							Foo
							* Bar {id:000} {style:square}
							Baz
						` ),

						'<p>Foo</p>' +
						'<ul style="list-style-type:square;"><li>Bar</li></ul>' +
						'<p>Baz</p>'
					);
				} );
			} );
		} );

		describe( 'editing pipeline', () => {
			describe( 'insert', () => {
				it( 'should convert single list (type: bulleted, style: default)', () => {
					test.insert(
						modelList( `
							x
							* [<paragraph>Foo</paragraph> {style:default}
							* <paragraph>Bar</paragraph>]
						` ),

						'<p>x</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">Foo</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
						'</ul>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should convert single list (type: bulleted, style: circle)', () => {
					test.insert(
						modelList( `
							x
							* [<paragraph>Foo {style:circle}</paragraph>
							* <paragraph>Bar</paragraph>]
						` ),

						'<p>x</p>' +
						'<ul style="list-style-type:circle">' +
							'<li><span class="ck-list-bogus-paragraph">Foo</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
						'</ul>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should convert nested bulleted list (main: circle, nested: disc)', () => {
					test.insert(
						modelList( `
							x
							* [<paragraph>Foo 1</paragraph> {style:circle}
							  * <paragraph>Bar 1</paragraph> {style:disc}
							  * <paragraph>Bar 2</paragraph>
						    * <paragraph>Foo 2</paragraph>
						    * <paragraph>Foo 3</paragraph>]
						` ),

						'<p>x</p>' +
						'<ul style="list-style-type:circle">' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">Foo 1</span>' +
								'<ul style="list-style-type:disc">' +
									'<li><span class="ck-list-bogus-paragraph">Bar 1</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">Bar 2</span></li>' +
								'</ul>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">Foo 2</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Foo 3</span></li>' +
						'</ul>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should convert properly nested list styles', () => {
					// ■ Level 0
					//     ▶ Level 0.1
					//         ○ Level 0.1.1
					//     ▶ Level 0.2
					//         ○ Level 0.2.1
					test.insert(
						modelList( `
							x
							* [<paragraph>Level 0</paragraph> {style:default}
							  * <paragraph>Level 0.1</paragraph> {style:default}
							    * <paragraph>Level 0.1.1</paragraph> {style:circle}
							  * <paragraph>Level 0.2</paragraph>
							    * <paragraph>Level 0.2.1</paragraph>] {style:circle}
						` ),

						'<p>x</p>' +
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">Level 0</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">Level 0.1</span>' +
										'<ul style="list-style-type:circle">' +
											'<li><span class="ck-list-bogus-paragraph">Level 0.1.1</span></li>' +
										'</ul>' +
									'</li>' +
									'<li><span class="ck-list-bogus-paragraph">Level 0.2</span>' +
										'<ul style="list-style-type:circle">' +
											'<li><span class="ck-list-bogus-paragraph">Level 0.2.1</span></li>' +
										'</ul>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should unwrap list item only if it was really wrapped (there was no wrapper for the default style) ', () => {
					test.insert(
						modelList( `
							x
							* [<paragraph>cd</paragraph>
							  # <paragraph>efg</paragraph>] {style:upper-alpha}
						` ),

						'<p>x</p>' +
						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">cd</span>' +
								'<ol style="list-style-type:upper-alpha">' +
									'<li><span class="ck-list-bogus-paragraph">efg</span></li>' +
								'</ol>' +
							'</li>' +
						'</ul>'
					);
				} );

				// TODO this test should be in the reversed group
				it.skip( 'should unwrap list item only if it was really wrapped (there was no wrapper for the default order)', () => {
					test.insert(
						modelList( `
							x
							* [<paragraph>cd</paragraph>
							  # <paragraph>efg</paragraph>] {reversed:true}
						` ),

						'<p>x</p>' +
						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">cd</span>' +
								'<ol style="list-style-type:upper-alpha">' +
									'<li><span class="ck-list-bogus-paragraph">efg</span></li>' +
								'</ol>' +
							'</li>' +
						'</ul>'
					);
				} );

				// TODO multi-block
				// TODO inserting list items/blocks into other lists
			} );

			describe( 'remove', () => {
				it( 'remove a list item', () => {
					test.remove(
						'<paragraph>p</paragraph>' +
						'[<paragraph listIndent="0" listItemId="a" listType="bulleted" listStyle="circle">a</paragraph>]' +
						'<paragraph listIndent="0" listItemId="b" listType="bulleted" listStyle="circle">b</paragraph>' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted" listStyle="circle">c</paragraph>',

						'<p>p</p>' +
						'<ul style="list-style-type:circle">' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );
			} );

			describe( 'set list style', () => {
				it( 'on a flat list', () => {
					const input = modelList( `
						* [<paragraph>a</paragraph>
						* <paragraph>b</paragraph>]
					` );

					const output =
						'<ul style="list-style-type:circle">' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.setAttribute( 'listStyle', 'circle', selection.getFirstRange() );
						} );
					} );
				} );

				it( 'on a list with nested lists', () => {
					const input = modelList( `
						* [<paragraph>a</paragraph> {style:default}
						  * <paragraph>b</paragraph> {style:default}
						* <paragraph>c</paragraph>]
					` );

					const output =
						'<ul style="list-style-type:circle">' +
							'<li><span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'</ul>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>';

					test.test( input, output, selection => {
						model.change( writer => {
							for ( const item of selection.getFirstRange().getItems( { shallow: true } ) ) {
								if ( item.getAttribute( 'listIndent' ) == 0 ) {
									writer.setAttribute( 'listStyle', 'circle', item );
								}
							}
						} );
					} );
				} );
			} );

			describe( 'remove list style', () => {
				// TODO
			} );

			describe( 'change list style', () => {
				// TODO
			} );

			describe( 'change list type', () => {
				// TODO
			} );

			describe( 'change list indent', () => {
				it( 'aaa', () => {
					const input = modelList( [
						'* <paragraph>a</paragraph>',
						'* [<paragraph>b</paragraph>',
						'  # <paragraph>c</paragraph>] {style:roman}',
					] );

					const output =
						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph">b</span>' +
										'<ol style="list-style-type:roman">' +
											'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
										'</ol>' +
									'</li>' +
								'</ul>' +
							'</li>' +
						'</ul>';

					test.test( input, output, selection => {
						model.change( writer => {
							for ( const item of selection.getFirstRange().getItems( { shallow: true } ) ) {
								writer.setAttribute( 'listIndent', item.getAttribute( 'listIndent' ) + 1, item );
							}
						} );
					} );
				} );
			} );

			describe( 'consuming', () => {
				it( 'should not convert attribute if it was already consumed', () => {
					editor.editing.downcastDispatcher.on( 'attribute:listStyle', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, evt.name );
					}, { priority: 'highest' } );

					setModelData( model,
						'<paragraph listIndent="0" listItemId="a" listType="bulleted">a</paragraph>'
					);

					model.change( writer => {
						writer.setAttribute( 'listStyle', 'circle', modelRoot.getChild( 0 ) );
					} );

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ul>'
					);
				} );
			} );
		} );
	} );

	async function setupEditor( config = {} ) {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, IndentEditing, ClipboardPipeline, BoldEditing, DocumentListPropertiesEditing, UndoEditing,
				BlockQuoteEditing, TableEditing, HeadingEditing, AlignmentEditing ],
			...config
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

		test = setupTestHelpers( editor );
	}
} );
