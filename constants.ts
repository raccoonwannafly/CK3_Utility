
import { Trait, TraitCategory, StoredCharacter } from './types';

export const APP_NAME = "CK3 Royal Utility";

export const HISTORICAL_CHARACTERS: StoredCharacter[] = [
  {
    id: 'steam_2836494138',
    name: 'Jeanne d\'Arc (Joan of Arc)',
    culture: 'French',
    religion: 'Catholic',
    race: 'European',
    traits: ['zealous', 'brave', 'chaste', 'peasant_leader', 'education_martial_4'],
    dna: 'ruler_designer_2836494138={ type=female id=0 genes={ hair_color={ 153 103 125 76 } skin_color={ 246 208 231 163 } eye_color={ 79 179 119 220 } gene_chin_forward={ "chin_forward_pos" 136 "chin_forward_pos" 136 } gene_chin_height={ "chin_height_pos" 127 "chin_height_pos" 127 } gene_chin_width={ "chin_width_neg" 119 "chin_width_neg" 119 } gene_eye_angle={ "eye_angle_neg" 118 "eye_angle_neg" 118 } gene_eye_depth={ "eye_depth_pos" 134 "eye_depth_pos" 134 } gene_eye_height={ "eye_height_neg" 116 "eye_height_neg" 116 } gene_eye_distance={ "eye_distance_neg" 122 "eye_distance_neg" 122 } gene_eye_shut={ "eye_shut_neg" 119 "eye_shut_neg" 119 } gene_forehead_angle={ "forehead_angle_neg" 112 "forehead_angle_neg" 112 } gene_forehead_brow_height={ "forehead_brow_height_neg" 105 "forehead_brow_height_neg" 105 } gene_forehead_roundness={ "forehead_roundness_pos" 146 "forehead_roundness_pos" 146 } gene_forehead_width={ "forehead_width_pos" 142 "forehead_width_pos" 142 } gene_forehead_height={ "forehead_height_neg" 98 "forehead_height_neg" 98 } gene_head_height={ "head_height_pos" 138 "head_height_pos" 138 } gene_head_width={ "head_width_neg" 115 "head_width_neg" 115 } gene_head_profile={ "head_profile_pos" 154 "head_profile_pos" 154 } gene_head_top_height={ "head_top_height_neg" 120 "head_top_height_neg" 120 } gene_head_top_width={ "head_top_width_pos" 134 "head_top_width_pos" 134 } gene_jaw_angle={ "jaw_angle_pos" 135 "jaw_angle_pos" 135 } gene_jaw_forward={ "jaw_forward_neg" 119 "jaw_forward_neg" 119 } gene_jaw_height={ "jaw_height_neg" 118 "jaw_height_neg" 118 } gene_jaw_width={ "jaw_width_neg" 110 "jaw_width_neg" 110 } gene_mouth_corner_depth={ "mouth_corner_depth_neg" 120 "mouth_corner_depth_neg" 120 } gene_mouth_corner_height={ "mouth_corner_height_neg" 115 "mouth_corner_height_neg" 115 } gene_mouth_forward={ "mouth_forward_neg" 121 "mouth_forward_neg" 121 } gene_mouth_height={ "mouth_height_neg" 119 "mouth_height_neg" 119 } gene_mouth_width={ "mouth_width_neg" 114 "mouth_width_neg" 114 } gene_mouth_upper_lip_size={ "mouth_upper_lip_size_pos" 143 "mouth_upper_lip_size_pos" 143 } gene_mouth_lower_lip_size={ "mouth_lower_lip_size_pos" 143 "mouth_lower_lip_size_pos" 143 } gene_mouth_open={ "mouth_open_neg" 68 "mouth_open_neg" 68 } gene_neck_length={ "neck_length_pos" 135 "neck_length_pos" 135 } gene_neck_width={ "neck_width_neg" 116 "neck_width_neg" 116 } gene_bs_cheek_forward={ "cheek_forward_neg" 15 "cheek_forward_neg" 15 } gene_bs_cheek_height={ "cheek_height_pos" 35 "cheek_height_pos" 35 } gene_bs_cheek_width={ "cheek_width_neg" 10 "cheek_width_neg" 10 } gene_bs_ear_angle={ "ear_angle_neg" 0 "ear_angle_neg" 0 } gene_bs_ear_inner_shape={ "ear_inner_shape_pos" 0 "ear_inner_shape_pos" 0 } gene_bs_ear_bend={ "ear_lower_bend_pos" 0 "ear_lower_bend_pos" 0 } gene_bs_ear_outward={ "ear_outward_pos" 0 "ear_outward_pos" 0 } gene_bs_ear_size={ "ear_size_neg" 0 "ear_size_neg" 0 } gene_bs_eye_corner_depth={ "eye_corner_depth_neg" 0 "eye_corner_depth_neg" 0 } gene_bs_eye_fold_shape={ "eye_fold_shape_neg" 0 "eye_fold_shape_neg" 0 } gene_bs_eye_size={ "eye_size_pos" 37 "eye_size_pos" 37 } gene_bs_eye_upper_lid_size={ "eye_upper_lid_size_neg" 17 "eye_upper_lid_size_neg" 17 } gene_bs_forehead_brow_curve={ "forehead_brow_curve_neg" 37 "forehead_brow_curve_neg" 37 } gene_bs_forehead_brow_forward={ "forehead_brow_forward_neg" 0 "forehead_brow_forward_neg" 0 } gene_bs_forehead_brow_inner_height={ "forehead_brow_inner_height_neg" 21 "forehead_brow_inner_height_neg" 21 } gene_bs_forehead_brow_outer_height={ "forehead_brow_outer_height_neg" 13 "forehead_brow_outer_height_neg" 13 } gene_bs_forehead_brow_width={ "forehead_brow_width_neg" 28 "forehead_brow_width_neg" 28 } gene_bs_jaw_def={ "jaw_def_pos" 29 "jaw_def_pos" 29 } gene_bs_mouth_lower_lip_def={ "mouth_lower_lip_def_pos" 56 "mouth_lower_lip_def_pos" 56 } gene_bs_mouth_lower_lip_full={ "mouth_lower_lip_full_neg" 12 "mouth_lower_lip_full_neg" 12 } gene_bs_mouth_lower_lip_pad={ "mouth_lower_lip_pad_neg" 0 "mouth_lower_lip_pad_neg" 0 } gene_bs_mouth_lower_lip_width={ "mouth_lower_lip_width_neg" 28 "mouth_lower_lip_width_neg" 28 } gene_bs_mouth_philtrum_def={ "mouth_philtrum_def_pos" 24 "mouth_philtrum_def_pos" 24 } gene_bs_mouth_philtrum_shape={ "mouth_philtrum_shape_pos" 22 "mouth_philtrum_shape_pos" 22 } gene_bs_mouth_philtrum_width={ "mouth_philtrum_width_neg" 33 "mouth_philtrum_width_neg" 33 } gene_bs_mouth_upper_lip_def={ "mouth_upper_lip_def_pos" 38 "mouth_upper_lip_def_pos" 38 } gene_bs_mouth_upper_lip_full={ "mouth_upper_lip_full_pos" 19 "mouth_upper_lip_full_pos" 19 } gene_bs_mouth_upper_lip_profile={ "mouth_upper_lip_profile_neg" 22 "mouth_upper_lip_profile_neg" 22 } gene_bs_mouth_upper_lip_width={ "mouth_upper_lip_width_neg" 30 "mouth_upper_lip_width_neg" 30 } gene_bs_nose_forward={ "nose_forward_neg" 19 "nose_forward_neg" 19 } gene_bs_nose_height={ "nose_height_neg" 20 "nose_height_neg" 20 } gene_bs_nose_length={ "nose_length_neg" 27 "nose_length_neg" 27 } gene_bs_nose_nostril_height={ "nose_nostril_height_pos" 20 "nose_nostril_height_pos" 20 } gene_bs_nose_nostril_width={ "nose_nostril_width_neg" 23 "nose_nostril_width_neg" 23 } gene_bs_nose_profile={ "nose_profile_hawk_pos" 15 "nose_profile_hawk_pos" 15 } gene_bs_nose_ridge_angle={ "nose_ridge_angle_pos" 18 "nose_ridge_angle_pos" 18 } gene_bs_nose_ridge_width={ "nose_ridge_width_neg" 23 "nose_ridge_width_neg" 23 } gene_bs_nose_size={ "nose_size_neg" 24 "nose_size_neg" 24 } gene_bs_nose_tip_angle={ "nose_tip_angle_pos" 20 "nose_tip_angle_pos" 20 } gene_bs_nose_tip_forward={ "nose_tip_forward_pos" 16 "nose_tip_forward_pos" 16 } gene_bs_nose_tip_width={ "nose_tip_width_neg" 24 "nose_tip_width_neg" 24 } face_detail_cheek_def={ "cheek_def_02" 15 "cheek_def_02" 15 } face_detail_cheek_fat={ "cheek_fat_01_pos" 0 "cheek_fat_01_pos" 0 } face_detail_chin_cleft={ "chin_dimple" 10 "chin_dimple" 10 } face_detail_chin_def={ "chin_def" 20 "chin_def" 20 } face_detail_eye_lower_lid_def={ "eye_lower_lid_def" 0 "eye_lower_lid_def" 0 } face_detail_eye_socket={ "eye_socket_03" 230 "eye_socket_03" 230 } face_detail_nasolabial={ "nasolabial_02" 15 "nasolabial_02" 15 } face_detail_nose_ridge_def={ "nose_ridge_def_pos" 0 "nose_ridge_def_pos" 0 } face_detail_nose_tip_def={ "nose_tip_def" 0 "nose_tip_def" 0 } face_detail_temple_def={ "temple_def" 10 "temple_def" 10 } expression_brow_wrinkles={ "brow_wrinkles_01" 0 "brow_wrinkles_01" 0 } expression_eye_wrinkles={ "eye_wrinkles_01" 0 "eye_wrinkles_01" 0 } expression_forehead_wrinkles={ "forehead_wrinkles_01" 0 "forehead_wrinkles_01" 0 } expression_other={ "cheek_wrinkles_both_01" 0 "cheek_wrinkles_both_01" 0 } complexion={ "complexion_beauty_1" 255 "complexion_beauty_1" 255 } gene_height={ "normal_height" 130 "normal_height" 130 } gene_bs_body_type={ "body_average" 0 "body_average" 0 } gene_bs_body_shape={ "body_shape_average" 0 "body_shape_average" 0 } gene_bs_bust={ "bust_default" 148 "bust_default" 148 } gene_age={ "no_aging" 20 "no_aging" 20 } gene_eyebrows_shape={ "avg_spacing_avg_thickness" 255 "avg_spacing_avg_thickness" 255 } gene_eyebrows_fullness={ "layer_2_avg_thickness" 255 "layer_2_avg_thickness" 255 } gene_body_hair={ "body_hair_sparse" 0 "body_hair_sparse" 0 } gene_hair_type={ "hair_straight" 178 "hair_straight" 178 } gene_baldness={ "no_baldness" 127 "no_baldness" 127 } eye_accessory={ "normal_eyes" 93 "normal_eyes" 93 } teeth_accessory={ "normal_teeth" 0 "normal_teeth" 0 } eyelashes_accessory={ "normal_eyelashes" 185 "normal_eyelashes" 185 } hairstyles={ "western_hairstyles_straight" 244 "western_hairstyles_straight" 244 } beards={ "no_beard" 0 "no_beard" 0 } } }',
    images: ['https://steamuserimages-a.akamaihd.net/ugc/1850428586940866031/E15B518770F3A229F8181A02E723D47596B11F36/'],
    bio: "The Maid of Orléans. A manually imported preset approximating the popular Steam Workshop character. A symbol of French resistance and divine inspiration.",
    tags: ['Steam Import', 'Historical', 'Custom'],
    createdAt: '2023-01-01',
    dynastyMotto: 'De par le Roi du Ciel',
    goal: 'Drive the English from France',
    category: 'historical'
  },
  {
    id: 'hist_william',
    name: 'William the Conqueror',
    culture: 'Norman',
    religion: 'Catholic',
    race: 'Frankish',
    traits: ['ambitious', 'diligent', 'brave', 'brilliant_strategist', 'education_martial_4'],
    dna: '', 
    images: ['https://i.imgur.com/kH1yqXl.jpeg'], 
    bio: 'The Duke of Normandy who launched the Norman conquest of England in 1066. A man of immense ambition and military prowess.',
    tags: ['1066', 'Recommended'],
    createdAt: '1066-01-01',
    dynastyMotto: 'Dieu et mon droit',
    goal: 'Conquer the Kingdom of England',
    category: 'historical'
  },
  {
    id: 'hist_matilda',
    name: 'Matilda of Tuscany',
    culture: 'Italian',
    religion: 'Catholic',
    race: 'Italian',
    traits: ['zealous', 'intellect_good_3', 'diplomat', 'scholar', 'education_diplomacy_4'], 
    dna: '',
    images: ['https://i.imgur.com/7bQ6m8R.jpeg'], 
    bio: 'The "Great Countess", a powerful feudal ruler in northern Italy and the chief Italian supporter of Pope Gregory VII during the Investiture Controversy.',
    tags: ['1066', 'Recommended'],
    createdAt: '1066-01-01',
    dynastyMotto: 'For Faith and Domain',
    goal: 'Protect the Papacy',
    category: 'historical'
  },
  {
    id: 'hist_bjorn',
    name: 'Björn Ironside',
    culture: 'Norse',
    religion: 'Asatru',
    race: 'North Germanic',
    traits: ['brave', 'wrathful', 'viking', 'brilliant_strategist', 'education_martial_4'],
    dna: '',
    images: ['https://i.imgur.com/9S5yX0A.jpeg'],
    bio: 'A legendary king of Sweden who founded the Munsö dynasty. Famous for his raids into France and the Mediterranean.',
    tags: ['867', 'Ragnarrson'],
    createdAt: '0867-01-01',
    dynastyMotto: 'Iron and Blood',
    goal: 'Form the Kingdom of Sweden',
    category: 'historical'
  },
  {
    id: 'hist_haesteinn',
    name: 'Jarl Haesteinn',
    culture: 'Norse',
    religion: 'Asatru',
    race: 'North Germanic',
    traits: ['ambitious', 'quick', 'adventurer', 'whole_of_body', 'education_martial_4'],
    dna: '',
    images: ['https://i.imgur.com/L4j5j1z.jpeg'],
    bio: 'A Viking chieftain infamous for his raids in the Mediterranean. Currently holds the County of Montaigu and seeks a new kingdom.',
    tags: ['867', 'Sandbox'],
    createdAt: '0867-01-01',
    dynastyMotto: 'To the Ends of the Earth',
    goal: 'Carve out a Realm anywhere',
    category: 'historical'
  }
];

