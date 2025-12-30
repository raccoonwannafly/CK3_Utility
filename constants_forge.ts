
import { GeneDefinition, GeneType, GeneGroup, ReferenceDocument } from './types';

export const GENE_GROUPS: GeneGroup[] = [
  { id: 'face', name: 'Face Structure', icon: 'User' },
  { id: 'eyes', name: 'Eyes', icon: 'Eye' },
  { id: 'ears', name: 'Ears', icon: 'Ear' },
  { id: 'nose', name: 'Nose', icon: 'Triangle' },
  { id: 'mouth', name: 'Mouth', icon: 'Smile' },
  { id: 'head_neck', name: 'Head & Neck', icon: 'UserPlus' },
  { id: 'body', name: 'Body', icon: 'Accessibility' },
  { id: 'hair', name: 'Hair & Color', icon: 'Palette' },
];

export const GAME_DOCUMENTS: ReferenceDocument[] = [
  { id: 'dev_documentation', title: 'Developer Documentation', description: 'Overview of project structure and components.', path: 'docs/dev_documentation.txt' },
  { id: 'example_dna', title: 'Example DNA', description: 'Sample character DNA block structure.', path: 'docs/example_dna.txt' },
  { id: 'color_structure', title: 'Color Structure', description: 'Technical breakdown of color gene inheritance.', path: 'docs/color_structure.txt' },
  { id: 'color_definitions', title: 'Color Definitions', description: 'List of color genes and ranges.', path: 'docs/color_definitions.txt' },
  { id: 'morph_definitions', title: 'Morph Definitions', description: 'List of morph genes, templates, and ranges.', path: 'docs/morph_definitions.txt' },
];

const MALE_MIN = -0.5;
const MALE_MAX = 0.5;
const BS_MIN = 0.0;
const BS_MAX = 1.0;

// Helper to quickly generate common template structures
const standardTemplates = (name: string) => [
  { name: `${name}_neg`, index: 0, range: { min: MALE_MIN, max: MALE_MAX }, notes: ["Male: -0.5 to 0.5"] },
  { name: `${name}_pos`, index: 1, range: { min: MALE_MIN, max: MALE_MAX }, notes: ["Male: -0.5 to 0.5"] }
];

