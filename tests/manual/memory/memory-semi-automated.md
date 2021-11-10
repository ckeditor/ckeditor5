## A semi-automated tests to analyze memory leaks

**The list of features loaded by the editor in this test could be outdated. Make sure as many features as possible are loaded, the `all-features` test is the right place to copy from.**

1. Open DevTools on Chrome.
2. Go to Memory tab.
3. Start the test by clicking the button (if you see the "gc is not defined" error, see Notes below).
4. Take a snapshot (you don't need to GC manually).
5. Run another cycle.
6. Take another snapshot.
7. Repeat the process a couple of times.
8. Analyze the memory consumption by comparing the snapshots. It should not grow dramatically, that is more than ~.2MB per 10 initializations/destructions (1 cycle).

## Notes:

Browser extensions might attach event listeners to the DOM, so the safest way to run this test is by running Chrome in guest mode.

This manual test also requires the browser to expose the `gc()` function.

To prepare the browser, **close all Chrome windows first** (the whole app), then (on Mac):

```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --guest --js-flags="--expose-gc"
```

If you don't close all Chrome windows first, the `--expose-gc` flag will not work.
