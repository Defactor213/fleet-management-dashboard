# Fleet Management Dashboard

## Introduction

The web app will be simulating the supply demand gap and rebalancing decisions in a given period of historic time.

Page 1 will take user input for simulation period and also give a plot of charging stations across singapore.

Page 2 will show supply demand heat map, rebalancing decisions from which stations vehicles should be moved to and the graph outputs of algorithm.

-## Technologies Used

python flask as backend
websocket for data transfer
React as frontend

## How to run

The application utilizes various libraries and dependencies, both on the frontend and the backend. Here is a list of the major ones:

<details>
    <summary>
        Frontend Dependencies
    </summary>
    
    -   `@chakra-ui/icons`: A set of customizable icons for React applications.
    
    -   `@chakra-ui/react`: A UI component library for React applications that provides pre-styled and accessible components.
        
    -   `@emotion/react` and `@emotion/styled`: Libraries for styling components using CSS-in-JS syntax with emotion.
        
    -   `@react-google-maps/api`: A library for integrating Google Maps into React applications.
        
    -   `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/user-event`: Libraries for testing React components using Jest.
        
    -   `chart.js`, `chartjs-adapter-luxon`, `chartjs-plugin-annotation`, `chartjs-plugin-streaming`: Libraries for creating interactive charts and graphs in React using Chart.js.
        
    -   `framer-motion`: A library for adding smooth animations and transitions to React components.
        
    -   `react-chartjs-2`: A wrapper library for using Chart.js in React applications.
        
    -   `react-dom`: The entry point to the React DOM package for rendering React components.
        
    -   `react-icons`: A library that provides a large set of icons as React components.
        
    -   `react-scripts`: Scripts and configuration used by Create React App for building and running the application.
        
    -   `socket.io-client`: A library for connecting to and interacting with WebSocket servers from a client-side JavaScript application.
        
    -   `web-vitals`: A library for measuring web performance metrics.
</details>
<br>
<details>
    <summary>
    Backend Dependencies:
    </summary>
    
    -   `flask`: The Flask web framework.
        
    -   `flask-socketio`: A Flask extension that enables WebSocket communication in Flask applications.
        
    -   `pandas`: A library for data manipulation and analysis in Python.
        
    -   `geopandas`: A library for working with geospatial data in Python.
        
    -   `mkl_random`: A library providing random number generation routines for scientific computing.
        
    -   `eventlet`: A library for concurrent networking in Python that integrates with WebSocket servers.
        
    -   `scikit-learn`: A library for machine learning and data mining in Python.
        
    -   `Flask-Cors`: A Flask extension for handling Cross-Origin Resource Sharing (CORS) headers.
</details>
<br>

Version information for the backend can be found in the `/fleet-sim-back-end/requirements.txt` file, while for the frontend, it can be found in the `fleet-sim/package.json` file.

### Architecture Diagram

![fleet_sim_architecture](./fleet-sim/src/images/fleet_sim_architecture.drawio.png)

The frontend architecture adopts a modular structure with the root app component serving as the entry point and state manager. Views are organized into tabs using Chakra UI components, ensuring code organization and scalability. The architecture promotes code reusability, maintainability, and a seamless user experience. A single socket connection is established through the root app to connect with the backend, facilitating communication and real-time updates.

<br>
<details>
    <summary>
    Component Details:
    </summary>
    <h3>
    Context Setting
    </h3>

    index.js: Start point of react app. Dark mode, socket connection, app context are specified here

    app.js: Main app that contains all of the components, has tabs for each view, and a map component

    SocketContext.js: Connection file that connects frontend to backend

    AppContext.js: Stores all variables used globally so that properties/values need not be passed down from one component layer to another

    Error.js: Catches any front end errors that may occur and stops the backend from emitting data

<h3>
Composite Components
</h3>

    Demand_Predict:

    Supply_Demand:

    Rebalancing:

    Header:

<h3>
Singular Components
</h3>

    BarChart:

    Country:

    Date:

    Demand:

    LineChart:

    Live:

    Map:

    Mre:

    NetSDGap:

    Restart:

    StartPause:

    Time:

    Zone:

</details>
<br>

## How to run

1. run backend

-   create conda environment.
-   run `conda create --name <environment_name> --file requirements.txt`
-   run `conda activate <environment_name>`
-   run `python app.py`

-   in browser goto `localhost:5000` or `127.0.1:5000` to test that the backend is working

<br>

2. run frontend

-   from the root folder, navigate to fleet-sim folder by doing `cd fleet-sim`
-   run `npm install` to install all neccesary packages
-   run `npm start` to launch the front-end application

-   in browser goto `localhost:3000` or `127.0.1:3000` to test that the frontend is working

## Notes

Stations.csv contains the charging station and their locations.

Simulator will show data simulation of 10 mins every 6 seconds.

## Manual Testing Flow

1. Pressing play will start the application

    a. On the default demand prediction tab, line chart should show, as well as heatmap

    b. Switching to supply demand gap tab should show the bar chart, as well as zone map

2. Pause and reset the application

    a. The app should be able to pause the data, and reset to the initial state

3. Change the country

    a. App should be able to run in Singapore as well

    *(zone map does not work in singapore)

4. Change the zone

    a. App should be able to display for a single zone

5. Change variables while playing

    a. App should be able to change dynamically even when data is being sent from the backend
