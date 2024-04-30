import { Fragment } from "react";
import { InfoLine } from "./App.tsx";

interface Props {
	lines: InfoLine[];
}

export default function Info({ lines }: Props) {
	return <div>
		{lines.map(v => <Fragment key={v.id}>{v.render}</Fragment>)}
	</div>;
}
