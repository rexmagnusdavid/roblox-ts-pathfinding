import { Queue } from "@rbxts/stacks-and-queues";
import { Node } from "./Node";
import Object from "@rbxts/object-utils";
import { PriorityQueue } from "./PriorityQueue";

/**
 * Credits: https://www.redblobgames.com/pathfinding/a-star/implementation.html
 */
export class Grid {
	private _grid: Record<number, Record<number, Record<number, Node>>> = {};

	constructor() {}

	public AddNode(node: Node) {
		if (!this._grid[node.Position.X]) {
			this._grid[node.Position.X] = {};
		}

		if (!this._grid[node.Position.X][node.Position.Y]) {
			this._grid[node.Position.X][node.Position.Y] = {};
		}

		this._grid[node.Position.X][node.Position.Y][node.Position.Z] = node;
	}

	public GetNode(position: Vector3) {
		if (this._grid[position.X] === undefined) return undefined;
		if (this._grid[position.X][position.Y] === undefined) return undefined;
		if (this._grid[position.X][position.Y][position.Z] === undefined) return undefined;

		return this._grid[position.X][position.Y][position.Z];
	}

	public GetNeighbors(node: Node) {
		const neighbors: Node[] = [];
		const potentialNeighbors = [
			[0, 4],
			[4, 0],
			[-4, 0],
			[0, -4],
		];

		const position = node.Position;

		for (const pos of potentialNeighbors) {
			for (let y = -4; y <= 4; y += 4) {
				const neighbor = this.GetNode(new Vector3(position.X + pos[0], position.Y + y, position.Z + pos[1]));
				if (neighbor === undefined) continue;

				neighbors.push(neighbor);
			}
		}

		/*
		for (let x = -4; x <= 4; x += 4) {
			for (let z = -4; z <= 4; z += 4) {
				if (x === 0 && z === 0) continue;
				for (let y = -4; y <= 4; y += 4) {
					const neighbor = this.GetNode(new Vector3(position.X + x, position.Y + y, position.Z + z));
					if (neighbor === undefined) continue;

					neighbors.push(neighbor);


					print(new Vector3(position.X + x, position.Y + y, position.Z + z));
					neighbor.Instance.Material = Enum.Material.Neon;
					neighbor.Instance.Color = BrickColor.Green().Color;
					neighbor.Instance.Transparency = 0;

				}
			}
		}
		*/

		return neighbors;
	}

	public BreadthFirstSearch(origin: Node, goal: Node) {
		const frontier = new Queue<Node>();
		frontier.push(origin);

		const came_from = new Map<Node, Node | undefined>();
		came_from.set(origin, undefined);

		while (!frontier.isEmpty()) {
			const current = frontier.pop();
			if (current === undefined) continue;
			if (current === goal) break;

			this.GetNeighbors(current).forEach((neighbor) => {
				if (!came_from.has(neighbor)) {
					//neighbor.Instance.Color = BrickColor.White().Color;
					frontier.push(neighbor);
					came_from.set(neighbor, current);
					neighbor.Instance.SetAttribute("Point", current.Position);
				}
			});
		}

		return came_from;
	}

	public DijkstraSearch(origin: Node, goal: Node) {
		const frontier = new PriorityQueue<[Node, number]>((item1, item2) => {
			if (item2 === undefined) return false;
			return item1[1] > item2[1];
		});

		frontier.push([origin, 0]);

		const came_from = new Map<Node, Node | undefined>();
		const cost_so_far = new Map<Node, number>();

		came_from.set(origin, undefined);
		cost_so_far.set(origin, 0);

		while (!frontier.empty()) {
			const current = frontier.pop();
			if (current === undefined) continue;
			if (current[0] === goal) break;

			this.GetNeighbors(current[0]).forEach((neighbor) => {
				const current_cost = cost_so_far.get(current[0]);
				if (current_cost === undefined) return;
				const new_cost = current_cost + neighbor.Cost;
				if (!cost_so_far.has(neighbor) || new_cost < current_cost) {
					cost_so_far.set(neighbor, new_cost);
					const priority = new_cost;
					frontier.push([neighbor, priority]);
					came_from.set(neighbor, current[0]);
				}
			});
		}

		return { came_from, cost_so_far };
	}

	private Heuristic(a: Node, b: Node) {
		return math.abs(a.Position.X - b.Position.X) + math.abs(a.Position.Z - b.Position.Z);
	}

