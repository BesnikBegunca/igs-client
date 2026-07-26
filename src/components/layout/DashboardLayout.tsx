import type { ReactNode } from "react";

import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";




interface Props {

    children: ReactNode;

}





export default function DashboardLayout({

    children

}: Props) {



    return (



        <div className="dashboard-layout">



            <LeftSidebar />





            <main className="graph-area">


                {children}


            </main>





            <RightSidebar />



        </div>


    );

}