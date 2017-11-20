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
import './attributedelta';
import './insertdelta';
import './mergedelta';
import './movedelta';
import './removedelta';
import './renamedelta';
import './splitdelta';
import './unwrapdelta';
import './weakinsertdelta';
import './wrapdelta';
