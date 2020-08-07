/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import ListStylesEditing from '../src/liststylesediting';
import TodoListEditing from '../src/todolistediting';

describe( 'ListStylesEditing', () => {
	let editor, model, view;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, ListStylesEditing, TodoListEditing ]
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
		expect( ListStylesEditing.pluginName ).to.equal( 'ListStylesEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListStylesEditing ) ).to.be.instanceOf( ListStylesEditing );
	} );

	describe( 'schema rules', () => {
		it( 'should allow set `listStyle` on the `listItem`', () => {
			expect( model.schema.checkAttribute( [ '$root', 'listItem' ], 'listStyle' ) ).to.be.true;
		} );

		it( 'should not accept `listStyle` on the `listItem` element with `listType:todo` attribute', () => {
			const todoListItem = new ModelElement( 'listItem', { listType: 'todo' } );

			expect( model.schema.checkAttribute( [ '$root', todoListItem ], 'listStyle' ) ).to.be.false;
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
					'<ol style="list-style-type:upper-alpha;"><li>Foo</li><li>Bar</li></ol>' +
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
} );
