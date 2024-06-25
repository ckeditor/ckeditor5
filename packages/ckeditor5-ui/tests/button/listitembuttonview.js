/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import ListItemButtonView, { CheckIconHolderView } from '../../src/button/listitembuttonview.js';
import ButtonView from '../../src/button/buttonview.js';

describe( 'ListItemButtonView', () => {
	let locale, view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = { t() {} };

		view = new ListItemButtonView( locale );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should inherit from ButtonView', () => {
			expect( view ).to.be.instanceOf( ButtonView );
		} );

		it( 'should initialize with hasCheckSpace set to false', () => {
			expect( view.hasCheckSpace ).to.be.false;
		} );

		it( 'should initialize with isToggleable set to false', () => {
			expect( view.isToggleable ).to.be.false;
		} );

		it( 'should initialize with proper class names', () => {
			expect( [ ...view.element.classList ] ).to.be.deep.equal( [
				'ck',
				'ck-button',
				'ck-off',
				'ck-list-item-button'
			] );
		} );
	} );

	describe( 'render()', () => {
		it( 'should render check holder if initially visible', () => {
			view = new ListItemButtonView( locale );
			view.isToggleable = true;
			view.render();

			expect( view.element.querySelector( '.ck-list-item-button__check-holder' ) ).not.to.be.null;
		} );
	} );

	describe( 'isToggleable', () => {
		it( 'should bind class names properly when isToggleable is set to true', () => {
			view.isToggleable = true;

			expect( view.element.classList.contains( 'ck-list-item-button_toggleable' ) ).to.be.true;
		} );
	} );

	describe( '_hasCheck', () => {
		const possibleRenderStates = [
			{ isToggleable: false, checkHolderSpace: false, rendered: false },
			{ isToggleable: false, checkHolderSpace: true, rendered: true },
			{ isToggleable: true, checkHolderSpace: false, rendered: true },
			{ isToggleable: true, checkHolderSpace: true, rendered: true }
		];

		for ( const { isToggleable, checkHolderSpace, rendered } of possibleRenderStates ) {
			it(
				`should render checkbox holder when isToggleable=${ isToggleable } and hasCheckSpace=${ checkHolderSpace }`,
				() => {
					view.isToggleable = isToggleable;
					view.hasCheckSpace = checkHolderSpace;

					expect( !!view.element.querySelector( '.ck-list-item-button__check-holder' ) ).to.be.equal( rendered );
				}
			);
		}

		it( 'should remove check holder when isToggleable is set to false', () => {
			view.isToggleable = true;
			expect( view.element.querySelector( '.ck-list-item-button__check-holder' ) ).not.to.be.null;

			view.isToggleable = false;
			expect( view.element.querySelector( '.ck-list-item-button__check-holder' ) ).to.be.null;
		} );
	} );

	describe( '_checkIconHolderView', () => {
		it( 'should be instance of CheckIconHolderView', () => {
			expect( view._checkIconHolderView ).to.be.instanceOf( CheckIconHolderView );
		} );

		it( 'should have `isOn` bound to parent view', () => {
			// When is not toggleable, the check icon should be hidden.
			view.isToggleable = false;
			view.isOn = true;
			expect( view._checkIconHolderView.isOn ).to.be.false;

			view.isOn = false;
			expect( view._checkIconHolderView.isOn ).to.be.false;

			// When is toggleable, the check icon should be visible.
			view.isToggleable = true;
			view.isOn = true;
			expect( view._checkIconHolderView.isOn ).to.be.true;

			view.isOn = false;
			expect( view._checkIconHolderView.isOn ).to.be.false;
		} );
	} );
} );

describe( 'CheckIconHolderView', () => {
	let view;

	beforeEach( () => {
		view = new CheckIconHolderView();
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should initialize with proper class names', () => {
			expect( [ ...view.element.classList ] ).to.be.deep.equal( [
				'ck',
				'ck-list-item-button__check-holder',
				'ck-off'
			] );
		} );
	} );

	describe( 'render()', () => {
		it( 'should render icon if initially isOn=true', () => {
			view = new CheckIconHolderView();
			view.isOn = true;
			view.render();

			expect( view.element.querySelector( '.ck-list-item-button__check-icon' ) ).not.to.be.null;
		} );
	} );

	describe( 'isOn', () => {
		it( 'should bind class names properly when isOn is set to true', () => {
			view.isOn = true;
			expect( view.element.classList.contains( 'ck-on' ) ).to.be.true;
			expect( view.element.classList.contains( 'ck-off' ) ).to.be.false;

			view.isOn = false;
			expect( view.element.classList.contains( 'ck-on' ) ).to.be.false;
			expect( view.element.classList.contains( 'ck-off' ) ).to.be.true;
		} );

		it( 'should render icon with proper class depending on isOn flag', () => {
			expect( view.element.querySelector( '.ck-list-item-button__check-icon' ) ).to.be.null;

			view.isOn = true;
			expect( view.element.querySelector( '.ck-list-item-button__check-icon' ) ).not.to.be.null;

			view.isOn = false;
			expect( view.element.querySelector( '.ck-list-item-button__check-icon' ) ).to.be.null;
		} );
	} );
} );
