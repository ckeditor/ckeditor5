/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { LinkEditing } from '../src/linkediting.js';
import { LinkCommand } from '../src/linkcommand.js';
import { UnlinkCommand } from '../src/unlinkcommand.js';

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { BoldEditing, ItalicEditing } from '@ckeditor/ckeditor5-basic-styles';
import { Clipboard, ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { ViewDocumentDomEventData, _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';
import { ImageBlockEditing, ImageInline } from '@ckeditor/ckeditor5-image';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Input, Delete } from '@ckeditor/ckeditor5-typing';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { keyCodes } from '@ckeditor/ckeditor5-utils';
import { isLinkElement } from '../src/utils.js';
import { env } from 'ckeditor5/src/utils.js';

describe( 'LinkEditing', () => {
	let element, editor, model, view;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ Paragraph, LinkEditing, Enter, Clipboard, ImageInline ],
			link: {
				decorators: {
					isExternal: {
						mode: 'manual',
						label: 'Open in a new window',
						attributes: {
							target: '_blank',
							rel: 'noopener noreferrer'
						}
					}
				}
			}
		} );

		editor.model.schema.extend( '$text', { allowAttributes: 'bold' } );
		editor.model.schema.setAttributeProperties( 'bold', {
			isFormatting: true
		} );

		editor.conversion.attributeToElement( {
			model: 'bold',
			view: 'b'
		} );

		model = editor.model;
		view = editor.editing.view;
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( LinkEditing.pluginName ).to.equal( 'LinkEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( LinkEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( LinkEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( LinkEditing ) ).to.be.instanceOf( LinkEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$block', '$text' ], 'linkHref' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'linkHref' ) ).to.be.true;

		expect( model.schema.checkAttribute( [ '$block' ], 'linkHref' ) ).to.be.false;
	} );

	// Let's check only the minimum to not duplicate `TwoStepCaretMovement` tests.
	// Testing minimum is better than testing using spies that might give false positive results.
	describe( 'two-step caret movement', () => {
		it( 'should be bound to the `linkHref` attribute (LTR)', () => {
			const selection = editor.model.document.selection;

			// Put selection before the link element.
			_setModelData( editor.model, '<paragraph>foo[]<$text linkHref="url">b</$text>ar</paragraph>' );

			// The selection's gravity should read attributes from the left.
			expect( selection ).not.to.have.attribute( 'linkHref' );

			// So let's simulate the `keydown` event.
			editor.editing.view.document.fire( 'keydown', {
				keyCode: keyCodes.arrowright,
				preventDefault: () => {},
				domTarget: document.body
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph>foo<$text linkHref="url">[]b</$text>ar</paragraph>' );
			// Selection should get the attributes from the right.
			expect( selection ).to.have.attribute( 'linkHref' );
			expect( selection ).to.have.attribute( 'linkHref', 'url' );
		} );

		it( 'should be bound to the `linkHref` attribute (RTL)', async () => {
			const editor = await ClassicTestEditor.create( element, {
				plugins: [ Paragraph, LinkEditing, Enter ],
				language: {
					content: 'ar'
				}
			} );

			model = editor.model;
			view = editor.editing.view;
			const selection = editor.model.document.selection;

			// Put selection before the link element.
			_setModelData( editor.model, '<paragraph>foo[]<$text linkHref="url">b</$text>ar</paragraph>' );

			// The selection's gravity should read attributes from the left.
			expect( selection ).not.to.have.attribute( 'linkHref' );

			// So let's simulate the `keydown` event.
			editor.editing.view.document.fire( 'keydown', {
				keyCode: keyCodes.arrowleft,
				preventDefault: () => {},
				domTarget: document.body
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph>foo<$text linkHref="url">[]b</$text>ar</paragraph>' );
			// Selection should get the attributes from the right.
			expect( selection ).to.have.attribute( 'linkHref' );
			expect( selection ).to.have.attribute( 'linkHref', 'url' );

			await editor.destroy();
		} );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/6053
	describe( 'selection attribute management on paste', () => {
		it( 'should remove link attributes when pasting a link', () => {
			_setModelData( model, '<paragraph>foo[]</paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { linkHref: 'ckeditor.com' } ) );
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph>foo<$text linkHref="ckeditor.com">INSERTED</$text>[]</paragraph>' );

			expect( [ ...model.document.selection.getAttributeKeys() ] ).to.be.empty;
		} );

		it( 'should remove all attributes starting with "link" (e.g. decorator attributes) when pasting a link', () => {
			_setModelData( model, '<paragraph>foo[]</paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { linkHref: 'ckeditor.com', linkIsExternal: true } ) );
			} );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>' +
					'foo<$text linkHref="ckeditor.com" linkIsExternal="true">INSERTED</$text>[]' +
				'</paragraph>'
			);

			expect( [ ...model.document.selection.getAttributeKeys() ] ).to.be.empty;
		} );

		it( 'should not remove link attributes when pasting a non-link content', () => {
			_setModelData( model, '<paragraph><$text linkHref="ckeditor.com">foo[]</$text></paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { bold: 'true' } ) );
			} );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>' +
					'<$text linkHref="ckeditor.com">foo</$text>' +
					'<$text bold="true">INSERTED[]</$text>' +
				'</paragraph>'
			);

			expect( model.document.selection ).to.have.attribute( 'bold' );
		} );

		it( 'should not remove link attributes when pasting in the middle of a link with the same URL', () => {
			_setModelData( model, '<paragraph><$text linkHref="ckeditor.com">fo[]o</$text></paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { linkHref: 'ckeditor.com' } ) );
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph><$text linkHref="ckeditor.com">foINSERTED[]o</$text></paragraph>' );
			expect( model.document.selection ).to.have.attribute( 'linkHref' );
		} );

		it( 'should not remove link attributes from the selection when pasting before a link when the gravity is overridden', () => {
			_setModelData( model, '<paragraph>foo[]<$text linkHref="ckeditor.com">bar</$text></paragraph>' );

			view.document.fire( 'keydown', {
				keyCode: keyCodes.arrowright,
				preventDefault: () => {},
				domTarget: document.body
			} );

			expect( model.document.selection ).to.have.property( 'isGravityOverridden', true );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { bold: true } ) );
			} );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>' +
					'foo' +
					'<$text bold="true">INSERTED</$text>[]' +
					'<$text linkHref="ckeditor.com">bar</$text>' +
				'</paragraph>'
			);

			expect( model.document.selection ).to.have.property( 'isGravityOverridden', true );
			expect( [ ...model.document.selection.getAttributeKeys() ] ).to.be.empty;
		} );

		it( 'should remove link attributes when pasting a link into another link (different URLs, no merge)', () => {
			_setModelData( model, '<paragraph><$text linkHref="ckeditor.com">f[]oo</$text></paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { linkHref: 'http://INSERTED' } ) );
			} );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>' +
					'<$text linkHref="ckeditor.com">f</$text>' +
					'<$text linkHref="http://INSERTED">INSERTED</$text>[]' +
					'<$text linkHref="ckeditor.com">oo</$text>' +
				'</paragraph>'
			);

			expect( [ ...model.document.selection.getAttributeKeys() ] ).to.be.empty;
		} );

		it( 'should not remove link attributes when pasting before another link (different URLs, no merge)', () => {
			_setModelData( model, '<paragraph>[]<$text linkHref="ckeditor.com">foo</$text></paragraph>' );

			expect( model.document.selection ).to.have.property( 'isGravityOverridden', false );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { linkHref: 'http://INSERTED' } ) );
			} );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>' +
					'<$text linkHref="http://INSERTED">INSERTED</$text>[]' +
					'<$text linkHref="ckeditor.com">foo</$text>' +
				'</paragraph>'
			);

			expect( [ ...model.document.selection.getAttributeKeys() ] ).to.be.empty;
		} );

		// https://github.com/ckeditor/ckeditor5/issues/8158
		it( 'should expand link text on pasting plain text', () => {
			_setModelData( model, '<paragraph><$text linkHref="ckeditor.com">f[]oo</$text></paragraph>' );

			view.document.fire( 'paste', {
				dataTransfer: createDataTransfer( {
					'text/html': '<p>bar</p>',
					'text/plain': 'bar'
				} ),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>' +
					'<$text linkHref="ckeditor.com">fbar[]oo</$text>' +
				'</paragraph>'
			);
		} );

		it( 'doesn\'t affect attributes other than link', () => {
			_setModelData( model, '<paragraph><$text bold="true">[foo]</$text></paragraph>' );

			view.document.fire( 'paste', {
				dataTransfer: createDataTransfer( {
					'text/html': '<p>bar</p>',
					'text/plain': 'bar'
				} ),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph><$text bold="true">bar[]</$text></paragraph>'
			);
		} );
	} );

	describe( 'command', () => {
		it( 'should register link command', () => {
			const command = editor.commands.get( 'link' );

			expect( command ).to.be.instanceOf( LinkCommand );
		} );

		it( 'should register unlink command', () => {
			const command = editor.commands.get( 'unlink' );

			expect( command ).to.be.instanceOf( UnlinkCommand );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert `<a href="url">` to `linkHref="url"` attribute', () => {
			editor.setData( '<p><a href="url">foo</a>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text linkHref="url">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><a href="url">foo</a>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			editor.setData( '<a href="url">foo</a>bar' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text linkHref="url">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><a href="url">foo</a>bar</p>' );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/500
		it( 'should not pick up `<a name="foo">`', () => {
			editor.setData( '<p><a name="foo">foo</a>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foobar</paragraph>' );
		} );

		// CKEditor 4 does. And CKEditor 5's balloon allows creating such links.
		it( 'should pick up `<a href="">`', () => {
			editor.setData( '<p><a href="">foo</a>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text linkHref="">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><a href="">foo</a>bar</p>' );
		} );

		it( 'should not assign `linkHref` attribute if missing href', () => {
			editor.setData( '<p><a>foo</a>bar</p>' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>foobar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foobar</p>' );
		} );

		// The editor's role is not to filter out potentially malicious data.
		// Its job is to not let this code be executed inside the editor (see the test in "editing pipeline conversion").
		it( 'should output a link with a potential XSS code', () => {
			_setModelData( model, '<paragraph>[]</paragraph>' );

			model.change( writer => {
				writer.insertText( 'foo', { linkHref: 'javascript:alert(1)' }, model.document.selection.getFirstPosition() );
			} );

			expect( editor.getData() ).to.equal( '<p><a href="javascript:alert(1)">foo</a></p>' );
		} );

		it( 'should load a link with a potential XSS code', () => {
			editor.setData( '<p><a href="javascript:alert(1)">foo</a></p>' );

			expect( _getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text linkHref="javascript:alert(1)">foo</$text></paragraph>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			_setModelData( model, '<paragraph><$text linkHref="url">foo</$text>bar</paragraph>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p><a href="url">foo</a>bar</p>' );
		} );

		it( 'should convert to link element instance', () => {
			_setModelData( model, '<paragraph><$text linkHref="url">foo</$text>bar</paragraph>' );

			const element = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 0 );
			expect( isLinkElement( element ) ).to.be.true;
		} );

		// https://github.com/ckeditor/ckeditor5-link/issues/121
		it( 'should should set priority for `linkHref` higher than all other attribute elements', () => {
			model.schema.extend( '$text', { allowAttributes: 'foo' } );

			editor.conversion.for( 'downcast' ).attributeToElement( { model: 'foo', view: 'f' } );

			_setModelData( model,
				'<paragraph>' +
					'<$text linkHref="url">a</$text><$text foo="true" linkHref="url">b</$text><$text linkHref="url">c</$text>' +
				'</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><a href="url">a<f>b</f>c</a></p>' );
		} );

		it( 'must not render a link with a potential XSS code', () => {
			_setModelData( model, '<paragraph><$text linkHref="javascript:alert(1)">[]foo</$text>bar[]</paragraph>' );

			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<p><a href="#">foo</a>bar</p>' );
		} );

		describe( 'links with custom protocols', () => {
			let editor, model;

			beforeEach( async () => {
				editor = await ClassicTestEditor.create( element, {
					plugins: [ Paragraph, LinkEditing, Enter ],
					link: {
						allowedProtocols: [ 'https', 'custom' ]
					}
				} );

				model = editor.model;
				view = editor.editing.view;

				model.schema.extend( '$text', {
					allowIn: '$root',
					allowAttributes: [ 'linkIsFoo', 'linkIsBar' ]
				} );
			} );

			afterEach( async () => {
				await editor.destroy();
			} );

			it( 'should render a link with a custom protocol, if provided in the custom allowed protocols', () => {
				_setModelData( model, '<paragraph><$text linkHref="custom:address.in.app">[]foo</$text>bar[]</paragraph>' );

				expect( _getViewData( editor.editing.view, { withoutSelection: true } ) )
					.to.equal( '<p><a href="custom:address.in.app">foo</a>bar</p>' );
			} );
		} );
	} );

	describe( 'link highlighting', () => {
		it( 'should convert the highlight to a proper view classes', () => {
			_setModelData( model,
				'<paragraph>foo <$text linkHref="url">b{}ar</$text> baz</paragraph>'
			);

			expect( model.document.selection ).to.have.attribute( 'linkHref' );
			expect( _getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">b{}ar</a> baz</p>'
			);
		} );

		it( 'should work whenever selection has linkHref attribute - link start', () => {
			_setModelData( model,
				'<paragraph>foo {}<$text linkHref="url">bar</$text> baz</paragraph>'
			);

			expect( model.document.selection ).to.not.have.attribute( 'linkHref' );

			model.change( writer => {
				writer.setSelectionAttribute( 'linkHref', 'url' );
			} );

			expect( model.document.selection ).to.have.attribute( 'linkHref' );
			expect( _getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">{}bar</a> baz</p>'
			);
		} );

		it( 'should work whenever selection has linkHref attribute - link end', () => {
			_setModelData( model,
				'<paragraph>foo <$text linkHref="url">bar</$text>{} baz</paragraph>'
			);

			expect( model.document.selection ).to.have.attribute( 'linkHref' );
			expect( _getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">bar{}</a> baz</p>'
			);
		} );

		it( 'should render highlight correctly after splitting the link', () => {
			_setModelData( model,
				'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
			);

			editor.execute( 'enter' );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>foo <$text linkHref="url">li</$text></paragraph>' +
				'<paragraph><$text linkHref="url">[]nk</$text> baz</paragraph>'
			);

			expect( model.document.selection ).to.have.attribute( 'linkHref' );
			expect( _getViewData( view ) ).to.equal(
				'<p>foo <a href="url">li</a></p>' +
				'<p><a class="ck-link_selected" href="url">{}nk</a> baz</p>'
			);
		} );

		it( 'should remove classes when selection is moved out from the link', () => {
			_setModelData( model,
				'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
			);

			expect( _getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">li{}nk</a> baz</p>'
			);

			model.change( writer => writer.setSelection( model.document.getRoot().getChild( 0 ), 0 ) );

			expect( _getViewData( view ) ).to.equal(
				'<p>{}foo <a href="url">link</a> baz</p>'
			);
		} );

		it( 'should work correctly when selection is moved inside link', () => {
			_setModelData( model,
				'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
			);

			expect( _getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">li{}nk</a> baz</p>'
			);

			model.change( writer => writer.setSelection( model.document.getRoot().getChild( 0 ), 5 ) );

			expect( _getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">l{}ink</a> baz</p>'
			);
		} );

		describe( 'downcast conversion integration', () => {
			it( 'works for the #insert event', () => {
				_setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.insertText( 'FOO', { linkHref: 'url' }, model.document.selection.getFirstPosition() );
				} );

				expect( _getViewData( view ) ).to.equal(
					'<p>foo <a class="ck-link_selected" href="url">liFOO{}nk</a> baz</p>'
				);
			} );

			it( 'works for the #remove event', () => {
				_setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.remove( writer.createRange(
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 0 ),
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 5 )
					) );
				} );

				expect( _getViewData( view ) ).to.equal(
					'<p><a class="ck-link_selected" href="url">i{}nk</a> baz</p>'
				);
			} );

			it( 'works for the #attribute event', () => {
				_setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.setAttribute( 'linkHref', 'new-url', writer.createRange(
						model.document.selection.getFirstPosition().getShiftedBy( -1 ),
						model.document.selection.getFirstPosition().getShiftedBy( 1 ) )
					);
				} );

				expect( _getViewData( view ) ).to.equal(
					'<p>foo <a href="url">l</a><a class="ck-link_selected" href="new-url">i{}n</a><a href="url">k</a> baz</p>'
				);
			} );

			it( 'works for the #selection event', () => {
				_setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.setSelection( writer.createRange(
						model.document.selection.getFirstPosition().getShiftedBy( -1 ),
						model.document.selection.getFirstPosition().getShiftedBy( 1 ) )
					);
				} );

				expect( _getViewData( view ) ).to.equal(
					'<p>foo <a class="ck-link_selected" href="url">l{in}k</a> baz</p>'
				);
			} );

			it( 'works for the addMarker and removeMarker events', () => {
				editor.conversion.for( 'editingDowncast' ).markerToHighlight( { model: 'fooMarker', view: {} } );

				_setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					const range = writer.createRange(
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 0 ),
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 5 )
					);

					writer.addMarker( 'fooMarker', { range, usingOperation: true } );
				} );

				expect( _getViewData( view ) ).to.equal(
					'<p><span>foo </span><a class="ck-link_selected" href="url"><span>l</span>i{}nk</a> baz</p>'
				);

				model.change( writer => writer.removeMarker( 'fooMarker' ) );

				expect( _getViewData( view ) ).to.equal(
					'<p>foo <a class="ck-link_selected" href="url">li{}nk</a> baz</p>'
				);
			} );
		} );
	} );

	describe( 'link attributes decorator', () => {
		describe( 'default behavior', () => {
			const testLinks = [
				{
					external: true,
					url: 'http://example.com'
				}, {
					external: true,
					url: 'https://cksource.com'
				}, {
					external: false,
					url: 'ftp://server.io'
				}, {
					external: true,
					url: '//schemaless.org'
				}, {
					external: false,
					url: 'www.ckeditor.com'
				}, {
					external: false,
					url: '/relative/url.html'
				}, {
					external: false,
					url: 'another/relative/url.html'
				}, {
					external: false,
					url: '#anchor'
				}, {
					external: false,
					url: 'mailto:some@user.org'
				}, {
					external: false,
					url: 'tel:123456789'
				}
			];

			it( 'link.addTargetToExternalLinks has a default value of `false`', () => {
				expect( editor.config.get( 'link.addTargetToExternalLinks' ) ).to.be.false;
			} );

			it( 'link.allowCreatingEmptyLinks has a default value of `false`', () => {
				expect( editor.config.get( 'link.allowCreatingEmptyLinks' ) ).to.be.false;
			} );

			describe( 'for link.addTargetToExternalLinks = false', () => {
				let editor, model;

				beforeEach( async () => {
					editor = await ClassicTestEditor.create( element, {
						plugins: [ Paragraph, LinkEditing, Enter ],
						link: {
							addTargetToExternalLinks: true
						}
					} );

					model = editor.model;
					view = editor.editing.view;
				} );

				afterEach( async () => {
					await editor.destroy();
				} );

				it( 'link.addTargetToExternalLinks is set as true value', () => {
					expect( editor.config.get( 'link.addTargetToExternalLinks' ) ).to.be.true;
				} );

				testLinks.forEach( link => {
					it( `link: ${ link.url } should be treat as ${ link.external ? 'external' : 'non-external' } link`, () => {
						editor.setData( `<p><a href="${ link.url }">foo</a>bar</p>` );

						expect( _getModelData( model, { withoutSelection: true } ) )
							.to.equal( `<paragraph><$text linkHref="${ link.url }">foo</$text>bar</paragraph>` );

						if ( link.external ) {
							expect( editor.getData() )
								.to.equal( `<p><a target="_blank" rel="noopener noreferrer" href="${ link.url }">foo</a>bar</p>` );
						} else {
							expect( editor.getData() ).to.equal( `<p><a href="${ link.url }">foo</a>bar</p>` );
						}
					} );
				} );
			} );
			testLinks.forEach( link => {
				it( `link: ${ link.url } should not get 'target' and 'rel' attributes`, () => {
					editor.setData( `<p><a href="${ link.url }">foo</a>bar</p>` );

					expect( _getModelData( model, { withoutSelection: true } ) )
						.to.equal( `<paragraph><$text linkHref="${ link.url }">foo</$text>bar</paragraph>` );

					expect( editor.getData() ).to.equal( `<p><a href="${ link.url }">foo</a>bar</p>` );
				} );
			} );
		} );

		describe( 'custom config', () => {
			describe( 'mode: automatic', () => {
				const testLinks = [
					{
						url: 'relative/url.html',
						attributes: {}
					}, {
						url: 'http://exmaple.com',
						attributes: {
							target: '_blank'
						}
					}, {
						url: 'https://example.com/download/link.pdf',
						attributes: {
							target: '_blank',
							download: 'download'
						}
					}, {
						url: 'mailto:some@person.io',
						attributes: {
							class: 'mail-url'
						}
					}, {
						url: 'ftp://example.com',
						attributes: {
							style: 'background:blue;color:yellow;'
						}
					}
				];

				beforeEach( async () => {
					await editor.destroy();

					editor = await ClassicTestEditor.create( element, {
						plugins: [ Paragraph, LinkEditing, Enter ],
						link: {
							addTargetToExternalLinks: false,
							decorators: {
								isExternal: {
									mode: 'automatic',
									callback: url => url.startsWith( 'http' ),
									attributes: {
										target: '_blank'
									}
								},
								isDownloadable: {
									mode: 'automatic',
									callback: url => url.includes( 'download' ),
									attributes: {
										download: 'download'
									}
								},
								isMail: {
									mode: 'automatic',
									callback: url => url.startsWith( 'mailto:' ),
									classes: 'mail-url'
								},
								isFile: {
									mode: 'automatic',
									callback: url => url.startsWith( 'ftp' ),
									styles: {
										color: 'yellow',
										background: 'blue'
									}
								}
							}
						}
					} );

					model = editor.model;
					view = editor.editing.view;
				} );

				testLinks.forEach( link => {
					it( `Link: ${ link.url } should get attributes: ${ JSON.stringify( link.attributes ) }`, () => {
						const ORDER = [ 'target', 'download', 'class' ];
						const attr = Object.entries( link.attributes ).sort( ( a, b ) => {
							const aIndex = ORDER.indexOf( a[ 0 ] );
							const bIndex = ORDER.indexOf( b[ 0 ] );
							return aIndex - bIndex;
						} );
						const reducedAttr = attr.reduce( ( acc, cur ) => {
							return acc + `${ cur[ 0 ] }="${ cur[ 1 ] }" `;
						}, '' );

						editor.setData( `<p><a href="${ link.url }">foo</a>bar</p>` );

						expect( _getModelData( model, { withoutSelection: true } ) )
							.to.equal( `<paragraph><$text linkHref="${ link.url }">foo</$text>bar</paragraph>` );

						// Order of attributes is important, that's why this is assert is construct in such way.
						expect( editor.getData() ).to.equal( `<p><a ${ reducedAttr }href="${ link.url }">foo</a>bar</p>` );
					} );
				} );

				it( 'stores decorators in LinkCommand#automaticDecorators collection', () => {
					expect( editor.commands.get( 'link' ).automaticDecorators.length ).to.equal( 4 );
				} );
			} );
		} );

		describe( 'custom linkHref converter', () => {
			beforeEach( async () => {
				class CustomLinks extends Plugin {
					init() {
						const editor = this.editor;

						editor.conversion.for( 'downcast' ).add( dispatcher => {
							dispatcher.on( 'attribute:linkHref', ( evt, data, conversionApi ) => {
								conversionApi.consumable.consume( data.item, 'attribute:linkHref' );

								// Very simplified downcast just for test assertion.
								const viewWriter = conversionApi.writer;
								const linkElement = viewWriter.createAttributeElement(
									'a',
									{
										href: data.attributeNewValue
									}, {
										priority: 5
									}
								);
								viewWriter.setCustomProperty( 'link', true, linkElement );
								viewWriter.wrap( conversionApi.mapper.toViewRange( data.range ), linkElement );
							}, { priority: 'highest' } );
						} );
					}
				}

				await editor.destroy();

				editor = await ClassicTestEditor.create( element, {
					plugins: [ Paragraph, LinkEditing, Enter, CustomLinks ],
					link: {
						addTargetToExternalLinks: true
					}
				} );

				model = editor.model;
				view = editor.editing.view;
			} );

			it( 'has possibility to override default one', () => {
				editor.setData( '<p><a href="http://example.com">foo</a>bar</p>' );

				expect( _getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<paragraph><$text linkHref="http://example.com">foo</$text>bar</paragraph>' );

				expect( editor.getData() ).to.equal( '<p><a href="http://example.com">foo</a>bar</p>' );
			} );
		} );

		describe( 'upcast converter', () => {
			let element, editor;

			beforeEach( () => {
				element = document.createElement( 'div' );
				document.body.appendChild( element );
			} );

			afterEach( () => {
				element.remove();
			} );

			it( 'should upcast attributes from initial data', async () => {
				editor = await ClassicTestEditor.create( element, {
					initialData: '<p><a href="url" target="_blank" rel="noopener noreferrer" download="file">Foo</a>' +
						'<a href="example.com" class="file" style="text-decoration:underline;">Bar</a>' +
						'<a href="example.com" download="file">Baz</a></p>',
					plugins: [ Paragraph, LinkEditing, Enter ],
					link: {
						decorators: {
							isExternal: {
								mode: 'manual',
								label: 'Open in a new window',
								attributes: {
									target: '_blank',
									rel: 'noopener noreferrer'
								}
							},
							isDownloadable: {
								mode: 'manual',
								label: 'Downloadable',
								attributes: {
									download: 'file'
								}
							},
							isFile: {
								mode: 'manual',
								label: 'File',
								classes: 'file',
								styles: {
									'text-decoration': 'underline'
								}
							}
						}
					}
				} );

				model = editor.model;

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>' +
						'<$text linkHref="url" linkIsDownloadable="true" linkIsExternal="true">Foo</$text>' +
						'<$text linkHref="example.com" linkIsFile="true">Bar</$text>' +
						'<$text linkHref="example.com" linkIsDownloadable="true">Baz</$text>' +
					'</paragraph>'
				);

				await editor.destroy();
			} );

			it( 'should not upcast partial and incorrect attributes', async () => {
				editor = await ClassicTestEditor.create( element, {
					initialData: '<p><a href="url" target="_blank" download="something">Foo</a>' +
						'<a href="example.com" download="test">Bar</a></p>',
					plugins: [ Paragraph, LinkEditing, Enter ],
					link: {
						decorators: {
							isExternal: {
								mode: 'manual',
								label: 'Open in a new window',
								attributes: {
									target: '_blank',
									rel: 'noopener noreferrer'
								}
							},
							isDownloadable: {
								mode: 'manual',
								label: 'Downloadable',
								attributes: {
									download: 'file'
								}
							}
						}
					}
				} );

				model = editor.model;

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>' +
						'<$text linkHref="url">Foo</$text>' +
						'<$text linkHref="example.com">Bar</$text>' +
					'</paragraph>'
				);

				await editor.destroy();
			} );
		} );

		it( 'should downcast manual decorator on document selection', () => {
			_setModelData( model, '<paragraph><$text linkHref="url" linkIsExternal="true">foo[]bar</$text></paragraph>' );

			expect( _getViewData( editor.editing.view ) ).to.equal(
				'<p><a class="ck-link_selected" href="url" rel="noopener noreferrer" target="_blank">foo{}bar</a></p>'
			);
		} );
	} );

	describe( 'link following', () => {
		let stub, eventPreventDefault;

		beforeEach( () => {
			stub = sinon.stub( window, 'open' );

			stub.returns( undefined );
		} );

		afterEach( () => {
			stub.restore();
		} );

		describe( 'using mouse', () => {
			const initialEnvMac = env.isMac;

			afterEach( () => {
				env.isMac = initialEnvMac;
			} );

			describe( 'on Mac', () => {
				beforeEach( () => {
					env.isMac = true;
				} );

				it( 'should follow the link after CMD+click', () => {
					_setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );

					fireClickEvent( { metaKey: true, ctrlKey: false }, editor, view );

					expect( stub.calledOnce ).to.be.true;
					expect( stub.calledOn( window ) ).to.be.true;
					expect( stub.calledWith( 'http://www.ckeditor.com', '_blank', 'noopener' ) ).to.be.true;
					expect( eventPreventDefault.calledOnce ).to.be.true;
				} );

				it( 'should not follow the link after CTRL+click', () => {
					_setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );

					fireClickEvent( { metaKey: false, ctrlKey: true }, editor, view );

					expect( stub.notCalled ).to.be.true;
					expect( eventPreventDefault.calledOnce ).to.be.false;
				} );

				it( 'should not follow the link after click with neither CMD nor CTRL pressed', () => {
					_setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );

					fireClickEvent( { metaKey: false, ctrlKey: false }, editor, view );

					expect( stub.notCalled ).to.be.true;
					expect( eventPreventDefault.calledOnce ).to.be.false;
				} );

				describe( 'when href starts with `#`', () => {
					let view, editor, model, element;

					beforeEach( async () => {
						element = document.createElement( 'div' );
						document.body.appendChild( element );

						editor = await ClassicTestEditor.create( element, {
							plugins: [ Essentials, Paragraph, LinkEditing ]
						} );

						model = editor.model;
						view = editor.editing.view;
					} );

					afterEach( () => {
						element.remove();

						return editor.destroy();
					} );

					it( 'should open link', () => {
						_setModelData( model,
							'<paragraph><$text linkHref="#foo">Bar[]</$text></paragraph>'
						);

						fireClickEvent( { metaKey: true, ctrlKey: false }, editor, view );

						expect( stub.notCalled ).to.be.false;
						expect( stub.calledOn( window ) ).to.be.true;
						expect( stub.calledWith( '#foo', '_blank', 'noopener' ) ).to.be.true;
						expect( eventPreventDefault.calledOnce ).to.be.true;
					} );
				} );
			} );

			describe( 'on non-Mac', () => {
				beforeEach( () => {
					env.isMac = false;
				} );

				it( 'should follow the link after CTRL+click', () => {
					_setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );

					fireClickEvent( { metaKey: false, ctrlKey: true }, editor, view );

					expect( stub.calledOnce ).to.be.true;
					expect( stub.calledOn( window ) ).to.be.true;
					expect( stub.calledWith( 'http://www.ckeditor.com', '_blank', 'noopener' ) ).to.be.true;
				} );

				it( 'should not follow the link after CMD+click', () => {
					_setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );

					fireClickEvent( { metaKey: true, ctrlKey: false }, editor, view );

					expect( stub.notCalled ).to.be.true;
				} );

				it( 'should not follow the link after click with neither CMD nor CTRL pressed', () => {
					_setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );

					fireClickEvent( { metaKey: false, ctrlKey: false }, editor, view );

					expect( stub.notCalled ).to.be.true;
				} );

				describe( 'href starts with `#`', () => {
					let view, editor, model, element;

					beforeEach( async () => {
						element = document.createElement( 'div' );
						document.body.appendChild( element );

						editor = await ClassicTestEditor.create( element, {
							plugins: [ Essentials, Paragraph, LinkEditing ]
						} );

						model = editor.model;
						view = editor.editing.view;
					} );

					afterEach( () => {
						element.remove();

						return editor.destroy();
					} );

					it( 'should open link', () => {
						_setModelData( model,
							'<paragraph><$text linkHref="#foo">Bar[]</$text></paragraph>'
						);

						fireClickEvent( { metaKey: false, ctrlKey: true }, editor, view );

						expect( stub.notCalled ).to.be.false;
						expect( stub.calledOn( window ) ).to.be.true;
						expect( stub.calledWith( '#foo', '_blank', 'noopener' ) ).to.be.true;
						expect( eventPreventDefault.calledOnce ).to.be.true;
					} );
				} );
			} );

			it( 'should follow the inline image link', () => {
				_setModelData( model, '<paragraph>[<imageInline linkHref="http://www.ckeditor.com"></imageInline>]</paragraph>' );

				fireClickEvent( { metaKey: env.isMac, ctrlKey: !env.isMac }, editor, view, 'img' );

				expect( stub.calledOnce ).to.be.true;
				expect( stub.calledOn( window ) ).to.be.true;
				expect( stub.calledWith( 'http://www.ckeditor.com', '_blank', 'noopener' ) ).to.be.true;
				expect( eventPreventDefault.calledOnce ).to.be.true;
			} );

			it( 'should not follow the link if "a" element doesn\'t have "href" attribute', () => {
				editor.conversion.attributeToElement( {
					model: 'customLink',
					view: 'a'
				} );

				_setModelData( model, '<paragraph><$text customLink="">Bar[]</$text></paragraph>' );

				fireClickEvent( { metaKey: env.isMac, ctrlKey: !env.isMac }, editor, view );

				expect( stub.notCalled ).to.be.true;
				expect( eventPreventDefault.calledOnce ).to.be.false;
			} );

			it( 'should not follow the link if no link is clicked', () => {
				editor.conversion.attributeToElement( {
					model: 'customLink',
					view: 'span'
				} );

				_setModelData( model, '<paragraph><$text customLink="">Bar[]</$text></paragraph>' );

				fireClickEvent( { metaKey: env.isMac, ctrlKey: !env.isMac }, editor, view, 'span' );

				expect( stub.notCalled ).to.be.true;
				expect( eventPreventDefault.calledOnce ).to.be.false;
			} );
		} );

		describe( 'using keyboard', () => {
			const positiveScenarios = [
				{
					condition: 'selection is collapsed inside the link',
					modelData: '<paragraph><$text linkHref="http://www.ckeditor.com">Ba[]r</$text></paragraph>'
				},
				{
					condition: 'selection is collapsed at the end of the link',
					modelData: '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>'
				},
				{
					condition: 'selection is collapsed at the begining of the link',
					modelData: '<paragraph><$text linkHref="http://www.ckeditor.com">[]Bar</$text></paragraph>'
				},
				{
					condition: 'part of the link is selected',
					modelData: '<paragraph><$text linkHref="http://www.ckeditor.com">B[a]r</$text></paragraph>'
				},
				{
					condition: 'the whole link is selected',
					modelData: '<paragraph><$text linkHref="http://www.ckeditor.com">[Bar]</$text></paragraph>'
				},
				{
					condition: 'linked image is selected',
					modelData: '<paragraph>[<imageInline linkHref="http://www.ckeditor.com"></imageInline>]</paragraph>'
				}
			];

			for ( const { condition, modelData } of positiveScenarios ) {
				it( `should open link after pressing ALT+ENTER if ${ condition }`, () => {
					_setModelData( model, modelData );

					fireEnterPressedEvent( { altKey: true }, view );

					expect( stub.calledOnce ).to.be.true;
					expect( stub.calledOn( window ) ).to.be.true;
					expect( stub.calledWith( 'http://www.ckeditor.com', '_blank', 'noopener' ) ).to.be.true;
				} );
			}

			it( 'should not open link after pressing ENTER without ALT', () => {
				_setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Ba[]r</$text></paragraph>' );

				fireEnterPressedEvent( { altKey: false }, view );

				expect( stub.notCalled ).to.be.true;
			} );

			it( 'should not open link after pressing ALT+ENTER if not inside a link', () => {
				_setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar</$text>Baz[]</paragraph>' );

				fireEnterPressedEvent( { altKey: true }, view );

				expect( stub.notCalled ).to.be.true;
			} );

			describe( 'when href starts with `#`', () => {
				let view, editor, model, element;

				beforeEach( async () => {
					element = document.createElement( 'div' );
					document.body.appendChild( element );

					editor = await ClassicTestEditor.create( element, {
						plugins: [ Essentials, Paragraph, LinkEditing ]
					} );

					model = editor.model;
					view = editor.editing.view;
				} );

				afterEach( () => {
					element.remove();

					return editor.destroy();
				} );

				it( 'should open link', () => {
					_setModelData( model,
						'<paragraph><$text linkHref="#foo">Bar[]</$text></paragraph>'
					);

					fireEnterPressedEvent( { altKey: true }, view );

					expect( stub.notCalled ).to.be.false;
					expect( stub.calledOn( window ) ).to.be.true;
					expect( stub.calledWith( '#foo', '_blank', 'noopener' ) ).to.be.true;
					expect( eventPreventDefault.calledOnce ).to.be.true;
				} );
			} );
		} );

		describe( 'custom link custom openers', () => {
			let editing;

			beforeEach( () => {
				editing = editor.plugins.get( LinkEditing );
				env.isMac = false;
			} );

			describe( 'using mouse', () => {
				it( 'should use default opener if there are no custom openers', () => {
					_setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );
					fireClickEvent( { metaKey: false, ctrlKey: true }, editor, view );

					expect( stub.calledOnce ).to.be.true;
					expect( stub.calledWith( 'http://www.ckeditor.com', '_blank', 'noopener' ) ).to.be.true;
				} );

				it( 'should not open link with custom opener that returns false', () => {
					const opener = sinon.stub().returns( false );

					editing._registerLinkOpener( opener );

					_setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );
					fireClickEvent( { metaKey: false, ctrlKey: true }, editor, view );

					expect( opener.calledOnce ).to.be.true;
					expect( opener.calledWith( 'http://www.ckeditor.com' ) ).to.be.true;
					expect( stub ).to.be.called;
				} );

				it( 'should open link with custom opener that returns true', () => {
					const opener = sinon.stub().returns( true );

					editing._registerLinkOpener( opener );

					_setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );
					fireClickEvent( { metaKey: false, ctrlKey: true }, editor, view );

					expect( opener.calledOnce ).to.be.true;
					expect( opener.calledWith( 'http://www.ckeditor.com' ) ).to.be.true;
					expect( stub ).not.to.be.called;
				} );

				it( 'should pick the first opener that returns true', () => {
					const openers = [
						sinon.stub().returns( false ),
						sinon.stub().returns( true ),
						sinon.stub().returns( true )
					];

					for ( const opener of openers ) {
						editing._registerLinkOpener( opener );
					}

					_setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );
					fireClickEvent( { metaKey: false, ctrlKey: true }, editor, view );

					expect( openers[ 0 ] ).to.be.calledOnce;
					expect( openers[ 1 ] ).to.be.calledOnce;
					expect( openers[ 2 ] ).not.to.be.called;

					expect( openers[ 0 ].calledBefore( openers[ 1 ] ) ).to.be.true;
					expect( stub ).not.to.be.called;
				} );
			} );

			describe( 'using keyboard', () => {
				it( 'should use default opener if there are no custom openers', () => {
					_setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );
					fireEnterPressedEvent( { altKey: true }, view );

					expect( stub.calledOnce ).to.be.true;
					expect( stub.calledWith( 'http://www.ckeditor.com', '_blank', 'noopener' ) ).to.be.true;
				} );

				it( 'should not open link with custom opener that returns false', () => {
					const opener = sinon.stub().returns( false );

					editing._registerLinkOpener( opener );

					_setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );
					fireEnterPressedEvent( { altKey: true }, view );

					expect( opener.calledOnce ).to.be.true;
					expect( opener.calledWith( 'http://www.ckeditor.com' ) ).to.be.true;
					expect( stub ).to.be.called;
				} );

				it( 'should open link with custom opener that returns true', () => {
					const opener = sinon.stub().returns( true );

					editing._registerLinkOpener( opener );

					_setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );
					fireEnterPressedEvent( { altKey: true }, view );

					expect( opener.calledOnce ).to.be.true;
					expect( opener.calledWith( 'http://www.ckeditor.com' ) ).to.be.true;
					expect( stub ).not.to.be.called;
				} );

				it( 'should pick the first opener that returns true', () => {
					const openers = [
						sinon.stub().returns( false ),
						sinon.stub().returns( true ),
						sinon.stub().returns( true )
					];

					for ( const opener of openers ) {
						editing._registerLinkOpener( opener );
					}

					_setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );
					fireEnterPressedEvent( { altKey: true }, view );

					expect( openers[ 0 ] ).to.be.calledOnce;
					expect( openers[ 1 ] ).to.be.calledOnce;
					expect( openers[ 2 ] ).not.to.be.called;

					expect( openers[ 0 ].calledBefore( openers[ 1 ] ) ).to.be.true;
					expect( stub ).not.to.be.called;
				} );
			} );
		} );

		function fireClickEvent( options, editor, view, tagName = 'a' ) {
			const linkElement = editor.ui.getEditableElement().getElementsByTagName( tagName )[ 0 ];

			eventPreventDefault = sinon.spy();

			view.document.fire( 'click', {
				domTarget: linkElement,
				domEvent: options,
				preventDefault: eventPreventDefault
			} );
		}

		function fireEnterPressedEvent( options, view ) {
			view.document.fire( 'keydown', {
				keyCode: keyCodes.enter,
				domEvent: {
					keyCode: keyCodes.enter,
					preventDefault: () => {},
					target: document.body,
					...options
				},
				...options
			} );
		}
	} );

	// https://github.com/ckeditor/ckeditor5/issues/1016
	describe( 'typing around the link after a click', () => {
		let editor;

		beforeEach( async () => {
			editor = await ClassicTestEditor.create( element, {
				plugins: [ Paragraph, LinkEditing, Enter, Input, BoldEditing ],
				link: {
					decorators: {
						isFoo: {
							mode: 'manual',
							label: 'Foo',
							attributes: {
								class: 'foo'
							}
						},
						isBar: {
							mode: 'manual',
							label: 'Bar',
							attributes: {
								target: '_blank'
							}
						}
					}
				}
			} );

			model = editor.model;
			view = editor.editing.view;

			model.schema.extend( '$text', {
				allowIn: '$root',
				allowAttributes: [ 'linkIsFoo', 'linkIsBar' ]
			} );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should insert content after the link', () => {
			_setModelData( model, '<paragraph><$text linkHref="url">Bar[]</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph><$text linkHref="url">Bar</$text>[]</paragraph>' );

			editor.execute( 'insertText', { text: 'Foo' } );

			expect( _getModelData( model ) ).to.equal( '<paragraph><$text linkHref="url">Bar</$text>Foo[]</paragraph>' );
		} );

		it( 'should insert content before the link', () => {
			_setModelData( model, '<paragraph><$text linkHref="url">[]Bar</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph>[]<$text linkHref="url">Bar</$text></paragraph>' );

			editor.execute( 'insertText', { text: 'Foo' } );

			expect( _getModelData( model ) ).to.equal( '<paragraph>Foo[]<$text linkHref="url">Bar</$text></paragraph>' );
		} );

		it( 'should insert content to the link if clicked inside it', () => {
			_setModelData( model, '<paragraph><$text linkHref="url">B[]ar</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph><$text linkHref="url">B[]ar</$text></paragraph>' );

			editor.execute( 'insertText', { text: 'ar. B' } );

			expect( _getModelData( model ) ).to.equal( '<paragraph><$text linkHref="url">Bar. B[]ar</$text></paragraph>' );
		} );

		it( 'should insert content between two links (selection at the end of the first link)', () => {
			_setModelData( model, '<paragraph><$text linkHref="foo">Foo[]</$text><$text linkHref="bar">Bar</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph><$text linkHref="foo">Foo</$text>[]<$text linkHref="bar">Bar</$text></paragraph>'
			);

			editor.execute( 'insertText', { text: 'Foo' } );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph><$text linkHref="foo">Foo</$text>Foo[]<$text linkHref="bar">Bar</$text></paragraph>'
			);
		} );

		it( 'should insert content between two links (selection at the beginning of the second link)', () => {
			_setModelData( model, '<paragraph><$text linkHref="foo">Foo</$text><$text linkHref="bar">[]Bar</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph><$text linkHref="foo">Foo</$text>[]<$text linkHref="bar">Bar</$text></paragraph>'
			);

			editor.execute( 'insertText', { text: 'Foo' } );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph><$text linkHref="foo">Foo</$text>Foo[]<$text linkHref="bar">Bar</$text></paragraph>'
			);
		} );

		it( 'should do nothing if the text was not clicked', () => {
			_setModelData( model, '<paragraph><$text linkHref="url">Bar[]</$text></paragraph>' );

			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph><$text linkHref="url">Bar[]</$text></paragraph>' );
		} );

		it( 'should do nothing if the selection is not collapsed after the click', () => {
			_setModelData( model, '<paragraph>[<$text linkHref="url">Bar</$text>]</paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph>[<$text linkHref="url">Bar</$text>]</paragraph>' );
		} );

		it( 'should do nothing if the text is not a link', () => {
			_setModelData( model, '<paragraph><$text bold="true">Bar[]</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).to.equal( '<paragraph><$text bold="true">Bar[]</$text></paragraph>' );
		} );

		it( 'should remove all `link*` attributes', () => {
			allowLinkTarget( editor );

			_setModelData(
				model,
				'<paragraph><$text linkIsFoo="true" linkTarget="_blank" linkHref="https://ckeditor.com">Bar[]</$text></paragraph>'
			);

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph><$text linkHref="https://ckeditor.com" linkIsFoo="true" linkTarget="_blank">Bar</$text>[]</paragraph>'
			);

			editor.execute( 'insertText', { text: 'Foo' } );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph><$text linkHref="https://ckeditor.com" linkIsFoo="true" linkTarget="_blank">Bar</$text>Foo[]</paragraph>'
			);
		} );

		// Based on `packages/ckeditor5-engine/docs/_snippets/framework/extending-content-allow-link-target.js`.
		// And covers #8462.
		function allowLinkTarget( editor ) {
			editor.model.schema.extend( '$text', { allowAttributes: 'linkTarget' } );

			editor.conversion.for( 'downcast' ).attributeToElement( {
				model: 'linkTarget',
				view: ( attributeValue, { writer } ) => {
					return writer.createAttributeElement( 'a', { target: attributeValue }, { priority: 5 } );
				},
				converterPriority: 'low'
			} );
		}
	} );

	// https://github.com/ckeditor/ckeditor5/issues/4762
	describe( 'typing over the link', () => {
		let editor;

		beforeEach( async () => {
			editor = await ClassicTestEditor.create( element, {
				plugins: [ Paragraph, LinkEditing, Enter, Delete, BoldEditing, ItalicEditing, ImageBlockEditing ],
				link: {
					decorators: {
						isFoo: {
							mode: 'manual',
							label: 'Foo',
							attributes: {
								class: 'foo'
							}
						},
						isBar: {
							mode: 'manual',
							label: 'Bar',
							attributes: {
								target: '_blank'
							}
						}
					}
				}
			} );

			model = editor.model;
			view = editor.editing.view;

			model.schema.extend( '$text', {
				allowIn: '$root',
				allowAttributes: [ 'linkIsFoo', 'linkIsBar' ]
			} );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should require ClipboardPipeline plugin', () => {
			expect( LinkEditing.requires.includes( ClipboardPipeline ) ).to.equal( true );
		} );

		it( 'should require Input plugin', () => {
			expect( LinkEditing.requires.includes( Input ) ).to.equal( true );
		} );

		describe( 'insertText with specific selection (not ModelDocumentSelection, beforeinput)', () => {
			it( 'should preserve selection attributes when the entire link is selected', () => {
				_setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This is <$text linkHref="foo">Abcde[]</$text> from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should preserve selection attributes when the entire link is selected (mixed attributes in the link)', () => {
				_setModelData( model,
					'<paragraph>' +
					'This is [' +
					'<$text linkHref="foo" italic="true">F</$text>' +
					'<$text linkHref="foo" bold="true">o</$text>' +
					'<$text linkHref="foo" bold="true" italic="true">o</$text>' +
					'<$text linkHref="foo" bold="true">B</$text>' +
					'<$text linkHref="foo" bold="true" italic="true">a</$text>' +
					'<$text linkHref="foo">r</$text>]' +
					' from ' +
					'<$text linkHref="bar">Bar</$text>' +
					'.' +
					'</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>' +
					'This is ' +
					'<$text italic="true" linkHref="foo">Abcde[]</$text>' +
					' from ' +
					'<$text linkHref="bar">Bar</$text>' +
					'.' +
					'</paragraph>'
				);
			} );

			it( 'should preserve selection attributes when the selection starts at the beginning of the link', () => {
				_setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Fo]o</$text> from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This is <$text linkHref="foo">Abcde[]o</$text> from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should preserve selection attributes when it starts at the beginning of the link (mixed attributes in the link)', () => {
				_setModelData( model,
					'<paragraph>' +
					'This is [' +
					'<$text linkHref="foo" italic="true">F</$text>' +
					'<$text linkHref="foo" bold="true">o</$text>' +
					'<$text linkHref="foo" bold="true" italic="true">o</$text>' +
					'<$text linkHref="foo" bold="true">B</$text>' +
					'<$text linkHref="foo" bold="true" italic="true">a]</$text>' +
					'<$text linkHref="foo">r</$text>' +
					' from ' +
					'<$text linkHref="bar">Bar</$text>' +
					'.' +
					'</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>' +
					'This is ' +
					'<$text italic="true" linkHref="foo">Abcde[]</$text>' +
					'<$text linkHref="foo">r</$text>' +
					' from ' +
					'<$text linkHref="bar">Bar</$text>' +
					'.' +
					'</paragraph>'
				);
			} );

			it( 'should preserve all attributes of the link node (decorators check)', () => {
				_setModelData( model,
					'<paragraph>' +
					'This is ' +
					'<$text linkIsFoo="true" linkIsBar="true" linkHref="foo">[Foo]</$text>' +
					' from ' +
					'<$text linkHref="bar">Bar</$text>' +
					'.' +
					'</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>' +
					'This is ' +
					'<$text linkHref="foo" linkIsBar="true" linkIsFoo="true">Abcde[]</$text>' +
					' from ' +
					'<$text linkHref="bar">Bar</$text>' +
					'.' +
					'</paragraph>'
				);
			} );

			it( 'should not preserve selection attributes when the changes are not caused by typing', () => {
				_setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				model.change( writer => {
					model.deleteContent( model.document.selection );
					model.insertContent( writer.createText( 'Abcde' ) );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should not preserve selection attributes when the changes are not caused by typing (pasting check)', () => {
				_setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				view.document.fire( 'paste', {
					dataTransfer: createDataTransfer( {
						'text/html': '<p>Abcde</p>',
						'text/plain': 'Abcde'
					} ),
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should not preserve selection attributes when typed after cutting the content', () => {
				_setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				view.document.fire( 'cut', {
					dataTransfer: createDataTransfer(),
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				} );

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should not preserve anything if selected an element instead of text', () => {
				_setModelData( model,
					'[<imageBlock src="/assets/sample.png"></imageBlock>]'
				);

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( _getModelData( model ) ).to.equal(
					'Abcde[]'
				);
			} );

			it( 'should not preserve selection attributes when the entire link is selected and pressed "Backspace"', () => {
				_setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
					preventDefault: () => {
					}
				}, {
					direction: 'backward',
					selectionToRemove: view.document.selection
				} ) );

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should not preserve selection attributes when the entire link is selected and pressed "Delete"', () => {
				_setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
					preventDefault: () => {
					}
				}, {
					direction: 'forward',
					selectionToRemove: view.document.selection
				} ) );

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should preserve selection attributes (from first link) when selected different links', () => {
				_setModelData( model,
					'<paragraph>This is <$text linkHref="foo">[Foo</$text> from <$text linkHref="bar">Bar]</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>This is <$text linkHref="foo">Abcde[]</$text>.</paragraph>' );
			} );

			it( 'should not preserve selection attributes when selected more than single link (start of the selection)', () => {
				_setModelData( model,
					'<paragraph>This is[ <$text linkHref="foo">Foo]</$text> from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This isAbcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should preserve selection attributes when selected more than single link (end of the selection)', () => {
				_setModelData( model,
					'<paragraph>This is <$text linkHref="foo">[Foo</$text> ]from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This is <$text linkHref="foo">Abcde[]</$text>from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );
		} );

		describe( 'insertText with default selection (DocumentSelection, not beforeinput)', () => {
			it( 'should preserve selection attributes when the entire link is selected', () => {
				_setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This is <$text linkHref="foo">Abcde</$text>[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should preserve selection attributes when the entire link is selected (mixed attributes in the link)', () => {
				_setModelData( model,
					'<paragraph>' +
					'This is [' +
					'<$text linkHref="foo" italic="true">F</$text>' +
					'<$text linkHref="foo" bold="true">o</$text>' +
					'<$text linkHref="foo" bold="true" italic="true">o</$text>' +
					'<$text linkHref="foo" bold="true">B</$text>' +
					'<$text linkHref="foo" bold="true" italic="true">a</$text>' +
					'<$text linkHref="foo">r</$text>]' +
					' from ' +
					'<$text linkHref="bar">Bar</$text>' +
					'.' +
					'</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>' +
					'This is ' +
					'<$text italic="true" linkHref="foo">Abcde</$text>' +
					'<$text italic="true">[]</$text>' +
					' from ' +
					'<$text linkHref="bar">Bar</$text>' +
					'.' +
					'</paragraph>'
				);
			} );

			it( 'should preserve selection attributes when the selection starts at the beginning of the link', () => {
				_setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Fo]o</$text> from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This is <$text linkHref="foo">Abcde[]o</$text> from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should preserve selection attributes when it starts at the beginning of the link (mixed attributes in the link)', () => {
				_setModelData( model,
					'<paragraph>' +
					'This is [' +
					'<$text linkHref="foo" italic="true">F</$text>' +
					'<$text linkHref="foo" bold="true">o</$text>' +
					'<$text linkHref="foo" bold="true" italic="true">o</$text>' +
					'<$text linkHref="foo" bold="true">B</$text>' +
					'<$text linkHref="foo" bold="true" italic="true">a]</$text>' +
					'<$text linkHref="foo">r</$text>' +
					' from ' +
					'<$text linkHref="bar">Bar</$text>' +
					'.' +
					'</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>' +
					'This is ' +
					'<$text italic="true" linkHref="foo">Abcde[]</$text>' +
					'<$text linkHref="foo">r</$text>' +
					' from ' +
					'<$text linkHref="bar">Bar</$text>' +
					'.' +
					'</paragraph>'
				);
			} );

			it( 'should preserve all attributes of the link node (decorators check)', () => {
				_setModelData( model,
					'<paragraph>' +
					'This is ' +
					'<$text linkIsFoo="true" linkIsBar="true" linkHref="foo">[Foo]</$text>' +
					' from ' +
					'<$text linkHref="bar">Bar</$text>' +
					'.' +
					'</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>' +
					'This is ' +
					'<$text linkHref="foo" linkIsBar="true" linkIsFoo="true">Abcde</$text>[]' +
					' from ' +
					'<$text linkHref="bar">Bar</$text>' +
					'.' +
					'</paragraph>'
				);
			} );

			it( 'should not preserve selection attributes when the changes are not caused by typing', () => {
				_setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				model.change( writer => {
					model.deleteContent( model.document.selection );
					model.insertContent( writer.createText( 'Abcde' ) );
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should not preserve selection attributes when the changes are not caused by typing (pasting check)', () => {
				_setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				view.document.fire( 'paste', {
					dataTransfer: createDataTransfer( {
						'text/html': '<p>Abcde</p>',
						'text/plain': 'Abcde'
					} ),
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should not preserve selection attributes when typed after cutting the content', () => {
				_setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				view.document.fire( 'cut', {
					dataTransfer: createDataTransfer(),
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				} );

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should not preserve anything if selected an element instead of text', () => {
				_setModelData( model,
					'[<imageBlock src="/assets/sample.png"></imageBlock>]'
				);

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( _getModelData( model ) ).to.equal(
					'Abcde[]'
				);
			} );

			it( 'should not preserve selection attributes when the entire link is selected and pressed "Backspace"', () => {
				_setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
					preventDefault: () => {
					}
				}, {
					direction: 'backward',
					selectionToRemove: view.document.selection
				} ) );

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should not preserve selection attributes when the entire link is selected and pressed "Delete"', () => {
				_setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
					preventDefault: () => {
					}
				}, {
					direction: 'forward',
					selectionToRemove: view.document.selection
				} ) );

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should preserve selection attributes (from first link) when selected different links', () => {
				_setModelData( model,
					'<paragraph>This is <$text linkHref="foo">[Foo</$text> from <$text linkHref="bar">Bar]</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( _getModelData( model ) ).to.equal( '<paragraph>This is <$text linkHref="foo">Abcde</$text>[].</paragraph>' );
			} );

			it( 'should not preserve selection attributes when selected more than single link (start of the selection)', () => {
				_setModelData( model,
					'<paragraph>This is[ <$text linkHref="foo">Foo]</$text> from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This isAbcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should preserve selection attributes when selected more than single link (end of the selection)', () => {
				_setModelData( model,
					'<paragraph>This is <$text linkHref="foo">[Foo</$text> ]from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( _getModelData( model ) ).to.equal(
					'<paragraph>This is <$text linkHref="foo">Abcde</$text>[]from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );
		} );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/7521
	describe( 'removing a character before the link element', () => {
		let editor;

		beforeEach( async () => {
			editor = await ClassicTestEditor.create( element, {
				plugins: [ Paragraph, LinkEditing, Delete, BoldEditing ],
				link: {
					decorators: {
						isFoo: {
							mode: 'manual',
							label: 'Foo',
							attributes: {
								class: 'foo'
							}
						},
						isBar: {
							mode: 'manual',
							label: 'Bar',
							attributes: {
								target: '_blank'
							}
						}
					}
				}
			} );

			model = editor.model;
			view = editor.editing.view;

			model.schema.extend( '$text', {
				allowIn: '$root',
				allowAttributes: [ 'linkIsFoo', 'linkIsBar' ]
			} );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should not preserve the `linkHref` attribute when deleting content after the link', () => {
			_setModelData( model, '<paragraph>Foo <$text linkHref="url">Bar</$text> []</paragraph>' );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'initial state' ).to.equal( false );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing space after the link' ).to.equal( false );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing a character in the link' ).to.equal( false );
			expect( _getModelData( model ) ).to.equal( '<paragraph>Foo <$text linkHref="url">Ba</$text>[]</paragraph>' );
		} );

		it( 'should not preserve the `linkHref` attribute when deleting content after the link (decorators check)', () => {
			_setModelData( model,
				'<paragraph>' +
					'This is ' +
					'<$text linkIsFoo="true" linkIsBar="true" linkHref="foo">Foo</$text>' +
					' []from ' +
					'<$text linkHref="bar">Bar</$text>' +
					'.' +
				'</paragraph>'
			);

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'initial "linkHref" state' ).to.equal( false );
			expect( model.document.selection.hasAttribute( 'linkIsFoo' ), 'initial "linkIsFoo" state' ).to.equal( false );
			expect( model.document.selection.hasAttribute( 'linkHref' ), 'initial "linkHref" state' ).to.equal( false );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing space after the link ("linkHref")' ).to.equal( false );
			expect( model.document.selection.hasAttribute( 'linkIsFoo' ), 'removing space after the link ("linkIsFoo")' ).to.equal( false );
			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing space after the link ("linkHref")' ).to.equal( false );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing a character the link ("linkHref")' ).to.equal( false );
			expect( model.document.selection.hasAttribute( 'linkIsFoo' ), 'removing a character the link ("linkIsFoo")' ).to.equal( false );
			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing a character the link ("linkHref")' ).to.equal( false );

			expect( _getModelData( model ) ).to.equal(
				'<paragraph>' +
					'This is ' +
					'<$text linkHref="foo" linkIsBar="true" linkIsFoo="true">Fo</$text>' +
					'[]from ' +
					'<$text linkHref="bar">Bar</$text>' +
					'.' +
				'</paragraph>'
			);
		} );

		it( 'should preserve the `linkHref` attribute when deleting content while the selection is at the end of the link', () => {
			_setModelData( model, '<paragraph>Foo <$text linkHref="url">Bar []</$text></paragraph>' );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'initial state' ).to.equal( true );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing space after the link' ).to.equal( true );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing a character in the link' ).to.equal( true );
			expect( _getModelData( model ) ).to.equal( '<paragraph>Foo <$text linkHref="url">Ba[]</$text></paragraph>' );
		} );

		it( 'should preserve the `linkHref` attribute when deleting content while the selection is inside the link', () => {
			_setModelData( model, '<paragraph>Foo <$text linkHref="url">A long URLLs[] description</$text></paragraph>' );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'initial state' ).to.equal( true );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing space after the link' ).to.equal( true );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing a character in the link' ).to.equal( true );
			expect( _getModelData( model ) ).to.equal(
				'<paragraph>Foo <$text linkHref="url">A long URL[] description</$text></paragraph>'
			);
		} );

		it( 'should do nothing if there is no `linkHref` attribute', () => {
			_setModelData( model, '<paragraph>Foo <$text bold="true">Bolded.</$text> []Bar</paragraph>' );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( _getModelData( model ) ).to.equal( '<paragraph>Foo <$text bold="true">Bolded[]</$text>Bar</paragraph>' );
		} );

		it( 'should preserve the `linkHref` attribute when deleting content using "Delete" key', () => {
			_setModelData( model, '<paragraph>Foo <$text linkHref="url">Bar</$text>[ ]</paragraph>' );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'initial state' ).to.equal( false );

			view.document.fire( 'delete', new ViewDocumentDomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'forward',
				selectionToRemove: view.document.selection
			} ) );

			expect( _getModelData( model ) ).to.equal( '<paragraph>Foo <$text linkHref="url">Bar[]</$text></paragraph>' );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing space after the link' ).to.equal( true );
		} );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/13985
	describe( 'manual decorators with rel attribute', () => {
		let editor;

		beforeEach( async () => {
			editor = await ClassicTestEditor.create( element, {
				plugins: [ Paragraph, LinkEditing ],
				link: {
					decorators: {
						isFoo: {
							mode: 'manual',
							label: 'Foo',
							attributes: {
								rel: 'foo'
							}
						},
						isBar: {
							mode: 'manual',
							label: 'Bar',
							attributes: {
								rel: 'bar'
							}
						},
						isBaz: {
							mode: 'manual',
							label: 'Baz',
							attributes: {
								rel: 'baz abc'
							}
						}
					}
				}
			} );

			model = editor.model;
			view = editor.editing.view;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should upcast multiple manual decorators', () => {
			editor.setData( '<p><a href="#" rel="foo bar baz abc">link</a></p>' );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text linkHref="#" linkIsBar="true" linkIsBaz="true" linkIsFoo="true">link</$text></paragraph>'
			);
		} );

		it( 'should data downcast multiple manual decorators', () => {
			_setModelData( model,
				'<paragraph><$text linkHref="#" linkIsBar="true" linkIsBaz="true" linkIsFoo="true">link</$text></paragraph>'
			);

			expect( editor.getData() ).to.equal(
				'<p><a href="#" rel="bar baz abc foo">link</a></p>'
			);
		} );

		it( 'should editing view downcast multiple manual decorators', () => {
			_setModelData( model,
				'<paragraph><$text linkHref="#" linkIsBar="true" linkIsBaz="true" linkIsFoo="true">link</$text></paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><a href="#" rel="bar baz abc foo">link</a></p>'
			);
		} );

		it( 'should add manual decorator on rel attribute', () => {
			_setModelData( model,
				'<paragraph><$text linkHref="#">link</$text></paragraph>'
			);

			model.change( writer => {
				writer.setAttribute( 'linkIsFoo', true, model.document.getRoot().getChild( 0 ).getChild( 0 ) );
			} );

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><a href="#" rel="foo">link</a></p>'
			);

			model.change( writer => {
				writer.setAttribute( 'linkIsBar', true, model.document.getRoot().getChild( 0 ).getChild( 0 ) );
			} );

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><a href="#" rel="foo bar">link</a></p>'
			);

			model.change( writer => {
				writer.setAttribute( 'linkIsBaz', true, model.document.getRoot().getChild( 0 ).getChild( 0 ) );
			} );

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><a href="#" rel="foo bar baz abc">link</a></p>'
			);
		} );

		it( 'should remove manual decorator on rel attribute', () => {
			_setModelData( model,
				'<paragraph><$text linkHref="#" linkIsFoo="true" linkIsBar="true" linkIsBaz="true">link</$text></paragraph>'
			);

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><a href="#" rel="foo bar baz abc">link</a></p>'
			);

			model.change( writer => {
				writer.removeAttribute( 'linkIsBar', model.document.getRoot().getChild( 0 ).getChild( 0 ) );
			} );

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><a href="#" rel="foo baz abc">link</a></p>'
			);

			model.change( writer => {
				writer.removeAttribute( 'linkIsBaz', model.document.getRoot().getChild( 0 ).getChild( 0 ) );
			} );

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><a href="#" rel="foo">link</a></p>'
			);

			model.change( writer => {
				writer.removeAttribute( 'linkIsFoo', model.document.getRoot().getChild( 0 ).getChild( 0 ) );
			} );

			expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><a href="#">link</a></p>'
			);
		} );
	} );

	describe( 'conflicting automatic decorators with manual decorators', () => {
		beforeEach( async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, {
				plugins: [ Paragraph, LinkEditing ],
				link: {
					decorators: {
						// Manual decorator with rel attribute.
						manualRel: {
							mode: 'manual',
							label: 'Manual Rel',
							attributes: {
								rel: 'manual-value'
							}
						},
						// Manual decorator with class attribute.
						manualClass: {
							mode: 'manual',
							label: 'Manual Class',
							classes: 'manual-class'
						},
						// Manual decorator with style.
						manualStyle: {
							mode: 'manual',
							label: 'Manual Style',
							styles: {
								color: 'red'
							}
						},
						// Manual decorator with target attribute.
						manualTarget: {
							mode: 'manual',
							label: 'Manual Target',
							attributes: {
								target: '_self'
							}
						},
						// Automatic decorator with rel attribute - conflicts with manualRel.
						// Only activates for URLs containing 'rel-test'.
						autoRel: {
							mode: 'automatic',
							callback: url => url.includes( 'rel-test' ),
							attributes: {
								rel: 'auto-value'
							}
						},
						// Automatic decorator with class - conflicts with manualClass.
						// Only activates for URLs containing 'class-test'.
						autoClass: {
							mode: 'automatic',
							callback: url => url.includes( 'class-test' ),
							classes: 'auto-class'
						},
						// Automatic decorator with style - conflicts with manualStyle.
						// Only activates for URLs containing 'style-test'.
						autoStyle: {
							mode: 'automatic',
							callback: url => url.includes( 'style-test' ),
							styles: {
								color: 'blue'
							}
						},
						// Automatic decorator with target - conflicts with manualTarget.
						// Only activates for URLs containing 'target-test'.
						autoTarget: {
							mode: 'automatic',
							callback: url => url.includes( 'target-test' ),
							attributes: {
								target: '_blank'
							}
						}
					}
				}
			} );

			model = editor.model;
			view = editor.editing.view;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		describe( 'consume', () => {
			it( 'should not apply manual decorator if consumable was already consumed by another converter (when apply)', async () => {
				editor.conversion.for( 'downcast' ).add( dispatcher => {
					dispatcher.on( 'attribute:linkManualTarget', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, evt.name );
					}, { priority: 'high' } );
				} );

				_setModelData( model,
					'<paragraph><$text linkHref="http://example.com" linkManualTarget="true">link</$text></paragraph>'
				);

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://example.com">link</a></p>'
				);
			} );

			it( 'should not remove manual decorator wrapping if consumable test fails (when remove)', async () => {
				editor.conversion.for( 'downcast' ).add( dispatcher => {
					dispatcher.on( 'attribute:linkManualTarget', ( evt, data, conversionApi ) => {
						if ( data.attributeNewValue === null ) {
							conversionApi.consumable.consume( data.item, evt.name );
						}
					}, { priority: 'high' } );
				} );

				_setModelData( model,
					'<paragraph><$text linkHref="http://example.com" linkManualTarget="true">link</$text></paragraph>'
				);

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://example.com" target="_self">link</a></p>'
				);

				expect( () => {
					model.change( writer => {
						writer.removeAttribute( 'linkManualTarget', model.document.getRoot().getChild( 0 ).getChild( 0 ) );
					} );
				} ).to.not.throw();

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://example.com" target="_self">link</a></p>'
				);
			} );
		} );

		describe( 'toggling manual decorator that conflicts with automatic decorator', () => {
			it( 'should block automatic decorator when manual decorator with conflicting target is activated', () => {
				_setModelData( model,
					'<paragraph><$text linkHref="http://target-test.com">link</$text></paragraph>'
				);

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://target-test.com" target="_blank">link</a></p>'
				);

				model.change( writer => {
					writer.setAttribute( 'linkManualTarget', true, model.document.getRoot().getChild( 0 ).getChild( 0 ) );
				} );

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://target-test.com" target="_self">link</a></p>'
				);
			} );

			it( 'should restore automatic decorator when manual decorator with conflicting target is deactivated', () => {
				_setModelData( model,
					'<paragraph><$text linkHref="http://target-test.com" linkManualTarget="true">link</$text></paragraph>'
				);

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://target-test.com" target="_self">link</a></p>'
				);

				model.change( writer => {
					writer.removeAttribute( 'linkManualTarget', model.document.getRoot().getChild( 0 ).getChild( 0 ) );
				} );

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://target-test.com" target="_blank">link</a></p>'
				);
			} );
		} );

		describe( 'conflicting rel attribute', () => {
			it( 'should merge automatic decorator with manual decorator when they set conflicting rel', () => {
				_setModelData( model,
					'<paragraph><$text linkHref="http://rel-test.com" linkManualRel="true">link</$text></paragraph>'
				);

				// Attributes should be merged.
				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://rel-test.com" rel="auto-value manual-value">link</a></p>'
				);
			} );

			it( 'should apply automatic decorator when manual decorator is not set', () => {
				_setModelData( model,
					'<paragraph><$text linkHref="http://rel-test.com">link</$text></paragraph>'
				);

				// Automatic decorator should be applied.
				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://rel-test.com" rel="auto-value">link</a></p>'
				);
			} );

			it( 'should upcast both manual and automatic decorators correctly when they do not conflict', () => {
				editor.setData( '<p><a href="ftp://example.com" rel="manual-value">link</a></p>' );

				// FTP link doesn't trigger automatic decorator (starts with http).
				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph><$text linkHref="ftp://example.com" linkManualRel="true">link</$text></paragraph>'
				);
			} );
		} );

		describe( 'conflicting class attribute', () => {
			it( 'should apply automatic decorator when manual decorator sets non-conflicting class', () => {
				_setModelData( model,
					'<paragraph><$text linkHref="http://class-test.com" linkManualClass="true">link</$text></paragraph>'
				);

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a class="auto-class manual-class" href="http://class-test.com">link</a></p>'
				);
			} );

			it( 'should apply automatic decorator when manual decorator is not set', () => {
				_setModelData( model,
					'<paragraph><$text linkHref="http://class-test.com">link</$text></paragraph>'
				);

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a class="auto-class" href="http://class-test.com">link</a></p>'
				);
			} );
		} );

		describe( 'conflicting style properties', () => {
			it( 'should not apply automatic decorator when manual decorator sets conflicting style', () => {
				_setModelData( model,
					'<paragraph><$text linkHref="http://style-test.com" linkManualStyle="true">link</$text></paragraph>'
				);

				// Manual decorator should win, automatic decorator should be blocked.
				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://style-test.com" style="color:red">link</a></p>'
				);
			} );

			it( 'should apply automatic decorator when manual decorator is not set', () => {
				_setModelData( model,
					'<paragraph><$text linkHref="http://style-test.com">link</$text></paragraph>'
				);

				// Automatic decorator should be applied.
				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://style-test.com" style="color:blue">link</a></p>'
				);
			} );
		} );

		describe( 'conflicting non-mergeable attributes', () => {
			it( 'should not apply automatic decorator when manual decorator sets conflicting target', () => {
				_setModelData( model,
					'<paragraph><$text linkHref="http://target-test.com" linkManualTarget="true">link</$text></paragraph>'
				);

				// Manual decorator should win, automatic decorator should be blocked.
				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://target-test.com" target="_self">link</a></p>'
				);
			} );

			it( 'should apply automatic decorator when manual decorator is not set', () => {
				_setModelData( model,
					'<paragraph><$text linkHref="http://target-test.com">link</$text></paragraph>'
				);

				// Automatic decorator should be applied.
				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://target-test.com" target="_blank">link</a></p>'
				);
			} );
		} );

		describe( 'multiple conflicting decorators', () => {
			it( 'should merge compatible attributes and overwrite incompatible ones when multiple manual decorators are set', () => {
				_setModelData( model,
					'<paragraph>' +
						'<$text linkHref="http://rel-test.com/class-test/style-test/target-test" ' +
						'linkManualRel="true" linkManualClass="true" linkManualStyle="true" linkManualTarget="true">' +
						'link' +
						'</$text>' +
					'</paragraph>'
				);

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p>' +
						'<a class="auto-class manual-class" href="http://rel-test.com/class-test/style-test/target-test" ' +
						'rel="manual-value auto-value" style="color:red" target="_self">' +
						'link' +
						'</a>' +
					'</p>'
				);
			} );

			it( 'should apply non-conflicting automatic decorators', () => {
				_setModelData( model,
					'<paragraph><$text linkHref="http://class-test.com" linkManualRel="true">link</$text></paragraph>'
				);

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a class="auto-class" href="http://class-test.com" rel="manual-value">link</a></p>'
				);
			} );

			it( 'should handle partial conflicts with manual decorators', () => {
				_setModelData( model,
					'<paragraph><$text linkHref="http://rel-test.com/class-test/style-test" linkManualStyle="true">link</$text></paragraph>'
				);

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p>' +
						'<a ' +
							'class="auto-class" ' +
							'href="http://rel-test.com/class-test/style-test" ' +
							'rel="auto-value" ' +
							'style="color:red"' +
						'>' +
							'link' +
						'</a>' +
					'</p>'
				);
			} );
		} );

		describe( 'data upcasting with conflicts', () => {
			it( 'should upcast manual decorator when both automatic and manual values are present', () => {
				editor.setData( '<p><a href="http://rel-test.com" rel="manual-value auto-value">link</a></p>' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph><$text linkHref="http://rel-test.com" linkManualRel="true">link</$text></paragraph>'
				);
			} );

			it( 'should not upcast automatic decorator values', () => {
				editor.setData( '<p><a href="http://rel-test.com" rel="auto-value">link</a></p>' );

				expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph><$text linkHref="http://rel-test.com">link</$text></paragraph>'
				);
			} );
		} );

		describe( 'updating decorators', () => {
			it( 'should apply automatic decorator when manual decorator is removed', () => {
				_setModelData( model,
					'<paragraph><$text linkHref="http://rel-test.com" linkManualRel="true">link</$text></paragraph>'
				);

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://rel-test.com" rel="auto-value manual-value">link</a></p>'
				);

				model.change( writer => {
					writer.removeAttribute( 'linkManualRel', model.document.getRoot().getChild( 0 ).getChild( 0 ) );
				} );

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://rel-test.com" rel="auto-value">link</a></p>'
				);
			} );

			it( 'should not block automatic decorator when manual decorator is added', () => {
				_setModelData( model,
					'<paragraph><$text linkHref="http://rel-test.com">link</$text></paragraph>'
				);

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://rel-test.com" rel="auto-value">link</a></p>'
				);

				model.change( writer => {
					writer.setAttribute( 'linkManualRel', true, model.document.getRoot().getChild( 0 ).getChild( 0 ) );
				} );

				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://rel-test.com" rel="auto-value manual-value">link</a></p>'
				);
			} );
		} );

		describe( 'edge cases', () => {
			it( 'should handle URLs that do not match automatic decorator callback', () => {
				_setModelData( model,
					'<paragraph><$text linkHref="http://no-match.com" linkManualRel="true">link</$text></paragraph>'
				);

				// URL doesn't match automatic decorator callback, only manual should be applied.
				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="http://no-match.com" rel="manual-value">link</a></p>'
				);
			} );

			it( 'should handle FTP protocol links', () => {
				_setModelData( model,
					'<paragraph><$text linkHref="ftp://example.com" linkManualRel="true">link</$text></paragraph>'
				);

				// FTP link doesn't match any automatic decorator, only manual should be applied.
				expect( _getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<p><a href="ftp://example.com" rel="manual-value">link</a></p>'
				);
			} );
		} );
	} );

	describe( 'conflicting decorator attributes postfixer', () => {
		beforeEach( async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, {
				plugins: [ Paragraph, LinkEditing, Enter ],
				link: {
					decorators: {
						decorator1: {
							mode: 'manual',
							label: 'Decorator 3',
							attributes: {
								target: 'blank'
							}
						},
						decorator2: {
							mode: 'manual',
							label: 'Decorator 4',
							attributes: {
								target: 'self'
							}
						},
						decorator3: {
							mode: 'manual',
							label: 'Decorator 5',
							attributes: {
								rel: 'nofollow'
							}
						},
						decorator4: {
							mode: 'manual',
							label: 'Decorator 6',
							attributes: {
								rel: 'noopener'
							}
						}
					}
				}
			} );

			model = editor.model;
			view = editor.editing.view;
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should drop conflicting decorator when setting new one', () => {
			_setModelData( model,
				'<paragraph><$text linkHref="http://example.com" linkDecorator1="true">link</$text>[]</paragraph>'
			);

			model.change( writer => {
				const text = model.document.getRoot().getChild( 0 ).getChild( 0 );

				writer.setAttribute( 'linkDecorator2', true, text );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text linkDecorator2="true" linkHref="http://example.com">link</$text></paragraph>'
			);
		} );

		it( 'should not drop conflicting decorator when setting non-conflicting one', () => {
			_setModelData( model,
				'<paragraph><$text linkHref="http://example.com" linkDecorator1="true">link</$text>[]</paragraph>'
			);

			model.change( writer => {
				const text = model.document.getRoot().getChild( 0 ).getChild( 0 );

				writer.setAttribute( 'linkDecorator3', true, text );
			} );

			expect( _getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text linkDecorator1="true" linkDecorator3="true" linkHref="http://example.com">link</$text></paragraph>'
			);
		} );
	} );

	function createDataTransfer( data ) {
		return {
			getData( type ) {
				return data[ type ];
			},
			setData() {}
		};
	}
} );
