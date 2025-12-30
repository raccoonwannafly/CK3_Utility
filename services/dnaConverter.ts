
import { DnaData } from "../types";

export const VANILLA_GENES = [
  "hair_color", "skin_color", "eye_color",
  "gene_chin_forward", "gene_chin_height", "gene_chin_width",
  "gene_eye_angle", "gene_eye_depth", "gene_eye_height", "gene_eye_distance", "gene_eye_shut",
  "gene_forehead_angle", "gene_forehead_brow_height", "gene_forehead_roundness", "gene_forehead_width", "gene_forehead_height",
  "gene_head_height", "gene_head_width", "gene_head_profile", "gene_head_top_height", "gene_head_top_width",
  "gene_jaw_angle", "gene_jaw_forward", "gene_jaw_height", "gene_jaw_width",
  "gene_mouth_corner_depth", "gene_mouth_corner_height", "gene_mouth_forward", "gene_mouth_height", "gene_mouth_width",
  "gene_mouth_upper_lip_size", "gene_mouth_lower_lip_size", "gene_mouth_open",
  "gene_neck_length", "gene_neck_width",
  "gene_bs_cheek_forward", "gene_bs_cheek_height", "gene_bs_cheek_width",
  "gene_bs_ear_angle", "gene_bs_ear_inner_shape", "gene_bs_ear_bend", "gene_bs_ear_outward", "gene_bs_ear_size",
  "gene_bs_eye_corner_depth", "gene_bs_eye_fold_shape", "gene_bs_eye_size", "gene_bs_eye_upper_lid_size",
  "gene_bs_forehead_brow_curve", "gene_bs_forehead_brow_forward", "gene_bs_forehead_brow_inner_height", "gene_bs_forehead_brow_outer_height", "gene_bs_forehead_brow_width",
  "gene_bs_jaw_def",
  "gene_bs_mouth_lower_lip_def", "gene_bs_mouth_lower_lip_full", "gene_bs_mouth_lower_lip_pad", "gene_bs_mouth_lower_lip_width",
  "gene_bs_mouth_philtrum_def", "gene_bs_mouth_philtrum_shape", "gene_bs_mouth_philtrum_width",
  "gene_bs_mouth_upper_lip_def", "gene_bs_mouth_upper_lip_full", "gene_bs_mouth_upper_lip_profile", "gene_bs_mouth_upper_lip_width",
  "gene_bs_nose_forward", "gene_bs_nose_height", "gene_bs_nose_length", "gene_bs_nose_nostril_height", "gene_bs_nose_nostril_width", "gene_bs_nose_profile", "gene_bs_nose_ridge_angle", "gene_bs_nose_ridge_width", "gene_bs_nose_size", "gene_bs_nose_tip_angle", "gene_bs_nose_tip_forward", "gene_bs_nose_tip_width",
  "face_detail_cheek_def", "face_detail_cheek_fat", "face_detail_chin_cleft", "face_detail_chin_def", "face_detail_eye_lower_lid_def", "face_detail_eye_socket", "face_detail_nasolabial", "face_detail_nose_ridge_def", "face_detail_nose_tip_def", "face_detail_temple_def",
  "expression_brow_wrinkles", "expression_eye_wrinkles", "expression_forehead_wrinkles", "expression_other",
  "complexion", "gene_height", "gene_bs_body_type", "gene_bs_body_shape", "gene_bs_bust", "gene_age",
  "gene_eyebrows_shape", "gene_eyebrows_fullness", "gene_body_hair", "gene_hair_type", "gene_baldness",
  "eye_accessory", "teeth_accessory", "eyelashes_accessory", "beards", "hairstyles"
];

export const EPE_GENES = [
  ...VANILLA_GENES.slice(0, -2), // Everything except beards/hair
  "gene_eye_size", "gene_eye_shut_top", "gene_eye_shut_bottom",
  "gene_bs_eye_height_inside", "gene_bs_eye_height_outisde", "gene_bs_ear_lobe",
  "gene_bs_nose_central_width", "gene_bs_nose_septum_width", "gene_forehead_inner_brow_width",
  "gene_bs_mouth_lower_lip_profile", "gene_bs_eye_outer_width", "gene_bs_head_asymmetry_1",
  "gene_bs_eye_fold_2", "gene_bs_mouth_center_curve", "gene_bs_eyebrow_straight",
  "gene_bs_head_round_shape", "gene_bs_nose_septum_height", "gene_bs_head_lower_height",
  "gene_bs_nose_flared_nostril", "gene_bs_mouth_upper_lip_forward", "gene_bs_mouth_lower_lip_forward",
  "gene_bs_nose_swollen", "gene_bs_ears_fantasy", "gene_bs_mouth_glamour_lips",
  "face_detail_eye_upper_lid_def", "gene_eyebrow_inner_width", "hair_aging",
  "beards", "hairstyles"
];

