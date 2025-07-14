# LowHeadDamFatalitiesTestSite

The Low Head Dam Fatalities Site is a web application designed to raise awareness and encourage remediation efforts for low head dam fatalities across the United States. This interactive platform combines mapping technology with detailed incident reporting to provide crucial safety information for researchers, safety professionals, and the general public.

## Key Features:
  - Interactive Map Visualization: Displays dam locations across the US with clickable markers showing incident details
  - Comprehensive Database: Tracks dam incidents, fatalities, locations, and validation sources
  - Advanced Search & Filtering: Search by location, date range, fatality count, river name, and keywords
  - Detailed Incident Records: Each dam entry includes historical incidents with dates, descriptions, and source validation
  - Statistical Dashboard: Real-time statistics showing total fatalities, most dangerous sites, and averages
  - Responsive Design: Works seamlessly across desktop and mobile devices
  - Pagination Support: Efficiently handles large datasets with paginated results
  - Image Support: Displays relevant photos for dams and incidents when available

## Technology Stack:
  Frontend: HTML, CSS, JavaScript  
  Mapping: Leaflet.js with OpenStreetMap tiles  
  Data Source: Google Apps Script API for real-time data fetching, Google Sheets  
  Architecture: Modular JavaScript with separate controllers for data, UI, mapping, and pagination 
  
## How to Run the Project
  
  ##### Prerequisites:
  
  Modern web browser (Chrome, Firefox, Safari, Edge)  
  Internet connection (for map tiles and data fetching)  
  Github account (for hosting the website)  
  Google account (for storing the spreadsheet and launching the apps script)  
  
  ##### Installation Steps:
  
    1. Clone the repository  
        Follow this link for a tutorial:
        https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository  
        
    2. Google Sheet
      Access the google sheet and make a copy on your google account.
      
    2. Google Apps Script
       Access the google apps script and make a copy on your google account.
       In the getAllData() function, replace the placeholder spreadsheet ID with the ID of your copy of the google sheet.   
       You can find this ID in the sheet’s URL.
       Deploy the apps script. Click Deploy > New Deployment, select ‘Web App’, and ensure access is set to ‘Anyone’. 
       Allow google to access the spreadsheet.
       Copy the web app URL from the deployment page.
       Navigate to the scripts.js file in the repository.  
       Under the data layer, replace "DATA_URL" with your web app URL.
       
    3. Clone the repository
        Follow this link for a tutorial:
        https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
        In the scripts.js file, replace the DATA_URL with your 
        
    4. Launch the website through Github
        Under settings, navigate to "Pages"
        Under "Build and deployment" select "Deploy from a branch"
        Under "Branch" select "main"
        Save
        
    5. Access the Application
        Open your browser and navigate to https://[your github username].github.io/LowHeadDamFatalitiesTestSite/
        The application will automatically load and fetch dam data.


## File Structure 
```text LowHeadDamFatalitiesTestSite/ 
├── index.html # Main HTML file
├── scripts.js # Main JavaScript application
├── styles.css # Styling
├── assets/
│      ├── images/ # Dam and incident photos
│      └── validation_uploads/ # Source validation files
└── README.md # This file
```

## How to Use the Project:

##### Map Interaction

Click on any red marker to view dam details in a popup.
Use map controls to zoom and pan across different regions.
Click "View Incidents" in popups to see detailed incident history.


##### Dam List

Browse all dams in the scrollable list on the right side.
Click on any dam header to expand and view incident details.
Expanded dams show historical incidents sorted by date (newest first).


##### Basic Search

Use the search bar to find dams by name, location, state, or county.
Results update in real-time as you type.
Search terms work across multiple fields simultaneously.


##### Advanced Search

Click "Advanced Search" to access detailed filtering options.  
Date Range: Filter incidents by occurrence date  
Fatality Range: Set minimum/maximum fatality counts  
State Filter: Select specific states from dropdown  
River Name: Search by specific river systems  
Keywords: Search within incident descriptions  
Active filters are displayed as removable tags  


##### Sorting Options

Sort dams by Name (A-Z), State, River, or Fatalities (highest first).


##### Incident Details

Each incident includes date, fatality count, and detailed description.
Validation sources provided as clickable links (web sources and file uploads).
Incident photos displayed when available.
Documentation links for additional research.
When an incident is clicked, the map zooms in on that location.


##### Statistics Dashboard

View real-time statistics at the top of the page.  
Total fatalities across all recorded incidents  
Number of sites with recorded fatalities  
Dam with highest fatality count    
Average fatalities per incident site  


##### Pagination

Navigate through large result sets using pagination controls.
20 dams displayed per page.
Page information shows current page and total pages.


##### Report Incident

Click the "Report Incident" button to access the Google Form.
Submit new dam incidents with proper documentation.
Reports are reviewed manually before being added to the database.

## Data Sources:

Most incident data includes validation through web sources or uploaded documentation.  
Data compiled by Brigham Young University student researchers.  
The data is entered manually into the google sheet when records of fatalities (like news stories or police reports) are found.  
The data displayed on the website is updated automatically through the connected Google Apps Script API, when the page is refreshed the data will be up-to-date with the spreadsheet.  
Sources are verified and linked for transparency and research purposes.

## Author:

Written by: Paige Gordichuk  
With assistance from claude.ai  
Updated: 6/24/2025  
