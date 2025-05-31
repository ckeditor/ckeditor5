/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin.js';

import EditingController from '../../src/controller/editingcontroller.js';

import View from '../../src/view/view.js';

import Mapper from '../../src/conversion/mapper.js';
import DowncastDispatcher from '../../src/conversion/downcastdispatcher.js';

import DowncastHelpers from '../../src/conversion/downcasthelpers.js';
import Model from '../../src/model/model.js';
import ModelPosition from '../../src/model/position.js';
import ModelRange from '../../src/model/range.js';
import ModelDocumentFragment from '../../src/model/documentfragment.js';

import { getData as getModelData, setData as setModelData, parse } from '../../src/dev-utils/model.js';
import { getData as getViewData } from '../../src/dev-utils/view.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { Enter } from '@ckeditor/ckeditor5-enter';

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
			expect( editing ).to.have.property( 'model' ).that.equals( model );
			expect( editing ).to.have.property( 'view' ).that.is.instanceof( View );
			expect( editing ).to.have.property( 'mapper' ).that.is.instanceof( Mapper );
			expect( editing ).to.have.property( 'downcastDispatcher' ).that.is.instanceof( DowncastDispatcher );

			editing.destroy();
		} );

		it( 'should be observable', () => {
			const spy = sinon.spy();

			editing.on( 'change:foo', spy );
			editing.set( 'foo', 'bar' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should bind view roots to model roots', () => {
			expect( model.document.roots ).to.length( 1 ); // $graveyard
			expect( editing.view.document.roots ).to.length( 0 );

			const modelRoot = model.document.createRoot();

			expect( model.document.roots ).to.length( 2 );
			expect( editing.view.document.roots ).to.length( 1 );
			expect( editing.view.document.getRoot().document ).to.equal( editing.view.document );

			expect( editing.view.document.getRoot().name ).to.equal( modelRoot.name ).to.equal( '$root' );
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

			const modelData = new ModelDocumentFragment( parse(
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
			expect( getViewData( editing.view ) ).to.equal( '<p>f{}oo</p><p></p><p>bar</p>' );
		} );

		it( 'should convert split', () => {
			expect( getViewData( editing.view ) ).to.equal( '<p>f{}oo</p><p></p><p>bar</p>' );

			model.change( writer => {
				writer.split( model.document.selection.getFirstPosition() );

				writer.setSelection( writer.createRange(
					writer.createPositionAt( modelRoot.getChild( 1 ), 0 ),
					writer.createPositionAt( modelRoot.getChild( 1 ), 0 )
				) );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>f</p><p>{}oo</p><p></p><p>bar</p>' );
		} );

		it( 'should convert rename', () => {
			expect( getViewData( editing.view ) ).to.equal( '<p>f{}oo</p><p></p><p>bar</p>' );

			model.change( writer => {
				writer.rename( modelRoot.getChild( 0 ), 'div' );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<div>f{}oo</div><p></p><p>bar</p>' );
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

			expect( getViewData( editing.view ) ).to.equal( '<p>f{}o</p><p></p><p>bar</p>' );
		} );

		it( 'should convert selection from view to model', done => {
			listener.listenTo( editing.view.document, 'selectionChange', () => {
				setTimeout( () => {
					expect( getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' +
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

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>b{}ar</p>' );
		} );

		it( 'should convert not collapsed selection', () => {
			model.change( writer => {
				writer.setSelection( writer.createRange(
					writer.createPositionAt( modelRoot.getChild( 2 ), 1 ),
					writer.createPositionAt( modelRoot.getChild( 2 ), 2 )
				) );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>b{a}r</p>' );
		} );

		it( 'should clear previous selection', () => {
			model.change( writer => {
				writer.setSelection( writer.createRange(
					writer.createPositionAt( modelRoot.getChild( 2 ), 1 ),
					writer.createPositionAt( modelRoot.getChild( 2 ), 1 )
				) );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>b{}ar</p>' );

			model.change( writer => {
				writer.setSelection( writer.createRange(
					writer.createPositionAt( modelRoot.getChild( 2 ), 2 ),
					writer.createPositionAt( modelRoot.getChild( 2 ), 2 )
				) );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>ba{}r</p>' );
		} );

		it( 'should convert adding marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>f<span>oo</span></p><p></p><p><span>ba</span>r</p>' );
		} );

		it( 'should convert removing marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
			} );

			model.change( writer => {
				writer.removeMarker( 'marker' );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>foo</p><p></p><p>bar</p>' );
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

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p><span>fo</span>o</p><p></p><p>bar</p>' );
		} );

		it( 'should convert insertion into marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( writer => {
				writer.addMarker( 'marker', { range, usingOperation: false } );
				writer.insertText( 'xyz', new ModelPosition( modelRoot, [ 1, 0 ] ) );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>f<span>oo</span></p><p><span>xyz</span></p><p><span>ba</span>r</p>' );
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

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>f<span>oor</span></p><p></p><p><span>ba</span></p>' );
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

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>f</p><p></p><p><span>ba</span>roo</p>' );
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

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p></p><p>f<span>oo</span></p><p>bar</p>' );
		} );

		describe( 'preventing rendering while in the model.change() block', () => {
			let renderSpy;

			beforeEach( () => {
				renderSpy = sinon.spy();

				editing.view.on( 'render', renderSpy );
			} );

			it( 'should not call render in the model.change() block', () => {
				model.change( writer => {
					executeSomeModelChange( writer );

					expect( renderSpy.called ).to.be.false;
				} );

				expect( renderSpy.called ).to.be.true;
			} );

			it( 'should not call render in the model.change() block even if view.change() was called', () => {
				model.change( writer => {
					executeSomeModelChange( writer );

					editing.view.change( writer => executeSomeViewChange( writer ) );

					expect( renderSpy.called ).to.be.false;
				} );

				expect( renderSpy.called ).to.be.true;
			} );

			it( 'should not call render in enqueued changes', () => {
				model.enqueueChange( writer => {
					executeSomeModelChange( writer );

					expect( renderSpy.called ).to.be.false;

					model.enqueueChange( writer => {
						executeSomeOtherModelChange( writer );

						expect( renderSpy.called ).to.be.false;
					} );

					expect( renderSpy.called ).to.be.false;
				} );

				expect( renderSpy.called ).to.be.true;
			} );

			it( 'should not call render if some model changes were executed in the post fixer', () => {
				const postfixerSpy = sinon.spy();

				model.document.registerPostFixer( () => {
					model.change( writer => executeSomeOtherModelChange( writer ) );

					expect( renderSpy.called ).to.be.false;

					postfixerSpy();
				} );

				model.change( writer => {
					executeSomeModelChange( writer );

					expect( renderSpy.called ).to.be.false;
				} );

				expect( renderSpy.called ).to.be.true;
				expect( postfixerSpy.calledOnce ).to.be.true;
			} );

			it( 'should not call render if some view changes were executed in the change listener', () => {
				const changeListenerSpy = sinon.spy();

				model.document.on( 'change', () => {
					editing.view.change( writer => executeSomeViewChange( writer ) );

					expect( renderSpy.called ).to.be.false;

					changeListenerSpy();
				} );

				model.change( writer => {
					executeSomeModelChange( writer );

					expect( renderSpy.called ).to.be.false;
				} );

				expect( renderSpy.called ).to.be.true;
				expect( changeListenerSpy.calledOnce ).to.be.true;
			} );

			it( 'should call view post-fixers once for model.change() block', () => {
				const postfixerSpy = sinon.spy();

				editing.view.document.registerPostFixer( postfixerSpy );

				model.change( writer => {
					executeSomeModelChange( writer );

					editing.view.change( writer => {
						executeSomeViewChange( writer );
					} );
				} );

				sinon.assert.calledOnce( postfixerSpy );
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

			const spy = sinon.spy();

			editing.downcastDispatcher.on( 'insert:$element', spy );

			editing.destroy();

			model.change( writer => {
				const modelData = parse( '<paragraph>foo</paragraph>', model.schema ).getChild( 0 );

				writer.insert( modelData, model.document.getRoot() );
			} );

			expect( spy.called ).to.be.false;

			editing.destroy();
		} );

		it( 'should destroy view', () => {
			const model = new Model();
			model.document.createRoot();
			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			const editing = new EditingController( model, new StylesProcessor() );

			const spy = sinon.spy( editing.view, 'destroy' );

			editing.destroy();

			expect( spy.called ).to.be.true;
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

			const refreshSpy = sinon.stub( model.markers, '_refresh' );

			editing.reconvertMarker( 'foo' );
			sinon.assert.calledOnce( refreshSpy );
			sinon.assert.calledWith( refreshSpy, model.markers.get( 'foo' ) );
		} );

		it( 'should use a model.change() block to reconvert a marker', () => {
			const changeSpy = sinon.spy();

			model.change( writer => {
				writer.insert( writer.createText( 'x' ), model.document.getRoot(), 0 );

				writer.addMarker( 'foo', {
					range: writer.createRangeIn( model.document.getRoot() ),
					usingOperation: true
				} );
			} );

			model.document.on( 'change', changeSpy );
			sinon.assert.notCalled( changeSpy );

			editing.reconvertMarker( 'foo' );
			sinon.assert.calledOnce( changeSpy );
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

			const refreshSpy = sinon.stub( model.markers, '_refresh' );

			editing.reconvertMarker( marker );
			sinon.assert.calledOnce( refreshSpy );
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

			const refreshSpy = sinon.stub( model.document.differ, '_refreshItem' );

			editing.reconvertItem( model.document.getRoot().getChild( 0 ) );
			sinon.assert.calledOnce( refreshSpy );
			sinon.assert.calledWith( refreshSpy, model.document.getRoot().getChild( 0 ) );
		} );

		it( 'should use a model.change() block to reconvert an item', () => {
			const changeSpy = sinon.spy();

			model.change( writer => {
				writer.insert( writer.createText( 'x' ), model.document.getRoot(), 0 );
			} );

			model.document.on( 'change', changeSpy );
			sinon.assert.notCalled( changeSpy );

			editing.reconvertItem( model.document.getRoot().getChild( 0 ) );
			sinon.assert.calledOnce( changeSpy );
		} );
	} );

	describe( 'beforeInput target ranges fixing', () => {
		let editor, model, view, viewDocument, viewRoot, beforeInputSpy, deleteSpy, insertTextSpy, enterSpy;

		testUtils.createSinonSandbox();

		beforeEach( async () => {
			editor = await VirtualTestEditor.create( { plugins: [ Typing, Enter ] } );
			model = editor.model;
			view = editor.editing.view;
			viewDocument = view.document;
			viewRoot = viewDocument.getRoot();

			beforeInputSpy = testUtils.sinon.spy();
			viewDocument.on( 'beforeinput', beforeInputSpy, { context: '$capture', priority: 'highest' } );

			deleteSpy = testUtils.sinon.stub().callsFake( evt => evt.stop() );
			viewDocument.on( 'delete', deleteSpy, { context: '$capture', priority: 'highest' } );

			insertTextSpy = testUtils.sinon.stub().callsFake( evt => evt.stop() );
			viewDocument.on( 'insertText', insertTextSpy, { context: '$capture', priority: 'highest' } );

			enterSpy = testUtils.sinon.stub().callsFake( evt => evt.stop() );
			viewDocument.on( 'enter', enterSpy, { context: '$capture', priority: 'highest' } );

			// Stub `editor.editing.view.scrollToTheSelection` as it will fail on VirtualTestEditor without DOM.
			sinon.stub( editor.editing.view, 'scrollToTheSelection' );

			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			editor.conversion.elementToElement( { model: 'paragraph', view: 'p' } );

			model.schema.register( 'blockObject', { inheritAllFrom: '$blockObject' } );
			editor.conversion.elementToElement( { model: 'blockObject', view: 'div' } );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should not fix flat range on text', () => {
			setModelData( model, '<paragraph>foobar</paragraph>' );

			const targetRanges = [ view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 3 ),
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 6 )
			) ];

			const eventData = {
				inputType: 'deleteContentBackward',
				targetRanges
			};

			fireBeforeInputEvent( eventData );

			// Verify beforeinput range.
			sinon.assert.calledOnce( beforeInputSpy );

			const inputData = beforeInputSpy.args[ 0 ][ 1 ];
			expect( inputData.inputType ).to.equal( eventData.inputType );
			expect( inputData.targetRanges[ 0 ] ).to.deep.equal( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 3 ),
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 6 )
			) );

			// Verify delete event.
			sinon.assert.calledOnce( deleteSpy );

			const deleteData = deleteSpy.args[ 0 ][ 1 ];
			expect( deleteData.selectionToRemove.getFirstRange().isEqual( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 3 ),
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 6 )
			) ) ).to.be.true;
		} );

		it( 'should fix range that ends in block object (deleteContentBackward)', () => {
			setModelData( model,
				'<paragraph>foo</paragraph>' +
				'<blockObject></blockObject>' +
				'<paragraph>bar</paragraph>'
			);

			const targetRanges = [ view.createRange(
				view.createPositionAt( viewRoot.getChild( 1 ), 0 ),
				view.createPositionAt( viewRoot.getChild( 2 ).getChild( 0 ), 0 )
			) ];

			const eventData = {
				inputType: 'deleteContentBackward',
				targetRanges
			};

			fireBeforeInputEvent( eventData );

			// Verify beforeinput range.
			sinon.assert.calledOnce( beforeInputSpy );

			const inputData = beforeInputSpy.args[ 0 ][ 1 ];
			expect( inputData.inputType ).to.equal( eventData.inputType );
			expect( inputData.targetRanges[ 0 ] ).to.deep.equal( view.createRange(
				view.createPositionAt( viewRoot, 1 ),
				view.createPositionAt( viewRoot.getChild( 2 ).getChild( 0 ), 0 )
			) );

			// Verify delete event.
			sinon.assert.calledOnce( deleteSpy );

			const deleteData = deleteSpy.args[ 0 ][ 1 ];
			expect( deleteData.selectionToRemove.getFirstRange().isEqual( view.createRange(
				view.createPositionAt( viewRoot, 1 ),
				view.createPositionAt( viewRoot.getChild( 2 ).getChild( 0 ), 0 )
			) ) ).to.be.true;
		} );

		it( 'should fix range that ends in block object (deleteContentForward)', () => {
			setModelData( model,
				'<paragraph>foo</paragraph>' +
				'<blockObject></blockObject>' +
				'<paragraph>bar</paragraph>'
			);

			const targetRanges = [ view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 3 ),
				view.createPositionAt( viewRoot.getChild( 1 ), 0 )
			) ];

			const eventData = {
				inputType: 'deleteContentForward',
				targetRanges
			};

			fireBeforeInputEvent( eventData );

			// Verify beforeinput range.
			sinon.assert.calledOnce( beforeInputSpy );

			const inputData = beforeInputSpy.args[ 0 ][ 1 ];
			expect( inputData.inputType ).to.equal( eventData.inputType );
			expect( inputData.targetRanges[ 0 ] ).to.deep.equal( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 3 ),
				view.createPositionAt( viewRoot, 2 )
			) );

			// Verify delete event.
			sinon.assert.calledOnce( deleteSpy );
		} );

		it( 'should fix range that is collapsed inside an object (insertText)', () => {
			setModelData( model,
				'<paragraph>foo</paragraph>' +
				'<blockObject></blockObject>' +
				'<paragraph>bar</paragraph>'
			);

			const targetRanges = [ view.createRange(
				view.createPositionAt( viewRoot.getChild( 1 ), 0 ),
				view.createPositionAt( viewRoot.getChild( 1 ), 0 )
			) ];

			const eventData = {
				inputType: 'insertText',
				data: 'abc',
				targetRanges
			};

			fireBeforeInputEvent( eventData );

			// Verify beforeinput range.
			sinon.assert.calledOnce( beforeInputSpy );

			const inputData = beforeInputSpy.args[ 0 ][ 1 ];
			expect( inputData.inputType ).to.equal( eventData.inputType );
			expect( inputData.data ).to.equal( eventData.data );
			expect( inputData.targetRanges[ 0 ] ).to.deep.equal( view.createRange(
				view.createPositionAt( viewRoot, 1 ),
				view.createPositionAt( viewRoot, 2 )
			) );

			// Verify insertText event.
			sinon.assert.calledOnce( insertTextSpy );

			const insertTextData = insertTextSpy.args[ 0 ][ 1 ];
			expect( insertTextData.selection.getFirstRange().isEqual( view.createRange(
				view.createPositionAt( viewRoot, 1 ),
				view.createPositionAt( viewRoot, 2 )
			) ) ).to.be.true;
		} );

		it( 'should fix range that is collapsed after an object (insertText)', () => {
			// Note that this is a synthetic scenario and in real life scenarios such event (insert text)
			// should prefer to jump into the nearest position that accepts text (now it wraps the object).

			setModelData( model,
				'<paragraph>foo</paragraph>' +
				'<blockObject></blockObject>' +
				'<paragraph>bar</paragraph>'
			);

			const targetRanges = [ view.createRange(
				view.createPositionAt( viewRoot, 2 ),
				view.createPositionAt( viewRoot, 2 )
			) ];

			const eventData = {
				inputType: 'insertText',
				data: 'abc',
				targetRanges
			};

			fireBeforeInputEvent( eventData );

			// Verify beforeinput range.
			sinon.assert.calledOnce( beforeInputSpy );

			const inputData = beforeInputSpy.args[ 0 ][ 1 ];
			expect( inputData.inputType ).to.equal( eventData.inputType );
			expect( inputData.data ).to.equal( eventData.data );
			expect( inputData.targetRanges[ 0 ] ).to.deep.equal( view.createRange(
				view.createPositionAt( viewRoot, 1 ),
				view.createPositionAt( viewRoot, 2 )
			) );

			// Verify insertText event.
			sinon.assert.calledOnce( insertTextSpy );

			const insertTextData = insertTextSpy.args[ 0 ][ 1 ];
			expect( insertTextData.selection.getFirstRange().isEqual( view.createRange(
				view.createPositionAt( viewRoot, 1 ),
				view.createPositionAt( viewRoot, 2 )
			) ) ).to.be.true;
		} );

		it( 'should fix range that is collapsed before an object (insertText)', () => {
			setModelData( model,
				'<paragraph>foo</paragraph>' +
				'<blockObject></blockObject>' +
				'<paragraph>bar</paragraph>'
			);

			const targetRanges = [ view.createRange(
				view.createPositionAt( viewRoot, 1 ),
				view.createPositionAt( viewRoot, 1 )
			) ];

			const eventData = {
				inputType: 'insertText',
				data: 'abc',
				targetRanges
			};

			fireBeforeInputEvent( eventData );

			// Verify beforeinput range.
			sinon.assert.calledOnce( beforeInputSpy );

			const inputData = beforeInputSpy.args[ 0 ][ 1 ];
			expect( inputData.inputType ).to.equal( eventData.inputType );
			expect( inputData.data ).to.equal( eventData.data );
			expect( inputData.targetRanges[ 0 ] ).to.deep.equal( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 3 ),
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 3 )
			) );

			// Verify insertText event.
			sinon.assert.calledOnce( insertTextSpy );

			const insertTextData = insertTextSpy.args[ 0 ][ 1 ];
			expect( insertTextData.selection.getFirstRange().isEqual( view.createRange(
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 3 ),
				view.createPositionAt( viewRoot.getChild( 0 ).getChild( 0 ), 3 )
			) ) ).to.be.true;
		} );

		it( 'should fix range that is wrapping the block element (enter)', () => {
			setModelData( model,
				'<paragraph>foo</paragraph>' +
				'<paragraph>bar</paragraph>' +
				'<paragraph>baz</paragraph>'
			);

			const targetRanges = [ view.createRange(
				view.createPositionAt( viewRoot, 1 ),
				view.createPositionAt( viewRoot, 2 )
			) ];

			const eventData = {
				inputType: 'insertParagraph',
				targetRanges
			};

			fireBeforeInputEvent( eventData );

			// Verify beforeinput range.
			sinon.assert.calledOnce( beforeInputSpy );

			const inputData = beforeInputSpy.args[ 0 ][ 1 ];
			expect( inputData.inputType ).to.equal( eventData.inputType );
			expect( inputData.targetRanges[ 0 ] ).to.deep.equal( view.createRange(
				view.createPositionAt( viewRoot.getChild( 1 ).getChild( 0 ), 0 ),
				view.createPositionAt( viewRoot.getChild( 1 ).getChild( 0 ), 3 )
			) );

			// Verify enter event.
			sinon.assert.calledOnce( enterSpy );
		} );

		it( 'should not crash while trying to fix null range while composing', () => {
			setModelData( model, '<paragraph>a</paragraph>' );

			const targetRanges = [ null ];

			const eventData = {
				inputType: 'insertCompositionText',
				data: 'ab',
				targetRanges
			};

			viewDocument.isComposing = true;
			fireBeforeInputEvent( eventData );

			// Verify beforeinput range.
			sinon.assert.calledOnce( beforeInputSpy );

			const inputData = beforeInputSpy.args[ 0 ][ 1 ];
			expect( inputData.inputType ).to.equal( eventData.inputType );
			expect( inputData.targetRanges[ 0 ] ).to.be.null;
		} );

		function fireBeforeInputEvent( eventData ) {
			viewDocument.fire( 'beforeinput', {
				domEvent: {
					preventDefault() {}
				},
				...eventData
			} );
		}
	} );
} );
