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

export function createImportReferenceSummary( context ) {
	const { fileName, importFrom, referenceName } = context;
	const relativePath = getRelativePath( fileName );

	return {
		summary: `[${ relativePath }]\n${ chalk.red( `Import '${ referenceName }' from '${ importFrom }' not found` ) }`,
		solution: 'Verify the export exists in the source module and check for typos'
	};
}

export function createASTParsingSummary( context ) {
	const { fileName, nodeType, line, column } = context;
	const relativePath = getRelativePath( fileName );
	const location = formatLocation( line, column );

	return {
		summary: `[${ relativePath }${ location }]\n${ chalk.red( `AST parsing failed for ${ nodeType }` ) }`,
		solution: 'Check for unsupported TypeScript syntax or parser configuration issues'
	};
}

// Detailed error functions
export function createExportResolutionError( context ) {
	const {
		fileName,
		exportName,
		localName,
		importFrom,
		isExternalModule,
		exportKind,
		availableDeclarations = [],
		availableImports = []
	} = context;

	const header = buildMessage( [
		'Export resolution failed',
		`File: ${ fileName }`,
		`Export: ${ exportName }`,
		`Local name: ${ localName }`,
		exportKind && `Export kind: ${ exportKind }`,
		importFrom && `Import from: ${ importFrom }`,
		importFrom && `External module: ${ isExternalModule ? 'Yes' : 'No' }`
	] );

	let details;

	if ( isExternalModule ) {
		details = buildMessage( [
			'',
			'This appears to be a re-export from an external module.',
			'Consider:',
			'1. Creating local declarations for external exports',
			'2. Using type-only exports for external types'
		] );
	} else {
		const declarationsList = formatList( availableDeclarations,
			decl => `   - ${ decl.localName } (${ decl.type })` );
		const importsList = formatList( availableImports,
			imp => `   - ${ imp.localName } from ${ imp.importFrom }` );

		details = buildMessage( [
			'',
			'Available declarations in this module:',
			declarationsList,
			'Available imports in this module:',
			importsList,
			'Possible solutions:',
			'1. Check if the declaration exists in the imported module',
			'2. Verify the import path is correct',
			'3. Ensure the export is properly declared in the source module',
			'4. Check for typos in the export/import names'
		] );
	}

	return buildMessage( [ header, details ] );
}

export function createModuleResolutionError( context ) {
	const {
		fileName,
		importFrom,
		packageName,
		availablePackages = []
	} = context;

	const header = buildMessage( [
		'Module resolution failed',
		`File: ${ fileName }`,
		`Package: ${ packageName }`,
		`Import path: ${ importFrom }`
	] );

	const packagesList = formatList( availablePackages, pkg => `   - ${ pkg }` );

	const details = buildMessage( [
		'',
		'Available packages:',
		packagesList,
		'Possible solutions:',
		'1. Check if the package exists in the workspace',
		'2. Verify the import path is correct',
		'3. Ensure the package has a proper index.ts file',
		'4. Check for typos in the package name or path'
	] );

	return buildMessage( [ header, details ] );
}

export function createImportReferenceError( context ) {
	const {
		fileName,
		importFrom,
		referenceName,
		availableExports = []
	} = context;

	const header = buildMessage( [
		'Import reference not found',
		`File: ${ fileName }`,
		`Import from: ${ importFrom }`,
		`Reference name: ${ referenceName }`
	] );

	const exportsList = formatList( availableExports,
		exp => `   - ${ exp.name } (${ exp.exportKind || 'value' })` );

	const details = buildMessage( [
		'',
		'Available exports in source module:',
		exportsList,
		'Possible solutions:',
		'1. Check if the export exists in the source module',
		'2. Verify the export name is spelled correctly',
		'3. Ensure the export is properly declared in the source module',
		'4. Check if the export is a type export when importing as value or vice versa'
	] );

	return buildMessage( [ header, details ] );
}

export function createASTParsingError( context ) {
	const {
		fileName,
		nodeType,
		line,
		column,
		node
	} = context;

	const header = buildMessage( [
		'AST parsing failed',
		`File: ${ fileName }`,
		`Location: line ${ line }, column ${ column }`,
		`Node type: ${ nodeType }`
	] );

	let nodeDetails = '';
	if ( node ) {
		const nodeInfo = [
			'Node details:',
			`   Type: ${ node.type }`
		];

		if ( node.name ) {
			nodeInfo.push( `   Name: ${ node.name }` );
		}
		if ( node.value ) {
			nodeInfo.push( `   Value: ${ node.value }` );
		}

		nodeDetails = buildMessage( [ '', ...nodeInfo ] );
	}

	const causes = buildMessage( [
		'',
		'This usually indicates:',
		'1. Unsupported TypeScript/JavaScript syntax',
		'2. A bug in the AST parser configuration',
		'3. Missing Babel/TypeScript parser plugin',
		'4. Syntax error in the source file'
	] );

	return buildMessage( [ header, nodeDetails, causes ] );
}

function getRelativePath( fileName ) {
	return fileName.replace( /.*\/packages\//, '' ).replace( /.*\/external\//, '' );
}

function formatLocation( line, column ) {
	return line ? `:${ line }${ column ? `:${ column }` : '' }` : '';
}

function formatList( items, formatter, maxItems = 10 ) {
	if ( items.length === 0 ) {
		return '   (none)\n';
	}

	const formatted = items.slice( 0, maxItems ).map( formatter );
	const result = formatted.join( '\n' );

	if ( items.length > maxItems ) {
		return result + `\n   ... and ${ items.length - maxItems } more\n`;
	}

	return result + '\n';
}

function buildMessage( parts ) {
	return parts.filter( Boolean ).join( '\n' );
}
