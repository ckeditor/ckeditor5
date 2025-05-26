/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
import { Rect, global } from '@ckeditor/ckeditor5-utils';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { BalloonPanelView } from '../../src/index.js';
import View from '../../src/view.js';
import Badge from '../../src/badge/badge.js';

class BadgeExtended extends Badge {
	_isEnabled() {
		return true;
	}

	_createBadgeContent() {
		return new EvaluationBadgeView( this.editor.locale, 'Badge extended label' );
	}
}

class EvaluationBadgeView extends View {
	constructor( locale, label ) {
		super( locale );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck-badge-extended' ]
			},
			children: [
				{
					tag: 'span',
					attributes: {
						class: [ 'ck-badge-extended__label' ]
					},
					children: [ label ]
				}
			]
		} );
	}
}

describe( 'Badge', () => {
	let editor, element, badge;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		editor = await createEditor( element );

		badge = new BadgeExtended( editor );
		editor.fire( 'ready' );

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
			it( 'should create the balloon on demand', () => {
				expect( badge._balloonView ).to.be.null;

				focusEditor( editor );

				expect( badge._balloonView ).to.be.instanceOf( BalloonPanelView );
			} );
		} );

		describe( 'balloon management on editor focus change', () => {
			const originalGetVisible = Rect.prototype.getVisible;

			it( 'should show the balloon when the editor gets focused', () => {
				focusEditor( editor );

				expect( badge._balloonView.isVisible ).to.be.true;
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
				const pinSpy = testUtils.sinon.spy( badge._balloonView, 'pin' );

				focusEditor( editor, focusableEditorUIElement );

				sinon.assert.calledOnce( pinSpy );
				sinon.assert.calledWith( pinSpy, sinon.match.has( 'target', editor.editing.view.getDomRoot() ) );

				focusableEditorUIElement.remove();
			} );

			it( 'should hide the balloon on blur', async () => {
				focusEditor( editor );

				expect( badge._balloonView.isVisible ).to.be.true;

				blurEditor( editor );

				// FocusTracker's blur handler is asynchronous.
				await wait( 200 );

				expect( badge._balloonView.isVisible ).to.be.false;
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

				const pinSpy = testUtils.sinon.spy( badge._balloonView, 'pin' );

				editor.ui.fire( 'update' );

				await wait( 75 );

				expect( badge._balloonView.isVisible ).to.be.true;
				expect( badge._balloonView.position ).to.equal( 'position_border-side_right' );
				sinon.assert.calledWith( pinSpy.lastCall, sinon.match.has( 'target', domRoot ) );

				editor.plugins.get( 'SourceEditing' ).isSourceEditingMode = true;

				const sourceAreaElement = editor.ui.getEditableElement( 'sourceEditing:main' );

				focusEditor( editor, sourceAreaElement );
				sinon.assert.calledWith(
					pinSpy.lastCall,
					sinon.match.has( 'target', sourceAreaElement )
				);

				expect( badge._balloonView.isVisible ).to.be.true;
				expect( badge._balloonView.position ).to.equal( 'position_border-side_right' );

				editor.plugins.get( 'SourceEditing' ).isSourceEditingMode = false;
				focusEditor( editor );

				expect( badge._balloonView.isVisible ).to.be.true;
				expect( badge._balloonView.position ).to.equal( 'position_border-side_right' );
				sinon.assert.calledWith( pinSpy.lastCall, sinon.match.has( 'target', domRoot ) );
			} );
		} );

		describe( 'balloon management on EditorUI#update', () => {
			it( 'should not trigger if the editor is not focused', () => {
				expect( badge._balloonView ).to.be.null;

				editor.ui.fire( 'update' );

				expect( badge._balloonView ).to.be.null;
			} );

			it( 'should (re-)show the balloon but throttled', async () => {
				focusEditor( editor );

				const pinSpy = testUtils.sinon.spy( badge._balloonView, 'pin' );

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

				const pinSpy = testUtils.sinon.spy( badge._balloonView, 'pin' );

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

				balloon = badge._balloonView;
			} );

			it( 'should be an instance of BalloonPanelView', () => {
				expect( balloon ).to.be.instanceOf( BalloonPanelView );
			} );

			it( 'should host a badge view', () => {
				expect( balloon.content.first ).to.be.instanceOf( View );
			} );

			it( 'should have no arrow', () => {
				expect( balloon.withArrow ).to.be.false;
			} );

			it( 'should not have a specific CSS class if not provided', () => {
				expect( balloon.class ).to.be.undefined;
			} );

			it( 'should be added to editor\'s body view collection', () => {
				expect( editor.ui.view.body.has( balloon ) ).to.be.true;
			} );

			it( 'should be registered in the focus tracker to avoid focus loss on click', () => {
				sinon.assert.calledWith( focusTrackerAddSpy, balloon.element );
			} );
		} );

		describe( 'badge view', () => {
			let view;

			beforeEach( () => {
				focusEditor( editor );

				view = badge._balloonView.content.first;
			} );

			it( 'should have specific CSS classes', () => {
				expect( view.element.classList.contains( 'ck-badge-extended' ) ).to.be.true;
			} );

			it( 'should have a label', () => {
				expect( view.element.firstChild.tagName ).to.equal( 'SPAN' );
				expect( view.element.firstChild.classList.contains( 'ck-badge-extended__label' ) ).to.be.true;
				expect( view.element.firstChild.textContent ).to.equal( 'Badge extended label' );
			} );

			it( 'should not be accessible via tab key navigation', () => {
				expect( view.element.firstChild.tabIndex ).to.equal( -1 );
			} );
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

			expect( badge._balloonView.isVisible ).to.be.true;
			expect( badge._balloonView.position ).to.equal( 'arrowless' );

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

			expect( badge._balloonView.isVisible ).to.be.true;
			expect( badge._balloonView.position ).to.equal( 'arrowless' );

			parentWithOverflow.remove();
		} );

		it( 'should position to the left side if the UI language is RTL and no side was configured', async () => {
			const editor = await createEditor( element, {
				language: 'ar'
			} );

			badge = new BadgeExtended( editor );
			editor.fire( 'ready' );

			testUtils.sinon.stub( editor.ui.getEditableElement( 'main' ), 'getBoundingClientRect' ).returns( {
				top: 0,
				left: 0,
				right: 400,
				width: 400,
				bottom: 100,
				height: 100
			} );

			focusEditor( editor );

			const pinSpy = testUtils.sinon.spy( badge._balloonView, 'pin' );

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

			const pinSpy = testUtils.sinon.spy( badge._balloonView, 'pin' );

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

		it( 'should hide the balloon if the root is invisible (cropped by ancestors)', async () => {
			const editor = await createEditor( element );

			badge = new BadgeExtended( editor );
			editor.fire( 'ready' );

			const domRoot = editor.editing.view.getDomRoot();

			rootRect = new Rect( { top: 0, left: 0, width: 100, right: 100, bottom: 10, height: 10 } );

			testUtils.sinon.stub( rootRect, 'getVisible' ).returns( null );

			focusEditor( editor );

			const pinSpy = testUtils.sinon.spy( badge._balloonView, 'pin' );

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
			const editor = await createEditor( element );

			badge = new BadgeExtended( editor );
			editor.fire( 'ready' );

			const domRoot = editor.editing.view.getDomRoot();

			rootRect = new Rect( { top: 0, left: 0, width: 100, right: 100, bottom: 10, height: 10 } );

			focusEditor( editor );

			const pinSpy = testUtils.sinon.spy( badge._balloonView, 'pin' );

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

			const pinSpy = testUtils.sinon.spy( badge._balloonView, 'pin' );

			expect( badge._balloonView.isVisible ).to.be.true;
			expect( badge._balloonView.position ).to.equal( 'arrowless' );

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

			expect( badge._balloonView.isVisible ).to.be.true;
			expect( badge._balloonView.position ).to.equal( 'position_border-side_right' );

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

			const pinSpy = testUtils.sinon.spy( badge._balloonView, 'pin' );

			expect( badge._balloonView.isVisible ).to.be.true;
			expect( badge._balloonView.position ).to.equal( 'arrowless' );

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

			expect( badge._balloonView.isVisible ).to.be.true;
			expect( badge._balloonView.position ).to.equal( 'position_border-side_right' );

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

	async function createEditor( element, config = { plugins: [ SourceEditing ] } ) {
		return ClassicTestEditor.create( element, config );
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
