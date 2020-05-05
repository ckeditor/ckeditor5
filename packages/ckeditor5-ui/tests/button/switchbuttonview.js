/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import SwitchButtonView from '../../src/button/switchbuttonview';
import View from '../../src/view';

describe( 'SwitchButtonView', () => {
	let locale, view;

	beforeEach( () => {
		locale = { t() {} };

		view = new SwitchButtonView( locale );
		view.render();
	} );

	describe( 'constructor()', () => {
		it( 'creates #toggleSwitchView', () => {
			expect( view.toggleSwitchView ).to.be.instanceOf( View );
		} );

		it( 'sets CSS class', () => {
			expect( view.element.classList.contains( 'ck-switchbutton' ) ).to.be.true;
		} );

		it( 'sets isToggleable flag to true', () => {
			expect( view.isToggleable ).to.be.true;
		} );
	} );

	describe( 'render', () => {
		it( 'adds #toggleSwitchView to #children', () => {
			expect( view.children.get( 2 ) ).to.equal( view.toggleSwitchView );
		} );
	} );

	describe( '#toggleSwitchView', () => {
		it( 'has proper DOM structure', () => {
			const toggleElement = view.toggleSwitchView.element;

			expect( toggleElement.classList.contains( 'ck' ) ).to.be.true;
			expect( toggleElement.classList.contains( 'ck-button__toggle' ) ).to.be.true;

			expect( toggleElement.firstChild.classList.contains( 'ck' ) ).to.be.true;
			expect( toggleElement.firstChild.classList.contains( 'ck-button__toggle__inner' ) ).to.be.true;
		} );
	} );
} );
