/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

// Register method exposed for deltas, which needs only this method, to make code simpler, more beautiful and, first of
// all, to solve circular dependencies.

import Batch from './batch-base.js';

export default Batch.register;