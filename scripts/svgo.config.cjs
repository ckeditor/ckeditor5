/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

const svgoViewBoxPlugin = require( './utils/svgoviewboxplugin.cjs' );

module.exports = {
	plugins: [
		{
			name: 'preset-default',
			params: {
				overrides: {
					removeViewBox: false,
					collapseGroups: true,
					removeDimensions: true,
					removeAttrs: {
						attrs: '(fill|stroke|fill-rule)'
					},
					convertPathData: {
						noSpaceAfterFlags: false
					},
					removeTitle: true,
					removeComments: true,
					removeMetadata: true
				}
			}
		},
		svgoViewBoxPlugin
	]
};
