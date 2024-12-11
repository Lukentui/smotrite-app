import { useEffect, useState } from "react";
import "./App.css";
import Dashboard from "./screens/Dashboard";
import TaskManager from "./screens/TaskManager";

const App = (props: { tab: number }) => {
    switch (props.tab) {
        case 0:
            return <Dashboard />;

        case 1:
            return <TaskManager />;
    }

    // return <TaskManager/>;
    // return <Dashboard/>;
};

export default App;
