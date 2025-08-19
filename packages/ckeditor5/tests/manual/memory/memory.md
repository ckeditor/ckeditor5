1. Open DevTools on Chrome.
2. Go to Memory tab.
3. Select "Heap snapshot" profiling type.
4. Click "Collect Garbage" (trash icon) and "Clear all profiles" (don't go icon).
5. Take heap snapshot (record icon).
6. Repeat multiple times:
    - click "Init editor",
    - wait to editor show up ,
    - click "Destroy editor".
7. Record heap snapshot again.
8. Compare Snapshot 1 with Snapshot 2 and look for:
    - "detached" - HTML Elements/DOM nodes
    - "EventListener" - there should be only 1
    - Any CKEditor5 classes instances like "Editor" or "LivePosition"

## Notes:

* Browser extensions might attach event listeners to the DOM, so the safest way to run this test is by running Chrome from command line:

    ```
    google-chrome \
        --enable-precise-memory-info \
        --disable-extensions \
        --disable-plugins \
        --incognito \
        http://localhost:8125/ckeditor5/tests/manual/memory/memory.html
    ```

    The above will run Chrome without extensions or plugins in incognito mode and open manual tests page.

* Close any running Chrome instance beforehand because otherwise it will open a tab in currently opened Chrome (look for "Opening in existing browser session." in command line).
