/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

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
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import stubUid from '../list/_utils/uid.js';
import ListPropertiesEditing from '../../src/listproperties/listpropertiesediting.js';
import { modelList, setupTestHelpers } from '../list/_utils/utils.js';

describe( 'ListPropertiesEditing - converters', () => {
	let editor, model, modelDoc, modelRoot, view, test;

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
					'<ol style="list-style-type:upper-latin;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {style:upper-latin}
						# Bar
					` )
				);
			} );

			it( 'should convert mixed lists', () => {
				test.data(
					'<ol style="list-style-type:upper-latin;">' +
						'<li>OL 1</li>' +
						'<li>OL 2</li>' +
					'</ol>' +
					'<ul style="list-style-type:circle;">' +
						'<li>UL 1</li>' +
						'<li>UL 2</li>' +
					'</ul>',

					modelList( `
						# OL 1 {style:upper-latin}
						# OL 2
						* UL 1 {style:circle}
						* UL 2
					` )
				);
			} );

			it( 'should convert nested and mixed lists', () => {
				test.data(
					'<ol style="list-style-type:upper-latin;">' +
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
						# OL 1 {id:000} {style:upper-latin}
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
					'<ol style="list-style-type:upper-latin;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>' +
					'<p>Paragraph.</p>',

					modelList( `
						Paragraph.
						# Foo {id:000} {style:upper-latin}
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
							'<ol style="list-style-type:upper-latin;">' +
								'<li>efg</li>' +
							'</ol>' +
						'</li>' +
					'</ul>',

					modelList( `
						* cd {id:001} {style:default}
						  # efg {id:000} {style:upper-latin}
					` )
				);
			} );

			it( 'view ol converter should not fire if change was already consumed', () => {
				editor.data.upcastDispatcher.on( 'element:ol', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { styles: 'list-style-type' } );
				}, { priority: 'highest' } );

				test.data(
					'<ol style="list-style-type:upper-latin;">' +
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
					'<ol style="list-style-type:upper-latin;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {style:upper-latin}
						# Bar
					` ),

					'<ol style="list-style-type:upper-latin;">' +
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
					'<ol style="list-style-type:upper-latin;">' +
						'<li>Foo</li>' +
						'<li><div>x</div></li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {style:upper-latin}
						<block>x</block>
						# Bar {style:upper-latin}
					` ),

					'<ol style="list-style-type:upper-latin;">' +
						'<li>Foo</li>' +
					'</ol>' +
					'<div>x</div>' +
					'<ol style="list-style-type:upper-latin;">' +
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
					'<ol style="list-style-type:upper-latin;">' +
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

			describe( 'copy and getSelectedContent()', () => {
				it( 'should be able to downcast part of a nested list', () => {
					setModelData( model, modelList( `
						* A
						  * [B1 {style:circle}
						    B2
						    * C1] {style:square}
						      C2
					` ) );

					const modelFragment = model.getSelectedContent( model.document.selection );
					const viewFragment = editor.data.toView( modelFragment );
					const data = editor.data.htmlProcessor.toData( viewFragment );

					expect( data ).to.equal(
						'<ul style="list-style-type:circle;">' +
							'<li>' +
								'<p>B1</p>' +
								'<p>B2</p>' +
								'<ul style="list-style-type:square;">' +
									'<li>C1</li>' +
								'</ul>' +
							'</li>' +
						'</ul>'
					);
				} );

				it( 'should be able to downcast part of a deep nested list', () => {
					setModelData( model, modelList( `
						* A
						  * B1 {style:circle}
						    B2
						    * [C1 {style:square}
						    * C2]
					` ) );

					const modelFragment = model.getSelectedContent( model.document.selection );
					const viewFragment = editor.data.toView( modelFragment );
					const data = editor.data.htmlProcessor.toData( viewFragment );

					expect( data ).to.equal(
						'<ul style="list-style-type:square;">' +
							'<li>C1</li>' +
							'<li>C2</li>' +
						'</ul>'
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

				it( 'insert with attributes in a specific order', () => {
					test.insert(
						modelList( `
							<paragraph>p</paragraph>
							[<paragraph listIndent="0" listItemId="a" listType="bulleted" listStyle="circle">a</paragraph>
							<paragraph listIndent="0" listItemId="b" listType="bulleted" listStyle="circle">b</paragraph>
							<paragraph listIndent="0" listItemId="c" listType="bulleted" listStyle="circle">c</paragraph>]
						` ),

						'<p>p</p>' +
						'<ul style="list-style-type:circle">' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>'
					);
				} );
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
				it( 'on a flat list', () => {
					const input = modelList( `
						* [<paragraph>a</paragraph> {style:foo}
						* <paragraph>b</paragraph>]
					` );

					const output =
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.removeAttribute( 'listStyle', selection.getFirstRange() );
						} );
					} );
				} );

				it( 'on a list with nested lists', () => {
					const input = modelList( `
						* [<paragraph>a</paragraph> {style:square}
						  * <paragraph>b</paragraph> {style:disc}
						* <paragraph>c</paragraph>]
					` );

					const output =
						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul style="list-style-type:disc">' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'</ul>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>';

					test.test( input, output, selection => {
						model.change( writer => {
							for ( const item of selection.getFirstRange().getItems( { shallow: true } ) ) {
								if ( item.getAttribute( 'listIndent' ) == 0 ) {
									writer.removeAttribute( 'listStyle', item );
								}
							}
						} );
					} );
				} );

				it( 'and all other list attributes', () => {
					const input = modelList( `
						* [<paragraph>a</paragraph> {style:foo}
						  <paragraph>b</paragraph>]
					` );

					const output =
						'<p>a</p>' +
						'<p>b</p>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.removeAttribute( 'listStyle', selection.getFirstRange() );
							writer.removeAttribute( 'listIndent', selection.getFirstRange() );
							writer.removeAttribute( 'listItemId', selection.getFirstRange() );
							writer.removeAttribute( 'listType', selection.getFirstRange() );
						} );
					} );
				} );
			} );

			describe( 'change list style', () => {
				it( 'on a flat list', () => {
					const input = modelList( `
						* [<paragraph>a</paragraph> {style:disc}
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
						* [<paragraph>a</paragraph> {style:square}
						  * <paragraph>b</paragraph> {style:disc}
						* <paragraph>c</paragraph>]
					` );

					const output =
						'<ul style="list-style-type:circle">' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul style="list-style-type:disc">' +
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

			describe( 'change list type', () => {
				it( 'on a flat list', () => {
					const input = modelList( `
						* [<paragraph>a</paragraph> {style:circle}
						* <paragraph>b</paragraph>]
					` );

					const output =
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.setAttribute( 'listType', 'numbered', selection.getFirstRange() );
						} );
					} );
				} );

				it( 'on a list with nested lists', () => {
					const input = modelList( `
						* [<paragraph>a</paragraph> {style:circle}
						  * <paragraph>b</paragraph> {style:disc}
						* <paragraph>c</paragraph>]
					` );

					const output =
						'<ol>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul style="list-style-type:disc">' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'</ul>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							for ( const item of selection.getFirstRange().getItems( { shallow: true } ) ) {
								if ( item.getAttribute( 'listIndent' ) == 0 ) {
									writer.setAttribute( 'listType', 'numbered', item );
								}
							}
						} );
					} );
				} );
			} );

			describe( 'change list indent', () => {
				it( 'should update list attribute elements', () => {
					const input = modelList( [
						'* <paragraph>a</paragraph>',
						'* [<paragraph>b</paragraph>',
						'  # <paragraph>c</paragraph>] {style:upper-roman}'
					] );

					const output =
						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph">b</span>' +
										'<ol style="list-style-type:upper-roman">' +
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

	describe( 'list reversed', () => {
		beforeEach( () => setupEditor( {
			list: {
				properties: {
					styles: false,
					startIndex: false,
					reversed: true
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
						* Foo
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
						# Foo {reversed:false}
						# Bar
					` )
				);
			} );

			it( 'should not convert on bulleted single list (type: bulleted)', () => {
				test.data(
					'<ul reversed="true">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ul>',

					modelList( `
						* Foo
						* Bar
					` ),

					'<ul>' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ul>'
				);
			} );

			it( 'should convert single list (type: numbered, reversed)', () => {
				test.data(
					'<ol reversed="reversed">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {reversed:true}
						# Bar
					` )
				);
			} );

			it( 'should convert when the list is in the middle of the content', () => {
				test.data(
					'<p>Paragraph.</p>' +
					'<ol reversed="true">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>' +
					'<p>Paragraph.</p>',

					modelList( `
						Paragraph.
						# Foo {id:000} {reversed:true}
						# Bar {id:001}
						Paragraph.
					` ),

					'<p>Paragraph.</p>' +
					'<ol reversed="reversed">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>' +
					'<p>Paragraph.</p>'
				);
			} );

			it( 'should convert on a nested list (in bulleted list)', () => {
				test.data(
					'<ul>' +
						'<li>' +
							'cd' +
							'<ol reversed="reversed">' +
								'<li>efg</li>' +
							'</ol>' +
						'</li>' +
					'</ul>',

					modelList( `
						* cd {id:001}
						  # efg {id:000} {reversed:true}
					` )
				);
			} );

			it( 'should convert on a nested list (in numbered list)', () => {
				test.data(
					'<ol>' +
						'<li>' +
							'cd' +
							'<ol reversed="reversed">' +
								'<li>efg</li>' +
							'</ol>' +
						'</li>' +
					'</ol>',

					modelList( `
						# cd {id:001} {reversed:false}
						  # efg {id:000} {reversed:true}
					` )
				);
			} );

			it( 'view ol converter should not fire if change was already consumed', () => {
				editor.data.upcastDispatcher.on( 'element:ol', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { attributes: 'reversed' } );
				}, { priority: 'highest' } );

				test.data(
					'<ol reversed="reversed">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {reversed:false}
						# Bar
					` ),

					'<ol>' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>'
				);
			} );

			it( 'should use modeRange provided from higher priority converter', () => {
				editor.data.upcastDispatcher.on( 'element:ol', ( evt, data, conversionApi ) => {
					const { modelRange, modelCursor } = conversionApi.convertChildren( data.viewItem, data.modelCursor );

					data.modelRange = modelRange;
					data.modelCursor = modelCursor;
				}, { priority: 'highest' } );

				test.data(
					'<ol reversed="reversed">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {reversed:true}
						# Bar
					` )
				);
			} );

			it( 'should not apply attribute on elements that does not accept it', () => {
				model.schema.register( 'block', {
					allowWhere: '$block',
					allowContentOf: '$block'
				} );
				editor.conversion.elementToElement( { view: 'div', model: 'block' } );

				test.data(
					'<ol reversed="reversed">' +
						'<li>Foo</li>' +
						'<li><div>x</div></li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {reversed:true}
						<block>x</block>
						# Bar {reversed:true}
					` ),

					'<ol reversed="reversed">' +
						'<li>Foo</li>' +
					'</ol>' +
					'<div>x</div>' +
					'<ol reversed="reversed">' +
						'<li>Bar</li>' +
					'</ol>'
				);
			} );

			it( 'should not consume attribute while upcasting if not applied', () => {
				const spy = sinon.spy();

				model.schema.addAttributeCheck( ( ctx, attributeName ) => attributeName != 'listReversed' );
				editor.conversion.for( 'upcast' ).add(
					dispatcher => dispatcher.on( 'element:ol', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { attributes: 'reversed' } ) ).to.be.true;
						spy();
					}, { priority: 'lowest' } )
				);

				test.data(
					'<ol reversed="reversed">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {reversed:false}
						# Bar
					` ),

					'<ol>' +
					'<li>Foo</li>' +
					'<li>Bar</li>' +
					'</ol>'
				);

				expect( spy.calledOnce ).to.be.true;
			} );

			describe( 'copy and getSelectedContent()', () => {
				it( 'should be able to downcast part of a nested list', () => {
					setModelData( model, modelList( `
						# A
						  # [B1 {reversed:true}
						    B2
						    # C1] {reversed:false}
						      C2
					` ) );

					const modelFragment = model.getSelectedContent( model.document.selection );
					const viewFragment = editor.data.toView( modelFragment );
					const data = editor.data.htmlProcessor.toData( viewFragment );

					expect( data ).to.equal(
						'<ol reversed="reversed">' +
							'<li>' +
								'<p>B1</p>' +
								'<p>B2</p>' +
								'<ol>' +
									'<li>C1</li>' +
								'</ol>' +
							'</li>' +
						'</ol>'
					);
				} );

				it( 'should be able to downcast part of a deep nested list', () => {
					setModelData( model, modelList( `
						# A
						  # B1 {reversed:true}
						    B2
						    # [C1 {reversed:true}
						    # C2]
					` ) );

					const modelFragment = model.getSelectedContent( model.document.selection );
					const viewFragment = editor.data.toView( modelFragment );
					const data = editor.data.htmlProcessor.toData( viewFragment );

					expect( data ).to.equal(
						'<ol reversed="reversed">' +
							'<li>C1</li>' +
							'<li>C2</li>' +
						'</ol>'
					);
				} );
			} );
		} );

		describe( 'editing pipeline', () => {
			describe( 'insert', () => {
				it( 'should convert single list (type: numbered, reversed: false)', () => {
					test.insert(
						modelList( `
							x
							# [<paragraph>Foo</paragraph> {reversed:false}
							# <paragraph>Bar</paragraph>]
						` ),

						'<p>x</p>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">Foo</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
						'</ol>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should convert single list (type: numbered, reversed:true)', () => {
					test.insert(
						modelList( `
							x
							# [<paragraph>Foo</paragraph> {reversed:true}
							# <paragraph>Bar</paragraph>]
						` ),

						'<p>x</p>' +
						'<ol reversed="reversed">' +
							'<li><span class="ck-list-bogus-paragraph">Foo</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
						'</ol>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should convert nested numbered list', () => {
					test.insert(
						modelList( `
							x
							# [<paragraph>Foo 1</paragraph> {reversed:false}
							  # <paragraph>Bar 1</paragraph> {reversed:true}
							  # <paragraph>Bar 2</paragraph>
						    # <paragraph>Foo 2</paragraph>
						    # <paragraph>Foo 3</paragraph>]
						` ),

						'<p>x</p>' +
						'<ol>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">Foo 1</span>' +
								'<ol reversed="reversed">' +
									'<li><span class="ck-list-bogus-paragraph">Bar 1</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">Bar 2</span></li>' +
								'</ol>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">Foo 2</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Foo 3</span></li>' +
						'</ol>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should convert properly nested list', () => {
					// ■ Level 0
					//     ▶ Level 0.1
					//         ○ Level 0.1.1
					//     ▶ Level 0.2
					//         ○ Level 0.2.1
					test.insert(
						modelList( `
							x
							# [<paragraph>Level 0</paragraph> {reversed:false}
							  # <paragraph>Level 0.1</paragraph> {reversed:false}
							    # <paragraph>Level 0.1.1</paragraph> {reversed:true}
							  # <paragraph>Level 0.2</paragraph>
							    # <paragraph>Level 0.2.1</paragraph>] {reversed:true}
						` ),

						'<p>x</p>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">Level 0</span>' +
								'<ol>' +
									'<li><span class="ck-list-bogus-paragraph">Level 0.1</span>' +
										'<ol reversed="reversed">' +
											'<li><span class="ck-list-bogus-paragraph">Level 0.1.1</span></li>' +
										'</ol>' +
									'</li>' +
									'<li><span class="ck-list-bogus-paragraph">Level 0.2</span>' +
										'<ol reversed="reversed">' +
											'<li><span class="ck-list-bogus-paragraph">Level 0.2.1</span></li>' +
										'</ol>' +
									'</li>' +
								'</ol>' +
							'</li>' +
						'</ol>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should unwrap list item only if it was really wrapped (there was no wrapper for the reversed:false)', () => {
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
								'<ol reversed="reversed">' +
									'<li><span class="ck-list-bogus-paragraph">efg</span></li>' +
								'</ol>' +
							'</li>' +
						'</ul>'
					);
				} );
			} );

			describe( 'remove', () => {
				it( 'remove a list item', () => {
					test.remove(
						modelList( `
							<paragraph>p</paragraph>
							# [<paragraph>a</paragraph>] {reversed:true}
							# <paragraph>b</paragraph>
							# <paragraph>c</paragraph>
						` ),

						'<p>p</p>' +
						'<ol reversed="reversed">' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ol>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );
			} );

			describe( 'set list reversed', () => {
				it( 'on a flat list', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph>
						# <paragraph>b</paragraph>]
					` );

					const output =
						'<ol reversed="reversed">' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.setAttribute( 'listReversed', true, selection.getFirstRange() );
						} );
					} );
				} );

				it( 'on a list with nested lists', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph> {reversed:false}
						  # <paragraph>b</paragraph> {reversed:false}
						# <paragraph>c</paragraph>]
					` );

					const output =
						'<ol reversed="reversed">' +
							'<li><span class="ck-list-bogus-paragraph">a</span>' +
								'<ol>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'</ol>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							for ( const item of selection.getFirstRange().getItems( { shallow: true } ) ) {
								if ( item.getAttribute( 'listIndent' ) == 0 ) {
									writer.setAttribute( 'listReversed', true, item );
								}
							}
						} );
					} );
				} );
			} );

			describe( 'remove list reversed', () => {
				it( 'on a flat list', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph> {reversed:true}
						# <paragraph>b</paragraph>]
					` );

					const output =
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.removeAttribute( 'listReversed', selection.getFirstRange() );
						} );
					} );
				} );

				it( 'on a list with nested lists', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph> {reversed:true}
						  # <paragraph>b</paragraph> {reversed:true}
						# <paragraph>c</paragraph>]
					` );

					const output =
						'<ol>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ol reversed="reversed">' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'</ol>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							for ( const item of selection.getFirstRange().getItems( { shallow: true } ) ) {
								if ( item.getAttribute( 'listIndent' ) == 0 ) {
									writer.removeAttribute( 'listReversed', item );
								}
							}
						} );
					} );
				} );
			} );

			describe( 'change list type', () => {
				it( 'on a flat list', () => {
					const input = modelList( `
						* [<paragraph>a</paragraph>
						* <paragraph>b</paragraph>]
					` );

					const output =
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.setAttribute( 'listType', 'numbered', selection.getFirstRange() );
						} );
					} );
				} );

				it( 'on a list with nested lists', () => {
					const input = modelList( `
						* [<paragraph>a</paragraph>
						  # <paragraph>b</paragraph> {reversed:true}
						* <paragraph>c</paragraph>]
					` );

					const output =
						'<ol>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ol reversed="reversed">' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'</ol>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							for ( const item of selection.getFirstRange().getItems( { shallow: true } ) ) {
								if ( item.getAttribute( 'listIndent' ) == 0 ) {
									writer.setAttribute( 'listType', 'numbered', item );
								}
							}
						} );
					} );
				} );
			} );

			describe( 'change list indent', () => {
				it( 'should update list attribute elements', () => {
					const input = modelList( [
						'* <paragraph>a</paragraph>',
						'* [<paragraph>b</paragraph>',
						'  # <paragraph>c</paragraph>] {reversed:true}'
					] );

					const output =
						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph">b</span>' +
										'<ol reversed="reversed">' +
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
					editor.editing.downcastDispatcher.on( 'attribute:listReversed', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, evt.name );
					}, { priority: 'highest' } );

					setModelData( model,
						'<paragraph listIndent="0" listItemId="a" listType="numbered">a</paragraph>'
					);

					model.change( writer => {
						writer.setAttribute( 'listReversed', true, modelRoot.getChild( 0 ) );
					} );

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ol>'
					);
				} );
			} );
		} );
	} );

	describe( 'list start index', () => {
		beforeEach( () => setupEditor( {
			list: {
				properties: {
					styles: false,
					startIndex: true,
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
						* Foo
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
						# Foo {start:1}
						# Bar
					` )
				);
			} );

			it( 'should not convert on bulleted single list (type: bulleted)', () => {
				test.data(
					'<ul start="5">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ul>',

					modelList( `
						* Foo
						* Bar
					` ),

					'<ul>' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ul>'
				);
			} );

			it( 'should convert single list (type: numbered, start: 5)', () => {
				test.data(
					'<ol start="5">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {start:5}
						# Bar
					` )
				);
			} );

			it( 'should convert single list (type: numbered, start: 0)', () => {
				test.data(
					'<ol start="0">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {start:0}
						# Bar
					` )
				);
			} );

			it( 'should change negative start index to 1 when converting single list (type: numbered, start: -3)', () => {
				test.data(
					'<ol start="-3">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {start:1}
						# Bar
					` ),

					'<ol>' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>'
				);
			} );

			it( 'should convert when the list is in the middle of the content', () => {
				test.data(
					'<p>Paragraph.</p>' +
					'<ol start="5">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>' +
					'<p>Paragraph.</p>',

					modelList( `
						Paragraph.
						# Foo {id:000} {start:5}
						# Bar {id:001}
						Paragraph.
					` )
				);
			} );

			it( 'should convert on a nested list', () => {
				test.data(
					'<ul>' +
						'<li>' +
							'cd' +
							'<ol start="3">' +
								'<li>efg</li>' +
							'</ol>' +
						'</li>' +
					'</ul>',

					modelList( `
						* cd {id:001}
						  # efg {id:000} {start:3}
					` )
				);
			} );

			it( 'should convert on a nested list (same type)', () => {
				test.data(
					'<ol>' +
						'<li>' +
							'cd' +
							'<ol start="7">' +
								'<li>efg</li>' +
							'</ol>' +
						'</li>' +
					'</ol>',

					modelList( `
						# cd {id:001} {start:1}
						  # efg {id:000} {start:7}
					` )
				);
			} );

			it( 'view ol converter should not fire if change was already consumed', () => {
				editor.data.upcastDispatcher.on( 'element:ol', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.viewItem, { attributes: 'start' } );
				}, { priority: 'highest' } );

				test.data(
					'<ol start="4">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {start:1}
						# Bar
					` ),

					'<ol>' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>'
				);
			} );

			it( 'should use modeRange provided from higher priority converter', () => {
				editor.data.upcastDispatcher.on( 'element:ol', ( evt, data, conversionApi ) => {
					const { modelRange, modelCursor } = conversionApi.convertChildren( data.viewItem, data.modelCursor );

					data.modelRange = modelRange;
					data.modelCursor = modelCursor;
				}, { priority: 'highest' } );

				test.data(
					'<ol start="3">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {start:3}
						# Bar
					` )
				);
			} );

			it( 'should not apply attribute on elements that does not accept it', () => {
				model.schema.register( 'block', {
					allowWhere: '$block',
					allowContentOf: '$block'
				} );
				editor.conversion.elementToElement( { view: 'div', model: 'block' } );

				test.data(
					'<ol start="2">' +
						'<li>Foo</li>' +
						'<li><div>x</div></li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {start:2}
						<block>x</block>
						# Bar {start:2}
					` ),

					'<ol start="2">' +
						'<li>Foo</li>' +
					'</ol>' +
					'<div>x</div>' +
					'<ol start="2">' +
						'<li>Bar</li>' +
					'</ol>'
				);
			} );

			it( 'should not consume attribute while upcasting if not applied', () => {
				const spy = sinon.spy();

				model.schema.addAttributeCheck( ( ctx, attributeName ) => attributeName != 'listStart' );
				editor.conversion.for( 'upcast' ).add(
					dispatcher => dispatcher.on( 'element:ol', ( evt, data, conversionApi ) => {
						expect( conversionApi.consumable.test( data.viewItem, { attributes: 'start' } ) ).to.be.true;
						spy();
					}, { priority: 'lowest' } )
				);

				test.data(
					'<ol start="3">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {start:1}
						# Bar
					` ),

					'<ol>' +
					'<li>Foo</li>' +
					'<li>Bar</li>' +
					'</ol>'
				);

				expect( spy.calledOnce ).to.be.true;
			} );

			describe( 'copy and getSelectedContent()', () => {
				it( 'should be able to downcast part of a nested list', () => {
					setModelData( model, modelList( `
						# A
						  # [B1 {start:4}
						    B2
						    # C1] {start:1}
						      C2
					` ) );

					const modelFragment = model.getSelectedContent( model.document.selection );
					const viewFragment = editor.data.toView( modelFragment );
					const data = editor.data.htmlProcessor.toData( viewFragment );

					expect( data ).to.equal(
						'<ol start="4">' +
							'<li>' +
								'<p>B1</p>' +
								'<p>B2</p>' +
								'<ol>' +
									'<li>C1</li>' +
								'</ol>' +
							'</li>' +
						'</ol>'
					);
				} );

				it( 'should be able to downcast part of a deep nested list', () => {
					setModelData( model, modelList( `
						# A
						  # B1 {start:4}
						    B2
						    # [C1 {start:7}
						    # C2]
					` ) );

					const modelFragment = model.getSelectedContent( model.document.selection );
					const viewFragment = editor.data.toView( modelFragment );
					const data = editor.data.htmlProcessor.toData( viewFragment );

					expect( data ).to.equal(
						'<ol start="7">' +
							'<li>C1</li>' +
							'<li>C2</li>' +
						'</ol>'
					);
				} );
			} );
		} );

		describe( 'editing pipeline', () => {
			describe( 'insert', () => {
				it( 'should convert single list (type: numbered, start: 1)', () => {
					test.insert(
						modelList( `
							x
							# [<paragraph>Foo</paragraph> {start:1}
							# <paragraph>Bar</paragraph>]
						` ),

						'<p>x</p>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">Foo</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
						'</ol>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should convert single list (type: numbered, start:5)', () => {
					test.insert(
						modelList( `
							x
							# [<paragraph>Foo</paragraph> {start:5}
							# <paragraph>Bar</paragraph>]
						` ),

						'<p>x</p>' +
						'<ol start="5">' +
							'<li><span class="ck-list-bogus-paragraph">Foo</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
						'</ol>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should convert nested numbered list', () => {
					test.insert(
						modelList( `
							x
							# [<paragraph>Foo 1</paragraph> {start:1}
							  # <paragraph>Bar 1</paragraph> {start:7}
							  # <paragraph>Bar 2</paragraph>
						    # <paragraph>Foo 2</paragraph>
						    # <paragraph>Foo 3</paragraph>]
						` ),

						'<p>x</p>' +
						'<ol>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">Foo 1</span>' +
								'<ol start="7">' +
									'<li><span class="ck-list-bogus-paragraph">Bar 1</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">Bar 2</span></li>' +
								'</ol>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">Foo 2</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Foo 3</span></li>' +
						'</ol>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should convert properly nested list', () => {
					// ■ Level 0
					//     ▶ Level 0.1
					//         ○ Level 0.1.1
					//     ▶ Level 0.2
					//         ○ Level 0.2.1
					test.insert(
						modelList( `
							x
							# [<paragraph>Level 0</paragraph> {start:1}
							  # <paragraph>Level 0.1</paragraph> {start:1}
							    # <paragraph>Level 0.1.1</paragraph> {start:3}
							  # <paragraph>Level 0.2</paragraph>
							    # <paragraph>Level 0.2.1</paragraph>] {start:12}
						` ),

						'<p>x</p>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">Level 0</span>' +
								'<ol>' +
									'<li><span class="ck-list-bogus-paragraph">Level 0.1</span>' +
										'<ol start="3">' +
											'<li><span class="ck-list-bogus-paragraph">Level 0.1.1</span></li>' +
										'</ol>' +
									'</li>' +
									'<li><span class="ck-list-bogus-paragraph">Level 0.2</span>' +
										'<ol start="12">' +
											'<li><span class="ck-list-bogus-paragraph">Level 0.2.1</span></li>' +
										'</ol>' +
									'</li>' +
								'</ol>' +
							'</li>' +
						'</ol>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should unwrap list item only if it was really wrapped (there was no wrapper for the start:1)', () => {
					test.insert(
						modelList( `
							x
							* [<paragraph>cd</paragraph>
							  # <paragraph>efg</paragraph>] {start:5}
						` ),

						'<p>x</p>' +
						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">cd</span>' +
								'<ol start="5">' +
									'<li><span class="ck-list-bogus-paragraph">efg</span></li>' +
								'</ol>' +
							'</li>' +
						'</ul>'
					);
				} );
			} );

			describe( 'remove', () => {
				it( 'remove a list item', () => {
					test.remove(
						modelList( `
							<paragraph>p</paragraph>
							# [<paragraph>a</paragraph>] {start:6}
							# <paragraph>b</paragraph>
							# <paragraph>c</paragraph>
						` ),

						'<p>p</p>' +
						'<ol start="6">' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ol>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );
			} );

			describe( 'set list reversed', () => {
				it( 'on a flat list', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph>
						# <paragraph>b</paragraph>]
					` );

					const output =
						'<ol start="2">' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.setAttribute( 'listStart', 2, selection.getFirstRange() );
						} );
					} );
				} );

				it( 'on a list with nested lists', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph> {start:1}
						  # <paragraph>b</paragraph> {start:1}
						# <paragraph>c</paragraph>]
					` );

					const output =
						'<ol start="6">' +
							'<li><span class="ck-list-bogus-paragraph">a</span>' +
								'<ol>' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'</ol>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							for ( const item of selection.getFirstRange().getItems( { shallow: true } ) ) {
								if ( item.getAttribute( 'listIndent' ) == 0 ) {
									writer.setAttribute( 'listStart', 6, item );
								}
							}
						} );
					} );
				} );
			} );

			describe( 'change list start index', () => {
				it( 'on a flat list', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph> {start:2}
						# <paragraph>b</paragraph>]
					` );

					const output =
						'<ol start="6">' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.setAttribute( 'listStart', 6, selection.getFirstRange() );
						} );
					} );
				} );

				it( 'on a list with nested lists', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph> {start:2}
						  # <paragraph>b</paragraph> {start:4}
						# <paragraph>c</paragraph>]
					` );

					const output =
						'<ol start="11">' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ol start="4">' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'</ol>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							for ( const item of selection.getFirstRange().getItems( { shallow: true } ) ) {
								if ( item.getAttribute( 'listIndent' ) == 0 ) {
									writer.setAttribute( 'listStart', 11, item );
								}
							}
						} );
					} );
				} );
			} );

			describe( 'change list type', () => {
				it( 'on a flat list', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph> {start:2}
						# <paragraph>b</paragraph>]
					` );

					const output =
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.setAttribute( 'listType', 'bulleted', selection.getFirstRange() );
						} );
					} );
				} );

				it( 'on a list with nested lists', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph> {start:2}
						  # <paragraph>b</paragraph> {start:5}
						# <paragraph>c</paragraph>]
					` );

					const output =
						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ol start="5">' +
									'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
								'</ol>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ul>';

					test.test( input, output, selection => {
						model.change( writer => {
							for ( const item of selection.getFirstRange().getItems( { shallow: true } ) ) {
								if ( item.getAttribute( 'listIndent' ) == 0 ) {
									writer.setAttribute( 'listType', 'bulleted', item );
								}
							}
						} );
					} );
				} );
			} );

			describe( 'change list indent', () => {
				it( 'should update list attribute elements', () => {
					const input = modelList( [
						'* <paragraph>a</paragraph>',
						'* [<paragraph>b</paragraph>',
						'  # <paragraph>c</paragraph>] {start:4}'
					] );

					const output =
						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph">b</span>' +
										'<ol start="4">' +
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
					editor.editing.downcastDispatcher.on( 'attribute:listStart', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, evt.name );
					}, { priority: 'highest' } );

					setModelData( model,
						'<paragraph listIndent="0" listItemId="a" listType="numbered">a</paragraph>'
					);

					model.change( writer => {
						writer.setAttribute( 'listStart', 4, modelRoot.getChild( 0 ) );
					} );

					expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
						'</ol>'
					);
				} );
			} );
		} );
	} );

	describe( 'mixed properties', () => {
		beforeEach( () => setupEditor( {
			list: {
				properties: {
					styles: true,
					startIndex: true,
					reversed: true
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
						# Foo {style:default} {start:1} {reversed:false}
						# Bar
					` )
				);
			} );

			it( 'should not convert list start on bulleted single list (type: bulleted)', () => {
				test.data(
					'<ul start="5">' +
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

			it( 'should not convert list reversed on bulleted single list (type: bulleted)', () => {
				test.data(
					'<ul reversed="reversed">' +
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

			it( 'should convert single list (type: numbered, styled, reversed, start: 5)', () => {
				test.data(
					'<ol style="list-style-type:lower-latin;" reversed="reversed" start="5">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>',

					modelList( `
						# Foo {style:lower-latin} {start:5} {reversed:true}
						# Bar
					` )
				);
			} );

			it( 'should convert when the list is in the middle of the content', () => {
				test.data(
					'<p>Paragraph.</p>' +
					'<ol style="list-style-type:lower-latin;" reversed="reversed" start="5">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>' +
					'<p>Paragraph.</p>',

					modelList( `
						Paragraph.
						# Foo {id:000} {style:lower-latin} {start:5} {reversed:true}
						# Bar {id:001}
						Paragraph.
					` )
				);
			} );

			it( 'should convert on a nested list', () => {
				test.data(
					'<ul>' +
						'<li>' +
							'cd' +
							'<ol style="list-style-type:lower-latin;" reversed="reversed" start="5">' +
								'<li>efg</li>' +
							'</ol>' +
						'</li>' +
					'</ul>',

					modelList( `
						* cd {id:001} {style:default}
						  # efg {id:000} {style:lower-latin} {start:5} {reversed:true}
					` )
				);
			} );

			it( 'should convert on a nested list (same type)', () => {
				test.data(
					'<ol>' +
						'<li>' +
							'cd' +
							'<ol style="list-style-type:lower-latin;" reversed="reversed" start="5">' +
								'<li>efg</li>' +
							'</ol>' +
						'</li>' +
					'</ol>',

					modelList( `
						# cd {id:001} {style:default} {start:1} {reversed:false}
						  # efg {id:000} {style:lower-latin} {start:5} {reversed:true}
					` )
				);
			} );
		} );

		describe( 'editing pipeline', () => {
			describe( 'insert', () => {
				it( 'should convert single list (type: numbered, start: 1, reversed:false, style:default)', () => {
					test.insert(
						modelList( `
							x
							# [<paragraph>Foo</paragraph> {start:1} {reversed:false} {style:default}
							# <paragraph>Bar</paragraph>]
						` ),

						'<p>x</p>' +
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">Foo</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
						'</ol>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should convert single list (type: numbered, start:5, reversed:true, style:lower-alpha)', () => {
					test.insert(
						modelList( `
							x
							# [<paragraph>Foo</paragraph> {start:5} {reversed:true} {style:lower-latin}
							# <paragraph>Bar</paragraph>]
						` ),

						'<p>x</p>' +
						'<ol reversed="reversed" start="5" style="list-style-type:lower-latin">' +
							'<li><span class="ck-list-bogus-paragraph">Foo</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Bar</span></li>' +
						'</ol>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );

				it( 'should convert nested numbered list', () => {
					test.insert(
						modelList( `
							x
							# [<paragraph>Foo 1</paragraph> {start:1} {reversed:true} {style:lower-latin}
							  # <paragraph>Bar 1</paragraph> {start:7} {reversed:false} {style:upper-latin}
							  # <paragraph>Bar 2</paragraph>
						    # <paragraph>Foo 2</paragraph>
						    # <paragraph>Foo 3</paragraph>]
						` ),

						'<p>x</p>' +
						'<ol reversed="reversed" style="list-style-type:lower-latin">' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">Foo 1</span>' +
								'<ol start="7" style="list-style-type:upper-latin">' +
									'<li><span class="ck-list-bogus-paragraph">Bar 1</span></li>' +
									'<li><span class="ck-list-bogus-paragraph">Bar 2</span></li>' +
								'</ol>' +
							'</li>' +
							'<li><span class="ck-list-bogus-paragraph">Foo 2</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">Foo 3</span></li>' +
						'</ol>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );
			} );

			describe( 'remove', () => {
				it( 'remove a list item', () => {
					test.remove(
						modelList( `
							<paragraph>p</paragraph>
							# [<paragraph>a</paragraph>] {start:6} {reversed:true} {style:lower-latin}
							# <paragraph>b</paragraph>
							# <paragraph>c</paragraph>
						` ),

						'<p>p</p>' +
						'<ol reversed="reversed" start="6" style="list-style-type:lower-latin">' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">c</span></li>' +
						'</ol>'
					);

					expect( test.reconvertSpy.callCount ).to.equal( 0 );
				} );
			} );

			describe( 'set list properties', () => {
				it( 'list start on list with defined style', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph> {style:lower-latin}
						# <paragraph>b</paragraph>]
					` );

					const output =
						'<ol start="2" style="list-style-type:lower-latin">' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.setAttribute( 'listStart', 2, selection.getFirstRange() );
						} );
					} );
				} );

				it( 'list start on list with defined style and reversed', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph> {style:lower-latin} {reversed:true}
						# <paragraph>b</paragraph>]
					` );

					const output =
						'<ol reversed="reversed" start="2" style="list-style-type:lower-latin">' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.setAttribute( 'listStart', 2, selection.getFirstRange() );
						} );
					} );
				} );

				it( 'list start and reversed on list with defined style', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph> {style:lower-latin}
						# <paragraph>b</paragraph>]
					` );

					const output =
						'<ol reversed="reversed" start="2" style="list-style-type:lower-latin">' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.setAttribute( 'listStart', 2, selection.getFirstRange() );
							writer.setAttribute( 'listReversed', true, selection.getFirstRange() );
						} );
					} );
				} );
			} );

			describe( 'change list property value', () => {
				it( 'change of list start', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph> {style:lower-latin} {start:4}
						# <paragraph>b</paragraph>]
					` );

					const output =
						'<ol start="2" style="list-style-type:lower-latin">' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.setAttribute( 'listStart', 2, selection.getFirstRange() );
						} );
					} );
				} );

				it( 'list start and reversed', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph> {style:lower-latin} {reversed:false} {start:6}
						# <paragraph>b</paragraph>]
					` );

					const output =
						'<ol reversed="reversed" start="2" style="list-style-type:lower-latin">' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.setAttribute( 'listStart', 2, selection.getFirstRange() );
							writer.setAttribute( 'listReversed', true, selection.getFirstRange() );
						} );
					} );
				} );

				it( 'list start, reversed, and style', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph> {style:lower-latin} {reversed:false} {start:3}
						# <paragraph>b</paragraph>]
					` );

					const output =
						'<ol reversed="reversed" start="2" style="list-style-type:upper-latin">' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.setAttribute( 'listStart', 2, selection.getFirstRange() );
							writer.setAttribute( 'listReversed', true, selection.getFirstRange() );
							writer.setAttribute( 'listStyle', 'upper-latin', selection.getFirstRange() );
						} );
					} );
				} );
			} );

			describe( 'change list type', () => {
				it( 'to numbered', () => {
					const input = modelList( `
						* [<paragraph>a</paragraph> {style:default}
						* <paragraph>b</paragraph>]
					` );

					const output =
						'<ol>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ol>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.setAttribute( 'listType', 'numbered', selection.getFirstRange() );
						} );
					} );
				} );

				it( 'to bulleted', () => {
					const input = modelList( `
						# [<paragraph>a</paragraph> {start:2} {style:lower-latin} {reversed:true}
						# <paragraph>b</paragraph>]
					` );

					const output =
						'<ul>' +
							'<li><span class="ck-list-bogus-paragraph">a</span></li>' +
							'<li><span class="ck-list-bogus-paragraph">b</span></li>' +
						'</ul>';

					test.test( input, output, selection => {
						model.change( writer => {
							writer.setAttribute( 'listType', 'bulleted', selection.getFirstRange() );
						} );
					} );
				} );
			} );

			describe( 'change list indent', () => {
				it( 'should update list attribute elements', () => {
					const input = modelList( [
						'* <paragraph>a</paragraph>',
						'* [<paragraph>b</paragraph>',
						'  # <paragraph>c</paragraph>] {start:4} {reversed:true} {style:lower-latin}'
					] );

					const output =
						'<ul>' +
							'<li>' +
								'<span class="ck-list-bogus-paragraph">a</span>' +
								'<ul>' +
									'<li>' +
										'<span class="ck-list-bogus-paragraph">b</span>' +
										'<ol reversed="reversed" start="4" style="list-style-type:lower-latin">' +
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
		} );
	} );

	async function setupEditor( config = {} ) {
		editor = await VirtualTestEditor.create( {
			plugins: [ Paragraph, IndentEditing, ClipboardPipeline, BoldEditing, ListPropertiesEditing, UndoEditing,
				BlockQuoteEditing, TableEditing, HeadingEditing, AlignmentEditing ],
			...config
		} );

		model = editor.model;
		modelDoc = model.document;
		modelRoot = modelDoc.getRoot();

		view = editor.editing.view;

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
