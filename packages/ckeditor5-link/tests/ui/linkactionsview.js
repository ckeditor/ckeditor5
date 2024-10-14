/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, Event */

import LinkActionsView from '../../src/ui/linkactionsview.js';
import View from '@ckeditor/ckeditor5-ui/src/view.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler.js';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker.js';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler.js';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { Bookmark } from '@ckeditor/ckeditor5-bookmark';

describe( 'LinkActionsView', () => {
	let view, editor, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Essentials, Paragraph, Bookmark ]
		} );

		view = new LinkActionsView( editor );
		view.render();
		document.body.appendChild( view.element );
	} );

	afterEach( () => {
		view.element.remove();
		view.destroy();
		editorElement.remove();

		return editor.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck' ) ).to.true;
			expect( view.element.classList.contains( 'ck-link-actions' ) ).to.true;
			expect( view.element.classList.contains( 'ck-responsive-form' ) ).to.true;
			expect( view.element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );

		it( 'should create child views', () => {
			expect( view.previewButtonView ).to.be.instanceOf( View );
			expect( view.unlinkButtonView ).to.be.instanceOf( View );
			expect( view.editButtonView ).to.be.instanceOf( View );

			expect( view._unboundChildren.get( 0 ) ).to.equal( view.previewButtonView );
			expect( view._unboundChildren.get( 1 ) ).to.equal( view.editButtonView );
			expect( view._unboundChildren.get( 2 ) ).to.equal( view.unlinkButtonView );
		} );

		it( 'should create #focusTracker instance', () => {
			expect( view.focusTracker ).to.be.instanceOf( FocusTracker );
		} );

		it( 'should create #keystrokes instance', () => {
			expect( view.keystrokes ).to.be.instanceOf( KeystrokeHandler );
		} );

		it( 'should create #_focusCycler instance', () => {
			expect( view._focusCycler ).to.be.instanceOf( FocusCycler );
		} );

		it( 'should create #_focusables view collection', () => {
			expect( view._focusables ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should create #_linkConfig as empty object by default', () => {
			expect( view._linkConfig ).to.be.empty;
		} );

		it( 'should create #_linkConfig containing config object passed as argument', () => {
			const customConfig = { allowedProtocols: [ 'https', 'ftps', 'tel', 'sms' ] };

			const view = new LinkActionsView( editor, customConfig );
			view.render();

			expect( view._linkConfig ).to.equal( customConfig );

			view.destroy();
		} );

		it( 'should fire `edit` event on editButtonView#execute', () => {
			const spy = sinon.spy();

			view.on( 'edit', spy );

			view.editButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );

		it( 'should fire `unlink` event on unlinkButtonView#execute', () => {
			const spy = sinon.spy();

			view.on( 'unlink', spy );

			view.unlinkButtonView.fire( 'execute' );

			expect( spy.calledOnce ).to.true;
		} );

		describe( 'preview button view', () => {
			it( 'is an anchor', () => {
				expect( view.previewButtonView.element.tagName.toLowerCase() ).to.equal( 'a' );
			} );

			it( 'has a CSS class', () => {
				expect( view.previewButtonView.element.classList.contains( 'ck-link-actions__preview' ) ).to.be.true;
			} );

			it( 'has a "target" attribute', () => {
				expect( view.previewButtonView.element.getAttribute( 'target' ) ).to.equal( '_blank' );
			} );

			it( 'has a "rel" attribute', () => {
				expect( view.previewButtonView.element.getAttribute( 'rel' ) ).to.equal( 'noopener noreferrer' );
			} );

			describe( '<a> bindings', () => {
				it( 'binds href DOM attribute to view#href', () => {
					expect( view.previewButtonView.element.getAttribute( 'href' ) ).to.be.null;

					view.href = 'foo';

					expect( view.previewButtonView.element.getAttribute( 'href' ) ).to.equal( 'foo' );
				} );

				it( 'does not render unsafe view#href', () => {
					view.href = 'javascript:alert(1)';

					expect( view.previewButtonView.element.getAttribute( 'href' ) ).to.equal( '#' );
				} );

				it( 'binds #isEnabled to view#href', () => {
					expect( view.previewButtonView.isEnabled ).to.be.false;

					view.href = 'foo';

					expect( view.previewButtonView.isEnabled ).to.be.true;
				} );

				describe( 'when href starts with `#`', () => {
					describe( 'and Bookmark plugin is loaded', () => {
						it( 'href is `#foo` and bookmark with this `id` exists in the content', () => {
							editor.setData( '<p><a id="foo"></a></p>' );

							view.href = '#foo';

							expect( view.previewButtonView.element.getAttribute( 'href' ) ).to.equal( '#foo' );
							expect( view.previewButtonView.element.getAttribute( 'target' ) ).to.equal( '_self' );
							expect( view.previewButtonView.element.getAttribute( 'rel' ) ).to.equal( 'noopener' );
							expect( view.previewButtonView.tooltip ).to.equal( 'Scroll to bookmark' );

							const spy = sinon.spy();
							const windowOpenStub = sinon.stub( window, 'open' );

							view.previewButtonView.on( 'execute', spy );
							view.previewButtonView.element.dispatchEvent( new Event( 'click' ) );
							sinon.assert.callCount( spy, 1 );
							sinon.assert.callCount( windowOpenStub, 0 );
						} );

						it( 'href is `#foo` and bookmark with this `id` not exists in the content', () => {
							editor.setData( '<p><a id="bar"></a></p>' );

							view.href = '#foo';

							expect( view.previewButtonView.element.getAttribute( 'href' ) ).to.equal( '#foo' );
							expect( view.previewButtonView.element.getAttribute( 'target' ) ).to.equal( '_blank' );
							expect( view.previewButtonView.element.getAttribute( 'rel' ) ).to.equal( 'noopener noreferrer' );
							expect( view.previewButtonView.tooltip ).to.equal( 'Open link in new tab' );

							const spy = sinon.spy();
							const windowOpenStub = sinon.stub( window, 'open' );

							view.previewButtonView.on( 'execute', spy );
							view.previewButtonView.element.dispatchEvent( new Event( 'click' ) );
							sinon.assert.callCount( spy, 1 );
							sinon.assert.callCount( windowOpenStub, 1 );
						} );
					} );

					describe( 'and Bookmark plugin is not loaded', () => {
						let view, editor, editorElement;

						testUtils.createSinonSandbox();

						beforeEach( async () => {
							editorElement = document.createElement( 'div' );
							document.body.appendChild( editorElement );

							editor = await ClassicTestEditor.create( editorElement, {
								plugins: [ Essentials, Paragraph ]
							} );

							view = new LinkActionsView( editor );
							view.render();
							document.body.appendChild( view.element );
						} );

						afterEach( () => {
							view.element.remove();
							view.destroy();
							editorElement.remove();

							return editor.destroy();
						} );

						it( 'href is `#foo`', () => {
							editor.setData( '<p><a id="foo"></a></p>' );

							view.href = '#foo';

							expect( view.previewButtonView.element.getAttribute( 'href' ) ).to.equal( '#foo' );
							expect( view.previewButtonView.element.getAttribute( 'target' ) ).to.equal( '_blank' );
							expect( view.previewButtonView.element.getAttribute( 'rel' ) ).to.equal( 'noopener noreferrer' );
							expect( view.previewButtonView.tooltip ).to.equal( 'Open link in new tab' );

							const spy = sinon.spy();
							const windowOpenStub = sinon.stub( window, 'open' );

							view.previewButtonView.on( 'execute', spy );
							view.previewButtonView.element.dispatchEvent( new Event( 'click' ) );
							sinon.assert.callCount( spy, 1 );
							sinon.assert.callCount( windowOpenStub, 1 );
						} );
					} );
				} );

				describe( 'when href not starts with `#`', () => {
					describe( 'and Bookmark plugin is loaded', () => {
						it( 'href is `foo`', () => {
							editor.setData( '<p><a id="foo"></a></p>' );

							view.href = 'foo';

							expect( view.previewButtonView.element.getAttribute( 'href' ) ).to.equal( 'foo' );
							expect( view.previewButtonView.element.getAttribute( 'target' ) ).to.equal( '_blank' );
							expect( view.previewButtonView.element.getAttribute( 'rel' ) ).to.equal( 'noopener noreferrer' );
							expect( view.previewButtonView.tooltip ).to.equal( 'Open link in new tab' );

							const spy = sinon.spy();
							const windowOpenStub = sinon.stub( window, 'open' );

							view.previewButtonView.on( 'execute', spy );
							view.previewButtonView.element.dispatchEvent( new Event( 'click' ) );
							sinon.assert.callCount( spy, 1 );
							sinon.assert.callCount( windowOpenStub, 1 );
						} );
					} );

					describe( 'and Bookmark plugin is not loaded', () => {
						let view, editor, editorElement;

						testUtils.createSinonSandbox();

						beforeEach( async () => {
							editorElement = document.createElement( 'div' );
							document.body.appendChild( editorElement );

							editor = await ClassicTestEditor.create( editorElement, {
								plugins: [ Essentials, Paragraph ]
							} );

							view = new LinkActionsView( editor );
							view.render();
							document.body.appendChild( view.element );
						} );

						afterEach( () => {
							view.element.remove();
							view.destroy();
							editorElement.remove();

							return editor.destroy();
						} );

						it( 'href is `foo`', () => {
							editor.setData( '<p><a id="foo"></a></p>' );

							view.href = 'foo';

							expect( view.previewButtonView.element.getAttribute( 'href' ) ).to.equal( 'foo' );
							expect( view.previewButtonView.element.getAttribute( 'target' ) ).to.equal( '_blank' );
							expect( view.previewButtonView.element.getAttribute( 'rel' ) ).to.equal( 'noopener noreferrer' );
							expect( view.previewButtonView.tooltip ).to.equal( 'Open link in new tab' );

							const spy = sinon.spy();
							const windowOpenStub = sinon.stub( window, 'open' );

							view.previewButtonView.on( 'execute', spy );
							view.previewButtonView.element.dispatchEvent( new Event( 'click' ) );
							sinon.assert.callCount( spy, 1 );
							sinon.assert.callCount( windowOpenStub, 1 );
						} );
					} );
				} );
			} );
		} );

		describe( 'template', () => {
			it( 'has child views', () => {
				expect( view.template.children[ 0 ] ).to.equal( view.previewButtonView );
				expect( view.template.children[ 1 ] ).to.equal( view.editButtonView );
				expect( view.template.children[ 2 ] ).to.equal( view.unlinkButtonView );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should register child views in #_focusables', () => {
			expect( view._focusables.map( f => f ) ).to.have.members( [
				view.previewButtonView,
				view.editButtonView,
				view.unlinkButtonView
			] );
		} );

		it( 'should register child views\' #element in #focusTracker', () => {
			const spy = testUtils.sinon.spy( FocusTracker.prototype, 'add' );

			const view = new LinkActionsView( editor );
			view.render();

			sinon.assert.calledWithExactly( spy.getCall( 0 ), view.previewButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 1 ), view.editButtonView.element );
			sinon.assert.calledWithExactly( spy.getCall( 2 ), view.unlinkButtonView.element );

			view.destroy();
		} );

		it( 'starts listening for #keystrokes coming from #element', () => {
			const view = new LinkActionsView( editor );

			const spy = sinon.spy( view.keystrokes, 'listenTo' );

			view.render();
			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, view.element );

			view.destroy();
		} );

		describe( 'activates keyboard navigation for the toolbar', () => {
			it( 'so "tab" focuses the next focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the preview button is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.previewButtonView.element;

				const spy = sinon.spy( view.editButtonView, 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );

			it( 'so "shift + tab" focuses the previous focusable item', () => {
				const keyEvtData = {
					keyCode: keyCodes.tab,
					shiftKey: true,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};

				// Mock the edit button is focused.
				view.focusTracker.isFocused = true;
				view.focusTracker.focusedElement = view.editButtonView.element;

				const spy = sinon.spy( view.previewButtonView, 'focus' );

				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( keyEvtData.preventDefault );
				sinon.assert.calledOnce( keyEvtData.stopPropagation );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy the FocusTracker instance', () => {
			const destroySpy = sinon.spy( view.focusTracker, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );

		it( 'should destroy the KeystrokeHandler instance', () => {
			const destroySpy = sinon.spy( view.keystrokes, 'destroy' );

			view.destroy();

			sinon.assert.calledOnce( destroySpy );
		} );
	} );

	describe( 'focus()', () => {
		it( 'focuses the #previewButtonView', () => {
			const spy = sinon.spy( view.previewButtonView, 'focus' );

			view.focus();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
