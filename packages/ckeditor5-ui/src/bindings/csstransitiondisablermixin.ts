/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type View from '../view';

/**
  * @module ui/bindings/csstransitiondisablermixin
  */

/**
 * A mixin that brings the possibility to temporarily disable CSS transitions using
 * {@link module:ui/view~View} methods. It is helpful when, for instance, the transitions should not happen
 * when the view is first displayed but they should work normal in other cases.
 *
 * The methods to control the CSS transitions are:
 * * `disableCssTransitions()` – Adds the `.ck-transitions-disabled` class to the
 * {@link module:ui/view~View#element view element}.
 * * `enableCssTransitions()` – Removes the `.ck-transitions-disabled` class from the
 * {@link module:ui/view~View#element view element}.
 *
 * The usage comes down to:
 *
 * ```ts
 * const view: MyView & ViewWithCssTransitionDisabler = new ( CssTransitionDisablerMixin( MyView ) )();
 *
 * // ...
 *
 * view.disableCssTransitions();
 * view.show();
 * view.enableCssTransitions();
 * ```
 *
 * @param view View instance that should get this functionality.
 */
export default function CssTransitionDisablerMixin<
	Base extends new ( ...args: any ) => View,
	ReturnType = InstanceType<Base> & CssTransitionToggler
>( view: Base ): {
		new( ...args: ConstructorParameters<Base> ): ReturnType;
		prototype: ReturnType;
} & typeof View;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function CssTransitionDisablerMixin<
	Base extends new( ...args: any ) => View
>( view: Base ): unknown {
	class Mixin extends view implements CssTransitionToggler {
		declare public _isCssTransitionsDisabled: boolean;

		public disableCssTransitions() {
			this._isCssTransitionsDisabled = true;
		}

		public enableCssTransitions() {
			this._isCssTransitionsDisabled = false;
		}

		constructor( ...args: Array<any> ) {
			super( ...args );

			this.set( '_isCssTransitionsDisabled', false );
			this.initializeCssTransitionDisablerMixin();
		}

		protected initializeCssTransitionDisablerMixin(): void {
			this.extendTemplate( {
				attributes: {
					class: [
						this.bindTemplate.if( '_isCssTransitionsDisabled', 'ck-transitions-disabled' )
					]
				}
			} );
		}
	}

	return Mixin;
}

export interface CssTransitionToggler {
	disableCssTransitions(): void;
	enableCssTransitions(): void;
}

export type ViewWithCssTransitionDisabler = View & CssTransitionToggler;
