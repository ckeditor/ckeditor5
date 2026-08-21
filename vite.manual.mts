/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { defineConfig } from 'vite';
import {
	stringifyValues,
	manualTestsPlugin,
	preserveCssImportOrderPlugin,
	refreshPlugin,
	rawSvgPlugin,
	ckDebugPlugin
} from '@ckeditor/ckeditor5-dev-manual-server';

export default defineConfig( {
	appType: 'mpa',
	base: './',
	publicDir: 'manual-assets',
	clearScreen: false,
	build: {
		outDir: 'build/manual',
		minify: false
	},
	experimental: {
		bundledDev: true
	},
	server: {
		port: 8125
	},
	preview: {
		port: 8125
	},
	css: {
		transformer: 'lightningcss'
	},
	define: stringifyValues( {
		LICENSE_KEY: 'GPL'
	} ),
	plugins: [
		ckDebugPlugin(),
		rawSvgPlugin(),
		preserveCssImportOrderPlugin(),
		manualTestsPlugin( {
			paths: [
				'packages/*',
			],
			include: [],
			language: process.env.CK_LANGUAGE || 'en'
		} ),
		refreshPlugin()
	]
} );
