/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treecontroller */

'use strict';

import Mapper from '/ckeditor5/core/treecontroller/mapper.js';

import ModelElement from '/ckeditor5/core/treemodel/element.js';
import ModelRootElement from '/ckeditor5/core/treemodel/rootelement.js';
import ModelText from '/ckeditor5/core/treemodel/text.js';
import ModelPosition from '/ckeditor5/core/treemodel/position.js';

import ViewElement from '/ckeditor5/core/treeview/element.js';
import ViewText from '/ckeditor5/core/treeview/text.js';
import ViewPosition from '/ckeditor5/core/treeview/position.js';

describe( 'Mapper', () => {
	let modelDiv, modelP, modelImg;

	let viewDiv, viewP, viewB, viewI, viewU, viewSup, viewImg;
	let viewTextB, viewTextO, viewTextM, viewTextX, viewTextY, viewTextZZ, viewTextFOO, viewTextBAR;

	let mapper;

	before( () => {
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
			'y',
			new ModelText( 'foo', { b: true, i: true } ),
			'bar',
			modelImg,
			new ModelText( 'b', { u: true } ),
			new ModelText( 'o', { u: true, sup: true } ),
			new ModelText( 'm', { u: true } )
		] );

		modelDiv = new ModelRootElement();
		modelDiv.appendChildren( [
			'x',
			modelP,
			'zz'
		] );

		viewTextB = new ViewText( 'b' );
		viewTextO = new ViewText( 'o' );
		viewTextM = new ViewText( 'm' );
		viewTextX = new ViewText( 'x' );
		viewTextY = new ViewText( 'y' );
		viewTextZZ = new ViewText( 'zz' );
		viewTextFOO = new ViewText( 'foo' );
		viewTextBAR = new ViewText( 'bar' );
		viewImg = new ViewElement( 'img' );
		viewSup = new ViewElement( 'sup', {}, [ viewTextO ] );
		viewU = new ViewElement( 'u', {}, [ viewTextB, viewSup, viewTextM ] );
		viewI = new ViewElement( 'i', {}, [ viewTextFOO ] );
		viewB = new ViewElement( 'b', {}, [ viewI ] );
		viewP = new ViewElement( 'p', {}, [ viewTextY, viewB, viewTextBAR, viewImg, viewU ] );
		viewDiv = new ViewElement( 'div', {}, [ viewTextX, viewP, viewTextZZ ] );

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
		function createToModelTest( viewElement, viewOffset, modelElement, modelOffset ) {
			const viewPosition = new ViewPosition( viewElement, viewOffset );
			const modelPosition = mapper.toModelPosition( viewPosition );
			expect( modelPosition.parent ).to.equal( modelElement );
			expect( modelPosition.offset ).to.equal( modelOffset );
		}

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
		function createToViewTest( modelElement, modelOffset, viewElement, viewOffset ) {
			const modelPosition = ModelPosition.createFromParentAndOffset( modelElement, modelOffset );
			const viewPosition = mapper.toViewPosition( modelPosition );
			expect( viewPosition.parent ).to.equal( viewElement );
			expect( viewPosition.offset ).to.equal( viewOffset );
		}

		it( 'should transform modelDiv 0', () => createToViewTest( modelDiv, 0, viewDiv, 0 ) );
		it( 'should transform modelDiv 1', () => createToViewTest( modelDiv, 1, viewDiv, 1 ) );
		it( 'should transform modelDiv 2', () => createToViewTest( modelDiv, 2, viewDiv, 2 ) );
		it( 'should transform modelDiv 3', () => createToViewTest( modelDiv, 3, viewTextZZ, 1 ) );
		it( 'should transform modelDiv 4', () => createToViewTest( modelDiv, 4, viewDiv, 3 ) );

		it( 'should transform modelP 0', () => createToViewTest( modelP, 0, viewP, 0 ) );
		it( 'should transform modelP 1', () => createToViewTest( modelP, 1, viewP, 1 ) );
		it( 'should transform modelP 2', () => createToViewTest( modelP, 2, viewTextFOO, 1 ) );
		it( 'should transform modelP 3', () => createToViewTest( modelP, 3, viewTextFOO, 2 ) );
		it( 'should transform modelP 4', () => createToViewTest( modelP, 4, viewP, 2 ) );
		it( 'should transform modelP 5', () => createToViewTest( modelP, 5, viewTextBAR, 1 ) );
		it( 'should transform modelP 6', () => createToViewTest( modelP, 6, viewTextBAR, 2 ) );
		it( 'should transform modelP 7', () => createToViewTest( modelP, 7, viewP, 3 ) );
		it( 'should transform modelP 8', () => createToViewTest( modelP, 8, viewP, 4 ) );
		it( 'should transform modelP 9', () => createToViewTest( modelP, 9, viewU, 1 ) );
		it( 'should transform modelP 10', () => createToViewTest( modelP, 10, viewU, 2 ) );
		it( 'should transform modelP 11', () => createToViewTest( modelP, 11, viewP, 5 ) );
	} );
} );

