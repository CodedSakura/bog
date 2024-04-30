import { ReactNode } from "react";

interface Props {
	lines: ReactNode[];
}

export default function Info({ lines }: Props) {
	return <div>{lines}</div>;
}
