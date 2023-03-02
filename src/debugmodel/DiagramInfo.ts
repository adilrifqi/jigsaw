export type VariableInfo = {name: string, type: string, value: string};
export type NodeInfo = {
	id: string,
	position: {x: number, y: number},
	type: string,
	data: {scopeTopVar?: boolean, title: VariableInfo | string, rows: (VariableInfo | string)[]}
};
export type EdgeInfo = {
	id: string,
	source: string,
	target: string,
	label: string,
	type: string
};

export function rowToString(rowInfo: VariableInfo | string): string {
	if (typeof rowInfo === 'string') return rowInfo;
	return rowInfo.name + "(" + rowInfo.type + "): " + rowInfo.value;
}