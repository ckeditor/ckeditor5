/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';
import { fileURLToPath } from 'url';
import { PACKAGES_DIRECTORY } from './release/utils/constants.mjs';
const __filename = fileURLToPath( import.meta.url );
const __dirname = upath.dirname( __filename );

export const CKEDITOR5_ROOT_PATH = upath.join( __dirname, '..' );
export const CKEDITOR5_COMMERCIAL_PATH = upath.join( CKEDITOR5_ROOT_PATH, 'external', 'ckeditor5-commercial' );
export const CKEDITOR5_PREMIUM_FEATURES_PATH = upath.join( CKEDITOR5_COMMERCIAL_PATH, PACKAGES_DIRECTORY, 'ckeditor5-premium-features' );

export const CKEDITOR5_INDEX = upath.join( CKEDITOR5_ROOT_PATH, 'src', 'index.ts' );
export const CKEDITOR5_PREMIUM_FEATURES_INDEX = upath.join( CKEDITOR5_PREMIUM_FEATURES_PATH, 'src', 'index.ts' );
