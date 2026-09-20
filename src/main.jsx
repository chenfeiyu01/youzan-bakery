import React,{lazy,Suspense} from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";

const TastingRoom=lazy(()=>import('./TastingRoom.jsx'));
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {location.pathname.startsWith('/collection')?<Suspense fallback={<div style={{minHeight:'100vh',background:'#f2efe6'}}/>}><TastingRoom/></Suspense>:<App />}
  </React.StrictMode>,
);
