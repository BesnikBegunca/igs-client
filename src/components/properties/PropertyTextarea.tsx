interface Props {

    label: string;

    value: string;

    placeholder?: string;

    onChange: (value: string) => void;

}



export default function PropertyTextarea({

    label,

    value,

    placeholder,

    onChange

}: Props) {


    return (


        <div className="property-field">


            <label>

                {label}

            </label>



            <textarea


                value={value}


                placeholder={placeholder}


                onChange={(e) =>

                    onChange(
                        e.target.value
                    )

                }


            />


        </div>


    );

}