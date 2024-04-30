interface Props {
	lines: JSX.Element[];
}

export default function Info({ lines }: Props) {
	return <div>{lines}</div>;
}
