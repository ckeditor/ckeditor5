/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
// Requires changes to @ckeditor/ckeditor5-dev-tests/node_modules/webpack/lib/MainTemplate.js:281
// - "Object.defineProperty(exports, name, { enumerable: true, get: getter });"
// + "Object.defineProperty(exports, name, { enumerable: true, get: getter, configurable: true });"

import * as inlineHighlightModule from '@ckeditor/ckeditor5-typing/src/utils/inlinehighlight';

// Create a spy that is called whenever `setupLinkHighlight` getter is accessed,
// either by test's code, src/linkediting.js, or imported by any other module.
const dependencyGetterSpy = sinon.spy( inlineHighlightModule, 'setupLinkHighlight', [ 'get' ] );

// Create a spy that is called whenever exported `setupLinkHighlight()` function is called.
const setupLinkHighlightSpy = sinon.spy().named( 'setupLinkHighlight' );
// Workaround lack of `stub.wrappedMethod` for  property accessors. https://github.com/sinonjs/sinon/issues/2198#issuecomment-652630739
const originalDescriptor = Object.getOwnPropertyDescriptor( inlineHighlightModule, 'setupLinkHighlight' );
const wrappedMethod = originalDescriptor.get;
const dependencyGetterStub = sinon.stub( inlineHighlightModule, 'setupLinkHighlight' ).get( function fakeGet() {
	return function stubbedDependency( ...args ) {
		// Call spy.
		setupLinkHighlightSpy.apply( this, args );
		// Call through.
		return wrappedMethod.apply( this, args );
	};
} );

import LinkEditing from '../src/linkediting';
import LinkCommand from '../src/linkcommand';
import UnlinkCommand from '../src/unlinkcommand';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { isLinkElement } from '../src/utils';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';

/* globals document, chai */

/**
 * Asserts that the target has an attribute with the given key name.
 * See {@link module:engine/model/documentselection~DocumentSelection#hasAttribute hasAttribute}.
 *
 *		expect( selection ).to.have.attribute( 'linkHref' );
 *
 * When `value` is provided, .attribute also asserts that the attribute's value is equal to the given `value`.
 * See {@link module:engine/model/documentselection~DocumentSelection#getAttribute getAttribute}.
 *
 *		expect( selection ).to.have.attribute( 'linkHref', 'example.com' );
 *
 * Negations works as well.
 *
 * @param {String} key Key of attribute to assert.
 * @param {String} [value] Attribute value to assert.
 * @param {String} [message] Additional message.
 */
chai.Assertion.addMethod( 'attribute', function attributeAssertion( key, value, message ) {
	if ( message ) {
		chai.util.flag( this, 'message', message );
	}

	const obj = this._obj;

	if ( arguments.length === 1 ) {
		// Check if it has the method at all.
		new chai.Assertion( obj ).to.respondTo( 'hasAttribute' );

		// Check if it has the attribute.
		const hasAttribute = obj.hasAttribute( key );
		this.assert(
			hasAttribute === true,
			`expected #{this} to have attribute '${ key }'`,
			`expected #{this} to not have attribute '${ key }'`,
			!chai.util.flag( this, 'negate' ),
			hasAttribute
		);
	}

	// If a value was given.
	if ( arguments.length >= 2 ) {
		// Check if it has the method at all.
		new chai.Assertion( obj ).to.respondTo( 'getAttribute', message );

		const attributeValue = obj.getAttribute( key );
		this.assert(
			attributeValue === value,
			`expected #{this} to have attribute '${ key }' of #{exp}, but got #{act}`,
			`expected #{this} to not have attribute '${ key }' of #{exp}`,
			attributeValue,
			value
		);
	}
} );

