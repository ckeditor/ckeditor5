/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/bindings/injectcsstransitiondisabler
 */

/**
 * A decorator that brings possibility to temporarily disable CSS transitions using
 * {@link module:ui/view~View} methods. It is helpful when, for instance, the transitions should not happen
 * when the view is first displayed but they should work normally in other cases.
 *
 * The methods to control the CSS transitions are:
 * * `disableCssTransitions()` – adds the `.ck-transitions-disabled` class to the
 * {@link module:ui/view~View#element view element},
 * * `enableCssTransitions()` – removes the `.ck-transitions-disabled` class from the
 * {@link module:ui/view~View#element view element}.
 *
 * **Note**: This helper extends the {@link module:ui/view~View#template template} and must be used **after**
 * {@link module:ui/view~View#setTemplate} is called:
 *
 *		import injectCssTransitionDisabler from '@ckeditor/ckeditor5-ui/src/bindings/injectcsstransitiondisabler';
 *
 *		class MyView extends View {
 *			constructor() {
 *				super();
 *
 *				// ...
 *
 *				this.setTemplate( { ... } );
 *
 *				// ...
 *
 *				injectCssTransitionDisabler( this );
 *
 *				// ...
 *			}
 *		}
 *
 * The usage comes down to:
 *
 *		const view = new MyView();
 *
 *		// ...
 *
 *		view.disableCssTransitions();
 *		view.show();
 *		view.enableCssTransitions();
 *
 * @param {module:ui/view~View} view View instance that should get this functionality.
 */
export default function injectCssTransitionDisabler( view ) {
	view.set( '_isCssTransitionsDisabled', false );

	view.disableCssTransitions = () => {
		view._isCssTransitionsDisabled = true;
	};

	view.enableCssTransitions = () => {
		view._isCssTransitionsDisabled = false;
	};

	view.extendTemplate( {
		attributes: {
			class: [
				view.bindTemplate.if( '_isCssTransitionsDisabled', 'ck-transitions-disabled' )
			]
		}
	} );
}
