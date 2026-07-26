import { useState } from "react";

import Tabs from "../tabs/Tabs";

import CasesPanel from "../cases/CasesPanel";
import Toolbox from "../toolbox/Toolbox";
import EntityExplorer from "../entities/EntityExplorer";
import RelationshipExplorer from "../relationships/RelationshipExplorer";




export default function LeftSidebar() {



    const [activeTab, setActiveTab] = useState(
        "cases"
    );




    const tabs = [


        {
            id: "cases",
            label: "Cases",
            icon: "📁",
            content: <CasesPanel />
        },


        {
            id: "toolbox",
            label: "Toolbox",
            icon: "🧰",
            content: <Toolbox />
        },


        {
            id: "entities",
            label: "Entities",
            icon: "🧩",
            content: <EntityExplorer />
        },


        {
            id: "relationships",
            label: "Relations",
            icon: "🔗",
            content: <RelationshipExplorer />
        }


    ];





    return (


        <aside className="left-sidebar">


            <Tabs

                tabs={tabs}

                activeTab={activeTab}

                setActiveTab={setActiveTab}

            />


        </aside>


    );

}