import { useState } from "react";

interface Props {
    counterId: number;
}

export default function Incrementer({ counterId }: Props) {
    const [ value, setValue ] = useState(0);
    return <div>
        <button onClick={() => setValue(v => v + 1)}>
            Increment counter {counterId} ({value})
        </button>
    </div>;
}
