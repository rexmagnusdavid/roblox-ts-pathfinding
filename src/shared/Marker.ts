import { Node } from "./Node";

export function markTerrain(region: Vector3, size: Vector3, terrain: Terrain) {
	const regionStart = region.sub(size.div(2));
	const regionEnd = region.add(size.div(2));
	const voxels = terrain.ReadVoxels(new Region3(regionStart, regionEnd), 4);
	const materials = voxels[0];
	const occupancies = voxels[1];
	const terrainSize = materials.Size;
	const nodes: Array<Node> = [];

	for (let x = 0; x < terrainSize.X; x++) {
		for (let z = 0; z < terrainSize.Z; z++) {
			for (let y = 0; y < terrainSize.Y; y++) {
				if (y + 1 >= terrainSize.Y) continue;
				if (occupancies[x][y + 1][z] > 0) continue;
				if (occupancies[x][y][z] <= 0) continue;

				//print("(%2i, %2i, %2i): %.2f %s".format(x, y, z, occupancies[x][y][z], materials[x][y][z].Name));

				const part = new Instance("Part");
				part.Anchored = true;
				part.Material = materials[x][y][z];
				part.Color = terrain.GetMaterialColor(materials[x][y][z]);
				part.Size = new Vector3(3.75, 3.75, 3.75);
				part.Parent = game.Workspace;
				part.Transparency = 1 - occupancies[x][y][z];
				part.Position = new Vector3(4 * x, 4 * y, 4 * z).add(regionStart);
				part.Rotation = new Vector3(0, -90, 0);

				if (materials[x][y][z] === Enum.Material.Pavement) {
					print("Pavement");
					nodes.push(new Node(part.Position, 1, part));
					continue;
				}

				nodes.push(new Node(part.Position, 20, part));
			}
		}
	}

	terrain.Clear();
	return nodes;
}

export function markParts(region: Vector3, size: Vector3) {
	const regionStart = region.sub(size.div(2));
	const regionEnd = region.add(size.div(2));

	for (let x = regionStart.X; x < regionEnd.X; x += 2) {
		for (let y = regionStart.Y; y < regionEnd.Y; y += 2) {
			for (let z = regionStart.Z; z < regionEnd.Z; z += 2) {
				const parts = game.Workspace.GetPartBoundsInBox(new CFrame(x, y, z), new Vector3(2, 2, 2));
				if (parts.size() === 0) continue;
				const part = new Instance("Part");
				part.Anchored = true;
				part.Material = parts[0].Material;
				part.Color = parts[0].Color;
				part.Size = new Vector3(1.75, 1.75, 1.75);
				part.Parent = game.Workspace;
				part.Transparency = parts[0].Transparency;
				part.Position = new Vector3(x, y, z);
				part.CanCollide = false;
			}
		}
	}
}
