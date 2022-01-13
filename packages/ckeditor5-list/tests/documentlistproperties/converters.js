/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
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
import { getData as getModelData, parse as parseModel, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import stubUid from '../documentlist/_utils/uid';
import DocumentListPropertiesEditing from '../../src/documentlistproperties/documentlistpropertiesediting';
import { modelList, setupTestHelpers } from '../documentlist/_utils/utils';

describe.only( 'DocumentListPropertiesEditing - converters', () => {
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

			it.skip( 'should 1', () => {
				test.data(
					'<ol style="list-style-type:upper-roman;" reversed="reversed" start="7">' +
						'<li>foo</li>' +
						'<li>bar</li>' +
					'</ol>',

					modelList( `
						# foo {reversed:true} {start:7} {style:upper-roman}
						# bar
					` )
				);
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

			// it( 'should convert nested and mixed lists', () => {
			// 	editor.setData(
			// 		'<ol style="list-style-type:upper-alpha;">' +
			// 		'<li>OL 1</li>' +
			// 		'<li>OL 2' +
			// 		'<ul style="list-style-type:circle;">' +
			// 		'<li>UL 1</li>' +
			// 		'<li>UL 2</li>' +
			// 		'</ul>' +
			// 		'</li>' +
			// 		'<li>OL 3</li>' +
			// 		'</ol>'
			// 	);
			//
			// 	expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			// 		'<listItem listIndent="0" listStyle="upper-alpha" listType="numbered">OL 1</listItem>' +
			// 		'<listItem listIndent="0" listStyle="upper-alpha" listType="numbered">OL 2</listItem>' +
			// 		'<listItem listIndent="1" listStyle="circle" listType="bulleted">UL 1</listItem>' +
			// 		'<listItem listIndent="1" listStyle="circle" listType="bulleted">UL 2</listItem>' +
			// 		'<listItem listIndent="0" listStyle="upper-alpha" listType="numbered">OL 3</listItem>'
			// 	);
			// } );
			//
			// it( 'should convert when the list is in the middle of the content', () => {
			// 	editor.setData(
			// 		'<p>Paragraph.</p>' +
			// 		'<ol style="list-style-type:upper-alpha;">' +
			// 		'<li>Foo</li>' +
			// 		'<li>Bar</li>' +
			// 		'</ol>' +
			// 		'<p>Paragraph.</p>'
			// 	);
			//
			// 	expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
			// 		'<paragraph>Paragraph.</paragraph>' +
			// 		'<listItem listIndent="0" listStyle="upper-alpha" listType="numbered">Foo</listItem>' +
			// 		'<listItem listIndent="0" listStyle="upper-alpha" listType="numbered">Bar</listItem>' +
			// 		'<paragraph>Paragraph.</paragraph>'
			// 	);
			// } );
			//
			// // See: #8262.
			// describe( 'list conversion with surrounding text nodes', () => {
			// 	let editor;
			//
			// 	beforeEach( () => {
			// 		return VirtualTestEditor
			// 			.create( {
			// 				plugins: [ Paragraph, ListPropertiesEditing ],
			// 				list: {
			// 					properties: { styles: true, startIndex: false, reversed: false }
			// 				}
			// 			} )
			// 			.then( newEditor => {
			// 				editor = newEditor;
			// 			} );
			// 	} );
			//
			// 	afterEach( () => {
			// 		return editor.destroy();
			// 	} );
			//
			// 	it( 'should convert a list if raw text is before the list', () => {
			// 		editor.setData( 'Foo<ul><li>Foo</li></ul>' );
			//
			// 		expect( editor.getData() ).to.equal( '<p>Foo</p><ul><li>Foo</li></ul>' );
			// 	} );
			//
			// 	it( 'should convert a list if raw text is after the list', () => {
			// 		editor.setData( '<ul><li>Foo</li></ul>Foo' );
			//
			// 		expect( editor.getData() ).to.equal( '<ul><li>Foo</li></ul><p>Foo</p>' );
			// 	} );
			//
			// 	it( 'should convert a list if it is surrender by two text nodes', () => {
			// 		editor.setData( 'Foo<ul><li>Foo</li></ul>Foo' );
			//
			// 		expect( editor.getData() ).to.equal( '<p>Foo</p><ul><li>Foo</li></ul><p>Foo</p>' );
			// 	} );
			// } );
		} );

		// describe( 'conversion in data pipeline', () => {
		// 	describe( 'model to data', () => {
		// 		it( 'should convert single list (type: bulleted)', () => {
		// 			setModelData( model,
		// 				'<listItem listIndent="0" listType="bulleted">Foo</listItem>' +
		// 				'<listItem listIndent="0" listType="bulleted">Bar</listItem>'
		// 			);
		//
		// 			expect( editor.getData() ).to.equal( '<ul><li>Foo</li><li>Bar</li></ul>' );
		// 		} );
		//
		// 		it( 'should convert single list (type: numbered)', () => {
		// 			setModelData( model,
		// 				'<listItem listIndent="0" listType="numbered">Foo</listItem>' +
		// 				'<listItem listIndent="0" listType="numbered">Bar</listItem>'
		// 			);
		//
		// 			expect( editor.getData() ).to.equal( '<ol><li>Foo</li><li>Bar</li></ol>' );
		// 		} );
		//
		// 		it( 'should convert single list (type: bulleted, style: default)', () => {
		// 			setModelData( model,
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="default">Foo</listItem>' +
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="default">Bar</listItem>'
		// 			);
		//
		// 			expect( editor.getData() ).to.equal( '<ul><li>Foo</li><li>Bar</li></ul>' );
		// 		} );
		//
		// 		it( 'should convert single list (type: numbered, style: default)', () => {
		// 			setModelData( model,
		// 				'<listItem listIndent="0" listType="numbered" listStyle="default">Foo</listItem>' +
		// 				'<listItem listIndent="0" listType="numbered" listStyle="default">Bar</listItem>'
		// 			);
		//
		// 			expect( editor.getData() ).to.equal( '<ol><li>Foo</li><li>Bar</li></ol>' );
		// 		} );
		//
		// 		it( 'should convert single list (type: bulleted, style: circle)', () => {
		// 			setModelData( model,
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo</listItem>' +
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="circle">Bar</listItem>'
		// 			);
		//
		// 			expect( editor.getData() ).to.equal( '<ul style="list-style-type:circle;"><li>Foo</li><li>Bar</li></ul>' );
		// 		} );
		//
		// 		it( 'should convert single list (type: numbered, style: upper-alpha)', () => {
		// 			setModelData( model,
		// 				'<listItem listIndent="0" listType="numbered" listStyle="upper-alpha">Foo</listItem>' +
		// 				'<listItem listIndent="0" listType="numbered" listStyle="upper-alpha">Bar</listItem>'
		// 			);
		//
		// 			expect( editor.getData() ).to.equal( '<ol style="list-style-type:upper-alpha;"><li>Foo</li><li>Bar</li></ol>' );
		// 		} );
		//
		// 		it( 'should convert nested bulleted lists (main: circle, nested: disc)', () => {
		// 			setModelData( model,
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 1</listItem>' +
		// 				'<listItem listIndent="1" listType="bulleted" listStyle="disc">Bar 1</listItem>' +
		// 				'<listItem listIndent="1" listType="bulleted" listStyle="disc">Bar 2</listItem>' +
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 2</listItem>' +
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 3</listItem>'
		// 			);
		//
		// 			expect( editor.getData() ).to.equal(
		// 				'<ul style="list-style-type:circle;">' +
		// 				'<li>Foo 1' +
		// 				'<ul style="list-style-type:disc;">' +
		// 				'<li>Bar 1</li>' +
		// 				'<li>Bar 2</li>' +
		// 				'</ul>' +
		// 				'</li>' +
		// 				'<li>Foo 2</li>' +
		// 				'<li>Foo 3</li>' +
		// 				'</ul>'
		// 			);
		// 		} );
		//
		// 		it( 'should convert nested numbered lists (main: decimal-leading-zero, nested: lower-latin)', () => {
		// 			setModelData( model,
		// 				'<listItem listIndent="0" listType="numbered" listStyle="decimal-leading-zero">Foo 1</listItem>' +
		// 				'<listItem listIndent="1" listType="numbered" listStyle="lower-latin">Bar 1</listItem>' +
		// 				'<listItem listIndent="1" listType="numbered" listStyle="lower-latin">Bar 2</listItem>' +
		// 				'<listItem listIndent="0" listType="numbered" listStyle="decimal-leading-zero">Foo 2</listItem>' +
		// 				'<listItem listIndent="0" listType="numbered" listStyle="decimal-leading-zero">Foo 3</listItem>'
		// 			);
		//
		// 			expect( editor.getData() ).to.equal(
		// 				'<ol style="list-style-type:decimal-leading-zero;">' +
		// 				'<li>Foo 1' +
		// 				'<ol style="list-style-type:lower-latin;">' +
		// 				'<li>Bar 1</li>' +
		// 				'<li>Bar 2</li>' +
		// 				'</ol>' +
		// 				'</li>' +
		// 				'<li>Foo 2</li>' +
		// 				'<li>Foo 3</li>' +
		// 				'</ol>'
		// 			);
		// 		} );
		//
		// 		it( 'should convert nested mixed lists (ul>ol, main: square, nested: lower-roman)', () => {
		// 			setModelData( model,
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="square">Foo 1</listItem>' +
		// 				'<listItem listIndent="1" listType="numbered" listStyle="lower-roman">Bar 1</listItem>' +
		// 				'<listItem listIndent="1" listType="numbered" listStyle="lower-roman">Bar 2</listItem>' +
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="square">Foo 2</listItem>' +
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="square">Foo 3</listItem>'
		// 			);
		//
		// 			expect( editor.getData() ).to.equal(
		// 				'<ul style="list-style-type:square;">' +
		// 				'<li>Foo 1' +
		// 				'<ol style="list-style-type:lower-roman;">' +
		// 				'<li>Bar 1</li>' +
		// 				'<li>Bar 2</li>' +
		// 				'</ol>' +
		// 				'</li>' +
		// 				'<li>Foo 2</li>' +
		// 				'<li>Foo 3</li>' +
		// 				'</ul>'
		// 			);
		// 		} );
		//
		// 		it( 'should produce nested lists (different `listIndent` attribute)', () => {
		// 			setModelData( model,
		// 				'<listItem listIndent="0" listType="numbered" listStyle="decimal">Foo 1</listItem>' +
		// 				'<listItem listIndent="0" listType="numbered" listStyle="decimal">Foo 2</listItem>' +
		// 				'<listItem listIndent="1" listType="numbered" listStyle="decimal">Bar 1</listItem>' +
		// 				'<listItem listIndent="1" listType="numbered" listStyle="decimal">Bar 2</listItem>'
		// 			);
		//
		// 			expect( editor.getData() ).to.equal(
		// 				'<ol style="list-style-type:decimal;">' +
		// 				'<li>Foo 1</li>' +
		// 				'<li>Foo 2' +
		// 				'<ol style="list-style-type:decimal;">' +
		// 				'<li>Bar 1</li>' +
		// 				'<li>Bar 2</li>' +
		// 				'</ol>' +
		// 				'</li>' +
		// 				'</ol>'
		// 			);
		// 		} );
		//
		// 		it( 'should produce two different lists (different `listType` attribute)', () => {
		// 			setModelData( model,
		// 				'<listItem listIndent="0" listType="numbered" listStyle="decimal">Foo 1</listItem>' +
		// 				'<listItem listIndent="0" listType="numbered" listStyle="decimal">Foo 2</listItem>' +
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="disc">Bar 1</listItem>' +
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="disc">Bar 2</listItem>'
		// 			);
		//
		// 			expect( editor.getData() ).to.equal(
		// 				'<ol style="list-style-type:decimal;">' +
		// 				'<li>Foo 1</li>' +
		// 				'<li>Foo 2</li>' +
		// 				'</ol>' +
		// 				'<ul style="list-style-type:disc;">' +
		// 				'<li>Bar 1</li>' +
		// 				'<li>Bar 2</li>' +
		// 				'</ul>'
		// 			);
		// 		} );
		//
		// 		it( 'should produce two different lists (different `listStyle` attribute)', () => {
		// 			setModelData( model,
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="disc">Foo 1</listItem>' +
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="disc">Foo 2</listItem>' +
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="circle">Bar 1</listItem>' +
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="circle">Bar 2</listItem>'
		// 			);
		//
		// 			expect( editor.getData() ).to.equal(
		// 				'<ul style="list-style-type:disc;">' +
		// 				'<li>Foo 1</li>' +
		// 				'<li>Foo 2</li>' +
		// 				'</ul>' +
		// 				'<ul style="list-style-type:circle;">' +
		// 				'<li>Bar 1</li>' +
		// 				'<li>Bar 2</li>' +
		// 				'</ul>'
		// 			);
		// 		} );
		// 	} );
		// } );
		//
		// // At this moment editing and data pipelines produce exactly the same content.
		// // Just a few tests will be enough here. `model to data` block contains all cases checked.
		// describe( 'conversion in editing pipeline', () => {
		// 	describe( 'model to view', () => {
		// 		it( 'should convert single list (type: bulleted, style: default)', () => {
		// 			setModelData( model,
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="default">Foo</listItem>' +
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="default">Bar</listItem>'
		// 			);
		//
		// 			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
		// 				'<ul><li>Foo</li><li>Bar</li></ul>'
		// 			);
		// 		} );
		//
		// 		it( 'should convert single list (type: bulleted, style: circle)', () => {
		// 			setModelData( model,
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo</listItem>' +
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="circle">Bar</listItem>'
		// 			);
		//
		// 			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
		// 				'<ul style="list-style-type:circle"><li>Foo</li><li>Bar</li></ul>'
		// 			);
		// 		} );
		//
		// 		it( 'should convert nested bulleted lists (main: circle, nested: disc)', () => {
		// 			setModelData( model,
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 1</listItem>' +
		// 				'<listItem listIndent="1" listType="bulleted" listStyle="disc">Bar 1</listItem>' +
		// 				'<listItem listIndent="1" listType="bulleted" listStyle="disc">Bar 2</listItem>' +
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 2</listItem>' +
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="circle">Foo 3</listItem>'
		// 			);
		//
		// 			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
		// 				'<ul style="list-style-type:circle">' +
		// 				'<li>Foo 1' +
		// 				'<ul style="list-style-type:disc">' +
		// 				'<li>Bar 1</li>' +
		// 				'<li>Bar 2</li>' +
		// 				'</ul>' +
		// 				'</li>' +
		// 				'<li>Foo 2</li>' +
		// 				'<li>Foo 3</li>' +
		// 				'</ul>'
		// 			);
		// 		} );
		//
		// 		// See: #8081.
		// 		it( 'should convert properly nested list styles', () => {
		// 			// ■ Level 0
		// 			//     ▶ Level 0.1
		// 			//         ○ Level 0.1.1
		// 			//     ▶ Level 0.2
		// 			//         ○ Level 0.2.1
		// 			setModelData( model,
		// 				'<listItem listIndent="0" listType="bulleted" listStyle="default">Level 0</listItem>' +
		// 				'<listItem listIndent="1" listType="bulleted" listStyle="default">Level 0.1</listItem>' +
		// 				'<listItem listIndent="2" listType="bulleted" listStyle="circle">Level 0.1.1</listItem>' +
		// 				'<listItem listIndent="1" listType="bulleted" listStyle="default">Level 0.2</listItem>' +
		// 				'<listItem listIndent="2" listType="bulleted" listStyle="circle">Level 0.2.1</listItem>'
		// 			);
		//
		// 			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
		// 				'<ul>' +
		// 				'<li>Level 0' +
		// 				'<ul>' +
		// 				'<li>Level 0.1' +
		// 				'<ul style="list-style-type:circle">' +
		// 				'<li>Level 0.1.1</li>' +
		// 				'</ul>' +
		// 				'</li>' +
		// 				'<li>Level 0.2' +
		// 				'<ul style="list-style-type:circle">' +
		// 				'<li>Level 0.2.1</li>' +
		// 				'</ul>' +
		// 				'</li>' +
		// 				'</ul>' +
		// 				'</li>' +
		// 				'</ul>'
		// 			);
		// 		} );
		// 	} );
		// } );
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
