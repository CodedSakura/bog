import { useState } from "react";
import Incrementer from "./Incrementer";

export default function Content() {
	const [ count, setCount ] = useState(2);

	return <div>
		{ new Array(count)
			.fill(undefined)
			.map((_, i) => <Incrementer key={i} counterId={i} />) }
		<div>
			<button onClick={() => setCount(v => v + 1)}>
				Add new incrementer
			</button>
		</div>
	</div>;
}
