/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { ContextualBalloon } from '../../../src/panel/balloon/contextualballoon.js';
import { BalloonPanelView } from '../../../src/panel/balloon/balloonpanelview.js';
import { View } from '../../../src/view.js';

import { Plugin } from '@ckeditor/ckeditor5-core';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData } from '@ckeditor/ckeditor5-engine';
import { add as addTranslations, _clearTranslations } from '@ckeditor/ckeditor5-utils';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'ContextualBalloon', () => {
	let editor, editorElement, balloon, viewA, viewB, viewC, viewD;

	beforeAll( () => {
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

	afterAll( () => {
		_clearTranslations();
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

				viewA = new View();
				viewB = new View();
				viewC = new View();
				viewD = new View();

				viewB.render();
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
		editorElement.remove();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ContextualBalloon.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ContextualBalloon.isPremiumPlugin ).toBe( false );
	} );

	it( 'should create a plugin instance', () => {
		expect( balloon ).toBeInstanceOf( Plugin );
		expect( balloon ).toBeInstanceOf( ContextualBalloon );
	} );

	describe( 'pluginName', () => {
		it( 'should return plugin by name', () => {
			expect( editor.plugins.get( 'ContextualBalloon' ) ).toBe( balloon );
		} );
	} );

	describe( 'constructor()', () => {
		beforeEach( () => {
			stubBalloonPanelView();
		} );

		it( 'should create a plugin instance with properties', () => {
			expect( balloon.view ).toBeInstanceOf( BalloonPanelView );
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
				_setModelData( model, '<paragraph>[]bar</paragraph>' );

				expect( balloon.positionLimiter() ).toBe( view.domConverter.mapViewToDom( root ) );
			} );

			it( 'does not fail if selection has no #editableElement', () => {
				vi.spyOn( viewDocument.selection, 'editableElement', 'get' ).mockReturnValue( null );

				expect( balloon.positionLimiter() ).toBe( null );
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

				_setModelData( model, '<widget><nestedEditable>[]foo</nestedEditable></widget>' );

				expect( balloon.positionLimiter() ).toBe( view.domConverter.mapViewToDom( root ) );
			} );
		} );

		it( 'should add balloon panel view to editor `body` collection', () => {
			expect( editor.ui.view.body.getIndex( balloon.view ) ).toBeGreaterThan( -1 );
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

			expect( editor.ui.focusTracker.isFocused ).toBe( true );
		} );
	} );

	describe( 'lazy init', () => {
		it( 'should create BalloonPanelView on first access to #view', () => {
			const spy = vi.spyOn( balloon, '_createPanelView' );

			expect( balloon._view ).toBeNull();
			expect( spy ).not.toHaveBeenCalled();

			expect( balloon.view ).toBeInstanceOf( BalloonPanelView );
			expect( spy ).toHaveBeenCalledOnce();
			expect( editor.ui.view.body.has( balloon._view ) ).toBe( true );
		} );

		it( 'should create BalloonPanelView on first view added', () => {
			const spy = vi.spyOn( balloon, '_createPanelView' );

			expect( balloon._view ).toBeNull();
			expect( spy ).not.toHaveBeenCalled();

			balloon.add( {
				view: viewA,
				position: {
					target: 'fake'
				}
			} );

			expect( balloon._view ).toBeInstanceOf( BalloonPanelView );
			expect( spy ).toHaveBeenCalledOnce();
			expect( editor.ui.view.body.has( balloon._view ) ).toBe( true );
		} );
	} );

	describe( 'hasView()', () => {
		beforeEach( () => {
			stubBalloonPanelView();
		} );

		it( 'should return true when given view is in stack', () => {
			expect( balloon.hasView( viewA ) ).toBe( true );
		} );

		it( 'should return true when given view is in stack but is not visible', () => {
			balloon.add( {
				view: viewB,
				position: {
					target: 'fake',
					limiter: balloon.positionLimiter
				}
			} );

			expect( balloon.visibleView ).toBe( viewB );
			expect( balloon.hasView( viewA ) ).toBe( true );
		} );

		it( 'should return false when given view is not in stack', () => {
			expect( balloon.hasView( viewB ) ).toBe( false );
		} );
	} );

	describe( 'getPositionOptions()', () => {
		beforeEach( () => {
			vi.spyOn( balloon.view, 'attachTo' ).mockReturnValue( {} );
			vi.spyOn( balloon.view, 'pin' ).mockReturnValue( {} );
		} );

		it( 'should return undefined if last element from visible stack has no position', () => {
			balloon.add( {
				view: viewA
			} );

			expect( balloon.getPositionOptions() ).toBeUndefined();
		} );

		it( 'should return position of the last visible stack element', () => {
			balloon.add( {
				view: viewA,
				position: {
					target: 'fake'
				}
			} );

			expect( balloon.getPositionOptions() ).toEqual( {
				limiter: balloon.positionLimiter,
				target: 'fake',
				viewportOffsetConfig: {
					top: 0,
					visualTop: 0
				}
			} );
		} );

		it( 'should attach limiter to the position of element from the last visible stack if it\'s not present', () => {
			balloon.add( {
				view: viewA,
				position: {
					target: 'blank'
				}
			} );

			expect( balloon.getPositionOptions().limiter ).toBe( balloon.positionLimiter );
		} );

		it( 'should attach viewportOffsetConfig to the position of element from the last visible stack if it\'s not present', () => {
			balloon.add( {
				view: viewA,
				position: {
					target: 'blank'
				}
			} );

			expect( balloon.getPositionOptions().viewportOffsetConfig ).toEqual( editor.ui.viewportOffset );
		} );

		it( 'should re-map viewportOffsetConfig so visualTop is used instead of top', () => {
			vi.spyOn( editor.ui.viewportOffset, 'top', 'get' ).mockReturnValue( 70 );
			vi.spyOn( editor.ui.viewportOffset, 'visualTop', 'get' ).mockReturnValue( 40 );

			balloon.add( {
				view: viewA,
				position: {
					target: 'blank'
				}
			} );

			expect( balloon.getPositionOptions().viewportOffsetConfig.top ).toBe( 40 );
		} );
	} );

	describe( 'add()', () => {
		beforeEach( () => {
			stubBalloonPanelView();
		} );

		it( 'should add view to the `main` stack and display in balloon attached using given position options', () => {
			const content = balloon.view.content.get( 0 ).content;

			expect( content.length ).toBe( 1 );
			expect( content.get( 0 ) ).toEqual( viewA );
			expect( balloon.view.pin.mock.calls.length ).toBe( 1 );
			expect( balloon.view.pin ).toHaveBeenCalledWith( expect.objectContaining( {
				target: 'fake',
				limiter: balloon.positionLimiter
			} ) );
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

			expect( content.length ).toBe( 1 );
			expect( content.get( 0 ) ).toEqual( viewA );
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

			expect( content.length ).toBe( 1 );
			expect( content.get( 0 ) ).toEqual( viewB );
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
			balloon.view.pin.mockClear();

			balloon.add( {
				view: viewB,
				position: {
					target: 'foo',
					limiter: 'customLimiter'
				}
			} );

			expect( balloon.view.pin ).toHaveBeenCalledWith( expect.objectContaining( {
				target: 'foo',
				limiter: 'customLimiter'
			} ) );
		} );

		it( 'should use a custom #positionLimiter', () => {
			balloon.remove( viewA );
			balloon.view.pin.mockClear();
			balloon.positionLimiter = 'customLimiter';

			balloon.add( {
				view: viewB,
				position: {
					target: 'foo'
				}
			} );

			expect( balloon.view.pin ).toHaveBeenCalledWith( expect.objectContaining( {
				target: 'foo',
				limiter: 'customLimiter'
			} ) );
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

			expect( data ).toEqual( {
				view: viewB,
				position: {
					target: 'foo'
				}
			} );
		} );

		it( 'should pin balloon to the target element', () => {
			expect( balloon.view.pin ).toHaveBeenCalledOnce();
		} );

		it( 'should use the position of the last view in the stack', () => {
			balloon.add( {
				view: viewB,
				position: { target: 'other' }
			} );

			expect( balloon.view.pin.mock.calls.length ).toBe( 2 );

			expect( balloon.view.pin ).toHaveBeenNthCalledWith( 1, expect.objectContaining( {
				target: 'fake',
				limiter: balloon.positionLimiter
			} ) );

			expect( balloon.view.pin ).toHaveBeenNthCalledWith( 2, expect.objectContaining( {
				target: 'other',
				limiter: balloon.positionLimiter
			} ) );
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

			expect( balloon.view.class ).toBe( 'foo' );

			balloon.add( {
				view: viewB,
				position: {
					target: 'fake',
					limiter: balloon.positionLimiter
				},
				balloonClassName: 'bar'
			} );

			expect( balloon.view.class ).toBe( 'bar' );
		} );

		it( 'should hide arrow if `withArrow` option is set to false', () => {
			balloon.remove( viewA );
			balloon.view.pin.mockClear();

			balloon.add( {
				view: viewB,
				position: {
					target: 'foo'
				},
				withArrow: false
			} );

			expect( balloon.view.withArrow ).toBe( false );
		} );

		it( 'should show arrow if `withArrow` option was not set and previously shown view had hidden arrow', () => {
			balloon.remove( viewA );
			balloon.view.pin.mockClear();

			balloon.add( {
				view: viewB,
				position: {
					target: 'foo'
				},
				withArrow: false
			} );

			expect( balloon.view.withArrow ).toBe( false );

			balloon.remove( viewB );

			balloon.add( {
				view: viewB,
				position: {
					target: 'foo'
				}
			} );

			expect( balloon.view.withArrow ).toBe( true );
		} );
	} );

	describe( 'visibleView', () => {
		beforeEach( () => {
			stubBalloonPanelView();
		} );

		it( 'should return data of currently visible view', () => {
			expect( balloon.visibleView ).toBe( viewA );
		} );

		it( 'should return data of currently visible view when there is more than one in the stack', () => {
			balloon.add( {
				view: viewB,
				position: {
					target: 'fake',
					limiter: balloon.positionLimiter
				}
			} );

			expect( balloon.visibleView ).toBe( viewB );
		} );

		it( 'should return `null` when the stack is empty', () => {
			balloon.remove( viewA );
			expect( balloon.visibleView ).toBeNull();
		} );

		it( 'should be observable', () => {
			const spy = vi.fn();

			balloon.on( 'change:visibleView', spy );

			balloon.add( { view: viewB } );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith( expect.anything(), 'visibleView', viewB, viewA );
		} );
	} );

	describe( 'showStack()', () => {
		beforeEach( () => {
			stubBalloonPanelView();
		} );

		it( 'should hide current view and display last view from the given stack', () => {
			balloon.add( {
				stackId: 'second',
				view: viewB
			} );

			balloon.add( {
				stackId: 'second',
				view: viewC
			} );

			expect( balloon.visibleView ).toBe( viewA );

			balloon.showStack( 'second' );

			expect( balloon.visibleView ).toBe( viewC );

			balloon.showStack( 'main' );

			expect( balloon.visibleView ).toBe( viewA );
		} );

		it( 'should do nothing when given stack is already visible', () => {
			expect( () => {
				balloon.showStack( 'main' );
			} ).not.toThrow();
		} );

		it( 'should throw an error when there is no stack of given id', () => {
			expectToThrowCKEditorError( () => {
				balloon.showStack( 'second' );
			}, /^contextualballoon-showstack-stack-not-exist/, editor );
		} );
	} );

	describe( 'remove()', () => {
		beforeEach( () => {
			stubBalloonPanelView();
		} );

		it( 'should remove given view and hide balloon when there is no other view to display', () => {
			balloon.view.isVisible = true;

			balloon.remove( viewA );

			expect( balloon.visibleView ).toBeNull();
			expect( balloon.view.isVisible ).toBe( false );
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

			expect( balloon.visibleView ).toBe( viewA );
			expect( () => {
				balloon.showStack( 'second' );
			} ).not.toThrow();
		} );

		it( 'should remove not displayed stack if a removed view was the only view in this stack', () => {
			balloon.add( {
				stackId: 'second',
				view: viewB
			} );

			balloon.remove( viewB );

			expect( balloon.visibleView ).toBe( viewA );
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

			expect( balloon.visibleView ).toBe( viewB );
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

			expect( balloon.visibleView ).toBe( viewA );
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

			expect( balloon.visibleView ).toBe( viewB );
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

			expect( balloon.hasView( viewB ) ).toBe( false );
			expect( balloon.hasView( viewC ) ).toBe( true );

			// Does not throw, so the stack is there.
			expect( () => {
				balloon.showStack( 'second' );
			} ).not.toThrow();
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

			expect( balloon.hasView( viewB ) ).toBe( false );

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

			expect( balloon.view.class ).toBe( 'foo' );
		} );
	} );

	describe( 'updatePosition()', () => {
		beforeEach( () => {
			stubBalloonPanelView();
		} );

		it( 'should attach balloon to the target using position option from the last view in the stack', () => {
			balloon.add( {
				view: viewB,
				position: {
					target: 'other'
				}
			} );

			balloon.view.pin.mockClear();

			balloon.updatePosition();

			expect( balloon.view.pin.mock.calls.length ).toBe( 1 );
			expect( balloon.view.pin ).toHaveBeenCalledWith( expect.objectContaining( {
				target: 'other',
				limiter: balloon.positionLimiter
			} ) );
		} );

		it( 'should set given position to the currently visible view and use position from the first view in the stack #1', () => {
			balloon.view.pin.mockClear();

			balloon.updatePosition( { target: 'new' } );

			expect( balloon.view.pin.mock.calls.length ).toBe( 1 );
			expect( balloon.view.pin ).toHaveBeenCalledWith( expect.objectContaining( {
				target: 'new',
				limiter: balloon.positionLimiter
			} ) );
		} );

		it( 'should set given position to the currently visible view and use position from the first view in the stack #2', () => {
			balloon.add( {
				view: viewB,
				position: {
					target: 'other'
				}
			} );

			balloon.view.pin.mockClear();

			balloon.updatePosition( { target: 'new' } );

			expect( balloon.view.pin.mock.calls.length ).toBe( 1 );
			expect( balloon.view.pin ).toHaveBeenNthCalledWith( 1, expect.objectContaining( {
				target: 'new',
				limiter: balloon.positionLimiter
			} ) );

			balloon.remove( viewA );

			balloon.updatePosition();

			expect( balloon.view.pin.mock.calls.length ).toBe( 2 );
			expect( balloon.view.pin ).toHaveBeenNthCalledWith( 2, expect.objectContaining( {
				target: 'new',
				limiter: balloon.positionLimiter
			} ) );
		} );

		it( 'should use a given position limiter instead of the default one', () => {
			balloon.view.pin.mockClear();

			balloon.updatePosition( {
				target: 'new',
				limiter: 'customLimiter'
			} );

			expect( balloon.view.pin.mock.calls.length ).toBe( 1 );
			expect( balloon.view.pin ).toHaveBeenCalledWith( expect.objectContaining( {
				target: 'new',
				limiter: 'customLimiter'
			} ) );
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
					vi.spyOn( balloon.view, 'pin' ).mockReturnValue( {} );

					viewA = new View();
					viewB = new View();

					balloon.add( {
						view: viewA,
						position: {
							target: 'fake'
						}
					} );

					expect( balloon.view.pin.mock.calls.length ).toBe( 1 );
					expect( balloon.view.pin.mock.calls[ 0 ][ 0 ].viewportOffsetConfig.top ).toBe( 100 );

					newEditor.ui.viewportOffset = { top: 200 };

					balloon.add( {
						view: viewB,
						position: {
							target: 'fake'
						}
					} );

					expect( balloon.view.pin.mock.calls.length ).toBe( 2 );
					expect( balloon.view.pin.mock.calls[ 1 ][ 0 ].viewportOffsetConfig.top ).toBe( 200 );

					editorElement.remove();
					return newEditor.destroy();
				} );
		} );

		it( 'should throw an error when there is no given view in the stack', () => {
			expectToThrowCKEditorError( () => {
				balloon.remove( viewB );
			}, /^contextualballoon-remove-view-not-exist/, editor );
		} );
	} );

	describe( 'destroy()', () => {
		beforeEach( () => {
			stubBalloonPanelView();
		} );

		it( 'can be called multiple times', () => {
			expect( () => {
				balloon.destroy();
				balloon.destroy();
			} );
		} );

		it( 'should not touch the DOM', () => {
			balloon.destroy();

			expect( editor.ui.view.body.getIndex( balloon.view ) ).not.toBe( -1 );
		} );

		it( 'should destroy the #view', () => {
			const destroySpy = vi.spyOn( balloon.view, 'destroy' );

			balloon.destroy();

			expect( destroySpy ).toHaveBeenCalled();
		} );

		it( 'should destroy the #_rotatorView', () => {
			const destroySpy = vi.spyOn( balloon._rotatorView, 'destroy' );

			balloon.destroy();

			expect( destroySpy ).toHaveBeenCalled();
		} );

		it( 'should destroy the #_fakePanelsView', () => {
			const destroySpy = vi.spyOn( balloon._rotatorView, 'destroy' );

			balloon.destroy();

			expect( destroySpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'rotator view', () => {
		let rotatorView;

		beforeEach( () => {
			stubBalloonPanelView();
			rotatorView = balloon.view.content.get( 0 );
		} );

		it( 'should display navigation when there is more than one stack', () => {
			const navigationElement = rotatorView.element.querySelector( '.ck-balloon-rotator__navigation' );

			expect( navigationElement.classList.contains( 'ck-hidden' ) ).toBe( true );

			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			expect( navigationElement.classList.contains( 'ck-hidden' ) ).toBe( false );
		} );

		it( 'should display counter', () => {
			const counterElement = rotatorView.element.querySelector( '.ck-balloon-rotator__counter' );

			expect( counterElement.textContent ).toBe( '' );

			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			expect( counterElement.textContent ).toBe( '1 of 2' );

			balloon.showStack( 'second' );

			expect( counterElement.textContent ).toBe( '2 of 2' );
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

			expect( balloon.visibleView ).toBe( viewA );

			rotatorView.buttonNextView.fire( 'execute' );

			expect( balloon.visibleView ).toBe( viewB );

			rotatorView.buttonNextView.fire( 'execute' );

			expect( balloon.visibleView ).toBe( viewC );

			rotatorView.buttonNextView.fire( 'execute' );

			expect( balloon.visibleView ).toBe( viewA );
		} );

		it( 'should not move focus to the editable when switching not focused view to the next one', () => {
			const editableFocusSpy = vi.spyOn( editor.editing.view, 'focus' );

			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			rotatorView.buttonNextView.fire( 'execute' );

			expect( editableFocusSpy ).not.toHaveBeenCalled();
		} );

		it( 'should move focus to the editable when switching focused view to the next one', () => {
			const editableFocusSpy = vi.spyOn( editor.editing.view, 'focus' );

			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			rotatorView.focusTracker.isFocused = true;

			rotatorView.buttonNextView.fire( 'execute' );

			expect( editableFocusSpy ).toHaveBeenCalledOnce();
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

			expect( balloon.visibleView ).toBe( viewA );

			rotatorView.buttonPrevView.fire( 'execute' );

			expect( balloon.visibleView ).toBe( viewC );

			rotatorView.buttonPrevView.fire( 'execute' );

			expect( balloon.visibleView ).toBe( viewB );

			rotatorView.buttonPrevView.fire( 'execute' );

			expect( balloon.visibleView ).toBe( viewA );
		} );

		it( 'should not move focus to the editable when switching not focused view to the prev one', () => {
			const editableFocusSpy = vi.spyOn( editor.editing.view, 'focus' );

			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			rotatorView.buttonPrevView.fire( 'execute' );

			expect( editableFocusSpy ).not.toHaveBeenCalled();
		} );

		it( 'should move focus to the editable when switching focused view to the prev one', () => {
			const editableFocusSpy = vi.spyOn( editor.editing.view, 'focus' );

			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			rotatorView.focusTracker.isFocused = true;

			rotatorView.buttonPrevView.fire( 'execute' );

			expect( editableFocusSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should add hidden view with fake panels to editor body collection', () => {
			const fakePanelsView = editor.ui.view.body.last;

			expect( fakePanelsView.element.classList.contains( 'ck-fake-panel' ) ).toBe( true );
			expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).toBe( true );
			expect( fakePanelsView.element.childElementCount ).toBe( 0 );
		} );

		it( 'should show fake panels when more than one stack is added to the balloon (max to 2 panels)', () => {
			const fakePanelsView = editor.ui.view.body.last;
			const viewD = new View();

			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).toBe( false );
			expect( fakePanelsView.element.childElementCount ).toBe( 1 );

			balloon.add( {
				view: viewC,
				stackId: 'third'
			} );

			expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).toBe( false );
			expect( fakePanelsView.element.childElementCount ).toBe( 2 );

			balloon.add( {
				view: viewD,
				stackId: 'fourth'
			} );

			expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).toBe( false );
			expect( fakePanelsView.element.childElementCount ).toBe( 2 );

			balloon.remove( viewD );

			expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).toBe( false );
			expect( fakePanelsView.element.childElementCount ).toBe( 2 );

			balloon.remove( viewC );

			expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).toBe( false );
			expect( fakePanelsView.element.childElementCount ).toBe( 1 );

			balloon.remove( viewB );

			expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).toBe( true );
			expect( fakePanelsView.element.childElementCount ).toBe( 0 );
		} );

		it( 'should keep position of fake panels up to date with balloon position when panels are visible', () => {
			const fakePanelsView = editor.ui.view.body.last;

			let width = 30;
			let height = 40;

			balloon.view.top = 10;
			balloon.view.left = 20;

			vi.spyOn( balloon.view.element, 'getBoundingClientRect' ).mockImplementation( () => ( { width, height } ) );

			balloon.add( {
				view: viewB,
				stackId: 'second'
			} );

			expect( fakePanelsView.element.style.top ).toBe( '10px' );
			expect( fakePanelsView.element.style.left ).toBe( '20px' );
			expect( fakePanelsView.element.style.width ).toBe( '30px' );
			expect( fakePanelsView.element.style.height ).toBe( '40px' );

			balloon.view.top = 15;
			balloon.view.left = 25;
			width = 35;
			height = 45;

			balloon.add( {
				view: viewC,
				stackId: 'third'
			} );

			expect( fakePanelsView.element.style.top ).toBe( '15px' );
			expect( fakePanelsView.element.style.left ).toBe( '25px' );
			expect( fakePanelsView.element.style.width ).toBe( '35px' );
			expect( fakePanelsView.element.style.height ).toBe( '45px' );

			balloon.view.top = 10;
			balloon.view.left = 20;
			width = 30;
			height = 40;

			balloon.updatePosition();

			expect( fakePanelsView.element.style.top ).toBe( '10px' );
			expect( fakePanelsView.element.style.left ).toBe( '20px' );
			expect( fakePanelsView.element.style.width ).toBe( '30px' );
			expect( fakePanelsView.element.style.height ).toBe( '40px' );

			// Hide fake panels by removing additional stacks.
			balloon.remove( viewC );
			balloon.remove( viewB );

			balloon.view.top = 15;
			balloon.view.left = 25;
			width = 35;
			height = 45;

			balloon.updatePosition();

			// Old values because fake panels are hidden.
			expect( fakePanelsView.element.style.top ).toBe( '10px' );
			expect( fakePanelsView.element.style.left ).toBe( '20px' );
			expect( fakePanelsView.element.style.width ).toBe( '30px' );
			expect( fakePanelsView.element.style.height ).toBe( '40px' );
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
					vi.spyOn( balloon.view, 'attachTo' ).mockReturnValue( {} );
					vi.spyOn( balloon.view, 'pin' ).mockReturnValue( {} );

					balloon.add( {
						view: new View()
					} );

					balloon.add( {
						view: new View(),
						stackId: 'second'
					} );

					const rotatorView = balloon.view.content.get( 0 );
					const counterElement = rotatorView.element.querySelector( '.ck-balloon-rotator__counter' );

					expect( counterElement.textContent ).toBe( '1 z 2' );
					expect( rotatorView.buttonPrevView.labelView.element.textContent ).toBe( 'Poprzedni' );
					expect( rotatorView.buttonNextView.labelView.element.textContent ).toBe( 'Następny' );
				} );
		} );

		describe( 'destroy()', () => {
			it( 'should destroy the FocusTracker instance', () => {
				const destroySpy = vi.spyOn( rotatorView.focusTracker, 'destroy' );

				rotatorView.destroy();

				expect( destroySpy ).toHaveBeenCalledOnce();
			} );
		} );

		describe( 'singleViewMode', () => {
			it( 'should not display navigation when there is more than one stack', () => {
				const navigationElement = rotatorView.element.querySelector( '.ck-balloon-rotator__navigation' );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).toBe( true );

				balloon.add( {
					view: viewB,
					stackId: 'second',
					singleViewMode: true
				} );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).toBe( true );
			} );

			it( 'should hide display navigation after adding view', () => {
				const navigationElement = rotatorView.element.querySelector( '.ck-balloon-rotator__navigation' );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).toBe( true );

				balloon.add( {
					view: viewB,
					stackId: 'second'
				} );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).toBe( false );

				balloon.add( {
					view: viewC,
					stackId: 'third',
					singleViewMode: true
				} );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).toBe( true );
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

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).toBe( true );

				balloon.remove( viewC );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).toBe( false );
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

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).toBe( true );

				balloon.remove( viewD );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).toBe( true );

				balloon.remove( viewC );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).toBe( false );
			} );

			it( 'should not show fake panels when more than one stack is added to the balloon (max to 2 panels)', () => {
				const fakePanelsView = editor.ui.view.body.last;

				balloon.add( {
					view: viewB,
					stackId: 'second'
				} );

				expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).toBe( false );
				expect( fakePanelsView.element.childElementCount ).toBe( 1 );

				balloon.add( {
					view: viewC,
					stackId: 'third',
					singleViewMode: true
				} );

				expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).toBe( true );
				expect( fakePanelsView.element.childElementCount ).toBe( 0 );

				balloon.remove( viewC );

				expect( fakePanelsView.element.classList.contains( 'ck-hidden' ) ).toBe( false );
				expect( fakePanelsView.element.childElementCount ).toBe( 1 );

				balloon.remove( viewB );
			} );

			it( 'should switch visible view when adding a view to new stack', () => {
				const navigationElement = rotatorView.element.querySelector( '.ck-balloon-rotator__navigation' );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).toBe( true );

				balloon.add( {
					view: viewB,
					stackId: 'second'
				} );

				expect( balloon.visibleView ).toBe( viewA );

				balloon.add( {
					view: viewC,
					stackId: 'third',
					singleViewMode: true
				} );

				expect( balloon.visibleView ).toBe( viewC );

				const viewD = new View();

				balloon.add( {
					view: viewD,
					stackId: 'fifth',
					singleViewMode: true
				} );

				expect( balloon.visibleView ).toBe( viewD );
			} );

			it( 'should switch visible view when adding a view to the same stack', () => {
				const navigationElement = rotatorView.element.querySelector( '.ck-balloon-rotator__navigation' );

				expect( navigationElement.classList.contains( 'ck-hidden' ) ).toBe( true );

				balloon.add( {
					view: viewB,
					stackId: 'second'
				} );

				expect( balloon.visibleView ).toBe( viewA );

				balloon.add( {
					view: viewC,
					stackId: 'third',
					singleViewMode: true
				} );

				expect( balloon.visibleView ).toBe( viewC );

				const viewD = new View();

				balloon.add( {
					view: viewD,
					stackId: 'third',
					singleViewMode: true
				} );

				expect( balloon.visibleView ).toBe( viewD );
			} );
		} );
	} );

	function stubBalloonPanelView() {
		// We don't need to execute BalloonPanel pin and attachTo methods
		// it's enough to check if was called with the proper data.
		vi.spyOn( balloon.view, 'attachTo' ).mockReturnValue( {} );
		vi.spyOn( balloon.view, 'pin' ).mockReturnValue( {} );

		balloon.add( {
			view: viewA,
			position: {
				target: 'fake'
			}
		} );
	}
} );
