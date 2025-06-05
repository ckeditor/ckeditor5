/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Editor } from '@ckeditor/ckeditor5-core';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import EditorUI from '../../src/editorui/editorui.js';
import { BalloonPanelView } from '../../src/index.js';
import View from '../../src/view.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { Rect, global } from '@ckeditor/ckeditor5-utils';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import generateKey from '@ckeditor/ckeditor5-core/tests/_utils/generatelicensekey.js';

describe( 'EvaluationBadge', () => {
	let editor, element, developmentLicenseKey;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		sinon.stub( console, 'info' );
		sinon.stub( console, 'warn' );

		developmentLicenseKey = generateKey( { licenseType: 'development' } ).licenseKey;
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		editor = await createEditor( element, {
			plugins: [ SourceEditing ],
			licenseKey: developmentLicenseKey
		} );

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
			it( 'should not throw if there is no view in EditorUI', () => {
				expect( () => {
					const editor = new Editor( { licenseKey: developmentLicenseKey } );

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
				expect( editor.ui.evaluationBadge._balloonView ).to.be.null;

				focusEditor( editor );

				expect( editor.ui.evaluationBadge._balloonView ).to.be.instanceOf( BalloonPanelView );
			} );

			it( 'should create the balloon when license type is `evaluation`', async () => {
				const { licenseKey, todayTimestamp } = generateKey( {
					licenseType: 'evaluation',
					isExpired: false,
					daysAfterExpiration: -1
				} );

				const today = todayTimestamp;
				const dateNow = sinon.stub( Date, 'now' ).returns( today );

				const editor = await createEditor( element, {
					licenseKey
				} );

				expect( editor.ui.evaluationBadge._balloonView ).to.be.null;

				focusEditor( editor );

				expect( editor.ui.evaluationBadge._balloonView ).to.be.instanceOf( BalloonPanelView );

				const balloonElement = editor.ui.evaluationBadge._balloonView.element;

				expect( balloonElement.querySelector( '.ck-evaluation-badge__label' ).textContent ).to.equal(
					'For evaluation purposes only'
				);

				await editor.destroy();

				dateNow.restore();
			} );

			it( 'should create the balloon when license type is `trial`', async () => {
				const { licenseKey, todayTimestamp } = generateKey( {
					licenseType: 'trial',
					isExpired: false,
					daysAfterExpiration: -1
				} );

				const today = todayTimestamp;
				const dateNow = sinon.stub( Date, 'now' ).returns( today );

				const editor = await createEditor( element, {
					licenseKey
				} );

				expect( editor.ui.evaluationBadge._balloonView ).to.be.null;

				focusEditor( editor );

				expect( editor.ui.evaluationBadge._balloonView ).to.be.instanceOf( BalloonPanelView );

				const balloonElement = editor.ui.evaluationBadge._balloonView.element;

				expect( balloonElement.querySelector( '.ck-evaluation-badge__label' ).textContent ).to.equal(
					'For evaluation purposes only'
				);

				await editor.destroy();

				dateNow.restore();
			} );

			it( 'should create the balloon when license type is `development`', async () => {
				const editor = await createEditor( element, {
					licenseKey: developmentLicenseKey
				} );

				expect( editor.ui.evaluationBadge._balloonView ).to.be.null;

				focusEditor( editor );

				expect( editor.ui.evaluationBadge._balloonView ).to.be.instanceOf( BalloonPanelView );

				const balloonElement = editor.ui.evaluationBadge._balloonView.element;

				expect( balloonElement.querySelector( '.ck-evaluation-badge__label' ).textContent ).to.equal(
					'For development purposes only'
				);

				await editor.destroy();
			} );

			it( 'should not depend on white-label', async () => {
				const { licenseKey } = generateKey( { whiteLabel: true, licenseType: 'development' } );
				const editor = await createEditor( element, {
					licenseKey
				} );

				expect( editor.ui.evaluationBadge._balloonView ).to.be.null;

				focusEditor( editor );

				expect( editor.ui.evaluationBadge._balloonView ).to.be.instanceOf( BalloonPanelView );

				await editor.destroy();
			} );
		} );

		describe( 'balloon management on editor focus change', () => {
			const originalGetVisible = Rect.prototype.getVisible;

			it( 'should show the balloon when the editor gets focused', () => {
				focusEditor( editor );

				expect( editor.ui.evaluationBadge._balloonView.isVisible ).to.be.true;
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
				const pinSpy = testUtils.sinon.spy( editor.ui.evaluationBadge._balloonView, 'pin' );

				focusEditor( editor, focusableEditorUIElement );

				sinon.assert.calledOnce( pinSpy );
				sinon.assert.calledWith( pinSpy, sinon.match.has( 'target', editor.editing.view.getDomRoot() ) );

				focusableEditorUIElement.remove();
			} );

			it( 'should hide the balloon on blur', async () => {
				focusEditor( editor );

				expect( editor.ui.evaluationBadge._balloonView.isVisible ).to.be.true;

				blurEditor( editor );

				// FocusTracker's blur handler is asynchronous.
				await wait( 200 );

				expect( editor.ui.evaluationBadge._balloonView.isVisible ).to.be.false;
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

				const pinSpy = testUtils.sinon.spy( editor.ui.evaluationBadge._balloonView, 'pin' );

				editor.ui.fire( 'update' );

				await wait( 75 );

				expect( editor.ui.evaluationBadge._balloonView.isVisible ).to.be.true;
				expect( editor.ui.evaluationBadge._balloonView.position ).to.equal( 'position_border-side_left' );
				sinon.assert.calledWith( pinSpy.lastCall, sinon.match.has( 'target', domRoot ) );

				editor.plugins.get( 'SourceEditing' ).isSourceEditingMode = true;

				const sourceAreaElement = editor.ui.getEditableElement( 'sourceEditing:main' );

				focusEditor( editor, sourceAreaElement );
				sinon.assert.calledWith(
					pinSpy.lastCall,
					sinon.match.has( 'target', sourceAreaElement )
				);

				expect( editor.ui.evaluationBadge._balloonView.isVisible ).to.be.true;
				expect( editor.ui.evaluationBadge._balloonView.position ).to.equal( 'position_border-side_left' );

				editor.plugins.get( 'SourceEditing' ).isSourceEditingMode = false;
				focusEditor( editor );

				expect( editor.ui.evaluationBadge._balloonView.isVisible ).to.be.true;
				expect( editor.ui.evaluationBadge._balloonView.position ).to.equal( 'position_border-side_left' );
				sinon.assert.calledWith( pinSpy.lastCall, sinon.match.has( 'target', domRoot ) );
			} );
		} );

		describe( 'balloon management on EditorUI#update', () => {
			it( 'should not trigger if the editor is not focused', () => {
				expect( editor.ui.evaluationBadge._balloonView ).to.be.null;

				editor.ui.fire( 'update' );

				expect( editor.ui.evaluationBadge._balloonView ).to.be.null;
			} );

			it( 'should (re-)show the balloon but throttled', async () => {
				focusEditor( editor );

				const pinSpy = testUtils.sinon.spy( editor.ui.evaluationBadge._balloonView, 'pin' );

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

				const pinSpy = testUtils.sinon.spy( editor.ui.evaluationBadge._balloonView, 'pin' );

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

				balloon = editor.ui.evaluationBadge._balloonView;
			} );

			it( 'should be an instance of BalloonPanelView', () => {
				expect( balloon ).to.be.instanceOf( BalloonPanelView );
			} );

			it( 'should host an evaluation badge view', () => {
				expect( balloon.content.first ).to.be.instanceOf( View );
			} );

			it( 'should have no arrow', () => {
				expect( balloon.withArrow ).to.be.false;
			} );

			it( 'should have a specific CSS class', () => {
				expect( balloon.class ).to.equal( 'ck-evaluation-badge-balloon' );
			} );

			it( 'should be added to editor\'s body view collection', () => {
				expect( editor.ui.view.body.has( balloon ) ).to.be.true;
			} );

			it( 'should be registered in the focus tracker to avoid focus loss on click', () => {
				sinon.assert.calledWith( focusTrackerAddSpy, balloon.element );
			} );
		} );

		describe( 'evaluation badge view', () => {
			let view;

			beforeEach( () => {
				focusEditor( editor );

				view = editor.ui.evaluationBadge._balloonView.content.first;
			} );

			it( 'should have specific CSS classes', () => {
				expect( view.element.classList.contains( 'ck' ) ).to.be.true;
				expect( view.element.classList.contains( 'ck-evaluation-badge' ) ).to.be.true;
			} );

			it( 'should be excluded from the accessibility tree', () => {
				expect( view.element.getAttribute( 'aria-hidden' ) ).to.equal( 'true' );
			} );

			it( 'should not be accessible via tab key navigation', () => {
				expect( view.element.firstChild.tabIndex ).to.equal( -1 );
			} );
		} );
	} );

	describe( 'destroy()', () => {
		describe( 'if there was a balloon', () => {
			beforeEach( () => {
				focusEditor( editor );
			} );

			it( 'should unpin the balloon', () => {
				const unpinSpy = testUtils.sinon.spy( editor.ui.evaluationBadge._balloonView, 'unpin' );

				editor.destroy();

				sinon.assert.calledOnce( unpinSpy );
			} );

			it( 'should destroy the balloon', () => {
				const destroySpy = testUtils.sinon.spy( editor.ui.evaluationBadge._balloonView, 'destroy' );

				editor.destroy();

				sinon.assert.called( destroySpy );

				expect( editor.ui.evaluationBadge._balloonView ).to.be.null;
			} );

			it( 'should cancel any throttled show to avoid post-destroy timed errors', () => {
				const spy = testUtils.sinon.spy( editor.ui.evaluationBadge._showBalloonThrottled, 'cancel' );

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
			const spy = testUtils.sinon.spy( editor.ui.evaluationBadge, 'stopListening' );

			editor.destroy();

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

			expect( editor.ui.evaluationBadge._balloonView.isVisible ).to.be.true;
			expect( editor.ui.evaluationBadge._balloonView.position ).to.equal( 'arrowless' );

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

			expect( editor.ui.evaluationBadge._balloonView.isVisible ).to.be.true;
			expect( editor.ui.evaluationBadge._balloonView.position ).to.equal( 'arrowless' );

			parentWithOverflow.remove();
		} );

		it( 'should position the badge to the left right if the UI language is RTL (and powered-by is on the left)', async () => {
			const editor = await createEditor( element, {
				language: 'ar',
				licenseKey: developmentLicenseKey
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

			const pinSpy = testUtils.sinon.spy( editor.ui.evaluationBadge._balloonView, 'pin' );

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

		it( 'should position the balloon in the lower left corner by default', async () => {
			focusEditor( editor );

			const pinSpy = testUtils.sinon.spy( editor.ui.evaluationBadge._balloonView, 'pin' );

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
		} );

		it( 'should position the balloon in the lower right corner if poweredby is configured on the left', async () => {
			const editor = await createEditor( element, {
				ui: {
					poweredBy: {
						side: 'left'
					}
				},
				licenseKey: developmentLicenseKey
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

			const pinSpy = testUtils.sinon.spy( editor.ui.evaluationBadge._balloonView, 'pin' );

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

		it( 'should position the balloon over the bottom root border if configured', async () => {
			const editor = await createEditor( element, {
				ui: {
					poweredBy: {
						position: 'border'
					}
				},
				licenseKey: developmentLicenseKey
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

			const pinSpy = testUtils.sinon.spy( editor.ui.evaluationBadge._balloonView, 'pin' );

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

		it( 'should position the balloon in the corner of the root if configured', async () => {
			const editor = await createEditor( element, {
				ui: {
					poweredBy: {
						position: 'inside'
					}
				},
				licenseKey: developmentLicenseKey
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

			const pinSpy = testUtils.sinon.spy( editor.ui.evaluationBadge._balloonView, 'pin' );

			editor.ui.fire( 'update' );

			// Throttled #update listener.
			await wait( 75 );

			sinon.assert.calledOnce( pinSpy );

			const pinArgs = pinSpy.firstCall.args[ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).to.equal( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).to.deep.equal( {
				top: 90,
				left: 5,
				name: 'position_inside-side_left',
				config: {
					withArrow: false
				}
			} );

			await editor.destroy();
		} );

		it( 'should hide the balloon if displayed over the bottom root border but partially cropped by an ancestor', async () => {
			const editor = await createEditor( element, {
				ui: {
					poweredBy: {
						position: 'border'
					}
				},
				licenseKey: developmentLicenseKey
			} );

			const domRoot = editor.editing.view.getDomRoot();

			rootRect = new Rect( { top: 0, left: 0, width: 100, right: 100, bottom: 10, height: 10 } );

			focusEditor( editor );

			const pinSpy = testUtils.sinon.spy( editor.ui.evaluationBadge._balloonView, 'pin' );

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
				},
				licenseKey: developmentLicenseKey
			} );

			rootRect = new Rect( { top: 0, left: 0, width: 400, right: 400, bottom: 200, height: 200 } );

			testUtils.sinon.stub( rootRect, 'getVisible' ).returns( { top: 0, left: 0, width: 400, right: 400, bottom: 10, height: 10 } );

			balloonRect = new Rect( { top: 200, left: 0, width: 20, right: 20, bottom: 210, height: 10 } );

			const domRoot = editor.editing.view.getDomRoot();

			focusEditor( editor );

			const pinSpy = testUtils.sinon.spy( editor.ui.evaluationBadge._balloonView, 'pin' );

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

			const pinSpy = testUtils.sinon.spy( editor.ui.evaluationBadge._balloonView, 'pin' );

			expect( editor.ui.evaluationBadge._balloonView.isVisible ).to.be.true;
			expect( editor.ui.evaluationBadge._balloonView.position ).to.equal( 'arrowless' );

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

			expect( editor.ui.evaluationBadge._balloonView.isVisible ).to.be.true;
			expect( editor.ui.evaluationBadge._balloonView.position ).to.equal( 'position_border-side_left' );

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

			const pinSpy = testUtils.sinon.spy( editor.ui.evaluationBadge._balloonView, 'pin' );

			expect( editor.ui.evaluationBadge._balloonView.isVisible ).to.be.true;
			expect( editor.ui.evaluationBadge._balloonView.position ).to.equal( 'arrowless' );

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

			expect( editor.ui.evaluationBadge._balloonView.isVisible ).to.be.true;
			expect( editor.ui.evaluationBadge._balloonView.position ).to.equal( 'position_border-side_left' );

			const pinArgs = pinSpy.firstCall.args[ 0 ];
			const positioningFunction = pinArgs.positions[ 0 ];

			expect( pinArgs.target ).to.equal( editor.editing.view.getDomRoot() );
			expect( positioningFunction( rootRect, balloonRect ) ).to.deep.equal( {
				top: 45,
				left: 5,
				name: 'position_border-side_left',
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

		const zIndexOfEvaluationBadgeBalloon = Number( getComputedStyle( editor.ui.evaluationBadge._balloonView.element ).zIndex );

		document.body.appendChild( balloonView.element );

		const zIndexOfRegularBalloon = Number( getComputedStyle( balloonView.element ).zIndex );

		expect( zIndexOfEvaluationBadgeBalloon ).to.be.lessThan( zIndexOfRegularBalloon );

		balloonView.element.remove();
		balloonView.destroy();
	} );

	it( 'should not overlap a dropdown panel in a toolbar', async () => {
		const editor = await createClassicEditor( element, {
			toolbar: [ 'heading' ],
			plugins: [ Heading ],
			ui: {
				poweredBy: {
					position: 'inside'
				}
			},
			licenseKey: developmentLicenseKey
		} );

		setData( editor.model, '<heading2>foo[]bar</heading2>' );

		focusEditor( editor );

		const headingToolbarButton = editor.ui.view.toolbar.items
			.find( item => item.buttonView && item.buttonView.label.startsWith( 'Heading' ) );

		const evaluationBadgeElement = editor.ui.evaluationBadge._balloonView.element;

		const evaluationBadgeElementGeometry = new Rect( evaluationBadgeElement );

		const middleOfTheEvaluationBadgeCoords = {
			x: ( evaluationBadgeElementGeometry.width / 2 ) + evaluationBadgeElementGeometry.left,
			y: ( evaluationBadgeElementGeometry.height / 2 ) + evaluationBadgeElementGeometry.top
		};

		let elementFromPoint = document.elementFromPoint(
			middleOfTheEvaluationBadgeCoords.x,
			middleOfTheEvaluationBadgeCoords.y
		);

		expect( elementFromPoint.classList.contains( 'ck-evaluation-badge__label' ) ).to.be.true;

		// show heading dropdown
		headingToolbarButton.buttonView.fire( 'execute' );

		elementFromPoint = document.elementFromPoint(
			middleOfTheEvaluationBadgeCoords.x,
			middleOfTheEvaluationBadgeCoords.y
		);

		expect( elementFromPoint.classList.contains( 'ck-button__label' ) ).to.be.true;

		await editor.destroy();
	} );

	async function createEditor( element, config = {} ) {
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
