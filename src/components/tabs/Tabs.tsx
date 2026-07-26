import type { ReactNode } from "react";


interface Tab {

    id: string;

    label: string;

    icon?: string;

    content: ReactNode;

}



interface Props {

    tabs: Tab[];

    activeTab: string;

    setActiveTab: (id: string) => void;

}





export default function Tabs({

    tabs,

    activeTab,

    setActiveTab

}: Props) {



    return (

        <div className="tabs-container">



            <div className="tabs-header">


                {
                    tabs.map(tab => (


                        <button


                            key={tab.id}


                            className={

                                activeTab === tab.id

                                    ? "tab active"

                                    : "tab"

                            }



                            onClick={() =>


                                setActiveTab(

                                    tab.id

                                )

                            }


                        >


                            {tab.icon}

                            <span>

                                {tab.label}

                            </span>


                        </button>


                    ))

                }



            </div>





            <div className="tabs-content">


                {
                    tabs.map(tab =>


                        activeTab === tab.id && (

                            <div

                                key={tab.id}

                            >

                                {tab.content}

                            </div>

                        )

                    )
                }



            </div>



        </div>

    );

}