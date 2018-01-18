/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals setTimeout, document */

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';

import EditingController from '../../src/controller/editingcontroller';

import ViewDocument from '../../src/view/document';

import Mapper from '../../src/conversion/mapper';
import ModelConversionDispatcher from '../../src/conversion/modelconversiondispatcher';
import buildModelConverter from '../../src/conversion/buildmodelconverter';

import Model from '../../src/model/model';
import ModelPosition from '../../src/model/position';
import ModelRange from '../../src/model/range';
import ModelDocumentFragment from '../../src/model/documentfragment';

import { parse, getData as getModelData } from '../../src/dev-utils/model';
import { getData as getViewData } from '../../src/dev-utils/view';

describe( 'EditingController', () => {
	describe( 'constructor()', () => {
		let model, editing;

		beforeEach( () => {
			model = new Model();
			editing = new EditingController( model );
		} );

		afterEach( () => {
			editing.destroy();
		} );

		it( 'should create controller with properties', () => {
			expect( editing ).to.have.property( 'model' ).that.equals( model );
			expect( editing ).to.have.property( 'view' ).that.is.instanceof( ViewDocument );
			expect( editing ).to.have.property( 'mapper' ).that.is.instanceof( Mapper );
			expect( editing ).to.have.property( 'modelToView' ).that.is.instanceof( ModelConversionDispatcher );

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
			expect( editing.view.roots ).to.length( 0 );

			const modelRoot = model.document.createRoot();

			expect( model.document.roots ).to.length( 2 );
			expect( editing.view.roots ).to.length( 1 );
			expect( editing.view.getRoot().document ).to.equal( editing.view );

			expect( editing.view.getRoot().name ).to.equal( modelRoot.name ).to.equal( '$root' );
		} );
	} );

	describe( 'conversion', () => {
		let model, modelRoot, viewRoot, domRoot, editing, listener;

		beforeEach( () => {
			listener = Object.create( EmitterMixin );

			model = new Model();
			modelRoot = model.document.createRoot();

			editing = new EditingController( model );

			domRoot = document.createElement( 'div' );
			domRoot.contentEditable = true;

			document.body.appendChild( domRoot );

			viewRoot = editing.view.getRoot();
			editing.view.attachDomRoot( domRoot );

			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			model.schema.register( 'div', { inheritAllFrom: '$block' } );
			buildModelConverter().for( editing.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );
			buildModelConverter().for( editing.modelToView ).fromElement( 'div' ).toElement( 'div' );
			buildModelConverter().for( editing.modelToView ).fromMarker( 'marker' ).toHighlight( {} );

			// Note: The below code is highly overcomplicated due to #455.
			model.document.selection.removeAllRanges();
			modelRoot.removeChildren( 0, modelRoot.childCount );

			viewRoot.removeChildren( 0, viewRoot.childCount );

			const modelData = new ModelDocumentFragment( parse(
				'<paragraph>foo</paragraph>' +
				'<paragraph></paragraph>' +
				'<paragraph>bar</paragraph>',
				model.schema
			)._children );

			model.change( writer => {
				writer.insert( modelData, model.document.getRoot() );

				model.document.selection.addRange( ModelRange.createFromParentsAndOffsets(
					modelRoot.getChild( 0 ), 1, modelRoot.getChild( 0 ), 1 )
				);
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

				model.document.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets(	modelRoot.getChild( 1 ), 0, modelRoot.getChild( 1 ), 0 )
				] );
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
					ModelRange.createFromPositionAndShift( model.document.selection.getFirstPosition(), 1 )
				);

				model.document.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 1, modelRoot.getChild( 0 ), 1 )
				] );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>f{}o</p><p></p><p>bar</p>' );
		} );

		it( 'should convert selection from view to model', done => {
			listener.listenTo( editing.view, 'selectionChange', () => {
				setTimeout( () => {
					expect( getModelData( model ) ).to.equal(
						'<paragraph>foo</paragraph>' +
						'<paragraph></paragraph>' +
						'<paragraph>b[a]r</paragraph>'
					);

					done();
				} );
			} );

			editing.view.isFocused = true;
			editing.view.render();

			const domSelection = document.getSelection();
			domSelection.removeAllRanges();
			const domBar = domRoot.childNodes[ 2 ].childNodes[ 0 ];
			const domRange = document.createRange();
			domRange.setStart( domBar, 1 );
			domRange.setEnd( domBar, 2 );
			domSelection.addRange( domRange );
		} );

		it( 'should convert collapsed selection', () => {
			model.change( () => {
				model.document.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 2 ), 1, modelRoot.getChild( 2 ), 1 )
				] );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>b{}ar</p>' );
		} );

		it( 'should convert not collapsed selection', () => {
			model.change( () => {
				model.document.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 2 ), 1, modelRoot.getChild( 2 ), 2 )
				] );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>b{a}r</p>' );
		} );

		it( 'should clear previous selection', () => {
			model.change( () => {
				model.document.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 2 ), 1, modelRoot.getChild( 2 ), 1 )
				] );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>b{}ar</p>' );

			model.change( () => {
				model.document.selection.setRanges( [
					ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 2 ), 2, modelRoot.getChild( 2 ), 2 )
				] );
			} );

			expect( getViewData( editing.view ) ).to.equal( '<p>foo</p><p></p><p>ba{}r</p>' );
		} );

		it( 'should convert adding marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( () => {
				model.markers.set( 'marker', range );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>f<span>oo</span></p><p></p><p><span>ba</span>r</p>' );
		} );

		it( 'should convert removing marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( () => {
				model.markers.set( 'marker', range );
			} );

			model.change( () => {
				model.markers.remove( 'marker' );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>foo</p><p></p><p>bar</p>' );
		} );

		it( 'should convert changing marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( () => {
				model.markers.set( 'marker', range );
			} );

			const range2 = new ModelRange( new ModelPosition( modelRoot, [ 0, 0 ] ), new ModelPosition( modelRoot, [ 0, 2 ] ) );

			model.change( () => {
				model.markers.set( 'marker', range2 );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p><span>fo</span>o</p><p></p><p>bar</p>' );
		} );

		it( 'should convert insertion into marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( () => {
				model.markers.set( 'marker', range );
			} );

			model.change( writer => {
				writer.insertText( 'xyz', new ModelPosition( modelRoot, [ 1, 0 ] ) );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>f<span>oo</span></p><p><span>xyz</span></p><p><span>ba</span>r</p>' );
		} );

		it( 'should convert move to marker', () => {
			const range = new ModelRange( new ModelPosition( modelRoot, [ 0, 1 ] ), new ModelPosition( modelRoot, [ 2, 2 ] ) );

			model.change( () => {
				model.markers.set( 'marker', range );
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

			model.change( () => {
				model.markers.set( 'marker', range );
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

			model.change( () => {
				model.markers.set( 'marker', range );
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
	} );

	describe( 'marker clearing', () => {
		let model, modelRoot, editing, domRoot, mcd, p1;

		beforeEach( () => {
			model = new Model();
			modelRoot = model.document.createRoot();

			editing = new EditingController( model );

			domRoot = document.createElement( 'div' );
			domRoot.contentEditable = true;

			document.body.appendChild( domRoot );

			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			model.schema.register( 'div', { inheritAllFrom: '$block' } );
			buildModelConverter().for( editing.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );
			buildModelConverter().for( editing.modelToView ).fromElement( 'div' ).toElement( 'div' );
			buildModelConverter().for( editing.modelToView ).fromMarker( 'marker' ).toHighlight( {} );

			const modelData = new ModelDocumentFragment( parse(
				'<paragraph>foo</paragraph>' +
				'<paragraph>bar</paragraph>',
				model.schema
			)._children );

			model.change( writer => {
				writer.insert( modelData, modelRoot );
				p1 = modelRoot.getChild( 0 );

				model.document.selection.addRange( ModelRange.createFromParentsAndOffsets( p1, 0, p1, 0 ) );
			} );

			mcd = editing.modelToView;
			sinon.spy( mcd, 'convertMarkerRemove' );
		} );

		afterEach( () => {
			document.body.removeChild( domRoot );
			editing.destroy();
		} );

		it( 'should remove marker from view if it will be affected by insert operation', () => {
			model.change( writer => {
				writer.setMarker( 'marker', ModelRange.createFromParentsAndOffsets( p1, 1, p1, 2 ) );
			} );

			// Adding with 'high' priority, because `applyOperation` is decorated - its default callback is fired with 'normal' priority.
			model.on( 'applyOperation', () => {
				expect( mcd.convertMarkerRemove.calledOnce ).to.be.true;
				expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<p>foo</p><p>bar</p>' );
			}, { priority: 'high' } );

			model.change( writer => {
				writer.insertText( 'a', p1, 0 );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<p>af<span>o</span>o</p><p>bar</p>' );
		} );

		it( 'should remove marker from view if it will be affected by remove operation', () => {
			model.change( writer => {
				writer.setMarker( 'marker', ModelRange.createFromParentsAndOffsets( p1, 1, p1, 2 ) );
			} );

			// Adding with 'high' priority, because `applyOperation` is decorated - its default callback is fired with 'normal' priority.
			model.on( 'applyOperation', () => {
				expect( mcd.convertMarkerRemove.calledOnce ).to.be.true;
				expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<p>foo</p><p>bar</p>' );
			}, { priority: 'high' } );

			model.change( writer => {
				writer.remove( ModelRange.createFromParentsAndOffsets( p1, 0, p1, 1 ) );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<p><span>o</span>o</p><p>bar</p>' );
		} );

		it( 'should remove marker from view if it will be affected by move operation', () => {
			model.change( writer => {
				writer.setMarker( 'marker', ModelRange.createFromParentsAndOffsets( p1, 1, p1, 2 ) );
			} );

			// Adding with 'high' priority, because `applyOperation` is decorated - its default callback is fired with 'normal' priority.
			model.on( 'applyOperation', () => {
				expect( mcd.convertMarkerRemove.calledOnce ).to.be.true;
				expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<p>foo</p><p>bar</p>' );
			}, { priority: 'high' } );

			model.change( writer => {
				const p2 = p1.nextSibling;

				writer.move( ModelRange.createFromParentsAndOffsets( p2, 0, p2, 2 ), p1, 0 );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<p>baf<span>o</span>o</p><p>r</p>' );
		} );

		it( 'should remove marker from view if it will be affected by rename operation', () => {
			model.change( writer => {
				writer.setMarker( 'marker', ModelRange.createFromParentsAndOffsets( modelRoot, 0, modelRoot, 1 ) );
			} );

			// Adding with 'high' priority, because `applyOperation` is decorated - its default callback is fired with 'normal' priority.
			model.on( 'applyOperation', () => {
				expect( mcd.convertMarkerRemove.calledOnce ).to.be.true;
				expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<p>foo</p><p>bar</p>' );
			}, { priority: 'high' } );

			model.change( writer => {
				writer.rename( p1, 'div' );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<div><span>foo</span></div><p>bar</p>' );
		} );

		it( 'should remove marker from view if it will be affected by marker operation', () => {
			model.change( writer => {
				writer.setMarker( 'marker', ModelRange.createFromParentsAndOffsets( p1, 1, p1, 2 ) );
			} );

			// Adding with 'high' priority, because `applyOperation` is decorated - its default callback is fired with 'normal' priority.
			model.on( 'applyOperation', () => {
				expect( mcd.convertMarkerRemove.calledOnce ).to.be.true;
				expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<p>foo</p><p>bar</p>' );
			}, { priority: 'high' } );

			model.change( writer => {
				const p2 = p1.nextSibling;

				writer.setMarker( 'marker', ModelRange.createFromParentsAndOffsets( p2, 1, p2, 2 ) );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<p>foo</p><p>b<span>a</span>r</p>' );
		} );

		it( 'should remove marker from view if it is removed through marker collection', () => {
			model.change( writer => {
				writer.setMarker( 'marker', ModelRange.createFromParentsAndOffsets( p1, 1, p1, 2 ) );
			} );

			// Adding with 'high' priority, because `applyOperation` is decorated - its default callback is fired with 'normal' priority.
			model.markers.on( 'remove:marker', () => {
				expect( mcd.convertMarkerRemove.calledOnce ).to.be.true;
				expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<p>foo</p><p>bar</p>' );
			}, { priority: 'low' } );

			model.change( () => {
				model.markers.remove( 'marker' );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		it( 'should not remove marker if applied operation is an attribute operation', () => {
			model.change( writer => {
				writer.setMarker( 'marker', ModelRange.createFromParentsAndOffsets( p1, 1, p1, 2 ) );
			} );

			// Adding with 'high' priority, because `applyOperation` is decorated - its default callback is fired with 'normal' priority.
			model.on( 'applyOperation', () => {
				expect( mcd.convertMarkerRemove.calledOnce ).to.be.false;
				expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<p>f<span>o</span>o</p><p>bar</p>' );
			}, { priority: 'high' } );

			model.change( writer => {
				writer.setAttribute( 'foo', 'bar', ModelRange.createFromParentsAndOffsets( p1, 0, p1, 2 ) );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<p>f<span>o</span>o</p><p>bar</p>' );
		} );

		it( 'should not crash if multiple operations affect a marker', () => {
			model.change( writer => {
				writer.setMarker( 'marker', ModelRange.createFromParentsAndOffsets( p1, 1, p1, 2 ) );
			} );

			model.change( writer => {
				writer.insertText( 'a', p1, 0 );
				writer.insertText( 'a', p1, 0 );
				writer.insertText( 'a', p1, 0 );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<p>aaaf<span>o</span>o</p><p>bar</p>' );
		} );

		it( 'should not crash if marker is removed, added and removed #1', () => {
			model.change( writer => {
				writer.setMarker( 'marker', ModelRange.createFromParentsAndOffsets( p1, 1, p1, 2 ) );
			} );

			model.change( writer => {
				writer.insertText( 'a', p1, 0 );
				writer.setMarker( 'marker', ModelRange.createFromParentsAndOffsets( p1, 3, p1, 4 ) );
				writer.insertText( 'a', p1, 0 );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<p>aafo<span>o</span></p><p>bar</p>' );
		} );

		it( 'should not crash if marker is removed, added and removed #2', () => {
			model.change( writer => {
				writer.setMarker( 'marker', ModelRange.createFromParentsAndOffsets( p1, 1, p1, 2 ) );
			} );

			model.change( writer => {
				writer.removeMarker( 'marker' );
				writer.setMarker( 'marker', ModelRange.createFromParentsAndOffsets( p1, 0, p1, 1 ) );
				writer.removeMarker( 'marker' );
			} );

			expect( getViewData( editing.view, { withoutSelection: true } ) ).to.equal( '<p>foo</p><p>bar</p>' );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should remove listenters', () => {
			const model = new Model();
			model.document.createRoot();
			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );

			const editing = new EditingController( model );

			const spy = sinon.spy();

			editing.modelToView.on( 'insert:$element', spy );

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

			const editing = new EditingController( model );

			const spy = sinon.spy( editing.view, 'destroy' );

			editing.destroy();

			expect( spy.called ).to.be.true;
		} );
	} );
} );
