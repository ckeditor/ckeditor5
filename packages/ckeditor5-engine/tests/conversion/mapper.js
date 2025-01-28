/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Mapper, { MapperCache } from '../../src/conversion/mapper.js';

import ModelElement from '../../src/model/element.js';
import ModelRootElement from '../../src/model/rootelement.js';
import ModelText from '../../src/model/text.js';
import ModelPosition from '../../src/model/position.js';
import ModelRange from '../../src/model/range.js';

import ViewDocument from '../../src/view/document.js';
import ViewElement from '../../src/view/element.js';
import ViewUIElement from '../../src/view/uielement.js';
import ViewText from '../../src/view/text.js';
import ViewPosition from '../../src/view/position.js';
import ViewRange from '../../src/view/range.js';
import ViewDocumentFragment from '../../src/view/documentfragment.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';
import { ViewAttributeElement } from '../../src/index.js';

describe( 'Mapper', () => {
	let viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
	} );

	describe( 'clearBindings', () => {
		it( 'should remove all mapping', () => {
			const viewA = new ViewElement( viewDocument, 'a' );
			const viewB = new ViewElement( viewDocument, 'b' );
			const viewC = new ViewElement( viewDocument, 'c' );
			const viewD = new ViewElement( viewDocument, 'd' );

			const modelA = new ModelElement( 'a' );
			const modelB = new ModelElement( 'b' );
			const modelC = new ModelElement( 'c' );
			const modelD = new ModelElement( 'd' );

			const mapper = new Mapper();

			mapper.bindElements( modelA, viewA );
			mapper.bindElements( modelB, viewB );
			mapper.bindElements( modelC, viewC );
			mapper.bindElements( modelD, viewD );

			mapper.bindElementToMarker( viewA, 'foo' );
			mapper.bindElementToMarker( viewD, 'foo' );
			mapper.bindElementToMarker( viewD, 'bar' );

			expect( mapper.toModelElement( viewA ) ).to.equal( modelA );
			expect( mapper.toModelElement( viewB ) ).to.equal( modelB );
			expect( mapper.toModelElement( viewC ) ).to.equal( modelC );

			expect( mapper.toViewElement( modelA ) ).to.equal( viewA );
			expect( mapper.toViewElement( modelB ) ).to.equal( viewB );
			expect( mapper.toViewElement( modelC ) ).to.equal( viewC );

			expect( Array.from( mapper.markerNameToElements( 'foo' ) ) ).to.deep.equal( [ viewA, viewD ] );

			mapper.unbindViewElement( viewD );
			mapper.clearBindings();

			expect( mapper.toModelElement( viewA ) ).to.be.undefined;
			expect( mapper.toModelElement( viewB ) ).to.be.undefined;
			expect( mapper.toModelElement( viewC ) ).to.be.undefined;

			expect( mapper.toViewElement( modelA ) ).to.be.undefined;
			expect( mapper.toViewElement( modelB ) ).to.be.undefined;
			expect( mapper.toViewElement( modelC ) ).to.be.undefined;

			expect( mapper.markerNameToElements( 'foo' ) ).to.be.null;
			expect( mapper.flushUnboundMarkerNames() ).to.deep.equal( [] );
		} );
	} );

	describe( 'unbindModelElement', () => {
		it( 'should remove binding between given model element and view element that it was bound to', () => {
			const viewA = new ViewElement( viewDocument, 'a' );
			const modelA = new ModelElement( 'a' );

			const mapper = new Mapper();
			mapper.bindElements( modelA, viewA );

			expect( mapper.toModelElement( viewA ) ).to.equal( modelA );
			expect( mapper.toViewElement( modelA ) ).to.equal( viewA );

			mapper.unbindModelElement( modelA );

			expect( mapper.toModelElement( viewA ) ).to.be.undefined;
			expect( mapper.toViewElement( modelA ) ).to.be.undefined;
		} );

		it( 'should not remove binding between view and model element if view element got rebound', () => {
			const viewA = new ViewElement( viewDocument, 'a' );
			const modelA = new ModelElement( 'a' );
			const modelB = new ModelElement( 'b' );

			const mapper = new Mapper();
			mapper.bindElements( modelA, viewA );
			mapper.bindElements( modelB, viewA );

			// `modelA` is still bound to `viewA` even though `viewA` got rebound.
			expect( mapper.toViewElement( modelA ) ).to.equal( viewA );

			mapper.unbindModelElement( modelA );

			expect( mapper.toViewElement( modelA ) ).to.be.undefined;
			expect( mapper.toModelElement( viewA ) ).to.equal( modelB );
		} );
	} );

	describe( 'unbindViewElement', () => {
		it( 'should remove binding between given view element and model element that it was bound to', () => {
			const viewA = new ViewElement( viewDocument, 'a' );
			const modelA = new ModelElement( 'a' );

			const mapper = new Mapper();
			mapper.bindElements( modelA, viewA );

			expect( mapper.toModelElement( viewA ) ).to.equal( modelA );
			expect( mapper.toViewElement( modelA ) ).to.equal( viewA );

			mapper.unbindViewElement( viewA );

			expect( mapper.toModelElement( viewA ) ).to.be.undefined;
			expect( mapper.toViewElement( modelA ) ).to.be.undefined;
		} );

		it( 'should not remove binding between model and view element if model element got rebound', () => {
			const viewA = new ViewElement( viewDocument, 'a' );
			const viewB = new ViewElement( viewDocument, 'b' );
			const modelA = new ModelElement( 'a' );

			const mapper = new Mapper();
			mapper.bindElements( modelA, viewA );
			mapper.bindElements( modelA, viewB );

			// `viewA` is still bound to `modelA`, even though `modelA` got rebound.
			expect( mapper.toModelElement( viewA ) ).to.equal( modelA );

			mapper.unbindViewElement( viewA );

			expect( mapper.toModelElement( viewA ) ).to.be.undefined;
			expect( mapper.toViewElement( modelA ) ).to.equal( viewB );
		} );

		it( 'should allow deferred unbinding', () => {
			const viewA = new ViewElement( viewDocument, 'a' );
			const modelA = new ModelElement( 'a' );

			const mapper = new Mapper();
			mapper.bindElements( modelA, viewA );

			expect( mapper.toModelElement( viewA ) ).to.equal( modelA );
			expect( mapper.toViewElement( modelA ) ).to.equal( viewA );

			mapper.unbindViewElement( viewA, { defer: true } );

			expect( mapper.toModelElement( viewA ) ).to.equal( modelA );
			expect( mapper.toViewElement( modelA ) ).to.equal( viewA );

			mapper.flushDeferredBindings();

			expect( mapper.toModelElement( viewA ) ).to.be.undefined;
			expect( mapper.toViewElement( modelA ) ).to.be.undefined;
		} );

		it( 'should not unbind if element was reused after deferred unbinding', () => {
			const viewA = new ViewElement( viewDocument, 'a' );
			const viewFragmentA = new ViewDocumentFragment( viewDocument, [ viewA ] );
			const viewFragmentB = new ViewDocumentFragment( viewDocument );

			const modelA = new ModelElement( 'a' );

			const mapper = new Mapper();
			mapper.bindElements( modelA, viewA );

			expect( mapper.toModelElement( viewA ) ).to.equal( modelA );
			expect( mapper.toViewElement( modelA ) ).to.equal( viewA );
			expect( viewA.root ).to.equal( viewFragmentA );

			mapper.unbindViewElement( viewA, { defer: true } );

			expect( mapper.toModelElement( viewA ) ).to.equal( modelA );
			expect( mapper.toViewElement( modelA ) ).to.equal( viewA );
			expect( viewA.root ).to.equal( viewFragmentA );

			viewFragmentB._appendChild( viewA );

			expect( mapper.toModelElement( viewA ) ).to.equal( modelA );
			expect( mapper.toViewElement( modelA ) ).to.equal( viewA );
			expect( viewA.root ).to.equal( viewFragmentB );

			mapper.flushDeferredBindings();

			expect( mapper.toModelElement( viewA ) ).to.equal( modelA );
			expect( mapper.toViewElement( modelA ) ).to.equal( viewA );
			expect( viewA.root ).to.equal( viewFragmentB );
		} );
	} );

	describe( 'Standard mapping', () => {
		let modelDiv, modelP, modelImg,
			viewDiv, viewP, viewB, viewI, viewU, viewSup, viewImg,
			viewTextB, viewTextO, viewTextM, viewTextX, viewTextY, viewTextZZ, viewTextFOO, viewTextBAR,
			mapper;

		beforeEach( () => {
			// Tree Model:
			//
			// <div>             ---> modelDiv
			//   ├─ x
			//   ├─ <p>          ---> modelP
			//   │   ├─ y
			//   │   ├─ f {b,i}
			//   │   ├─ o {b,i}
			//   │   ├─ o {b,i}
			//   │   ├─ b
			//   │   ├─ a
			//   │   ├─ r
			//   │   ├─ <img>    ---> modelImg
			//   │   ├─ b {u}
			//   │   ├─ o {u,sup}
			//   │   └─ m {u}
			//   ├─ z
			//   └─ z
			//
			// Tree View:
			//
			// <div>                 ---> viewDiv
			//   ├─ x                ---> viewTextX
			//   ├─ <p>              ---> viewP
			//   │   ├─ y            ---> viewTextY
			//   │   ├─ <b>          ---> viewB
			//   │   │   └─ <i>      ---> viewI
			//   │   │       └─ foo  ---> viewTextFOO
			//   │   ├─ bar          ---> viewTextBAR
			//   │   ├─ <img>        ---> viewImg
			//   │   └─ <u>          ---> viewU
			//   │       ├─ b        ---> viewTextB
			//   │       ├─ <sup>    ---> viewSup
			//   │       │    └─ o   ---> viewTextO
			//   │       └─ m        ---> viewTextM
			//   └─ zz               ---> viewTextZZ

			modelImg = new ModelElement( 'img' );
			modelP = new ModelElement( 'p', {}, [
				new ModelText( 'y' ),
				new ModelText( 'foo', { b: true, i: true } ),
				new ModelText( 'bar' ),
				modelImg,
				new ModelText( 'b', { u: true } ),
				new ModelText( 'o', { u: true, sup: true } ),
				new ModelText( 'm', { u: true } )
			] );

			modelDiv = new ModelRootElement();
			modelDiv._appendChild( [
				new ModelText( 'x' ),
				modelP,
				new ModelText( 'zz' )
			] );

			viewTextB = new ViewText( viewDocument, 'b' );
			viewTextO = new ViewText( viewDocument, 'o' );
			viewTextM = new ViewText( viewDocument, 'm' );
			viewTextX = new ViewText( viewDocument, 'x' );
			viewTextY = new ViewText( viewDocument, 'y' );
			viewTextZZ = new ViewText( viewDocument, 'zz' );
			viewTextFOO = new ViewText( viewDocument, 'foo' );
			viewTextBAR = new ViewText( viewDocument, 'bar' );
			viewImg = new ViewElement( viewDocument, 'img' );
			viewSup = new ViewElement( viewDocument, 'sup', {}, [ viewTextO ] );
			viewU = new ViewElement( viewDocument, 'u', {}, [ viewTextB, viewSup, viewTextM ] );
			viewI = new ViewElement( viewDocument, 'i', {}, [ viewTextFOO ] );
			viewB = new ViewElement( viewDocument, 'b', {}, [ viewI ] );
			viewP = new ViewElement( viewDocument, 'p', {}, [ viewTextY, viewB, viewTextBAR, viewImg, viewU ] );
			viewDiv = new ViewElement( viewDocument, 'div', {}, [ viewTextX, viewP, viewTextZZ ] );

			mapper = new Mapper();
			mapper.bindElements( modelP, viewP );
			mapper.bindElements( modelDiv, viewDiv );
			mapper.bindElements( modelImg, viewImg );
		} );

		describe( 'toModelElement', () => {
			it( 'should return corresponding model element', () => {
				expect( mapper.toModelElement( viewP ) ).to.equal( modelP );
				expect( mapper.toModelElement( viewDiv ) ).to.equal( modelDiv );
				expect( mapper.toModelElement( viewImg ) ).to.equal( modelImg );
			} );
		} );

		describe( 'toViewElement', () => {
			it( 'should return corresponding view element', () => {
				expect( mapper.toViewElement( modelP ) ).to.equal( viewP );
				expect( mapper.toViewElement( modelDiv ) ).to.equal( viewDiv );
				expect( mapper.toViewElement( modelImg ) ).to.equal( viewImg );
			} );
		} );

		describe( 'toModelPosition', () => {
			it( 'should fire viewToModelPosition event and return value calculated in callback to that event', () => {
				const viewPosition = new ViewPosition( viewDiv, 0 );
				const stub = {};

				mapper.on( 'viewToModelPosition', ( evt, data ) => {
					expect( data.viewPosition.isEqual( viewPosition ) ).to.be.true;

					data.modelPosition = stub;
					// Do not stop the event. Test whether default algorithm was not called if data.modelPosition is already set.
				} );

				const result = mapper.toModelPosition( viewPosition );

				expect( result ).to.equal( stub );
			} );

			it( 'should be possible to add custom position mapping callback after default callback', () => {
				const viewPosition = new ViewPosition( viewDiv, 0 );

				// Model position to which default algorithm should map `viewPosition`.
				// This mapping is tested in a test below.
				const modelPosition = new ModelPosition( modelDiv, [ 0 ] );
				const stub = {};

				mapper.on( 'viewToModelPosition', ( evt, data ) => {
					expect( data.viewPosition.isEqual( viewPosition ) ).to.be.true;
					expect( data.modelPosition.isEqual( modelPosition ) ).to.be.true;

					data.modelPosition = stub;
				}, { priority: 'low' } );

				const result = mapper.toModelPosition( viewPosition );

				expect( result ).to.equal( stub );
			} );

			// Default algorithm tests.
			it( 'should transform viewDiv 0', () => createToModelTest( viewDiv, 0, modelDiv, 0 ) );
			it( 'should transform viewDiv 1', () => createToModelTest( viewDiv, 1, modelDiv, 1 ) );
			it( 'should transform viewDiv 2', () => createToModelTest( viewDiv, 2, modelDiv, 2 ) );
			it( 'should transform viewDiv 3', () => createToModelTest( viewDiv, 3, modelDiv, 4 ) );

			it( 'should transform viewTextX 0', () => createToModelTest( viewTextX, 0, modelDiv, 0 ) );
			it( 'should transform viewTextX 1', () => createToModelTest( viewTextX, 1, modelDiv, 1 ) );

			it( 'should transform viewP 0', () => createToModelTest( viewP, 0, modelP, 0 ) );
			it( 'should transform viewP 1', () => createToModelTest( viewP, 1, modelP, 1 ) );
			it( 'should transform viewP 2', () => createToModelTest( viewP, 2, modelP, 4 ) );
			it( 'should transform viewP 3', () => createToModelTest( viewP, 3, modelP, 7 ) );
			it( 'should transform viewP 4', () => createToModelTest( viewP, 4, modelP, 8 ) );
			it( 'should transform viewP 5', () => createToModelTest( viewP, 5, modelP, 11 ) );

			it( 'should transform viewTextY 0', () => createToModelTest( viewTextY, 0, modelP, 0 ) );
			it( 'should transform viewTextY 1', () => createToModelTest( viewTextY, 1, modelP, 1 ) );

			it( 'should transform viewB 0', () => createToModelTest( viewB, 0, modelP, 1 ) );
			it( 'should transform viewB 1', () => createToModelTest( viewB, 1, modelP, 4 ) );

			it( 'should transform viewI 0', () => createToModelTest( viewI, 0, modelP, 1 ) );
			it( 'should transform viewI 1', () => createToModelTest( viewI, 1, modelP, 4 ) );

			it( 'should transform viewTextFOO 0', () => createToModelTest( viewTextFOO, 0, modelP, 1 ) );
			it( 'should transform viewTextFOO 1', () => createToModelTest( viewTextFOO, 1, modelP, 2 ) );
			it( 'should transform viewTextFOO 2', () => createToModelTest( viewTextFOO, 2, modelP, 3 ) );
			it( 'should transform viewTextFOO 3', () => createToModelTest( viewTextFOO, 3, modelP, 4 ) );

			it( 'should transform viewTextBAR 0', () => createToModelTest( viewTextBAR, 0, modelP, 4 ) );
			it( 'should transform viewTextBAR 1', () => createToModelTest( viewTextBAR, 1, modelP, 5 ) );
			it( 'should transform viewTextBAR 2', () => createToModelTest( viewTextBAR, 2, modelP, 6 ) );
			it( 'should transform viewTextBAR 3', () => createToModelTest( viewTextBAR, 3, modelP, 7 ) );

			it( 'should transform viewU 0', () => createToModelTest( viewU, 0, modelP, 8 ) );
			it( 'should transform viewU 1', () => createToModelTest( viewU, 1, modelP, 9 ) );
			it( 'should transform viewU 2', () => createToModelTest( viewU, 2, modelP, 10 ) );
			it( 'should transform viewU 3', () => createToModelTest( viewU, 3, modelP, 11 ) );

			it( 'should transform viewTextB 0', () => createToModelTest( viewTextB, 0, modelP, 8 ) );
			it( 'should transform viewTextB 1', () => createToModelTest( viewTextB, 1, modelP, 9 ) );

			it( 'should transform viewSup 0', () => createToModelTest( viewSup, 0, modelP, 9 ) );
			it( 'should transform viewSup 1', () => createToModelTest( viewSup, 1, modelP, 10 ) );

			it( 'should transform viewTextO 0', () => createToModelTest( viewTextO, 0, modelP, 9 ) );
			it( 'should transform viewTextO 1', () => createToModelTest( viewTextO, 1, modelP, 10 ) );

			it( 'should transform viewTextM 0', () => createToModelTest( viewTextM, 0, modelP, 10 ) );
			it( 'should transform viewTextM 1', () => createToModelTest( viewTextM, 1, modelP, 11 ) );

			it( 'should transform viewTextZZ 0', () => createToModelTest( viewTextZZ, 0, modelDiv, 2 ) );
			it( 'should transform viewTextZZ 1', () => createToModelTest( viewTextZZ, 1, modelDiv, 3 ) );
			it( 'should transform viewTextZZ 2', () => createToModelTest( viewTextZZ, 2, modelDiv, 4 ) );
		} );

		describe( 'toViewPosition', () => {
			it( 'should fire modelToViewPosition event and return value calculated in callback to that event', () => {
				const modelPosition = new ModelPosition( modelDiv, [ 0 ] );
				const stub = {};

				mapper.on( 'modelToViewPosition', ( evt, data ) => {
					expect( data.modelPosition.isEqual( modelPosition ) ).to.be.true;

					data.viewPosition = stub;
					// Do not stop the event. Test whether default algorithm was not called if data.viewPosition is already set.
				} );

				const result = mapper.toViewPosition( modelPosition );

				expect( result ).to.equal( stub );
			} );

			it( 'should be possible to add custom position mapping callback after default callback', () => {
				const modelPosition = new ModelPosition( modelDiv, [ 0 ] );

				// View position to which default algorithm should map `viewPosition`.
				// This mapping is tested in a test below.
				const viewPosition = new ViewPosition( viewTextX, 0 );
				const stub = {};

				mapper.on( 'modelToViewPosition', ( evt, data ) => {
					expect( data.modelPosition.isEqual( modelPosition ) ).to.be.true;
					expect( data.viewPosition.isEqual( viewPosition ) ).to.be.true;

					data.viewPosition = stub;
				}, { priority: 'low' } );

				const result = mapper.toViewPosition( modelPosition );

				expect( result ).to.equal( stub );
			} );

			it( 'should throw an error on missing position parent view element', () => {
				// The foo element was not downcasted to view.
				const modelElement = new ModelElement( 'foo' );

				modelDiv._appendChild( modelElement );

				const modelPosition = new ModelPosition( modelElement, [ 0 ] );

				expect( () => {
					mapper.toViewPosition( modelPosition );
				} ).to.throw( CKEditorError, 'mapping-model-position-view-parent-not-found' );
			} );

			// Default algorithm tests.
			it( 'should transform modelDiv 0', () => createToViewTest( modelDiv, 0, viewTextX, 0 ) );
			it( 'should transform modelDiv 1', () => createToViewTest( modelDiv, 1, viewTextX, 1 ) );
			it( 'should transform modelDiv 2', () => createToViewTest( modelDiv, 2, viewTextZZ, 0 ) );
			it( 'should transform modelDiv 3', () => createToViewTest( modelDiv, 3, viewTextZZ, 1 ) );
			it( 'should transform modelDiv 4', () => createToViewTest( modelDiv, 4, viewTextZZ, 2 ) );

			it( 'should transform modelP 0', () => createToViewTest( modelP, 0, viewTextY, 0 ) );
			it( 'should transform modelP 1', () => createToViewTest( modelP, 1, viewTextY, 1 ) );
			it( 'should transform modelP 2', () => createToViewTest( modelP, 2, viewTextFOO, 1 ) );
			it( 'should transform modelP 3', () => createToViewTest( modelP, 3, viewTextFOO, 2 ) );
			it( 'should transform modelP 4', () => createToViewTest( modelP, 4, viewTextBAR, 0 ) );
			it( 'should transform modelP 5', () => createToViewTest( modelP, 5, viewTextBAR, 1 ) );
			it( 'should transform modelP 6', () => createToViewTest( modelP, 6, viewTextBAR, 2 ) );
			it( 'should transform modelP 7', () => createToViewTest( modelP, 7, viewTextBAR, 3 ) );
			it( 'should transform modelP 8', () => createToViewTest( modelP, 8, viewP, 4 ) );
			it( 'should transform modelP 9', () => createToViewTest( modelP, 9, viewTextB, 1 ) );
			it( 'should transform modelP 10', () => createToViewTest( modelP, 10, viewTextM, 0 ) );
			it( 'should transform modelP 11', () => createToViewTest( modelP, 11, viewP, 5 ) );

			// Below tests a particular code execution path that can happen only if cache for given mapped element ends deep (in view)
			// in that element while we request mapping that reaches somewhere further in this model element.
			it( 'should transform modelDiv 2 starting from nested cache', () => {
				// We need to create a different model and view for this sample as the one used in other tests cannot reproduce this.
				//
				// View structure is:
				//
				// <p>
				//   ├─ a
				//   ├─ <b>
				//   │   ├─ b
				//   │   ├─ <u>
				//   │   │   └─ c
				//   │   ├─ <i>
				//   │   │   └─ d
				//   │   └─ e
				//   └─ f
				//
				const modelP2 = new ModelElement( 'paragraph', {}, [
					new ModelText( 'a' ),
					new ModelText( 'b', { b: true } ),
					new ModelText( 'c', { b: true, u: true } ),
					new ModelText( 'd', { b: true, i: true } ),
					new ModelText( 'e', { b: true } ),
					new ModelText( 'f' )
				] );

				const viewTextA = new ViewText( viewDocument, 'a' );
				const viewTextB = new ViewText( viewDocument, 'b' );
				const viewTextC = new ViewText( viewDocument, 'c' );
				const viewTextD = new ViewText( viewDocument, 'd' );
				const viewTextE = new ViewText( viewDocument, 'e' );
				const viewTextF = new ViewText( viewDocument, 'f' );

				const viewU = new ViewElement( viewDocument, 'i', {}, [ viewTextC ] );
				const viewI = new ViewElement( viewDocument, 'i', {}, [ viewTextD ] );
				const viewB = new ViewElement( viewDocument, 'b', {}, [ viewTextB, viewU, viewI, viewTextE ] );

				const viewP2 = new ViewElement( viewDocument, 'p', {}, [ viewTextA, viewB, viewTextF ] );

				mapper.bindElements( modelP2, viewP2 );

				// Since tests in this suite are artificial and the view and model is modified directly, the scenario is easier to simulate.
				//
				// First request some mappings to build whole cache.
				//
				mapper.toViewPosition( ModelPosition._createAt( modelP2, 1 ) );
				mapper.toViewPosition( ModelPosition._createAt( modelP2, 2 ) );
				mapper.toViewPosition( ModelPosition._createAt( modelP2, 3 ) );
				mapper.toViewPosition( ModelPosition._createAt( modelP2, 4 ) );
				mapper.toViewPosition( ModelPosition._createAt( modelP2, 5 ) );
				mapper.toViewPosition( ModelPosition._createAt( modelP2, 6 ) );
				//
				// Then we will invalidate part of the cache by adding another letter to `<i>`.
				//
				modelP2._removeChildren( 3, 1 );
				modelP2._insertChild( 3, new ModelText( 'dd', { b: true, i: true } ) );
				viewTextD._data = 'dd';
				//
				// After invalidation the cache will end before `<i>`: `<p>a<b>b<u>c</u>|<i>dd</i>e</b>f</p>`
				//
				// Then, again request mapping for model offset at the end of `<paragraph>`.
				// This way, `Mapper` will start looking side `viewU` and will have to "traverse up" into `<p>` after reaching end of `<b>`.
				createToViewTest( modelP2, 7, viewTextF, 1 );
			} );
		} );

		describe( 'toModelRange', () => {
			it( 'should transform range', () => {
				const viewRange = ViewRange._createFromParentsAndOffsets( viewDiv, 0, viewTextFOO, 2 );
				const modelRange = mapper.toModelRange( viewRange );
				expect( modelRange.start.parent ).to.equal( modelDiv );
				expect( modelRange.start.offset ).to.equal( 0 );
				expect( modelRange.end.parent ).to.equal( modelP );
				expect( modelRange.end.offset ).to.equal( 3 );
			} );
		} );

		describe( 'toViewRange', () => {
			it( 'should transform range', () => {
				const modelRange = new ModelRange( ModelPosition._createAt( modelDiv, 0 ), ModelPosition._createAt( modelP, 3 ) );
				const viewRange = mapper.toViewRange( modelRange );
				expect( viewRange.start.parent ).to.equal( viewTextX );
				expect( viewRange.start.offset ).to.equal( 0 );
				expect( viewRange.end.parent ).to.equal( viewTextFOO );
				expect( viewRange.end.offset ).to.equal( 2 );
			} );
		} );

		it( 'should throw if model offset is to big and cannot be found in mapped view element', () => {
			expect( () => {
				mapper.findPositionIn( viewDiv, 5 );
			} ).to.throw( CKEditorError, 'mapping-model-offset-not-found' );
		} );

		function createToViewTest( modelElement, modelOffset, viewElement, viewOffset ) {
			const modelPosition = ModelPosition._createAt( modelElement, modelOffset );
			const viewPosition = mapper.toViewPosition( modelPosition );
			expect( viewPosition.parent ).to.equal( viewElement );
			expect( viewPosition.offset ).to.equal( viewOffset );
		}

		function createToModelTest( viewElement, viewOffset, modelElement, modelOffset ) {
			const viewPosition = new ViewPosition( viewElement, viewOffset );
			const modelPosition = mapper.toModelPosition( viewPosition );
			expect( modelPosition.parent ).to.equal( modelElement );
			expect( modelPosition.offset ).to.equal( modelOffset );
		}
	} );

	describe( 'Widget mapping', () => {
		let modelDiv, modelWidget, modelImg, modelCaption,
			viewDiv, viewWidget, viewMask, viewWrapper, viewImg, viewCaption,
			viewTextX, viewTextFOO, viewTextZZ, viewTextLABEL,
			mapper;

		beforeEach( () => {
			// Tree Model:
			//
			// <div>                 ---> modelDiv
			//   ├─ x
			//   ├─ <widget>         ---> modelWidget
			//   │   ├─ <img>        ---> modelImg
			//   │   └─ <caption>    ---> modelCaption
			//   │       ├─ f
			//   │       ├─ o
			//   │       └─ o
			//   ├─ z
			//   └─ z
			//
			// Tree View:
			//
			// <div>                     ---> viewDiv
			//   ├─ x                    ---> viewTextX
			//   ├─ <widget>             ---> viewWidget
			//   │   ├─ <mask>           ---> viewMask
			//   │   │   └─ label        ---> viewTextLABEL
			//   │   └─ <wrapper>        ---> viewWrapper
			//   │       ├─ <img>        ---> viewImg
			//   │       └─ <caption>    ---> viewCaption
			//   │           └─ foo      ---> viewTextFOO
			//   └─ zz                   ---> viewTextZZ

			modelImg = new ModelElement( 'img' );
			modelCaption = new ModelElement( 'caption', {}, new ModelText( 'foo' ) );
			modelWidget = new ModelElement( 'widget', {}, [ modelImg, modelCaption ] );
			modelDiv = new ModelRootElement();
			modelDiv._appendChild( [ new ModelText( 'x' ), modelWidget, new ModelText( 'zz' ) ] );

			viewTextX = new ViewText( viewDocument, 'y' );
			viewTextZZ = new ViewText( viewDocument, 'zz' );
			viewTextFOO = new ViewText( viewDocument, 'foo' );
			viewTextLABEL = new ViewText( viewDocument, 'label' );

			viewImg = new ViewElement( viewDocument, 'img' );
			viewMask = new ViewElement( viewDocument, 'mask', {}, [ viewTextLABEL ] );
			viewCaption = new ViewElement( viewDocument, 'caption', {}, [ viewTextFOO ] );
			viewWrapper = new ViewElement( viewDocument, 'wrapper', {}, [ viewImg, viewCaption ] );
			viewWidget = new ViewElement( viewDocument, 'widget', [ viewMask, viewWrapper ] );
			viewDiv = new ViewElement( viewDocument, 'div', {}, [ viewTextX, viewWidget, viewTextZZ ] );

			mapper = new Mapper();
			mapper.bindElements( modelDiv, viewDiv );
			mapper.bindElements( modelWidget, viewWidget );
			mapper.bindElements( modelImg, viewImg );
			mapper.bindElements( modelCaption, viewCaption );
		} );

		describe( 'toModelElement', () => {
			it( 'should return corresponding model element', () => {
				expect( mapper.toModelElement( viewDiv ) ).to.equal( modelDiv );
				expect( mapper.toModelElement( viewWidget ) ).to.equal( modelWidget );
				expect( mapper.toModelElement( viewImg ) ).to.equal( modelImg );
				expect( mapper.toModelElement( viewCaption ) ).to.equal( modelCaption );
			} );
		} );

		describe( 'toViewElement', () => {
			it( 'should return corresponding view element', () => {
				expect( mapper.toViewElement( modelDiv ) ).to.equal( viewDiv );
				expect( mapper.toViewElement( modelWidget ) ).to.equal( viewWidget );
				expect( mapper.toViewElement( modelImg ) ).to.equal( viewImg );
				expect( mapper.toViewElement( modelCaption ) ).to.equal( viewCaption );
			} );
		} );

		describe( 'toModelPosition', () => {
			it( 'should transform viewDiv 0', () => createToModelTest( viewDiv, 0, modelDiv, 0 ) );
			it( 'should transform viewDiv 1', () => createToModelTest( viewDiv, 1, modelDiv, 1 ) );
			it( 'should transform viewDiv 2', () => createToModelTest( viewDiv, 2, modelDiv, 2 ) );
			it( 'should transform viewDiv 3', () => createToModelTest( viewDiv, 3, modelDiv, 4 ) );

			it( 'should transform viewTextX 0', () => createToModelTest( viewTextX, 0, modelDiv, 0 ) );
			it( 'should transform viewTextX 1', () => createToModelTest( viewTextX, 1, modelDiv, 1 ) );

			it( 'should transform viewTextZZ 0', () => createToModelTest( viewTextZZ, 0, modelDiv, 2 ) );
			it( 'should transform viewTextZZ 1', () => createToModelTest( viewTextZZ, 1, modelDiv, 3 ) );
			it( 'should transform viewTextZZ 2', () => createToModelTest( viewTextZZ, 2, modelDiv, 4 ) );

			it( 'should transform viewImg 0', () => createToModelTest( viewImg, 0, modelImg, 0 ) );

			it( 'should transform viewCaption 0', () => createToModelTest( viewCaption, 0, modelCaption, 0 ) );
			it( 'should transform viewCaption 1', () => createToModelTest( viewCaption, 1, modelCaption, 3 ) );

			it( 'should transform viewTextFOO 0', () => createToModelTest( viewTextFOO, 0, modelCaption, 0 ) );
			it( 'should transform viewTextFOO 1', () => createToModelTest( viewTextFOO, 1, modelCaption, 1 ) );
			it( 'should transform viewTextFOO 2', () => createToModelTest( viewTextFOO, 2, modelCaption, 2 ) );
			it( 'should transform viewTextFOO 3', () => createToModelTest( viewTextFOO, 3, modelCaption, 3 ) );
		} );

		describe( 'toViewPosition and findPositionIn', () => {
			it( 'should transform modelDiv 0', () => createToViewTest( modelDiv, 0, viewTextX, 0 ) );
			it( 'should transform modelDiv 1', () => createToViewTest( modelDiv, 1, viewTextX, 1 ) );
			it( 'should transform modelDiv 2', () => createToViewTest( modelDiv, 2, viewTextZZ, 0 ) );
			it( 'should transform modelDiv 3', () => createToViewTest( modelDiv, 3, viewTextZZ, 1 ) );
			it( 'should transform modelDiv 4', () => createToViewTest( modelDiv, 4, viewTextZZ, 2 ) );

			it( 'should transform modelImg 0', () => createToViewTest( modelImg, 0, viewImg, 0 ) );

			it( 'should transform modelCaption 0', () => createToViewTest( modelCaption, 0, viewTextFOO, 0 ) );
			it( 'should transform modelCaption 1', () => createToViewTest( modelCaption, 1, viewTextFOO, 1 ) );
			it( 'should transform modelCaption 2', () => createToViewTest( modelCaption, 2, viewTextFOO, 2 ) );
			it( 'should transform modelCaption 3', () => createToViewTest( modelCaption, 3, viewTextFOO, 3 ) );
		} );

		function createToViewTest( modelElement, modelOffset, viewElement, viewOffset ) {
			const modelPosition = ModelPosition._createAt( modelElement, modelOffset );
			let viewPosition = mapper.toViewPosition( modelPosition );
			expect( viewPosition.parent ).to.equal( viewElement );
			expect( viewPosition.offset ).to.equal( viewOffset );

			viewPosition = mapper.findPositionIn( mapper.toViewElement( modelElement ), modelOffset );
			expect( viewPosition.parent ).to.equal( viewElement );
			expect( viewPosition.offset ).to.equal( viewOffset );
		}

		function createToModelTest( viewElement, viewOffset, modelElement, modelOffset ) {
			const viewPosition = new ViewPosition( viewElement, viewOffset );
			const modelPosition = mapper.toModelPosition( viewPosition );
			expect( modelPosition.parent ).to.equal( modelElement );
			expect( modelPosition.offset ).to.equal( modelOffset );
		}
	} );

	describe( 'List mapping (test registerViewToModelLength)', () => {
		let mapper, modelRoot, viewRoot,
			modelListItem1, modelListItem2,
			modelListItem11, modelListItem12,
			viewList, viewListNested,
			viewListItem1, viewListItem2,
			viewListItem11, viewListItem12;

		before( () => {
			modelListItem1 = new ModelElement( 'listItem', null, new ModelText( 'aaa' ) );
			modelListItem11 = new ModelElement( 'listItem', null, new ModelText( 'bbb' ) );
			modelListItem12 = new ModelElement( 'listItem', null, new ModelText( 'ccc' ) );
			modelListItem2 = new ModelElement( 'listItem', null, new ModelText( 'xxx' ) );

			modelRoot = new ModelRootElement( 'root', null, [ modelListItem1, modelListItem11, modelListItem12, modelListItem2 ] );

			viewListItem11 = new ViewElement( viewDocument, 'li', null, new ViewText( viewDocument, 'bbb' ) );
			viewListItem12 = new ViewElement( viewDocument, 'li', null, new ViewText( viewDocument, 'ccc' ) );
			viewListNested = new ViewElement( viewDocument, 'ul', null, [ viewListItem11, viewListItem12 ] );

			viewListItem1 = new ViewElement( viewDocument, 'li', null, [ new ViewText( viewDocument, 'aaa' ), viewListNested ] );
			viewListItem2 = new ViewElement( viewDocument, 'li', null, new ViewText( viewDocument, 'ddd' ) );
			viewList = new ViewElement( viewDocument, 'ul', null, [ viewListItem1, viewListItem2 ] );

			viewRoot = new ViewElement( viewDocument, 'div', null, viewList );

			mapper = new Mapper();
			mapper.bindElements( modelRoot, viewRoot );
			mapper.bindElements( modelListItem1, viewListItem1 );
			mapper.bindElements( modelListItem11, viewListItem11 );
			mapper.bindElements( modelListItem12, viewListItem12 );
			mapper.bindElements( modelListItem2, viewListItem2 );

			function getViewListItemLength( element ) {
				let length = 1;

				for ( const child of element.getChildren() ) {
					if ( child.name == 'ul' || child.name == 'ol' ) {
						for ( const item of child.getChildren() ) {
							length += getViewListItemLength( item );
						}
					}
				}

				return length;
			}

			mapper.registerViewToModelLength( 'li', getViewListItemLength );
		} );

		describe( 'toModelPosition', () => {
			it( 'should transform viewRoot 0', () => createToModelTest( viewRoot, 0, modelRoot, 0 ) );
			it( 'should transform viewRoot 1', () => createToModelTest( viewRoot, 1, modelRoot, 4 ) );
			it( 'should transform viewList 0', () => createToModelTest( viewList, 0, modelRoot, 0 ) );
			it( 'should transform viewList 1', () => createToModelTest( viewList, 1, modelRoot, 3 ) );
			it( 'should transform viewList 2', () => createToModelTest( viewList, 2, modelRoot, 4 ) );
		} );

		function createToModelTest( viewElement, viewOffset, modelElement, modelOffset ) {
			const viewPosition = new ViewPosition( viewElement, viewOffset );
			const modelPosition = mapper.toModelPosition( viewPosition );
			expect( modelPosition.parent ).to.equal( modelElement );
			expect( modelPosition.offset ).to.equal( modelOffset );
		}
	} );

	describe( 'Markers mapping', () => {
		let mapper;

		beforeEach( () => {
			mapper = new Mapper();
		} );

		it( 'should bind element to a marker name', () => {
			const view = new ViewElement( viewDocument, 'a' );

			mapper.bindElementToMarker( view, 'marker' );

			const elements = mapper.markerNameToElements( 'marker' );

			expect( elements ).to.be.instanceof( Set );
			expect( elements.size ).to.equal( 1 );
			expect( elements.has( view ) ).to.be.true;
		} );

		it( 'should bind multiple elements to a marker name', () => {
			const viewA = new ViewElement( viewDocument, 'a' );
			const viewB = new ViewElement( viewDocument, 'b' );
			const viewC = new ViewElement( viewDocument, 'c' );

			mapper.bindElementToMarker( viewA, 'marker' );
			mapper.bindElementToMarker( viewB, 'marker' );
			mapper.bindElementToMarker( viewC, 'marker' );

			const elements = Array.from( mapper.markerNameToElements( 'marker' ) );

			expect( elements ).to.deep.equal( [ viewA, viewB, viewC ] );
		} );

		it( 'should unbind element from a marker name', () => {
			const viewA = new ViewElement( viewDocument, 'a' );
			const viewB = new ViewElement( viewDocument, 'b' );

			mapper.bindElementToMarker( viewA, 'marker' );
			mapper.bindElementToMarker( viewA, 'markerB' );
			mapper.bindElementToMarker( viewB, 'marker' );

			mapper.unbindElementFromMarkerName( viewA, 'marker' );

			expect( Array.from( mapper.markerNameToElements( 'marker' ) ) ).to.deep.equal( [ viewB ] );
			expect( Array.from( mapper.markerNameToElements( 'markerB' ) ) ).to.deep.equal( [ viewA ] );

			mapper.unbindElementFromMarkerName( viewB, 'marker' );

			expect( mapper.markerNameToElements( 'marker' ) ).to.be.null;

			// Removing an element from non-existing group or non-bound element should not cause a crash.
			mapper.unbindElementFromMarkerName( viewB, 'marker' );

			expect( mapper.markerNameToElements( 'marker' ) ).to.be.null;
		} );
	} );

	it( 'should pass isPhantom flag to model-to-view position mapping callback', () => {
		const mapper = new Mapper();

		mapper.on( 'modelToViewPosition', ( evt, data ) => {
			expect( data.isPhantom ).to.be.true;

			evt.stop();
		} );

		mapper.toViewPosition( {}, { isPhantom: true } );
	} );

	describe( 'getModelLength', () => {
		let mapper;

		beforeEach( () => {
			mapper = new Mapper();
		} );

		it( 'should return length according to callback added by registerViewToModelLength', () => {
			const viewElement = new ViewElement( viewDocument, 'span' );

			mapper.registerViewToModelLength( 'span', () => 4 );

			expect( mapper.getModelLength( viewElement ) ).to.equal( 4 );
		} );

		it( 'should return 1 for mapped elements', () => {
			const viewElement = new ViewElement( viewDocument, 'span' );
			const modelElement = new ModelElement( 'span' );
			mapper.bindElements( modelElement, viewElement );

			expect( mapper.getModelLength( viewElement ) ).to.equal( 1 );
		} );

		it( 'should return 0 for ui elements', () => {
			const viewUiElement = new ViewUIElement( viewDocument, 'span' );

			expect( mapper.getModelLength( viewUiElement ) ).to.equal( 0 );
		} );

		it( 'should return length of data for text nodes', () => {
			const viewText = new ViewText( viewDocument, 'foo' );

			expect( mapper.getModelLength( viewText ) ).to.equal( 3 );
		} );

		it( 'should return sum of length of children for unmapped element', () => {
			const modelP = new ModelElement( 'p' );
			const viewP = new ViewElement( viewDocument, 'p' );
			const viewUi = new ViewUIElement( viewDocument, 'span' );
			const viewFoo = new ViewText( viewDocument, 'foo' );
			const viewCallback = new ViewElement( viewDocument, 'xxx' );
			const viewDiv = new ViewElement( viewDocument, 'div', null, [ viewP, viewUi, viewFoo, viewCallback ] );

			mapper.bindElements( modelP, viewP );
			mapper.registerViewToModelLength( 'xxx', () => 2 );

			expect( mapper.getModelLength( viewDiv ) ).to.equal( 6 );
		} );
	} );

	describe( 'findMappedViewAncestor()', () => {
		it( 'should return for given view position the closest ancestor which is mapped to a model element', () => {
			const mapper = new Mapper();

			const modelP = new ModelElement( 'p' );
			const modelDiv = new ModelElement( 'div' );

			const viewText = new ViewText( viewDocument, 'foo' );
			const viewSpan = new ViewElement( viewDocument, 'span', null, viewText );
			const viewP = new ViewElement( viewDocument, 'p', null, viewSpan );
			const viewDiv = new ViewElement( viewDocument, 'div', null, viewP );

			mapper.bindElements( modelP, viewP );
			mapper.bindElements( modelDiv, viewDiv );

			// <div><p><span>f{}oo</span></p></div>

			const viewPosition = new ViewPosition( viewText, 1 );

			const viewMappedAncestor = mapper.findMappedViewAncestor( viewPosition );

			expect( viewMappedAncestor ).to.equal( viewP );
		} );
	} );

	describe( 'flushUnboundMarkerNames()', () => {
		it( 'should return marker names of markers which elements has been unbound and clear that list', () => {
			const viewA = new ViewElement( viewDocument, 'a' );
			const viewB = new ViewElement( viewDocument, 'b' );

			const mapper = new Mapper();

			mapper.bindElementToMarker( viewA, 'foo' );
			mapper.bindElementToMarker( viewA, 'bar' );
			mapper.bindElementToMarker( viewB, 'bar' );

			mapper.unbindViewElement( viewA );

			expect( mapper.flushUnboundMarkerNames() ).to.deep.equal( [ 'foo', 'bar' ] );
			expect( mapper.flushUnboundMarkerNames() ).to.deep.equal( [] );

			mapper.unbindViewElement( viewB );

			expect( mapper.flushUnboundMarkerNames() ).to.deep.equal( [ 'bar' ] );
			expect( mapper.flushUnboundMarkerNames() ).to.deep.equal( [] );
		} );
	} );
} );

