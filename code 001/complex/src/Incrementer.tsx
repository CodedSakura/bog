import { useContext, useEffect, useState } from "react";
import { InfoContext } from "./App";

interface Props {
    counterId: number;
}

export default function Incrementer({ counterId }: Props) {
    const [ infoLines, setInfoLines ] = useContext(InfoContext)
    const [ value, setValue ] = useState(0);

    useEffect(() => {
        const infoIndex = infoLines.findIndex(v => v.id === `counter:${counterId}`);
        if (infoIndex >= 0) {
          infoLines[infoIndex].render = <p>{counterId}: {value}</p>;
        } else {
          infoLines.push({
            id: `counter:${counterId}`,
            render: <p>{counterId}: {value}</p>,
          });
        }
        setInfoLines([...infoLines]);
    }, [ value ])

    return <div>
        <button onClick={() => setValue(v => v + 1)}>
            Increment counter {counterId} ({value})
        </button>
    </div>;
}
