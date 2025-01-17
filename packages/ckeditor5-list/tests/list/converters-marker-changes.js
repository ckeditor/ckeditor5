/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import TableEditing from '@ckeditor/ckeditor5-table/src/tableediting.js';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting.js';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import { CodeBlockEditing } from '@ckeditor/ckeditor5-code-block';
import { Plugin } from '@ckeditor/ckeditor5-core';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { parse as parseModel } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import ListEditing from '../../src/list/listediting.js';
import { setupTestHelpers } from '../list/_utils/utils.js';

import stubUid from '../list/_utils/uid.js';

describe( 'ListEditing - conversion - custom list marker - changes', () => {
	let editor, model, test, modelRoot;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				Paragraph,
				ListEditing,
				BlockQuoteEditing,
				TableEditing,
				CodeBlockEditing,
				HeadingEditing,
				ImageInlineEditing,
				UndoEditing,
				CustomMarkers
			]
		} );

		model = editor.model;
		modelRoot = model.document.getRoot();

		stubUid();

		test = setupTestHelpers( editor );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	class CustomMarkers extends Plugin {
		static get requires() { return [ ListEditing ]; }

		init() {
			const editor = this.editor;
			const model = editor.model;

			model.schema.extend( '$listItem', { allowAttributes: [ 'listMarker', 'listOtherMarker' ] } );

			// Basic marker as UIElement.
			editor.plugins.get( ListEditing ).registerDowncastStrategy( {
				scope: 'itemMarker',
				attributeName: 'listMarker',

				createElement( writer, modelElement ) {
					if ( !modelElement.hasAttribute( 'listMarker' ) ) {
						return null;
					}

					return writer.createUIElement( 'span', {
						class: 'list-marker',
						'data-marker': modelElement.getAttribute( 'listMarker' )
					} );
				},

				canInjectMarkerIntoElement( listItem ) {
					return (
						model.schema.checkChild( listItem, '$text' ) &&
						!model.schema.isLimit( listItem ) &&
						listItem.getAttribute( 'listType' ) == 'numbered'
					);
				}
			} );

			// More complex marker requires model-length callback (below).
			editor.plugins.get( ListEditing ).registerDowncastStrategy( {
				scope: 'itemMarker',
				attributeName: 'listOtherMarker',

				createElement( writer, modelElement ) {
					if ( !modelElement.hasAttribute( 'listOtherMarker' ) ) {
						return null;
					}

					return writer.createContainerElement( 'span', {
						class: 'list-other-marker'
					}, writer.createText( modelElement.getAttribute( 'listOtherMarker' ) ) );
				},

				canInjectMarkerIntoElement( listItem ) {
					return (
						model.schema.checkChild( listItem, '$text' ) &&
						!model.schema.isLimit( listItem ) &&
						listItem.getAttribute( 'listType' ) == 'numbered'
					);
				}
			} );

			editor.editing.mapper.registerViewToModelLength( 'span', viewElement => {
				if ( viewElement.hasClass( 'list-other-marker' ) ) {
					return 0;
				}

				// Mapped element.
				if ( editor.editing.mapper.toModelElement( viewElement ) ) {
					return 1;
				}

				// UIElement.
				if ( viewElement.is( 'uiElement' ) ) {
					return 0;
				}

				// Other not-mapped elements (like AttributeElement).
				return Array.from( viewElement.getChildren() )
					.reduce( ( len, child ) => len + editor.editing.mapper.getModelLength( child ), 0 );
			} );
		}
	}

	describe( 'flat lists', () => {
		describe( 'insert', () => {
			it( 'list item at the beginning of same list type (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="bulleted" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="X"></span><span class="ck-list-bogus-paragraph">x</span></li>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item at the beginning of same list type (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="numbered" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="X"></span>x</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item at the beginning of same list type (multiple markers inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="numbered" listMarker="X" listOtherMarker="X.">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A" listOtherMarker="II.">a</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">' +
								'<span class="list-other-marker">X.</span>' +
								'<span class="list-marker" data-marker="X"></span>' +
								'x' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">' +
								'<span class="list-other-marker">II.</span>' +
								'<span class="list-marker" data-marker="A"></span>' +
								'a' +
							'</span>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item in the middle of same list type (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="bulleted" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="list-marker" data-marker="X"></span><span class="ck-list-bogus-paragraph">x</span></li>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item in the middle of same list type (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="numbered" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="X"></span>x</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item at the end of same list type (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="bulleted" listMarker="X">x</paragraph>]',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="list-marker" data-marker="X"></span><span class="ck-list-bogus-paragraph">x</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item at the end of same list type (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="numbered" listMarker="X">x</paragraph>]',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="X"></span>x</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item at the beginning of different list type (injected marker)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="numbered" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="X"></span>x</span></li>' +
					'</ol>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item at the beginning of different list type (not injected marker)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="bulleted" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="X"></span><span class="ck-list-bogus-paragraph">x</span></li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item in the middle of different list type (injected marker)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="numbered" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="X"></span>x</span></li>' +
					'</ol>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item in the middle of different list type (not injected marker)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="bulleted" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
					'</ol>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="X"></span><span class="ck-list-bogus-paragraph">x</span></li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item at the end of different list type (injected marker)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="numbered" listMarker="X">x</paragraph>]',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="X"></span>x</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item at the end of different list type (not injected marker)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="bulleted" listMarker="X">x</paragraph>]',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
					'</ol>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="X"></span><span class="ck-list-bogus-paragraph">x</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'element between list items (marker before block)', () => {
				test.insert(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph>x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>',

					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>' +
					'<p>x</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'element between list items (marker inside block)', () => {
				test.insert(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph>x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>',

					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
					'</ol>' +
					'<p>x</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item that is not a paragraph (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<heading1 listIndent="0" listItemId="x" listType="bulleted" listMarker="X">x</heading1>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="list-marker" data-marker="X"></span><h2>x</h2></li>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'list item that is not a paragraph (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<heading1 listIndent="0" listItemId="x" listType="numbered" listMarker="X">x</heading1>]' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
						'<li><h2><span class="list-marker" data-marker="X"></span>x</h2></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'new block at the start of list item (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li>' +
							'<span class="list-marker" data-marker="X"></span>' +
							'<p>x</p>' +
							'<p>b</p>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
			} );

			it( 'new block at the start of list item (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
						'<li>' +
							'<p><span class="list-marker" data-marker="X"></span>x</p>' +
							'<p>b</p>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
			} );

			it( 'new block at the end of list item (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<p>a</p>' +
							'<p>x</p>' +
						'</li>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'new block at the end of list item (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<p><span class="list-marker" data-marker="A"></span>a</p>' +
							'<p>x</p>' +
						'</li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'new block at the middle of list item (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="x" listType="bulleted" listMarker="X">x1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="bulleted" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="x" listType="bulleted" listMarker="X">x2</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li>' +
							'<span class="list-marker" data-marker="X"></span>' +
							'<p>x1</p>' +
							'<p>x</p>' +
							'<p>x2</p>' +
						'</li>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'new block at the middle of list item (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="x" listType="numbered" listMarker="X">x1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="x" listType="numbered" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="x" listType="numbered" listMarker="X">x2</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
						'<li>' +
							'<p><span class="list-marker" data-marker="X"></span>x1</p>' +
							'<p>x</p>' +
							'<p>x2</p>' +
						'</li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'new list item in the middle of list item (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="x" listType="bulleted" listMarker="X">x1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="y" listType="bulleted" listMarker="Y">y</paragraph>]' +
					'<paragraph listIndent="0" listItemId="x" listType="bulleted" listMarker="X">x2</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="list-marker" data-marker="X"></span><span class="ck-list-bogus-paragraph">x1</span></li>' +
						'<li><span class="list-marker" data-marker="Y"></span><span class="ck-list-bogus-paragraph">y</span></li>' +
						'<li><span class="list-marker" data-marker="X"></span><span class="ck-list-bogus-paragraph">x2</span></li>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 4 ) );
			} );

			it( 'new list item in the middle of list item (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="x" listType="numbered" listMarker="X">x1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="y" listType="numbered" listMarker="Y">y</paragraph>]' +
					'<paragraph listIndent="0" listItemId="x" listType="numbered" listMarker="X">x2</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="X"></span>x1</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="Y"></span>y</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="X"></span>x2</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 4 ) );
			} );
		} );

		describe( 'remove', () => {
			it( 'remove the first list item (marker before block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
						'<li><span class="list-marker" data-marker="C"></span><span class="ck-list-bogus-paragraph">c</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove the first list item (marker inside block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="numbered" listMarker="C">c</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="C"></span>c</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove the first list item (multiple markers inside block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A" listOtherMarker="I.">a</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B" listOtherMarker="II.">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="numbered" listMarker="C" listOtherMarker="III.">c</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">' +
								'<span class="list-other-marker">II.</span>' +
								'<span class="list-marker" data-marker="B"></span>' +
								'b' +
							'</span>' +
						'</li>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">' +
								'<span class="list-other-marker">III.</span>' +
								'<span class="list-marker" data-marker="C"></span>' +
								'c' +
							'</span>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove list item from the middle (marker before block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="list-marker" data-marker="C"></span><span class="ck-list-bogus-paragraph">c</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove list item from the middle (marker inside block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="numbered" listMarker="C">c</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="C"></span>c</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove the last list item (marker before block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>]',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove the last list item (marker inside block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="numbered" listMarker="C">c</paragraph>]',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove the only list item (marker before block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">x</paragraph>]' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<p>p</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove the only list item (marker inside block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">x</paragraph>]' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<p>p</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove element from between lists of same type (marker before block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph>x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>' +
					'<p>p</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove element from between lists of same type (marker inside block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph>x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
					'</ol>' +
					'<p>p</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove the first block of a list item (marker before block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b1</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b2</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b2</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'remove the first block of a list item (marker inside block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b1</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b2</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b2</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'remove the last block of a list item (marker before block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a2</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a1</span></li>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'remove the last block of a list item (marker inside block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a2</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a1</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'remove the middle block of a list item (marker before block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a2</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a3</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<p>a1</p>' +
							'<p>a3</p>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'remove the middle block of a list item (marker inside block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a2</paragraph>]' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a3</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<p><span class="list-marker" data-marker="A"></span>a1</p>' +
							'<p>a3</p>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'deleting softbreak from list item should not remove marker', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">' +
						'a' +
						'[<softBreak></softBreak>]' +
					'</paragraph>',

					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
					'</ol>'
				);
			} );

			it( 'deleting inline image from list item should not remove marker', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">' +
						'a' +
						'[<imageInline></imageInline>]' +
					'</paragraph>',

					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
					'</ol>'
				);
			} );
		} );

		describe( 'change type', () => {
			it( 'change first list item (marker before block -> marker inside block)', () => {
				test.changeType(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
					'</ol>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
						'<li><span class="list-marker" data-marker="C"></span><span class="ck-list-bogus-paragraph">c</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change first list item (marker inside block -> marker before block)', () => {
				test.changeType(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="numbered" listMarker="C">c</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="C"></span>c</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change middle list item (marker before block -> marker inside block)', () => {
				test.changeType(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
					'</ol>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="C"></span><span class="ck-list-bogus-paragraph">c</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change middle list item (marker inside block -> marker before block)', () => {
				test.changeType(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="numbered" listMarker="C">c</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
					'</ol>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="C"></span>c</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change last list item (marker before block -> marker inside block)', () => {
				test.changeType(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>]',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="C"></span>c</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change last list item (marker inside block -> marker before block)', () => {
				test.changeType(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="numbered" listMarker="C">c</paragraph>]',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
					'</ol>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="C"></span><span class="ck-list-bogus-paragraph">c</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change only list item (marker before block -> marker inside block)', () => {
				test.changeType(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>]' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
					'</ol>' +
					'<p>p</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change only list item (marker inside block -> marker before block)', () => {
				test.changeType(
					'<paragraph>p</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>]' +
					'<paragraph>p</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>' +
					'<p>p</p>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change element at the edge of two different lists #1', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>]' +
					'<paragraph listIndent="0" listItemId="d" listType="numbered" listMarker="D">d</paragraph>',

					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="C"></span>c</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="D"></span>d</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change element at the edge of two different lists #2', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>' +
					'<paragraph listIndent="0" listItemId="d" listType="bulleted" listMarker="D">d</paragraph>',

					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
					'</ol>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="C"></span><span class="ck-list-bogus-paragraph">c</span></li>' +
						'<li><span class="list-marker" data-marker="D"></span><span class="ck-list-bogus-paragraph">d</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change multiple elements - to other type', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>]' +
					'<paragraph listIndent="0" listItemId="d" listType="bulleted" listMarker="D">d</paragraph>',

					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="C"></span>c</span></li>' +
					'</ol>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="D"></span><span class="ck-list-bogus-paragraph">d</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change multiple elements - to same type', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>]' +
					'<paragraph listIndent="0" listItemId="d" listType="numbered" listMarker="D">d</paragraph>',

					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="C"></span>c</span></li>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="D"></span>d</span></li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'change of the first block of a list item', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b1</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b2</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>',

					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b1</span></li>' +
					'</ol>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b2</span></li>' +
						'<li><span class="list-marker" data-marker="C"></span><span class="ck-list-bogus-paragraph">c</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'change of the last block of a list item', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b2</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>',

					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b1</span></li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b2</span></li>' +
					'</ol>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="C"></span><span class="ck-list-bogus-paragraph">c</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
			} );

			it( 'change of the middle block of a list item', () => {
				test.changeType(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b2</paragraph>]' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b3</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>',

					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b1</span></li>' +
					'</ul>' +
					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b2</span></li>' +
					'</ol>' +
					'<ul>' +
						'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b3</span></li>' +
						'<li><span class="list-marker" data-marker="C"></span><span class="ck-list-bogus-paragraph">c</span></li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 3 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 2 ) );
				expect( test.reconvertSpy.thirdCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
			} );

			it( 'change outer list type with nested blockquote', () => {
				test.changeType(
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>]' +
					'<blockQuote listIndent="1" listItemId="b" listType="bulleted" listMarker="B">' +
						'<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">b</paragraph>' +
						'<paragraph listIndent="1" listItemId="d" listType="bulleted" listMarker="D">c</paragraph>' +
					'</blockQuote>',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="B"></span>' +
									'<blockquote>' +
										'<ul>' +
											'<li>' +
												'<span class="list-marker" data-marker="C"></span>' +
												'<span class="ck-list-bogus-paragraph">b</span>' +
												'<ul>' +
													'<li>' +
														'<span class="list-marker" data-marker="D"></span>' +
														'<span class="ck-list-bogus-paragraph">c</span>' +
													'</li>' +
												'</ul>' +
											'</li>' +
										'</ul>' +
									'</blockquote>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'change outer list type with nested code block', () => {
				test.changeType(
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>]' +
					'<codeBlock language="plaintext" listIndent="1" listItemId="b" listType="bulleted" listMarker="B">' +
						'abc' +
					'</codeBlock>',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="B"></span>' +
									'<pre data-language="Plain text" spellcheck="false">' +
										'<code class="language-plaintext">abc</code>' +
									'</pre>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );
		} );
	} );

	describe( 'nested lists', () => {
		describe( 'insert', () => {
			it( 'after lower indent (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="X">x</paragraph>]',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="1"></span>' +
							'<span class="ck-list-bogus-paragraph">1</span>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="X"></span>' +
									'<span class="ck-list-bogus-paragraph">x</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after lower indent (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="X">x</paragraph>]',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="1"></span>1</span>' +
							'<ol>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="X"></span>x</span>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after lower indent (multi block) (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1a</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="X">xa</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="X">xb</paragraph>]',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="1"></span>' +
							'<p>1a</p>' +
							'<p>1b</p>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="X"></span>' +
									'<p>xa</p>' +
									'<p>xb</p>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after lower indent (multi block) (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1a</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="X">xa</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="X">xb</paragraph>]',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<p><span class="list-marker" data-marker="1"></span>1a</p>' +
							'<p>1b</p>' +
							'<ol>' +
								'<li>' +
									'<p><span class="list-marker" data-marker="X"></span>xa</p>' +
									'<p>xb</p>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after lower indent, before same indent (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted" listMarker="1.1">1.1</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="1"></span>' +
							'<span class="ck-list-bogus-paragraph">1</span>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="X"></span>' +
									'<span class="ck-list-bogus-paragraph">x</span>' +
								'</li>' +
								'<li>' +
									'<span class="list-marker" data-marker="1.1"></span>' +
									'<span class="ck-list-bogus-paragraph">1.1</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after lower indent, before same indent (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="numbered" listMarker="1.1">1.1</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="1"></span>1</span>' +
							'<ol>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">' +
										'<span class="list-marker" data-marker="X"></span>' +
										'x' +
									'</span>' +
								'</li>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">' +
										'<span class="list-marker" data-marker="1.1"></span>' +
										'1.1' +
									'</span>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after lower indent, before same indent (multi block) (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1a</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="X">xa</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="X">xb</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted" listMarker="1.1">1.1a</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted" listMarker="1.1">1.1b</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="1"></span>' +
							'<p>1a</p>' +
							'<p>1b</p>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="X"></span>' +
									'<p>xa</p>' +
									'<p>xb</p>' +
								'</li>' +
								'<li>' +
									'<span class="list-marker" data-marker="1.1"></span>' +
									'<p>1.1a</p>' +
									'<p>1.1b</p>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after lower indent, before same indent (multi block) (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1a</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="X">xa</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="X">xb</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="numbered" listMarker="1.1">1.1a</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="numbered" listMarker="1.1">1.1b</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<p><span class="list-marker" data-marker="1"></span>1a</p>' +
							'<p>1b</p>' +
							'<ol>' +
								'<li>' +
									'<p><span class="list-marker" data-marker="X"></span>xa</p>' +
									'<p>xb</p>' +
								'</li>' +
								'<li>' +
									'<p><span class="list-marker" data-marker="1.1"></span>1.1a</p>' +
									'<p>1.1b</p>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after lower indent, before lower indent (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="2">2</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="1"></span>' +
							'<span class="ck-list-bogus-paragraph">1</span>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="X"></span>' +
									'<span class="ck-list-bogus-paragraph">x</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'<span class="list-marker" data-marker="2"></span>' +
							'<span class="ck-list-bogus-paragraph">2</span>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after lower indent, before lower indent (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="numbered" listMarker="2">2</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="1"></span>1</span>' +
							'<ol>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="X"></span>x</span>' +
								'</li>' +
							'</ol>' +
						'</li>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="2"></span>2</span>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after lower indent, before lower indent (multi block) (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1a</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="X">xa</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="X">xb</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="2">2a</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="2">2b</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="1"></span>' +
							'<p>1a</p>' +
							'<p>1b</p>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="X"></span>' +
									'<p>xa</p>' +
									'<p>xb</p>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'<span class="list-marker" data-marker="2"></span>' +
							'<p>2a</p>' +
							'<p>2b</p>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after lower indent, before lower indent (multi block) (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1a</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="X">xa</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="X">xb</paragraph>]' +
					'<paragraph listIndent="0" listItemId="c" listType="numbered" listMarker="2">2a</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="numbered" listMarker="2">2b</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<p><span class="list-marker" data-marker="1"></span>1a</p>' +
							'<p>1b</p>' +
							'<ol>' +
								'<li>' +
									'<p><span class="list-marker" data-marker="X"></span>xa</p>' +
									'<p>xb</p>' +
								'</li>' +
							'</ol>' +
						'</li>' +
						'<li>' +
							'<p><span class="list-marker" data-marker="2"></span>2a</p>' +
							'<p>2b</p>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after same indent (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="1.1">1.1</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="bulleted" listMarker="X">x</paragraph>]',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="1"></span>' +
							'<span class="ck-list-bogus-paragraph">1</span>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="1.1"></span>' +
									'<span class="ck-list-bogus-paragraph">1.1</span>' +
									'</li>' +
								'<li>' +
									'<span class="list-marker" data-marker="X"></span>' +
									'<span class="ck-list-bogus-paragraph">x</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after same indent (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="1.1">1.1</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="numbered" listMarker="X">x</paragraph>]',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="1"></span>1</span>' +
							'<ol>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">' +
										'<span class="list-marker" data-marker="1.1"></span>' +
										'1.1' +
									'</span>' +
									'</li>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">' +
										'<span class="list-marker" data-marker="X"></span>' +
										'x' +
									'</span>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after same indent (multi block) (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1a</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1b</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="1.1">1.1a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="1.1">1.1b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="bulleted" listMarker="X">xa</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted" listMarker="X">xb</paragraph>]',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="1"></span>' +
							'<p>1a</p>' +
							'<p>1b</p>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="1.1"></span>' +
									'<p>1.1a</p>' +
									'<p>1.1b</p>' +
								'</li>' +
								'<li>' +
									'<span class="list-marker" data-marker="X"></span>' +
									'<p>xa</p>' +
									'<p>xb</p>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after same indent (multi block) (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1a</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1b</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="1.1">1.1a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="1.1">1.1b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="numbered" listMarker="X">xa</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="numbered" listMarker="X">xb</paragraph>]',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<p><span class="list-marker" data-marker="1"></span>1a</p>' +
							'<p>1b</p>' +
							'<ol>' +
								'<li>' +
									'<p><span class="list-marker" data-marker="1.1"></span>1.1a</p>' +
									'<p>1.1b</p>' +
								'</li>' +
								'<li>' +
									'<p><span class="list-marker" data-marker="X"></span>xa</p>' +
									'<p>xb</p>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 0 );
			} );

			it( 'after same indent, before higher indent (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted" listMarker="1.1">1.1</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="1"></span>' +
							'<span class="ck-list-bogus-paragraph">1</span>' +
						'</li>' +
						'<li>' +
							'<span class="list-marker" data-marker="X"></span>' +
							'<span class="ck-list-bogus-paragraph">x</span>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="1.1"></span>' +
									'<span class="ck-list-bogus-paragraph">1.1</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
			} );

			it( 'after same indent, before higher indent (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="numbered" listMarker="1.1">1.1</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="1"></span>1</span>' +
						'</li>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="X"></span>x</span>' +
							'<ol>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">' +
										'<span class="list-marker" data-marker="1.1"></span>' +
										'1.1' +
									'</span>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 3 ) );
			} );

			it( 'after same indent, before higher indent (multi block) (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1a</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="X">xa</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="X">xb</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted" listMarker="1.1">1.1a</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted" listMarker="1.1">1.1b</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="1"></span>' +
							'<p>1a</p>' +
							'<p>1b</p>' +
						'</li>' +
						'<li>' +
							'<span class="list-marker" data-marker="X"></span>' +
							'<p>xa</p>' +
							'<p>xb</p>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="1.1"></span>' +
									'<p>1.1a</p>' +
									'<p>1.1b</p>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 5 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 6 ) );
			} );

			it( 'after same indent, before higher indent (multi block) (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1a</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="X">xa</paragraph>' +
					'<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="X">xb</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="numbered" listMarker="1.1">1.1a</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="numbered" listMarker="1.1">1.1b</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<p><span class="list-marker" data-marker="1"></span>1a</p>' +
							'<p>1b</p>' +
						'</li>' +
						'<li>' +
							'<p><span class="list-marker" data-marker="X"></span>xa</p>' +
							'<p>xb</p>' +
							'<ol>' +
								'<li>' +
									'<p><span class="list-marker" data-marker="1.1"></span>1.1a</p>' +
									'<p>1.1b</p>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 5 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 6 ) );
			} );

			it( 'after higher indent, before higher indent (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="1.1">1.1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted" listMarker="1.2">1.2</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="1"></span>' +
							'<span class="ck-list-bogus-paragraph">1</span>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="1.1"></span>' +
									'<span class="ck-list-bogus-paragraph">1.1</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'<span class="list-marker" data-marker="X"></span>' +
							'<span class="ck-list-bogus-paragraph">x</span>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="1.2"></span>' +
									'<span class="ck-list-bogus-paragraph">1.2</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 4 ) );
			} );

			it( 'after higher indent, before higher indent (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="1.1">1.1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="numbered" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="numbered" listMarker="1.2">1.2</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="1"></span>1</span>' +
							'<ol>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">' +
										'<span class="list-marker" data-marker="1.1"></span>' +
										'1.1' +
									'</span>' +
								'</li>' +
							'</ol>' +
						'</li>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="X"></span>x</span>' +
							'<ol>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">' +
										'<span class="list-marker" data-marker="1.2"></span>' +
										'1.2' +
									'</span>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 4 ) );
			} );

			it( 'after higher indent, before higher indent (multi block) (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="1.1">1.1</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="1.1">1.1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="X">x</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted" listMarker="1.2">1.2</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted" listMarker="1.2">1.2</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="1"></span>' +
							'<span class="ck-list-bogus-paragraph">1</span>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="1.1"></span>' +
									'<p>1.1</p>' +
									'<p>1.1</p>' +
								'</li>' +
							'</ul>' +
						'</li>' +
						'<li>' +
							'<span class="list-marker" data-marker="X"></span>' +
							'<p>x</p>' +
							'<p>x</p>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="1.2"></span>' +
									'<p>1.2</p>' +
									'<p>1.2</p>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 6 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 7 ) );
			} );

			it( 'after higher indent, before higher indent (multi block) (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="1.1">1.1</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="1.1">1.1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="numbered" listMarker="X">x</paragraph>' +
					'<paragraph listIndent="0" listItemId="c" listType="numbered" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="numbered" listMarker="1.2">1.2</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="numbered" listMarker="1.2">1.2</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="1"></span>1</span>' +
							'<ol>' +
								'<li>' +
									'<p><span class="list-marker" data-marker="1.1"></span>1.1</p>' +
									'<p>1.1</p>' +
								'</li>' +
							'</ol>' +
						'</li>' +
						'<li>' +
							'<p><span class="list-marker" data-marker="X"></span>x</p>' +
							'<p>x</p>' +
							'<ol>' +
								'<li>' +
									'<p><span class="list-marker" data-marker="1.2"></span>1.2</p>' +
									'<p>1.2</p>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 2 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 6 ) );
				expect( test.reconvertSpy.secondCall.firstArg ).to.equal( modelRoot.getChild( 7 ) );
			} );

			it( 'additional block before higher indent (marker before block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="1">1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="2">2</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="1"></span>' +
							'<p>1</p>' +
							'<p>x</p>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="2"></span>' +
									'<span class="ck-list-bogus-paragraph">2</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );

			it( 'additional block before higher indent (marker inside block)', () => {
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="1">1</paragraph>' +
					'[<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="X">x</paragraph>]' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="2">2</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<p><span class="list-marker" data-marker="1"></span>1</p>' +
							'<p>x</p>' +
							'<ol>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="2"></span>2</span>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);

				expect( test.reconvertSpy.callCount ).to.equal( 1 );
				expect( test.reconvertSpy.firstCall.firstArg ).to.equal( modelRoot.getChild( 1 ) );
			} );
		} );

		describe( 'remove', () => {
			it( 'the first nested item (marker before block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>',

					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="C"></span>' +
									'<span class="ck-list-bogus-paragraph">c</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'the first nested item (marker inside block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="B">b</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="numbered" listMarker="C">c</paragraph>',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span>' +
							'<ol>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph">' +
										'<span class="list-marker" data-marker="C"></span>' +
										'c' +
									'</span>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'nested item from the middle (marker before block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted" listMarker="D">d</paragraph>',

					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ul>' +
								'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
								'<li><span class="list-marker" data-marker="D"></span><span class="ck-list-bogus-paragraph">d</span></li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'nested item from the middle (marker inside block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="B">b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="numbered" listMarker="C">c</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="numbered" listMarker="D">d</paragraph>',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span>' +
							'<ol>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span>' +
								'</li>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="D"></span>d</span>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'the last nested item (marker before block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>]',

					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="B"></span>' +
									'<span class="ck-list-bogus-paragraph">b</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'the last nested item (marker inside block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="B">b</paragraph>' +
					'[<paragraph listIndent="1" listItemId="c" listType="numbered" listMarker="C">c</paragraph>]',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'the only nested item (marker before block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>]',

					'<ul>' +
						'<li><span class="list-marker" data-marker="A"></span><span class="ck-list-bogus-paragraph">a</span></li>' +
					'</ul>'
				);
			} );

			it( 'the only nested item (marker inside block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="B">b</paragraph>]',

					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span></li>' +
					'</ol>'
				);
			} );

			it( 'list item that separates two nested lists of same type (marker before block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="numbered" listMarker="C">c</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted" listMarker="D">d</paragraph>',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span>' +
							'<ul>' +
								'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
								'<li><span class="list-marker" data-marker="D"></span><span class="ck-list-bogus-paragraph">d</span></li>' +
							'</ul>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'list item that separates two nested lists of same type (marker inside block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="B">b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="numbered" listMarker="D">d</paragraph>',

					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="D"></span>d</span></li>' +
							'</ol>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'list item that separates two nested lists of different type', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="B">b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted" listMarker="D">d</paragraph>',

					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
							'</ol>' +
							'<ul>' +
								'<li><span class="list-marker" data-marker="D"></span><span class="ck-list-bogus-paragraph">d</span></li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'item that has nested lists, previous item has same indent (marker before block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted" listMarker="D">d</paragraph>',

					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ul>' +
								'<li><span class="list-marker" data-marker="C"></span><span class="ck-list-bogus-paragraph">c</span></li>' +
								'<li><span class="list-marker" data-marker="D"></span><span class="ck-list-bogus-paragraph">d</span></li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'item that has nested lists, previous item has same indent (marker inside block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="0" listItemId="b" listType="numbered" listMarker="B">b</paragraph>]' +
					'<paragraph listIndent="1" listItemId="c" listType="numbered" listMarker="C">c</paragraph>' +
					'<paragraph listIndent="1" listItemId="d" listType="numbered" listMarker="D">d</paragraph>',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="C"></span>c</span></li>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="D"></span>d</span></li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'item that has nested lists, previous item has lower indent (marker before block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>]' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="bulleted" listMarker="D">d</paragraph>',

					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ul>' +
								'<li><span class="list-marker" data-marker="C"></span><span class="ck-list-bogus-paragraph">c</span></li>' +
								'<li><span class="list-marker" data-marker="D"></span><span class="ck-list-bogus-paragraph">d</span></li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'item that has nested lists, previous item has lower indent (marker inside block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'[<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="B">b</paragraph>]' +
					'<paragraph listIndent="2" listItemId="c" listType="numbered" listMarker="C">c</paragraph>' +
					'<paragraph listIndent="2" listItemId="d" listType="numbered" listMarker="D">d</paragraph>',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="C"></span>c</span></li>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="D"></span>d</span></li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'item that has nested lists, previous item has higher indent by 1 (marker before block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="bulleted" listMarker="D">d</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="bulleted" listMarker="E">e</paragraph>',

					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ul>' +
								'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
								'<li>' +
									'<span class="list-marker" data-marker="D"></span>' +
									'<span class="ck-list-bogus-paragraph">d</span>' +
									'<ul>' +
										'<li>' +
											'<span class="list-marker" data-marker="E"></span>' +
											'<span class="ck-list-bogus-paragraph">e</span>' +
										'</li>' +
									'</ul>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'item that has nested lists, previous item has higher indent by 1 (marker inside block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="B">b</paragraph>' +
					'[<paragraph listIndent="0" listItemId="c" listType="numbered" listMarker="C">c</paragraph>]' +
					'<paragraph listIndent="1" listItemId="d" listType="numbered" listMarker="D">d</paragraph>' +
					'<paragraph listIndent="2" listItemId="e" listType="numbered" listMarker="E">e</paragraph>',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="D"></span>d</span>' +
									'<ol>' +
										'<li>' +
											'<span class="ck-list-bogus-paragraph">' +
												'<span class="list-marker" data-marker="E"></span>' +
												'e' +
											'</span>' +
										'</li>' +
									'</ol>' +
								'</li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'item that has nested lists, previous item has higher indent by 2 (marker before block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>' +
					'[<paragraph listIndent="0" listItemId="d" listType="bulleted" listMarker="D">d</paragraph>]' +
					'<paragraph listIndent="1" listItemId="e" listType="bulleted" listMarker="E">e</paragraph>',

					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ul>' +
								'<li>' +
									'<span class="list-marker" data-marker="B"></span>' +
									'<span class="ck-list-bogus-paragraph">b</span>' +
									'<ul>' +
										'<li>' +
											'<span class="list-marker" data-marker="C"></span>' +
											'<span class="ck-list-bogus-paragraph">c</span>' +
										'</li>' +
									'</ul>' +
								'</li>' +
								'<li>' +
									'<span class="list-marker" data-marker="E"></span>' +
									'<span class="ck-list-bogus-paragraph">e</span>' +
								'</li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'item that has nested lists, previous item has higher indent by 2 (marker inside block)', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="B">b</paragraph>' +
					'<paragraph listIndent="2" listItemId="c" listType="numbered" listMarker="C">c</paragraph>' +
					'[<paragraph listIndent="0" listItemId="d" listType="numbered" listMarker="D">d</paragraph>]' +
					'<paragraph listIndent="1" listItemId="e" listType="numbered" listMarker="E">e</paragraph>',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span>' +
							'<ol>' +
								'<li>' +
									'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span>' +
									'<ol>' +
										'<li>' +
											'<span class="ck-list-bogus-paragraph">' +
												'<span class="list-marker" data-marker="C"></span>' +
												'c' +
											'</span>' +
										'</li>' +
									'</ol>' +
								'</li>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="E"></span>e</span></li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'first list item that has nested list (marker before block)', () => {
				test.remove(
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>]' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>' +
					'<paragraph listIndent="2" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>',

					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="B"></span>' +
							'<span class="ck-list-bogus-paragraph">b</span>' +
							'<ul>' +
								'<li><span class="list-marker" data-marker="C"></span><span class="ck-list-bogus-paragraph">c</span></li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'first list item that has nested list (marker inside block)', () => {
				test.remove(
					'[<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>]' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="B">b</paragraph>' +
					'<paragraph listIndent="2" listItemId="c" listType="numbered" listMarker="C">c</paragraph>',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="C"></span>c</span></li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'deleting softbreak from nested list item should not remove marker', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="B">' +
						'b' +
						'[<softBreak></softBreak>]' +
					'</paragraph>',

					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>b</span>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'deleting inline image from nested list item should not remove marker', () => {
				test.remove(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="B">' +
						'b' +
						'[<imageInline></imageInline>]' +
					'</paragraph>',

					'<ol>' +
						'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>b</span>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);
			} );
		} );

		describe( 'change type', () => {
			it( 'list item that has nested items (marker before block)', () => {
				test.changeType(
					'[<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>]' +
					'<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>',

					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ul>' +
								'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
								'<li><span class="list-marker" data-marker="C"></span><span class="ck-list-bogus-paragraph">c</span></li>' +
							'</ul>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'list item that has nested items (marker inside block)', () => {
				test.changeType(
					'[<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>]' +
					'<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="B">b</paragraph>' +
					'<paragraph listIndent="1" listItemId="c" listType="numbered" listMarker="C">c</paragraph>',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="C"></span>c</span></li>' +
							'</ol>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'changed list type at the same time as adding nested items (marker before block)', () => {
				test.test(
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">a</paragraph>[]',

					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<span class="ck-list-bogus-paragraph">a</span>' +
							'<ul>' +
								'<li><span class="list-marker" data-marker="B"></span><span class="ck-list-bogus-paragraph">b</span></li>' +
								'<li><span class="list-marker" data-marker="C"></span><span class="ck-list-bogus-paragraph">c</span></li>' +
							'</ul>' +
						'</li>' +
					'</ul>',

					() => {
						const item1 = '<paragraph listIndent="1" listItemId="b" listType="bulleted" listMarker="B">b</paragraph>';
						const item2 = '<paragraph listIndent="1" listItemId="c" listType="bulleted" listMarker="C">c</paragraph>';

						model.change( writer => {
							writer.setAttribute( 'listType', 'bulleted', modelRoot.getChild( 0 ) );
							writer.append( parseModel( item1, model.schema ), modelRoot );
							writer.append( parseModel( item2, model.schema ), modelRoot );
						} );
					}
				);
			} );

			it( 'changed list type at the same time as adding nested items (marker inside block)', () => {
				test.test(
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">a</paragraph>[]',

					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="A"></span>a</span>' +
							'<ol>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="B"></span>b</span></li>' +
								'<li><span class="ck-list-bogus-paragraph"><span class="list-marker" data-marker="C"></span>c</span></li>' +
							'</ol>' +
						'</li>' +
					'</ol>',

					() => {
						const item1 = '<paragraph listIndent="1" listItemId="b" listType="numbered" listMarker="B">b</paragraph>';
						const item2 = '<paragraph listIndent="1" listItemId="c" listType="numbered" listMarker="C">c</paragraph>';

						model.change( writer => {
							writer.setAttribute( 'listType', 'numbered', modelRoot.getChild( 0 ) );
							writer.append( parseModel( item1, model.schema ), modelRoot );
							writer.append( parseModel( item2, model.schema ), modelRoot );
						} );
					}
				);
			} );
		} );
	} );

	describe( 'position mapping', () => {
		describe( 'insert text into paragraph', () => {
			it( 'should insert text at the start of a paragraph (marker before block)', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">[foo]bar</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<span class="ck-list-bogus-paragraph">foobar</span>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'should insert text at the start of a paragraph (marker inside block)', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">[foo]bar</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">' +
								'<span class="list-marker" data-marker="A"></span>' +
								'foobar' +
							'</span>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'should insert text at the start of a paragraph (multiple markers inside block)', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A" listOtherMarker="I.">[foo]bar</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">' +
								'<span class="list-other-marker">I.</span>' +
								'<span class="list-marker" data-marker="A"></span>' +
								'foobar' +
							'</span>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'should insert text in the middle of a paragraph (marker before block)', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">fo[ob]ar</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<span class="ck-list-bogus-paragraph">foobar</span>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'should insert text in the middle of a paragraph (marker inside block)', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">fo[ob]ar</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">' +
								'<span class="list-marker" data-marker="A"></span>' +
								'foobar' +
							'</span>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'should insert text in the middle of a paragraph (multiple markers inside block)', () => {
				model.schema.extend( '$text', { allowIn: '$root' } );
				test.insert(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A" listOtherMarker="I.">fo[ob]ar</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">' +
								'<span class="list-other-marker">I.</span>' +
								'<span class="list-marker" data-marker="A"></span>' +
								'foobar' +
							'</span>' +
						'</li>' +
					'</ol>'
				);
			} );
		} );

		describe( 'remove text from paragraph', () => {
			it( 'should remove text at the start of a paragraph (marker before block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">[foo]bar</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<span class="ck-list-bogus-paragraph">bar</span>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'should remove text at the start of a paragraph (marker inside block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">[foo]bar</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">' +
								'<span class="list-marker" data-marker="A"></span>' +
								'bar' +
							'</span>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'should remove text at the start of a paragraph (multiple markers inside block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A" listOtherMarker="I.">[foo]bar</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">' +
								'<span class="list-other-marker">I.</span>' +
								'<span class="list-marker" data-marker="A"></span>' +
								'bar' +
							'</span>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'should remove text in the middle of a paragraph (marker before block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="bulleted" listMarker="A">fo[ob]ar</paragraph>',

					'<p>p</p>' +
					'<ul>' +
						'<li>' +
							'<span class="list-marker" data-marker="A"></span>' +
							'<span class="ck-list-bogus-paragraph">foar</span>' +
						'</li>' +
					'</ul>'
				);
			} );

			it( 'should remove text in the middle of a paragraph (marker inside block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A">fo[ob]ar</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">' +
								'<span class="list-marker" data-marker="A"></span>' +
								'foar' +
							'</span>' +
						'</li>' +
					'</ol>'
				);
			} );

			it( 'should remove text in the middle of a paragraph (multiple markers inside block)', () => {
				test.remove(
					'<paragraph>p</paragraph>' +
					'<paragraph listIndent="0" listItemId="a" listType="numbered" listMarker="A" listOtherMarker="I.">fo[ob]ar</paragraph>',

					'<p>p</p>' +
					'<ol>' +
						'<li>' +
							'<span class="ck-list-bogus-paragraph">' +
								'<span class="list-other-marker">I.</span>' +
								'<span class="list-marker" data-marker="A"></span>' +
								'foar' +
							'</span>' +
						'</li>' +
					'</ol>'
				);
			} );
		} );
	} );
} );
