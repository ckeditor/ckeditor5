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
		'Create local declarations for external exports or use type-only exports' :
		'Check if the export exists in the source module and verify import path';

	return {
		path: getRelativePath( fileName ),
		message: `Export '${ exportName }' (${ exportType }): ${ reason }`,
		solution
	};
}

export function createModuleResolutionError( context ) {
	const { fileName, importFrom } = context;

	return {
		path: getRelativePath( fileName ),
		message: `Module '${ importFrom }' not found`,
		solution: 'Check if the package exists and has a proper index.ts file'
	};
}

export function createImportReferenceError( context ) {
	const { fileName, referenceName } = context;

	return {
		path: getRelativePath( fileName ),
		message: `Import '${ referenceName }' not found`,
		solution: 'Verify the export exists in the source module and check for typos'
	};
}

function getRelativePath( fileName ) {
	return fileName.replace( /.*\/packages\//, '' ).replace( /.*\/external\//, '' );
}
