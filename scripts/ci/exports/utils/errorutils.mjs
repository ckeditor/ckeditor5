/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Utility functions for creating detailed error messages with context information.
 */

export function createExportResolutionError( context ) {
	const { fileName, exportName, isExternalModule, exportKind } = context;
	const exportType = exportKind || 'value';

	const reason = isExternalModule ? 'External module re-export' : 'Declaration not found';
	const solution = isExternalModule ?
		'Create local declarations for external exports' :
		'Check if the export exists in the source module and verify import path';

	return {
		path: getRelativePath( fileName ),
		message: `Export '${ exportName }' (${ exportType }): ${ reason }`,
		solution
	};
}

function getRelativePath( fileName ) {
	return fileName.replace( /.*\/packages\//, '' ).replace( /.*\/external\//, '' );
}
