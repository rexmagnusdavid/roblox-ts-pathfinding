import { Grid } from "shared/Grid";
import { Node } from "shared/Node";
import { markTerrain, markParts } from "shared/Marker";

// Setup
markParts(new Vector3(0, 0, 0), new Vector3(128, 128, 128));
const nodes = markTerrain(new Vector3(0, 0, 0), new Vector3(128, 128, 128), game.Workspace.Terrain);

const grid = new Grid();

nodes.forEach((node: Node) => grid.AddNode(node));

const node = grid.GetNode(new Vector3(40, -4, -8));
const goal = grid.GetNode(new Vector3(-48, -4, -8));

if (node !== undefined && goal !== undefined) {
	node.Instance.Material = Enum.Material.Neon;
	node.Instance.Color = BrickColor.Red().Color;
	node.Instance.Transparency = 0;

	goal.Instance.Material = Enum.Material.Neon;
	goal.Instance.Color = BrickColor.Green().Color;
	goal.Instance.Transparency = 0;

	grid.GetNeighbors(node);
	//const point_to = grid.BreadthFirstSearch(node, goal);
	print("Begin pathfinding.");
	const { came_from } = grid.AStarSearch(node, goal);
	print("End pathfinding.");
	grid.DrawVector(came_from);
}
