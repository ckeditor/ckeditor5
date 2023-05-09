/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, Event, setTimeout */

import { Editor } from '@ckeditor/ckeditor5-core';
import EditorUI from '../../src/editorui/editorui';
import { BalloonPanelView } from '../../src';
import View from '../../src/view';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'PoweredBy', () => {
	let editor, element;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		editor = await ClassicTestEditor.create( element );
	} );

	afterEach( async () => {
		element.remove();
		await editor.destroy();
	} );

	describe( 'constructor()', () => {
		describe( 'balloon creation', () => {
			it( 'should not throw if there is no view in EditorUI', () => {
				expect( () => {
					const editor = new Editor();

					editor.model.document.createRoot();
					editor.ui = new EditorUI( editor );
					editor.editing.view.attachDomRoot( element );
					editor.fire( 'ready' );
					element.style.display = 'block';
					element.setAttribute( 'contenteditable', 'true' );
					editor.ui.focusTracker.add( element );
					element.focus();

					editor.destroy();
					editor.ui.destroy();
				} ).to.not.throw();
			} );

			it( 'should create the balloon on demand', () => {
				expect( editor.ui.poweredBy._balloonView ).to.be.null;

				editor.editing.view.focus();

				expect( editor.ui.poweredBy._balloonView ).to.be.instanceOf( BalloonPanelView );
			} );
		} );

		describe( 'balloon management on editor focus change', () => {
			it( 'should show the balloon when the editor gets focused', () => {
				editor.editing.view.focus();

				expect( editor.ui.poweredBy._balloonView.element.getClientRects().length ).to.equal( 1 );
			} );

			it( 'should hide the balloon on blur', done => {
				const input = document.createElement( 'input' );
				input.type = 'text';
				document.body.appendChild( input );

				editor.editing.view.focus();

				expect( editor.ui.poweredBy._balloonView.element.getClientRects().length ).to.equal( 1 );

				input.focus();

				// FocusTracker's blur handler is asynchronous.
				setTimeout( () => {
					expect( editor.ui.poweredBy._balloonView.element.getClientRects().length ).to.equal( 0 );

					input.remove();

					done();
				}, 200 );
			} );
		} );

		describe( 'balloon management on EditorUI#update', () => {
			it( 'should not trigger if the editor is not focused', () => {
				expect( editor.ui.poweredBy._balloonView ).to.be.null;

				editor.ui.fire( 'update' );

				expect( editor.ui.poweredBy._balloonView ).to.be.null;
			} );

			it( 'should (re-)show the balloon but throttled', done => {
				editor.editing.view.focus();

				const pinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'pin' );

				editor.ui.fire( 'update' );
				editor.ui.fire( 'update' );

				sinon.assert.notCalled( pinSpy );

				setTimeout( () => {
					sinon.assert.calledOnce( pinSpy );
					sinon.assert.calledWith( pinSpy, sinon.match.object );

					done();
				}, 75 );
			} );
		} );

		describe( 'balloon view', () => {
			let balloon, focusTrackerAddSpy;

			beforeEach( () => {
				focusTrackerAddSpy = testUtils.sinon.spy( editor.ui.focusTracker, 'add' );

				editor.editing.view.focus();

				balloon = editor.ui.poweredBy._balloonView;
			} );

			it( 'should be an instance of BalloonPanelView', () => {
				expect( balloon ).to.be.instanceOf( BalloonPanelView );
			} );

			it( 'should host a powered by view', () => {
				expect( balloon.content.first ).to.be.instanceOf( View );
			} );

			it( 'should have no arrow', () => {
				expect( balloon.withArrow ).to.be.false;
			} );

			it( 'should have a specific CSS class', () => {
				expect( balloon.class ).to.equal( 'ck-powered-by-balloon' );
			} );

			it( 'should be added to editor\'s body view collection', () => {
				expect( editor.ui.view.body.has( balloon ) ).to.be.true;
			} );

			it( 'should be registered in the focus tracker to avoid focus loss on click', () => {
				sinon.assert.calledWith( focusTrackerAddSpy, balloon.element );
			} );
		} );

		describe( 'powered by view', () => {
			let view;

			beforeEach( () => {
				editor.editing.view.focus();

				view = editor.ui.poweredBy._balloonView.content.first;
			} );

			it( 'should have specific CSS classes', () => {
				expect( view.element.classList.contains( 'ck' ) ).to.be.true;
				expect( view.element.classList.contains( 'ck-powered-by' ) ).to.be.true;
			} );

			it( 'should have a link that opens in a new tab', () => {
				expect( view.element.firstChild.tagName ).to.equal( 'A' );
				expect( view.element.firstChild.href ).to.equal( 'https://ckeditor.com/' );
				expect( view.element.firstChild.target ).to.equal( '_blank' );
				expect( view.element.firstChild.tabIndex ).to.equal( -1 );
			} );

			it( 'should have a label inside the link', () => {
				expect( view.element.firstChild.firstChild.tagName ).to.equal( 'SPAN' );
				expect( view.element.firstChild.firstChild.classList.contains( 'ck' ) ).to.be.true;
				expect( view.element.firstChild.firstChild.classList.contains( 'ck-powered-by__label' ) ).to.be.true;
				expect( view.element.firstChild.firstChild.textContent ).to.equal( 'Powered by' );
			} );

			it( 'should have an icon next to the label', () => {
				expect( view.element.firstChild.lastChild.tagName ).to.equal( 'svg' );
			} );

			it( 'should be impossible to drag and drop into editor\'s content', () => {
				const spy = sinon.spy();
				const evt = new Event( 'dragstart' );

				evt.preventDefault = spy;

				view.element.firstChild.dispatchEvent( evt );

				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		describe( 'if there was a balloon', () => {
			beforeEach( () => {
				editor.editing.view.focus();
			} );

			it( 'should unpin the balloon', () => {
				const unpinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'unpin' );

				editor.destroy();

				sinon.assert.calledOnce( unpinSpy );
			} );

			it( 'should destroy the balloon', () => {
				const destroySpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'destroy' );

				editor.destroy();

				sinon.assert.called( destroySpy );

				expect( editor.ui.poweredBy._balloonView ).to.be.null;
			} );

			it( 'should cancel any throttled show to avoid post-destroy timed errors', () => {
				const spy = testUtils.sinon.spy( editor.ui.poweredBy._showBalloonThrottled, 'cancel' );

				editor.destroy();

				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( 'if there was no balloon', () => {
			it( 'should not throw', () => {
				expect( () => {
					editor.destroy();
				} ).to.not.throw();
			} );
		} );

		it( 'should destroy the emitter listeners', () => {
			const spy = testUtils.sinon.spy( editor.ui.poweredBy, 'stopListening' );

			editor.destroy();

			sinon.assert.calledOnce( spy );
		} );
	} );
} );
