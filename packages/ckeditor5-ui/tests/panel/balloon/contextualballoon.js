/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ContextualBalloon from '../../../src/panel/balloon/contextualballoon';
import BalloonPanelView from '../../../src/panel/balloon/balloonpanelview';
import View from '../../../src/view';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { add as addTranslations, _clear as clearTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

/* global document, Event */

describe( 'ContextualBalloon', () => {
	let editor, editorElement, balloon, viewA, viewB, viewC, viewD;

	testUtils.createSinonSandbox();

	before( () => {
		addTranslations( 'en', {
			'Choose heading': '%0 of %1',
			'Previous': 'Previous',
			'Next': 'Next'
		} );

		addTranslations( 'pl', {
			'%0 of %1': '%0 z %1',
			'Previous': 'Poprzedni',
			'Next': 'Następny'
		} );
	} );

	after( () => {
		clearTranslations();
	} );

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, ContextualBalloon ]
			} )
			.then( newEditor => {
				editor = newEditor;
				balloon = editor.plugins.get( ContextualBalloon );

				// We don't need to execute BalloonPanel pin and attachTo methods
				// it's enough to check if was called with the proper data.
				sinon.stub( balloon.view, 'attachTo' ).returns( {} );
				sinon.stub( balloon.view, 'pin' ).returns( {} );

				viewA = new View();
				viewB = new View();
				viewC = new View();
				viewD = new View();

				// Add viewA to the pane and init viewB.
				balloon.add( {
					view: viewA,
					position: {
						target: 'fake'
					}
				} );

				viewB.render();
			} );
	} );

	afterEach( () => {
		editor.destroy();
		editorElement.remove();
	} );

	it( 'should create a plugin instance', () => {
		expect( balloon ).to.instanceof( Plugin );
		expect( balloon ).to.instanceof( ContextualBalloon );
	} );

	describe( 'pluginName', () => {
		it( 'should return plugin by name', () => {
			expect( editor.plugins.get( 'ContextualBalloon' ) ).to.equal( balloon );
		} );
	} );

	describe( 'constructor()', () => {
		it( 'should create a plugin instance with properties', () => {
			expect( balloon.view ).to.instanceof( BalloonPanelView );
		} );

		describe( 'positionLimiter', () => {
			let model, view, viewDocument, root;

			beforeEach( () => {
				model = editor.model;
				view = editor.editing.view;
				viewDocument = view.document;
				root = viewDocument.getRoot();
			} );

			it( 'obtains the root of the selection', () => {
				setModelData( model, '<paragraph>[]bar</paragraph>' );

				expect( balloon.positionLimiter() ).to.equal( view.domConverter.mapViewToDom( root ) );
			} );

			it( 'does not fail if selection has no #editableElement', () => {
				sinon.stub( viewDocument.selection, 'editableElement' ).value( null );

				expect( balloon.positionLimiter() ).to.equal( null );
			} );

			it( 'obtains the farthest root of the selection (nested editable)', () => {
				model.schema.register( 'widget', {
					allowIn: '$root',
					isObject: true
				} );
				model.schema.register( 'nestedEditable', { allowIn: 'widget' } );
				model.schema.extend( '$text', { allowIn: 'nestedEditable' } );

				editor.conversion.for( 'downcast' ).elementToElement( {
					model: 'widget',
					view: ( modelElement, { writer } ) => writer.createContainerElement( 'figure', { contenteditable: 'false' } )
				} );

				editor.conversion.for( 'downcast' ).elementToElement( {
					model: 'nestedEditable',
					view: ( modelElement, { writer } ) => writer.createContainerElement( 'figcaption', { contenteditable: 'true' } )
				} );

				setModelData( model, '<widget><nestedEditable>[]foo</nestedEditable></widget>' );

				expect( balloon.positionLimiter() ).to.equal( view.domConverter.mapViewToDom( root ) );
			} );
		} );

		it( 'should add balloon panel view to editor `body` collection', () => {
			expect( editor.ui.view.body.getIndex( balloon.view ) ).to.above( -1 );
		} );

		it( 'should register balloon panel element in editor.ui#focusTracker', () => {
			editor.ui.focusTracker.isFocused = false;

			balloon.add( {
				view: viewB,
				position: {
					target: 'fake',
					limiter: balloon.positionLimiter
				}
			} );

			balloon.view.element.dispatchEvent( new Event( 'focus' ) );

			expect( editor.ui.focusTracker.isFocused ).to.true;
		} );
	} );

	describe( 'hasView()', () => {
		it( 'should return true when given view is in stack', () => {
			expect( balloon.hasView( viewA ) ).to.true;
		} );

		it( 'should return true when given view is in stack but is not visible', () => {
			balloon.add( {
				view: viewB,
				position: {
					target: 'fake',
					limiter: balloon.positionLimiter
				}
			} );

			expect( balloon.visibleView ).to.equal( viewB );
			expect( balloon.hasView( viewA ) ).to.true;
		} );

		it( 'should return false when given view is not in stack', () => {
			expect( balloon.hasView( viewB ) ).to.false;
		} );
	} );

	describe( 'add()', () => {
		it( 'should add view to the `main` stack and display in balloon attached using given position options', () => {
			const content = balloon.view.content.get( 0 ).content;

			expect( content.length ).to.equal( 1 );
			expect( content.get( 0 ) ).to.deep.equal( viewA );
			expect( balloon.view.pin.calledOnce ).to.true;
			sinon.assert.calledWithMatch( balloon.view.pin.firstCall, {
				target: 'fake',
				limiter: balloon.positionLimiter
			} );
		} );

		it( 'should add view to the custom stack but not display it when other stack is already visible', () => {
			balloon.add( {
				view: viewB,
				stackId: 'second',
				position: {
					target: 'fake'
				}
			} );

			balloon.add( {
				view: viewC,
				stackId: 'second',
				position: {
					target: 'fake'
				}
			} );

			const content = balloon.view.content.get( 0 ).content;

			expect( content.length ).to.equal( 1 );
			expect( content.get( 0 ) ).to.deep.equal( viewA );
			expect( balloon.hasView( viewB ) );
			expect( balloon.hasView( viewC ) );
		} );

		it( 'should add multiple views to he stack and display last one', () => {
			balloon.add( {
				view: viewB,
				position: {
					target: 'fake',
					limiter: balloon.positionLimiter
				}
			} );

			const content = balloon.view.content.get( 0 ).content;

			expect( content.length ).to.equal( 1 );
			expect( content.get( 0 ) ).to.deep.equal( viewB );
		} );

		it( 'should throw an error when try to add the same view more than once', () => {
			expectToThrowCKEditorError( () => {
				balloon.add( {
					view: viewA,
					position: {
						target: 'fake',
						limiter: balloon.positionLimiter
					}
				} );
			}, /^contextualballoon-add-view-exist/, editor );
		} );

		it( 'should use a provided limiter instead of #positionLimiter', () => {
			balloon.remove( viewA );
			balloon.view.pin.resetHistory();

			balloon.add( {
				view: viewB,
				position: {
					target: 'foo',
					limiter: 'customLimiter'
				}
			} );

			sinon.assert.calledWithMatch( balloon.view.pin, {
				target: 'foo',
				limiter: 'customLimiter'
			} );
		} );

		it( 'should use a custom #positionLimiter', () => {
			balloon.remove( viewA );
			balloon.view.pin.resetHistory();
			balloon.positionLimiter = 'customLimiter';

			balloon.add( {
				view: viewB,
				position: {
					target: 'foo'
				}
			} );

			sinon.assert.calledWithMatch( balloon.view.pin, {
				target: 'foo',
				limiter: 'customLimiter'
			} );
		} );

		it( 'should not alter the view data if no limiter is provided and the #positionLimiter is used', () => {
			const data = {
				view: viewB,
				position: {
					target: 'foo'
				}
			};

			balloon.remove( viewA );
			balloon.add( data );

			expect( data ).to.deep.equal( {
				view: viewB,
				position: {
					target: 'foo'
				}
			} );
		} );

		it( 'should pin balloon to the target element', () => {
			sinon.assert.calledOnce( balloon.view.pin );
		} );

		it( 'should use the position of the last view in the stack', () => {
			balloon.add( {
				view: viewB,
				position: { target: 'other' }
			} );

			expect( balloon.view.pin.calledTwice ).to.true;

			sinon.assert.calledWithMatch( balloon.view.pin.firstCall, {
				target: 'fake',
				limiter: balloon.positionLimiter
			} );

			sinon.assert.calledWithMatch( balloon.view.pin.secondCall, {
				target: 'other',
				limiter: balloon.positionLimiter
			} );
		} );

		it( 'should set additional css class of visible view to BalloonPanelView', () => {
			const view = new View();

			balloon.add( {
				view,
				position: {
					target: 'fake',
					limiter: balloon.positionLimiter
				},
				balloonClassName: 'foo'
			} );

			expect( balloon.view.class ).to.equal( 'foo' );

			balloon.add( {
				view: viewB,
				position: {
					target: 'fake',
					limiter: balloon.positionLimiter
				},
				balloonClassName: 'bar'
			} );

			expect( balloon.view.class ).to.equal( 'bar' );
		} );

		it( 'should hide arrow if `withArrow` option is set to false', () => {
			balloon.remove( viewA );
			balloon.view.pin.resetHistory();

			balloon.add( {
				view: viewB,
				position: {
					target: 'foo'
				},
				withArrow: false
			} );

			expect( balloon.view.withArrow ).to.be.false;
		} );

		it( 'should show arrow if `withArrow` option was not set and previously shown view had hidden arrow', () => {
			balloon.remove( viewA );
			balloon.view.pin.resetHistory();

			balloon.add( {
				view: viewB,
				position: {
					target: 'foo'
				},
				withArrow: false
			} );

			expect( balloon.view.withArrow ).to.be.false;

			balloon.remove( viewB );

			balloon.add( {
				view: viewB,
				position: {
					target: 'foo'
				}
			} );

			expect( balloon.view.withArrow ).to.be.true;
		} );
	} );

	describe( 'visibleView', () => {
		it( 'should return data of currently visible view', () => {
			expect( balloon.visibleView ).to.equal( viewA );
		} );

		it( 'should return data of currently visible view when there is more than one in the stack', () => {
			balloon.add( {
				view: viewB,
				position: {
					target: 'fake',
					limiter: balloon.positionLimiter
				}
			} );

			expect( balloon.visibleView ).to.equal( viewB );
		} );

		it( 'should return `null` when the stack is empty', () => {
			balloon.remove( viewA );
			expect( balloon.visibleView ).to.null;
		} );

		it( 'should be observable', () => {
			const spy = sinon.spy();

			balloon.on( 'change:visibleView', spy );

			balloon.add( { view: viewB } );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWith( spy, sinon.match.any, 'visibleView', viewB, viewA );
		} );
	} );

	describe( 'showStack()', () => {
		it( 'should hide current view and display last view from the given stack', () => {
			balloon.add( {
				stackId: 'second',
				view: viewB
			} );

			balloon.add( {
				stackId: 'second',
				view: viewC
			} );

			expect( balloon.visibleView ).to.equal( viewA );

			balloon.showStack( 'second' );

			expect( balloon.visibleView ).to.equal( viewC );

			balloon.showStack( 'main' );

			expect( balloon.visibleView ).to.equal( viewA );
		} );

		it( 'should do nothing when given stack is already visible', () => {
			expect( () => {
				balloon.showStack( 'main' );
			} ).to.not.throw();
		} );

		it( 'should throw an error when there is no stack of given id', () => {
			expectToThrowCKEditorError( () => {
				balloon.showStack( 'second' );
			}, /^contextualballoon-showstack-stack-not-exist/, editor );
		} );
	} );

	describe( 'remove()', () => {
		it( 'should remove given view and hide balloon when there is no other view to display', () => {
			balloon.view.isVisible = true;

			balloon.remove( viewA );

			expect( balloon.visibleView ).to.null;
			expect( balloon.view.isVisible ).to.false;
		} );

		it( 'should remove given view from not displayed stack', () => {
			balloon.add( {
				stackId: 'second',
				view: viewB
			} );

			balloon.add( {
				stackId: 'second',
				view: viewC
			} );

			balloon.remove( viewB );

			expect( balloon.visibleView ).to.equal( viewA );
			expect( () => {
				balloon.showStack( 'second' );
			} ).to.not.throw();
		} );

		it( 'should remove not displayed stack if a removed view was the only view in this stack', () => {
			balloon.add( {
				stackId: 'second',
				view: viewB
			} );

			balloon.remove( viewB );

			expect( balloon.visibleView ).to.equal( viewA );
			expectToThrowCKEditorError( () => {
				balloon.showStack( 'second' );
			}, /^contextualballoon-showstack-stack-not-exist/, editor );
		} );

		it( 'should switch stack to the next one when removed view was the last one in the visible stack', () => {
			balloon.add( {
				stackId: 'second',
				view: viewB
			} );

			balloon.remove( viewA );

			expect( balloon.visibleView ).to.equal( viewB );
			expectToThrowCKEditorError( () => {
				balloon.showStack( 'main' );
			}, /^contextualballoon-showstack-stack-not-exist/, editor );
		} );

		it( 'should remove given view and set preceding in the stack as visible when removed view was visible', () => {
			balloon.add( {
				view: viewB,
				position: {
					target: 'fake',
					limiter: balloon.positionLimiter
				}
			} );

			balloon.remove( viewB );

			expect( balloon.visibleView ).to.equal( viewA );
		} );

		it( 'should remove given view from the stack when view is not visible', () => {
			balloon.add( {
				view: viewB,
				position: {
					target: 'fake',
					limiter: balloon.positionLimiter
				}
			} );

			balloon.remove( viewA );

			expect( balloon.visibleView ).to.equal( viewB );
		} );

		it( 'should remove given view from a not currently visible stack', () => {
			balloon.add( {
				view: viewB,
				stackId: 'second',
				position: {
					target: 'fake'
				}
			} );

			balloon.add( {
				view: viewC,
				stackId: 'second',
				position: {
					target: 'fake'
				}
			} );

			balloon.remove( viewB );

			expect( balloon.hasView( viewB ) ).to.false;
			expect( balloon.hasView( viewC ) ).to.true;

			// Does not throw, so the stack is there.
			expect( () => {
				balloon.showStack( 'second' );
			} ).to.not.throw();
		} );

		it( 'should remove not displayed stack when removied view was the last one in the stack', () => {
			balloon.add( {
				view: viewB,
				stackId: 'second',
				position: {
					target: 'fake'
				}
			} );

			balloon.remove( viewB );

			expect( balloon.hasView( viewB ) ).to.false;

			// Does throw, so the stack is not there.
			expectToThrowCKEditorError( () => {
				balloon.showStack( 'second' );
			}, /^contextualballoon-showstack-stack-not-exist/, editor );
		} );

		it( 'should throw an error when there is no given view in the stack', () => {
			expectToThrowCKEditorError( () => {
				balloon.remove( viewB );
			}, /^contextualballoon-remove-view-not-exist/, editor );
		} );

		it( 'should set additional css class of visible view to BalloonPanelView', () => {
			const view = new View();

			balloon.add( {
				view,
				position: {
					target: 'fake',
					limiter: balloon.positionLimiter
				},
				balloonClassName: 'foo'
			} );

			balloon.add( {
				view: viewB,
				position: {
					target: 'fake',
					limiter: balloon.positionLimiter
				},
				balloonClassName: 'bar'
			} );

			balloon.remove( viewB );

			expect( balloon.view.class ).to.equal( 'foo' );
		} );
	} );

	describe( 'updatePosition()', () => {
		it( 'should attach balloon to the target using position option from the last view in the stack', () => {
			balloon.add( {
				view: viewB,
				position: {
					target: 'other'
				}
			} );

			balloon.view.pin.resetHistory();

			balloon.updatePosition();

			expect( balloon.view.pin.calledOnce );
			sinon.assert.calledWithMatch( balloon.view.pin.firstCall, {
				target: 'other',
				limiter: balloon.positionLimiter
			} );
		} );

		it( 'should set given position to the currently visible view and use position from the first view in the stack #1', () => {
			balloon.view.pin.resetHistory();

			balloon.updatePosition( { target: 'new' } );

			expect( balloon.view.pin.calledOnce );
			sinon.assert.calledWithMatch( balloon.view.pin.firstCall, {
				target: 'new',
				limiter: balloon.positionLimiter
			} );
		} );

		it( 'should set given position to the currently visible view and use position from the first view in the stack #2', () => {
			balloon.add( {
				view: viewB,
				position: {
					target: 'other'
				}
			} );

			balloon.view.pin.resetHistory();

			balloon.updatePosition( { target: 'new' } );

			expect( balloon.view.pin.calledOnce );
			sinon.assert.calledWithMatch( balloon.view.pin.firstCall, {
				target: 'new',
				limiter: balloon.positionLimiter
			} );

			balloon.remove( viewA );

			balloon.updatePosition();

			expect( balloon.view.pin.calledTwice );
			sinon.assert.calledWithMatch( balloon.view.pin.secondCall, {
				target: 'new',
				limiter: balloon.positionLimiter
			} );
		} );

		it( 'should use a given position limiter instead of the default one', () => {
			balloon.view.pin.resetHistory();

			balloon.updatePosition( {
				target: 'new',
				limiter: 'customLimiter'
			} );

			expect( balloon.view.pin.calledOnce );
			sinon.assert.calledWithMatch( balloon.view.pin.firstCall, {
				target: 'new',
				limiter: 'customLimiter'
			} );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/10597
		it( 'should respect viewportOffset#top config and allow to set it in runtime', () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
					plugins: [ Paragraph, ContextualBalloon ],
					ui: {
						viewportOffset: {
							top: 100
						}
					}
				} )
				.then( newEditor => {
					balloon = newEditor.plugins.get( ContextualBalloon );
					sinon.stub( balloon.view, 'pin' ).returns( {} );

					viewA = new View();
					viewB = new View();

					balloon.add( {
						view: viewA,
						position: {
							target: 'fake'
						}
					} );

					expect( balloon.view.pin.calledOnce );
					expect( balloon.view.pin.firstCall.args[ 0 ].viewportOffsetConfig.top ).to.equal( 100 );

					newEditor.ui.viewportOffset = { top: 200 };

					balloon.add( {
						view: viewB,
						position: {
							target: 'fake'
						}
					} );

					expect( balloon.view.pin.calledTwice );
					expect( balloon.view.pin.secondCall.args[ 0 ].viewportOffsetConfig.top ).to.equal( 200 );

					newEditor.destroy();
					editorElement.remove();
				} );
		} );

		it( 'should throw an error when there is no given view in the stack', () => {
			expectToThrowCKEditorError( () => {
				balloon.remove( viewB );
			}, /^contextualballoon-remove-view-not-exist/, editor );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'can be called multiple times', () => {
			expect( () => {
				balloon.destroy();
				balloon.destroy();
			} );
		} );

		it( 'should not touch the DOM', () => {
			balloon.destroy();

			expect( editor.ui.view.body.getIndex( balloon.view ) ).to.not.equal( -1 );
		} );

		it( 'should destroy the #view', () => {
			const destroySpy = sinon.spy( balloon.view, 'destroy' );

			balloon.destroy();

			sinon.assert.called( destroySpy );
		} );

		it( 'should destroy the #_rotatorView', () => {
			const destroySpy = sinon.spy( balloon._rotatorView, 'destroy' );

			balloon.destroy();

			sinon.assert.called( destroySpy );
		} );

		it( 'should destroy the #_fakePanelsView', () => {
			const destroySpy = sinon.spy( balloon._rotatorView, 'destroy' );

			balloon.destroy();

			sinon.assert.called( destroySpy );
		} );
	} );

	describe( 'rotator view', () => {
		let rotatorView;

		beforeEach( () => {
			rotatorView = balloon.view.content.get( 0 );
		} );

		it( 'should display navigation when there is more than one stack', () => {
			const navigationElement = rotatorView.element.querySelector( '.ck-balloon-rotator__navigation' );

			expect( navigationElement.classList.contains( 'ck-hidden' ) ).to.equal( true );

			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			expect( navigationElement.classList.contains( 'ck-hidden' ) ).to.equal( false );
		} );

		it( 'should display counter', () => {
			const counterElement = rotatorView.element.querySelector( '.ck-balloon-rotator__counter' );

			expect( counterElement.textContent ).to.equal( '' );

			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			expect( counterElement.textContent ).to.equal( '1 of 2' );

			balloon.showStack( 'second' );

			expect( counterElement.textContent ).to.equal( '2 of 2' );
		} );

		it( 'should switch stack to the next one after clicking next button', () => {
			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			balloon.add( {
				view: viewC,
				stackId: 'third'
			} );

			expect( balloon.visibleView ).to.equal( viewA );

			rotatorView.buttonNextView.fire( 'execute' );

			expect( balloon.visibleView ).to.equal( viewB );

			rotatorView.buttonNextView.fire( 'execute' );

			expect( balloon.visibleView ).to.equal( viewC );

			rotatorView.buttonNextView.fire( 'execute' );

			expect( balloon.visibleView ).to.equal( viewA );
		} );

		it( 'should not move focus to the editable when switching not focused view to the next one', () => {
			const editableFocusSpy = sinon.spy( editor.editing.view, 'focus' );

			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			rotatorView.buttonNextView.fire( 'execute' );

			sinon.assert.notCalled( editableFocusSpy );
		} );

		it( 'should move focus to the editable when switching focused view to the next one', () => {
			const editableFocusSpy = sinon.spy( editor.editing.view, 'focus' );

			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			rotatorView.focusTracker.isFocused = true;

			rotatorView.buttonNextView.fire( 'execute' );

			sinon.assert.calledOnce( editableFocusSpy );
		} );

		it( 'should switch stack to the prev one after clicking prev button', () => {
			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			balloon.add( {
				view: viewC,
				stackId: 'third'
			} );

			expect( balloon.visibleView ).to.equal( viewA );

			rotatorView.buttonPrevView.fire( 'execute' );

			expect( balloon.visibleView ).to.equal( viewC );

			rotatorView.buttonPrevView.fire( 'execute' );

			expect( balloon.visibleView ).to.equal( viewB );

			rotatorView.buttonPrevView.fire( 'execute' );

			expect( balloon.visibleView ).to.equal( viewA );
		} );

		it( 'should not move focus to the editable when switching not focused view to the prev one', () => {
			const editableFocusSpy = sinon.spy( editor.editing.view, 'focus' );

			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			rotatorView.buttonPrevView.fire( 'execute' );

			sinon.assert.notCalled( editableFocusSpy );
		} );

		it( 'should move focus to the editable when switching focused view to the prev one', () => {
			const editableFocusSpy = sinon.spy( editor.editing.view, 'focus' );

			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			rotatorView.focusTracker.isFocused = true;

			rotatorView.buttonPrevView.fire( 'execute' );

			sinon.assert.calledOnce( editableFocusSpy );
		} );

		it( 'should add hidden view with fake panels to editor body collection', () => {
			const fakePanelsView = editor.ui.view.body.last;

			expect( fakePanelsView.element.classList.contains( 'ck-fake-panel' ) ).to.equal( true );
			expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).to.equal( true );
			expect( fakePanelsView.element.childElementCount ).to.equal( 0 );
		} );

		it( 'should show fake panels when more than one stack is added to the balloon (max to 2 panels)', () => {
			const fakePanelsView = editor.ui.view.body.last;
			const viewD = new View();

			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).to.equal( false );
			expect( fakePanelsView.element.childElementCount ).to.equal( 1 );

			balloon.add( {
				view: viewC,
				stackId: 'third'
			} );

			expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).to.equal( false );
			expect( fakePanelsView.element.childElementCount ).to.equal( 2 );

			balloon.add( {
				view: viewD,
				stackId: 'fourth'
			} );

			expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).to.equal( false );
			expect( fakePanelsView.element.childElementCount ).to.equal( 2 );

			balloon.remove( viewD );

			expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).to.equal( false );
			expect( fakePanelsView.element.childElementCount ).to.equal( 2 );

			balloon.remove( viewC );

			expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).to.equal( false );
			expect( fakePanelsView.element.childElementCount ).to.equal( 1 );

			balloon.remove( viewB );

			expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).to.equal( true );
			expect( fakePanelsView.element.childElementCount ).to.equal( 0 );
		} );

		it( 'should keep position of fake panels up to date with balloon position when panels are visible', () => {
			const fakePanelsView = editor.ui.view.body.last;

			let width = 30;
			let height = 40;

			balloon.view.top = 10;
			balloon.view.left = 20;

			sinon.stub( balloon.view.element, 'getBoundingClientRect' ).callsFake( () => ( { width, height } ) );

			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			expect( fakePanelsView.element.style.top ).to.equal( '10px' );
			expect( fakePanelsView.element.style.left ).to.equal( '20px' );
			expect( fakePanelsView.element.style.width ).to.equal( '30px' );
			expect( fakePanelsView.element.style.height ).to.equal( '40px' );

			balloon.view.top = 15;
			balloon.view.left = 25;
			width = 35;
			height = 45;

			balloon.add( {
				view: viewC,
				stackId: 'third'
			} );

			expect( fakePanelsView.element.style.top ).to.equal( '15px' );
			expect( fakePanelsView.element.style.left ).to.equal( '25px' );
			expect( fakePanelsView.element.style.width ).to.equal( '35px' );
			expect( fakePanelsView.element.style.height ).to.equal( '45px' );

			balloon.view.top = 10;
			balloon.view.left = 20;
			width = 30;
			height = 40;

			balloon.updatePosition();

			expect( fakePanelsView.element.style.top ).to.equal( '10px' );
			expect( fakePanelsView.element.style.left ).to.equal( '20px' );
			expect( fakePanelsView.element.style.width ).to.equal( '30px' );
			expect( fakePanelsView.element.style.height ).to.equal( '40px' );

			// Hide fake panels by removing additional stacks.
			balloon.remove( viewC );
			balloon.remove( viewB );

			balloon.view.top = 15;
			balloon.view.left = 25;
			width = 35;
			height = 45;

			balloon.updatePosition();

			// Old values because fake panels are hidden.
			expect( fakePanelsView.element.style.top ).to.equal( '10px' );
			expect( fakePanelsView.element.style.left ).to.equal( '20px' );
			expect( fakePanelsView.element.style.width ).to.equal( '30px' );
			expect( fakePanelsView.element.style.height ).to.equal( '40px' );
		} );

		it( 'should translate the views', () => {
			// Cleanup the editor created by contextual balloon suite beforeEach.
			return editor.destroy()
				.then( () => {
					editorElement.remove();

					// Setup localized editor for language tests.
					editorElement = document.createElement( 'div' );
					document.body.appendChild( editorElement );

					return ClassicTestEditor
						.create( editorElement, {
							plugins: [ Paragraph, ContextualBalloon ],
							language: 'pl'
						} );
				} )
				.then( newEditor => {
					editor = newEditor;

					balloon = editor.plugins.get( ContextualBalloon );
					// We don't need to execute BalloonPanel pin and attachTo methods
					// it's enough to check if was called with the proper data.
					sinon.stub( balloon.view, 'attachTo' ).returns( {} );
					sinon.stub( balloon.view, 'pin' ).returns( {} );

					balloon.add( {
						view: new View()
					} );

					balloon.add( {
						view: new View(),
						stackId: 'second'
					} );

					const rotatorView = balloon.view.content.get( 0 );
					const counterElement = rotatorView.element.querySelector( '.ck-balloon-rotator__counter' );

					expect( counterElement.textContent ).to.equal( '1 z 2' );
					expect( rotatorView.buttonPrevView.labelView.element.textContent ).to.equal( 'Poprzedni' );
					expect( rotatorView.buttonNextView.labelView.element.textContent ).to.equal( 'Następny' );
				} );
		} );

		describe( 'destroy()', () => {
			it( 'should destroy the FocusTracker instance', () => {
				const destroySpy = sinon.spy( rotatorView.focusTracker, 'destroy' );

				rotatorView.destroy();

				sinon.assert.calledOnce( destroySpy );
			} );
		} );

		describe( 'singleViewMode', () => {
			it( 'should not display navigation when there is more than one stack', () => {
				const navigationElement = rotatorView.element.querySelector( '.ck-balloon-rotator__navigation' );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).to.be.true;

				balloon.add( {
					view: viewB,
					stackId: 'second',
					singleViewMode: true
				} );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).to.be.true;
			} );

			it( 'should hide display navigation after adding view', () => {
				const navigationElement = rotatorView.element.querySelector( '.ck-balloon-rotator__navigation' );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).to.be.true;

				balloon.add( {
					view: viewB,
					stackId: 'second'
				} );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).to.be.false;

				balloon.add( {
					view: viewC,
					stackId: 'third',
					singleViewMode: true
				} );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).to.be.true;
			} );

			it( 'should display navigation after removing a view', () => {
				const navigationElement = rotatorView.element.querySelector( '.ck-balloon-rotator__navigation' );

				balloon.add( {
					view: viewB,
					stackId: 'second'
				} );

				balloon.add( {
					view: viewC,
					stackId: 'third',
					singleViewMode: true
				} );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).to.be.true;

				balloon.remove( viewC );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).to.be.false;
			} );

			it( 'should not display navigation after removing a view if there is still some view with singleViewMode', () => {
				const navigationElement = rotatorView.element.querySelector( '.ck-balloon-rotator__navigation' );

				balloon.add( {
					view: viewB,
					stackId: 'second'
				} );

				balloon.add( {
					view: viewC,
					stackId: 'third',
					singleViewMode: true
				} );

				balloon.add( {
					view: viewD,
					stackId: 'third',
					singleViewMode: true
				} );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).to.be.true;

				balloon.remove( viewD );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).to.be.true;

				balloon.remove( viewC );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).to.be.false;
			} );

			it( 'should not show fake panels when more than one stack is added to the balloon (max to 2 panels)', () => {
				const fakePanelsView = editor.ui.view.body.last;

				balloon.add( {
					view: viewB,
					stackId: 'second'
				} );

				expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).to.equal( false );
				expect( fakePanelsView.element.childElementCount ).to.equal( 1 );

				balloon.add( {
					view: viewC,
					stackId: 'third',
					singleViewMode: true
				} );

				expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).to.be.true;
				expect( fakePanelsView.element.childElementCount ).to.equal( 0 );

				balloon.remove( viewC );

				expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).to.equal( false );
				expect( fakePanelsView.element.childElementCount ).to.equal( 1 );

				balloon.remove( viewB );
			} );

			it( 'should switch visible view when adding a view to new stack', () => {
				const navigationElement = rotatorView.element.querySelector( '.ck-balloon-rotator__navigation' );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).to.be.true;

				balloon.add( {
					view: viewB,
					stackId: 'second'
				} );

				expect( balloon.visibleView ).to.equal( viewA );

				balloon.add( {
					view: viewC,
					stackId: 'third',
					singleViewMode: true
				} );

				expect( balloon.visibleView ).to.equal( viewC );

				const viewD = new View();

				balloon.add( {
					view: viewD,
					stackId: 'fifth',
					singleViewMode: true
				} );

				expect( balloon.visibleView ).to.equal( viewD );
			} );

			it( 'should switch visible view when adding a view to the same stack', () => {
				const navigationElement = rotatorView.element.querySelector( '.ck-balloon-rotator__navigation' );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).to.be.true;

				balloon.add( {
					view: viewB,
					stackId: 'second'
				} );

				expect( balloon.visibleView ).to.equal( viewA );

				balloon.add( {
					view: viewC,
					stackId: 'third',
					singleViewMode: true
				} );

				expect( balloon.visibleView ).to.equal( viewC );

				const viewD = new View();

				balloon.add( {
					view: viewD,
					stackId: 'third',
					singleViewMode: true
				} );

				expect( balloon.visibleView ).to.equal( viewD );
			} );
		} );
	} );
} );
