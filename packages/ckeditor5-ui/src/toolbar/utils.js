/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/toolbar/utils
 */

/**
 * An utility which expands a plain toolbar configuration into a collection
 * of {@link module:ui/view~View views} using a given factory.
 *
 * @param {Object} config The toolbar config.
 * @param {module:utils/collection~Collection} collection A collection into which the config
 * is expanded.
 * @param {module:ui/componentfactory~ComponentFactory} factory A factory producing toolbar items.
 * @returns {Promise} A promise resolved when all toolbar items are initialized.
 */
export function expandToolbarConfig( config, collection, factory ) {
	let promises = [];

	if ( config ) {
		promises = config.map( name => collection.add( factory.create( name ) ) );
	}

	return Promise.all( promises );
}

/**
 * Enables focus/blur toolbar navigation using `Alt+F10` and `Esc` keystrokes.
 *
 * @param {Object} options Options of the utility.
 * @param {*} options.origin A view to which the focus will return when `Esc` is pressed and
 * `options.toolbar` is focused.
 * @param {module:core/keystrokehandler~KeystrokeHandler} options.originKeystrokeHandler A keystroke
 * handler to register `Alt+F10` keystroke.
 * @param {module:utils/focustracker~FocusTracker} options.originFocusTracker A focus tracker
 * for `options.origin`.
 * @param {module:ui/toolbar/toolbarview~ToolbarView} options.toolbar A toolbar which is to gain
 * focus when `Alt+F10` is pressed.
 */
export function enableToolbarKeyboardFocus( {
	origin,
	originKeystrokeHandler,
	originFocusTracker,
	toolbar
} ) {
	// Because toolbar items can get focus, the overall state of the toolbar must
	// also be tracked.
	originFocusTracker.add( toolbar.element );

	// Focus the toolbar on the keystroke, if not already focused.
	originKeystrokeHandler.set( 'Alt+F10', ( data, cancel ) => {
		if ( originFocusTracker.isFocused && !toolbar.focusTracker.isFocused ) {
			toolbar.focus();
			cancel();
		}
	} );

	// Blur the toolbar and bring the focus back to origin.
	toolbar.keystrokes.set( 'Esc', ( data, cancel ) => {
		if ( toolbar.focusTracker.isFocused ) {
			origin.focus();
			cancel();
		}
	} );
}
