/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { CKEditorError, setDataInElement } from '@ckeditor/ckeditor5-utils';

import type Editor from '../editor';

/**
 * @module core/editor/utils/elementapimixin
 */

/**
 * Implementation of the {@link module:core/editor/utils/elementapimixin~ElementApi}.
 *
 * @mixin ElementApiMixin
 * @implements module:core/editor/utils/elementapimixin~ElementApi
 */
export default function ElementApiMixin<Base extends abstract new( ...args: Array<any> ) => Editor>(
	base: Base
) {
	abstract class Mixin extends base implements ElementApi {
		public sourceElement: HTMLElement | undefined;

		public updateSourceElement( data: string = this.data.get() ): void {
			if ( !this.sourceElement ) {
				/**
				 * Cannot update the source element of a detached editor.
				 *
				 * The {@link ~ElementApi#updateSourceElement `updateSourceElement()`} method cannot be called if you did not
				 * pass an element to `Editor.create()`.
				 *
				 * @error editor-missing-sourceelement
				 */
				throw new CKEditorError(
					'editor-missing-sourceelement',
					this
				);
			}

			const shouldUpdateSourceElement = this.config.get( 'updateSourceElementOnDestroy' );
			const isSourceElementTextArea = this.sourceElement instanceof HTMLTextAreaElement;

			// The data returned by the editor might be unsafe, so we want to prevent rendering
			// unsafe content inside the source element different than <textarea>, which is considered
			// secure. This behaviour could be changed by setting the `updateSourceElementOnDestroy`
			// configuration option to `true`.
			if ( !shouldUpdateSourceElement && !isSourceElementTextArea ) {
				setDataInElement( this.sourceElement, '' );

				return;
			}

			setDataInElement( this.sourceElement, data );
		}
	}

	return Mixin;
}

// Backward compatibility with `mix`.
( ElementApiMixin as any ).updateSourceElement = ( ElementApiMixin as any )( Object ).prototype.updateSourceElement;

/**
 * Interface describing an editor that replaced a DOM element (was "initialized on an element").
 *
 * Such an editor should provide a method to
 * {@link module:core/editor/utils/elementapimixin~ElementApi#updateSourceElement update the replaced element with the current data}.
 *
 * @interface ElementApi
 */

/**
 * The element on which the editor has been initialized.
 *
 * @readonly
 * @member {HTMLElement} #sourceElement
 */

/**
 * Updates the {@link #sourceElement editor source element}'s content with the data.
 *
 * @method #updateSourceElement
 */

export interface ElementApi {
	readonly sourceElement: HTMLElement | undefined;
	updateSourceElement( data?: string ): void;
}
