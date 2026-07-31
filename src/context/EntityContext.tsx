import {
    createContext,
    useContext,
    useState
} from "react";

import type {
    ReactNode
} from "react";



/* =========================================================
   ENTITY TYPES
========================================================= */

export interface EntityRecord {

    id: string;

    type: string;

    category: string;

    name: string;

    icon?: string;

    attributes: Record<string, any>;

    createdAt: string;

}



/* =========================================================
   CONTEXT TYPE
========================================================= */

interface EntityContextType {

    entities: EntityRecord[];

    addEntity: (
        entity: Omit<
            EntityRecord,
            "id" | "createdAt"
        >
    ) => EntityRecord;

    getEntity: (
        id: string
    ) => EntityRecord | undefined;

    findEntityByName: (
        name: string
    ) => EntityRecord | undefined;

    searchEntities: (
        search: string
    ) => EntityRecord[];

    updateEntity: (
        id: string,
        data: Partial<EntityRecord>
    ) => void;

    deleteEntity: (
        id: string
    ) => void;

}



/* =========================================================
   CONTEXT
========================================================= */

const EntityContext = createContext<
    EntityContextType | null
>(null);



/* =========================================================
   PROVIDER
========================================================= */

export function EntityProvider({

    children

}: {

    children: ReactNode;

}) {


    const [
        entities,
        setEntities
    ] = useState<EntityRecord[]>([]);



    /* =====================================================
       ADD ENTITY
    ===================================================== */

    const addEntity = (

        entity: Omit<
            EntityRecord,
            "id" | "createdAt"
        >

    ): EntityRecord => {


        /*
            CHECK DUPLICATE

            For now we identify an entity by:

            type + name

            Later we can make this smarter using
            unique identifiers such as:

            Person -> passport / phone
            Vehicle -> plate / VIN
            Organization -> registration number
        */

        const existing = entities.find(

            item =>

                item.type.toLowerCase() ===
                entity.type.toLowerCase()

                &&

                item.name.trim().toLowerCase() ===
                entity.name.trim().toLowerCase()

        );



        if (existing) {

            return existing;

        }



        const newEntity: EntityRecord = {

            ...entity,

            id:

                `entity-${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 8)}`,

            createdAt:

                new Date().toISOString()

        };



        setEntities(prev => [

            ...prev,

            newEntity

        ]);



        return newEntity;

    };



    /* =====================================================
       GET ENTITY
    ===================================================== */

    const getEntity = (

        id: string

    ) => {

        return entities.find(

            entity =>

                String(entity.id) ===
                String(id)

        );

    };



    /* =====================================================
       FIND BY NAME
    ===================================================== */

    const findEntityByName = (

        name: string

    ) => {

        return entities.find(

            entity =>

                entity.name
                    .trim()
                    .toLowerCase() ===
                name
                    .trim()
                    .toLowerCase()

        );

    };



    /* =====================================================
       SEARCH
    ===================================================== */

    const searchEntities = (

        search: string

    ) => {


        const value =

            search
                .trim()
                .toLowerCase();



        if (!value) {

            return entities;

        }



        return entities.filter(

            entity => {


                const nameMatch =

                    entity.name
                        .toLowerCase()
                        .includes(value);



                const typeMatch =

                    entity.type
                        .toLowerCase()
                        .includes(value);



                const categoryMatch =

                    entity.category
                        .toLowerCase()
                        .includes(value);



                return (

                    nameMatch ||

                    typeMatch ||

                    categoryMatch

                );

            }

        );

    };



    /* =====================================================
       UPDATE ENTITY
    ===================================================== */

    const updateEntity = (

        id: string,

        data: Partial<EntityRecord>

    ) => {


        setEntities(prev =>

            prev.map(entity =>

                String(entity.id) ===
                    String(id)

                    ?

                    {

                        ...entity,

                        ...data

                    }

                    :

                    entity

            )

        );

    };



    /* =====================================================
       DELETE ENTITY
    ===================================================== */

    const deleteEntity = (

        id: string

    ) => {


        setEntities(prev =>

            prev.filter(

                entity =>

                    String(entity.id) !==
                    String(id)

            )

        );

    };



    /* =====================================================
       PROVIDER
    ===================================================== */

    return (

        <EntityContext.Provider

            value={{

                entities,

                addEntity,

                getEntity,

                findEntityByName,

                searchEntities,

                updateEntity,

                deleteEntity

            }}

        >

            {children}

        </EntityContext.Provider>

    );

}



/* =========================================================
   HOOK
========================================================= */

export function useEntities() {


    const context =

        useContext(EntityContext);



    if (!context) {

        throw new Error(

            "useEntities must be used inside EntityProvider"

        );

    }



    return context;

}