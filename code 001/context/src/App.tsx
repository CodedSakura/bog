import React, { ReactNode, createContext, useState } from "react";
import Content from "./Content";
import Info from "./Info";

export const InfoContext = createContext<[
	ReactNode[],
	React.Dispatch<React.SetStateAction<ReactNode[]>>,
]>([[], () => []]);

export default function App() {
	const [ infoLines, setInfoLines ] = useState([] as ReactNode[]);

	return <InfoContext.Provider value={[ infoLines, setInfoLines ]}>
		<Content />
		<Info lines={infoLines} />
	</InfoContext.Provider>;
}
