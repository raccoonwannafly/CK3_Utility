
import { Trait, TraitCategory, StoredCharacter } from './types';

export const APP_NAME = "CK3 Royal Utility";

export const PRESTIGE_LEVELS = [
  "Established",
  "Distinguished",
  "Illustrious",
  "Exalted among Men",
  "The Living Legend"
];

export const PIETY_LEVELS = [
  "Dutiful",
  "Faithful",
  "Devoted Servant",
  "Paragon of Virtue",
  "Religious Icon"
];

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
    category: 'historical',
    pietyLevel: '4', // Religious Icon
    prestigeLevel: '4', // Living Legend
    dynastyName: 'd\'Arc',
    houseName: 'd\'Arc',
    birthName: 'Jehanne',
    titles: ['The Maid of Orléans', 'Saint', 'Commanding General'],
    dateBirth: '1412-01-06'
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
    category: 'historical',
    prestigeLevel: '3',
    pietyLevel: '1',
    dynastyName: 'de Normandie',
    houseName: 'de Normandie',
    birthName: 'Guillaume',
    titles: ['King of England', 'Duke of Normandy'],
    dateBirth: '1028-09-01',
    dateStart: '1066-12-25'
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
    category: 'historical',
    prestigeLevel: '2',
    pietyLevel: '4',
    dynastyName: 'di Canossa',
    houseName: 'di Canossa',
    birthName: 'Matilda',
    titles: ['Margravine of Tuscany', 'Vice-Queen of Italy'],
    dateBirth: '1046-03-01'
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
    category: 'historical',
    prestigeLevel: '4',
    pietyLevel: '2',
    dynastyName: 'Munsö',
    houseName: 'Munsö',
    titles: ['King of Sweden', 'Chieftain'],
    dateBirth: '0777-01-01',
    dateStart: '0867-01-01'
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
    category: 'historical',
    prestigeLevel: '3',
    pietyLevel: '0',
    dynastyName: 'Haesteinn',
    houseName: 'Haesteinn',
    titles: ['Count of Montaigu', 'Viking Chieftain'],
    dateBirth: '0810-01-01',
    dateStart: '0867-01-01'
  }
];

