# ContextWatchdog manual test

1. Click `Simulate Error in Context Plugin`. The context and both editors should crash and be restarted. The error should be logged in the console.

2. Click `Simulate a random error`. No editor should be restarted.

3. Refresh page and quickly click `Simulate Error in Context Plugin` 4 times. After the last error the watchdog should be crashed permanently and it should not restart.
