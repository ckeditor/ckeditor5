/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import LinkEditing from '../src/linkediting.js';
import LinkCommand from '../src/linkcommand.js';
import UnlinkCommand from '../src/unlinkcommand.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import ItalicEditing from '@ckeditor/ckeditor5-basic-styles/src/italic/italicediting.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata.js';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Input from '@ckeditor/ckeditor5-typing/src/input.js';
import Delete from '@ckeditor/ckeditor5-typing/src/delete.js';
import ImageInline from '@ckeditor/ckeditor5-image/src/imageinline.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
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
			setModelData( editor.model, '<paragraph>foo[]<$text linkHref="url">b</$text>ar</paragraph>' );

			// The selection's gravity should read attributes from the left.
			expect( selection ).not.to.have.attribute( 'linkHref' );

			// So let's simulate the `keydown` event.
			editor.editing.view.document.fire( 'keydown', {
				keyCode: keyCodes.arrowright,
				preventDefault: () => {},
				domTarget: document.body
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo<$text linkHref="url">[]b</$text>ar</paragraph>' );
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
			setModelData( editor.model, '<paragraph>foo[]<$text linkHref="url">b</$text>ar</paragraph>' );

			// The selection's gravity should read attributes from the left.
			expect( selection ).not.to.have.attribute( 'linkHref' );

			// So let's simulate the `keydown` event.
			editor.editing.view.document.fire( 'keydown', {
				keyCode: keyCodes.arrowleft,
				preventDefault: () => {},
				domTarget: document.body
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo<$text linkHref="url">[]b</$text>ar</paragraph>' );
			// Selection should get the attributes from the right.
			expect( selection ).to.have.attribute( 'linkHref' );
			expect( selection ).to.have.attribute( 'linkHref', 'url' );

			await editor.destroy();
		} );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/6053
	describe( 'selection attribute management on paste', () => {
		it( 'should remove link attributes when pasting a link', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { linkHref: 'ckeditor.com' } ) );
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo<$text linkHref="ckeditor.com">INSERTED</$text>[]</paragraph>' );

			expect( [ ...model.document.selection.getAttributeKeys() ] ).to.be.empty;
		} );

		it( 'should remove all attributes starting with "link" (e.g. decorator attributes) when pasting a link', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { linkHref: 'ckeditor.com', linkIsExternal: true } ) );
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>' +
					'foo<$text linkHref="ckeditor.com" linkIsExternal="true">INSERTED</$text>[]' +
				'</paragraph>'
			);

			expect( [ ...model.document.selection.getAttributeKeys() ] ).to.be.empty;
		} );

		it( 'should not remove link attributes when pasting a non-link content', () => {
			setModelData( model, '<paragraph><$text linkHref="ckeditor.com">foo[]</$text></paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { bold: 'true' } ) );
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>' +
					'<$text linkHref="ckeditor.com">foo</$text>' +
					'<$text bold="true">INSERTED[]</$text>' +
				'</paragraph>'
			);

			expect( model.document.selection ).to.have.attribute( 'bold' );
		} );

		it( 'should not remove link attributes when pasting in the middle of a link with the same URL', () => {
			setModelData( model, '<paragraph><$text linkHref="ckeditor.com">fo[]o</$text></paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { linkHref: 'ckeditor.com' } ) );
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph><$text linkHref="ckeditor.com">foINSERTED[]o</$text></paragraph>' );
			expect( model.document.selection ).to.have.attribute( 'linkHref' );
		} );

		it( 'should not remove link attributes from the selection when pasting before a link when the gravity is overridden', () => {
			setModelData( model, '<paragraph>foo[]<$text linkHref="ckeditor.com">bar</$text></paragraph>' );

			view.document.fire( 'keydown', {
				keyCode: keyCodes.arrowright,
				preventDefault: () => {},
				domTarget: document.body
			} );

			expect( model.document.selection ).to.have.property( 'isGravityOverridden', true );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { bold: true } ) );
			} );

			expect( getModelData( model ) ).to.equal(
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
			setModelData( model, '<paragraph><$text linkHref="ckeditor.com">f[]oo</$text></paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { linkHref: 'http://INSERTED' } ) );
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>' +
					'<$text linkHref="ckeditor.com">f</$text>' +
					'<$text linkHref="http://INSERTED">INSERTED</$text>[]' +
					'<$text linkHref="ckeditor.com">oo</$text>' +
				'</paragraph>'
			);

			expect( [ ...model.document.selection.getAttributeKeys() ] ).to.be.empty;
		} );

		it( 'should not remove link attributes when pasting before another link (different URLs, no merge)', () => {
			setModelData( model, '<paragraph>[]<$text linkHref="ckeditor.com">foo</$text></paragraph>' );

			expect( model.document.selection ).to.have.property( 'isGravityOverridden', false );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { linkHref: 'http://INSERTED' } ) );
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>' +
					'<$text linkHref="http://INSERTED">INSERTED</$text>[]' +
					'<$text linkHref="ckeditor.com">foo</$text>' +
				'</paragraph>'
			);

			expect( [ ...model.document.selection.getAttributeKeys() ] ).to.be.empty;
		} );

		// https://github.com/ckeditor/ckeditor5/issues/8158
		it( 'should expand link text on pasting plain text', () => {
			setModelData( model, '<paragraph><$text linkHref="ckeditor.com">f[]oo</$text></paragraph>' );

			view.document.fire( 'paste', {
				dataTransfer: createDataTransfer( {
					'text/html': '<p>bar</p>',
					'text/plain': 'bar'
				} ),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>' +
					'<$text linkHref="ckeditor.com">fbar[]oo</$text>' +
				'</paragraph>'
			);
		} );

		it( 'doesn\'t affect attributes other than link', () => {
			setModelData( model, '<paragraph><$text bold="true">[foo]</$text></paragraph>' );

			view.document.fire( 'paste', {
				dataTransfer: createDataTransfer( {
					'text/html': '<p>bar</p>',
					'text/plain': 'bar'
				} ),
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			} );

			expect( getModelData( model ) ).to.equal(
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

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text linkHref="url">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><a href="url">foo</a>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			editor.setData( '<a href="url">foo</a>bar' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text linkHref="url">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><a href="url">foo</a>bar</p>' );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/500
		it( 'should not pick up `<a name="foo">`', () => {
			editor.setData( '<p><a name="foo">foo</a>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foobar</paragraph>' );
		} );

		// CKEditor 4 does. And CKEditor 5's balloon allows creating such links.
		it( 'should pick up `<a href="">`', () => {
			editor.setData( '<p><a href="">foo</a>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text linkHref="">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><a href="">foo</a>bar</p>' );
		} );

		// The editor's role is not to filter out potentially malicious data.
		// Its job is to not let this code be executed inside the editor (see the test in "editing pipeline conversion").
		it( 'should output a link with a potential XSS code', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			model.change( writer => {
				writer.insertText( 'foo', { linkHref: 'javascript:alert(1)' }, model.document.selection.getFirstPosition() );
			} );

			expect( editor.getData() ).to.equal( '<p><a href="javascript:alert(1)">foo</a></p>' );
		} );

		it( 'should load a link with a potential XSS code', () => {
			editor.setData( '<p><a href="javascript:alert(1)">foo</a></p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text linkHref="javascript:alert(1)">foo</$text></paragraph>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( model, '<paragraph><$text linkHref="url">foo</$text>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p><a href="url">foo</a>bar</p>' );
		} );

		it( 'should convert to link element instance', () => {
			setModelData( model, '<paragraph><$text linkHref="url">foo</$text>bar</paragraph>' );

			const element = editor.editing.view.document.getRoot().getChild( 0 ).getChild( 0 );
			expect( isLinkElement( element ) ).to.be.true;
		} );

		// https://github.com/ckeditor/ckeditor5-link/issues/121
		it( 'should should set priority for `linkHref` higher than all other attribute elements', () => {
			model.schema.extend( '$text', { allowAttributes: 'foo' } );

			editor.conversion.for( 'downcast' ).attributeToElement( { model: 'foo', view: 'f' } );

			setModelData( model,
				'<paragraph>' +
					'<$text linkHref="url">a</$text><$text foo="true" linkHref="url">b</$text><$text linkHref="url">c</$text>' +
				'</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><a href="url">a<f>b</f>c</a></p>' );
		} );

		it( 'must not render a link with a potential XSS code', () => {
			setModelData( model, '<paragraph><$text linkHref="javascript:alert(1)">[]foo</$text>bar[]</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
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
				setModelData( model, '<paragraph><$text linkHref="custom:address.in.app">[]foo</$text>bar[]</paragraph>' );

				expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
					.to.equal( '<p><a href="custom:address.in.app">foo</a>bar</p>' );
			} );
		} );
	} );

	describe( 'link highlighting', () => {
		it( 'should convert the highlight to a proper view classes', () => {
			setModelData( model,
				'<paragraph>foo <$text linkHref="url">b{}ar</$text> baz</paragraph>'
			);

			expect( model.document.selection ).to.have.attribute( 'linkHref' );
			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">b{}ar</a> baz</p>'
			);
		} );

		it( 'should work whenever selection has linkHref attribute - link start', () => {
			setModelData( model,
				'<paragraph>foo {}<$text linkHref="url">bar</$text> baz</paragraph>'
			);

			expect( model.document.selection ).to.not.have.attribute( 'linkHref' );

			model.change( writer => {
				writer.setSelectionAttribute( 'linkHref', 'url' );
			} );

			expect( model.document.selection ).to.have.attribute( 'linkHref' );
			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">{}bar</a> baz</p>'
			);
		} );

		it( 'should work whenever selection has linkHref attribute - link end', () => {
			setModelData( model,
				'<paragraph>foo <$text linkHref="url">bar</$text>{} baz</paragraph>'
			);

			expect( model.document.selection ).to.have.attribute( 'linkHref' );
			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">bar{}</a> baz</p>'
			);
		} );

		it( 'should render highlight correctly after splitting the link', () => {
			setModelData( model,
				'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
			);

			editor.execute( 'enter' );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo <$text linkHref="url">li</$text></paragraph>' +
				'<paragraph><$text linkHref="url">[]nk</$text> baz</paragraph>'
			);

			expect( model.document.selection ).to.have.attribute( 'linkHref' );
			expect( getViewData( view ) ).to.equal(
				'<p>foo <a href="url">li</a></p>' +
				'<p><a class="ck-link_selected" href="url">{}nk</a> baz</p>'
			);
		} );

		it( 'should remove classes when selection is moved out from the link', () => {
			setModelData( model,
				'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
			);

			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">li{}nk</a> baz</p>'
			);

			model.change( writer => writer.setSelection( model.document.getRoot().getChild( 0 ), 0 ) );

			expect( getViewData( view ) ).to.equal(
				'<p>{}foo <a href="url">link</a> baz</p>'
			);
		} );

		it( 'should work correctly when selection is moved inside link', () => {
			setModelData( model,
				'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
			);

			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">li{}nk</a> baz</p>'
			);

			model.change( writer => writer.setSelection( model.document.getRoot().getChild( 0 ), 5 ) );

			expect( getViewData( view ) ).to.equal(
				'<p>foo <a class="ck-link_selected" href="url">l{}ink</a> baz</p>'
			);
		} );

		describe( 'downcast conversion integration', () => {
			it( 'works for the #insert event', () => {
				setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.insertText( 'FOO', { linkHref: 'url' }, model.document.selection.getFirstPosition() );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>foo <a class="ck-link_selected" href="url">liFOO{}nk</a> baz</p>'
				);
			} );

			it( 'works for the #remove event', () => {
				setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.remove( writer.createRange(
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 0 ),
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 5 )
					) );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p><a class="ck-link_selected" href="url">i{}nk</a> baz</p>'
				);
			} );

			it( 'works for the #attribute event', () => {
				setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.setAttribute( 'linkHref', 'new-url', writer.createRange(
						model.document.selection.getFirstPosition().getShiftedBy( -1 ),
						model.document.selection.getFirstPosition().getShiftedBy( 1 ) )
					);
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>foo <a href="url">l</a><a class="ck-link_selected" href="new-url">i{}n</a><a href="url">k</a> baz</p>'
				);
			} );

			it( 'works for the #selection event', () => {
				setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					writer.setSelection( writer.createRange(
						model.document.selection.getFirstPosition().getShiftedBy( -1 ),
						model.document.selection.getFirstPosition().getShiftedBy( 1 ) )
					);
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>foo <a class="ck-link_selected" href="url">l{in}k</a> baz</p>'
				);
			} );

			it( 'works for the addMarker and removeMarker events', () => {
				editor.conversion.for( 'editingDowncast' ).markerToHighlight( { model: 'fooMarker', view: {} } );

				setModelData( model,
					'<paragraph>foo <$text linkHref="url">li{}nk</$text> baz</paragraph>'
				);

				model.change( writer => {
					const range = writer.createRange(
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 0 ),
						writer.createPositionAt( model.document.getRoot().getChild( 0 ), 5 )
					);

					writer.addMarker( 'fooMarker', { range, usingOperation: true } );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p><span>foo </span><a class="ck-link_selected" href="url"><span>l</span>i{}nk</a> baz</p>'
				);

				model.change( writer => writer.removeMarker( 'fooMarker' ) );

				expect( getViewData( view ) ).to.equal(
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

						expect( getModelData( model, { withoutSelection: true } ) )
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

					expect( getModelData( model, { withoutSelection: true } ) )
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

						expect( getModelData( model, { withoutSelection: true } ) )
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

				expect( getModelData( model, { withoutSelection: true } ) )
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

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
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

				expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
					'<paragraph>' +
						'<$text linkHref="url">Foo</$text>' +
						'<$text linkHref="example.com">Bar</$text>' +
					'</paragraph>'
				);

				await editor.destroy();
			} );
		} );

		it( 'should downcast manual decorator on document selection', () => {
			setModelData( model, '<paragraph><$text linkHref="url" linkIsExternal="true">foo[]bar</$text></paragraph>' );

			expect( getViewData( editor.editing.view ) ).to.equal(
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
					setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );

					fireClickEvent( { metaKey: true, ctrlKey: false }, editor, view );

					expect( stub.calledOnce ).to.be.true;
					expect( stub.calledOn( window ) ).to.be.true;
					expect( stub.calledWith( 'http://www.ckeditor.com', '_blank', 'noopener' ) ).to.be.true;
					expect( eventPreventDefault.calledOnce ).to.be.true;
				} );

				it( 'should not follow the link after CTRL+click', () => {
					setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );

					fireClickEvent( { metaKey: false, ctrlKey: true }, editor, view );

					expect( stub.notCalled ).to.be.true;
					expect( eventPreventDefault.calledOnce ).to.be.false;
				} );

				it( 'should not follow the link after click with neither CMD nor CTRL pressed', () => {
					setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );

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
						setModelData( model,
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
					setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );

					fireClickEvent( { metaKey: false, ctrlKey: true }, editor, view );

					expect( stub.calledOnce ).to.be.true;
					expect( stub.calledOn( window ) ).to.be.true;
					expect( stub.calledWith( 'http://www.ckeditor.com', '_blank', 'noopener' ) ).to.be.true;
				} );

				it( 'should not follow the link after CMD+click', () => {
					setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );

					fireClickEvent( { metaKey: true, ctrlKey: false }, editor, view );

					expect( stub.notCalled ).to.be.true;
				} );

				it( 'should not follow the link after click with neither CMD nor CTRL pressed', () => {
					setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );

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
						setModelData( model,
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
				setModelData( model, '<paragraph>[<imageInline linkHref="http://www.ckeditor.com"></imageInline>]</paragraph>' );

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

				setModelData( model, '<paragraph><$text customLink="">Bar[]</$text></paragraph>' );

				fireClickEvent( { metaKey: env.isMac, ctrlKey: !env.isMac }, editor, view );

				expect( stub.notCalled ).to.be.true;
				expect( eventPreventDefault.calledOnce ).to.be.false;
			} );

			it( 'should not follow the link if no link is clicked', () => {
				editor.conversion.attributeToElement( {
					model: 'customLink',
					view: 'span'
				} );

				setModelData( model, '<paragraph><$text customLink="">Bar[]</$text></paragraph>' );

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
					setModelData( model, modelData );

					fireEnterPressedEvent( { altKey: true }, view );

					expect( stub.calledOnce ).to.be.true;
					expect( stub.calledOn( window ) ).to.be.true;
					expect( stub.calledWith( 'http://www.ckeditor.com', '_blank', 'noopener' ) ).to.be.true;
				} );
			}

			it( 'should not open link after pressing ENTER without ALT', () => {
				setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Ba[]r</$text></paragraph>' );

				fireEnterPressedEvent( { altKey: false }, view );

				expect( stub.notCalled ).to.be.true;
			} );

			it( 'should not open link after pressing ALT+ENTER if not inside a link', () => {
				setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar</$text>Baz[]</paragraph>' );

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
					setModelData( model,
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
					setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );
					fireClickEvent( { metaKey: false, ctrlKey: true }, editor, view );

					expect( stub.calledOnce ).to.be.true;
					expect( stub.calledWith( 'http://www.ckeditor.com', '_blank', 'noopener' ) ).to.be.true;
				} );

				it( 'should not open link with custom opener that returns false', () => {
					const opener = sinon.stub().returns( false );

					editing._registerLinkOpener( opener );

					setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );
					fireClickEvent( { metaKey: false, ctrlKey: true }, editor, view );

					expect( opener.calledOnce ).to.be.true;
					expect( opener.calledWith( 'http://www.ckeditor.com' ) ).to.be.true;
					expect( stub ).to.be.called;
				} );

				it( 'should open link with custom opener that returns true', () => {
					const opener = sinon.stub().returns( true );

					editing._registerLinkOpener( opener );

					setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );
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

					setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );
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
					setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );
					fireEnterPressedEvent( { altKey: true }, view );

					expect( stub.calledOnce ).to.be.true;
					expect( stub.calledWith( 'http://www.ckeditor.com', '_blank', 'noopener' ) ).to.be.true;
				} );

				it( 'should not open link with custom opener that returns false', () => {
					const opener = sinon.stub().returns( false );

					editing._registerLinkOpener( opener );

					setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );
					fireEnterPressedEvent( { altKey: true }, view );

					expect( opener.calledOnce ).to.be.true;
					expect( opener.calledWith( 'http://www.ckeditor.com' ) ).to.be.true;
					expect( stub ).to.be.called;
				} );

				it( 'should open link with custom opener that returns true', () => {
					const opener = sinon.stub().returns( true );

					editing._registerLinkOpener( opener );

					setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );
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

					setModelData( model, '<paragraph><$text linkHref="http://www.ckeditor.com">Bar[]</$text></paragraph>' );
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
			setModelData( model, '<paragraph><$text linkHref="url">Bar[]</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph><$text linkHref="url">Bar</$text>[]</paragraph>' );

			editor.execute( 'insertText', { text: 'Foo' } );

			expect( getModelData( model ) ).to.equal( '<paragraph><$text linkHref="url">Bar</$text>Foo[]</paragraph>' );
		} );

		it( 'should insert content before the link', () => {
			setModelData( model, '<paragraph><$text linkHref="url">[]Bar</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]<$text linkHref="url">Bar</$text></paragraph>' );

			editor.execute( 'insertText', { text: 'Foo' } );

			expect( getModelData( model ) ).to.equal( '<paragraph>Foo[]<$text linkHref="url">Bar</$text></paragraph>' );
		} );

		it( 'should insert content to the link if clicked inside it', () => {
			setModelData( model, '<paragraph><$text linkHref="url">B[]ar</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph><$text linkHref="url">B[]ar</$text></paragraph>' );

			editor.execute( 'insertText', { text: 'ar. B' } );

			expect( getModelData( model ) ).to.equal( '<paragraph><$text linkHref="url">Bar. B[]ar</$text></paragraph>' );
		} );

		it( 'should insert content between two links (selection at the end of the first link)', () => {
			setModelData( model, '<paragraph><$text linkHref="foo">Foo[]</$text><$text linkHref="bar">Bar</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph><$text linkHref="foo">Foo</$text>[]<$text linkHref="bar">Bar</$text></paragraph>'
			);

			editor.execute( 'insertText', { text: 'Foo' } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph><$text linkHref="foo">Foo</$text>Foo[]<$text linkHref="bar">Bar</$text></paragraph>'
			);
		} );

		it( 'should insert content between two links (selection at the beginning of the second link)', () => {
			setModelData( model, '<paragraph><$text linkHref="foo">Foo</$text><$text linkHref="bar">[]Bar</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph><$text linkHref="foo">Foo</$text>[]<$text linkHref="bar">Bar</$text></paragraph>'
			);

			editor.execute( 'insertText', { text: 'Foo' } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph><$text linkHref="foo">Foo</$text>Foo[]<$text linkHref="bar">Bar</$text></paragraph>'
			);
		} );

		it( 'should do nothing if the text was not clicked', () => {
			setModelData( model, '<paragraph><$text linkHref="url">Bar[]</$text></paragraph>' );

			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph><$text linkHref="url">Bar[]</$text></paragraph>' );
		} );

		it( 'should do nothing if the selection is not collapsed after the click', () => {
			setModelData( model, '<paragraph>[<$text linkHref="url">Bar</$text>]</paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph>[<$text linkHref="url">Bar</$text>]</paragraph>' );
		} );

		it( 'should do nothing if the text is not a link', () => {
			setModelData( model, '<paragraph><$text bold="true">Bar[]</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph><$text bold="true">Bar[]</$text></paragraph>' );
		} );

		it( 'should remove all `link*` attributes', () => {
			allowLinkTarget( editor );

			setModelData(
				model,
				'<paragraph><$text linkIsFoo="true" linkTarget="_blank" linkHref="https://ckeditor.com">Bar[]</$text></paragraph>'
			);

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph><$text linkHref="https://ckeditor.com" linkIsFoo="true" linkTarget="_blank">Bar</$text>[]</paragraph>'
			);

			editor.execute( 'insertText', { text: 'Foo' } );

			expect( getModelData( model ) ).to.equal(
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

		describe( 'insertText with specific selection (not DocumentSelection, beforeinput)', () => {
			it( 'should preserve selection attributes when the entire link is selected', () => {
				setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This is <$text linkHref="foo">Abcde[]</$text> from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should preserve selection attributes when the entire link is selected (mixed attributes in the link)', () => {
				setModelData( model,
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

				expect( getModelData( model ) ).to.equal(
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
				setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Fo]o</$text> from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This is <$text linkHref="foo">Abcde[]o</$text> from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should preserve selection attributes when it starts at the beginning of the link (mixed attributes in the link)', () => {
				setModelData( model,
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

				expect( getModelData( model ) ).to.equal(
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
				setModelData( model,
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

				expect( getModelData( model ) ).to.equal(
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
				setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				model.change( writer => {
					model.deleteContent( model.document.selection );
					model.insertContent( writer.createText( 'Abcde' ) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should not preserve selection attributes when the changes are not caused by typing (pasting check)', () => {
				setModelData( model,
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

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should not preserve selection attributes when typed after cutting the content', () => {
				setModelData( model,
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

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should not preserve anything if selected an element instead of text', () => {
				setModelData( model,
					'[<imageBlock src="/assets/sample.png"></imageBlock>]'
				);

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( getModelData( model ) ).to.equal(
					'Abcde[]'
				);
			} );

			it( 'should not preserve selection attributes when the entire link is selected and pressed "Backspace"', () => {
				setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				view.document.fire( 'delete', new DomEventData( view.document, {
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

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should not preserve selection attributes when the entire link is selected and pressed "Delete"', () => {
				setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				view.document.fire( 'delete', new DomEventData( view.document, {
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

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should preserve selection attributes (from first link) when selected different links', () => {
				setModelData( model,
					'<paragraph>This is <$text linkHref="foo">[Foo</$text> from <$text linkHref="bar">Bar]</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( getModelData( model ) ).to.equal( '<paragraph>This is <$text linkHref="foo">Abcde[]</$text>.</paragraph>' );
			} );

			it( 'should not preserve selection attributes when selected more than single link (start of the selection)', () => {
				setModelData( model,
					'<paragraph>This is[ <$text linkHref="foo">Foo]</$text> from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This isAbcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should preserve selection attributes when selected more than single link (end of the selection)', () => {
				setModelData( model,
					'<paragraph>This is <$text linkHref="foo">[Foo</$text> ]from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde',
					selection: model.createSelection( model.document.selection )
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This is <$text linkHref="foo">Abcde[]</$text>from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );
		} );

		describe( 'insertText with default selection (DocumentSelection, not beforeinput)', () => {
			it( 'should preserve selection attributes when the entire link is selected', () => {
				setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This is <$text linkHref="foo">Abcde</$text>[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should preserve selection attributes when the entire link is selected (mixed attributes in the link)', () => {
				setModelData( model,
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

				expect( getModelData( model ) ).to.equal(
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
				setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Fo]o</$text> from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This is <$text linkHref="foo">Abcde[]o</$text> from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should preserve selection attributes when it starts at the beginning of the link (mixed attributes in the link)', () => {
				setModelData( model,
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

				expect( getModelData( model ) ).to.equal(
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
				setModelData( model,
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

				expect( getModelData( model ) ).to.equal(
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
				setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				model.change( writer => {
					model.deleteContent( model.document.selection );
					model.insertContent( writer.createText( 'Abcde' ) );
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should not preserve selection attributes when the changes are not caused by typing (pasting check)', () => {
				setModelData( model,
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

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should not preserve selection attributes when typed after cutting the content', () => {
				setModelData( model,
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

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should not preserve anything if selected an element instead of text', () => {
				setModelData( model,
					'[<imageBlock src="/assets/sample.png"></imageBlock>]'
				);

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( getModelData( model ) ).to.equal(
					'Abcde[]'
				);
			} );

			it( 'should not preserve selection attributes when the entire link is selected and pressed "Backspace"', () => {
				setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				view.document.fire( 'delete', new DomEventData( view.document, {
					preventDefault: () => {
					}
				}, {
					direction: 'backward',
					selectionToRemove: view.document.selection
				} ) );

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should not preserve selection attributes when the entire link is selected and pressed "Delete"', () => {
				setModelData( model,
					'<paragraph>This is [<$text linkHref="foo">Foo</$text>] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				view.document.fire( 'delete', new DomEventData( view.document, {
					preventDefault: () => {
					}
				}, {
					direction: 'forward',
					selectionToRemove: view.document.selection
				} ) );

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This is Abcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should preserve selection attributes (from first link) when selected different links', () => {
				setModelData( model,
					'<paragraph>This is <$text linkHref="foo">[Foo</$text> from <$text linkHref="bar">Bar]</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( getModelData( model ) ).to.equal( '<paragraph>This is <$text linkHref="foo">Abcde</$text>[].</paragraph>' );
			} );

			it( 'should not preserve selection attributes when selected more than single link (start of the selection)', () => {
				setModelData( model,
					'<paragraph>This is[ <$text linkHref="foo">Foo]</$text> from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>This isAbcde[] from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);
			} );

			it( 'should preserve selection attributes when selected more than single link (end of the selection)', () => {
				setModelData( model,
					'<paragraph>This is <$text linkHref="foo">[Foo</$text> ]from <$text linkHref="bar">Bar</$text>.</paragraph>'
				);

				editor.execute( 'insertText', {
					text: 'Abcde'
				} );

				expect( getModelData( model ) ).to.equal(
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
			setModelData( model, '<paragraph>Foo <$text linkHref="url">Bar</$text> []</paragraph>' );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'initial state' ).to.equal( false );

			view.document.fire( 'delete', new DomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing space after the link' ).to.equal( false );

			view.document.fire( 'delete', new DomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing a character in the link' ).to.equal( false );
			expect( getModelData( model ) ).to.equal( '<paragraph>Foo <$text linkHref="url">Ba</$text>[]</paragraph>' );
		} );

		it( 'should not preserve the `linkHref` attribute when deleting content after the link (decorators check)', () => {
			setModelData( model,
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

			view.document.fire( 'delete', new DomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing space after the link ("linkHref")' ).to.equal( false );
			expect( model.document.selection.hasAttribute( 'linkIsFoo' ), 'removing space after the link ("linkIsFoo")' ).to.equal( false );
			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing space after the link ("linkHref")' ).to.equal( false );

			view.document.fire( 'delete', new DomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing a character the link ("linkHref")' ).to.equal( false );
			expect( model.document.selection.hasAttribute( 'linkIsFoo' ), 'removing a character the link ("linkIsFoo")' ).to.equal( false );
			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing a character the link ("linkHref")' ).to.equal( false );

			expect( getModelData( model ) ).to.equal(
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
			setModelData( model, '<paragraph>Foo <$text linkHref="url">Bar []</$text></paragraph>' );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'initial state' ).to.equal( true );

			view.document.fire( 'delete', new DomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing space after the link' ).to.equal( true );

			view.document.fire( 'delete', new DomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing a character in the link' ).to.equal( true );
			expect( getModelData( model ) ).to.equal( '<paragraph>Foo <$text linkHref="url">Ba[]</$text></paragraph>' );
		} );

		it( 'should preserve the `linkHref` attribute when deleting content while the selection is inside the link', () => {
			setModelData( model, '<paragraph>Foo <$text linkHref="url">A long URLLs[] description</$text></paragraph>' );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'initial state' ).to.equal( true );

			view.document.fire( 'delete', new DomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing space after the link' ).to.equal( true );

			view.document.fire( 'delete', new DomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'removing a character in the link' ).to.equal( true );
			expect( getModelData( model ) ).to.equal( '<paragraph>Foo <$text linkHref="url">A long URL[] description</$text></paragraph>' );
		} );

		it( 'should do nothing if there is no `linkHref` attribute', () => {
			setModelData( model, '<paragraph>Foo <$text bold="true">Bolded.</$text> []Bar</paragraph>' );

			view.document.fire( 'delete', new DomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			view.document.fire( 'delete', new DomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'backward',
				selectionToRemove: view.document.selection
			} ) );

			expect( getModelData( model ) ).to.equal( '<paragraph>Foo <$text bold="true">Bolded[]</$text>Bar</paragraph>' );
		} );

		it( 'should preserve the `linkHref` attribute when deleting content using "Delete" key', () => {
			setModelData( model, '<paragraph>Foo <$text linkHref="url">Bar</$text>[ ]</paragraph>' );

			expect( model.document.selection.hasAttribute( 'linkHref' ), 'initial state' ).to.equal( false );

			view.document.fire( 'delete', new DomEventData( view.document, {
				preventDefault: () => {}
			}, {
				direction: 'forward',
				selectionToRemove: view.document.selection
			} ) );

			expect( getModelData( model ) ).to.equal( '<paragraph>Foo <$text linkHref="url">Bar[]</$text></paragraph>' );

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

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text linkHref="#" linkIsBar="true" linkIsBaz="true" linkIsFoo="true">link</$text></paragraph>'
			);
		} );

		it( 'should data downcast multiple manual decorators', () => {
			setModelData( model,
				'<paragraph><$text linkHref="#" linkIsBar="true" linkIsBaz="true" linkIsFoo="true">link</$text></paragraph>'
			);

			expect( editor.getData() ).to.equal(
				'<p><a href="#" rel="bar baz abc foo">link</a></p>'
			);
		} );

		it( 'should editing view downcast multiple manual decorators', () => {
			setModelData( model,
				'<paragraph><$text linkHref="#" linkIsBar="true" linkIsBaz="true" linkIsFoo="true">link</$text></paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><a href="#" rel="bar baz abc foo">link</a></p>'
			);
		} );

		it( 'should add manual decorator on rel attribute', () => {
			setModelData( model,
				'<paragraph><$text linkHref="#">link</$text></paragraph>'
			);

			model.change( writer => {
				writer.setAttribute( 'linkIsFoo', true, model.document.getRoot().getChild( 0 ).getChild( 0 ) );
			} );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><a href="#" rel="foo">link</a></p>'
			);

			model.change( writer => {
				writer.setAttribute( 'linkIsBar', true, model.document.getRoot().getChild( 0 ).getChild( 0 ) );
			} );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><a href="#" rel="foo bar">link</a></p>'
			);

			model.change( writer => {
				writer.setAttribute( 'linkIsBaz', true, model.document.getRoot().getChild( 0 ).getChild( 0 ) );
			} );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><a href="#" rel="foo bar baz abc">link</a></p>'
			);
		} );

		it( 'should remove manual decorator on rel attribute', () => {
			setModelData( model,
				'<paragraph><$text linkHref="#" linkIsFoo="true" linkIsBar="true" linkIsBaz="true">link</$text></paragraph>'
			);

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><a href="#" rel="foo bar baz abc">link</a></p>'
			);

			model.change( writer => {
				writer.removeAttribute( 'linkIsBar', model.document.getRoot().getChild( 0 ).getChild( 0 ) );
			} );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><a href="#" rel="foo baz abc">link</a></p>'
			);

			model.change( writer => {
				writer.removeAttribute( 'linkIsBaz', model.document.getRoot().getChild( 0 ).getChild( 0 ) );
			} );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><a href="#" rel="foo">link</a></p>'
			);

			model.change( writer => {
				writer.removeAttribute( 'linkIsFoo', model.document.getRoot().getChild( 0 ).getChild( 0 ) );
			} );

			expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
				'<p><a href="#">link</a></p>'
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
