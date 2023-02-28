/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/editor/utils/dataapimixin
 */

import type Editor from '../editor';

import type { Constructor, Mixed } from '@ckeditor/ckeditor5-utils';

/**
 * Implementation of the {@link module:core/editor/utils/dataapimixin~DataApi}.
 */
export default function DataApiMixin<Base extends Constructor<Editor>>( base: Base ): Mixed<Base, DataApi> {
	abstract class Mixin extends base implements DataApi {
		public setData( data: string | Record<string, string> ): void {
			this.data.set( data );
		}

		public getData( options?: Record<string, unknown> ): string {
			return this.data.get( options );
		}
	}

	return Mixin as any;
}

// Backward compatibility with `mix`.
{
	const mixin = ( DataApiMixin as any )( Object );

	( DataApiMixin as any ).setData = mixin.prototype.setData;
	( DataApiMixin as any ).getData = mixin.prototype.getData;
}

/**
 * Interface defining editor methods for setting and getting data to and from the editor's main root element
 * using the {@link module:core/editor/editor~Editor#data data pipeline}.
 *
 * This interface is not a part of the {@link module:core/editor/editor~Editor} class because one may want to implement
 * an editor with multiple root elements, in which case the methods for setting and getting data will need to be implemented
 * differently.
 */
export interface DataApi {

	/**
	 * Sets the data in the editor.
	 *
	 * ```ts
	 * editor.setData( '<p>This is editor!</p>' );
	 * ```
	 *
	 * If your editor implementation uses multiple roots, you should pass an object with keys corresponding
	 * to the editor root names and values equal to the data that should be set in each root:
	 *
	 * ```ts
	 * editor.setData( {
	 *     header: '<p>Content for header part.</p>',
	 *     content: '<p>Content for main part.</p>',
	 *     footer: '<p>Content for footer part.</p>'
	 * } );
	 * ```
	 *
	 * By default the editor accepts HTML. This can be controlled by injecting a different data processor.
	 * See the {@glink features/markdown Markdown output} guide for more details.
	 *
	 * @param data Input data.
	 */
	setData( data: string | Record<string, string> ): void;

	/**
	 * Gets the data from the editor.
	 *
	 * ```ts
	 * editor.getData(); // -> '<p>This is editor!</p>'
	 * ```
	 *
	 * If your editor implementation uses multiple roots, you should pass root name as one of the options:
	 *
	 * ```ts
	 * editor.getData( { rootName: 'header' } ); // -> '<p>Content for header part.</p>'
	 * ```
	 *
	 * By default the editor outputs HTML. This can be controlled by injecting a different data processor.
	 * See the {@glink features/markdown Markdown output} guide for more details.
	 *
	 * @param options Additional configuration for the retrieved data.
	 * Editor features may introduce more configuration options that can be set through this parameter.
	 * @param options.rootName Root name. Default to `'main'`.
	 * @param options.trim Whether returned data should be trimmed. This option is set to `'empty'` by default,
	 * which means that whenever editor content is considered empty, an empty string is returned. To turn off trimming
	 * use `'none'`. In such cases exact content will be returned (for example `'<p>&nbsp;</p>'` for an empty editor).
	 * @returns Output data.
	 */
	getData( options?: Record<string, unknown> ): string;
}