	public AStarSearch(start: Node, goal: Node) {
		const frontier = new PriorityQueue<[Node, number]>((item1, item2) => {
			if (item2 === undefined) return false;
			return item1[1] > item2[1];
		});

		frontier.push([start, 0]);

		const came_from = new Map<Node, Node | undefined>();
		const cost_so_far = new Map<Node, number>();

		came_from.set(start, undefined);
		cost_so_far.set(start, 0);

		while (!frontier.empty()) {
			const current = frontier.pop();
			if (current === undefined) continue;
			if (current[0] === goal) break;

			this.GetNeighbors(current[0]).forEach((neighbor) => {
				const current_cost = cost_so_far.get(current[0]);
				if (current_cost === undefined) return;
				const new_cost = current_cost + neighbor.Cost;
				if (!cost_so_far.has(neighbor) || new_cost < current_cost) {
					cost_so_far.set(neighbor, new_cost);
					const priority = new_cost + this.Heuristic(neighbor, goal);
					frontier.push([neighbor, priority]);
					came_from.set(neighbor, current[0]);
				}
			});
		}

		return { came_from, cost_so_far };
	}

	public DrawVector(point_to: Map<Node, Node | undefined>) {
		Object.values(this._grid).forEach((x) => {
			Object.values(x).forEach((y) => {
				Object.values(y).forEach((z) => {
					if (!point_to.has(z)) return;
					const pointed_node = point_to.get(z);
					if (pointed_node === undefined) return;

					let text = "";
					if (pointed_node.Position.X === z.Position.X + 4 && pointed_node.Position.Z === z.Position.Z + 4)
						text = "↘️";
					else if (
						pointed_node.Position.X === z.Position.X - 4 &&
						pointed_node.Position.Z === z.Position.Z + 4
					)
						text = "↙️";
					else if (
						pointed_node.Position.X === z.Position.X + 4 &&
						pointed_node.Position.Z === z.Position.Z - 4
					)
						text = "↗️";
					else if (
						pointed_node.Position.X === z.Position.X - 4 &&
						pointed_node.Position.Z === z.Position.Z - 4
					)
						text = "↖️";
					else if (pointed_node.Position.X === z.Position.X + 4) text = "➡️";
					else if (pointed_node.Position.X === z.Position.X - 4) text = "⬅️";
					else if (pointed_node.Position.Z === z.Position.Z + 4) text = "⬇️";
					else if (pointed_node.Position.Z === z.Position.Z - 4) text = "⬆️";

					const gui = new Instance("SurfaceGui");
					const label = new Instance("TextLabel");
					label.BackgroundTransparency = 1;
					label.Size = new UDim2(1, 0, 1, 0);
					label.Text = text;
					label.TextScaled = true;
					label.Parent = gui;
					gui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud;
					gui.PixelsPerStud = 48;
					gui.Face = Enum.NormalId.Top;
					gui.Parent = z.Instance;
				});
			});
		});
	}

	public DrawPath(came_from: Map<Node, Node | undefined>, origin: Node, goal: Node) {
		let current = goal;
		const path: Array<Node> = [];
		if (!came_from.has(goal)) return;

		const gui = new Instance("SurfaceGui");
		const label = new Instance("TextLabel");
		label.BackgroundTransparency = 1;
		label.Size = new UDim2(1, 0, 1, 0);
		label.Text = "🟩";
		label.TextScaled = true;
		label.Parent = gui;
		gui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud;
		gui.PixelsPerStud = 48;
		gui.Face = Enum.NormalId.Top;
		gui.Parent = goal.Instance;

		while (current !== origin) {
			path.push(current);
			const neighbor = came_from.get(current);
			if (neighbor === undefined) continue;
			current = neighbor;

			const gui3 = new Instance("SurfaceGui");
			const label3 = new Instance("TextLabel");
			label3.BackgroundTransparency = 1;
			label3.Size = new UDim2(1, 0, 1, 0);
			label3.Text = "🟦";
			label3.TextScaled = true;
			label3.Parent = gui3;
			gui3.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud;
			gui3.PixelsPerStud = 48;
			gui3.Face = Enum.NormalId.Top;
			gui3.Parent = current.Instance;
		}

		const gui2 = new Instance("SurfaceGui");
		const label2 = new Instance("TextLabel");
		label2.BackgroundTransparency = 1;
		label2.Size = new UDim2(1, 0, 1, 0);
		label2.Text = "🟥";
		label2.TextScaled = true;
		label2.Parent = gui2;
		gui2.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud;
		gui2.PixelsPerStud = 48;
		gui2.Face = Enum.NormalId.Top;
		gui2.Parent = origin.Instance;
	}
}
