/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/bindings/injecttransitiondisabling
 */

/**
 * A decorator that brings possibility to temporarily disable CSS transitions using
 * {@link module:ui/view~View} methods. It is helpful when, for instance, the transitions should not happen
 * when the view is first displayed but they should work normally in other cases.
 *
 * The methods to control the CSS transitions are:
 * * `disableCSSTransitions()` – adds the `.ck-transitions-disabled` class to the
 * {@link module:ui/view~View#element view element},
 * * `enableCSSTransitions()` – removes the `.ck-transitions-disabled` class from the
 * {@link module:ui/view~View#element view element}.
 *
 * **Note**: This helper extends the {@link module:ui/view~View#template template} and must be used **after**
 * {@link module:ui/view~View#setTemplate} is called:
 *
 *		import injectCSSTransitionDisabling from '@ckeditor/ckeditor5-ui/src/bindings/injecttransitiondisabling';
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
 *				injectCSSTransitionDisabling( this );
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
 *		view.disableCSSTransitions();
 *		view.show();
 *		view.enableCSSTransitions();
 *
 * @param {module:ui/view~View} view View instance that should get this functionality.
 */
export default function injectCSSTransitionDisabling( view ) {
	view.set( '_isCSSTransitionsDisabled', false );

	view.disableCSSTransitions = () => {
		view._isCSSTransitionsDisabled = true;
	};

	view.enableCSSTransitions = () => {
		view._isCSSTransitionsDisabled = false;
	};

	view.extendTemplate( {
		attributes: {
			class: [
				view.bindTemplate.if( '_isCSSTransitionsDisabled', 'ck-transitions-disabled' )
			]
		}
	} );
}
