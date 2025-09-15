/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import upath from 'upath';
import { PACKAGES_DIRECTORY } from './release/utils/constants.mjs';

export const CKEDITOR5_ROOT_PATH = upath.join( import.meta.dirname, '..' );
export const CKEDITOR5_PACKAGES_PATH = upath.join( CKEDITOR5_ROOT_PATH, PACKAGES_DIRECTORY );
export const CKEDITOR5_COMMERCIAL_PATH = upath.join( CKEDITOR5_ROOT_PATH, '..', '..' );
export const CKEDITOR5_COMMERCIAL_PACKAGES_PATH = upath.join( CKEDITOR5_COMMERCIAL_PATH, PACKAGES_DIRECTORY );

export const CKEDITOR5_MAIN_PACKAGE_PATH = upath.join( CKEDITOR5_PACKAGES_PATH, 'ckeditor5' );
export const CKEDITOR5_PREMIUM_FEATURES_PATH = upath.join( CKEDITOR5_COMMERCIAL_PACKAGES_PATH, 'ckeditor5-premium-features' );

export const CKEDITOR5_INDEX = upath.join( CKEDITOR5_MAIN_PACKAGE_PATH, 'src', 'index.ts' );
export const CKEDITOR5_PREMIUM_FEATURES_INDEX = upath.join( CKEDITOR5_PREMIUM_FEATURES_PATH, 'src', 'index.ts' );
