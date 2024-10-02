# Performance: Editor init time

**! Test with console off, in incognito mode !**

This performance test measures how long editor initializes for various kinds of documents. Each data set presents a "heavy" document case, which takes substantial amount of time to load.

The test starts automatically after you open this page.

By default, the test goes through all data sets and performs 10 tries for each. Default run will take around 10 minutes. You can narrow it down using the test config in test source.

The status message will inform you about current progress.

After each single editor initialization, the initialization time is stored and the page is refreshed, until the whole suite is done.

After all tests are done, the results will be inserted into the clipboard, in a format that can be directly pasted to a spreadsheet. Allow the browser to use the clipboard when prompted. Results are also displayed in the console.

Between test runs, data is stored in `SessionStorage`. Close the tab to finish and "reset" the test run before it ended.