describe( 'MapperCache', () => {
	let cache, viewContainer, viewDocument, viewTextAb, viewSpan, viewEm, viewB, viewTextCd, viewTextE, viewTextF, viewTextGh;

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		cache = new MapperCache();

		// <p>ab<span>cd<em><b>e</b>f</em></span>gh</p>.
		viewTextAb = new ViewText( viewDocument, 'ab' );
		viewTextCd = new ViewText( viewDocument, 'cd' );
		viewTextE = new ViewText( viewDocument, 'e' );
		viewTextF = new ViewText( viewDocument, 'f' );

		viewB = new ViewAttributeElement( viewDocument, 'b', null, [ viewTextE ] );
		viewEm = new ViewAttributeElement( viewDocument, 'em', null, [ viewB, viewTextF ] );
		viewSpan = new ViewAttributeElement( viewDocument, 'span', null, [ viewTextCd, viewEm ] );
		viewTextGh = new ViewText( viewDocument, 'gh' );
		viewContainer = new ViewElement( viewDocument, 'p', null, [ viewTextAb, viewSpan, viewTextGh ] );
	} );

	describe( 'getClosest()', () => {
		it( 'should start tracking and return position at the start of element if element was not tracked before', () => {
			const { viewPosition, modelOffset } = cache.getClosest( viewContainer, 6 );

			expect( viewPosition.parent ).to.equal( viewContainer );
			expect( viewPosition.offset ).to.equal( 0 );
			expect( modelOffset ).to.equal( 0 );
		} );

		it( 'should return previously saved position', () => {
			cache.startTracking( viewContainer );
			cache.save( viewContainer, 2, viewContainer, 6 );

			const { viewPosition, modelOffset } = cache.getClosest( viewContainer, 6 );

			expect( viewPosition.parent ).to.equal( viewContainer );
			expect( viewPosition.offset ).to.equal( 2 );
			expect( modelOffset ).to.equal( 6 );
		} );

		it( 'should return previously saved position (deep)', () => {
			cache.startTracking( viewContainer );
			cache.save( viewEm, 1, viewContainer, 5 );

			const { viewPosition, modelOffset } = cache.getClosest( viewContainer, 5 );

			expect( viewPosition.parent ).to.equal( viewEm );
			expect( viewPosition.offset ).to.equal( 1 );
			expect( modelOffset ).to.equal( 5 );
		} );

		it( 'should return closest saved position if exact position was not saved', () => {
			cache.startTracking( viewContainer );
			cache.save( viewContainer, 2, viewContainer, 6 );

			const { viewPosition, modelOffset } = cache.getClosest( viewContainer, 8 );

			expect( viewPosition.parent ).to.equal( viewContainer );
			expect( viewPosition.offset ).to.equal( 2 );
			expect( modelOffset ).to.equal( 6 );
		} );

		it( 'should return closest saved position if exact position was not saved (deep)', () => {
			cache.startTracking( viewContainer );
			cache.save( viewEm, 1, viewContainer, 5 );

			const { viewPosition, modelOffset } = cache.getClosest( viewContainer, 8 );

			expect( viewPosition.parent ).to.equal( viewEm );
			expect( viewPosition.offset ).to.equal( 1 );
			expect( modelOffset ).to.equal( 5 );
		} );

		it( 'should return closest saved position if exact position was not saved (multiple saved positions)', () => {
			cache.startTracking( viewContainer );

			// Save model offsets in random order to give extra spice and cover some code...
			cache.save( viewContainer, 2, viewContainer, 6 );
			cache.save( viewContainer, 3, viewContainer, 8 );
			cache.save( viewSpan, 1, viewContainer, 4 );
			cache.save( viewContainer, 1, viewContainer, 2 );

			check( 1, viewContainer, 0, 0 );
			check( 3, viewContainer, 1, 2 );
			check( 5, viewSpan, 1, 4 );
			check( 7, viewContainer, 2, 6 );
			check( 9, viewContainer, 3, 8 );
		} );

		it( 'should hoist returned position', () => {
			cache.startTracking( viewContainer );

			cache.save( viewEm, 2, viewContainer, 6 );

			check( 6, viewContainer, 2, 6 );
		} );
	} );

	describe( 'save()', () => {
		it( 'should not overwrite previously saved cache for given model offset', () => {
			cache.startTracking( viewContainer );
			cache.save( viewContainer, 2, viewContainer, 6 );
			cache.save( viewSpan, 2, viewContainer, 6 );

			const { viewPosition, modelOffset } = cache.getClosest( viewContainer, 6 );

			expect( viewPosition.parent ).to.equal( viewContainer );
			expect( viewPosition.offset ).to.equal( 2 );
			expect( modelOffset ).to.equal( 6 );
		} );
	} );

	describe( 'stopTracking()', () => {
		it( 'should remove all cache data', () => {
			cache.startTracking( viewContainer );
			cache.save( viewContainer, 2, viewContainer, 6 );
			cache.stopTracking( viewContainer );

			const { viewPosition, modelOffset } = cache.getClosest( viewContainer, 2 );

			expect( viewPosition.parent ).to.equal( viewContainer );
			expect( viewPosition.offset ).to.equal( 0 );
			expect( modelOffset ).to.equal( 0 );
		} );
	} );

	describe( 'cache invalidation', () => {
		it( 'should invalidate part of the existing cache when a node is inserted', () => {
			cache.startTracking( viewContainer );

			cache.save( viewContainer, 1, viewContainer, 2 );
			cache.save( viewContainer, 2, viewContainer, 6 );
			cache.save( viewSpan, 1, viewContainer, 4 );
			cache.save( viewContainer, 3, viewContainer, 8 );

			// <p>ab<span>cd<em><b>e</b>f</em></span>^gh</p> -> <p>ab<span>cd<em><b>e</b>f</em></span><strong></strong>gh</p>.
			// This should invalidate cache starting from `<span>` (yes, that's correct, we invalidate a bit more than necessary).
			viewContainer._insertChild( 2, new ViewAttributeElement( viewDocument, 'strong' ) );

			// Retained cached:
			check( 2, viewContainer, 1, 2 );
			check( 3, viewContainer, 1, 2 );

			// Later cache is cleared, the closest value is returned:
			check( 6, viewContainer, 1, 2 );
			check( 8, viewContainer, 1, 2 );
		} );

		it( 'should invalidate part of the existing cache when a node is inserted (deep)', () => {
			cache.startTracking( viewContainer );

			cache.save( viewContainer, 1, viewContainer, 2 );
			cache.save( viewSpan, 1, viewContainer, 4 );
			// Although we don't overwrite cache item when we save another cache for the same model offset,
			// we store metadata with `viewEm`, which affects how cache is invalidated (it can be invalidated more precisely).
			cache.save( viewEm, 1, viewContainer, 4 );
			cache.save( viewContainer, 2, viewContainer, 6 );
			cache.save( viewContainer, 3, viewContainer, 8 );

			// <p>ab<span>cd<em>^<b>e</b>f</em></span>gh</p> -> <p>ab<span>cd<em><strong></strong><b>e</b>f</em></span>gh</p>.
			// This should invalidate cache starting from `<em>`.
			viewEm._insertChild( 0, new ViewAttributeElement( viewDocument, 'strong' ) );

			// Retained cached:
			check( 2, viewContainer, 1, 2 );
			check( 3, viewContainer, 1, 2 );
			check( 4, viewSpan, 1, 4 );
			check( 5, viewSpan, 1, 4 );

			// Later cache is cleared, the closest value is returned:
			check( 6, viewSpan, 1, 4 );
			check( 8, viewSpan, 1, 4 );
		} );

		it( 'should invalidate part of the existing cache when a node is inserted (deep #2 - direct parent not cached)', () => {
			// This is a similar scenario as above, but this time, `<em>` -- the direct parent of insertion -- is not cached.
			cache.startTracking( viewContainer );

			cache.save( viewContainer, 1, viewContainer, 2 );
			cache.save( viewSpan, 1, viewContainer, 4 );
			cache.save( viewContainer, 2, viewContainer, 6 );
			cache.save( viewContainer, 3, viewContainer, 8 );

			// <p>ab<span>cd<em>^<b>e</b>f</em></span>gh</p> -> <p>ab<span>cd<em><strong></strong><b>e</b>f</em></span>gh</p>.
			// This should invalidate cache starting from before `<span>` (not before `<em>`).
			// That's because `<em>` is not cached, so we invalidate starting from before its parent.
			viewEm._insertChild( 0, new ViewAttributeElement( viewDocument, 'strong' ) );

			// Retained cached:
			check( 2, viewContainer, 1, 2 );
			check( 3, viewContainer, 1, 2 );

			// Later cache is cleared, the closest value is returned:
			check( 4, viewSpan, 1, 4 );
			check( 6, viewSpan, 1, 4 );
		} );

		it( 'should invalidate part of the existing cache when a node is inserted (deep #3 - only top element cached)', () => {
			// This is a similar scenario as above, but this time, `<em>` -- the direct parent of insertion -- is not cached.
			cache.startTracking( viewContainer );

			cache.save( viewContainer, 1, viewContainer, 2 );
			cache.save( viewContainer, 2, viewContainer, 6 );
			cache.save( viewContainer, 3, viewContainer, 8 );

			// <p>ab<span>cd<em>^<b>e</b>f</em></span>gh</p> -> <p>ab<span>cd<em><strong></strong><b>e</b>f</em></span>gh</p>.
			// This should invalidate cache starting from before `<span>` (not before `<em>`).
			// That's because `<em>` is not cached, so we invalidate starting from before its parent.
			viewEm._insertChild( 0, new ViewAttributeElement( viewDocument, 'strong' ) );

			// Retained cached:
			check( 2, viewContainer, 1, 2 );
			check( 3, viewContainer, 1, 2 );

			// Later cache is cleared, the closest value is returned:
			check( 4, viewContainer, 1, 2 );
			check( 6, viewContainer, 1, 2 );
		} );

		it( 'nothing happens if change is after valid cache', () => {
			cache.startTracking( viewContainer );

			cache.save( viewContainer, 1, viewContainer, 2 );
			cache.save( viewContainer, 2, viewContainer, 6 );

			// <p>ab<span>cd<em>ef</em></span>gh^</p> -> <p>ab<span>cd<em>ef</em></span>gh<strong></strong></p>.
			// Only `<span>` was cached so far.
			viewContainer._insertChild( 3, new ViewAttributeElement( viewDocument, 'strong' ) );

			// Retained cached:
			check( 2, viewContainer, 1, 2 );
			check( 3, viewContainer, 1, 2 );
			check( 6, viewContainer, 2, 6 );
			check( 7, viewContainer, 2, 6 );

			// No new cache added yet:
			check( 8, viewContainer, 2, 6 );
			check( 9, viewContainer, 2, 6 );
		} );

		it( 'should invalidate all cache if change is at the beginning of tracked element', () => {
			cache.startTracking( viewContainer );

			cache.save( viewContainer, 1, viewContainer, 2 );
			cache.save( viewSpan, 1, viewContainer, 4 );
			cache.save( viewContainer, 2, viewContainer, 6 );
			cache.save( viewContainer, 3, viewContainer, 8 );

			// <p>^ab<span>cd<em><b>e</b>f</em></span>gh</p> -> <p><strong></strong>ab<span>cd<em><b>e</b>f</em></span>gh</p>.
			// This should invalidate all cache.
			viewContainer._insertChild( 0, new ViewAttributeElement( viewDocument, 'strong' ) );

			// Cache is cleared, the closest value is returned:
			check( 1, viewContainer, 0, 0 );
			check( 2, viewContainer, 0, 0 );
			check( 8, viewContainer, 0, 0 );
		} );

		it( 'should invalidate cache when text node changes', () => {
			cache.startTracking( viewContainer );

			cache.save( viewContainer, 1, viewContainer, 2 );
			cache.save( viewSpan, 1, viewContainer, 4 );
			cache.save( viewContainer, 2, viewContainer, 6 );
			cache.save( viewContainer, 3, viewContainer, 8 );

			// <p>ab<span>cd<em><b>e</b>f</em></span>gh^</p> -> <p><strong></strong>ab<span>cd<em><b>e</b>f</em></span>ghi</p>.
			// This should invalidate cache starting from before `"ghi"`.
			viewTextGh._data = 'ghi';

			// Retained cached:
			check( 2, viewContainer, 1, 2 );
			check( 4, viewSpan, 1, 4 );
			check( 6, viewContainer, 2, 6 );

			// Later cache is cleared, the closest value is returned:
			check( 8, viewContainer, 2, 6 );
		} );

		it( 'should invalidate cache when text node changes (deep)', () => {
			cache.startTracking( viewContainer );

			cache.save( viewContainer, 1, viewContainer, 2 );
			cache.save( viewSpan, 1, viewContainer, 4 );
			cache.save( viewEm, 1, viewContainer, 6 );
			cache.save( viewContainer, 2, viewContainer, 6 );
			cache.save( viewContainer, 3, viewContainer, 8 );

			// <p>ab<span>cd<em><b>e^</b>f</em></span>gh</p> -> <p><strong></strong>ab<span>cd<em><b>ex</b>f</em></span></p>.
			// This should invalidate cache starting from before `"ex"`.
			viewTextE._data = 'ex';

			// Retained cached:
			check( 2, viewContainer, 1, 2 );
			check( 4, viewSpan, 1, 4 );

			// Later cache is cleared, the closest value is returned:
			check( 6, viewSpan, 1, 4 );
			check( 8, viewSpan, 1, 4 );
		} );

		it( 'should invalidate cache when text node changes (deep - text node not cached)', () => {
			cache.startTracking( viewContainer );

			cache.save( viewContainer, 1, viewContainer, 2 );
			cache.save( viewSpan, 1, viewContainer, 4 );
			cache.save( viewContainer, 2, viewContainer, 6 );
			cache.save( viewContainer, 3, viewContainer, 8 );

			// <p>ab<span>cd<em><b>e^</b>f</em></span>gh</p> -> <p><strong></strong>ab<span>cd<em><b>ex</b>f</em></span></p>.
			// This should invalidate cache starting from before `"ex"`.
			viewTextE._data = 'ex';

			// Retained cached:
			check( 2, viewContainer, 1, 2 );
			check( 4, viewSpan, 1, 4 );

			// Later cache is cleared, the closest value is returned:
			check( 6, viewSpan, 1, 4 );
			check( 8, viewSpan, 1, 4 );
		} );

		it( 'should invalidate cache if first child in tracked element has 0 model length (#1 - ui element + remove)', () => {
			// This test checks a fix for an edge case scenario bug found in multi-level lists.
			// Multi-level lists items always start from a UI element. Since it was a 0-model-length element it was not correctly saved
			// to a cache, and later on, it prevented a validation to happen (the cache thought there is nothing cached).
			const viewUIElement = new ViewUIElement( viewDocument, 'ui' );
			const viewTextX = new ViewText( viewDocument, 'x' );
			const viewB = new ViewAttributeElement( viewDocument, 'b', null, [ new ViewText( viewDocument, 'y' ) ] );
			// <p><ui />x<b>y</b></p>.
			const viewContainer2 = new ViewElement( viewDocument, 'p', null, [ viewUIElement, viewTextX, viewB ] );

			cache.startTracking( viewContainer2 );

			cache.save( viewContainer2, 1, viewContainer2, 0 ); // Note that `viewUIElement` has 0 model length, hence `modelOffset` is 0.
			cache.save( viewContainer2, 2, viewContainer2, 1 );
			cache.save( viewContainer2, 3, viewContainer2, 2 );

			check( 0, viewContainer2, 0, 0, viewContainer2 ); // Still returns position `viewContainer2, 0`, not position after UI element.
			check( 1, viewContainer2, 2, 1, viewContainer2 );
			check( 2, viewContainer2, 3, 2, viewContainer2 );
			check( 3, viewContainer2, 3, 2, viewContainer2 );

			viewContainer2._removeChildren( 1, 1 );

			// Should fully invalidate cached data.
			check( 0, viewContainer2, 0, 0, viewContainer2 );
			check( 1, viewContainer2, 0, 0, viewContainer2 );
			check( 2, viewContainer2, 0, 0, viewContainer2 );
			check( 3, viewContainer2, 0, 0, viewContainer2 );
		} );

		it( 'should invalidate cache if first child in tracked element has 0 model length (#2 - attribute element + typing)', () => {
			// This test checks a similar scenario as above, although this scenario was working before the fix.
			const viewUIElement = new ViewUIElement( viewDocument, 'ui' );
			const viewTextX = new ViewText( viewDocument, 'x' );
			const viewB = new ViewAttributeElement( viewDocument, 'b', null, [ new ViewText( viewDocument, 'y' ) ] );
			// <p><ui />x<b>y</b></p>.
			const viewContainer2 = new ViewElement( viewDocument, 'p', null, [ viewUIElement, viewTextX, viewB ] );

			cache.startTracking( viewContainer2 );

			cache.save( viewContainer2, 1, viewContainer2, 0 ); // Note that `viewUIElement` has 0 model length, hence `modelOffset` is 0.
			cache.save( viewContainer2, 2, viewContainer2, 1 );
			cache.save( viewContainer2, 3, viewContainer2, 2 );

			check( 0, viewContainer2, 0, 0, viewContainer2 ); // Still returns position `viewContainer2, 0`, not position after UI element.
			check( 1, viewContainer2, 2, 1, viewContainer2 );
			check( 2, viewContainer2, 3, 2, viewContainer2 );
			check( 3, viewContainer2, 3, 2, viewContainer2 );

			viewTextX._data = 'xx';

			// Should fully invalidate cached data.
			check( 0, viewContainer2, 0, 0, viewContainer2 );
			check( 1, viewContainer2, 0, 0, viewContainer2 );
			check( 2, viewContainer2, 0, 0, viewContainer2 );
			check( 3, viewContainer2, 0, 0, viewContainer2 );
		} );
	} );

	function check(
		modelOffsetToCheck, expectedViewParent, expectedViewOffset, expectedModelOffset, viewContainerToCheck = viewContainer
	) {
		const { viewPosition, modelOffset } = cache.getClosest( viewContainerToCheck, modelOffsetToCheck );

		expect( viewPosition.parent ).to.equal( expectedViewParent );
		expect( viewPosition.offset ).to.equal( expectedViewOffset );
		expect( modelOffset ).to.equal( expectedModelOffset );
	}
} );
