/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/editor/utils/elementapimixin
 */

import {
	CKEditorError,
	setDataInElement,
	type Constructor,
	type Mixed
} from '@ckeditor/ckeditor5-utils';

import type Editor from '../editor.js';

/**
 * Implementation of the {@link module:core/editor/utils/elementapimixin~ElementApi}.
 */
export default function ElementApiMixin<Base extends Constructor<Editor>>( base: Base ): Mixed<Base, ElementApi> {
	abstract class Mixin extends base implements ElementApi {
		public sourceElement: HTMLElement | undefined;

		public updateSourceElement( data?: string ): void {
			if ( !this.sourceElement ) {
				/**
				 * Cannot update the source element of a detached editor.
				 *
				 * The {@link module:core/editor/utils/elementapimixin~ElementApi#updateSourceElement `updateSourceElement()`}
				 * method cannot be called if you did not pass an element to `Editor.create()`.
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
			// secure. This behavior could be changed by setting the `updateSourceElementOnDestroy`
			// configuration option to `true`.
			if ( !shouldUpdateSourceElement && !isSourceElementTextArea ) {
				setDataInElement( this.sourceElement, '' );

				return;
			}

			const dataToSet = typeof data === 'string' ? data : this.data.get();

			setDataInElement( this.sourceElement, dataToSet );
		}
	}

	return Mixin as any;
}

/**
 * Interface describing an editor that replaced a DOM element (was "initialized on an element").
 *
 * Such an editor should provide a method to
 * {@link module:core/editor/utils/elementapimixin~ElementApi#updateSourceElement update the replaced element with the current data}.
 */
export interface ElementApi {

	/**
	 * The element on which the editor has been initialized.
	 *
	 * @readonly
	 */
	sourceElement: HTMLElement | undefined;

	/**
	 * Updates the {@link #sourceElement editor source element}'s content with the data if the
	 * {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy `updateSourceElementOnDestroy`}
	 * configuration option is set to `true`.
	 *
	 * @param data Data that the {@link #sourceElement editor source element} should be updated with.
	 */
	updateSourceElement( data?: string ): void;
}
