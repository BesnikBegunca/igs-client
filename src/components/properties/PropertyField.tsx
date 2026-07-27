interface Props {

    label: string;

    value: string;

    placeholder?: string;

    onChange: (value: string) => void;

}



export default function PropertyField({

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


            <input

                value={value}

                placeholder={placeholder}

                onChange={(e) =>
                    onChange(e.target.value)
                }

            />


        </div>

    );

}