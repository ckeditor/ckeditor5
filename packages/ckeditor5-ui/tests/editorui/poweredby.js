/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Editor } from '@ckeditor/ckeditor5-core';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import { Rect, global } from '@ckeditor/ckeditor5-utils';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import generateKey from '@ckeditor/ckeditor5-core/tests/_utils/generatelicensekey.js';

import EditorUI from '../../src/editorui/editorui.js';
import { BalloonPanelView } from '../../src/index.js';
import View from '../../src/view.js';

describe( 'PoweredBy', () => {
	let editor, element;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		editor = await createEditor( element );

		testUtils.sinon.stub( editor.editing.view.getDomRoot(), 'getBoundingClientRect' ).returns( {
			top: 0,
			left: 0,
			right: 400,
			width: 400,
			bottom: 100,
			height: 100
		} );

		testUtils.sinon.stub( document.body, 'getBoundingClientRect' ).returns( {
			top: 0,
			right: 1000,
			bottom: 1000,
			left: 0,
			width: 1000,
			height: 1000
		} );

		sinon.stub( global.window, 'innerWidth' ).value( 1000 );
		sinon.stub( global.window, 'innerHeight' ).value( 1000 );
	} );

	afterEach( async () => {
		element.remove();
		await editor.destroy();
	} );

	describe( 'constructor()', () => {
		describe( 'balloon creation', () => {
			it( 'should not throw if there is no view in EditorUI', done => {
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

					editor.fire( 'ready' );
					editor.ui.destroy();
					editor.destroy().then( () => done() );
				} ).to.not.throw();
			} );

			it( 'should create the balloon on demand', () => {
				expect( editor.ui.poweredBy._balloonView ).to.be.null;

				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView ).to.be.instanceOf( BalloonPanelView );
			} );

			it( 'should create the balloon when license is `GPL`', async () => {
				const editor = await createEditor( element, {
					licenseKey: 'GPL'
				} );

				expect( editor.ui.poweredBy._balloonView ).to.be.null;

				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView ).to.be.instanceOf( BalloonPanelView );

				await editor.destroy();
			} );

			it( 'should create the balloon when license is invalid', async () => {
				const showErrorStub = sinon.stub( ClassicTestEditor.prototype, '_showLicenseError' );

				const editor = await createEditor( element, {
					licenseKey: '<YOUR_LICENSE_KEY>'
				} );

				expect( editor.ui.poweredBy._balloonView ).to.be.null;

				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView ).to.be.instanceOf( BalloonPanelView );

				await editor.destroy();

				showErrorStub.restore();
			} );

			it( 'should not create the balloon when a white-label license key is configured', async () => {
				const { licenseKey } = generateKey( { whiteLabel: true } );
				const editor = await createEditor( element, {
					licenseKey
				} );

				expect( editor.ui.poweredBy._balloonView ).to.be.null;

				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView ).to.be.null;

				await editor.destroy();
			} );

			it( 'should create the balloon when a white-label license key is configured and `forceVisible` is set to true', async () => {
				const { licenseKey } = generateKey( { whiteLabel: true } );
				const editor = await createEditor( element, {
					licenseKey,
					ui: {
						poweredBy: {
							forceVisible: true
						}
					}
				} );

				expect( editor.ui.poweredBy._balloonView ).to.be.null;

				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView ).to.be.instanceOf( BalloonPanelView );

				await editor.destroy();
			} );

			it( 'should create the balloon when a non-white-label license key is configured', async () => {
				const { licenseKey } = generateKey();
				const editor = await createEditor( element, {
					licenseKey
				} );

				expect( editor.ui.poweredBy._balloonView ).to.be.null;

				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView ).to.be.instanceOf( BalloonPanelView );

				await editor.destroy();
			} );
		} );

		describe( 'balloon management on editor focus change', () => {
			const originalGetVisible = Rect.prototype.getVisible;

			it( 'should show the balloon when the editor gets focused', () => {
				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView.isVisible ).to.be.true;
			} );

			it( 'should show the balloon if the focus is not in the editing root but in other editor UI', async () => {
				const focusableEditorUIElement = document.createElement( 'input' );
				focusableEditorUIElement.type = 'text';
				document.body.appendChild( focusableEditorUIElement );

				editor.ui.focusTracker.add( focusableEditorUIElement );

				// Just generate the balloon on demand.
				focusEditor( editor );
				blurEditor( editor );

				await wait( 10 );
				const pinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'pin' );

				focusEditor( editor, focusableEditorUIElement );

				sinon.assert.calledOnce( pinSpy );
				sinon.assert.calledWith( pinSpy, sinon.match.has( 'target', editor.editing.view.getDomRoot() ) );

				focusableEditorUIElement.remove();
			} );

			it( 'should hide the balloon on blur', async () => {
				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView.isVisible ).to.be.true;

				blurEditor( editor );

				// FocusTracker's blur handler is asynchronous.
				await wait( 200 );

				expect( editor.ui.poweredBy._balloonView.isVisible ).to.be.false;
			} );

			// This is a weak test because it does not check the geometry but it will do.
			it( 'should show the balloon when the source editing is engaged', async () => {
				const domRoot = editor.editing.view.getDomRoot();
				const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

				function isEditableElement( element ) {
					return Array.from( editor.ui.getEditableElementsNames() ).map( name => {
						return editor.ui.getEditableElement( name );
					} ).includes( element );
				}

				// Rect#getVisible() passthrough to ignore ancestors. Makes testing a lot easier.
				testUtils.sinon.stub( Rect.prototype, 'getVisible' ).callsFake( function() {
					if ( isEditableElement( this._source ) ) {
						return new Rect( this._source );
					} else {
						return originalGetVisible.call( this );
					}
				} );

				// Stub textarea's client rect.
				testUtils.sinon.stub( HTMLElement.prototype, 'getBoundingClientRect' ).callsFake( function() {
					if ( this.parentNode.classList.contains( 'ck-source-editing-area' ) ) {
						return {
							top: 0,
							left: 0,
							right: 400,
							width: 400,
							bottom: 200,
							height: 200
						};
					}

					return originalGetBoundingClientRect.call( this );
				} );

				focusEditor( editor );

				domRoot.getBoundingClientRect.returns( {
					top: 0,
					left: 0,
					right: 350,
					width: 350,
					bottom: 100,
					height: 100
				} );

				const pinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'pin' );

				editor.ui.fire( 'update' );

				await wait( 75 );

				expect( editor.ui.poweredBy._balloonView.isVisible ).to.be.true;
				expect( editor.ui.poweredBy._balloonView.position ).to.equal( 'position_border-side_right' );
				sinon.assert.calledWith( pinSpy.lastCall, sinon.match.has( 'target', domRoot ) );

				editor.plugins.get( 'SourceEditing' ).isSourceEditingMode = true;

				const sourceAreaElement = editor.ui.getEditableElement( 'sourceEditing:main' );

				focusEditor( editor, sourceAreaElement );
				sinon.assert.calledWith(
					pinSpy.lastCall,
					sinon.match.has( 'target', sourceAreaElement )
				);

				expect( editor.ui.poweredBy._balloonView.isVisible ).to.be.true;
				expect( editor.ui.poweredBy._balloonView.position ).to.equal( 'position_border-side_right' );

				editor.plugins.get( 'SourceEditing' ).isSourceEditingMode = false;
				focusEditor( editor );

				expect( editor.ui.poweredBy._balloonView.isVisible ).to.be.true;
				expect( editor.ui.poweredBy._balloonView.position ).to.equal( 'position_border-side_right' );
				sinon.assert.calledWith( pinSpy.lastCall, sinon.match.has( 'target', domRoot ) );
			} );
		} );

		describe( 'balloon management on EditorUI#update', () => {
			it( 'should not trigger if the editor is not focused', () => {
				expect( editor.ui.poweredBy._balloonView ).to.be.null;

				editor.ui.fire( 'update' );

				expect( editor.ui.poweredBy._balloonView ).to.be.null;
			} );

			it( 'should (re-)show the balloon but throttled', async () => {
				focusEditor( editor );

				const pinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'pin' );

				editor.ui.fire( 'update' );
				editor.ui.fire( 'update' );

				sinon.assert.notCalled( pinSpy );

				await wait( 75 );

				sinon.assert.calledOnce( pinSpy );
				sinon.assert.calledWith( pinSpy.firstCall, sinon.match.has( 'target', editor.editing.view.getDomRoot() ) );
			} );

			it( 'should (re-)show the balloon if the focus is not in the editing root but in other editor UI', async () => {
				const focusableEditorUIElement = document.createElement( 'input' );
				focusableEditorUIElement.type = 'text';
				editor.ui.focusTracker.add( focusableEditorUIElement );
				document.body.appendChild( focusableEditorUIElement );

				focusEditor( editor, focusableEditorUIElement );

				const pinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'pin' );

				sinon.assert.notCalled( pinSpy );

				editor.ui.fire( 'update' );
				editor.ui.fire( 'update' );

				sinon.assert.calledOnce( pinSpy );

				await wait( 75 );

				sinon.assert.calledTwice( pinSpy );
				sinon.assert.calledWith( pinSpy, sinon.match.has( 'target', editor.editing.view.getDomRoot() ) );
				focusableEditorUIElement.remove();
			} );
		} );

		describe( 'balloon view', () => {
			let balloon, focusTrackerAddSpy;

			beforeEach( () => {
				focusTrackerAddSpy = testUtils.sinon.spy( editor.ui.focusTracker, 'add' );

				focusEditor( editor );

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
				focusEditor( editor );

				view = editor.ui.poweredBy._balloonView.content.first;
			} );

			it( 'should have specific CSS classes', () => {
				expect( view.element.classList.contains( 'ck' ) ).to.be.true;
				expect( view.element.classList.contains( 'ck-powered-by' ) ).to.be.true;
			} );

			it( 'should have a link that opens in a new tab', () => {
				const link = 'https://ckeditor.com/powered-by-ckeditor/?utm_source=ckeditor&utm_medium=referral' +
					'&utm_campaign=701Dn000000hVgmIAE_powered_by_ckeditor_logo';
				expect( view.element.firstChild.tagName ).to.equal( 'A' );
				expect( view.element.firstChild.href ).to.equal( link );
				expect( view.element.firstChild.target ).to.equal( '_blank' );
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

			it( 'should be excluded from the accessibility tree', () => {
				expect( view.element.getAttribute( 'aria-hidden' ) ).to.equal( 'true' );
			} );

			it( 'should not be accessible via tab key navigation', () => {
				expect( view.element.firstChild.tabIndex ).to.equal( -1 );
			} );

			it( 'should have a configurable label (custom text)', async () => {
				const editor = await createEditor( element, {
					ui: {
						poweredBy: {
							label: 'foo'
						}
					}
				} );

				focusEditor( editor );

				const view = editor.ui.poweredBy._balloonView.content.first;

				expect( view.element.firstChild.firstChild.textContent ).to.equal( 'foo' );

				await editor.destroy();
			} );

			it( 'should have an option to hide the label', async () => {
				const editor = await createEditor( element, {
					ui: {
						poweredBy: {
							label: null
						}
					}
				} );

				focusEditor( editor );

				const view = editor.ui.poweredBy._balloonView.content.first;

				expect( view.element.firstChild.childElementCount ).to.equal( 1 );
				expect( view.element.firstChild.firstChild.tagName ).to.equal( 'svg' );

				await editor.destroy();
			} );
		} );
	} );

	describe( 'destroy()', () => {
		describe( 'if there was a balloon', () => {
			beforeEach( () => {
				focusEditor( editor );
			} );

			it( 'should unpin the balloon', async () => {
				const unpinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'unpin' );

				await editor.destroy();

				sinon.assert.calledOnce( unpinSpy );
			} );

			it( 'should destroy the balloon', async () => {
				const destroySpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'destroy' );

				await editor.destroy();

				sinon.assert.called( destroySpy );

				expect( editor.ui.poweredBy._balloonView ).to.be.null;
			} );

			it( 'should cancel any throttled show to avoid post-destroy timed errors', async () => {
				const spy = testUtils.sinon.spy( editor.ui.poweredBy._showBalloonThrottled, 'cancel' );

				await editor.destroy();

				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( 'if there was no balloon', () => {
			it( 'should not throw', done => {
				expect( () => {
					editor.destroy().then( () => done() );
				} ).to.not.throw();
			} );
		} );

		it( 'should destroy the emitter listeners', done => {
			const spy = testUtils.sinon.spy( editor.ui.poweredBy, 'stopListening' );

			editor.destroy().then( () => done() );

			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'balloon positioning depending on environment and configuration', () => {
		const originalGetVisible = Rect.prototype.getVisible;
		let rootRect, balloonRect;

		beforeEach( () => {
			rootRect = new Rect( { top: 0, left: 0, width: 400, right: 400, bottom: 100, height: 100 } );
			balloonRect = new Rect( { top: 0, left: 0, width: 20, right: 20, bottom: 10, height: 10 } );
		} );

		it( 'should not show the balloon if the root is not visible vertically', async () => {
			const domRoot = editor.editing.view.getDomRoot();
			const parentWithOverflow = document.createElement( 'div' );

			parentWithOverflow.style.overflow = 'scroll';
			// Is not enough height to be visible vertically.
			parentWithOverflow.style.height = '99px';

			document.body.appendChild( parentWithOverflow );
			parentWithOverflow.appendChild( domRoot );

			focusEditor( editor );

			expect( editor.ui.poweredBy._balloonView.isVisible ).to.be.true;
			expect( editor.ui.poweredBy._balloonView.position ).to.equal( 'arrowless' );

			parentWithOverflow.remove();
		} );

		it( 'should not show the balloon if the root is not visible horizontally', async () => {
			const domRoot = editor.editing.view.getDomRoot();
			const parentWithOverflow = document.createElement( 'div' );

			parentWithOverflow.style.overflow = 'scroll';
			// Is not enough width to be visible horizontally.
			parentWithOverflow.style.width = '399px';

			document.body.appendChild( parentWithOverflow );
			parentWithOverflow.appendChild( domRoot );

			focusEditor( editor );

			expect( editor.ui.poweredBy._balloonView.isVisible ).to.be.true;
			expect( editor.ui.poweredBy._balloonView.position ).to.equal( 'arrowless' );

			parentWithOverflow.remove();
		} );

		it( 'should position the to the left side if the UI language is RTL and no side was configured', async () => {
			const editor = await createEditor( element, {
				language: 'ar'
			} );

			testUtils.sinon.stub( editor.ui.getEditableElement( 'main' ), 'getBoundingClientRect' ).returns( {
				top: 0,
				left: 0,
				right: 400,
				width: 400,
				bottom: 100,
				height: 100
			} );

			focusEditor( editor );

			const pinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			sinon.assert.calledOnce( pinSpy );

			const pinArgs = pinSpy.firstCall.args[ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).to.equal( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).to.deep.equal( {
				top: 95,
				left: 5,
				name: 'position_border-side_left',
				config: {
					withArrow: false
				}
			} );

			await editor.destroy();
		} );

		it( 'should position the balloon in the lower right corner by default', async () => {
			focusEditor( editor );

			const pinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			sinon.assert.calledOnce( pinSpy );

			const pinArgs = pinSpy.firstCall.args[ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).to.equal( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).to.deep.equal( {
				top: 95,
				left: 375,
				name: 'position_border-side_right',
				config: {
					withArrow: false
				}
			} );
		} );

		it( 'should position the balloon in the lower left corner if configured', async () => {
			const editor = await createEditor( element, {
				ui: {
					poweredBy: {
						side: 'left'
					}
				}
			} );

			testUtils.sinon.stub( editor.ui.getEditableElement( 'main' ), 'getBoundingClientRect' ).returns( {
				top: 0,
				left: 0,
				right: 400,
				width: 400,
				bottom: 100,
				height: 100
			} );

			focusEditor( editor );

			const pinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			sinon.assert.calledOnce( pinSpy );

			const pinArgs = pinSpy.firstCall.args[ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).to.equal( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).to.deep.equal( {
				top: 95,
				left: 5,
				name: 'position_border-side_left',
				config: {
					withArrow: false
				}
			} );

			await editor.destroy();
		} );

		it( 'should position the balloon over the bottom root border if configured', async () => {
			const editor = await createEditor( element, {
				ui: {
					poweredBy: {
						position: 'border'
					}
				}
			} );

			testUtils.sinon.stub( editor.ui.getEditableElement( 'main' ), 'getBoundingClientRect' ).returns( {
				top: 0,
				left: 0,
				right: 400,
				width: 400,
				bottom: 100,
				height: 100
			} );

			focusEditor( editor );

			const pinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			sinon.assert.calledOnce( pinSpy );

			const pinArgs = pinSpy.firstCall.args[ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).to.equal( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).to.deep.equal( {
				top: 95,
				left: 375,
				name: 'position_border-side_right',
				config: {
					withArrow: false
				}
			} );

			await editor.destroy();
		} );

		it( 'should position the balloon in the corner of the root if configured', async () => {
			const editor = await createEditor( element, {
				ui: {
					poweredBy: {
						position: 'inside'
					}
				}
			} );

			testUtils.sinon.stub( editor.ui.getEditableElement( 'main' ), 'getBoundingClientRect' ).returns( {
				top: 0,
				left: 0,
				right: 400,
				width: 400,
				bottom: 100,
				height: 100
			} );

			focusEditor( editor );

			const pinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			sinon.assert.calledOnce( pinSpy );

			const pinArgs = pinSpy.firstCall.args[ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).to.equal( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).to.deep.equal( {
				top: 85,
				left: 375,
				name: 'position_inside-side_right',
				config: {
					withArrow: false
				}
			} );

			await editor.destroy();
		} );

		it( 'should hide the balloon if the root is invisible (cropped by ancestors)', async () => {
			const editor = await createEditor( element );

			const domRoot = editor.editing.view.getDomRoot();

			rootRect = new Rect( { top: 0, left: 0, width: 100, right: 100, bottom: 10, height: 10 } );

			testUtils.sinon.stub( rootRect, 'getVisible' ).returns( null );

			focusEditor( editor );

			const pinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			sinon.assert.calledOnce( pinSpy );

			const pinArgs = pinSpy.firstCall.args[ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).to.equal( domRoot );
			expect( positioningFunction( rootRect, balloonRect ) ).to.equal( null );

			await editor.destroy();
		} );

		it( 'should hide the balloon if displayed over the bottom root border but partially cropped by an ancestor', async () => {
			const editor = await createEditor( element, {
				ui: {
					poweredBy: {
						position: 'border'
					}
				}
			} );

			const domRoot = editor.editing.view.getDomRoot();

			rootRect = new Rect( { top: 0, left: 0, width: 100, right: 100, bottom: 10, height: 10 } );

			focusEditor( editor );

			const pinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			sinon.assert.calledOnce( pinSpy );

			const pinArgs = pinSpy.firstCall.args[ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).to.equal( domRoot );
			expect( positioningFunction( rootRect, balloonRect ) ).to.equal( null );

			await editor.destroy();
		} );

		it( 'should hide the balloon if displayed in the corner of the root but partially cropped by an ancestor', async () => {
			const editor = await createEditor( element, {
				ui: {
					poweredBy: {
						position: 'inside'
					}
				}
			} );

			rootRect = new Rect( { top: 0, left: 0, width: 400, right: 400, bottom: 200, height: 200 } );

			testUtils.sinon.stub( rootRect, 'getVisible' ).returns( { top: 0, left: 0, width: 400, right: 400, bottom: 10, height: 10 } );

			balloonRect = new Rect( { top: 200, left: 0, width: 20, right: 20, bottom: 210, height: 10 } );

			const domRoot = editor.editing.view.getDomRoot();

			focusEditor( editor );

			const pinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			sinon.assert.calledOnce( pinSpy );

			const pinArgs = pinSpy.firstCall.args[ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).to.equal( domRoot );
			expect( positioningFunction( rootRect, balloonRect ) ).to.equal( null );

			await editor.destroy();
		} );

		it( 'should allow configuring balloon position offsets', async () => {
			const editor = await createEditor( element, {
				ui: {
					poweredBy: {
						verticalOffset: 10,
						horizontalOffset: 10
					}
				}
			} );

			testUtils.sinon.stub( editor.ui.getEditableElement( 'main' ), 'getBoundingClientRect' ).returns( {
				top: 0,
				left: 0,
				right: 400,
				width: 400,
				bottom: 100,
				height: 100
			} );

			focusEditor( editor );

			const pinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			sinon.assert.calledOnce( pinSpy );

			const pinArgs = pinSpy.firstCall.args[ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).to.equal( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).to.deep.equal( {
				top: 85,
				left: 370,
				name: 'position_border-side_right',
				config: {
					withArrow: false
				}
			} );

			await editor.destroy();
		} );

		it( 'should not display the balloon if the root is narrower than 350px', async () => {
			const domRoot = editor.editing.view.getDomRoot();

			testUtils.sinon.stub( Rect.prototype, 'getVisible' ).callsFake( function() {
				if ( this._source === domRoot ) {
					return new Rect( domRoot );
				} else {
					return originalGetVisible.call( this );
				}
			} );

			domRoot.getBoundingClientRect.returns( {
				top: 0,
				left: 0,
				right: 349,
				width: 349,
				bottom: 100,
				height: 100
			} );

			focusEditor( editor );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			const pinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'pin' );

			expect( editor.ui.poweredBy._balloonView.isVisible ).to.be.true;
			expect( editor.ui.poweredBy._balloonView.position ).to.equal( 'arrowless' );

			domRoot.getBoundingClientRect.returns( {
				top: 0,
				left: 0,
				right: 350,
				width: 350,
				bottom: 100,
				height: 100
			} );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			expect( editor.ui.poweredBy._balloonView.isVisible ).to.be.true;
			expect( editor.ui.poweredBy._balloonView.position ).to.equal( 'position_border-side_right' );

			const pinArgs = pinSpy.firstCall.args[ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).to.equal( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).to.deep.equal( {
				top: 95,
				left: 325,
				name: 'position_border-side_right',
				config: {
					withArrow: false
				}
			} );
		} );

		it( 'should not display the balloon if the root is shorter than 50px', async () => {
			const domRoot = editor.editing.view.getDomRoot();

			testUtils.sinon.stub( Rect.prototype, 'getVisible' ).callsFake( function() {
				if ( this._source === domRoot ) {
					return new Rect( domRoot );
				} else {
					return originalGetVisible.call( this );
				}
			} );

			domRoot.getBoundingClientRect.returns( {
				top: 0,
				left: 0,
				right: 1000,
				width: 1000,
				bottom: 49,
				height: 49
			} );

			focusEditor( editor );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			const pinSpy = testUtils.sinon.spy( editor.ui.poweredBy._balloonView, 'pin' );

			expect( editor.ui.poweredBy._balloonView.isVisible ).to.be.true;
			expect( editor.ui.poweredBy._balloonView.position ).to.equal( 'arrowless' );

			domRoot.getBoundingClientRect.returns( {
				top: 0,
				left: 0,
				right: 1000,
				width: 1000,
				bottom: 50,
				height: 50
			} );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			expect( editor.ui.poweredBy._balloonView.isVisible ).to.be.true;
			expect( editor.ui.poweredBy._balloonView.position ).to.equal( 'position_border-side_right' );

			const pinArgs = pinSpy.firstCall.args[ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).to.equal( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).to.deep.equal( {
				top: 45,
				left: 975,
				name: 'position_border-side_right',
				config: {
					withArrow: false
				}
			} );
		} );
	} );

	it( 'should have the z-index lower than a regular BalloonPanelView instance', () => {
		focusEditor( editor );

		const balloonView = new BalloonPanelView();
		balloonView.render();

		const zIndexOfPoweredByBalloon = Number( getComputedStyle( editor.ui.poweredBy._balloonView.element ).zIndex );

		document.body.appendChild( balloonView.element );

		const zIndexOfRegularBalloon = Number( getComputedStyle( balloonView.element ).zIndex );

		expect( zIndexOfPoweredByBalloon ).to.be.lessThan( zIndexOfRegularBalloon );

		balloonView.element.remove();
		balloonView.destroy();
	} );

	it( 'should not overlap a dropdown panel in a toolbar', async () => {
		const editor = await createClassicEditor( element, {
			toolbar: [ 'heading' ],
			plugins: [ Heading ],
			ui: {
				poweredBy: {
					side: 'left',
					position: 'inside'
				}
			}
		} );

		setData( editor.model, '<heading2>foo[]bar</heading2>' );

		focusEditor( editor );

		const headingToolbarButton = editor.ui.view.toolbar.items
			.find( item => item.buttonView && item.buttonView.label.startsWith( 'Heading' ) );

		const poweredByElement = editor.ui.poweredBy._balloonView.element;

		const poweredByElementGeometry = new Rect( poweredByElement );

		const middleOfThePoweredByCoords = {
			x: ( poweredByElementGeometry.width / 2 ) + poweredByElementGeometry.left,
			y: ( poweredByElementGeometry.height / 2 ) + poweredByElementGeometry.top
		};

		let elementFromPoint = document.elementFromPoint(
			middleOfThePoweredByCoords.x - 5, // "-5" to hit in the label not SVG,
			middleOfThePoweredByCoords.y
		);

		expect( elementFromPoint.classList.contains( 'ck-powered-by__label' ) ).to.be.true;

		// show heading dropdown
		headingToolbarButton.buttonView.fire( 'execute' );

		elementFromPoint = document.elementFromPoint(
			middleOfThePoweredByCoords.x,
			middleOfThePoweredByCoords.y
		);

		expect( elementFromPoint.classList.contains( 'ck-button__label' ) ).to.be.true;

		await editor.destroy();
	} );

	async function createEditor( element, config = { plugins: [ SourceEditing ] } ) {
		return ClassicTestEditor.create( element, config );
	}

	async function createClassicEditor( element, config = {} ) {
		return ClassicEditor.create( element, config );
	}

	function wait( time ) {
		return new Promise( res => {
			window.setTimeout( res, time );
		} );
	}

	function focusEditor( editor, focusableUIElement ) {
		if ( !focusableUIElement ) {
			focusableUIElement = editor.editing.view.getDomRoot();
			editor.editing.view.focus();
		} else {
			focusableUIElement.focus();
		}

		editor.ui.focusTracker.focusedElement = focusableUIElement;
		editor.ui.focusTracker.isFocused = true;
	}

	function blurEditor( editor ) {
		editor.ui.focusTracker.focusedElement = null;
		editor.ui.focusTracker.isFocused = null;
	}
} );
