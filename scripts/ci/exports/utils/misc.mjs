/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

export function isInternalNode( node ) {
	if ( node.leadingComments ) {
		for ( const comment of node.leadingComments ) {
			if ( comment.value.includes( '@internal' ) ) {
				return true;
			}
		}
	}

	return false;
}

export function packageDirName( fileName ) {
	return fileName.replace( /\/src\/.*/, '' );
}

export function packageNameFromFileName( fileName ) {
	if ( !fileName ) {
		return null;
	}

	const packageDirMatch = fileName.match( /.+\/packages\/(.+?)\// );
	const externalDirMatch = fileName.match( /.+\/external\/(.+?)\// );

	if ( packageDirMatch ) {
		return '@ckeditor/' + packageDirMatch[ 1 ];
	}

	if ( externalDirMatch ) {
		return '@ckeditor/' + externalDirMatch[ 1 ];
	}

	return null;
}
