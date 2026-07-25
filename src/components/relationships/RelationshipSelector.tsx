interface Props {
    value: string;
    onChange: (value: string) => void;
}


export default function RelationshipSelector({
    value,
    onChange
}: Props) {


    const relationships = [

        "Owns",
        "Lives At",
        "Calls",
        "Knows",
        "Works For",
        "Sold To"

    ];



    return (

        <select

            value={value}

            onChange={(e) =>
                onChange(e.target.value)
            }

        >

            {
                relationships.map(item => (

                    <option
                        key={item}
                        value={item}
                    >

                        {item}

                    </option>

                ))
            }


        </select>

    );

}