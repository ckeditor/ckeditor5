/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import chalk from 'chalk';

/**
 * Utility functions for creating detailed error messages with context information.
 */

export function createExportResolutionSummary( context ) {
	const { fileName, exportName, isExternalModule, exportKind } = context;
	const relativePath = getRelativePath( fileName );
	const exportType = exportKind || 'value';

	const reason = isExternalModule ? 'External module re-export' : 'Declaration not found';
	const solution = isExternalModule ?
		'Create local declarations for external exports or use type-only exports' :
		'Check if the export exists in the source module and verify import path';

	return {
		summary: `[${ relativePath }]\n${ chalk.red( `Export '${ exportName }' (${ exportType }): ${ reason }` ) }`,
		solution
	};
}

export function createModuleResolutionSummary( context ) {
	const { fileName, importFrom } = context;
	const relativePath = getRelativePath( fileName );

	return {
		summary: `[${ relativePath }]\n${ chalk.red( `Module '${ importFrom }' not found` ) }`,
		solution: 'Check if the package exists and has a proper index.ts file'
	};
}

export function createImportReferenceErrorSummary( context ) {
	const { fileName, referenceName } = context;
	const relativePath = getRelativePath( fileName );

	return {
		summary: `[${ relativePath }]\n${ chalk.red( `Import '${ referenceName }' not found` ) }`,
		solution: 'Verify the export exists in the source module and check for typos'
	};
}

function getRelativePath( fileName ) {
	return fileName.replace( /.*\/packages\//, '' ).replace( /.*\/external\//, '' );
}
