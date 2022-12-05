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