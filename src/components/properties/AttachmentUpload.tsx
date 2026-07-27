import { useRef } from "react";


interface Props {

    files: any[];

    onUpload: (files: any[]) => void;

}



export default function AttachmentUpload({

    files,

    onUpload

}: Props) {


    const inputRef = useRef<HTMLInputElement>(null);



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {


        const selected = Array.from(
            e.target.files || []
        );


        const newFiles = selected.map(file => ({


            id: crypto.randomUUID(),

            name: file.name,

            type: file.type,

            size: file.size,


        }));


        onUpload([

            ...files,

            ...newFiles

        ]);

    };




    return (

        <div>


            <button

                className="attachment-button"

                onClick={() =>
                    inputRef.current?.click()
                }

            >

                📎 Add Attachment

            </button>



            <input

                ref={inputRef}

                type="file"

                hidden

                multiple

                onChange={handleChange}

            />


        </div>

    );


}