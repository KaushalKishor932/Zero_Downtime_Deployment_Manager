# Zero Downtime Deployment Manager - Dashboard

This is the ultra-lightweight, single-file dashboard.

## How to Run

1.  **Start the Backend Manager:**
    ```bash
    cd ../manager
    npm start
    ```
    (Ensure MongoDB is running)

2.  **Open the Dashboard:**
    *   Simply double-click `index.html`.
    *   No server required for the dashboard itself (though `npx serve .` is always better for avoiding CORS issues with some local setups).

## Structure

*   `index.html`: Contains EVERYTHING (Layout, Logic, Styles).
