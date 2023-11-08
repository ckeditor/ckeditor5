/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import del from 'rollup-plugin-delete';
import styles from 'rollup-plugin-styles';

// PostCSS plugins
import postcssNesting from 'postcss-nesting';
import postcssMixins from 'postcss-mixins';
import postcssImport from 'postcss-import';

export default {
	input: './theme/theme.css',
	output: {
		dir: 'dist',
		assetFileNames: '[name][extname]'
	},
	plugins: [
		del( {
			targets: './dist'
		} ),
		styles( {
			mode: 'extract',
			plugins: [
				postcssNesting,
				postcssMixins,
				postcssImport
			],
			minimize: true
		} )
	]
};
