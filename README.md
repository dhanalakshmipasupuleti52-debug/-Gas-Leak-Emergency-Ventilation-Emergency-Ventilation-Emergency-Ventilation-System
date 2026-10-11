# Smart Industrial Gas Leak Emergency Ventilation System
Embedded Systems Project - simulation dashboard (HTML + CSS + JavaScript, no install).

Run: open `index.html` in a browser.

## Structure
- index.html            page layout (header, pages, script includes)
- css/style.css         industrial dark theme
- js/config.js          settings, thresholds, shared state
- js/dataProvider.js    SimulationDataProvider (ADC, PID, PWM, alarms, FDCAN) + HardwareDataProvider stub
- js/uiBuild.js         builds all 10 pages (dashboard, sensor, PID, fan, FDCAN, workflow, tests, history, settings, about)
- js/behaviour.js       buttons, settings validation, history search/export
- js/tests.js           6 test cases + Run All
- js/demo.js            presentation / demo sequence
- js/render.js          live UI update, charts, fan animation, buzzer sound, main loop

Notes: simulation only, not connected to real STM32 hardware. Click any button once so the browser allows the buzzer sound.
