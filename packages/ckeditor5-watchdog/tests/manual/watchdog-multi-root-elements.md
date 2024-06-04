This is a watchdog + multi-root manual test where initial roots are given as elements which are used as editables when the editor is initialized.

**Important:** Be sure to run manual test with the `--debug false` flag. Otherwise errors won't be rethrown by the `CKEditorError.rethrowUnexpectedError()` method.

1. Whenever you type `1` in the editor, the multi-root editor should crash and watchdog should react to it.

1. Click `Simulate a random error`. Editor should not be restarted.

1. Refresh page and quickly type `1` in the editor 4 times. After the last error the editor should be crashed permanently and it should not restart.

1. Refresh page and slowly (slower than 1 per 5 seconds) type `1` in the editor 4 times. After the last error the editor should be restarted and it should still work.

1. Try adding and removing roots to the editor and see if the editor is properly restarted after it crashes. Roots state should be the same as before the crash.

1. Try loading roots (two roots can be loaded) and see if the editor is properly restarted after it crashes. Loaded roots should be visible after the editor restart.

1. Finally, try loading, adding and removing roots together and see if the editor is properly restarted after it crashes.
