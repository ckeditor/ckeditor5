/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import ListStyleEditing from '../src/liststyleediting';
import TodoListEditing from '../src/todolistediting';
import ListStyleCommand from '../src/liststylecommand';

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
					'<listItem listIndent="0" listStyle="default"  listType="numbered">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="default"  listType="numbered">Bar</listItem>'
				);

				editor.execute( 'bulletedList' );

				expect( getModelData( model ) ).to.equal(
					'<listItem listIndent="0" listStyle="default" listType="bulleted">Foo Bar.[]</listItem>' +
					'<listItem listIndent="0" listStyle="default" listType="numbered">Foo</listItem>' +
					'<listItem listIndent="0" listStyle="default" listType="numbered">Bar</listItem>'
				);
			} );

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
	} );
} );
