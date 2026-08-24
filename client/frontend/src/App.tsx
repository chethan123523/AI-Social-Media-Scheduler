import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Layout  from "./components/Layout";
import Dashboard from "./pages/dashboard";
import Accounts from "./pages/accounts";
import Scheduler from "./pages/scheduler";
import Aicomposer from "./pages/aicomposer";
import { Toaster } from "react-hot-toast";


export default function App() {
    return (
        <>
        <Toaster position="top-right"/>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route element={<Layout/>}>
                <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/accounts" element={<Accounts/>}/>
                <Route path="/scheduler" element={<Scheduler/>}/>
                <Route path="/aicomposer" element={<Aicomposer/>}/>
                
                </Route>
                
            </Routes>
        </>
    );
}
