export class Node {
	public Cost: number;
	public Position: Vector3;
	public Instance: Part;

	constructor(position: Vector3, cost: number, part: Part) {
		this.Position = position;
		this.Cost = cost;
		this.Instance = part;
	}
}
