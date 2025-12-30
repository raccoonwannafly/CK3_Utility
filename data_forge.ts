
export const FORGE_DOCS_CONTENT: Record<string, string> = {
  'docs/dev_documentation.txt': `# CK3 DNA Forge - Developer Documentation

## 1. Overview
The CK3 DNA Forge is a specialized web application designed to simulate the character creation gene system found in Crusader Kings 3. It allows users to visualize and manipulate genetic parameters (morphs, accessories, colors) and generate valid DNA strings that can be pasted directly into the game or save files.

## 2. Architecture & Tech Stack

### Core Technologies
- **React 18**: UI rendering and state management.
- **TypeScript**: Type safety for complex gene data structures.
- **Tailwind CSS**: Utility-first styling with a custom configuration for the "CK3 Glass" aesthetic.

### File Structure
* \`components/\`:
    * \`GeneSlider.tsx\`: The primary input component. Handles the complex logic of templates vs. raw values.
    * \`GeneInfo.tsx\`: A persistent, draggable, resizable window (using React Portals) for displaying deep technical details about a specific gene.
    * \`DnaOutput.tsx\`: Generates the JSON-like Paradox script output.

## 3. Data Model: The Gene Definition

The core of the application is the \`GeneDefinition\` interface. CK3 genes are not simple 0-1 sliders; they often depend on "templates".

\`\`\`typescript
export interface GeneDefinition {
  id: string;          // e.g., "gene_chin_forward"
  name: string;        // e.g., "Chin Forward"
  group: string;       // e.g., "face" (linked to GENE_GROUPS)
  type: GeneType;      // MORPH | ACCESSORY | COLOR
  min: number;         // Default min value (usually -0.5 or 0.0)
  max: number;         // Default max value (usually 0.5 or 1.0)
  templates?: GeneTemplate[]; // Array of behavior modifiers
}
\`\`\`

### Understanding Templates
In CK3, a gene like \`gene_chin_forward\` has two templates: \`chin_forward_neg\` (negative range) and \`chin_forward_pos\` (positive range).
- The Simulator handles this by letting the user select a template via a dropdown in \`GeneSlider\`.
- The slider's effective range is dynamically updated based on the selected template's \`range\` property.
`,
  'docs/example_dna.txt': `ruler_designer_12345={
	type=male
	id=0
	genes={ 
		hair_color={ 45 239 45 239 }
		skin_color={ 172 125 172 125 }
		eye_color={ 44 174 44 174 }
		gene_chin_forward={ "gene_chin_forward_pos" 121 "gene_chin_forward_pos" 121 }
		gene_chin_height={ "gene_chin_height_pos" 122 "gene_chin_height_pos" 122 }
		gene_chin_width={ "gene_chin_width_pos" 126 "gene_chin_width_pos" 126 }
    }
}`,
  'docs/color_structure.txt': `Genes connect to the /ethnicities

=== Structure (very incomplete) ===

color_genes = {
	hair_color = {
		index = 0					# index within the DNA
		color = hair				# one of hair/eye/skin
		blend_range = { 0.4 0.6 }	# When inheriting the color, blend between "dominant" and "recessive" parent in this ratio. E.g. { 0.0 0.0 } will pick the "dominant" parent, and { 0.3 0.7 } with pick something 30% to 70% between parent's values.
	}
	...
}

decal = {
	type = skin						#decal type: skin or paint. Skin decals are added before skin color and use skin-diffuse+normal maps. Paint decals are added after skin color and use paint-diffuse+property maps.
	atlas_pos = { 0 0 }				#position of the decal in the atlas texture
	alpha_curve = {					#controls decal alpha relative to gene strength. Will give a linear interpolation if left unspecified
		#gene strength, decal alpha
		{ 0.0	0.6 }
		{ 1.0	0.6 }
	}
}`,
  'docs/color_definitions.txt': `color_genes = {
	hair_color = {
		group = hair
		color = hair
		blend_range = { 0.0 0.0 }
	}
	skin_color = {
		sync_inheritance_with = hair_color
		group = body
		color = skin
		blend_range = { 0.55 0.65 }
	}
	eye_color = {
		sync_inheritance_with = hair_color
		group = eyes
		color = eye
		blend_range = { 0.0 0.0 }
	}
}`,
  'docs/morph_definitions.txt': `@maleMin = -0.5
@maleMax = 0.499
@femaleMin = -0.4
@femaleMax = 0.4
@boyMin = -0.5
@boyMax = 0.499
@girlMin = -0.4
@girlMax = 0.4

@maleBsMin = 0.0
@maleBsMax = 1.0
@femaleBsMin = 0.0
@femaleBsMax = 0.8

age_presets = {
	age_preset_aging_primary = {
		mode = multiply
		curve = {
			{ 0.0 0.0 }
			{ 0.25 0.0 }
			{ 0.35 0.2 }
			{ 0.75 1.0 }
		}
	}
    # ... (Truncated for space, full list typically follows)
}

morph_genes = {
	gene_chin_forward = {
		ugliness_feature_categories = { chin mouth }
		group = face
		chin_forward_neg = {
			index = 0
			visible = no
			male = {
				setting = { attribute = "chin_forward"	value = { min = @maleMin max = @maleMax }	age = age_preset_child_features }
			}
		}
		chin_forward_pos = {
			index = 1
			male = {
				setting = { attribute = "chin_forward"	value = { min = @maleMin max = @maleMax }	age = age_preset_child_features }
			}
		}
	}
    # ... (Full list usually follows)
}`
};
