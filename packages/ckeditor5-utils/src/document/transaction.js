/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [
	'document/delta/transaction-base',
	'document/delta/insertdelta',
	'document/delta/removedelta',
	'document/delta/changedelta',
	'document/delta/splitdelta',
	'document/delta/mergedelta'
], ( Transaction ) => {
	return Transaction;
} );