export const TRAITS: Trait[] = [
  // ... (rest of the file remains identical)
  // --- EDUCATION (Diplomacy) ---
  { id: 'education_diplomacy_1', name: 'Naive Appeaser', cost: 0, category: TraitCategory.EDUCATION, description: '+2 Diplomacy', opposites: ['education_diplomacy_2', 'education_diplomacy_3', 'education_diplomacy_4'] },
  { id: 'education_diplomacy_2', name: 'Adequate Bargainer', cost: 40, category: TraitCategory.EDUCATION, description: '+4 Diplomacy', opposites: ['education_diplomacy_1', 'education_diplomacy_3', 'education_diplomacy_4'] },
  { id: 'education_diplomacy_3', name: 'Charismatic Negotiator', cost: 80, category: TraitCategory.EDUCATION, description: '+6 Diplomacy', opposites: ['education_diplomacy_1', 'education_diplomacy_2', 'education_diplomacy_4'] },
  { id: 'education_diplomacy_4', name: 'Grey Eminence', cost: 160, category: TraitCategory.EDUCATION, description: '+8 Diplomacy, +40% Prestige', opposites: ['education_diplomacy_1', 'education_diplomacy_2', 'education_diplomacy_3'] },
  // ... (Include all other TRAITS here to preserve file integrity)
  // --- EDUCATION (Martial) ---
  { id: 'education_martial_1', name: 'Misguided Warrior', cost: 0, category: TraitCategory.EDUCATION, description: '+2 Martial', opposites: ['education_martial_2', 'education_martial_3', 'education_martial_4'] },
  { id: 'education_martial_2', name: 'Tough Soldier', cost: 40, category: TraitCategory.EDUCATION, description: '+4 Martial', opposites: ['education_martial_1', 'education_martial_3', 'education_martial_4'] },
  { id: 'education_martial_3', name: 'Skilled Tactician', cost: 80, category: TraitCategory.EDUCATION, description: '+6 Martial', opposites: ['education_martial_1', 'education_martial_2', 'education_martial_4'] },
  { id: 'education_martial_4', name: 'Brilliant Strategist', cost: 160, category: TraitCategory.EDUCATION, description: '+8 Martial, +40% Levy Size', opposites: ['education_martial_1', 'education_martial_2', 'education_martial_3'] },

  // --- EDUCATION (Stewardship) ---
  { id: 'education_stewardship_1', name: 'Indulgent Wastrel', cost: 0, category: TraitCategory.EDUCATION, description: '+2 Stewardship', opposites: ['education_stewardship_2', 'education_stewardship_3', 'education_stewardship_4'] },
  { id: 'education_stewardship_2', name: 'Thrifty Clerk', cost: 40, category: TraitCategory.EDUCATION, description: '+4 Stewardship', opposites: ['education_stewardship_1', 'education_stewardship_3', 'education_stewardship_4'] },
  { id: 'education_stewardship_3', name: 'Fortune Builder', cost: 80, category: TraitCategory.EDUCATION, description: '+6 Stewardship', opposites: ['education_stewardship_1', 'education_stewardship_2', 'education_stewardship_4'] },
  { id: 'education_stewardship_4', name: 'Midas Touched', cost: 160, category: TraitCategory.EDUCATION, description: '+8 Stewardship, +40% Monthly Income', opposites: ['education_stewardship_1', 'education_stewardship_2', 'education_stewardship_3'] },

  // --- EDUCATION (Intrigue) ---
  { id: 'education_intrigue_1', name: 'Amateurish Plotter', cost: 0, category: TraitCategory.EDUCATION, description: '+2 Intrigue', opposites: ['education_intrigue_2', 'education_intrigue_3', 'education_intrigue_4'] },
  { id: 'education_intrigue_2', name: 'Flamboyant Trickster', cost: 40, category: TraitCategory.EDUCATION, description: '+4 Intrigue', opposites: ['education_intrigue_1', 'education_intrigue_3', 'education_intrigue_4'] },
  { id: 'education_intrigue_3', name: 'Intricate Webweaver', cost: 80, category: TraitCategory.EDUCATION, description: '+6 Intrigue', opposites: ['education_intrigue_1', 'education_intrigue_2', 'education_intrigue_4'] },
  { id: 'education_intrigue_4', name: 'Elusive Shadow', cost: 160, category: TraitCategory.EDUCATION, description: '+8 Intrigue, +40% Scheme Power', opposites: ['education_intrigue_1', 'education_intrigue_2', 'education_intrigue_3'] },

  // --- EDUCATION (Learning) ---
  { id: 'education_learning_1', name: 'Conscientious Scribe', cost: 0, category: TraitCategory.EDUCATION, description: '+2 Learning', opposites: ['education_learning_2', 'education_learning_3', 'education_learning_4'] },
  { id: 'education_learning_2', name: 'Insightful Thinker', cost: 40, category: TraitCategory.EDUCATION, description: '+4 Learning', opposites: ['education_learning_1', 'education_learning_3', 'education_learning_4'] },
  { id: 'education_learning_3', name: 'Astute Intellectual', cost: 80, category: TraitCategory.EDUCATION, description: '+6 Learning', opposites: ['education_learning_1', 'education_learning_2', 'education_learning_4'] },
  { id: 'education_learning_4', name: 'Mastermind Philosopher', cost: 160, category: TraitCategory.EDUCATION, description: '+8 Learning, +40% Piety', opposites: ['education_learning_1', 'education_learning_2', 'education_learning_3'] },
  
  // --- EDUCATION (Prowess) ---
  { id: 'prowess_education_1', name: 'Bumbling Squire', cost: 0, category: TraitCategory.EDUCATION, description: '+1 Prowess', opposites: ['prowess_education_2', 'prowess_education_3', 'prowess_education_4'] },
  { id: 'prowess_education_2', name: 'Confident Knight', cost: 40, category: TraitCategory.EDUCATION, description: '+2 Prowess', opposites: ['prowess_education_1', 'prowess_education_3', 'prowess_education_4'] },
  { id: 'prowess_education_3', name: 'Formidable Banneret', cost: 80, category: TraitCategory.EDUCATION, description: '+3 Prowess', opposites: ['prowess_education_1', 'prowess_education_2', 'prowess_education_4'] },
  { id: 'prowess_education_4', name: 'Famous Champion', cost: 160, category: TraitCategory.EDUCATION, description: '+4 Prowess, +Prestige', opposites: ['prowess_education_1', 'prowess_education_2', 'prowess_education_3'] },

  // --- PERSONALITY ---
  { id: 'ambitious', name: 'Ambitious', cost: 40, category: TraitCategory.PERSONALITY, description: '+2 All Stats, +25% Stress Gain', opposites: ['content'] },
  { id: 'content', name: 'Content', cost: 20, category: TraitCategory.PERSONALITY, description: '+2 Learning, +1 Stewardship, -10% Stress', opposites: ['ambitious'] },
  { id: 'arrogant', name: 'Arrogant', cost: 10, category: TraitCategory.PERSONALITY, description: '+1 Prestige/m, -5 Opinion', opposites: ['humble'] },
  { id: 'humble', name: 'Humble', cost: 20, category: TraitCategory.PERSONALITY, description: '+0.5 Piety/m, +10 Opinion', opposites: ['arrogant'] },
  { id: 'brave', name: 'Brave', cost: 40, category: TraitCategory.PERSONALITY, description: '+2 Martial, +3 Prowess, +10 Attraction', opposites: ['craven'] },
  { id: 'craven', name: 'Craven', cost: -20, category: TraitCategory.PERSONALITY, description: '-2 Martial, -3 Prowess, -5 Attraction', opposites: ['brave'] },
  { id: 'calm', name: 'Calm', cost: 20, category: TraitCategory.PERSONALITY, description: '+1 Diplomacy, +1 Intrigue, +10 Stress Loss', opposites: ['wrathful'] },
  { id: 'wrathful', name: 'Wrathful', cost: 20, category: TraitCategory.PERSONALITY, description: '+2 Martial, -1 Diplomacy, +20 Dread Gain', opposites: ['calm'] },
  { id: 'chaste', name: 'Chaste', cost: 20, category: TraitCategory.PERSONALITY, description: '+2 Learning, -25% Fertility', opposites: ['lustful'] },
  { id: 'lustful', name: 'Lustful', cost: 25, category: TraitCategory.PERSONALITY, description: '+2 Intrigue, +25% Fertility', opposites: ['chaste'] },
  { id: 'compassionate', name: 'Compassionate', cost: 15, category: TraitCategory.PERSONALITY, description: '+2 Diplomacy, -2 Intrigue', opposites: ['callous', 'sadistic'] },
  { id: 'callous', name: 'Callous', cost: 35, category: TraitCategory.PERSONALITY, description: '+2 Intrigue, -2 Diplomacy, +25% Dread', opposites: ['compassionate'] },
  { id: 'sadistic', name: 'Sadistic', cost: 45, category: TraitCategory.PERSONALITY, description: '+2 Intrigue, +3 Prowess, +35 Dread', opposites: ['compassionate'] },
  { id: 'cynical', name: 'Cynical', cost: 20, category: TraitCategory.PERSONALITY, description: '+2 Intrigue, +2 Learning', opposites: ['zealous'] },
  { id: 'zealous', name: 'Zealous', cost: 30, category: TraitCategory.PERSONALITY, description: '+2 Martial, +20% Piety', opposites: ['cynical'] },
  { id: 'deceitful', name: 'Deceitful', cost: 20, category: TraitCategory.PERSONALITY, description: '+4 Intrigue, -2 Diplomacy', opposites: ['honest'] },
  { id: 'honest', name: 'Honest', cost: 20, category: TraitCategory.PERSONALITY, description: '+2 Diplomacy, -4 Intrigue', opposites: ['deceitful'] },
  { id: 'diligent', name: 'Diligent', cost: 60, category: TraitCategory.PERSONALITY, description: '+2 All Stats, +20% Stress Gain', opposites: ['lazy'] },
  { id: 'lazy', name: 'Lazy', cost: -20, category: TraitCategory.PERSONALITY, description: '-1 All Stats, -15% Stress Gain', opposites: ['diligent'] },
  { id: 'fickle', name: 'Fickle', cost: 20, category: TraitCategory.PERSONALITY, description: '+1 Diplomacy, +1 Intrigue, -1 Stewardship', opposites: ['stubborn'] },
  { id: 'stubborn', name: 'Stubborn', cost: 20, category: TraitCategory.PERSONALITY, description: '+3 Stewardship, -3 Diplomacy', opposites: ['fickle'] },
  { id: 'forgiving', name: 'Forgiving', cost: 15, category: TraitCategory.PERSONALITY, description: '+2 Diplomacy, -2 Intrigue', opposites: ['vengeful'] },
  { id: 'vengeful', name: 'Vengeful', cost: 35, category: TraitCategory.PERSONALITY, description: '+2 Intrigue, +2 Prowess', opposites: ['forgiving'] },
  { id: 'generous', name: 'Generous', cost: 15, category: TraitCategory.PERSONALITY, description: '+3 Diplomacy, -10% Income', opposites: ['greedy'] },
  { id: 'greedy', name: 'Greedy', cost: 40, category: TraitCategory.PERSONALITY, description: '+15% Income, -2 Diplomacy', opposites: ['generous'] },
  { id: 'gregarious', name: 'Gregarious', cost: 30, category: TraitCategory.PERSONALITY, description: '+2 Diplomacy, +5 Attraction', opposites: ['shy'] },
  { id: 'shy', name: 'Shy', cost: -20, category: TraitCategory.PERSONALITY, description: '-2 Diplomacy, -5 Attraction, Less Personal Scheme Power', opposites: ['gregarious'] },
  { id: 'gluttonous', name: 'Gluttonous', cost: -10, category: TraitCategory.PERSONALITY, description: '-2 Stewardship, -10 Attraction', opposites: ['temperate'] },
  { id: 'temperate', name: 'Temperate', cost: 40, category: TraitCategory.PERSONALITY, description: '+2 Stewardship, +Small Health Boost', opposites: ['gluttonous'] },
  { id: 'impatient', name: 'Impatient', cost: 15, category: TraitCategory.PERSONALITY, description: '+20% Scheme Speed, -1 Learning', opposites: ['patient'] },
  { id: 'patient', name: 'Patient', cost: 35, category: TraitCategory.PERSONALITY, description: '+2 Learning, +10 Hostile Scheme Resistance', opposites: ['impatient'] },
  { id: 'just', name: 'Just', cost: 40, category: TraitCategory.PERSONALITY, description: '+2 Stewardship, +1 Learning', opposites: ['arbitrary'] },
  { id: 'arbitrary', name: 'Arbitrary', cost: 10, category: TraitCategory.PERSONALITY, description: '+3 Intrigue, -2 Stewardship', opposites: ['just'] },
  { id: 'paranoid', name: 'Paranoid', cost: 10, category: TraitCategory.PERSONALITY, description: '+3 Intrigue, -1 Diplomacy, +100% Stress Gain', opposites: ['trusting'] },
  { id: 'trusting', name: 'Trusting', cost: 10, category: TraitCategory.PERSONALITY, description: '+2 Diplomacy, -2 Intrigue', opposites: ['paranoid'] },

  // --- CONGENITAL ---
  // Intelligence
  { id: 'intellect_good_3', name: 'Genius', cost: 240, category: TraitCategory.CONGENITAL, description: '+5 All Stats, +30% Lifestyle XP', opposites: ['intellect_good_1', 'intellect_good_2', 'intellect_bad_1', 'intellect_bad_2', 'intellect_bad_3'] },
  { id: 'intellect_good_2', name: 'Intelligent', cost: 160, category: TraitCategory.CONGENITAL, description: '+3 All Stats, +20% Lifestyle XP', opposites: ['intellect_good_1', 'intellect_good_3', 'intellect_bad_1', 'intellect_bad_2', 'intellect_bad_3'] },
  { id: 'intellect_good_1', name: 'Quick', cost: 80, category: TraitCategory.CONGENITAL, description: '+1 All Stats, +10% Lifestyle XP', opposites: ['intellect_good_2', 'intellect_good_3', 'intellect_bad_1', 'intellect_bad_2', 'intellect_bad_3'] },
  { id: 'intellect_bad_1', name: 'Slow', cost: -40, category: TraitCategory.CONGENITAL, description: '-2 All Stats', opposites: ['intellect_good_1', 'intellect_good_2', 'intellect_good_3', 'intellect_bad_2', 'intellect_bad_3'] },
  { id: 'intellect_bad_2', name: 'Stupid', cost: -80, category: TraitCategory.CONGENITAL, description: '-4 All Stats', opposites: ['intellect_good_1', 'intellect_good_2', 'intellect_good_3', 'intellect_bad_1', 'intellect_bad_3'] },
  { id: 'intellect_bad_3', name: 'Imbecile', cost: -120, category: TraitCategory.CONGENITAL, description: '-8 All Stats', opposites: ['intellect_good_1', 'intellect_good_2', 'intellect_good_3', 'intellect_bad_1', 'intellect_bad_2'] },
  
  // Physique
  { id: 'physique_good_3', name: 'Herculean / Amazonian', cost: 180, category: TraitCategory.CONGENITAL, description: '+8 Prowess, +1.0 Health', opposites: ['physique_good_1', 'physique_good_2', 'physique_bad_1', 'physique_bad_2', 'physique_bad_3'] },
  { id: 'physique_good_2', name: 'Robust', cost: 120, category: TraitCategory.CONGENITAL, description: '+4 Prowess, +0.5 Health', opposites: ['physique_good_1', 'physique_good_3', 'physique_bad_1', 'physique_bad_2', 'physique_bad_3'] },
  { id: 'physique_good_1', name: 'Hale', cost: 60, category: TraitCategory.CONGENITAL, description: '+2 Prowess, +0.25 Health', opposites: ['physique_good_2', 'physique_good_3', 'physique_bad_1', 'physique_bad_2', 'physique_bad_3'] },
  { id: 'physique_bad_1', name: 'Delicate', cost: -40, category: TraitCategory.CONGENITAL, description: '-2 Prowess, -0.25 Health', opposites: ['physique_good_1', 'physique_good_2', 'physique_good_3', 'physique_bad_2', 'physique_bad_3'] },
  { id: 'physique_bad_2', name: 'Frail', cost: -80, category: TraitCategory.CONGENITAL, description: '-4 Prowess, -0.5 Health', opposites: ['physique_good_1', 'physique_good_2', 'physique_good_3', 'physique_bad_1', 'physique_bad_3'] },
  { id: 'physique_bad_3', name: 'Feeble', cost: -120, category: TraitCategory.CONGENITAL, description: '-8 Prowess, -1.0 Health', opposites: ['physique_good_1', 'physique_good_2', 'physique_good_3', 'physique_bad_1', 'physique_bad_2'] },

  // Beauty
  { id: 'beauty_good_3', name: 'Beautiful', cost: 120, category: TraitCategory.CONGENITAL, description: '+3 Diplomacy, +30 Attraction, +20% Fertility', opposites: ['beauty_good_1', 'beauty_good_2', 'beauty_bad_1', 'beauty_bad_2', 'beauty_bad_3'] },
  { id: 'beauty_good_2', name: 'Handsome / Pretty', cost: 80, category: TraitCategory.CONGENITAL, description: '+2 Diplomacy, +20 Attraction, +10% Fertility', opposites: ['beauty_good_1', 'beauty_good_3', 'beauty_bad_1', 'beauty_bad_2', 'beauty_bad_3'] },
  { id: 'beauty_good_1', name: 'Comely', cost: 40, category: TraitCategory.CONGENITAL, description: '+1 Diplomacy, +10 Attraction, +5% Fertility', opposites: ['beauty_good_2', 'beauty_good_3', 'beauty_bad_1', 'beauty_bad_2', 'beauty_bad_3'] },
  { id: 'beauty_bad_1', name: 'Homely', cost: -40, category: TraitCategory.CONGENITAL, description: '-1 Diplomacy, -10 Attraction', opposites: ['beauty_good_1', 'beauty_good_2', 'beauty_good_3', 'beauty_bad_2', 'beauty_bad_3'] },
  { id: 'beauty_bad_2', name: 'Ugly', cost: -80, category: TraitCategory.CONGENITAL, description: '-2 Diplomacy, -20 Attraction', opposites: ['beauty_good_1', 'beauty_good_2', 'beauty_good_3', 'beauty_bad_1', 'beauty_bad_3'] },
  { id: 'beauty_bad_3', name: 'Hideous', cost: -120, category: TraitCategory.CONGENITAL, description: '-3 Diplomacy, -30 Attraction', opposites: ['beauty_good_1', 'beauty_good_2', 'beauty_good_3', 'beauty_bad_1', 'beauty_bad_2'] },

  // Special Congenital
  { id: 'pure_blooded', name: 'Pure-Blooded', cost: 500, category: TraitCategory.CONGENITAL, description: '+0.25 Health, +10% Fertility, Reduced Inbreeding Chance' },
  { id: 'fecund', name: 'Fecund', cost: 140, category: TraitCategory.CONGENITAL, description: '+50% Fertility, +5 Years Life Expectancy' },
  { id: 'albino', name: 'Albino', cost: 60, category: TraitCategory.CONGENITAL, description: '+15 Natural Dread, -10 General Opinion' },
  { id: 'giant', name: 'Giant', cost: 40, category: TraitCategory.CONGENITAL, description: '+6 Prowess, -5% Health, +20 Dread' },
  { id: 'dwarf', name: 'Dwarf', cost: -40, category: TraitCategory.CONGENITAL, description: '-4 Prowess, +20 Same Opinion' },
  { id: 'scaly', name: 'Scaly', cost: -60, category: TraitCategory.CONGENITAL, description: '-10 Attraction, +10 Dread' },
  { id: 'clubfooted', name: 'Clubfooted', cost: -20, category: TraitCategory.CONGENITAL, description: '-2 Prowess, -5 Attraction' },
  { id: 'hunchbacked', name: 'Hunchbacked', cost: -30, category: TraitCategory.CONGENITAL, description: '-10 Prowess, -30 Attraction' },
  { id: 'lisping', name: 'Lisping', cost: -10, category: TraitCategory.CONGENITAL, description: '-2 Diplomacy, -5 Attraction' },
  { id: 'stuttering', name: 'Stuttering', cost: -10, category: TraitCategory.CONGENITAL, description: '-2 Diplomacy' },
  { id: 'inbred', name: 'Inbred', cost: -100, category: TraitCategory.CONGENITAL, description: '-5 All Stats, -50% Fertility, -1.5 Health' },
  { id: 'bleeder', name: 'Bleeder', cost: -80, category: TraitCategory.CONGENITAL, description: '-1.5 Health' },
  { id: 'wheezing', name: 'Wheezing', cost: -60, category: TraitCategory.CONGENITAL, description: '-0.75 Health' },
  { id: 'spindly', name: 'Spindly', cost: -40, category: TraitCategory.CONGENITAL, description: '-0.5 Health' },

  // --- LIFESTYLE (Final Perks) ---
  { id: 'diplomat', name: 'Diplomat', cost: 50, category: TraitCategory.LIFESTYLE, description: '+3 Diplomacy, +20 Independent Ruler Opinion' },
  { id: 'august', name: 'August', cost: 50, category: TraitCategory.LIFESTYLE, description: '+2 Diplomacy, +1 Martial, +1 Prestige/m' },
  { id: 'family_first', name: 'Patriarch / Matriarch', cost: 50, category: TraitCategory.LIFESTYLE, description: '+2 Diplomacy, +15 House Opinion, +20% Fertility' },
  
  { id: 'strategist', name: 'Strategist', cost: 50, category: TraitCategory.LIFESTYLE, description: '+1 Martial, +1 Diplomacy, +Enemy Fatalities' },
  { id: 'overseer', name: 'Overseer', cost: 50, category: TraitCategory.LIFESTYLE, description: '+2 Martial, +2 Stewardship, +Control Growth' },
  { id: 'gallant', name: 'Gallant', cost: 50, category: TraitCategory.LIFESTYLE, description: '+2 Martial, +4 Prowess, +20 Attraction' },
  
  { id: 'architect', name: 'Architect', cost: 50, category: TraitCategory.LIFESTYLE, description: '+2 Stewardship, -15% Build Time/Cost' },
  { id: 'administrator', name: 'Administrator', cost: 50, category: TraitCategory.LIFESTYLE, description: '+1 Stewardship, +1 Diplomacy, +Vassal Opinion' },
  { id: 'avaricious', name: 'Avaricious', cost: 50, category: TraitCategory.LIFESTYLE, description: '+2 Stewardship, +15% Holding Taxes' },
  
  { id: 'schemer', name: 'Schemer', cost: 50, category: TraitCategory.LIFESTYLE, description: '+5 Intrigue, +25% Scheme Power' },
  { id: 'seducer', name: 'Seducer', cost: 50, category: TraitCategory.LIFESTYLE, description: '+3 Intrigue, +40 Attraction, +20% Fertility' },
  { id: 'torturer', name: 'Torturer', cost: 50, category: TraitCategory.LIFESTYLE, description: '+3 Intrigue, +4 Prowess, +50% Dread Gain' },
  
  { id: 'whole_of_body', name: 'Whole of Body', cost: 80, category: TraitCategory.LIFESTYLE, description: '+0.5 Health, +25% Stress Loss, +50% Fertility' },
  { id: 'scholar', name: 'Scholar', cost: 50, category: TraitCategory.LIFESTYLE, description: '+5 Learning, +15 Hostile Scheme Success, +15 Resistance' },
  { id: 'theologian', name: 'Theologian', cost: 50, category: TraitCategory.LIFESTYLE, description: '+3 Learning, +20% Piety' },

  // --- COMMANDER ---
  { id: 'aggressive_attacker', name: 'Aggressive Attacker', cost: 60, category: TraitCategory.COMMANDER, description: '+25% Enemy Fatalities' },
  { id: 'unyielding_defender', name: 'Unyielding Defender', cost: 60, category: TraitCategory.COMMANDER, description: '-25% Friendly Fatalities' },
  { id: 'logistician', name: 'Logistician', cost: 40, category: TraitCategory.COMMANDER, description: '+Supply Limit Duration' },
  { id: 'military_engineer', name: 'Military Engineer', cost: 40, category: TraitCategory.COMMANDER, description: '-30% Siege Duration' },
  { id: 'flexible_leader', name: 'Flexible Leader', cost: 40, category: TraitCategory.COMMANDER, description: '-50% Enemy Defensive Advantage' },
  { id: 'reaver', name: 'Reaver', cost: 40, category: TraitCategory.COMMANDER, description: '+100% Raid Speed, -75% Attrition' },
  { id: 'holy_warrior', name: 'Holy Warrior', cost: 60, category: TraitCategory.COMMANDER, description: '+10 Advantage vs Hostile Faiths, +20% Piety from Battles' },
  { id: 'organizer', name: 'Organizer', cost: 40, category: TraitCategory.COMMANDER, description: '+25% Movement Speed' },
  
  // --- PHYSICAL & HEALTH ---
  { id: 'strong', name: 'Strong', cost: 80, category: TraitCategory.PHYSICAL, description: '+4 Prowess, +0.25 Health' },
  { id: 'shrewd', name: 'Shrewd', cost: 60, category: TraitCategory.PHYSICAL, description: '+2 All Stats' },
  { id: 'scarred', name: 'Scarred', cost: 20, category: TraitCategory.PHYSICAL, description: '+0.1 Prestige, +5 Attraction' },
  { id: 'one_eyed', name: 'One-Eyed', cost: -30, category: TraitCategory.PHYSICAL, description: '-2 Prowess, +1 Dread, -10 Attraction' },
  { id: 'one_legged', name: 'One-Legged', cost: -40, category: TraitCategory.PHYSICAL, description: '-4 Prowess, -10 Attraction' },
  { id: 'disfigured', name: 'Disfigured', cost: -60, category: TraitCategory.PHYSICAL, description: '-4 Diplomacy, -20 Attraction' },
  { id: 'maimed', name: 'Maimed', cost: -100, category: TraitCategory.PHYSICAL, description: '-6 Prowess, -2 Health' },
  { id: 'wonded_1', name: 'Wounded', cost: -20, category: TraitCategory.PHYSICAL, description: '-1 Prowess, -0.25 Health' },
  
  // --- INFAMOUS / OTHER ---
  { id: 'kinslayer_1', name: 'Familial Kinslayer', cost: -20, category: TraitCategory.INFAMOUS, description: '-5 Dynasty Opinion' },
  { id: 'kinslayer_2', name: 'Dynastic Kinslayer', cost: -40, category: TraitCategory.INFAMOUS, description: '-10 Dynasty Opinion' },
  { id: 'kinslayer_3', name: 'Kinslayer', cost: -60, category: TraitCategory.INFAMOUS, description: '-15 Dynasty Opinion' },
  { id: 'deviant', name: 'Deviant', cost: 20, category: TraitCategory.INFAMOUS, description: '+25% Stress Loss, Crime (General)' },
  { id: 'cannibal', name: 'Cannibal', cost: 20, category: TraitCategory.INFAMOUS, description: '+2 Prowess, +15% Stress Loss, +20 Dread' },
  { id: 'sodomite', name: 'Sodomite', cost: -20, category: TraitCategory.INFAMOUS, description: 'Same-Sex Relations' },
  { id: 'adulterer', name: 'Adulterer', cost: -20, category: TraitCategory.INFAMOUS, description: '-10 General Opinion' },
  { id: 'fornicator', name: 'Fornicator', cost: -10, category: TraitCategory.INFAMOUS, description: '-5 General Opinion' },
  { id: 'murderer', name: 'Murderer', cost: -20, category: TraitCategory.INFAMOUS, description: '-15 General Opinion' },
  { id: 'excommunicated', name: 'Excommunicated', cost: -50, category: TraitCategory.INFAMOUS, description: '-50 General Opinion (Same Faith)' },
  
  // --- COPING ---
  { id: 'drunkard', name: 'Drunkard', cost: -20, category: TraitCategory.COPING, description: '-2 Stewardship, -2 Prowess, +20% Stress Loss' },
  { id: 'hashishiyah', name: 'Hashishiyah', cost: -20, category: TraitCategory.COPING, description: '-2 Stewardship, +20% Stress Loss, +1 Learning' },
  { id: 'flagellant', name: 'Flagellant', cost: -20, category: TraitCategory.COPING, description: '-1 Prowess, +20% Stress Loss, -0.15 Health' },
  { id: 'comfort_eater', name: 'Comfort Eater', cost: -20, category: TraitCategory.COPING, description: '+20% Stress Loss, -10 Attraction' },
  { id: 'inappetetic', name: 'Inappetetic', cost: -20, category: TraitCategory.COPING, description: '+20% Stress Loss, -1 Diplomacy' },
  { id: 'rakish', name: 'Rakish', cost: -20, category: TraitCategory.COPING, description: '+20% Stress Loss, -1 Diplomacy' },
  { id: 'reclusive', name: 'Reclusive', cost: -20, category: TraitCategory.COPING, description: '+20% Stress Loss, -2 Diplomacy' },
  { id: 'contrite', name: 'Contrite', cost: -10, category: TraitCategory.COPING, description: '+20% Stress Loss, -1 Intrigue' },
  { id: 'improvident', name: 'Improvident', cost: -20, category: TraitCategory.COPING, description: '+20% Stress Loss, -15% Income' },
  
  // --- OTHER ---
  { id: 'viking', name: 'Viking / Raider', cost: 60, category: TraitCategory.OTHER, description: '+2 Martial, +0.3 Prestige/m' },
  { id: 'varangian', name: 'Varangian', cost: 40, category: TraitCategory.OTHER, description: '+1 Martial, +2 Prowess, +2 Diplomacy' },
  { id: 'berserker', name: 'Berserker', cost: 80, category: TraitCategory.OTHER, description: '+2 Martial, +5 Prowess' },
  { id: 'adventurer', name: 'Adventurer', cost: 50, category: TraitCategory.OTHER, description: '+1 Martial, +1 Prowess, +1 Diplomacy' },
  { id: 'pilgrim', name: 'Pilgrim', cost: 30, category: TraitCategory.OTHER, description: '+10% Piety, +5 Same Faith Opinion' },
  { id: 'crusader_king', name: 'Crusader', cost: 50, category: TraitCategory.OTHER, description: '+2 Martial, +15 Clergy Opinion' },
  { id: 'sayyid', name: 'Sayyid', cost: 60, category: TraitCategory.OTHER, description: '+5 Same Faith Opinion' },
  { id: 'born_in_the_purple', name: 'Born in the Purple', cost: 60, category: TraitCategory.OTHER, description: '+0.5 Prestige/m, +5 Vassal Opinion' },
  { id: 'augustus', name: 'Augustus', cost: 60, category: TraitCategory.OTHER, description: '+0.5 Prestige/m, +10 Vassal Opinion' },
  { id: 'witch', name: 'Witch', cost: 60, category: TraitCategory.OTHER, description: '+1 Intrigue, +1 Learning, +Health' }
];