export const TRAITS: Trait[] = [
  // --- Personality Traits ---
  {
    name: "Brave",
    id: "brave",
    cost: 40,
    description: "+2 Martial, +3 Prowess, +10 Attraction Opinion, +10 Glory Hound Vassal Opinion, +100% Likelihood of capture or death in Battle, +10 Same Trait Opinion, -10 Opposite Trait Opinion, Stress Loss through Hunting",
    category: TraitCategory.PERSONALITY,
    opposites: ["Craven"]
  },
  {
    name: "Craven",
    id: "craven",
    cost: -10,
    description: "-2 Martial, +2 Intrigue, -3 Prowess, -10 Attraction Opinion, +10 Days Enemy Hostile Scheme Phase Length, +10% Scheme Secrecy, +25% Travel Safety, -5 Courtly Vassal Opinion, -15 Glory Hound Vassal Opinion, -50% Likelihood of capture or death in Battle, +20 Same Trait Opinion, Stress Gain through Torture",
    category: TraitCategory.PERSONALITY,
    opposites: ["Brave"]
  },
  {
    name: "Calm",
    id: "calm",
    cost: 25,
    description: "+1 Diplomacy, +1 Intrigue, +10% Stress Loss, +50% Dread Decay, +10% Scheme Discovery Chance, +10 Same Trait Opinion, -10 Opposite Trait Opinion, Enables the Meditate in Seclusion decision",
    category: TraitCategory.PERSONALITY,
    opposites: ["Wrathful"]
  },
  {
    name: "Wrathful",
    id: "wrathful",
    cost: 30,
    description: "-1 Diplomacy, +3 Martial, -1 Intrigue, +20 Natural Dread, -10 Courtly Vassal Opinion, +5 Glory Hound Vassal Opinion, -10 Parochial Vassal Opinion, Enables the Punish Criminal interaction",
    category: TraitCategory.PERSONALITY,
    opposites: ["Calm"]
  },
  {
    name: "Chaste",
    id: "chaste",
    cost: 20,
    description: "+2 Learning, -25% Fertility, +40 Days Seduce Scheme Phase Length, +10 Same Trait Opinion, -10 Opposite Trait Opinion, Harder to seduce",
    category: TraitCategory.PERSONALITY,
    opposites: ["Lustful"]
  },
  {
    name: "Lustful",
    id: "lustful",
    cost: 25,
    description: "+2 Intrigue, +25% Fertility, -10 Days Seduce Scheme Phase Length, +10 Same Trait Opinion, -10 Opposite Trait Opinion, -50% Asexuality Chance, Easier to seduce",
    category: TraitCategory.PERSONALITY,
    opposites: ["Chaste"]
  },
  {
    name: "Content",
    id: "content",
    cost: 20,
    description: "-1 Intrigue, +2 Learning, +10% Stress Loss, +20 Opinion of Liege, +10 Opinion of Vassals, +10 Parochial Vassal Opinion, +20 Same Trait Opinion, Stress Gain through Claim Throne, Stress Gain through Execution of non-criminal prisoners, Stress Gain through Force onto Council",
    category: TraitCategory.PERSONALITY,
    opposites: ["Ambitious"]
  },
  {
    name: "Ambitious",
    id: "ambitious",
    cost: 40,
    description: "+1 Diplomacy, +1 Martial, +1 Stewardship, +1 Intrigue, +1 Learning, +1 Prowess, +25% Stress Gain, -15 Opinion of Liege, +10 Glory Hound Vassal Opinion, -15 Same Trait Opinion, Stress Gain through Gifting Titles (if under Domain Limit), Stress Gain through Granting Vassals Independence, Stress Gain through Signing White Peace in Offensive Wars",
    category: TraitCategory.PERSONALITY,
    opposites: ["Content"]
  },
  {
    name: "Diligent",
    id: "diligent",
    cost: 40,
    description: "+2 Diplomacy, +3 Stewardship, +3 Learning, -50% Stress Loss, +5 Parochial Vassal Opinion, +10 Same Trait Opinion, -10 Opposite Trait Opinion, Enables the Develop Capital decision, Stress Loss through Hunting",
    category: TraitCategory.PERSONALITY,
    opposites: ["Lazy"]
  },
  {
    name: "Lazy",
    id: "lazy",
    cost: -10,
    description: "-1 Diplomacy, -1 Intrigue, -1 Stewardship, -1 Martial, -1 Learning, +50% Stress Loss, -10 Travel Speed, No Stress Loss through Hunting",
    category: TraitCategory.PERSONALITY,
    opposites: ["Diligent"]
  },
  {
    name: "Forgiving",
    id: "forgiving",
    cost: 25,
    description: "+2 Diplomacy, -2 Intrigue, +1 Learning, +15 Prisoner Opinion, +15 Minority Vassal Opinion, +10 Same Trait Opinion, -10 Opposite Trait Opinion, Enables the Abandon Hook interaction, Stress Gain through Blackmail, Stress Gain through Imprisonment, Stress Gain through Murder, Stress Gain through Title Revocation, Stress Gain through Torture",
    category: TraitCategory.PERSONALITY,
    opposites: ["Vengeful"]
  },
  {
    name: "Vengeful",
    id: "vengeful",
    cost: 30,
    description: "-2 Diplomacy, +2 Intrigue, +2 Prowess, +15% Dread Gain, +15 Hostile Scheme Success Chance against Rivals, Enables the Fabricate Hook Scheme against Rivals, Stress Loss through Execution of Rivals, Stress Loss through Murder of Rivals",
    category: TraitCategory.PERSONALITY,
    opposites: ["Forgiving"]
  },
  {
    name: "Generous",
    id: "generous",
    cost: 20,
    description: "+3 Diplomacy, -10% Monthly Income, +15 Courtly Vassal Opinion, -15 Opposite Trait Opinion, Stress Gain from Demanding Money, Stress Loss from Gifting Money",
    category: TraitCategory.PERSONALITY,
    opposites: ["Greedy"]
  },
  {
    name: "Greedy",
    id: "greedy",
    cost: 30,
    description: "-2 Diplomacy, +5% Monthly Income, +10% Monthly Income per Stress Level, -15 Courtly Vassal Opinion, Stress Gain through Gifting Money, Stress Gain through Granting Title (if under Domain Limit), Stress Loss through Extra Taxes",
    category: TraitCategory.PERSONALITY,
    opposites: ["Generous"]
  },
  {
    name: "Gregarious",
    id: "gregarious",
    cost: 30,
    description: "+2 Diplomacy, +0.10 Monthly Influence, +5 Attraction Opinion, -10 Days Personal Scheme Phase Length, +5 Courtly Vassal Opinion, +10 Same Trait Opinion, Stress Gain from Failure during Sway schemes, Stress Loss through Feasting",
    category: TraitCategory.PERSONALITY,
    opposites: ["Shy"]
  },
  {
    name: "Shy",
    id: "shy",
    cost: -10,
    description: "-2 Diplomacy, +1 Learning, -5 Attraction Opinion, -20 Days Personal Scheme Phase Length, +20 Enemy Hostile Scheme Phase Length, +25% Travel Safety, +5 Plague Resistance, +20 Learn Language Scheme Phase Length, +10 Parochial Vassal Opinion, +10 Same Trait Opinion, Enables the Withdraw from View Countermeasure (Tier 4), Stress Gain through Plots",
    category: TraitCategory.PERSONALITY,
    opposites: ["Gregarious"]
  },
  {
    name: "Honest",
    id: "honest",
    cost: 20,
    description: "+2 Diplomacy, -4 Intrigue, +5 Courtly Vassal Opinion, +10 Same Trait Opinion, -10 Opposite Trait Opinion, Stress Gain through Blackmail, Stress Loss from Exposing Secrets",
    category: TraitCategory.PERSONALITY,
    opposites: ["Deceitful"]
  },
  {
    name: "Deceitful",
    id: "deceitful",
    cost: 30,
    description: "-2 Diplomacy, +4 Intrigue, -10 Opposite Trait Opinion, Enables the Study the Art of Scheming decision",
    category: TraitCategory.PERSONALITY,
    opposites: ["Honest"]
  },
  {
    name: "Humble",
    id: "humble",
    cost: 20,
    description: "+0.5 Monthly Piety, +10 Opinion of Liege, +10 Opinion of Vassals, +10 Clergy Opinion, +10 Zealot Vassal Opinion, -15 Opposite Trait Opinion",
    category: TraitCategory.PERSONALITY,
    opposites: ["Arrogant"]
  },
  {
    name: "Arrogant",
    id: "arrogant",
    cost: 20,
    description: "+1 Monthly Prestige, -5 Opinion of Liege, -5 Opinion of Vassals, -10% Scheme Secrecy, -15 Opposite Trait Opinion, Stress Gain through Granting Vassals Independence, Stress Gain through Legitimizing Bastard, Stress Gain through Signing White Peace in Offensive Wars, Unique 'This is you' description from beauty traits",
    category: TraitCategory.PERSONALITY,
    opposites: ["Humble"]
  },
  {
    name: "Just",
    id: "just",
    cost: 40,
    description: "+2 Stewardship, -3 Intrigue, +1 Learning, +15 Parochial Vassal Opinion, +15 Minority Vassal Opinion, Increased Initial Legitimacy, +10 Same Trait Opinion, -10 Opposite Trait Opinion, Stress Gain through Blackmail, Stress Gain through Execution of Prisoners, Stress Loss from Exposing Secrets",
    category: TraitCategory.PERSONALITY,
    opposites: ["Arbitrary"]
  },
  {
    name: "Arbitrary",
    id: "arbitrary",
    cost: 30,
    description: "-2 Stewardship, +3 Intrigue, -1 Learning, -50% Stress Gain, +15 Natural Dread, -5 Vassal Opinion, Enables the Dismiss Hook interaction, Enables the Arbitrary Arrest Countermeasure (Tier 2)",
    category: TraitCategory.PERSONALITY,
    opposites: ["Just"]
  },
  {
    name: "Patient",
    id: "patient",
    cost: 30,
    description: "+2 Learning, +5 Liege Opinion, +10 Enemy Hostile Scheme Phase Length, +10 Parochial Vassal Opinion, -15 Opposite Trait Opinion",
    category: TraitCategory.PERSONALITY,
    opposites: ["Impatient"]
  },
  {
    name: "Impatient",
    id: "impatient",
    cost: 25,
    description: "-2 Learning, +20% Monthly Prestige, -5 Opinion of Liege, -10 Days Hostile Scheme Phase Length, +25.0% Travel Speed, -10 Travel Safety, -10 Courtly Vassal Opinion, -10 Parochial Vassal Opinion, -15 Opposite Trait Opinion, Enables the Expedite Schemes decision",
    category: TraitCategory.PERSONALITY,
    opposites: ["Patient"]
  },
  {
    name: "Temperate",
    id: "temperate",
    cost: 40,
    description: "+2 Stewardship, +0.25 Health, -10 Courtly Vassal Opinion, +10 Same Trait Opinion, -10 Opposite Trait Opinion",
    category: TraitCategory.PERSONALITY,
    opposites: ["Gluttonous"]
  },
  {
    name: "Gluttonous",
    id: "gluttonous",
    cost: 20,
    description: "-2 Stewardship, +10% Stress Loss, -5 Attraction Opinion, +10 Same Trait Opinion, -10 Opposite Trait Opinion, Less likely to die from poisoning during Murder schemes",
    category: TraitCategory.PERSONALITY,
    opposites: ["Temperate"]
  },
  {
    name: "Trusting",
    id: "trusting",
    cost: 10,
    description: "+2 Diplomacy, -2 Intrigue, +15 Opinion of Liege, +15 Opinion of Vassals, +15.0% Initial Enemy Hostile Scheme Success Chance, -10 Travel Safety, Can offer potential Agent a Strong Hook, Stress Gain through Blackmail of Non-criminal prisoners, Stress Gain through Execution of Non-criminal prisoners",
    category: TraitCategory.PERSONALITY,
    opposites: ["Paranoid"]
  },
  {
    name: "Paranoid",
    id: "paranoid",
    cost: -10,
    description: "-1 Diplomacy, +3 Intrigue, +100% Stress gain, +25% Dread Gain, -10 Opinion of Vassals, +10% Scheme Discovery Chance, -25.0% Initial Enemy Personal Scheme Success Chance, -10 Travel Speed, +10 Travel Safety, Enables all Countermeasure (Tier 2), Stress Gain through Inviting characters to court, Stress Gain through Plots",
    category: TraitCategory.PERSONALITY,
    opposites: ["Trusting"]
  },
  {
    name: "Zealous",
    id: "zealous",
    cost: 30,
    description: "+2 Martial, +20% Monthly Piety, -35 Opinion of Different Faith, +20% Faith Conversion Cost, +15 Zealot Vassal Opinion, +15 Same Trait and Faith Opinion, -10 Opposite Trait Opinion, Stress Loss through Execution (Different Faith)",
    category: TraitCategory.PERSONALITY,
    opposites: ["Cynical"]
  },
  {
    name: "Cynical",
    id: "cynical",
    cost: 30,
    description: "+2 Intrigue, +2 Learning, -20% Monthly Piety, -20% Faith Conversion Cost, -15 Zealot Vassal Opinion, +10 Same Trait Opinion, -10 Opposite Trait Opinion",
    category: TraitCategory.PERSONALITY,
    opposites: ["Zealous"]
  },
  {
    name: "Compassionate",
    id: "compassionate",
    cost: 10,
    description: "+2 Diplomacy, -2 Intrigue, -15 Natural Dread, +100% Dread Decay, +5 Attraction Opinion, +10 Courtly Vassal Opinion, +15 Minority Vassal Opinion, -15 Opposite Trait Opinion, Enables the Adopt interaction, Stress Gain through Blackmail, Stress Gain through Break up with lover, Stress Gain through Denounce, Stress Gain through Disinherit, Stress Gain through Dismiss Concubine, Stress Gain through Execution, Stress Gain through Fabricate Hook, Stress Gain through Imprison, Stress Gain through Move to Dungeon, Stress Gain through Start Abduct, Stress Gain through Start Murder, Stress Gain through Title Revocation, Stress Gain through Torture",
    category: TraitCategory.PERSONALITY,
    opposites: ["Callous"]
  },
  {
    name: "Callous",
    id: "callous",
    cost: 40,
    description: "-2 Diplomacy, +2 Intrigue, +25% Dread Gain, -20% Tyranny Gain, -25% Dread Decay, -5 Attraction Opinion, -5 Close Family Opinion, -10 Courtly Vassal Opinion, Stress Gain from Releasing Prisoners without Demands",
    category: TraitCategory.PERSONALITY,
    opposites: ["Compassionate"]
  },
  {
    name: "Fickle",
    id: "fickle",
    cost: 25,
    description: "+2 Diplomacy, -2 Stewardship, +1 Intrigue, +20 Days Enemy Hostile Scheme Phase Length",
    category: TraitCategory.PERSONALITY,
    opposites: ["Stubborn"]
  },
  {
    name: "Stubborn",
    id: "stubborn",
    cost: 30,
    description: "+3 Stewardship, +0.25 Health (Disease Resistance), -5 Liege Opinion, -10 Courtly Vassal Opinion, -10 Parochial Vassal Opinion, -5 Minority Vassal Opinion",
    category: TraitCategory.PERSONALITY,
    opposites: ["Fickle"]
  },

  // --- Education Traits ---
  {
    name: "Naive Appeaser",
    id: "naive_appeaser",
    cost: 0,
    description: "+0 Diplomacy",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Adequate Bargainer",
    id: "adequate_bargainer",
    cost: 20,
    description: "+2 Diplomacy",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Charismatic Negotiator",
    id: "charismatic_negotiator",
    cost: 40,
    description: "+4 Diplomacy, +10% Monthly Diplomacy Lifestyle Experience",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Grey Eminence",
    id: "grey_eminence",
    cost: 80,
    description: "+6 Diplomacy, +20% Monthly Diplomacy Lifestyle Experience",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Virtuoso Arbitrator",
    id: "virtuoso_arbitrator",
    cost: 160,
    description: "+8 Diplomacy, +1 Learning, +30% Monthly Diplomacy Lifestyle Experience",
    category: TraitCategory.EDUCATION,
    opposites: []
  },

  {
    name: "Misguided Warrior",
    id: "misguided_warrior",
    cost: 0,
    description: "+0 Martial",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Tough Soldier",
    id: "tough_soldier",
    cost: 20,
    description: "+2 Martial",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Skilled Tactician",
    id: "skilled_tactician",
    cost: 40,
    description: "+4 Martial, +10% Monthly Martial Lifestyle Experience",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Brilliant Strategist",
    id: "brilliant_strategist",
    cost: 80,
    description: "+6 Martial, +20% Monthly Martial Lifestyle Experience",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Exalted Warlord",
    id: "exalted_warlord",
    cost: 160,
    description: "+8 Martial, +1 Diplomacy, +30% Monthly Martial Lifestyle Experience",
    category: TraitCategory.EDUCATION,
    opposites: []
  },

  {
    name: "Indulgent Wastrel",
    id: "indulgent_wastrel",
    cost: 0,
    description: "+0 Stewardship",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Thrifty Clerk",
    id: "thrifty_clerk",
    cost: 20,
    description: "+2 Stewardship",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Fortune Builder",
    id: "fortune_builder",
    cost: 40,
    description: "+4 Stewardship, +10% Monthly Stewardship Lifestyle Experience",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Midas Touched",
    id: "midas_touched",
    cost: 80,
    description: "+6 Stewardship, +20% Monthly Stewardship Lifestyle Experience",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Golden Sovereign",
    id: "golden_sovereign",
    cost: 160,
    description: "+8 Stewardship, +1 Learning, +30% Monthly Stewardship Lifestyle Experience",
    category: TraitCategory.EDUCATION,
    opposites: []
  },

  {
    name: "Amateurish Plotter",
    id: "amateurish_plotter",
    cost: 0,
    description: "+0 Intrigue",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Flamboyant Trickster",
    id: "flamboyant_trickster",
    cost: 20,
    description: "+2 Intrigue",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Intricate Webweaver",
    id: "intricate_webweaver",
    cost: 40,
    description: "+4 Intrigue, +10% Monthly Intrigue Lifestyle Experience",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Elusive Shadow",
    id: "elusive_shadow",
    cost: 80,
    description: "+6 Intrigue, +20% Monthly Intrigue Lifestyle Experience",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Conniving Puppetmaster",
    id: "conniving_puppetmaster",
    cost: 160,
    description: "+8 Intrigue, +1 Diplomacy, +30% Monthly Intrigue Lifestyle Experience",
    category: TraitCategory.EDUCATION,
    opposites: []
  },

  {
    name: "Conscientious Scribe",
    id: "conscientious_scribe",
    cost: 0,
    description: "+0 Learning",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Insightful Thinker",
    id: "insightful_thinker",
    cost: 20,
    description: "+2 Learning",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Astute Intellectual",
    id: "astute_intellectual",
    cost: 40,
    description: "+4 Learning, +10% Monthly Learning Lifestyle Experience",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Mastermind Philosopher",
    id: "mastermind_philosopher",
    cost: 80,
    description: "+6 Learning, +20% Monthly Learning Lifestyle Experience",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Erudite Oracle",
    id: "erudite_oracle",
    cost: 160,
    description: "+8 Learning, +1 Stewardship, +30% Monthly Learning Lifestyle Experience",
    category: TraitCategory.EDUCATION,
    opposites: []
  },

  {
    name: "Bumbling Squire",
    id: "bumbling_squire",
    cost: 0,
    description: "-2 Prowess",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Confident Knight",
    id: "confident_knight",
    cost: 15,
    description: "+2 Prowess",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Formidable Banneret",
    id: "formidable_banneret",
    cost: 40,
    description: "+4 Prowess, +10% Monthly Martial Lifestyle Experience",
    category: TraitCategory.EDUCATION,
    opposites: []
  },
  {
    name: "Famous Champion",
    id: "famous_champion",
    cost: 80,
    description: "+6 Prowess, +20% Monthly Martial Lifestyle Experience, +0.5 Prestige/month",
    category: TraitCategory.EDUCATION,
    opposites: []
  },

  // --- Congenital Traits ---
  {
    name: "Hideous",
    id: "hideous",
    cost: -30,
    description: "-3 Diplomacy, -30% Fertility, -30 Attraction Opinion, Extreme Facial Characteristics",
    category: TraitCategory.CONGENITAL,
    opposites: ["Ugly", "Homely", "Comely", "Pretty", "Handsome", "Beautiful"]
  },
  {
    name: "Ugly",
    id: "ugly",
    cost: -20,
    description: "-2 Diplomacy, -20% Fertility, -20 Attraction Opinion, Extreme Facial Characteristics",
    category: TraitCategory.CONGENITAL,
    opposites: ["Hideous", "Homely", "Comely", "Pretty", "Handsome", "Beautiful"]
  },
  {
    name: "Homely",
    id: "homely",
    cost: -10,
    description: "-1 Diplomacy, -10% Fertility, -10 Attraction Opinion, Extreme Facial Characteristics",
    category: TraitCategory.CONGENITAL,
    opposites: ["Hideous", "Ugly", "Comely", "Pretty", "Handsome", "Beautiful"]
  },
  {
    name: "Comely",
    id: "comely",
    cost: 40,
    description: "+1 Diplomacy, +10% Fertility, +10 Attraction Opinion, Slower Portrait Aging",
    category: TraitCategory.CONGENITAL,
    opposites: ["Hideous", "Ugly", "Homely", "Pretty", "Handsome", "Beautiful"]
  },
  {
    name: "Pretty",
    id: "pretty",
    cost: 80,
    description: "+2 Diplomacy, +20% Fertility, +20 Attraction Opinion, Slower Portrait Aging",
    category: TraitCategory.CONGENITAL,
    opposites: ["Hideous", "Ugly", "Homely", "Comely", "Handsome", "Beautiful"]
  },
  {
    name: "Beautiful",
    id: "beautiful",
    cost: 120,
    description: "+3 Diplomacy, +30% Fertility, +30 Attraction Opinion, Slower Portrait Aging",
    category: TraitCategory.CONGENITAL,
    opposites: ["Hideous", "Ugly", "Homely", "Comely", "Pretty", "Handsome"]
  },
  {
    name: "Handsome",
    id: "handsome",
    cost: 80,
    description: "+2 Diplomacy, +20% Fertility, +20 Attraction Opinion, Slower Portrait Aging",
    category: TraitCategory.CONGENITAL,
    opposites: ["Hideous", "Ugly", "Homely", "Comely", "Pretty", "Beautiful"]
  },

  {
    name: "Imbecile",
    id: "imbecile",
    cost: -45,
    description: "-8 All Stats, -30% Lifestyle XP",
    category: TraitCategory.CONGENITAL,
    opposites: ["Stupid", "Slow", "Quick", "Intelligent", "Genius"]
  },
  {
    name: "Stupid",
    id: "stupid",
    cost: -30,
    description: "-4 All Stats, -20% Lifestyle XP",
    category: TraitCategory.CONGENITAL,
    opposites: ["Imbecile", "Slow", "Quick", "Intelligent", "Genius"]
  },
  {
    name: "Slow",
    id: "slow",
    cost: -15,
    description: "-2 All Stats, -10% Lifestyle XP",
    category: TraitCategory.CONGENITAL,
    opposites: ["Imbecile", "Stupid", "Quick", "Intelligent", "Genius"]
  },
  {
    name: "Quick",
    id: "quick",
    cost: 80,
    description: "+1 All Stats, +10% Lifestyle XP",
    category: TraitCategory.CONGENITAL,
    opposites: ["Imbecile", "Stupid", "Slow", "Intelligent", "Genius"]
  },
  {
    name: "Intelligent",
    id: "intelligent",
    cost: 160,
    description: "+3 All Stats, +20% Lifestyle XP",
    category: TraitCategory.CONGENITAL,
    opposites: ["Imbecile", "Stupid", "Slow", "Quick", "Genius"]
  },
  {
    name: "Genius",
    id: "genius",
    cost: 240,
    description: "+5 All Stats, +30% Lifestyle XP",
    category: TraitCategory.CONGENITAL,
    opposites: ["Imbecile", "Stupid", "Slow", "Quick", "Intelligent"]
  },

  {
    name: "Feeble",
    id: "feeble",
    cost: -45,
    description: "-6 Prowess, -1 Health, -10 Attraction",
    category: TraitCategory.CONGENITAL,
    opposites: ["Frail", "Delicate", "Hale", "Robust", "Herculean", "Amazonian"]
  },
  {
    name: "Frail",
    id: "frail",
    cost: -30,
    description: "-4 Prowess, -0.5 Health, -5 Attraction",
    category: TraitCategory.CONGENITAL,
    opposites: ["Feeble", "Delicate", "Hale", "Robust", "Herculean", "Amazonian"]
  },
  {
    name: "Delicate",
    id: "delicate",
    cost: -15,
    description: "-2 Prowess, -0.25 Health",
    category: TraitCategory.CONGENITAL,
    opposites: ["Feeble", "Frail", "Hale", "Robust", "Herculean", "Amazonian"]
  },
  {
    name: "Hale",
    id: "hale",
    cost: 60,
    description: "+2 Prowess, +0.25 Health, +5 Attraction",
    category: TraitCategory.CONGENITAL,
    opposites: ["Feeble", "Frail", "Delicate", "Robust", "Herculean", "Amazonian"]
  },
  {
    name: "Robust",
    id: "robust",
    cost: 120,
    description: "+4 Prowess, +0.5 Health, +10 Attraction",
    category: TraitCategory.CONGENITAL,
    opposites: ["Feeble", "Frail", "Delicate", "Hale", "Herculean", "Amazonian"]
  },
  {
    name: "Herculean",
    id: "herculean",
    cost: 180,
    description: "+8 Prowess, +1 Health, +15 Attraction",
    category: TraitCategory.CONGENITAL,
    opposites: ["Feeble", "Frail", "Delicate", "Hale", "Robust", "Amazonian"]
  },
  {
    name: "Amazonian",
    id: "amazonian",
    cost: 180,
    description: "+8 Prowess, +1 Health, +15 Attraction",
    category: TraitCategory.CONGENITAL,
    opposites: ["Feeble", "Frail", "Delicate", "Hale", "Robust", "Herculean"]
  },

  {
    name: "Albino",
    id: "albino",
    cost: 120,
    description: "Visual Albinism, +15 Natural Dread, -10 General Opinion",
    category: TraitCategory.CONGENITAL
  },
  {
    name: "Giant",
    id: "giant",
    cost: 60,
    description: "+6 Prowess, +20% Men-at-Arms Damage, +10 Attraction, -0.25 Health, -1% Speed",
    category: TraitCategory.CONGENITAL,
    opposites: ["Dwarf"]
  },
  {
    name: "Dwarf",
    id: "dwarf",
    cost: 40,
    description: "+20% Same Trait Opinion, -2 Prowess, -20 Attraction",
    category: TraitCategory.CONGENITAL,
    opposites: ["Giant"]
  },
  {
    name: "Fecund",
    id: "fecund",
    cost: 140,
    description: "+50% Fertility, +5 Years Life Expectancy",
    category: TraitCategory.CONGENITAL
  },
  {
    name: "Pure-blooded",
    id: "pure_blooded",
    cost: 140,
    description: "+10% Fertility, -50% Inbreeding Chance, +15 Attraction Opinion",
    category: TraitCategory.CONGENITAL
  },
  {
    name: "Scaly",
    id: "scaly",
    cost: 100,
    description: "+10 Natural Dread, -20 Attraction, -10 General Opinion",
    category: TraitCategory.CONGENITAL
  },

  // --- Lifestyle & Activity Traits ---
  {
    name: "Aspiring Blademaster",
    id: "aspiring_blademaster",
    cost: 0,
    description: "+3 Prowess, +0.25 Disease Resistance",
    category: TraitCategory.LIFESTYLE
  },
  {
    name: "Eager Reveler",
    id: "eager_reveler",
    cost: 0,
    description: "+1 Intrigue, +5 Courtly Vassal Opinion",
    category: TraitCategory.LIFESTYLE
  },
  {
    name: "Novice Physician",
    id: "novice_physician",
    cost: 0,
    description: "+1 Learning, +0.25 Disease Resistance",
    category: TraitCategory.LIFESTYLE
  },
  {
    name: "Pilgrim",
    id: "pilgrim",
    cost: 0,
    description: "+5% Monthly Piety, +5 Travel Speed, +5 Travel Safety",
    category: TraitCategory.LIFESTYLE
  },
  {
    name: "Hunter",
    id: "hunter",
    cost: 0,
    description: "+1 Prowess, +5% Stress Loss, +10 Same Trait Opinion",
    category: TraitCategory.LIFESTYLE
  },
  {
    name: "Falconer",
    id: "falconer",
    cost: 50,
    description: "+1 Stewardship, +1 Learning, +0.25 Monthly Prestige",
    category: TraitCategory.LIFESTYLE
  },
  {
    name: "Traveler",
    id: "traveler",
    cost: 0,
    description: "+1 Diplomacy, +10% Wandering Lifestyle Experience, +5 Same Trait Opinion",
    category: TraitCategory.LIFESTYLE
  },
  {
    name: "Viking",
    id: "viking",
    cost: 40,
    description: "+2 Martial, +3 Prowess, +0.3 Prestige/month, +15% Men-at-arms Maintenance",
    category: TraitCategory.LIFESTYLE
  },
  {
    name: "Varangian",
    id: "varangian",
    cost: 60,
    description: "+2 Martial, +4 Prowess, +1 Diplomacy, +0.5 Prestige/month",
    category: TraitCategory.LIFESTYLE
  },

  // --- Other ---
  {
    name: "Immortal",
    id: "immortal",
    cost: 10000,
    description: "Grants immortality. Character never ages or dies of old age.",
    category: TraitCategory.OTHER
  },

  // --- Crusader / Faith ---
  {
    name: "Crusader",
    id: "crusader",
    cost: 20,
    description: "+2 Martial, +1 Prowess, +15 Clergy Opinion, +0.3 Piety/month",
    category: TraitCategory.OTHER
  },

  // --- Commander ---
  {
    name: "Aggressive Attacker",
    id: "aggressive_attacker",
    cost: 40,
    description: "+25% Enemy Fatalities",
    category: TraitCategory.COMMANDER
  },
  {
    name: "Unyielding Defender",
    id: "unyielding_defender",
    cost: 40,
    description: "+25% Friendly Fatalities",
    category: TraitCategory.COMMANDER
  },
  {
    name: "Logistician",
    id: "logistician",
    cost: 40,
    description: "+100% Supply Limit",
    category: TraitCategory.COMMANDER
  },
  {
    name: "Holy Warrior",
    id: "holy_warrior",
    cost: 40,
    description: "+10 Advantage vs Hostile Faith",
    category: TraitCategory.COMMANDER
  }
];

