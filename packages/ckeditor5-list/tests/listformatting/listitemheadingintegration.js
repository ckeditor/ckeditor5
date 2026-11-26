/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { BlockQuoteEditing } from '@ckeditor/ckeditor5-block-quote';
import { HeadingEditing } from '@ckeditor/ckeditor5-heading';
import { BoldEditing } from '@ckeditor/ckeditor5-basic-styles';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { ModelElement, _setModelData, _getModelData, _getViewData } from '@ckeditor/ckeditor5-engine';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { stubUid } from '../list/_utils/uid.js';
import { ListEditing } from '../../src/list/listediting.js';
import { TodoListEditing } from '../../src/todolist/todolistediting.js';
import { ListItemHeadingIntegration } from '../../src/listformatting/listitemheadingintegration.js';

describe( 'ListItemHeadingIntegration', () => {
	let editor, model, view;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				ListItemHeadingIntegration,
				Paragraph,
				HeadingEditing,
				BlockQuoteEditing,
				BoldEditing,
				TodoListEditing,
				UndoEditing
			],
			list: {
				enableListItemMarkerFromBlock: true
			}
		} );

		model = editor.model;
		view = editor.editing.view;

		stubUid();
		vi.spyOn( editor.editing.view, 'scrollToTheSelection' ).mockImplementation( () => {} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( ListItemHeadingIntegration.pluginName ).toEqual( 'ListItemHeadingIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListItemHeadingIntegration.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListItemHeadingIntegration.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListItemHeadingIntegration ) ).to.be.instanceOf( ListItemHeadingIntegration );
	} );

	it( 'should require ListEditing plugin', () => {
		expect( ListItemHeadingIntegration.requires ).toEqual( [
			ListEditing
		] );
	} );

	describe( 'schema', () => {
		it( 'should allow listItemMarkerFromBlock attribute in $listItem', () => {
			const listItemHeading = new ModelElement( 'heading1', { listItemId: 'a' } );
			const listItemParagraph = new ModelElement( 'paragraph', { listItemId: 'a' } );

			expect( model.schema.checkAttribute( [ '$root', listItemHeading ], 'listItemMarkerFromBlock' ) ).toBe( true );
			expect( model.schema.checkAttribute( [ '$root', listItemParagraph ], 'listItemMarkerFromBlock' ) ).toBe( true );
		} );

		it( 'should not allow listItemMarkerFromBlock attribute outside of a list', () => {
			const heading = new ModelElement( 'heading1' );

			expect( model.schema.checkAttribute( [ '$root', heading ], 'listItemMarkerFromBlock' ) ).toBe( false );
		} );

		it( 'should not mark listItemMarkerFromBlock attribute as formatting (it is not removed by remove format)', () => {
			expect( model.schema.getAttributeProperties( 'listItemMarkerFromBlock' ) ).not.to.have.property( 'isFormatting' );
		} );
	} );

	describe( 'post-fixer', () => {
		it( 'should set the attribute on a heading in a bulleted list', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="bulleted">foo</heading1>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading1 listIndent="0" listItemId="a" listItemMarkerFromBlock="true" listType="bulleted">foo</heading1>'
			);
		} );

		it( 'should set the attribute on a heading in a numbered list', () => {
			_setModelData( model,
				'<heading2 listIndent="0" listItemId="a" listType="numbered">foo</heading2>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading2 listIndent="0" listItemId="a" listItemMarkerFromBlock="true" listType="numbered">foo</heading2>'
			);
		} );

		it( 'should set the attribute on an empty heading in a list', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="bulleted"></heading1>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading1 listIndent="0" listItemId="a" listItemMarkerFromBlock="true" listType="bulleted"></heading1>'
			);
		} );

		it( 'should not set the attribute on a paragraph in a list', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>'
			);
		} );

		it( 'should not set the attribute on a heading in a to-do list', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="todo">foo</heading1>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading1 listIndent="0" listItemId="a" listType="todo">foo</heading1>'
			);
		} );

		it( 'should set the attribute on a heading in a custom numbered or bulleted list', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="customNumbered">foo</heading1>' +
				'<heading1 listIndent="0" listItemId="b" listType="customBulleted">bar</heading1>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading1 listIndent="0" listItemId="a" listItemMarkerFromBlock="true" listType="customNumbered">foo</heading1>' +
				'<heading1 listIndent="0" listItemId="b" listItemMarkerFromBlock="true" listType="customBulleted">bar</heading1>'
			);
		} );

		it( 'should set the attribute on all blocks of a list item that starts with a heading', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="bulleted">foo</heading1>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="b" listType="bulleted">baz</paragraph>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading1 listIndent="0" listItemId="a" listItemMarkerFromBlock="true" listType="bulleted">foo</heading1>' +
				'<paragraph listIndent="0" listItemId="a" listItemMarkerFromBlock="true" listType="bulleted">bar</paragraph>' +
				'<paragraph listIndent="0" listItemId="b" listType="bulleted">baz</paragraph>'
			);
		} );

		it( 'should not set the attribute if the heading is not the first block of a list item', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
				'<heading1 listIndent="0" listItemId="a" listType="bulleted">bar</heading1>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
				'<heading1 listIndent="0" listItemId="a" listType="bulleted">bar</heading1>'
			);
		} );

		it( 'should not set the attribute on a nested list item (only the parent starts with a heading)', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="bulleted">foo</heading1>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">bar</paragraph>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading1 listIndent="0" listItemId="a" listItemMarkerFromBlock="true" listType="bulleted">foo</heading1>' +
				'<paragraph listIndent="1" listItemId="b" listType="bulleted">bar</paragraph>'
			);
		} );

		it( 'should set the attribute when a list item paragraph is changed to a heading', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">f[]oo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">bar</paragraph>'
			);

			editor.execute( 'heading', { value: 'heading1' } );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading1 listIndent="0" listItemId="a" listItemMarkerFromBlock="true" listType="bulleted">foo</heading1>' +
				'<paragraph listIndent="0" listItemId="a" listItemMarkerFromBlock="true" listType="bulleted">bar</paragraph>'
			);
		} );

		it( 'should remove the attribute when a list item heading is changed to a paragraph', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="bulleted">f[]oo</heading1>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">bar</paragraph>'
			);

			editor.execute( 'paragraph' );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">bar</paragraph>'
			);
		} );

		it( 'should restore the previous state on undo', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">f[]oo</paragraph>'
			);

			editor.execute( 'heading', { value: 'heading1' } );
			editor.execute( 'undo' );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>'
			);
		} );

		it( 'should set the attribute when a heading is changed into a list item', () => {
			_setModelData( model,
				'<heading1>f[]oo</heading1>'
			);

			editor.execute( 'numberedList' );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading1 listIndent="0" listItemId="a00" listItemMarkerFromBlock="true" listType="numbered">foo</heading1>'
			);
		} );

		it( 'should remove the attribute when a list item heading is moved out of the list', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="bulleted">f[]oo</heading1>'
			);

			editor.execute( 'bulletedList' );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading1>foo</heading1>'
			);
		} );

		it( 'should remove the attribute when a list is changed to a to-do list', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="bulleted">f[]oo</heading1>'
			);

			editor.execute( 'todoList' );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading1 listIndent="0" listItemId="a" listType="todo">foo</heading1>'
			);
		} );

		it( 'should update the attribute on the following block when the heading starting the list item is removed', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="bulleted">foo</heading1>' +
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">bar</paragraph>'
			);

			model.change( writer => {
				writer.remove( model.document.getRoot().getChild( 0 ) );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">bar</paragraph>'
			);
		} );

		it( 'should keep the attribute when the list item is indented', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
				'<heading1 listIndent="0" listItemId="b" listType="bulleted">b[]ar</heading1>'
			);

			editor.execute( 'indentList' );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>' +
				'<heading1 listIndent="1" listItemId="b" listItemMarkerFromBlock="true" listType="bulleted">bar</heading1>'
			);
		} );

		it( 'should keep the inline formatting attributes together with the marker from block', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="bulleted"><$text bold="true">foo</$text></heading1>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading1 listIndent="0" listItemBold="true" listItemId="a" listItemMarkerFromBlock="true" listType="bulleted">' +
					'<$text bold="true">foo</$text>' +
				'</heading1>'
			);
		} );
	} );

	describe( 'downcast', () => {
		it( 'should downcast the attribute as a class in <li> (editing and data)', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="bulleted">foo</heading1>' +
				'<paragraph listIndent="0" listItemId="b" listType="bulleted">bar</paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
				'<ul>' +
					'<li class="ck-list-marker-from-block"><h2>foo</h2></li>' +
					'<li><span class="ck-list-bogus-paragraph">bar</span></li>' +
				'</ul>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).toEqualMarkup(
				'<ul>' +
					'<li class="ck-list-marker-from-block"><h2>foo</h2></li>' +
					'<li>bar</li>' +
				'</ul>'
			);
		} );

		it( 'should downcast the attribute in a multi-block list item', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="numbered">foo</heading1>' +
				'<paragraph listIndent="0" listItemId="a" listType="numbered">bar</paragraph>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).toEqualMarkup(
				'<ol>' +
					'<li class="ck-list-marker-from-block"><h2>foo</h2><p>bar</p></li>' +
				'</ol>'
			);
		} );

		it( 'should combine the class with other marker formatting classes', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="bulleted"><$text bold="true">foo</$text></heading1>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
				'<ul>' +
					'<li class="ck-list-marker-bold ck-list-marker-from-block"><h2><strong>foo</strong></h2></li>' +
				'</ul>'
			);
		} );

		it( 'should remove the class when the heading is changed to a paragraph', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="bulleted">f[]oo</heading1>'
			);

			editor.execute( 'paragraph' );

			expect( _getViewData( view, { withoutSelection: true } ) ).toEqual(
				'<ul>' +
					'<li><span class="ck-list-bogus-paragraph">foo</span></li>' +
				'</ul>'
			);
		} );
	} );

	describe( 'upcast', () => {
		it( 'should upcast the class in <li> to the attribute', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-from-block"><h2>foo</h2></li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading1 listIndent="0" listItemId="a00" listItemMarkerFromBlock="true" listType="bulleted">foo</heading1>'
			);
		} );

		it( 'should set the attribute for a heading in <li> without the class', () => {
			editor.setData(
				'<ul>' +
					'<li><h2>foo</h2></li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading1 listIndent="0" listItemId="a00" listItemMarkerFromBlock="true" listType="bulleted">foo</heading1>'
			);
		} );

		it( 'should remove the attribute upcast from a class if the list item does not start with a heading', () => {
			editor.setData(
				'<ul>' +
					'<li class="ck-list-marker-from-block"><p>foo</p></li>' +
				'</ul>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<paragraph listIndent="0" listItemId="a00" listType="bulleted">foo</paragraph>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).toEqualMarkup(
				'<ul><li>foo</li></ul>'
			);
		} );
	} );

	describe( 'custom heading options', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ ListItemHeadingIntegration, Paragraph, HeadingEditing ],
				list: {
					enableListItemMarkerFromBlock: true
				},
				heading: {
					options: [
						{ model: 'paragraph', title: 'Paragraph' },
						{ model: 'headingFancy', view: { name: 'h2', classes: 'fancy' }, title: 'Fancy' }
					]
				}
			} );

			model = editor.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should set the attribute on a custom heading', () => {
			_setModelData( model,
				'<headingFancy listIndent="0" listItemId="a" listType="bulleted">foo</headingFancy>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<headingFancy listIndent="0" listItemId="a" listItemMarkerFromBlock="true" listType="bulleted">foo</headingFancy>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).toEqualMarkup(
				'<ul><li class="ck-list-marker-from-block"><h2 class="fancy">foo</h2></li></ul>'
			);
		} );

		it( 'should not treat the paragraph option as a heading', () => {
			_setModelData( model,
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<paragraph listIndent="0" listItemId="a" listType="bulleted">foo</paragraph>'
			);
		} );
	} );

	describe( 'content styles', () => {
		let editor, editorElement, styleElement;

		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			styleElement = document.createElement( 'style' );
			styleElement.textContent = '.ck-content h2 { font-weight: 400; }';
			document.head.appendChild( styleElement );

			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ ListItemHeadingIntegration, Paragraph, HeadingEditing, BoldEditing ],
				list: {
					enableListItemMarkerFromBlock: true
				}
			} );
		} );

		afterEach( async () => {
			editorElement.remove();
			styleElement.remove();
			await editor.destroy();
		} );

		it( 'should let the first block of the list item render the marker', () => {
			editor.setData( '<ol><li><h2>foo</h2><p>bar</p></li></ol>' );

			const domListItem = editor.ui.getEditableElement().querySelector( 'li' );
			const [ domHeading, domParagraph ] = domListItem.children;

			expect( window.getComputedStyle( domListItem ).display ).toBe( 'block' );
			expect( window.getComputedStyle( domHeading ).display ).toBe( 'list-item' );
			expect( window.getComputedStyle( domParagraph ).display ).toBe( 'block' );
		} );

		it( 'should apply the list item marker formatting to the marker rendered by the block', () => {
			editor.setData( '<ol><li><h2><strong>foo</strong></h2></li></ol>' );

			const domHeading = editor.ui.getEditableElement().querySelector( 'li > h2' );

			expect( window.getComputedStyle( domHeading, '::marker' ).fontWeight ).toBe( '700' );
		} );
	} );

	describe( 'headings preserved by the general HTML support', () => {
		let editor, model, editorElement;

		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ ListItemHeadingIntegration, Paragraph, HeadingEditing, GeneralHtmlSupport ],
				list: {
					enableListItemMarkerFromBlock: true
				},
				htmlSupport: {
					allow: [ { name: /^h[1-6]$/ } ]
				}
			} );

			model = editor.model;
		} );

		afterEach( async () => {
			editorElement.remove();
			await editor.destroy();
		} );

		it( 'should render the marker by a heading that is not covered by the heading options', () => {
			editor.setData( '<ul><li><h1>foo</h1></li><li><h5>bar</h5></li><li><p>baz</p></li></ul>' );

			expect( editor.getData( { skipListItemIds: true } ) ).toEqualMarkup(
				'<ul>' +
					'<li class="ck-list-marker-from-block"><h1>foo</h1></li>' +
					'<li class="ck-list-marker-from-block"><h5>bar</h5></li>' +
					'<li>baz</li>' +
				'</ul>'
			);
			expect( model.document.getRoot().getChild( 0 ).name ).toBe( 'htmlH1' );
		} );
	} );

	describe( 'headings preserved by the general HTML support without the heading feature', () => {
		let editor, editorElement;

		beforeEach( async () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ ListItemHeadingIntegration, Paragraph, GeneralHtmlSupport ],
				list: {
					enableListItemMarkerFromBlock: true
				},
				htmlSupport: {
					allow: [ { name: /^h[1-6]$/ } ]
				}
			} );
		} );

		afterEach( async () => {
			editorElement.remove();
			await editor.destroy();
		} );

		it( 'should render the marker by the heading', () => {
			editor.setData( '<ol><li><h2>foo</h2></li><li><p>bar</p></li></ol>' );

			expect( editor.getData( { skipListItemIds: true } ) ).toEqualMarkup(
				'<ol><li class="ck-list-marker-from-block"><h2>foo</h2></li><li>bar</li></ol>'
			);
			expect( editor.model.document.getRoot().getChild( 0 ).name ).toBe( 'htmlH2' );
		} );
	} );

	describe( 'when enableListItemMarkerFormatting is false', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ ListItemHeadingIntegration, Paragraph, HeadingEditing ],
				list: {
					enableListItemMarkerFormatting: false,
					enableListItemMarkerFromBlock: true
				}
			} );

			model = editor.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should not allow the attribute in the schema', () => {
			const listItemHeading = new ModelElement( 'heading1', { listItemId: 'a' } );

			expect( model.schema.checkAttribute( [ '$root', listItemHeading ], 'listItemMarkerFromBlock' ) ).toBe( false );
		} );

		it( 'should not set the attribute nor the class', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="bulleted">foo</heading1>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading1 listIndent="0" listItemId="a" listType="bulleted">foo</heading1>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).toEqualMarkup(
				'<ul><li><h2>foo</h2></li></ul>'
			);
		} );
	} );

	describe( 'when enableListItemMarkerFromBlock is not set', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ ListItemHeadingIntegration, Paragraph, HeadingEditing ]
			} );

			model = editor.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should be disabled by default', () => {
			expect( editor.config.get( 'list.enableListItemMarkerFromBlock' ) ).toBe( false );
		} );

		it( 'should not allow the attribute in the schema', () => {
			const listItemHeading = new ModelElement( 'heading1', { listItemId: 'a' } );

			expect( model.schema.checkAttribute( [ '$root', listItemHeading ], 'listItemMarkerFromBlock' ) ).toBe( false );
		} );

		it( 'should not set the attribute nor the class', () => {
			_setModelData( model,
				'<heading1 listIndent="0" listItemId="a" listType="bulleted">foo</heading1>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading1 listIndent="0" listItemId="a" listType="bulleted">foo</heading1>'
			);

			expect( editor.getData( { skipListItemIds: true } ) ).toEqualMarkup(
				'<ul><li><h2>foo</h2></li></ul>'
			);
		} );

		it( 'should not upcast the class', () => {
			editor.setData( '<ul><li class="ck-list-marker-from-block"><h2>foo</h2></li></ul>' );

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<heading1 listIndent="0" listItemId="a00" listType="bulleted">foo</heading1>'
			);
		} );
	} );

	describe( 'when disabled and the general HTML support allows list item classes', () => {
		let editor, editorElement;

		beforeEach( () => {
			editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );
		} );

		afterEach( async () => {
			editorElement.remove();
			await editor.destroy();
		} );

		it( 'should not preserve the class when enableListItemMarkerFromBlock is not set', async () => {
			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ ListItemHeadingIntegration, Paragraph, HeadingEditing, GeneralHtmlSupport ],
				htmlSupport: {
					allow: [ { name: 'li', classes: true } ]
				}
			} );

			editor.setData( '<ul><li class="ck-list-marker-from-block foo"><p>bar</p></li></ul>' );

			expect( editor.getData( { skipListItemIds: true } ) ).toEqualMarkup(
				'<ul><li class="foo">bar</li></ul>'
			);
		} );

		it( 'should not preserve the class when enableListItemMarkerFormatting is false', async () => {
			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ ListItemHeadingIntegration, Paragraph, HeadingEditing, GeneralHtmlSupport ],
				list: {
					enableListItemMarkerFormatting: false,
					enableListItemMarkerFromBlock: true
				},
				htmlSupport: {
					allow: [ { name: 'li', classes: true } ]
				}
			} );

			editor.setData( '<ul><li class="ck-list-marker-from-block foo"><h2>bar</h2></li></ul>' );

			expect( editor.getData( { skipListItemIds: true } ) ).toEqualMarkup(
				'<ul><li class="foo"><h2>bar</h2></li></ul>'
			);
		} );
	} );

	describe( 'when HeadingEditing is not loaded', () => {
		let editor, model;

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( {
				plugins: [ ListItemHeadingIntegration, Paragraph ],
				list: {
					enableListItemMarkerFromBlock: true
				}
			} );

			model = editor.model;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should not set the attribute on list item blocks', () => {
			model.schema.register( 'customHeading', { inheritAllFrom: '$block' } );
			editor.conversion.elementToElement( { model: 'customHeading', view: 'h2' } );

			_setModelData( model,
				'<customHeading listIndent="0" listItemId="a" listType="bulleted">foo</customHeading>'
			);

			expect( _getModelData( model, { withoutSelection: true } ) ).toEqualMarkup(
				'<customHeading listIndent="0" listItemId="a" listType="bulleted">foo</customHeading>'
			);
		} );
	} );
} );
