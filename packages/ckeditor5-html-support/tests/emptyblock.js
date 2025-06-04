/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import ListEditing from '@ckeditor/ckeditor5-list/src/list/listediting.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import GeneralHtmlSupport from '../src/generalhtmlsupport.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { INLINE_FILLER } from '@ckeditor/ckeditor5-engine/src/view/filler.js';

import EmptyBlock from '../src/emptyblock.js';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget';

describe( 'EmptyBlock', () => {
	let editor, model, element, view;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ Paragraph, TableEditing, EmptyBlock, Heading, ListEditing, BlockQuote, Clipboard ]
		} );

		model = editor.model;
		view = editor.editing.view;
	} );

	afterEach( async () => {
		element.remove();
		await editor.destroy();
	} );

	it( 'should be named', () => {
		expect( EmptyBlock.pluginName ).to.equal( 'EmptyBlock' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmptyBlock.isOfficialPlugin ).to.be.true;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( EmptyBlock ) ).to.be.instanceOf( EmptyBlock );
	} );

	describe( 'schema', () => {
		it( 'should allow htmlEmptyBlock attribute on block elements', () => {
			expect( model.schema.checkAttribute( [ 'paragraph' ], 'htmlEmptyBlock' ) ).to.be.true;
			expect( model.schema.checkAttribute( [ 'heading1' ], 'htmlEmptyBlock' ) ).to.be.true;
		} );

		it( 'should not allow htmlEmptyBlock attribute on inline elements', () => {
			model.schema.register( 'testInline', { isInline: true } );
			expect( model.schema.checkAttribute( [ 'testInline' ], 'htmlEmptyBlock' ) ).to.be.false;
		} );

		it( 'should allow htmlEmptyBlock attribute on $block', () => {
			expect( model.schema.checkAttribute( [ '$block' ], 'htmlEmptyBlock' ) ).to.be.true;
		} );

		it( 'should allow htmlEmptyBlock attribute on $container', () => {
			expect( model.schema.checkAttribute( [ '$container' ], 'htmlEmptyBlock' ) ).to.be.true;
		} );
	} );

	describe( 'data pipeline', () => {
		it( 'should not affect paragraph with text', () => {
			editor.setData(
				'<p>foo</p>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>foo</paragraph>'
			);

			expect( editor.getData() ).to.equal(
				'<p>foo</p>'
			);
		} );

		it( 'should keep block filler in paragraph', () => {
			editor.setData(
				'<p>&nbsp;</p>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph></paragraph>'
			);

			expect( editor.getData( { trim: false } ) ).to.equal(
				'<p>&nbsp;</p>'
			);
		} );

		it( 'should keep block filler surrounded with spaces in paragraph', () => {
			editor.setData(
				'<p>   &nbsp;   </p>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph></paragraph>'
			);

			expect( editor.getData( { trim: false } ) ).to.equal(
				'<p>&nbsp;</p>'
			);
		} );

		it( 'should not inject block filler if loaded paragraph was empty', () => {
			editor.setData(
				'<p></p>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph htmlEmptyBlock="true"></paragraph>'
			);

			expect( editor.getData( { trim: false } ) ).to.equal(
				'<p></p>'
			);
		} );

		it( 'should not inject block filler if loaded paragraph contains only spaces', () => {
			editor.setData(
				'<p> </p>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph htmlEmptyBlock="true"></paragraph>'
			);

			expect( editor.getData( { trim: false } ) ).to.equal(
				'<p></p>'
			);
		} );

		it( 'should not set htmlEmptyBlock attribute on empty inline elements', () => {
			registerInlinePlaceholderWidget();

			editor.setData(
				'<p>' +
				'Hello' +
				'<span class="placeholder"></span>' +
				'World' +
				'</p>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>Hello<placeholder></placeholder>World</paragraph>'
			);
		} );

		it( 'should not set `getFillerOffset` if element is already consumed', () => {
			editor.setData( '<p></p><p>foo</p>' );

			editor.conversion.for( 'dataDowncast' ).add( dispatcher => {
				dispatcher.on( 'attribute:htmlEmptyBlock', ( evt, data, conversionApi ) => {
					conversionApi.consumable.consume( data.item, 'attribute:htmlEmptyBlock' );
				}, { priority: 'highest' } );
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph htmlEmptyBlock="true"></paragraph>' +
				'<paragraph>foo</paragraph>'
			);

			expect( editor.getData() ).to.equal( '<p>&nbsp;</p><p>foo</p>' );
		} );

		describe( 'table integration', () => {
			it( 'should preserve empty cell', () => {
				editor.setData(
					'<figure class="table"><table><tbody><tr><td></td></tr></tbody></table></figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table><tableRow>' +
						'<tableCell htmlEmptyBlock="true"><paragraph htmlEmptyBlock="true"></paragraph></tableCell>' +
					'</tableRow></table>'
				);

				expect( editor.getData() ).to.equal( '<figure class="table"><table><tbody><tr><td></td></tr></tbody></table></figure>' );
			} );

			it( 'should preserve empty cells mixed with non-empty ones', () => {
				editor.setData(
					'<figure class="table"><table><tbody><tr><td>foo</td><td></td><td>&nbsp;</td></tr></tbody></table></figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>foo</paragraph></tableCell>' +
							'<tableCell htmlEmptyBlock="true"><paragraph htmlEmptyBlock="true"></paragraph></tableCell>' +
							'<tableCell><paragraph></paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				expect( editor.getData() ).to.equal(
					'<figure class="table"><table><tbody><tr><td>foo</td><td></td><td>&nbsp;</td></tr></tbody></table></figure>'
				);
			} );

			it( 'should preserve empty cells on table cell with whitespace', () => {
				editor.setData( '<figure class="table"><table><tbody><tr><td> </td></tr></tbody></table></figure>' );

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table>' +
						'<tableRow>' +
							'<tableCell htmlEmptyBlock="true"><paragraph htmlEmptyBlock="true"></paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				expect( editor.getData() ).to.equal(
					'<figure class="table"><table><tbody><tr><td></td></tr></tbody></table></figure>'
				);
			} );

			it( 'should handle empty paragraph in a table cell', () => {
				editor.setData(
					'<figure class="table"><table><tbody><tr><td><p>&nbsp;</p></td><td><p></p></td></tr></tbody></table></figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<table>' +
						'<tableRow>' +
						'<tableCell><paragraph></paragraph></tableCell>' +
						'<tableCell><paragraph htmlEmptyBlock="true"></paragraph></tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				expect( editor.getData() ).to.equal(
					'<figure class="table"><table><tbody><tr><td>&nbsp;</td><td></td></tr></tbody></table></figure>'
				);
			} );
		} );

		describe( 'lists integration', () => {
			it( 'should preserve empty blocks in list', () => {
				editor.setData(
					'<ul>' +
						'<li>foo</li>' +
						'<li>&nbsp;</li>' +
						'<li></li>' +
						'<li> </li>' +
					'</ul>'
				);

				expect( editor.getData( { skipListItemIds: true } ) ).to.equal(
					'<ul>' +
						'<li>foo</li>' +
						'<li>&nbsp;</li>' +
						'<li></li>' +
						'<li></li>' +
					'</ul>'
				);
			} );
		} );

		describe( 'other block elements', () => {
			it( 'should handle empty headings', () => {
				editor.setData(
					'<h2>foo</h2>' +
					'<h2></h2>' +
					'<h2> </h2>' +
					'<h2>&nbsp;</h2>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<heading1>foo</heading1>' +
					'<heading1 htmlEmptyBlock="true"></heading1>' +
					'<heading1 htmlEmptyBlock="true"></heading1>' +
					'<heading1></heading1>'
				);

				expect( editor.getData() ).to.equal(
					'<h2>foo</h2>' +
					'<h2></h2>' +
					'<h2></h2>' +
					'<h2>&nbsp;</h2>'
				);
			} );

			it( 'should handle nested empty blocks', () => {
				editor.setData(
					'<p>foo</p>' +
					'<blockquote>' +
						'<p></p>' +
						'<p>bar</p>' +
						'<p> </p>' +
						'<p>&nbsp;</p>' +
					'</blockquote>'
				);

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>foo</paragraph>' +
					'<blockQuote>' +
						'<paragraph htmlEmptyBlock="true"></paragraph>' +
						'<paragraph>bar</paragraph>' +
						'<paragraph htmlEmptyBlock="true"></paragraph>' +
						'<paragraph></paragraph>' +
					'</blockQuote>'
				);

				expect( editor.getData() ).to.equal(
					'<p>foo</p>' +
					'<blockquote>' +
						'<p></p>' +
						'<p>bar</p>' +
						'<p></p>' +
						'<p>&nbsp;</p>' +
					'</blockquote>'
				);
			} );
		} );
	} );

	describe( 'config.preserveEmptyBlocksInEditingView', () => {
		it( 'should preserve empty blocks in editing view when enabled', async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, {
				plugins: [ Paragraph, TableEditing, EmptyBlock, Heading, ListEditing, BlockQuote, Clipboard ],
				htmlSupport: {
					preserveEmptyBlocksInEditingView: true
				}
			} );

			editor.setData( '<p></p><p>foo</p>' );

			const domRoot = editor.editing.view.getDomRoot();

			expect( domRoot.innerHTML ).to.equal(
				'<p>' + INLINE_FILLER + '</p>' +
                '<p>foo</p>'
			);
		} );

		it( 'should not preserve empty blocks in editing view when disabled', async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, {
				plugins: [ Paragraph, TableEditing, EmptyBlock, Heading, ListEditing, BlockQuote, Clipboard ],
				htmlSupport: {
					preserveEmptyBlocksInEditingView: false
				}
			} );

			editor.setData( '<p></p><p>foo</p>' );

			const domRoot = editor.editing.view.getDomRoot();

			expect( domRoot.innerHTML ).to.equal(
				'<p><br data-cke-filler="true"></p>' +
                '<p>foo</p>'
			);
		} );

		it( 'should not preserve empty blocks in editing view by default', async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, {
				plugins: [ Paragraph, TableEditing, EmptyBlock, Heading, ListEditing, BlockQuote, Clipboard ]
			} );

			editor.setData( '<p></p><p>foo</p>' );

			const domRoot = editor.editing.view.getDomRoot();

			expect( domRoot.innerHTML ).to.equal(
				'<p><br data-cke-filler="true"></p>' +
                '<p>foo</p>'
			);
		} );
	} );

	describe( 'clipboard pipeline', () => {
		it( 'should not crash the editor if there is no clipboard plugin', async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, {
				plugins: [ EmptyBlock ]
			} );

			expect( editor.plugins.get( 'EmptyBlock' ) ).to.be.instanceOf( EmptyBlock );
		} );

		describe( 'copying content', () => {
			it( 'should not add block filler to copied empty paragraphs', () => {
				const dataTransferMock = createDataTransfer();

				setModelData( model,
					'[<paragraph htmlEmptyBlock="true"></paragraph>' +
					'<paragraph></paragraph>]'
				);

				view.document.fire( 'copy', {
					dataTransfer: dataTransferMock,
					preventDefault: sinon.spy()
				} );

				expect( dataTransferMock.getData( 'text/html' ) ).to.equal(
					'<p></p><p>&nbsp;</p>'
				);
			} );
		} );

		describe( 'pasting content', () => {
			it( 'should not add block filler if paste within editor', () => {
				const dataTransferMock = createDataTransfer( {
					'application/ckeditor5-editor-id': editor.id,
					'text/html': '<p></p><p>Foo</p>'
				} );

				view.document.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: () => {},
					stopPropagation: () => {},
					method: 'paste'
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph htmlEmptyBlock="true"></paragraph>' +
					'<paragraph>Foo[]</paragraph>'
				);

				expect( editor.getData() ).to.equal( '<p></p><p>Foo</p>' );
			} );

			it( 'should add block filler if paste from another editor', () => {
				const dataTransferMock = createDataTransfer( {
					'application/ckeditor5-editor-id': 'it-is-absolutely-different-editor',
					'text/html': '<p></p><p>Foo</p>'
				} );

				view.document.fire( 'paste', {
					dataTransfer: dataTransferMock,
					preventDefault: () => {},
					stopPropagation: () => {},
					method: 'paste'
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph></paragraph>' +
					'<paragraph>Foo[]</paragraph>'
				);

				expect( editor.getData() ).to.equal( '<p>&nbsp;</p><p>Foo</p>' );
			} );
		} );
	} );

	describe( 'GHS', () => {
		let dataFilter;

		beforeEach( async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, {
				plugins: [ Paragraph, TableEditing, EmptyBlock, Heading, ListEditing, BlockQuote, Clipboard, GeneralHtmlSupport ]
			} );

			model = editor.model;
			view = editor.editing.view;

			dataFilter = editor.plugins.get( 'DataFilter' );
			dataFilter.allowElement( /.*/ );
		} );

		it( 'should handle empty div elements', () => {
			editor.setData(
				'<div></div><div>foo</div>'
			);

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<htmlDivParagraph htmlEmptyBlock="true"></htmlDivParagraph>' +
				'<htmlDivParagraph>foo</htmlDivParagraph>'
			);

			expect( editor.getData() ).to.equal(
				'<div></div><div>foo</div>'
			);
		} );
	} );

	function registerInlinePlaceholderWidget() {
		model.schema.register( 'placeholder', {
			inheritAllFrom: '$inlineObject',
			allowAttributes: [ 'name' ]
		} );

		model.schema.extend( '$text', { allowIn: 'placeholder' } );

		editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( model, viewElement => viewElement.hasClass( 'placeholder' ) )
		);

		editor.conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				classes: [ 'placeholder' ]
			},
			model: ( _, { writer } ) => writer.createElement( 'placeholder' )
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( _, { writer } ) => toWidget(
				writer.createContainerElement( 'span', { class: 'placeholder' } ),
				writer
			)
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'placeholder',
			view: ( _, { writer } ) => writer.createContainerElement( 'span', { class: 'placeholder' } )
		} );
	}

	function createDataTransfer( data = {} ) {
		const store = Object.create( data );

		return {
			setData( type, data ) {
				store[ type ] = data;
			},

			getData( type ) {
				return store[ type ];
			}
		};
	}
} );
