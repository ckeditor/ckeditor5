/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

describe( 'DialogActionsView', () => {
	describe( 'constructor()', () => {
		it( 'should have a CSS class', () => {

		} );

		it( 'should have a collection of #children', () => {

		} );

		it( 'should bind the #children collection to the DOM', () => {

		} );

		describe( 'focus tracking and cycling', () => {
			it( 'should have an instance of KeystrokeHandler', () => {

			} );

			it( 'should have an instance of FocusCycler', () => {

			} );

			it( 'should have an instance of FocusTracker', () => {

			} );

			describe( 'upon pressing Tab', () => {
				it( 'should navigate buttons forward', () => {

				} );

				it( 'should cycle back to the first button when currently in the last one', () => {

				} );
			} );

			describe( 'upon pressing Shift+Tab', () => {
				it( 'should navigate buttons backward', () => {

				} );

				it( 'should cycle back to the last button when currently in the first one', () => {

				} );
			} );
		} );
	} );

	describe( 'setButtons()', () => {
		it( 'should create buttons according to definitions', () => {

		} );

		it( 'should enable #onExecute callbacks from definitions', () => {

		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the first button by default', () => {

		} );

		it( 'should support focus directionality', () => {

		} );
	} );
} );
