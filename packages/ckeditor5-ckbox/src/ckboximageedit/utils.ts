/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckbox/ckboximageedit/utils
 */

import { toArray } from 'ckeditor5/src/utils';
import { getCategoryIdForFile, getWorkspaceId } from '../utils';

import type { Element } from 'ckeditor5/src/engine';
import type { InitializedToken } from '@ckeditor/ckeditor5-cloud-services';
import type { CKBoxConfig } from '../ckboxconfig';

/**
 * @internal
 */
export function createEditabilityChecker(
	allowExternalImagesEditing: CKBoxConfig[ 'allowExternalImagesEditing' ]
): ( element: Element ) => boolean {
	const checkUrl = createUrlChecker();

	return element => {
		const isImageElement =
			element.is( 'element', 'imageInline' ) ||
			element.is( 'element', 'imageBlock' );

		if ( !isImageElement ) {
			return false;
		}

		if ( element.hasAttribute( 'ckboxImageId' ) ) {
			return true;
		}

		if ( element.hasAttribute( 'src' ) ) {
			return checkUrl( element.getAttribute( 'src' ) as string );
		}

		return false;
	};

	function createUrlChecker(): ( src: string ) => boolean {
		if ( !allowExternalImagesEditing ) {
			return () => false;
		}

		if ( typeof allowExternalImagesEditing == 'function' ) {
			return allowExternalImagesEditing;
		}

		const urlRegExps = toArray( allowExternalImagesEditing );

		return src => urlRegExps.some( pattern =>
			src.match( pattern ) ||
			src.replace( /^https?:\/\//, '' ).match( pattern )
		);
	}
}

/**
 * @internal
 */
export async function getImageEditorMountOptions( element: Element, options: {
	token: InitializedToken;
	serviceOrigin: string;
	signal: AbortSignal;
	defaultWorkspaceId?: string;
	defaultCategories?: Record<string, Array<string>> | null;
} ): Promise<object> {
	const ckboxImageId = element.getAttribute( 'ckboxImageId' );

	if ( ckboxImageId ) {
		return {
			assetId: ckboxImageId
		};
	}

	const imageUrl = element.getAttribute( 'src' ) as string;
	const uploadCategoryId = await getUploadCategoryId( imageUrl, options );

	return {
		imageUrl,
		uploadCategoryId
	};
}

async function getUploadCategoryId( imageUrl: string, options: Parameters<typeof getImageEditorMountOptions>[ 1 ] ): Promise<string> {
	const { token, serviceOrigin, signal, defaultWorkspaceId, defaultCategories } = options;

	// TODO: refactor this (it's duplicated in upload adapter).
	const workspaceId = getWorkspaceId( token, defaultWorkspaceId );

	if ( !workspaceId ) {
		throw new Error( 'TODO' );
	}

	const category = await getCategoryIdForFile( imageUrl, {
		token,
		serviceOrigin,
		workspaceId,
		signal,
		defaultCategories
	} );

	if ( !category ) {
		throw new Error( 'TODO' );
	}

	return category;
}
