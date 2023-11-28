/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

describe( 'DialogView', () => {
	it( 'should have #defaultOffset set', () => {

	} );

	describe( 'constructor()', () => {
		describe( 'properties', () => {
			it( 'should include the collection of #parts', () => {

			} );

			it( 'should include an instance of KeystrokeHandler', () => {

			} );

			it( 'should include an instance of FocusTracker', () => {

			} );

			it( 'should have #isVisible set', () => {

			} );

			it( 'should have #isTransparent set', () => {

			} );

			it( 'should have #isModal set', () => {

			} );

			it( 'should have #wasMoved set', () => {

			} );

			it( 'should have #className set', () => {

			} );

			it( 'should have #position set', () => {

			} );

			it( 'should have #_top set', () => {

			} );

			it( 'should have #_left set', () => {

			} );
		} );

		describe( 'template', () => {
			describe( 'overlay', () => {
				it( 'should have CSS classes', () => {

				} );

				it( 'should have a tabindex', () => {

				} );

				it( 'should have a CSS class bound to #isModal', () => {

				} );

				it( 'should have a CSS class bound to #isVisible', () => {

				} );

				it( 'should host the dialog', () => {

				} );
			} );

			describe( 'dialog', () => {
				it( 'should have CSS classes', () => {

				} );

				it( 'should have a tabindex', () => {

				} );

				it( 'should have CSS top bound to #_top', () => {

				} );

				it( 'should have CSS left bound to #_left', () => {

				} );

				it( 'should have CSS visibility bound to #isTransparent', () => {

				} );

				it( 'should host the collection of #parts', () => {

				} );
			} );
		} );

		describe( 'focus tracking and cycling', () => {
			describe( 'upon pressing Tab', () => {
				it( 'should navigate forward', () => {

				} );

				it( 'should cycle back to the first view when currently in the last one', () => {

				} );

				it( 'should navigate across different #parts in the right order', () => {

				} );
			} );

			describe( 'upon pressing Shift+Tab', () => {
				it( 'should navigate backward', () => {

				} );

				it( 'should cycle back to the last view when currently in the first one', () => {

				} );

				it( 'should navigate across different #parts in the right order', () => {

				} );
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'should emit the event upon pressing Esc', () => {

		} );

		it( 'should move the dialog upon the #drag event', () => {

		} );

		describe( 'position update on window resize', () => {
			it( 'should update the position on window resize (if visible and not already moved)', () => {

			} );

			it( 'should not update the position on window resize (if not visible)', () => {

			} );

			it( 'should not update the position on window resize (if moved by the user)', () => {

			} );
		} );

		describe( 'position update on window scroll', () => {
			it( 'should update the position on window scroll (if visible and not already moved)', () => {

			} );

			it( 'should not update the position on window scroll (if not visible)', () => {

			} );

			it( 'should not update the position on window scroll (if moved by the user)', () => {

			} );
		} );

		describe( 'position update on #isVisible change', () => {
			it( 'should not happen if the dialog becomes invisible', () => {

			} );

			it( 'should make the dialog transparent first to avoid unnecessary visual movement', () => {

			} );

			it( 'should happen with a slight delay to allow the browser to render the content of the dialog first', () => {

			} );

			it( 'should make the dialog non-transparent after updated the position', () => {

			} );
		} );

		it( 'should focus the view when it becomes visible', () => {

		} );
	} );

	describe( 'drag&drop support', () => {
		it( 'should provide #dragHandleElement when #headerView exists', () => {

		} );

		it( 'should not provide #dragHandleElement when #headerView does not exist', () => {

		} );

		it( 'should be possible by dragging the #headerView', () => {

		} );
	} );

	describe( 'setupParts()', () => {
		it( 'should allow setting dialog title', () => {

		} );

		describe( 'close button', () => {
			it( 'should have properties set', () => {

			} );

			it( 'should fire an even upon clicking', () => {

			} );
		} );

		it( 'should allow setting dialog content (single view)', () => {

		} );

		it( 'should allow setting dialog content (multiple views)', () => {

		} );

		it( 'should allow setting dialog action buttons', () => {

		} );

		it( 'should work if the dialog has content only (no title, no action buttons)', () => {

		} );
	} );

	describe( 'focus()', () => {
		it( 'should focus the first focusable child', () => {

		} );
	} );

	describe( 'moveTo()', () => {
		it( 'should be decorated to allow customization', () => {

		} );

		it( 'should change top and left CSS properties of the dialog', () => {

		} );

		it( 'should prevent the dialog from sticking off the top edge of the viewport', () => {

		} );

		it( 'should prevent the dialog from sticking off the left edge of the viewport', () => {

		} );

		it( 'should prevent the dialog from sticking off the right edge of the viewport', () => {

		} );

		it( 'should consider viewport offset configuration', () => {

		} );
	} );

	describe( 'moveBy()', () => {
		it( 'should move the dialog by given distance', () => {

		} );
	} );

	describe( 'updatePosition()', () => {
		it( 'should always position the dialog on the center of the screen if there is no editing root available', () => {

		} );

		describe( 'supported positions', () => {
			it( 'should support EDITOR_TOP_SIDE position', () => {

			} );

			it( 'should support EDITOR_CENTER position', () => {

			} );

			it( 'should support SCREEN_CENTER position', () => {

			} );

			it( 'should support EDITOR_TOP_CENTER position', () => {

			} );

			it( 'should support EDITOR_BOTTOM_CENTER position', () => {

			} );

			it( 'should support EDITOR_ABOVE_CENTER position', () => {

			} );

			it( 'should support EDITOR_BELOW_CENTER position', () => {

			} );
		} );

		it( 'should consider viewport offsets', () => {

		} );
	} );
} );
