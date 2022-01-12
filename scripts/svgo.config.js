/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-env node */

const { extendDefaultPlugins } = require( 'svgo' );

module.exports = {
	plugins: extendDefaultPlugins( [
		{
			name: 'removeViewBox',
			active: false
		},
		{ name: 'collapseGroups' },
		{ name: 'removeDimensions' },
		{
			name: 'removeAttrs',
			params: {
				attrs: '(fill|stroke|fill-rule)'
			}
		},
		{
			name: 'convertPathData',
			params: {
				noSpaceAfterFlags: false
			}
		},
		{ name: 'removeTitle' },
		{ name: 'removeComments' },
		{ name: 'removeMetadata' }
	] )
};
