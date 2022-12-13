/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import type Editor from '../editor';

/**
 * @module core/editor/utils/dataapimixin
 */

/**
 * Implementation of the {@link module:core/editor/utils/dataapimixin~DataApi}.
 *
 * @mixin DataApiMixin
 * @implements module:core/editor/utils/dataapimixin~DataApi
 */
export default function DataApiMixin<Base extends abstract new( ...args: Array<any> ) => Editor>( base: Base ) {
	abstract class Mixin extends base implements DataApi {
		public setData( data: string ): void {
			this.data.set( data );
		}

		public getData( options?: Record<string, unknown> ): string {
			return this.data.get( options );
		}
	}

	return Mixin;
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
 *
 * @interface DataApi
 */

/**
 * Sets the data in the editor.
 *
 *		editor.setData( '<p>This is editor!</p>' );
 *
 * By default the editor accepts HTML. This can be controlled by injecting a different data processor.
 * See the {@glink features/markdown Markdown output} guide for more details.
 *
 * Note: Not only is the format of the data configurable, but the type of the `setData()`'s parameter does not
 * have to be a string either. You can e.g. accept an object or a DOM `DocumentFragment` if you consider this
 * the right format for you.
 *
 * @method #setData
 * @param {String} data Input data.
 */

/**
 * Gets the data from the editor.
 *
 *		editor.getData(); // -> '<p>This is editor!</p>'
 *
 * By default the editor outputs HTML. This can be controlled by injecting a different data processor.
 * See the {@glink features/markdown Markdown output} guide for more details.
 *
 * Note: Not only is the format of the data configurable, but the type of the `getData()`'s return value does not
 * have to be a string either. You can e.g. return an object or a DOM `DocumentFragment` if you consider this
 * the right format for you.
 *
 * @method #getData
 * @param {Object} [options] Additional configuration for the retrieved data.
 * Editor features may introduce more configuration options that can be set through this parameter.
 * @param {String} [options.rootName='main'] Root name.
 * @param {String} [options.trim='empty'] Whether returned data should be trimmed. This option is set to `'empty'` by default,
 * which means that whenever editor content is considered empty, an empty string is returned. To turn off trimming
 * use `'none'`. In such cases exact content will be returned (for example `'<p>&nbsp;</p>'` for an empty editor).
 * @returns {String} Output data.
 */

export interface DataApi {
	setData( data: string ): void;
	getData( options?: Record<string, unknown> ): string;
}
