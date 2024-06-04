/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { WordCount, WordCountConfig } from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the word count feature.
		 * It is introduced by the {@link module:word-count/wordcount~WordCount} feature.
		 *
		 * Read more in {@link module:word-count/wordcountconfig~WordCountConfig}.
		 */
		wordCount?: WordCountConfig;
	}

	interface PluginsMap {
		[ WordCount.pluginName ]: WordCount;
	}
}