const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const decodeDnaToData = (dnaString: string, mod: 'vanilla' | 'epe'): DnaData => {
  const base64 = dnaString.replace(/[\s\n\r"]/g, '');
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const geneList = mod === 'vanilla' ? VANILLA_GENES : EPE_GENES;
  const data: DnaData = {};
  let offset = 0;

  for (const gene of geneList) {
    if (offset + 3 < bytes.length) {
      data[gene] = [bytes[offset], bytes[offset+1], bytes[offset+2], bytes[offset+3]];
      offset += 4;
    } else {
      data[gene] = [0, 127, 0, 127];
    }
  }
  return data;
};

export const encodeDataToDna = (data: DnaData, mod: 'vanilla' | 'epe'): string => {
  const geneList = mod === 'vanilla' ? VANILLA_GENES : EPE_GENES;
  const bytes: number[] = [];
  for (const gene of geneList) {
    const vals = data[gene] || [0, 127, 0, 127];
    bytes.push(...vals);
  }
  const u8 = new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < u8.length; i++) {
    binary += String.fromCharCode(u8[i]);
  }
  return btoa(binary);
};

export const convertDnaStringToCode = (dnaString: string, type: 'male' | 'female', mod: 'vanilla' | 'epe'): string => {
  try {
    const data = decodeDnaToData(dnaString, mod);
    let output = `ruler_designer_12345={\n\ttype=${type}\n\tid=0\n\tgenes={ \n`;
    
    for (const [gene, vals] of Object.entries(data)) {
      if (["hair_color", "skin_color", "eye_color"].includes(gene)) {
        output += `\t\t${gene}={ ${vals.join(' ')} }\n`;
      } else {
        output += `\t\t${gene}={ "${gene}_pos" ${vals[1]} "${gene}_pos" ${vals[3]} }\n`;
      }
    }
    output += `\t}\n}`;
    return output;
  } catch (e) {
    return "Error: Could not parse DNA string.";
  }
};

export const convertCodeToDnaString = (code: string, mod: 'vanilla' | 'epe'): string => {
  try {
    const geneList = mod === 'vanilla' ? VANILLA_GENES : EPE_GENES;
    const data: DnaData = {};

    for (const gene of geneList) {
      if (["hair_color", "skin_color", "eye_color"].includes(gene)) {
        const regex = new RegExp(`${gene}\\s*=\\s*\\{\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)`);
        const match = code.match(regex);
        data[gene] = match ? match.slice(1, 5).map(Number) : [0, 0, 0, 0];
      } else {
        const regex = new RegExp(`${escapeRegExp(gene)}\\s*=\\s*\\{[^}]*?(\\d+)[^}]*?(\\d+)`, 'm');
        const match = code.match(regex);
        if (match) {
          data[gene] = [0, Number(match[1]), 0, Number(match[2])];
        } else {
          data[gene] = [0, 127, 0, 127];
        }
      }
    }
    return encodeDataToDna(data, mod);
  } catch (e) {
    return "Error: Could not encode to DNA string.";
  }
};

/**
 * Grafts old DNA data onto a new template DNA string.
 * Mimics the logic: write_limit = min(len(final), len(source)); copy source to final.
 */
export const graftDna = (oldDna: string, templateDna: string): string => {
  try {
    // 1. Decode strings to bytes
    // We remove whitespace just in case
    const cleanOld = oldDna.replace(/[\s\n\r"]/g, '');
    const cleanTemplate = templateDna.replace(/[\s\n\r"]/g, '');

    const oldBinary = atob(cleanOld);
    const tempBinary = atob(cleanTemplate);

    const oldBytes = new Uint8Array(oldBinary.length);
    for (let i = 0; i < oldBinary.length; i++) oldBytes[i] = oldBinary.charCodeAt(i);

    const tempBytes = new Uint8Array(tempBinary.length);
    for (let i = 0; i < tempBinary.length; i++) tempBytes[i] = tempBinary.charCodeAt(i);

    // 2. Create mutable buffer from template (to keep length valid for current version)
    const finalBuffer = new Uint8Array(tempBytes);

    // 3. Overwrite with old data
    const writeLimit = Math.min(finalBuffer.length, oldBytes.length);
    finalBuffer.set(oldBytes.subarray(0, writeLimit), 0);

    // 4. Encode back
    let binary = "";
    for (let i = 0; i < finalBuffer.length; i++) {
      binary += String.fromCharCode(finalBuffer[i]);
    }
    return btoa(binary);
  } catch (e) {
    console.error(e);
    return "Error: Failed to graft DNA. Check input validity.";
  }
};
