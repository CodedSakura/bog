import React, { ReactNode, createContext, useState } from "react";
import Content from "./Content";
import Info from "./Info";

export interface InfoLine {
  id: string,
  render: ReactNode,
}

export const InfoContext = createContext<[
	InfoLine[],
	React.Dispatch<React.SetStateAction<InfoLine[]>>,
]>([[], () => []]);

export default function App() {
	const [ infoLines, setInfoLines ] = useState([] as InfoLine[]);

	return <InfoContext.Provider value={[ infoLines, setInfoLines ]}>
		<Content />
		<Info lines={infoLines} />
	</InfoContext.Provider>;
}
