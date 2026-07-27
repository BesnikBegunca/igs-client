import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import ActiveCaseHeader from "../cases/ActiveCaseHeader";
import Header from "../header/Header";


interface Props {

    children: React.ReactNode;

}


export default function DashboardLayout({

    children

}: Props) {


    return (

        <div className="dashboard-layout">


            <LeftSidebar />


            <main className="graph-area">


                <Header />


                <ActiveCaseHeader />


                <div className="graph-content">

                    {children}

                </div>


            </main>



            <RightSidebar />


        </div>

    );

}