export const GENE_DEFINITIONS: GeneDefinition[] = [
  // --- Face Morph ---
  { 
    id: 'gene_chin_forward', name: 'Chin Forward', group: 'face', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('chin_forward')
  },
  { 
    id: 'gene_chin_height', name: 'Chin Height', group: 'face', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('chin_height')
  },
  { 
    id: 'gene_chin_width', name: 'Chin Width', group: 'face', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('chin_width')
  },
  { 
    id: 'gene_jaw_angle', name: 'Jaw Angle', group: 'face', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('jaw_angle')
  },
  { 
    id: 'gene_jaw_forward', name: 'Jaw Forward', group: 'face', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('jaw_forward')
  },
  { 
    id: 'gene_jaw_height', name: 'Jaw Height', group: 'face', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('jaw_height')
  },
  { 
    id: 'gene_jaw_width', name: 'Jaw Width', group: 'face', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('jaw_width')
  },
  
  // --- Face Blend Shapes ---
  { 
    id: 'gene_bs_cheek_forward', name: 'Cheek Forward', group: 'face', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'cheek_forward_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'cheek_forward_pos', notes: ["Male BS Max: 1.0", "Female BS Max: 0.8"] },
      { name: 'cheek_forward_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'cheek_forward_neg', notes: ["Male BS Max: 1.0", "Female BS Max: 0.8"] }
    ]
  },
  { 
    id: 'gene_bs_cheek_height', name: 'Cheek Height', group: 'face', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'cheek_height_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'cheek_height_pos' },
      { name: 'cheek_height_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'cheek_height_neg' }
    ]
  },
  { 
    id: 'gene_bs_cheek_width', name: 'Cheek Width', group: 'face', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'cheek_width_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'cheek_width_pos' },
      { name: 'cheek_width_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'cheek_width_neg' }
    ]
  },
  { 
    id: 'gene_bs_jaw_def', name: 'Jaw Definition', group: 'face', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'jaw_def_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'jaw_def_pos' },
      { name: 'jaw_def_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'jaw_def_neg' }
    ]
  },
  {
    id: 'face_detail_cheek_def', name: 'Cheek Definition', group: 'face', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'cheek_def_01', index: 0, range: { min: 0, max: 1 } },
      { name: 'cheek_def_02', index: 1, range: { min: 0, max: 1 } }
    ]
  },
  {
    id: 'face_detail_cheek_fat', name: 'Cheek Fat', group: 'face', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'cheek_fat_01_pos', index: 0, range: { min: 0, max: 1 } },
      { name: 'cheek_fat_02_pos', index: 1, range: { min: 0, max: 1 } },
      { name: 'cheek_fat_03_pos', index: 2, range: { min: 0, max: 1 } },
      { name: 'cheek_fat_04_pos', index: 3, range: { min: 0, max: 1 } },
      { name: 'cheek_fat_01_neg', index: 4, range: { min: 0, max: 1 } }
    ]
  },
  {
    id: 'face_detail_chin_cleft', name: 'Chin Cleft', group: 'face', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'chin_cleft', index: 0, range: { min: 0, max: 1 } },
      { name: 'chin_dimple', index: 1, range: { min: 0, max: 1 } }
    ]
  },
  {
    id: 'face_detail_chin_def', name: 'Chin Definition', group: 'face', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'chin_def_neg', index: 0, range: { min: 0, max: 1 } },
      { name: 'chin_def', index: 1, range: { min: 0, max: 1 } }
    ]
  },
  {
    id: 'face_detail_temple_def', name: 'Temple Definition', group: 'face', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [{ name: 'temple_def', index: 0, range: { min: 0, max: 1 } }]
  },
  {
    id: 'expression_brow_wrinkles', name: 'Brow Wrinkles', group: 'face', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'brow_wrinkles_01', index: 0, range: { min: 0, max: 1 } },
      { name: 'brow_wrinkles_02', index: 1, range: { min: 0, max: 1 } },
      { name: 'brow_wrinkles_03', index: 2, range: { min: 0, max: 1 } },
      { name: 'brow_wrinkles_04', index: 3, range: { min: 0, max: 1 } }
    ]
  },
  {
    id: 'expression_forehead_wrinkles', name: 'Forehead Wrinkles', group: 'face', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'forehead_wrinkles_01', index: 0, range: { min: 0, max: 1 } },
      { name: 'forehead_wrinkles_02', index: 1, range: { min: 0, max: 1 } },
      { name: 'forehead_wrinkles_03', index: 2, range: { min: 0, max: 1 } }
    ]
  },
  {
    id: 'expression_other', name: 'Other Expressions', group: 'face', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'cheek_wrinkles_left_01', index: 0, range: { min: 0, max: 1 } },
      { name: 'cheek_wrinkles_right_01', index: 1, range: { min: 0, max: 1 } },
      { name: 'cheek_wrinkles_both_01', index: 2, range: { min: 0, max: 1 } },
      { name: 'nose_wrinkles_01', index: 3, range: { min: 0, max: 1 } }
    ]
  },

  // --- Ears ---
  { 
    id: 'gene_bs_ear_angle', name: 'Ear Angle', group: 'ears', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'ear_angle_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'ear_angle_pos' },
      { name: 'ear_angle_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'ear_angle_neg' }
    ]
  },
  { 
    id: 'gene_bs_ear_inner_shape', name: 'Ear Inner Shape', group: 'ears', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [{ name: 'ear_inner_shape_pos', index: 0, range: { min: 0, max: 1 } }]
  },
  { 
    id: 'gene_bs_ear_bend', name: 'Ear Bend', group: 'ears', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'ear_lower_bend_pos', index: 0, range: { min: 0, max: 1 } },
      { name: 'ear_upper_bend_pos', index: 1, range: { min: 0, max: 1 } },
      { name: 'ear_both_bend_pos', index: 2, range: { min: 0, max: 1 } }
    ]
  },
  { 
    id: 'gene_bs_ear_outward', name: 'Ear Outward', group: 'ears', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'ear_outward_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'ear_outward_pos' },
      { name: 'ear_outward_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'ear_outward_neg' }
    ]
  },
  { 
    id: 'gene_bs_ear_size', name: 'Ear Size', group: 'ears', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'ear_size_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'ear_size_pos' },
      { name: 'ear_size_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'ear_size_neg' }
    ]
  },

  // --- Eyes Morph ---
  { 
    id: 'gene_eye_angle', name: 'Eye Angle', group: 'eyes', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('eye_angle')
  },
  { 
    id: 'gene_eye_depth', name: 'Eye Depth', group: 'eyes', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('eye_depth')
  },
  { 
    id: 'gene_eye_height', name: 'Eye Height', group: 'eyes', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('eye_height')
  },
  { 
    id: 'gene_eye_distance', name: 'Eye Distance', group: 'eyes', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('eye_distance')
  },
  { 
    id: 'gene_eye_shut', name: 'Eye Shut', group: 'eyes', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('eye_shut')
  },

  // --- Eyes Blend Shapes ---
  { 
    id: 'gene_bs_eye_corner_depth', name: 'Eye Corner Depth', group: 'eyes', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'eye_corner_depth_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'eye_corner_depth_pos' },
      { name: 'eye_corner_depth_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'eye_corner_depth_neg' }
    ]
  },
  { 
    id: 'gene_bs_eye_fold_shape', name: 'Eye Fold Shape', group: 'eyes', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'eye_fold_shape_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'eye_fold_shape_pos' },
      { name: 'eye_fold_shape_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'eye_fold_shape_neg' },
      { name: 'eye_fold_shape_02_neg', index: 2, range: { min: 0, max: 1 }, mirrors: 'eye_fold_shape_pos' }
    ]
  },
  { 
    id: 'gene_bs_eye_size', name: 'Eye Size', group: 'eyes', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'eye_size_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'eye_size_pos' },
      { name: 'eye_size_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'eye_size_neg' }
    ]
  },
  { 
    id: 'gene_bs_eye_upper_lid_size', name: 'Upper Lid Size', group: 'eyes', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'eye_upper_lid_size_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'eye_upper_lid_size_pos' },
      { name: 'eye_upper_lid_size_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'eye_upper_lid_size_neg' }
    ]
  },
  {
    id: 'face_detail_eye_lower_lid_def', name: 'Lower Lid Def', group: 'eyes', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'eye_lower_lid_def', index: 0, range: { min: 0, max: 1 } },
      { name: 'eye_lower_lid_def_02', index: 1, range: { min: 0, max: 1 } }
    ]
  },
  {
    id: 'face_detail_eye_socket', name: 'Eye Socket', group: 'eyes', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'eye_socket_01', index: 0, range: { min: 0, max: 1 } },
      { name: 'eye_socket_02', index: 1, range: { min: 0, max: 1 } },
      { name: 'eye_socket_03', index: 2, range: { min: 0, max: 1 } },
      { name: 'eye_socket_color_01', index: 3, range: { min: 0, max: 1 } },
      { name: 'eye_socket_color_02', index: 4, range: { min: 0, max: 1 } },
      { name: 'eye_socket_color_03', index: 5, range: { min: 0, max: 1 } }
    ]
  },
  {
    id: 'expression_eye_wrinkles', name: 'Eye Wrinkles', group: 'eyes', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'eye_wrinkles_01', index: 0, range: { min: 0, max: 1 } },
      { name: 'eye_wrinkles_02', index: 1, range: { min: 0, max: 1 } },
      { name: 'eye_wrinkles_03', index: 2, range: { min: 0, max: 1 } }
    ]
  },
  {
    id: 'gene_eyebrows_shape', name: 'Eyebrow Shape', group: 'eyes', type: GeneType.MORPH, min: 0, max: 12, rawAttribute: 'index',
    templates: [
      { name: 'no_eyebrows', index: 0, range: { min: 0, max: 1 } },
      { name: 'avg_spacing_avg_thickness', index: 1, range: { min: 0, max: 1 } },
      { name: 'avg_spacing_high_thickness', index: 2, range: { min: 0, max: 1 } },
      { name: 'avg_spacing_low_thickness', index: 3, range: { min: 0, max: 1 } },
      { name: 'avg_spacing_lower_thickness', index: 4, range: { min: 0, max: 1 } },
      { name: 'far_spacing_avg_thickness', index: 5, range: { min: 0, max: 1 } },
      { name: 'far_spacing_high_thickness', index: 6, range: { min: 0, max: 1 } },
      { name: 'far_spacing_low_thickness', index: 7, range: { min: 0, max: 1 } },
      { name: 'far_spacing_lower_thickness', index: 8, range: { min: 0, max: 1 } },
      { name: 'close_spacing_avg_thickness', index: 9, range: { min: 0, max: 1 } },
      { name: 'close_spacing_high_thickness', index: 10, range: { min: 0, max: 1 } },
      { name: 'close_spacing_low_thickness', index: 11, range: { min: 0, max: 1 } },
      { name: 'close_spacing_lower_thickness', index: 12, range: { min: 0, max: 1 } }
    ]
  },
  {
    id: 'gene_eyebrows_fullness', name: 'Eyebrow Fullness', group: 'eyes', type: GeneType.MORPH, min: 0, max: 4, rawAttribute: 'index',
    templates: [
      { name: 'no_eyebrows', index: 0, range: { min: 0, max: 1 } },
      { name: 'layer_2_avg_thickness', index: 1, range: { min: 0, max: 1 } },
      { name: 'layer_2_high_thickness', index: 2, range: { min: 0, max: 1 } },
      { name: 'layer_2_low_thickness', index: 3, range: { min: 0, max: 1 } },
      { name: 'layer_2_lower_thickness', index: 4, range: { min: 0, max: 1 } }
    ]
  },

  // --- Nose ---
  { 
    id: 'gene_bs_nose_forward', name: 'Nose Forward', group: 'nose', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'nose_forward_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'nose_forward_pos' },
      { name: 'nose_forward_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'nose_forward_neg' }
    ]
  },
  { 
    id: 'gene_bs_nose_height', name: 'Nose Height', group: 'nose', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'nose_height_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'nose_height_pos' },
      { name: 'nose_height_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'nose_height_neg' }
    ]
  },
  { 
    id: 'gene_bs_nose_length', name: 'Nose Length', group: 'nose', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'nose_length_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'nose_length_pos' },
      { name: 'nose_length_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'nose_length_neg' }
    ]
  },
  { 
    id: 'gene_bs_nose_nostril_height', name: 'Nostril Height', group: 'nose', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'nose_nostril_height_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'nose_nostril_height_pos' },
      { name: 'nose_nostril_height_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'nose_nostril_height_neg' }
    ]
  },
  { 
    id: 'gene_bs_nose_nostril_width', name: 'Nostril Width', group: 'nose', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'nose_nostril_width_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'nose_nostril_width_pos' },
      { name: 'nose_nostril_width_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'nose_nostril_width_neg' }
    ]
  },
  { 
    id: 'gene_bs_nose_profile', name: 'Nose Profile', group: 'nose', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'nose_profile_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'nose_profile_pos' },
      { name: 'nose_profile_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'nose_profile_neg' },
      { name: 'nose_profile_hawk', index: 2, range: { min: 0, max: 1 }, mirrors: 'nose_profile_hawk_pos' },
      { name: 'nose_profile_hawk_pos', index: 3, range: { min: 0, max: 1 }, mirrors: 'nose_profile_hawk' }
    ]
  },
  { 
    id: 'gene_bs_nose_ridge_angle', name: 'Ridge Angle', group: 'nose', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'nose_ridge_angle_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'nose_ridge_angle_pos' },
      { name: 'nose_ridge_angle_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'nose_ridge_angle_neg' }
    ]
  },
  { 
    id: 'gene_bs_nose_ridge_width', name: 'Ridge Width', group: 'nose', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'nose_ridge_width_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'nose_ridge_width_pos' },
      { name: 'nose_ridge_width_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'nose_ridge_width_neg' }
    ]
  },
  { 
    id: 'gene_bs_nose_size', name: 'Nose Size', group: 'nose', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'nose_size_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'nose_size_pos' },
      { name: 'nose_size_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'nose_size_neg' }
    ]
  },
  { 
    id: 'gene_bs_nose_tip_angle', name: 'Tip Angle', group: 'nose', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'nose_tip_angle_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'nose_tip_angle_pos' },
      { name: 'nose_tip_angle_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'nose_tip_angle_neg' }
    ]
  },
  { 
    id: 'gene_bs_nose_tip_forward', name: 'Tip Forward', group: 'nose', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'nose_tip_forward_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'nose_tip_forward_pos' },
      { name: 'nose_tip_forward_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'nose_tip_forward_neg' }
    ]
  },
  { 
    id: 'gene_bs_nose_tip_width', name: 'Tip Width', group: 'nose', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'nose_tip_width_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'nose_tip_width_pos' },
      { name: 'nose_tip_width_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'nose_tip_width_neg' }
    ]
  },
  {
    id: 'face_detail_nasolabial', name: 'Nasolabial', group: 'nose', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'nasolabial_01', index: 0, range: { min: 0, max: 1 } },
      { name: 'nasolabial_02', index: 1, range: { min: 0, max: 1 } },
      { name: 'nasolabial_03', index: 2, range: { min: 0, max: 1 } },
      { name: 'nasolabial_04', index: 3, range: { min: 0, max: 1 } }
    ]
  },
  {
    id: 'face_detail_nose_ridge_def', name: 'Nose Ridge Def', group: 'nose', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'nose_ridge_def_pos', index: 0, range: { min: 0, max: 1 } },
      { name: 'nose_ridge_def_neg', index: 1, range: { min: 0, max: 1 } }
    ]
  },
  {
    id: 'face_detail_nose_tip_def', name: 'Nose Tip Def', group: 'nose', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [{ name: 'nose_tip_def', index: 0, range: { min: 0, max: 1 } }]
  },

  // --- Mouth Morph ---
  { 
    id: 'gene_mouth_corner_depth', name: 'Corner Depth', group: 'mouth', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('mouth_corner_depth')
  },
  { 
    id: 'gene_mouth_corner_height', name: 'Corner Height', group: 'mouth', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('mouth_corner_height')
  },
  { 
    id: 'gene_mouth_forward', name: 'Mouth Forward', group: 'mouth', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('mouth_forward')
  },
  { 
    id: 'gene_mouth_height', name: 'Mouth Height', group: 'mouth', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('mouth_height')
  },
  { 
    id: 'gene_mouth_width', name: 'Mouth Width', group: 'mouth', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('mouth_width')
  },
  { 
    id: 'gene_mouth_upper_lip_size', name: 'Upper Lip Size', group: 'mouth', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('mouth_upper_lip_size')
  },
  { 
    id: 'gene_mouth_lower_lip_size', name: 'Lower Lip Size', group: 'mouth', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('mouth_lower_lip_size')
  },
  { 
    id: 'gene_mouth_open', name: 'Mouth Open', group: 'mouth', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('mouth_open')
  },
  { 
    id: 'gene_bs_mouth_lower_lip_def', name: 'Lower Lip Def', group: 'mouth', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [{ name: 'mouth_lower_lip_def_pos', index: 0, range: { min: 0, max: 1 } }]
  },
  { 
    id: 'gene_bs_mouth_lower_lip_full', name: 'Lower Lip Full', group: 'mouth', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'mouth_lower_lip_full_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'mouth_lower_lip_full_pos' },
      { name: 'mouth_lower_lip_full_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'mouth_lower_lip_full_neg' }
    ]
  },
  { 
    id: 'gene_bs_mouth_lower_lip_pad', name: 'Lower Lip Pad', group: 'mouth', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'mouth_lower_lip_pad_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'mouth_lower_lip_pad_pos' },
      { name: 'mouth_lower_lip_pad_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'mouth_lower_lip_pad_neg' }
    ]
  },
  { 
    id: 'gene_bs_mouth_lower_lip_width', name: 'Lower Lip Width', group: 'mouth', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'mouth_lower_lip_width_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'mouth_lower_lip_width_pos' },
      { name: 'mouth_lower_lip_width_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'mouth_lower_lip_width_neg' }
    ]
  },
  { 
    id: 'gene_bs_mouth_philtrum_def', name: 'Philtrum Def', group: 'mouth', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [{ name: 'mouth_philtrum_def_pos', index: 0, range: { min: 0, max: 1 } }]
  },
  { 
    id: 'gene_bs_mouth_philtrum_shape', name: 'Philtrum Shape', group: 'mouth', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'mouth_philtrum_shape_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'mouth_philtrum_shape_pos' },
      { name: 'mouth_philtrum_shape_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'mouth_philtrum_shape_neg' }
    ]
  },
  { 
    id: 'gene_bs_mouth_philtrum_width', name: 'Philtrum Width', group: 'mouth', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'mouth_philtrum_width_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'mouth_philtrum_width_pos' },
      { name: 'mouth_philtrum_width_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'mouth_philtrum_width_neg' }
    ]
  },
  { 
    id: 'gene_bs_mouth_upper_lip_def', name: 'Upper Lip Def', group: 'mouth', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [{ name: 'mouth_upper_lip_def_pos', index: 0, range: { min: 0, max: 1 } }]
  },
  { 
    id: 'gene_bs_mouth_upper_lip_full', name: 'Upper Lip Full', group: 'mouth', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'mouth_upper_lip_full_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'mouth_upper_lip_full_pos' },
      { name: 'mouth_upper_lip_full_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'mouth_upper_lip_full_neg' }
    ]
  },
  { 
    id: 'gene_bs_mouth_upper_lip_profile', name: 'Upper Lip Profile', group: 'mouth', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'mouth_upper_lip_profile_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'mouth_upper_lip_profile_pos' },
      { name: 'mouth_upper_lip_profile_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'mouth_upper_lip_profile_neg' }
    ]
  },
  { 
    id: 'gene_bs_mouth_upper_lip_width', name: 'Upper Lip Width', group: 'mouth', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'mouth_upper_lip_width_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'mouth_upper_lip_width_pos' },
      { name: 'mouth_upper_lip_width_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'mouth_upper_lip_width_neg' }
    ]
  },

  // --- Head & Neck ---
  { 
    id: 'gene_forehead_angle', name: 'Forehead Angle', group: 'head_neck', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('forehead_angle')
  },
  { 
    id: 'gene_forehead_brow_height', name: 'Brow Height', group: 'head_neck', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('forehead_brow_height')
  },
  { 
    id: 'gene_forehead_roundness', name: 'Forehead Roundness', group: 'head_neck', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('forehead_roundness')
  },
  { 
    id: 'gene_forehead_width', name: 'Forehead Width', group: 'head_neck', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('forehead_width')
  },
  { 
    id: 'gene_forehead_height', name: 'Forehead Height', group: 'head_neck', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('forehead_height')
  },
  { 
    id: 'gene_head_height', name: 'Head Height', group: 'head_neck', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('head_height')
  },
  { 
    id: 'gene_head_width', name: 'Head Width', group: 'head_neck', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('head_width')
  },
  { 
    id: 'gene_head_profile', name: 'Head Profile', group: 'head_neck', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('head_profile')
  },
  { 
    id: 'gene_head_top_height', name: 'Head Top Height', group: 'head_neck', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('head_top_height')
  },
  { 
    id: 'gene_head_top_width', name: 'Head Top Width', group: 'head_neck', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('head_top_width')
  },
  { 
    id: 'gene_neck_length', name: 'Neck Length', group: 'head_neck', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('neck_length')
  },
  { 
    id: 'gene_neck_width', name: 'Neck Width', group: 'head_neck', type: GeneType.MORPH, min: MALE_MIN, max: MALE_MAX,
    templates: standardTemplates('neck_width')
  },
  {
    id: 'gene_bs_forehead_brow_curve', name: 'Brow Curve', group: 'head_neck', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'forehead_brow_curve_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'forehead_brow_curve_pos' },
      { name: 'forehead_brow_curve_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'forehead_brow_curve_neg' }
    ]
  },
  {
    id: 'gene_bs_forehead_brow_forward', name: 'Brow Forward', group: 'head_neck', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'forehead_brow_forward_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'forehead_brow_forward_pos' },
      { name: 'forehead_brow_forward_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'forehead_brow_forward_neg' }
    ]
  },
  {
    id: 'gene_bs_forehead_brow_inner_height', name: 'Brow Inner Height', group: 'head_neck', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'forehead_brow_inner_height_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'forehead_brow_inner_height_pos' },
      { name: 'forehead_brow_inner_height_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'forehead_brow_inner_height_neg' }
    ]
  },
  {
    id: 'gene_bs_forehead_brow_outer_height', name: 'Brow Outer Height', group: 'head_neck', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'forehead_brow_outer_height_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'forehead_brow_outer_height_pos' },
      { name: 'forehead_brow_outer_height_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'forehead_brow_outer_height_neg' }
    ]
  },
  {
    id: 'gene_bs_forehead_brow_width', name: 'Brow Width', group: 'head_neck', type: GeneType.MORPH, min: BS_MIN, max: BS_MAX,
    templates: [
      { name: 'forehead_brow_width_neg', index: 0, range: { min: 0, max: 1 }, mirrors: 'forehead_brow_width_pos' },
      { name: 'forehead_brow_width_pos', index: 1, range: { min: 0, max: 1 }, mirrors: 'forehead_brow_width_neg' }
    ]
  },
  {
    id: 'complexion', name: 'Complexion', group: 'head_neck', type: GeneType.MORPH, min: 0, max: 10, rawAttribute: "index",
    templates: [
      { name: 'complexion_1', index: 0, range: { min: 0, max: 1 } },
      { name: 'complexion_2', index: 1, range: { min: 0, max: 1 } },
      { name: 'complexion_3', index: 2, range: { min: 0, max: 1 } },
      { name: 'complexion_4', index: 3, range: { min: 0, max: 1 } },
      { name: 'complexion_5', index: 4, range: { min: 0, max: 1 } },
      { name: 'complexion_6', index: 5, range: { min: 0, max: 1 } },
      { name: 'complexion_7', index: 6, range: { min: 0, max: 1 } },
      { name: 'complexion_smooth_1', index: 7, range: { min: 0, max: 1 } },
      { name: 'complexion_beauty_1', index: 8, range: { min: 0, max: 1 } },
      { name: 'complexion_ugly_1', index: 9, range: { min: 0, max: 1 } },
      { name: 'complexion_no_face', index: 10, range: { min: 0, max: 1 } }
    ]
  },

  // --- Body ---
  { 
    id: 'gene_height', name: 'Height', group: 'body', type: GeneType.MORPH, min: 0, max: 3, rawAttribute: "index",
    templates: [
      { name: 'full_height', index: 0, range: { min: 0, max: 1 } },
      { name: 'normal_height', index: 1, range: { min: 0, max: 1 } },
      { name: 'dwarf_height', index: 2, range: { min: 0, max: 1 } },
      { name: 'giant_height', index: 3, range: { min: 0, max: 1 } }
    ]
  },
  { 
    id: 'gene_bs_body_type', name: 'Body Type', group: 'body', type: GeneType.MORPH, min: 0, max: 4, rawAttribute: "index",
    templates: [
      { name: 'body_average', index: 0, range: { min: 0, max: 1 } },
      { name: 'body_fat_head_fat_low', index: 1, range: { min: 0, max: 1 } },
      { name: 'body_fat_head_fat_medium', index: 2, range: { min: 0, max: 1 } },
      { name: 'body_fat_head_fat_full', index: 3, range: { min: 0, max: 1 } },
      { name: 'no_portrait', index: 4, range: { min: 0, max: 1 } }
    ]
  }, 
  { 
    id: 'gene_bs_body_shape', name: 'Body Shape', group: 'body', type: GeneType.MORPH, min: 0, max: 11, rawAttribute: "index",
    templates: [
      { name: 'body_shape_average_clothed', index: 0, range: { min: 0, max: 1 } },
      { name: 'body_shape_average', index: 1, range: { min: 0, max: 1 } },
      { name: 'body_shape_apple_half', index: 2, range: { min: 0, max: 1 } },
      { name: 'body_shape_apple_full', index: 3, range: { min: 0, max: 1 } },
      { name: 'body_shape_hourglass_half', index: 4, range: { min: 0, max: 1 } },
      { name: 'body_shape_hourglass_full', index: 5, range: { min: 0, max: 1 } },
      { name: 'body_shape_pear_half', index: 6, range: { min: 0, max: 1 } },
      { name: 'body_shape_pear_full', index: 7, range: { min: 0, max: 1 } },
      { name: 'body_shape_rectangle_half', index: 8, range: { min: 0, max: 1 } },
      { name: 'body_shape_rectangle_full', index: 9, range: { min: 0, max: 1 } },
      { name: 'body_shape_triangle_half', index: 10, range: { min: 0, max: 1 } },
      { name: 'body_shape_triangle_full', index: 11, range: { min: 0, max: 1 } }
    ]
  },
  { 
    id: 'gene_bs_bust', name: 'Bust Shape', group: 'body', type: GeneType.MORPH, min: 0, max: 10, rawAttribute: "index",
    templates: [
      { name: 'bust_clothes', index: 0, range: { min: 0, max: 1 } },
      { name: 'bust_clothes_light', index: 1, range: { min: 0, max: 1 } },
      { name: 'bust_default', index: 2, range: { min: 0, max: 1 } },
      { name: 'bust_shape_1_half', index: 3, range: { min: 0, max: 1 } },
      { name: 'bust_shape_1_full', index: 4, range: { min: 0, max: 1 } },
      { name: 'bust_shape_2_half', index: 5, range: { min: 0, max: 1 } },
      { name: 'bust_shape_2_full', index: 6, range: { min: 0, max: 1 } },
      { name: 'bust_shape_3_half', index: 7, range: { min: 0, max: 1 } },
      { name: 'bust_shape_3_full', index: 8, range: { min: 0, max: 1 } },
      { name: 'bust_shape_4_half', index: 9, range: { min: 0, max: 1 } },
      { name: 'bust_shape_4_full', index: 10, range: { min: 0, max: 1 } }
    ]
  },
  {
    id: 'gene_body_hair', name: 'Body Hair', group: 'body', type: GeneType.MORPH, min: 0, max: 8, rawAttribute: "index",
    templates: [
      { name: 'body_hair_sparse', index: 0, range: { min: 0, max: 1 } },
      { name: 'body_hair_avg', index: 1, range: { min: 0, max: 1 } },
      { name: 'body_hair_dense', index: 2, range: { min: 0, max: 1 } },
      { name: 'body_hair_sparse_low_stubble', index: 3, range: { min: 0, max: 1 } },
      { name: 'body_hair_avg_low_stubble', index: 4, range: { min: 0, max: 1 } },
      { name: 'body_hair_dense_low_stubble', index: 5, range: { min: 0, max: 1 } },
      { name: 'body_hair_sparse_lower_stubble', index: 6, range: { min: 0, max: 1 } },
      { name: 'body_hair_avg_lower_stubble', index: 7, range: { min: 0, max: 1 } },
      { name: 'body_hair_dense_lower_stubble', index: 8, range: { min: 0, max: 1 } }
    ]
  },
  {
    id: 'gene_age', name: 'Ageing', group: 'body', type: GeneType.MORPH, min: 0, max: 5, rawAttribute: "index",
    templates: [
      { name: 'old_1', index: 0, range: { min: 0, max: 1 } },
      { name: 'old_2', index: 1, range: { min: 0, max: 1 } },
      { name: 'old_3', index: 2, range: { min: 0, max: 1 } },
      { name: 'old_4', index: 3, range: { min: 0, max: 1 } },
      { name: 'old_beauty_1', index: 4, range: { min: 0, max: 1 } },
      { name: 'no_aging', index: 5, range: { min: 0, max: 1 } }
    ]
  },

  // --- Colors & Hair ---
  { id: 'hair_color', name: 'Hair Color', group: 'hair', type: GeneType.COLOR, min: 0, max: 1, rawAttribute: "palette_coordinates" },
  { id: 'skin_color', name: 'Skin Color', group: 'hair', type: GeneType.COLOR, min: 0, max: 1, rawAttribute: "palette_coordinates" },
  { id: 'eye_color', name: 'Eye Color', group: 'hair', type: GeneType.COLOR, min: 0, max: 1, rawAttribute: "palette_coordinates" },
  { 
    id: 'gene_hair_type', name: 'Hair Type', group: 'hair', type: GeneType.ACCESSORY, min: 0, max: 4, rawAttribute: "index",
    templates: [
      { name: 'hair_straight', index: 0, range: { min: 0, max: 1 } },
      { name: 'hair_wavy', index: 1, range: { min: 0, max: 1 } },
      { name: 'hair_curly', index: 2, range: { min: 0, max: 1 } },
      { name: 'hair_afro', index: 3, range: { min: 0, max: 1 } },
      { name: 'hair_straight_thin_beard', index: 4, range: { min: 0, max: 1 } }
    ]
  },
  { 
    id: 'gene_baldness', name: 'Baldness', group: 'hair', type: GeneType.ACCESSORY, min: 0, max: 1, rawAttribute: "index",
    templates: [
      { name: 'no_baldness', index: 0, range: { min: 0, max: 1 } },
      { name: 'male_pattern_baldness', index: 1, range: { min: 0, max: 1 } }
    ]
  },
];