describe( 'LinkEditing', () => {
	let element, editor, model, view;

	beforeEach( async () => {
		setupLinkHighlightSpy.resetHistory();
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
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
					}
				}
			}
		} );

		editor.model.schema.extend( '$text', { allowAttributes: 'bold' } );

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

	after( () => {
		dependencyGetterStub.reset();
		dependencyGetterSpy.restore();
	} );

	it( 'should have pluginName', () => {
		expect( LinkEditing.pluginName ).to.equal( 'LinkEditing' );
	} );

	it( 'should import setupLinkHighlight', () => {
		expect( dependencyGetterSpy.get ).to.be.called;
	} );

	it( 'should call setupLinkHighlight', () => {
		expect( setupLinkHighlightSpy ).to.be.calledOnceWith( editor, 'linkHref', 'a', 'ck-link_selected' );
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
		it( 'should remove link atttributes when pasting a link', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { linkHref: 'ckeditor.com' } ) );
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo<$text linkHref="ckeditor.com">INSERTED</$text>[]</paragraph>' );

			expect( [ ...model.document.selection.getAttributeKeys() ] ).to.be.empty;
		} );

		it( 'should remove all atttributes starting with "link" (e.g. decorator attributes) when pasting a link', () => {
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

		it( 'should not remove link atttributes when pasting a non-link content', () => {
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

		it( 'should not remove link atttributes when pasting in the middle of a link with the same URL', () => {
			setModelData( model, '<paragraph><$text linkHref="ckeditor.com">fo[]o</$text></paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { linkHref: 'ckeditor.com' } ) );
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph><$text linkHref="ckeditor.com">foINSERTED[]o</$text></paragraph>' );
			expect( model.document.selection ).to.have.attribute( 'linkHref' );
		} );

		it( 'should not remove link atttributes from the selection when pasting before a link when the gravity is overridden', () => {
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
					'<$text bold="true">INSERTED</$text>' +
					'<$text linkHref="ckeditor.com">[]bar</$text>' +
				'</paragraph>'
			);

			expect( model.document.selection ).to.have.property( 'isGravityOverridden', true );
			expect( model.document.selection ).to.have.attribute( 'linkHref' );
		} );

		it( 'should not remove link atttributes when pasting a link into another link (different URLs, no merge)', () => {
			setModelData( model, '<paragraph><$text linkHref="ckeditor.com">f[]oo</$text></paragraph>' );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { linkHref: 'http://INSERTED' } ) );
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>' +
					'<$text linkHref="ckeditor.com">f</$text>' +
					'<$text linkHref="http://INSERTED">INSERTED[]</$text>' +
					'<$text linkHref="ckeditor.com">oo</$text>' +
				'</paragraph>'
			);

			expect( model.document.selection ).to.have.attribute( 'linkHref' );
		} );

		it( 'should not remove link atttributes when pasting before another link (different URLs, no merge)', () => {
			setModelData( model, '<paragraph>[]<$text linkHref="ckeditor.com">foo</$text></paragraph>' );

			expect( model.document.selection ).to.have.property( 'isGravityOverridden', false );

			model.change( writer => {
				model.insertContent( writer.createText( 'INSERTED', { linkHref: 'http://INSERTED' } ) );
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph>' +
					'<$text linkHref="http://INSERTED">INSERTED[]</$text>' +
					'<$text linkHref="ckeditor.com">foo</$text>' +
				'</paragraph>'
			);

			expect( model.document.selection ).to.have.attribute( 'linkHref' );
			expect( model.document.selection ).to.have.attribute( 'linkHref', 'http://INSERTED' );
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
			it( 'link.addTargetToExternalLinks is predefined as false value', () => {
				expect( editor.config.get( 'link.addTargetToExternalLinks' ) ).to.be.false;
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
									attributes: {
										class: 'mail-url'
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
						'<a href="example.com" download="file">Bar</a></p>',
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
						'<$text linkHref="url" linkIsDownloadable="true" linkIsExternal="true">Foo</$text>' +
						'<$text linkHref="example.com" linkIsDownloadable="true">Bar</$text>' +
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
	} );

	// https://github.com/ckeditor/ckeditor5/issues/1016
	describe( 'typing around the link after a click', () => {
		let editor;

		beforeEach( async () => {
			editor = await ClassicTestEditor.create( element, {
				plugins: [ Paragraph, LinkEditing, Enter, Typing, BoldEditing ],
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

			editor.execute( 'input', { text: 'Foo' } );

			expect( getModelData( model ) ).to.equal( '<paragraph><$text linkHref="url">Bar</$text>Foo[]</paragraph>' );
		} );

		it( 'should insert content before the link', () => {
			setModelData( model, '<paragraph><$text linkHref="url">[]Bar</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]<$text linkHref="url">Bar</$text></paragraph>' );

			editor.execute( 'input', { text: 'Foo' } );

			expect( getModelData( model ) ).to.equal( '<paragraph>Foo[]<$text linkHref="url">Bar</$text></paragraph>' );
		} );

		it( 'should insert content to the link if clicked inside it', () => {
			setModelData( model, '<paragraph><$text linkHref="url">B[]ar</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( getModelData( model ) ).to.equal( '<paragraph><$text linkHref="url">B[]ar</$text></paragraph>' );

			editor.execute( 'input', { text: 'ar. B' } );

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

			editor.execute( 'input', { text: 'Foo' } );

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

			editor.execute( 'input', { text: 'Foo' } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph><$text linkHref="foo">Foo</$text>Foo[]<$text linkHref="bar">Bar</$text></paragraph>'
			);
		} );

		it( 'should not touch other attributes than `linkHref`', () => {
			setModelData( model, '<paragraph><$text bold="true" linkHref="url">Bar[]</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph><$text bold="true" linkHref="url">Bar</$text><$text bold="true">[]</$text></paragraph>'
			);

			editor.execute( 'input', { text: 'Foo' } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph><$text bold="true" linkHref="url">Bar</$text><$text bold="true">Foo[]</$text></paragraph>'
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

		it( 'should remove manual decorators', () => {
			model.schema.extend( '$text', {
				allowIn: '$root',
				allowAttributes: [ 'linkIsFoo', 'linkIsBar' ]
			} );

			setModelData( model, '<paragraph><$text linkIsFoo="true" linkIsBar="true" linkHref="url">Bar[]</$text></paragraph>' );

			editor.editing.view.document.fire( 'mousedown' );
			editor.editing.view.document.fire( 'selectionChange', {
				newSelection: view.document.selection
			} );

			expect( getModelData( model ) ).to.equal(
				'<paragraph><$text linkHref="url" linkIsBar="true" linkIsFoo="true">Bar</$text>[]</paragraph>'
			);

			editor.execute( 'input', { text: 'Foo' } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph><$text linkHref="url" linkIsBar="true" linkIsFoo="true">Bar</$text>Foo[]</paragraph>'
			);
		} );
	} );
} );
