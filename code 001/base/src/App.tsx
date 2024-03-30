import { useState } from "react";
import Content from "./Content";
import Info from "./Info";

export default function App() {
	const [ infoLines, setInfoLines ] = useState([] as JSX.Element[]);
	return <>
		<Content />
		<Info lines={infoLines} />
	</>;
}
