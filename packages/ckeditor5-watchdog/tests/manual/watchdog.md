**Important:** Be sure to run manual test with the `--debug false` flag. Otherwise errors won't be rethrown by the `CKEditorError.rethrowUnexpectedError()` method.

1. Type `1` in the first editor. Only the first editor should crash and be restarted. The error should be logged in the console.

1. Type `1` in the second editor. Only the second editor should crash and be restarted. The error should be logged in the console.

1. Click `Simulate a random error` No editor should be restarted.

1. Refresh page and quickly type `1` in the first editor 4 times. After the last error the editor should be crashed and it should not restart.

1. Refresh page and slowly (slower than 1 per 5 seconds) type `1` in the first editor 4 times. After the last error the editor should be restarted and it should still work.
