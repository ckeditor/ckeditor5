/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { EmitterMixin } from '@ckeditor/ckeditor5-utils';

import { EditingController } from '../../src/controller/editingcontroller.js';

import { EditingView } from '../../src/view/view.js';

import { Mapper } from '../../src/conversion/mapper.js';
import { DowncastDispatcher } from '../../src/conversion/downcastdispatcher.js';

import { DowncastHelpers } from '../../src/conversion/downcasthelpers.js';
import { Model } from '../../src/model/model.js';
import { ModelPosition } from '../../src/model/position.js';
import { ModelRange } from '../../src/model/range.js';
import { ModelDocumentFragment } from '../../src/model/documentfragment.js';

import { _getModelData, _parseModel } from '../../src/dev-utils/model.js';
import { _getViewData } from '../../src/dev-utils/view.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'EditingController', () => {
	describe( 'constructor()', () => {
		let model, editing;

		beforeEach( () => {
			model = new Model();
			editing = new EditingController( model, new StylesProcessor() );
		} );

		afterEach( () => {
			editing.destroy();
		} );

		it( 'should create controller with properties', () => {
			expect( editing.model ).toBe( model );
			expect( editing.view ).toBeInstanceOf( EditingView );
			expect( editing.mapper ).toBeInstanceOf( Mapper );
			expect( editing.downcastDispatcher ).toBeInstanceOf( DowncastDispatcher );

			editing.destroy();
		} );

		it( 'should be observable', () => {
			const spy = vi.fn();

			editing.on( 'change:foo', spy );
			editing.set( 'foo', 'bar' );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should bind view roots to model roots', () => {
			expect( model.document.roots ).toHaveLength( 1 ); // $graveyard
			expect( editing.view.document.roots ).toHaveLength( 0 );

			const modelRoot = model.document.createRoot();

			expect( model.document.roots ).toHaveLength( 2 );
			expect( editing.view.document.roots ).toHaveLength( 1 );
			expect( editing.view.document.getRoot().document ).toBe( editing.view.document );

			expect( editing.view.document.getRoot().name ).toBe( modelRoot.name );
			expect( editing.view.document.getRoot().name ).toBe( '$root' );
		} );
	} );

	describe( 'conversion', () => {
		let model, modelRoot, viewRoot, domRoot, editing, listener;

		beforeEach( () => {
			listener = new ( EmitterMixin() )();

			model = new Model();
			modelRoot = model.document.createRoot();

			editing = new EditingController( model, new StylesProcessor() );

			domRoot = document.createElement( 'div' );
			domRoot.contentEditable = true;

			document.body.appendChild( domRoot );

			viewRoot = editing.view.document.getRoot();
			editing.view.attachDomRoot( domRoot );

			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			model.schema.register( 'div', { inheritAllFrom: '$block' } );

			const downcastHelpers = new DowncastHelpers( [ editing.downcastDispatcher ] );

			downcastHelpers.elementToElement( { model: 'paragraph', view: 'p' } );
			downcastHelpers.elementToElement( { model: 'div', view: 'div' } );
			downcastHelpers.markerToHighlight( { model: 'marker', view: {} } );

			// Note: The below code is highly overcomplicated due to #455.
			model.change( writer => {
				writer.setSelection( null );
			} );

			modelRoot._removeChildren( 0, modelRoot.childCount );

			viewRoot._removeChildren( 0, viewRoot.childCount );

			const modelData = new ModelDocumentFragment( _parseModel(
				'<paragraph>foo</paragraph>' +
				'<paragraph></paragraph>' +
				'<paragraph>bar</paragraph>',
				model.schema
			)._children );

			model.change( writer => {
				writer.insert( modelData, model.document.getRoot() );

				writer.setSelection( writer.createRange(
					writer.createPositionAt( modelRoot.getChild( 0 ), 1 ),
					writer.createPositionAt( modelRoot.getChild( 0 ), 1 )
				) );
			} );
		} );

		afterEach( () => {
			document.body.removeChild( domRoot );
			listener.stopListening();
			editing.destroy();
		} );

		it( 'should convert insertion', () => {
			expect( _getViewData( editing.view ) ).toBe( '<p>f{}oo</p><p></p><p>bar</p>' );
		} );

		it( 'should convert split', () => {
			expect( _getViewData( editing.view ) ).toBe( '<p>f{}oo</p><p></p><p>bar</p>' );

			model.change( writer => {
				writer.split( model.document.selection.getFirstPosition() );

				writer.setSelection( writer.createRange(
					writer.createPositionAt( modelRoot.getChild( 1 ), 0 ),
					writer.createPositionAt( modelRoot.getChild( 1 ), 0 )
				) );
			} );

			expect( _getViewData( editing.view ) ).toBe( '<p>f</p><p>{}oo</p><p></p><p>bar</p>' );
		} );

		it( 'should convert rename', () => {
			expect( _getViewData( editing.view ) ).toBe( '<p>f{}oo</p><p></p><p>bar</p>' );

			model.change( writer => {
				writer.rename( modelRoot.getChild( 0 ), 'div' );
			} );

			expect( _getViewData( editing.view ) ).toBe( '<div>f{}oo</div><p></p><p>bar</p>' );
		} );

		it( 'should convert delete', () => {
			model.change( writer => {
				writer.remove(
					ModelRange._createFromPositionAndShift( model.document.selection.getFirstPosition(), 1 )
				);

				writer.setSelection( writer.createRange(
					writer.createPositionAt( modelRoot.getChild( 0 ), 1 ),
					writer.createPositionAt( modelRoot.getChild( 0 ), 1 )
				) );
			} );

			expect( _getViewData( editing.view ) ).toBe( '<p>f{}o</p><p></p><p>bar</p>' );
		} );

		it( 'should convert selection from view to model', done => {
			listener.listenTo( editing.view.document, 'selectionChange', () => {
				setTimeout( () => {
					expect( _getModelData( model ) ).toBe( '<paragraph>foo</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>b[a]r</paragraph>'
					);

					done();
				}, 1 );
			} );

			editing.view.document.isFocused = true;
			editing.view.forceRender();

			const domSelection = document.getSelection();
			domSelection.removeAllRanges();
			const domBar = domRoot.childNodes[ 2 ].childNodes[ 0 ];
			const domRange = document.createRange();
			domRange.setStart( domBar, 1 );
			domRange.setEnd( domBar, 2 );
			domSelection.addRange( domRange );
		} );

		it( 'should convert collapsed selection', () => {
			model.change( writer => {
				writer.setSelection( writer.createRange(
					writer.createPositionAt( modelRoot.getChild( 2 ), 1 ),
					writer.createPositionAt( modelRoot.getChild( 2 ), 1 )
				) );
			} );

			expect( _getViewData( editing.view ) ).toBe( '<p>foo</p><p></p><p>b{}ar</p>' );
		} );

		it( 'should convert not collapsed selection', () => {
			model.change( writer => {
				writer.setSelection( writer.createRange(
					writer.createPositionAt( modelRoot.getChild( 2 ), 1 ),
					writer.createPositionAt( modelRoot.getChild( 2 ), 2 )
				) );
			} );

			expect( _getViewData( editing.view ) ).toBe( '<p>foo</p><p></p><p>b{a}r</p>' );
		} );

		it( 'should clear previous selection', () => {
			model.change( writer => {
				writer.setSelection( writer.createRange(
					writer.createPositionAt( modelRoot.getChild( 2 ), 1 ),
					writer.createPositionAt( modelRoot.getChild( 2 ), 1 )
				) );
			} );

			expect( _getViewData( editing.view ) ).toBe( '<p>foo</p><p></p><p>b{}ar</p>' );

			model.change( writer => {
				writer.setSelection( writer.createRange(
					writer.createPositionAt( modelRoot.getChild( 2 ), 2 ),
					writer.createPositionAt( modelRoot.getChild( 2 ), 2 )
				) );
			} );

			expect( _getViewData( editing.view ) ).toBe( '<p>foo</p><p></p><p>ba{}r</p>' );
		} );

		it( 'should convert adding marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
			} );

			expect( _getViewData( editing.view, { withoutSelection: true } ) )
				.toBe( '<p>f<span>oo</span></p><p></p><p><span>ba</span>r</p>' );
		} );

		it( 'should convert removing marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
			} );

			model.change( writer => {
				writer.removeMarker( 'marker' );
			} );

			expect( _getViewData( editing.view, { withoutSelection: true } ) )
				.toBe( '<p>foo</p><p></p><p>bar</p>' );
		} );

		it( 'should convert changing marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
			} );

			const range2 = new ModelRange( new ModelPosition( modelRoot, [ 0, 0 ] ), new ModelPosition( modelRoot, [ 0, 2 ] ) );

			model.change( writer => {
				writer.updateMarker( 'marker', { range: range2 } );
			} );

			expect( _getViewData( editing.view, { withoutSelection: true } ) )
				.toBe( '<p><span>fo</span>o</p><p></p><p>bar</p>' );
		} );

		it( 'should convert insertion into marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
				writer.insertText( 'xyz', new ModelPosition( modelRoot, [ 1, 0 ] ) );
			} );

			expect( _getViewData( editing.view, { withoutSelection: true } ) )
				.toBe( '<p>f<span>oo</span></p><p><span>xyz</span></p><p><span>ba</span>r</p>' );
		} );

		it( 'should convert move to marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
			} );

			model.change( writer => {
				writer.move(
					new ModelRange( new ModelPosition( modelRoot, [ 2, 2 ] ), new ModelPosition( modelRoot, [ 2, 3 ] ) ),
					new ModelPosition( modelRoot, [ 0, 3 ] )
				);
			} );

			expect( _getViewData( editing.view, { withoutSelection: true } ) )
				.toBe( '<p>f<span>oor</span></p><p></p><p><span>ba</span></p>' );
		} );

		it( 'should convert move from marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
			} );

			model.change( writer => {
				writer.move(
					new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 0, 3 ] ) ),
					new ModelPosition( modelRoot, [ 2, 3 ] )
				);
			} );

			expect( _getViewData( editing.view, { withoutSelection: true } ) )
				.toBe( '<p>f</p><p></p><p><span>ba</span>roo</p>' );
		} );

		it( 'should convert the whole marker move', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 0, 3 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
			} );

			model.change( writer => {
				writer.move(
					new ModelRange( new ModelPosition( modelRoot, [ 0, 0 ] ), new ModelPosition( modelRoot, [ 0, 3 ] ) ),
					new ModelPosition( modelRoot, [ 1, 0 ] )
				);
			} );

			expect( _getViewData( editing.view, { withoutSelection: true } ) )
				.toBe( '<p></p><p>f<span>oo</span></p><p>bar</p>' );
		} );

		describe( 'preventing rendering while in the model.change() block', () => {
			let renderSpy;

			beforeEach( () => {
				renderSpy = vi.fn();

				editing.view.on( 'render', renderSpy );
			} );

			it( 'should not call render in the model.change() block', () => {
				model.change( writer => {
					executeSomeModelChange( writer );

					expect( renderSpy ).not.toHaveBeenCalled();
				} );

				expect( renderSpy ).toHaveBeenCalled();
			} );

			it( 'should not call render in the model.change() block even if view.change() was called', () => {
				model.change( writer => {
					executeSomeModelChange( writer );

					editing.view.change( writer => executeSomeViewChange( writer ) );

					expect( renderSpy ).not.toHaveBeenCalled();
				} );

				expect( renderSpy ).toHaveBeenCalled();
			} );

			it( 'should not call render in enqueued changes', () => {
				model.enqueueChange( writer => {
					executeSomeModelChange( writer );

					expect( renderSpy ).not.toHaveBeenCalled();

					model.enqueueChange( writer => {
						executeSomeOtherModelChange( writer );

						expect( renderSpy ).not.toHaveBeenCalled();
					} );

					expect( renderSpy ).not.toHaveBeenCalled();
				} );

				expect( renderSpy ).toHaveBeenCalled();
			} );

			it( 'should not call render if some model changes were executed in the post fixer', () => {
				const postfixerSpy = vi.fn();

				model.document.registerPostFixer( () => {
					model.change( writer => executeSomeOtherModelChange( writer ) );

					expect( renderSpy ).not.toHaveBeenCalled();

					postfixerSpy();
				} );

				model.change( writer => {
					executeSomeModelChange( writer );

					expect( renderSpy ).not.toHaveBeenCalled();
				} );

				expect( renderSpy ).toHaveBeenCalled();
				expect( postfixerSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should not call render if some view changes were executed in the change listener', () => {
				const changeListenerSpy = vi.fn();

				model.document.on( 'change', () => {
					editing.view.change( writer => executeSomeViewChange( writer ) );

					expect( renderSpy ).not.toHaveBeenCalled();

					changeListenerSpy();
				} );

				model.change( writer => {
					executeSomeModelChange( writer );

					expect( renderSpy ).not.toHaveBeenCalled();
				} );

				expect( renderSpy ).toHaveBeenCalled();
				expect( changeListenerSpy ).toHaveBeenCalledOnce();
			} );

			it( 'should call view post-fixers once for model.change() block', () => {
				const postfixerSpy = vi.fn();

				editing.view.document.registerPostFixer( postfixerSpy );

				model.change( writer => {
					executeSomeModelChange( writer );

					editing.view.change( writer => {
						executeSomeViewChange( writer );
					} );
				} );

				expect( postfixerSpy ).toHaveBeenCalledOnce();
			} );

			function executeSomeModelChange( writer ) {
				const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );
				writer.addMarker( 'marker1', { range, usingOperation: true } );
			}

			function executeSomeOtherModelChange( writer ) {
				const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );
				writer.addMarker( 'marker2', { range, usingOperation: true } );
			}

			function executeSomeViewChange( writer ) {
				writer.addClass( 'foo', editing.view.document.getRoot() );
			}
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should remove listenters', () => {
			const model = new Model();
			model.document.createRoot();
			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			const editing = new EditingController( model, new StylesProcessor() );

			const spy = vi.fn();

			editing.downcastDispatcher.on( 'insert:$element', spy );

			editing.destroy();

			model.change( writer => {
				const modelData = _parseModel( '<paragraph>foo</paragraph>', model.schema ).getChild( 0 );

				writer.insert( modelData, model.document.getRoot() );
			} );

			expect( spy ).not.toHaveBeenCalled();

			editing.destroy();
		} );

		it( 'should destroy view', () => {
			const model = new Model();
			model.document.createRoot();
			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			const editing = new EditingController( model, new StylesProcessor() );

			const spy = vi.spyOn( editing.view, 'destroy' );

			editing.destroy();

			expect( spy ).toHaveBeenCalled();
		} );
	} );

	describe( 'reconvertMarker()', () => {
		let model, editing;

		beforeEach( () => {
			model = new Model();
			model.document.createRoot();
			editing = new EditingController( model, new StylesProcessor() );
		} );

		it( 'should call MarkerCollection#_refresh()', () => {
			model.change( writer => {
				writer.insert( writer.createText( 'x' ), model.document.getRoot(), 0 );

				writer.addMarker( 'foo', {
					range: writer.createRangeIn( model.document.getRoot() ),
					usingOperation: true
				} );
			} );

			const refreshSpy = vi.spyOn( model.markers, '_refresh' ).mockImplementation( () => {} );

			editing.reconvertMarker( 'foo' );
			expect( refreshSpy ).toHaveBeenCalledOnce();
			expect( refreshSpy ).toHaveBeenCalledWith( model.markers.get( 'foo' ) );
		} );

		it( 'should use a model.change() block to reconvert a marker', () => {
			const changeSpy = vi.fn();

			model.change( writer => {
				writer.insert( writer.createText( 'x' ), model.document.getRoot(), 0 );

				writer.addMarker( 'foo', {
					range: writer.createRangeIn( model.document.getRoot() ),
					usingOperation: true
				} );
			} );

			model.document.on( 'change', changeSpy );
			expect( changeSpy ).not.toHaveBeenCalled();

			editing.reconvertMarker( 'foo' );
			expect( changeSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should work when a marker instance was passed', () => {
			let marker;

			model.change( writer => {
				writer.insert( writer.createText( 'x' ), model.document.getRoot(), 0 );

				marker = writer.addMarker( 'foo', {
					range: writer.createRangeIn( model.document.getRoot() ),
					usingOperation: true
				} );
			} );

			const refreshSpy = vi.spyOn( model.markers, '_refresh' ).mockImplementation( () => {} );

			editing.reconvertMarker( marker );
			expect( refreshSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should throw when marker was not found in the collection', () => {
			expectToThrowCKEditorError(
				() => {
					editing.reconvertMarker( 'foo' );
				},
				'editingcontroller-reconvertmarker-marker-not-exist',
				editing,
				{
					markerName: 'foo'
				}
			);
		} );
	} );

	describe( 'reconvertItem()', () => {
		let model, editing;

		beforeEach( () => {
			model = new Model();
			model.document.createRoot();
			editing = new EditingController( model, new StylesProcessor() );
		} );

		it( 'should call Differ#_refreshItem()', () => {
			model.change( writer => {
				writer.insert( writer.createText( 'x' ), model.document.getRoot(), 0 );
			} );

			const refreshSpy = vi.spyOn( model.document.differ, '_refreshItem' ).mockImplementation( () => {} );

			editing.reconvertItem( model.document.getRoot().getChild( 0 ) );
			expect( refreshSpy ).toHaveBeenCalledOnce();
			expect( refreshSpy ).toHaveBeenCalledWith( model.document.getRoot().getChild( 0 ) );
		} );

		it( 'should use a model.change() block to reconvert an item', () => {
			const changeSpy = vi.fn();

			model.change( writer => {
				writer.insert( writer.createText( 'x' ), model.document.getRoot(), 0 );
			} );

			model.document.on( 'change', changeSpy );
			expect( changeSpy ).not.toHaveBeenCalled();

			editing.reconvertItem( model.document.getRoot().getChild( 0 ) );
			expect( changeSpy ).toHaveBeenCalledOnce();
		} );
	} );
} );
