/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/delta/basic-deltas
 */

// Deltas require `register` method that require `Batch` class and is defined in batch-base.js.
// We would like to group all deltas files in one place, so we would only have to include batch.js
// which would already have all default deltas registered.

// Import default suite of deltas so a feature have to include only Batch class file.
/* eslint-disable no-unused-vars */
import d01 from './attributedelta';
import d02 from './insertdelta';
import d03 from './mergedelta';
import d04 from './movedelta';
import d05 from './removedelta';
import d06 from './renamedelta';
import d07 from './splitdelta';
import d08 from './unwrapdelta';
import d09 from './weakinsertdelta';
import d10 from './wrapdelta';
/* eslint-enable no-unused-vars */