describe( 'Mapper for widget', () => {
	let modelDiv, modelWidget, modelImg, modelCaption;

	let viewDiv, viewWidget, viewMask, viewWrapper, viewImg, viewCaption;
	let viewTextX, viewTextFOO, viewTextZZ, viewTextLABEL;

	let mapper;

	before( () => {
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
		modelCaption = new ModelElement( 'caption', {}, 'foo' );
		modelWidget = new ModelElement( 'widget', {}, [ modelImg, modelCaption ] );
		modelDiv = new ModelRootElement();
		modelDiv.appendChildren( [ 'x', modelWidget, 'zz' ] );

		viewTextX = new ViewText( 'y' );
		viewTextZZ = new ViewText( 'zz' );
		viewTextFOO = new ViewText( 'foo' );
		viewTextLABEL = new ViewText( 'label' );

		viewImg = new ViewElement( 'img' );
		viewMask = new ViewElement( 'mask', {}, [ viewTextLABEL ] );
		viewCaption = new ViewElement( 'caption', {}, [ viewTextFOO ] );
		viewWrapper = new ViewElement( 'wrapper', {}, [ viewImg, viewCaption ] );
		viewWidget = new ViewElement( 'widget', [ viewMask, viewWrapper ] );
		viewDiv = new ViewElement( 'div', {}, [ viewTextX, viewWidget, viewTextZZ ] );

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
		function createToModelTest( viewElement, viewOffset, modelElement, modelOffset ) {
			const viewPosition = new ViewPosition( viewElement, viewOffset );
			const modelPosition = mapper.toModelPosition( viewPosition );
			expect( modelPosition.parent ).to.equal( modelElement );
			expect( modelPosition.offset ).to.equal( modelOffset );
		}

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

	describe( 'toViewPosition', () => {
		function createToViewTest( modelElement, modelOffset, viewElement, viewOffset ) {
			const modelPosition = ModelPosition.createFromParentAndOffset( modelElement, modelOffset );
			const viewPosition = mapper.toViewPosition( modelPosition );
			expect( viewPosition.parent ).to.equal( viewElement );
			expect( viewPosition.offset ).to.equal( viewOffset );
		}

		it( 'should transform modelDiv 0', () => createToViewTest( modelDiv, 0, viewDiv, 0 ) );
		it( 'should transform modelDiv 1', () => createToViewTest( modelDiv, 1, viewDiv, 1 ) );
		it( 'should transform modelDiv 2', () => createToViewTest( modelDiv, 2, viewDiv, 2 ) );
		it( 'should transform modelDiv 3', () => createToViewTest( modelDiv, 3, viewTextZZ, 1 ) );
		it( 'should transform modelDiv 4', () => createToViewTest( modelDiv, 4, viewDiv, 3 ) );

		it( 'should transform modelImg 0', () => createToViewTest( modelImg, 0, viewImg, 0 ) );

		it( 'should transform modelCaption 0', () => createToViewTest( modelCaption, 0, viewCaption, 0 ) );
		it( 'should transform modelCaption 1', () => createToViewTest( modelCaption, 1, viewTextFOO, 1 ) );
		it( 'should transform modelCaption 2', () => createToViewTest( modelCaption, 2, viewTextFOO, 2 ) );
		it( 'should transform modelCaption 3', () => createToViewTest( modelCaption, 3, viewCaption, 1 ) );
	} );
} );