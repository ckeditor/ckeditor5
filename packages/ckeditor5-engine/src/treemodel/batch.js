/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

// All deltas need to be loaded so they can register themselves as Batch methods.
//
// To solve circular dependencies (deltas need to require Batch class), Batch class body is moved
// to treemodel/delta/batch-base.
CKEDITOR.define( [
	'treemodel/delta/batch-base',
	'treemodel/delta/insertdelta',
	'treemodel/delta/inserttextdelta',
	'treemodel/delta/movedelta',
	'treemodel/delta/removedelta',
	'treemodel/delta/attributedelta',
	'treemodel/delta/splitdelta',
	'treemodel/delta/mergedelta',
	'treemodel/delta/wrapdelta'
], ( Batch ) => {
	return Batch;
} );
