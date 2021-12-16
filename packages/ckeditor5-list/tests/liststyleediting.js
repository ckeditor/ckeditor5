/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import ListStyleEditing from '../src/liststyleediting';
import TodoListEditing from '../src/todolistediting';
import ListStyleCommand from '../src/liststylecommand';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';

describe( 'ListStyleEditing', () => {
	let editor, model, view;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, ListStyleEditing, UndoEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				view = editor.editing.view;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( ListStyleEditing.pluginName ).to.equal( 'ListStyleEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListStyleEditing ) ).to.be.instanceOf( ListStyleEditing );
	} );

	describe( 'schema rules', () => {
		it( 'should allow set `listStyle` on the `listItem`', () => {
			expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listStyle' ) ).to.be.true;
		} );
	} );

	describe( 'command', () => {
		it( 'should register listStyle command', () => {
			const command = editor.commands.get( 'listStyle' );

			expect( command ).to.be.instanceOf( ListStyleCommand );
		} );
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to data', () => {
			it( 'should convert single list (type: bulleted)', () => {
				setModelData( model,
					'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
				);

				expect( editor.getData() ).to.equal( '<ul><li>Foo</li><li>Bar</li></ul>' );
			} );

			it( 'should convert single list (type: numbered)', () => {
				setModelData( model,
					'<listItem listIndent="0" listType="numbered">Foo</listItem>' +
					'<listItem listIndent="0" listType="numbered">Bar</listItem>'
				);

				expect( editor.getData() ).to.equal( '<ol><li>Foo</li><li>Bar</li></ol>' );
			} );

			it( 'should convert single list (type: bulleted, style: default)', () => {
				setModelData( model,
					'<listItem listIndent="0" listType="bulleted" listStyle="default">Foo</listItem>' +
					'<listItem listIndent="0" listType="bulleted" listStyle="default">Bar</listItem>'
				);

				expect( editor.getData() ).to.equal( '<ul><li>Foo</li><li>Bar</li></ul>' );
			} );

			it( 'should convert single list (type: numbered, style: default)', () => {
				setModelData( model,
					'<listItem listIndent="0" listType="numbered" listStyle="default">Foo</listItem>' +
					'<listItem listIndent="0" listType="numbered" listStyle="default">Bar</listItem>'
				);

				expect( editor.getData() ).to.equal( '<ol><li>Foo</li><li>Bar</li></ol>' );
			} );

			it( 'should convert single list (type: bulleted, style: circle)', () => {
				setModelData( model,
					'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo</listItem>' +
					'<listItem listIndent="0" listType="bulleted" listStyle="circle">Bar</listItem>'
				);

				expect( editor.getData() ).to.equal( '<ul style="list-style-type:circle;"><li>Foo</li><li>Bar</li></ul>' );
			} );

			it( 'should convert single list (type: numbered, style: upper-alpha)', () => {
				setModelData( model,
					'<listItem listIndent="0" listType="numbered" listStyle="upper-alpha">Foo</listItem>' +
					'<listItem listIndent="0" listType="numbered" listStyle="upper-alpha">Bar</listItem>'
				);

				expect( editor.getData() ).to.equal( '<ol style="list-style-type:upper-alpha;"><li>Foo</li><li>Bar</li></ol>' );
			} );

			it( 'should convert nested bulleted lists (main: circle, nested: disc)', () => {
				setModelData( model,
					'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 1</listItem>' +
					'<listItem listIndent="1" listType="bulleted" listStyle="disc">Bar 1</listItem>' +
					'<listItem listIndent="1" listType="bulleted" listStyle="disc">Bar 2</listItem>' +
					'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 2</listItem>' +
					'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 3</listItem>'
				);

				expect( editor.getData() ).to.equal(
					'<ul style="list-style-type:circle;">' +
						'<li>Foo 1' +
							'<ul style="list-style-type:disc;">' +
								'<li>Bar 1</li>' +
								'<li>Bar 2</li>' +
							'</ul>' +
						'</li>' +
						'<li>Foo 2</li>' +
						'<li>Foo 3</li>' +
					'</ul>'
				);
			} );

			it( 'should convert nested numbered lists (main: decimal-leading-zero, nested: lower-latin)', () => {
				setModelData( model,
					'<listItem listIndent="0" listType="numbered" listStyle="decimal-leading-zero">Foo 1</listItem>' +
					'<listItem listIndent="1" listType="numbered" listStyle="lower-latin">Bar 1</listItem>' +
					'<listItem listIndent="1" listType="numbered" listStyle="lower-latin">Bar 2</listItem>' +
					'<listItem listIndent="0" listType="numbered" listStyle="decimal-leading-zero">Foo 2</listItem>' +
					'<listItem listIndent="0" listType="numbered" listStyle="decimal-leading-zero">Foo 3</listItem>'
				);

				expect( editor.getData() ).to.equal(
					'<ol style="list-style-type:decimal-leading-zero;">' +
						'<li>Foo 1' +
							'<ol style="list-style-type:lower-latin;">' +
								'<li>Bar 1</li>' +
								'<li>Bar 2</li>' +
							'</ol>' +
						'</li>' +
						'<li>Foo 2</li>' +
						'<li>Foo 3</li>' +
					'</ol>'
				);
			} );

			it( 'should convert nested mixed lists (ul>ol, main: square, nested: lower-roman)', () => {
				setModelData( model,
					'<listItem listIndent="0" listType="bulleted" listStyle="square">Foo 1</listItem>' +
					'<listItem listIndent="1" listType="numbered" listStyle="lower-roman">Bar 1</listItem>' +
					'<listItem listIndent="1" listType="numbered" listStyle="lower-roman">Bar 2</listItem>' +
					'<listItem listIndent="0" listType="bulleted" listStyle="square">Foo 2</listItem>' +
					'<listItem listIndent="0" listType="bulleted" listStyle="square">Foo 3</listItem>'
				);

				expect( editor.getData() ).to.equal(
					'<ul style="list-style-type:square;">' +
						'<li>Foo 1' +
							'<ol style="list-style-type:lower-roman;">' +
								'<li>Bar 1</li>' +
								'<li>Bar 2</li>' +
							'</ol>' +
						'</li>' +
						'<li>Foo 2</li>' +
						'<li>Foo 3</li>' +
					'</ul>'
				);
			} );

			it( 'should produce nested lists (different `listIndent` attribute)', () => {
				setModelData( model,
					'<listItem listIndent="0" listType="numbered" listStyle="decimal">Foo 1</listItem>' +
					'<listItem listIndent="0" listType="numbered" listStyle="decimal">Foo 2</listItem>' +
					'<listItem listIndent="1" listType="numbered" listStyle="decimal">Bar 1</listItem>' +
					'<listItem listIndent="1" listType="numbered" listStyle="decimal">Bar 2</listItem>'
				);

				expect( editor.getData() ).to.equal(
					'<ol style="list-style-type:decimal;">' +
						'<li>Foo 1</li>' +
						'<li>Foo 2' +
							'<ol style="list-style-type:decimal;">' +
								'<li>Bar 1</li>' +
								'<li>Bar 2</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'should produce two different lists (different `listType` attribute)', () => {
				setModelData( model,
					'<listItem listIndent="0" listType="numbered" listStyle="decimal">Foo 1</listItem>' +
					'<listItem listIndent="0" listType="numbered" listStyle="decimal">Foo 2</listItem>' +
					'<listItem listIndent="0" listType="bulleted" listStyle="disc">Bar 1</listItem>' +
					'<listItem listIndent="0" listType="bulleted" listStyle="disc">Bar 2</listItem>'
				);

				expect( editor.getData() ).to.equal(
					'<ol style="list-style-type:decimal;">' +
						'<li>Foo 1</li>' +
						'<li>Foo 2</li>' +
					'</ol>' +
					'<ul style="list-style-type:disc;">' +
						'<li>Bar 1</li>' +
						'<li>Bar 2</li>' +
					'</ul>'
				);
			} );

			it( 'should produce two different lists (different `listStyle` attribute)', () => {
				setModelData( model,
					'<listItem listIndent="0" listType="bulleted" listStyle="disc">Foo 1</listItem>' +
					'<listItem listIndent="0" listType="bulleted" listStyle="disc">Foo 2</listItem>' +
					'<listItem listIndent="0" listType="bulleted" listStyle="circle">Bar 1</listItem>' +
					'<listItem listIndent="0" listType="bulleted" listStyle="circle">Bar 2</listItem>'
				);

				expect( editor.getData() ).to.equal(
					'<ul style="list-style-type:disc;">' +
						'<li>Foo 1</li>' +
						'<li>Foo 2</li>' +
					'</ul>' +
					'<ul style="list-style-type:circle;">' +
						'<li>Bar 1</li>' +
						'<li>Bar 2</li>' +
					'</ul>'
				);
			} );

			it( 'should not allow to set the `listStyle` attribute in to-do list item', () => {
				setModelData( model, '<listItem listIndent="0" listType="todo">Foo</listItem>' );

				const listItem = model.document.getRoot().getChild( 0 );

				expect( listItem.hasAttribute( 'listItem' ) ).to.be.false;

				model.change( writer => {
					writer.setAttribute( 'listType', 'foo', listItem );
				} );

				expect( listItem.hasAttribute( 'listItem' ) ).to.be.false;
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert single list (type: bulleted)', () => {
				editor.setData( '<ul><li>Foo</li><li>Bar</li></ul>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="default" listType="bulleted">Bar</listItem>'
				);
			} );

			it( 'should convert single list (type: numbered)', () => {
				editor.setData( '<ol><li>Foo</li><li>Bar</li></ol>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem listIndent="0" listStyle="default" listType="numbered">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="default" listType="numbered">Bar</listItem>'
				);
			} );

			it( 'should convert single list (type: bulleted, style: circle)', () => {
				editor.setData( '<ul style="list-style-type:circle;"><li>Foo</li><li>Bar</li></ul>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);
			} );

			it( 'should convert single list (type: numbered, style: upper-alpha)', () => {
				editor.setData( '<ol style="list-style-type:upper-alpha;"><li>Foo</li><li>Bar</li></ol>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem listIndent="0" listStyle="upper-alpha" listType="numbered">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="upper-alpha" listType="numbered">Bar</listItem>'
				);
			} );

			it( 'should convert nested and mixed lists', () => {
				editor.setData(
					'<ol style="list-style-type:upper-alpha;">' +
						'<li>OL 1</li>' +
						'<li>OL 2' +
							'<ul style="list-style-type:circle;">' +
								'<li>UL 1</li>' +
								'<li>UL 2</li>' +
							'</ul>' +
						'</li>' +
						'<li>OL 3</li>' +
					'</ol>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<listItem listIndent="0" listStyle="upper-alpha" listType="numbered">OL 1</listItem>' +
					'<listItem listIndent="0" listStyle="upper-alpha" listType="numbered">OL 2</listItem>' +
					'<listItem listIndent="1" listStyle="circle" listType="bulleted">UL 1</listItem>' +
					'<listItem listIndent="1" listStyle="circle" listType="bulleted">UL 2</listItem>' +
					'<listItem listIndent="0" listStyle="upper-alpha" listType="numbered">OL 3</listItem>'
				);
			} );

			it( 'should convert when the list is in the middle of the content', () => {
				editor.setData(
					'<p>Paragraph.</p>' +
					'<ol style="list-style-type:upper-alpha;">' +
						'<li>Foo</li>' +
						'<li>Bar</li>' +
					'</ol>' +
					'<p>Paragraph.</p>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>Paragraph.</paragraph>' +
					'<listItem listIndent="0" listStyle="upper-alpha" listType="numbered">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="upper-alpha" listType="numbered">Bar</listItem>' +
					'<paragraph>Paragraph.</paragraph>'
				);
			} );

			// See: #8262.
			describe( 'list conversion with surrounding text nodes', () => {
				let editor;

				beforeEach( () => {
					return VirtualTestEditor
						.create( {
							plugins: [ Paragraph, ListStyleEditing ]
						} )
						.then( newEditor => {
							editor = newEditor;
						} );
				} );

				afterEach( () => {
					return editor.destroy();
				} );

				it( 'should convert a list if raw text is before the list', () => {
					editor.setData( 'Foo<ul><li>Foo</li></ul>' );

					expect( editor.getData() ).to.equal( '<p>Foo</p><ul><li>Foo</li></ul>' );
				} );

				it( 'should convert a list if raw text is after the list', () => {
					editor.setData( '<ul><li>Foo</li></ul>Foo' );

					expect( editor.getData() ).to.equal( '<ul><li>Foo</li></ul><p>Foo</p>' );
				} );

				it( 'should convert a list if it is surrender by two text nodes', () => {
					editor.setData( 'Foo<ul><li>Foo</li></ul>Foo' );

					expect( editor.getData() ).to.equal( '<p>Foo</p><ul><li>Foo</li></ul><p>Foo</p>' );
				} );
			} );
		} );
	} );

	// At this moment editing and data pipelines produce exactly the same content.
	// Just a few tests will be enough here. `model to data` block contains all cases checked.
	describe( 'conversion in editing pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert single list (type: bulleted, style: default)', () => {
				setModelData( model,
					'<listItem listIndent="0" listType="bulleted" listStyle="default">Foo</listItem>' +
					'<listItem listIndent="0" listType="bulleted" listStyle="default">Bar</listItem>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<ul><li>Foo</li><li>Bar</li></ul>'
				);
			} );

			it( 'should convert single list (type: bulleted, style: circle)', () => {
				setModelData( model,
					'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo</listItem>' +
					'<listItem listIndent="0" listType="bulleted" listStyle="circle">Bar</listItem>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<ul style="list-style-type:circle"><li>Foo</li><li>Bar</li></ul>'
				);
			} );

			it( 'should convert nested bulleted lists (main: circle, nested: disc)', () => {
				setModelData( model,
					'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 1</listItem>' +
					'<listItem listIndent="1" listType="bulleted" listStyle="disc">Bar 1</listItem>' +
					'<listItem listIndent="1" listType="bulleted" listStyle="disc">Bar 2</listItem>' +
					'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 2</listItem>' +
					'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 3</listItem>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<ul style="list-style-type:circle">' +
						'<li>Foo 1' +
							'<ul style="list-style-type:disc">' +
								'<li>Bar 1</li>' +
								'<li>Bar 2</li>' +
							'</ul>' +
						'</li>' +
						'<li>Foo 2</li>' +
						'<li>Foo 3</li>' +
					'</ul>'
				);
			} );

			// See: #8081.
			it( 'should convert properly nested list styles', () => {
				// ■ Level 0
				//     ▶ Level 0.1
				//         ○ Level 0.1.1
				//     ▶ Level 0.2
				//         ○ Level 0.2.1
				setModelData( model,
					'<listItem listIndent="0" listType="bulleted" listStyle="default">Level 0</listItem>' +
					'<listItem listIndent="1" listType="bulleted" listStyle="default">Level 0.1</listItem>' +
					'<listItem listIndent="2" listType="bulleted" listStyle="circle">Level 0.1.1</listItem>' +
					'<listItem listIndent="1" listType="bulleted" listStyle="default">Level 0.2</listItem>' +
					'<listItem listIndent="2" listType="bulleted" listStyle="circle">Level 0.2.1</listItem>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<ul>' +
						'<li>Level 0' +
							'<ul>' +
								'<li>Level 0.1' +
									'<ul style="list-style-type:circle">' +
										'<li>Level 0.1.1</li>' +
									'</ul>' +
								'</li>' +
								'<li>Level 0.2' +
									'<ul style="list-style-type:circle">' +
										'<li>Level 0.2.1</li>' +
									'</ul>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );
		} );
	} );

	describe( 'integrations', () => {
		describe( 'merging a list into a styled list', () => {
			it( 'should inherit the list style attribute when merging the same kind of lists (from top, merge a single item)', () => {
				setModelData( model,
					'<paragraph>Foo Bar.[]</paragraph>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);

				editor.execute( 'bulletedList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo Bar.[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);
			} );

			it( 'should inherit the list style attribute when merging the same kind of lists (from top, merge a few items)', () => {
				setModelData( model,
					'<paragraph>[Foo Bar 1.</paragraph>' +
					'<paragraph>Foo Bar 2.]</paragraph>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);

				editor.execute( 'bulletedList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">[Foo Bar 1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo Bar 2.]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);
			} );

			it( 'should not inherit anything if there is no list below the inserted list', () => {
				setModelData( model,
					'<paragraph>Foo Bar 1.[]</paragraph>' +
					'<paragraph>Foo Bar 2.</paragraph>'
				);

				editor.execute( 'bulletedList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo Bar 1.[]</listItem>' +
					'<paragraph>Foo Bar 2.</paragraph>'
				);
			} );

			it( 'should not inherit anything if replacing the entire content with a list', () => {
				setModelData( model,
					'<paragraph>Foo Bar 1.[]</paragraph>'
				);

				editor.execute( 'bulletedList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo Bar 1.[]</listItem>'
				);
			} );

			it( 'should not inherit the list style attribute when merging different kind of lists (from top, merge a single item)', () => {
				setModelData( model,
					'<paragraph>Foo Bar.[]</paragraph>' +
					'<listItem listIndent="0" listStyle="decimal-leading-zero" listType="numbered">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="decimal-leading-zero" listType="numbered">Bar</listItem>'
				);

				editor.execute( 'bulletedList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo Bar.[]</listItem>' +
					'<listItem listIndent="0" listStyle="decimal-leading-zero" listType="numbered">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="decimal-leading-zero" listType="numbered">Bar</listItem>'
				);
			} );

			it(
				'should not inherit the list style attribute when merging different kind of lists (from bottom, merge a single item)',
				() => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="decimal-leading-zero" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="decimal-leading-zero" listType="numbered">Bar</listItem>' +
						'<paragraph>Foo Bar.[]</paragraph>'
					);

					editor.execute( 'bulletedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="decimal-leading-zero" listType="numbered">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="decimal-leading-zero" listType="numbered">Bar</listItem>' +
						'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo Bar.[]</listItem>'
					);
				}
			);

			it( 'should inherit the list style attribute when merging the same kind of lists (from bottom, merge a single item)', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>' +
					'<paragraph>Foo Bar.[]</paragraph>'
				);

				editor.execute( 'bulletedList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo Bar.[]</listItem>'
				);
			} );

			it(
				'should inherit the list style attribute from listIndent=0 element when merging the same kind of lists (from bottom)',
				() => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStyle="square" listType="bulleted">Bar</listItem>' +
						'<listItem listIndent="2" listStyle="disc" listType="bulleted">Foo Bar</listItem>' +
						'<paragraph>Foo Bar.[]</paragraph>'
					);

					editor.execute( 'bulletedList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="1" listStyle="square" listType="bulleted">Bar</listItem>' +
						'<listItem listIndent="2" listStyle="disc" listType="bulleted">Foo Bar</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo Bar.[]</listItem>'
					);
				}
			);
		} );

		describe( 'modifying "listType" attribute', () => {
			it( 'should inherit the list style attribute when the modified list is the same kind of the list as next sibling', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="default" listType="numbered">Foo Bar.[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);

				editor.execute( 'bulletedList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo Bar.[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);
			} );

			it( 'should inherit the list style attribute when the modified list is the same kind of the list as previous sibling', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>' +
					'<listItem listIndent="0" listStyle="default" listType="numbered">Foo Bar.[]</listItem>'
				);

				editor.execute( 'bulletedList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo Bar.[]</listItem>'
				);
			} );

			it( 'should not inherit the list style attribute when the modified list already has defined it (next sibling check)', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo Bar.[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);

				editor.execute( 'listStyle', { type: 'disc' } );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="disc" listType="bulleted">Foo Bar.[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);
			} );

			it(
				'should not inherit the list style attribute when the modified list already has defined it (previous sibling check)',
				() => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>' +
						'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo Bar.[]</listItem>'
					);

					editor.execute( 'listStyle', { type: 'disc' } );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>' +
						'<listItem listIndent="0" listStyle="disc" listType="bulleted">Foo Bar.[]</listItem>'
					);
				}
			);
		} );

		describe( 'indenting lists', () => {
			it( 'should restore the default value for the list style attribute when indenting a single item', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">1A.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2B.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
				);

				editor.execute( 'indentList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">1A.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2B.</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">2.[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
				);
			} );

			it( 'should restore the default value for the list style attribute when indenting a few items', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">[2.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.]</listItem>'
				);

				editor.execute( 'indentList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">[2.</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">3.]</listItem>'
				);
			} );

			it(
				'should copy the value for the list style attribute when indenting a single item into a nested list (default value)',
				() => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">3.[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.</listItem>'
					);
				}
			);

			it(
				'should copy the value for the list style attribute when indenting a single item into a nested list (changed value)',
				() => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="disc" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="disc" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="1" listStyle="disc" listType="bulleted">3.[]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.</listItem>'
					);
				}
			);

			it( 'should copy the value for the list style attribute when indenting a single item into a nested list', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.[]</listItem>' +
					'<listItem listIndent="1" listStyle="square" listType="bulleted">3.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.</listItem>'
				);

				editor.execute( 'indentList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">2.[]</listItem>' +
					'<listItem listIndent="2" listStyle="square" listType="bulleted">3.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.</listItem>'
				);
			} );

			it(
				'should copy the value for the list style attribute when indenting a single item into a nested list ' +
				'(many nested lists check)',
				() => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="disc" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="2" listStyle="square" listType="bulleted">3.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.[]</listItem>'
					);

					editor.execute( 'indentList' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="1" listStyle="disc" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="2" listStyle="square" listType="bulleted">3.</listItem>' +
						'<listItem listIndent="1" listStyle="disc" listType="bulleted">4.[]</listItem>'
					);
				}
			);

			it( 'should inherit the list style attribute from nested list if the `listType` is other than indenting element', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">2.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.[]</listItem>'
				);

				editor.execute( 'indentList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">2.</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">3.[]</listItem>'
				);
			} );

			// See: #8072.
			it( 'should not throw when indenting a list without any other content in the editor', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="default" listType="bulleted">[]</listItem>'
				);

				editor.execute( 'indentList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">[]</listItem>'
				);
			} );
		} );

		describe( 'outdenting lists', () => {
			it( 'should inherit the list style attribute from parent list (change the first nested item)', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">2.[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
				);

				editor.execute( 'outdentList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
				);
			} );

			it( 'should inherit the list style attribute from parent list (change the second nested item)', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">2.</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">3.[]</listItem>'
				);

				editor.execute( 'outdentList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">2.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.[]</listItem>'
				);
			} );

			it( 'should inherit the list style attribute from parent list (modifying nested lists)', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">[2.</listItem>' +
					'<listItem listIndent="2" listStyle="square" listType="bulleted">3.]</listItem>'
				);

				editor.execute( 'outdentList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">[2.</listItem>' +
					'<listItem listIndent="1" listStyle="square" listType="bulleted">3.]</listItem>'
				);
			} );

			it(
				'should inherit the list style attribute from parent list (outdenting many items, including the first one in the list)',
				() => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">[1.</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="2" listStyle="square" listType="bulleted">3.]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<paragraph>[1.</paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="1" listStyle="square" listType="bulleted">3.]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">4.</listItem>'
					);
				}
			);

			it(
				'should inherit the list style attribute from parent list (outdenting the first item that is a parent for next list)',
				() => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>' +
						'<listItem listIndent="1" listStyle="default" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="2" listStyle="square" listType="bulleted">3.</listItem>' +
						'<listItem listIndent="3" listStyle="disc" listType="bulleted">4.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">5.</listItem>'
					);

					editor.execute( 'outdentList' );

					expect( getModelData( model ) ).to.equal(
						'<paragraph>1.[]</paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="1" listStyle="square" listType="bulleted">3.</listItem>' +
						'<listItem listIndent="2" listStyle="disc" listType="bulleted">4.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">5.</listItem>'
					);
				}
			);

			it( 'should not inherit the list style if outdented the only one item in the list', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>' +
					'<listItem listIndent="1" listStyle="disc" listType="bulleted">2.</listItem>' +
					'<listItem listIndent="2" listStyle="square" listType="bulleted">3.</listItem>'
				);

				editor.execute( 'outdentList' );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>1.[]</paragraph>' +
					'<listItem listIndent="0" listStyle="disc" listType="bulleted">2.</listItem>' +
					'<listItem listIndent="1" listStyle="square" listType="bulleted">3.</listItem>'
				);
			} );

			it( 'should not inherit the list style if outdented the only one item in the list (a paragraph below the list)', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>' +
					'<listItem listIndent="1" listStyle="disc" listType="bulleted">2.</listItem>' +
					'<listItem listIndent="2" listStyle="square" listType="bulleted">3.</listItem>' +
					'<paragraph>Foo</paragraph>'
				);

				editor.execute( 'outdentList' );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>1.[]</paragraph>' +
					'<listItem listIndent="0" listStyle="disc" listType="bulleted">2.</listItem>' +
					'<listItem listIndent="1" listStyle="square" listType="bulleted">3.</listItem>' +
					'<paragraph>Foo</paragraph>'
				);
			} );

			it( 'should not inherit the list style attribute from parent list if the `listType` is other than outdenting element', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">2.[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
				);

				editor.execute( 'outdentList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="decimal" listType="numbered">2.[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
				);
			} );

			it( 'should not do anything if there is no list after outdenting', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.[]</listItem>'
				);

				editor.execute( 'outdentList' );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>1.[]</paragraph>'
				);
			} );
		} );

		describe( 'indent/outdent + undo', () => {
			it( 'should use the same batch for indenting a list and updating `listType` attribute', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">1A.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2B.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
				);

				editor.execute( 'indentList' );
				editor.execute( 'undo' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">1A.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2B.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
				);
			} );

			it( 'should use the same batch for outdenting a list and updating `listType` attribute', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">2.[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
				);

				editor.execute( 'outdentList' );
				editor.execute( 'undo' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">2.[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>'
				);
			} );
		} );

		describe( 'delete + undo', () => {
			let editor, model, view;

			beforeEach( () => {
				return VirtualTestEditor
					.create( {
						plugins: [ Paragraph, ListStyleEditing, Typing, UndoEditing ]
					} )
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
						view = editor.editing.view;
					} );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			// See: #7930.
			it( 'should restore proper list style attribute after undo merging lists', () => {
				// ○ 1.
				// ○ 2.
				// ○ 3.
				// <paragraph>
				// ■ 1.
				// ■ 2.
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">3.</listItem>' +
					'<paragraph>[]</paragraph>' +
					'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>'
				);

				expect( getViewData( view, { withoutSelection: true } ), 'initial data' ).to.equal(
					'<ul style="list-style-type:circle">' +
						'<li>1.</li>' +
						'<li>2.</li>' +
						'<li>3.</li>' +
					'</ul>' +
					'<p></p>' +
					'<ul style="list-style-type:square">' +
						'<li>1.</li>' +
						'<li>2.</li>' +
					'</ul>'
				);

				// After removing the paragraph.
				// ○ 1.
				// ○ 2.
				// ○ 3.
				// ○ 1.
				// ○ 2.
				editor.execute( 'delete' );

				expect( getViewData( view, { withoutSelection: true } ), 'executing delete' ).to.equal(
					'<ul style="list-style-type:circle">' +
						'<li>1.</li>' +
						'<li>2.</li>' +
						'<li>3.</li>' +
						'<li>1.</li>' +
						'<li>2.</li>' +
					'</ul>'
				);

				// After undo.
				// ○ 1.
				// ○ 2.
				// ○ 3.
				// <paragraph>
				// ■ 1.
				// ■ 2.
				editor.execute( 'undo' );

				expect( getViewData( view, { withoutSelection: true } ), 'initial data' ).to.equal(
					'<ul style="list-style-type:circle">' +
						'<li>1.</li>' +
						'<li>2.</li>' +
						'<li>3.</li>' +
					'</ul>' +
					'<p></p>' +
					'<ul style="list-style-type:square">' +
						'<li>1.</li>' +
						'<li>2.</li>' +
					'</ul>'
				);
			} );
		} );

		describe( 'todo list', () => {
			let editor, model;

			beforeEach( () => {
				return VirtualTestEditor
					.create( {
						// TodoListEditing is at the end by design. Check `ListStyleEditing.afterInit()` call.
						plugins: [ Paragraph, ListStyleEditing, TodoListEditing ]
					} )
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
					} );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			it( 'should not add the `listStyle` attribute while creating a todo list', () => {
				setModelData( model, '<paragraph>Foo[]</paragraph>' );

				editor.execute( 'todoList' );

				expect( getModelData( model ), '<listItem listIndent="0" listType="todo">Foo[]</listItem>' );
			} );

			it( 'should not add the `listStyle` attribute while switching the list type', () => {
				setModelData( model, '<listItem listIndent="0" listType="bulleted">Foo[]</listItem>' );

				editor.execute( 'todoList' );

				expect( getModelData( model ), '<listItem listIndent="0" listType="todo">Foo[]</listItem>' );
			} );

			it( 'should remove the `listStyle` attribute while switching the list type that uses the list style feature', () => {
				setModelData( model, '<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo[]</listItem>' );

				editor.execute( 'todoList' );

				expect( getModelData( model ), '<listItem listIndent="0" listType="todo">Foo[]</listItem>' );
			} );

			it( 'should  not inherit the list style attribute when inserting a todo list item', () => {
				setModelData( model,
					'<paragraph>Foo Bar.[]</paragraph>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);

				editor.execute( 'todoList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listType="todo">Foo Bar.[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);
			} );
		} );

		describe( 'removing content between two lists', () => {
			let editor, model;

			beforeEach( () => {
				return VirtualTestEditor
					.create( {
						plugins: [ Paragraph, ListStyleEditing, Typing ]
					} )
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
					} );
			} );

			afterEach( () => {
				return editor.destroy();
			} );

			it( 'should not do anything while removing a letter inside a listItem', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="square" listType="bulleted">2.[]</listItem>' +
					'<paragraph></paragraph>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
				);

				editor.execute( 'delete' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="square" listType="bulleted">2[]</listItem>' +
					'<paragraph></paragraph>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
				);
			} );

			it( 'should not do anything if there is a non-listItem before the removed content', () => {
				setModelData( model,
					'<paragraph>Foo</paragraph>' +
					'<paragraph>[]</paragraph>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
				);

				editor.execute( 'delete' );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>Foo[]</paragraph>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
				);
			} );

			it( 'should not do anything if there is a non-listItem after the removed content', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
					'<paragraph>[]</paragraph>' +
					'<paragraph>Foo</paragraph>'
				);

				editor.execute( 'delete' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.[]</listItem>' +
					'<paragraph>Foo</paragraph>'
				);
			} );

			it( 'should not do anything if there is no element after the removed content', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>' +
					'<paragraph>[]</paragraph>'
				);

				editor.execute( 'delete' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.[]</listItem>'
				);
			} );

			it(
				'should modify the the `listStyle` attribute for the merged (second) list when removing content between those lists',
				() => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
						'<paragraph>[]</paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.[]</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>'
					);
				}
			);

			it( 'should read the `listStyle` attribute from the most outer list', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">2.1.</listItem>' +
					'<listItem listIndent="2" listStyle="default" listType="numbered">2.1.1</listItem>' +
					'<paragraph>[]</paragraph>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
				);

				editor.execute( 'delete' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">2.1.</listItem>' +
					'<listItem listIndent="2" listStyle="default" listType="numbered">2.1.1[]</listItem>' +
					'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>'
				);
			} );

			it(
				'should not modify the the `listStyle` attribute for the merged (second) list if merging different `listType` attribute',
				() => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
						'<paragraph>[]</paragraph>' +
						'<listItem listIndent="0" listStyle="decimal" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStyle="decimal" listType="numbered">2.</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.[]</listItem>' +
						'<listItem listIndent="0" listStyle="decimal" listType="numbered">1.</listItem>' +
						'<listItem listIndent="0" listStyle="decimal" listType="numbered">2.</listItem>'
					);
				}
			);

			it(
				'should modify the the `listStyle` attribute for the merged (second) list when removing content from both lists',
				() => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">[3.</listItem>' +
						'<paragraph>Foo</paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">[]</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>'
					);
				}
			);

			it(
				'should modify the the `listStyle` attribute for the merged (second) list when typing over content from both lists',
				() => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">[3.</listItem>' +
						'<paragraph>Foo</paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.]</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
					);

					editor.execute( 'input', { text: 'Foo' } );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">Foo[]</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>'
					);
				}
			);

			it(
				'should not modify the the `listStyle` if lists were not merged but the content was partially removed',
				() => {
					setModelData( model,
						'<listItem listIndent="0" listStyle="square" listType="bulleted">111.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">222.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">[333.</listItem>' +
						'<paragraph>Foo</paragraph>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">1]11.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
					);

					editor.execute( 'delete' );

					expect( getModelData( model ) ).to.equal(
						'<listItem listIndent="0" listStyle="square" listType="bulleted">111.</listItem>' +
						'<listItem listIndent="0" listStyle="square" listType="bulleted">222.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">[]11.</listItem>' +
						'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
					);
				}
			);

			it( 'should not do anything while typing in a list item', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="square" listType="bulleted">2.[]</listItem>' +
					'<listItem listIndent="0" listStyle="square" listType="bulleted">3.</listItem>' +
					'<paragraph></paragraph>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
				);

				const modelChangeStub = sinon.stub( model, 'change' ).callThrough();

				simulateTyping( ' Foo' );

				// Each character calls `editor.model.change()`.
				expect( modelChangeStub.callCount ).to.equal( 4 );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="square" listType="bulleted">2. Foo[]</listItem>' +
					'<listItem listIndent="0" listStyle="square" listType="bulleted">3.</listItem>' +
					'<paragraph></paragraph>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">2.</listItem>'
				);
			} );

			// See: #8073.
			it( 'should not crash when removing a content between intended lists', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="default" listType="bulleted">aaaa</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">bb[bb</listItem>' +
					'<listItem listIndent="2" listStyle="default" listType="bulleted">cc]cc</listItem>' +
					'<listItem listIndent="3" listStyle="default" listType="bulleted">dddd</listItem>'
				);

				editor.execute( 'delete' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="default" listType="bulleted">aaaa</listItem>' +
					'<listItem listIndent="1" listStyle="default" listType="bulleted">bb[]cc</listItem>' +
					'<listItem listIndent="2" listStyle="default" listType="bulleted">dddd</listItem>'
				);
			} );

			it( 'should read the `listStyle` attribute from the most outer selected list while removing content between lists', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">2.1.</listItem>' +
					'<listItem listIndent="2" listStyle="lower-latin" listType="numbered">2.1.1[foo</listItem>' +
					'<paragraph>Foo</paragraph>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="1" listStyle="circle" listType="bulleted">bar]2.</listItem>'
				);

				editor.execute( 'delete' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="square" listType="bulleted">1.</listItem>' +
					'<listItem listIndent="0" listStyle="square" listType="bulleted">2.</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">2.1.</listItem>' +
					'<listItem listIndent="2" listStyle="lower-latin" listType="numbered">2.1.1[]2.</listItem>'
				);
			} );

			function simulateTyping( text ) {
				// While typing, every character is an atomic change.
				text.split( '' ).forEach( character => {
					editor.execute( 'input', {
						text: character
					} );
				} );
			}
		} );

		// #8160
		describe( 'pasting a list into another list', () => {
			let element;

			beforeEach( () => {
				element = document.createElement( 'div' );
				document.body.append( element );

				return ClassicTestEditor
					.create( element, {
						plugins: [ Paragraph, Clipboard, ListStyleEditing, UndoEditing ]
					} )
					.then( newEditor => {
						editor = newEditor;
						model = editor.model;
					} );
			} );

			afterEach( () => {
				return editor.destroy()
					.then( () => {
						element.remove();
					} );
			} );

			it( 'should inherit attributes from the previous sibling element (collapsed selection)', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo Bar</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);

				pasteHtml( editor,
					'<ul style="list-style-type: square">' +
						'<li>Foo 1</li>' +
						'<li>Foo 2</li>' +
					'</ul>'
				);

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo Bar</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo 1</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo 2[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);
			} );

			it( 'should inherit attributes from the previous sibling element (non-collapsed selection)', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo Bar</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">[Foo]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);

				pasteHtml( editor,
					'<ul style="list-style-type: square">' +
						'<li>Foo 1</li>' +
						'<li>Foo 2</li>' +
					'</ul>'
				);

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo Bar</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo 1</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo 2[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);
			} );

			it( 'should inherit attributes from the previous sibling element (non-collapsed selection over a few elements)', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo Bar</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">[Foo 1.</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo 2.</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo 3.]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);

				pasteHtml( editor,
					'<ul style="list-style-type: square">' +
						'<li>Foo 1</li>' +
						'<li>Foo 2</li>' +
					'</ul>'
				);

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo Bar</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo 1</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo 2[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);
			} );

			it( 'should do nothing when pasting the similar list', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo Bar</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);

				pasteHtml( editor,
					'<ol style="list-style-type: decimal">' +
						'<li>Foo</li>' +
					'</ol>'
				);

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo Bar</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">Foo[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);
			} );

			it( 'should replace the entire list if selected', () => {
				setModelData( model,
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="1" listStyle="decimal" listType="numbered">[Foo Bar]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);

				pasteHtml( editor,
					'<ul style="list-style-type: square">' +
						'<li>Foo</li>' +
					'</ul>'
				);

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Foo</listItem>' +
					'<listItem listIndent="1" listStyle="square" listType="bulleted">Foo[]</listItem>' +
					'<listItem listIndent="0" listStyle="circle" listType="bulleted">Bar</listItem>'
				);
			} );

			function pasteHtml( editor, html ) {
				editor.editing.view.document.fire( 'paste', {
					dataTransfer: createDataTransfer( { 'text/html': html } ),
					stopPropagation() {},
					preventDefault() {}
				} );
			}

			function createDataTransfer( data ) {
				return {
					getData( type ) {
						return data[ type ];
					},
					setData() {}
				};
			}
		} );

		describe( 'the FontColor feature', () => {
			let editor, view, container;

			beforeEach( () => {
				container = document.createElement( 'div' );
				document.body.appendChild( container );

				return ClassicTestEditor
					.create( container, {
						plugins: [ Paragraph, ListStyleEditing, FontColor, Typing ]
					} )
					.then( newEditor => {
						editor = newEditor;
						view = editor.editing.view;
					} );
			} );

			afterEach( () => {
				container.remove();

				return editor.destroy();
			} );

			describe( 'spellchecking integration', () => {
				it( 'should not throw if a children mutation was fired over colorized text', () => {
					editor.setData(
						'<ul>' +
							'<li><span style="color:hsl(30, 75%, 60%);">helllo</span></li>' +
						'</ul>'
					);

					const viewRoot = view.document.getRoot();
					const viewLi = viewRoot.getChild( 0 ).getChild( 0 );

					// This should not throw. See #9325.
					view.document.fire( 'mutations',
						[
							{
								type: 'children',
								oldChildren: [
									viewLi.getChild( 0 )
								],
								newChildren: view.change( writer => [
									writer.createContainerElement( 'font' )
								] ),
								node: viewLi
							}
						]
					);
				} );
			} );
		} );
	} );
} );
