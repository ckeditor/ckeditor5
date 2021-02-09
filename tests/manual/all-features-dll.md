# All features with DLL build

**This DLL sample test requires that the DLL core and DLL packages are built.**

To build the DLL core and packages, run `yarn run build:dll` and then refresh this page.

Expected results:
* There should be no errors in the console.
* Four editors should be initialized correctly: Classic, Decoupled, Inline, and Balloon.
* Each editor should contain as many features as we developed.
* Clicking the `Ad-hoc` button logs `It works!` in the console.
* The `WordCount` plugin logs into the console number of characters and words for each editor.