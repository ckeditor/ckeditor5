/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/mix
 */

/**
 * Copies enumerable properties and symbols from the objects given as 2nd+ parameters to the
 * prototype of first object (a constructor).
 *
 *		class Editor {
 *			...
 *		}
 *
 *		const SomeMixin = {
 *			a() {
 *				return 'a';
 *			}
 *		};
 *
 *		mix( Editor, SomeMixin, ... );
 *
 *		new Editor().a(); // -> 'a'
 *
 * Note: Properties which already exist in the base class will not be overriden.
 *
 * @depreciated Use mixin pattern, see: https://www.typescriptlang.org/docs/handbook/mixins.html.
 * @param {Function} [baseClass] Class which prototype will be extended.
 * @param {Object} [...mixins] Objects from which to get properties.
 */
export default function mix( baseClass: Function, ...mixins: Array<object> ): void {
	mixins.forEach( mixin => {
		const propertyNames: Array<string | symbol> = Object.getOwnPropertyNames( mixin );
		const propertySymbols = Object.getOwnPropertySymbols( mixin );

		propertyNames.concat( propertySymbols ).forEach( key => {
			if ( key in baseClass.prototype ) {
				return;
			}

			if ( typeof mixin == 'function' && ( key == 'length' || key == 'name' || key == 'prototype' ) ) {
				return;
			}

			const sourceDescriptor = Object.getOwnPropertyDescriptor( mixin, key )!;
			sourceDescriptor.enumerable = false;

			Object.defineProperty( baseClass.prototype, key, sourceDescriptor );
		} );
	} );
}
