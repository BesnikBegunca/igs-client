interface Props {

    node: any;

    updateNode: (field: string, value: any) => void;

}

export default function AttachmentSection({

    node,

    updateNode

}: Props) {

    const attachments = node.data?.attachments || [];

    const addAttachment = (

        e: React.ChangeEvent<HTMLInputElement>

    ) => {

        const file = e.target.files?.[0];

        if (!file)

            return;

        const reader = new FileReader();

        reader.onload = () => {

            updateNode(

                "attachments",

                [

                    ...attachments,

                    {

                        id: Date.now().toString(),

                        name: file.name,

                        type: file.type,

                        size: file.size,

                        data: reader.result

                    }

                ]

            );

        };

        reader.readAsDataURL(file);

    };

    const removeAttachment = (id: string) => {

        updateNode(

            "attachments",

            attachments.filter(

                (item: any) => item.id !== id

            )

        );

    };

    return (

        <>

            <div className="property-section-title">

                📎 Attachments

            </div>

            <div className="property-field">

                <input

                    type="file"

                    onChange={addAttachment}

                />

            </div>

            {

                attachments.map((file: any) => (

                    <div

                        key={file.id}

                        className="attachment-item"

                    >

                        <span>

                            📄 {file.name}

                        </span>

                        <button

                            onClick={() =>

                                removeAttachment(file.id)

                            }

                        >

                            ✕

                        </button>

                    </div>

                ))

            }

        </>

    );

}