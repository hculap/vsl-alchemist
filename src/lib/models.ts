import { pool } from './database';
import { BusinessProfile, CampaignOutput } from '../types';
import { gemini20FlashLite } from '@genkit-ai/googleai';
import { openAICompatible } from '@genkit-ai/compat-oai';

// Model configuration
export const MODELS = {
  GOOGLE: {
    GEMINI_20_FLASH_LITE: gemini20FlashLite,
  }
} as const;

// Default model selection - using Google model for now
export const DEFAULT_MODEL = MODELS.GOOGLE.GEMINI_20_FLASH_LITE;

// Language prompts for different languages
export const LANGUAGE_PROMPTS = {
  en: 'Write in English with a natural, conversational tone suitable for video content.',
  pl: 'Write in Polish with a natural, conversational tone suitable for video content.',
  es: 'Write in Spanish with a natural, conversational tone suitable for video content.',
  fr: 'Write in French with a natural, conversational tone suitable for video content.',
  de: 'Write in German with a natural, conversational tone suitable for video content.',
  it: 'Write in Italian with a natural, conversational tone suitable for video content.',
  pt: 'Write in Portuguese with a natural, conversational tone suitable for video content.',
  ru: 'Write in Russian with a natural, conversational tone suitable for video content.',
  ja: 'Write in Japanese with a natural, conversational tone suitable for video content.',
  ko: 'Write in Korean with a natural, conversational tone suitable for video content.',
  zh: 'Write in Chinese with a natural, conversational tone suitable for video content.',
  ar: 'Write in Arabic with a natural, conversational tone suitable for video content.',
  hi: 'Write in Hindi with a natural, conversational tone suitable for video content.',
  tr: 'Write in Turkish with a natural, conversational tone suitable for video content.',
  nl: 'Write in Dutch with a natural, conversational tone suitable for video content.',
  sv: 'Write in Swedish with a natural, conversational tone suitable for video content.',
  no: 'Write in Norwegian with a natural, conversational tone suitable for video content.',
  da: 'Write in Danish with a natural, conversational tone suitable for video content.',
  fi: 'Write in Finnish with a natural, conversational tone suitable for video content.',
  cs: 'Write in Czech with a natural, conversational tone suitable for video content.',
  sk: 'Write in Slovak with a natural, conversational tone suitable for video content.',
  hu: 'Write in Hungarian with a natural, conversational tone suitable for video content.',
  ro: 'Write in Romanian with a natural, conversational tone suitable for video content.',
  bg: 'Write in Bulgarian with a natural, conversational tone suitable for video content.',
  hr: 'Write in Croatian with a natural, conversational tone suitable for video content.',
  sr: 'Write in Serbian with a natural, conversational tone suitable for video content.',
  sl: 'Write in Slovenian with a natural, conversational tone suitable for video content.',
  et: 'Write in Estonian with a natural, conversational tone suitable for video content.',
  lv: 'Write in Latvian with a natural, conversational tone suitable for video content.',
  lt: 'Write in Lithuanian with a natural, conversational tone suitable for video content.',
  uk: 'Write in Ukrainian with a natural, conversational tone suitable for video content.',
  be: 'Write in Belarusian with a natural, conversational tone suitable for video content.',
  kk: 'Write in Kazakh with a natural, conversational tone suitable for video content.',
  uz: 'Write in Uzbek with a natural, conversational tone suitable for video content.',
  ky: 'Write in Kyrgyz with a natural, conversational tone suitable for video content.',
  tg: 'Write in Tajik with a natural, conversational tone suitable for video content.',
  tk: 'Write in Turkmen with a natural, conversational tone suitable for video content.',
  az: 'Write in Azerbaijani with a natural, conversational tone suitable for video content.',
  ka: 'Write in Georgian with a natural, conversational tone suitable for video content.',
  hy: 'Write in Armenian with a natural, conversational tone suitable for video content.',
  he: 'Write in Hebrew with a natural, conversational tone suitable for video content.',
  fa: 'Write in Persian with a natural, conversational tone suitable for video content.',
  ur: 'Write in Urdu with a natural, conversational tone suitable for video content.',
  bn: 'Write in Bengali with a natural, conversational tone suitable for video content.',
  ta: 'Write in Tamil with a natural, conversational tone suitable for video content.',
  te: 'Write in Telugu with a natural, conversational tone suitable for video content.',
  ml: 'Write in Malayalam with a natural, conversational tone suitable for video content.',
  kn: 'Write in Kannada with a natural, conversational tone suitable for video content.',
  gu: 'Write in Gujarati with a natural, conversational tone suitable for video content.',
  pa: 'Write in Punjabi with a natural, conversational tone suitable for video content.',
  mr: 'Write in Marathi with a natural, conversational tone suitable for video content.',
  or: 'Write in Odia with a natural, conversational tone suitable for video content.',
  as: 'Write in Assamese with a natural, conversational tone suitable for video content.',
  ne: 'Write in Nepali with a natural, conversational tone suitable for video content.',
  si: 'Write in Sinhala with a natural, conversational tone suitable for video content.',
  my: 'Write in Burmese with a natural, conversational tone suitable for video content.',
  km: 'Write in Khmer with a natural, conversational tone suitable for video content.',
  lo: 'Write in Lao with a natural, conversational tone suitable for video content.',
  th: 'Write in Thai with a natural, conversational tone suitable for video content.',
  vi: 'Write in Vietnamese with a natural, conversational tone suitable for video content.',
  id: 'Write in Indonesian with a natural, conversational tone suitable for video content.',
  ms: 'Write in Malay with a natural, conversational tone suitable for video content.',
  tl: 'Write in Tagalog with a natural, conversational tone suitable for video content.',
  ceb: 'Write in Cebuano with a natural, conversational tone suitable for video content.',
  jv: 'Write in Javanese with a natural, conversational tone suitable for video content.',
  su: 'Write in Sundanese with a natural, conversational tone suitable for video content.',
  min: 'Write in Minangkabau with a natural, conversational tone suitable for video content.',
  ban: 'Write in Balinese with a natural, conversational tone suitable for video content.',
  bug: 'Write in Buginese with a natural, conversational tone suitable for video content.',
  ace: 'Write in Acehnese with a natural, conversational tone suitable for video content.',
  gor: 'Write in Gorontalo with a natural, conversational tone suitable for video content.',
  mak: 'Write in Makassarese with a natural, conversational tone suitable for video content.',
  mad: 'Write in Madurese with a natural, conversational tone suitable for video content.',
  bjn: 'Write in Banjarese with a natural, conversational tone suitable for video content.',
  sas: 'Write in Sasak with a natural, conversational tone suitable for video content.',
  btk: 'Write in Batak with a natural, conversational tone suitable for video content.',
  day: 'Write in Dayak with a natural, conversational tone suitable for video content.',
  iba: 'Write in Iban with a natural, conversational tone suitable for video content.',
  kng: 'Write in Kenyah with a natural, conversational tone suitable for video content.',
  kwh: 'Write in Kayan with a natural, conversational tone suitable for video content.',
  lbn: 'Write in Lun Bawang with a natural, conversational tone suitable for video content.',
  mdr: 'Write in Mandar with a natural, conversational tone suitable for video content.',
  mqy: 'Write in Manggarai with a natural, conversational tone suitable for video content.',
  nij: 'Write in Ngaju with a natural, conversational tone suitable for video content.',
  rej: 'Write in Rejang with a natural, conversational tone suitable for video content.',
  sda: 'Write in Sumbawa with a natural, conversational tone suitable for video content.',
  sdh: 'Write in Southern Kurdish with a natural, conversational tone suitable for video content.',
  sga: 'Write in Old Irish with a natural, conversational tone suitable for video content.',
  sgn: 'Write in Sign Language with a natural, conversational tone suitable for video content.',
  shn: 'Write in Shan with a natural, conversational tone suitable for video content.',
  sid: 'Write in Sidamo with a natural, conversational tone suitable for video content.',
  sin: 'Write in Sinhala with a natural, conversational tone suitable for video content.',
  slk: 'Write in Slovak with a natural, conversational tone suitable for video content.',
  slv: 'Write in Slovenian with a natural, conversational tone suitable for video content.',
  sma: 'Write in Southern Sami with a natural, conversational tone suitable for video content.',
  sme: 'Write in Northern Sami with a natural, conversational tone suitable for video content.',
  smj: 'Write in Lule Sami with a natural, conversational tone suitable for video content.',
  smn: 'Write in Inari Sami with a natural, conversational tone suitable for video content.',
  sms: 'Write in Skolt Sami with a natural, conversational tone suitable for video content.',
  sna: 'Write in Shona with a natural, conversational tone suitable for video content.',
  snd: 'Write in Sindhi with a natural, conversational tone suitable for video content.',
  som: 'Write in Somali with a natural, conversational tone suitable for video content.',
  sot: 'Write in Southern Sotho with a natural, conversational tone suitable for video content.',
  spa: 'Write in Spanish with a natural, conversational tone suitable for video content.',
  sqi: 'Write in Albanian with a natural, conversational tone suitable for video content.',
  srd: 'Write in Sardinian with a natural, conversational tone suitable for video content.',
  srp: 'Write in Serbian with a natural, conversational tone suitable for video content.',
  ssw: 'Write in Swati with a natural, conversational tone suitable for video content.',
  sun: 'Write in Sundanese with a natural, conversational tone suitable for video content.',
  sus: 'Write in Susu with a natural, conversational tone suitable for video content.',
  swa: 'Write in Swahili with a natural, conversational tone suitable for video content.',
  swe: 'Write in Swedish with a natural, conversational tone suitable for video content.',
  tah: 'Write in Tahitian with a natural, conversational tone suitable for video content.',
  tam: 'Write in Tamil with a natural, conversational tone suitable for video content.',
  tat: 'Write in Tatar with a natural, conversational tone suitable for video content.',
  tel: 'Write in Telugu with a natural, conversational tone suitable for video content.',
  tem: 'Write in Timne with a natural, conversational tone suitable for video content.',
  ter: 'Write in Tereno with a natural, conversational tone suitable for video content.',
  tet: 'Write in Tetum with a natural, conversational tone suitable for video content.',
  tgk: 'Write in Tajik with a natural, conversational tone suitable for video content.',
  tgl: 'Write in Tagalog with a natural, conversational tone suitable for video content.',
  tha: 'Write in Thai with a natural, conversational tone suitable for video content.',
  tig: 'Write in Tigre with a natural, conversational tone suitable for video content.',
  tir: 'Write in Tigrinya with a natural, conversational tone suitable for video content.',
  tiv: 'Write in Tiv with a natural, conversational tone suitable for video content.',
  tkl: 'Write in Tokelau with a natural, conversational tone suitable for video content.',
  tlh: 'Write in Klingon with a natural, conversational tone suitable for video content.',
  tli: 'Write in Tlingit with a natural, conversational tone suitable for video content.',
  tmh: 'Write in Tamashek with a natural, conversational tone suitable for video content.',
  tog: 'Write in Tonga (Nyasa) with a natural, conversational tone suitable for video content.',
  ton: 'Write in Tonga (Tonga Islands) with a natural, conversational tone suitable for video content.',
  tpi: 'Write in Tok Pisin with a natural, conversational tone suitable for video content.',
  tsn: 'Write in Tswana with a natural, conversational tone suitable for video content.',
  tso: 'Write in Tsonga with a natural, conversational tone suitable for video content.',
  tuk: 'Write in Turkmen with a natural, conversational tone suitable for video content.',
  tum: 'Write in Tumbuka with a natural, conversational tone suitable for video content.',
  tup: 'Write in Tupi languages with a natural, conversational tone suitable for video content.',
  tur: 'Write in Turkish with a natural, conversational tone suitable for video content.',
  tut: 'Write in Altaic languages with a natural, conversational tone suitable for video content.',
  twi: 'Write in Twi with a natural, conversational tone suitable for video content.',
  tyv: 'Write in Tuvinian with a natural, conversational tone suitable for video content.',
  udm: 'Write in Udmurt with a natural, conversational tone suitable for video content.',
  uga: 'Write in Ugaritic with a natural, conversational tone suitable for video content.',
  uig: 'Write in Uighur with a natural, conversational tone suitable for video content.',
  ukr: 'Write in Ukrainian with a natural, conversational tone suitable for video content.',
  umb: 'Write in Umbundu with a natural, conversational tone suitable for video content.',
  und: 'Write in Undetermined with a natural, conversational tone suitable for video content.',
  urd: 'Write in Urdu with a natural, conversational tone suitable for video content.',
  uzb: 'Write in Uzbek with a natural, conversational tone suitable for video content.',
  vai: 'Write in Vai with a natural, conversational tone suitable for video content.',
  ven: 'Write in Venda with a natural, conversational tone suitable for video content.',
  vie: 'Write in Vietnamese with a natural, conversational tone suitable for video content.',
  vol: 'Write in Volapük with a natural, conversational tone suitable for video content.',
  vot: 'Write in Votic with a natural, conversational tone suitable for video content.',
  wak: 'Write in Wakashan languages with a natural, conversational tone suitable for video content.',
  wal: 'Write in Walamo with a natural, conversational tone suitable for video content.',
  war: 'Write in Waray with a natural, conversational tone suitable for video content.',
  was: 'Write in Washo with a natural, conversational tone suitable for video content.',
  wel: 'Write in Welsh with a natural, conversational tone suitable for video content.',
  wln: 'Write in Walloon with a natural, conversational tone suitable for video content.',
  wol: 'Write in Wolof with a natural, conversational tone suitable for video content.',
  xal: 'Write in Kalmyk with a natural, conversational tone suitable for video content.',
  xho: 'Write in Xhosa with a natural, conversational tone suitable for video content.',
  yao: 'Write in Yao with a natural, conversational tone suitable for video content.',
  yap: 'Write in Yapese with a natural, conversational tone suitable for video content.',
  yid: 'Write in Yiddish with a natural, conversational tone suitable for video content.',
  yor: 'Write in Yoruba with a natural, conversational tone suitable for video content.',
  ypk: 'Write in Yupik languages with a natural, conversational tone suitable for video content.',
  zap: 'Write in Zapotec with a natural, conversational tone suitable for video content.',
  zbl: 'Write in Blissymbols with a natural, conversational tone suitable for video content.',
  zen: 'Write in Zenaga with a natural, conversational tone suitable for video content.',
  zha: 'Write in Zhuang with a natural, conversational tone suitable for video content.',
  znd: 'Write in Zande languages with a natural, conversational tone suitable for video content.',
  zul: 'Write in Zulu with a natural, conversational tone suitable for video content.',
  zun: 'Write in Zuni with a natural, conversational tone suitable for video content.',
  zxx: 'Write in No linguistic content with a natural, conversational tone suitable for video content.',
  zza: 'Write in Zaza with a natural, conversational tone suitable for video content.',
} as const;

// Language names for UI display
export const LANGUAGE_NAMES = {
  en: 'English',
  pl: 'Polish',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  ar: 'Arabic',
  hi: 'Hindi',
  tr: 'Turkish',
  nl: 'Dutch',
  sv: 'Swedish',
  no: 'Norwegian',
  da: 'Danish',
  fi: 'Finnish',
  cs: 'Czech',
  sk: 'Slovak',
  hu: 'Hungarian',
  ro: 'Romanian',
  bg: 'Bulgarian',
  hr: 'Croatian',
  sr: 'Serbian',
  sl: 'Slovenian',
  et: 'Estonian',
  lv: 'Latvian',
  lt: 'Lithuanian',
  uk: 'Ukrainian',
  be: 'Belarusian',
  kk: 'Kazakh',
  uz: 'Uzbek',
  ky: 'Kyrgyz',
  tg: 'Tajik',
  tk: 'Turkmen',
  az: 'Azerbaijani',
  ka: 'Georgian',
  hy: 'Armenian',
  he: 'Hebrew',
  fa: 'Persian',
  ur: 'Urdu',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  kn: 'Kannada',
  gu: 'Gujarati',
  pa: 'Punjabi',
  mr: 'Marathi',
  or: 'Odia',
  as: 'Assamese',
  ne: 'Nepali',
  si: 'Sinhala',
  my: 'Burmese',
  km: 'Khmer',
  lo: 'Lao',
  th: 'Thai',
  vi: 'Vietnamese',
  id: 'Indonesian',
  ms: 'Malay',
  tl: 'Tagalog',
  ceb: 'Cebuano',
  jv: 'Javanese',
  su: 'Sundanese',
  min: 'Minangkabau',
  ban: 'Balinese',
  bug: 'Buginese',
  ace: 'Acehnese',
  gor: 'Gorontalo',
  mak: 'Makassarese',
  mad: 'Madurese',
  bjn: 'Banjarese',
  sas: 'Sasak',
  btk: 'Batak',
  day: 'Dayak',
  iba: 'Iban',
  kng: 'Kenyah',
  kwh: 'Kayan',
  lbn: 'Lun Bawang',
  mdr: 'Mandar',
  mqy: 'Manggarai',
  nij: 'Ngaju',
  rej: 'Rejang',
  sda: 'Sumbawa',
  sdh: 'Southern Kurdish',
  sga: 'Old Irish',
  sgn: 'Sign Language',
  shn: 'Shan',
  sid: 'Sidamo',
  sin: 'Sinhala',
  slk: 'Slovak',
  slv: 'Slovenian',
  sma: 'Southern Sami',
  sme: 'Northern Sami',
  smj: 'Lule Sami',
  smn: 'Inari Sami',
  sms: 'Skolt Sami',
  sna: 'Shona',
  snd: 'Sindhi',
  som: 'Somali',
  sot: 'Southern Sotho',
  spa: 'Spanish',
  sqi: 'Albanian',
  srd: 'Sardinian',
  srp: 'Serbian',
  ssw: 'Swati',
  sun: 'Sundanese',
  sus: 'Susu',
  swa: 'Swahili',
  swe: 'Swedish',
  tah: 'Tahitian',
  tam: 'Tamil',
  tat: 'Tatar',
  tel: 'Telugu',
  tem: 'Timne',
  ter: 'Tereno',
  tet: 'Tetum',
  tgk: 'Tajik',
  tgl: 'Tagalog',
  tha: 'Thai',
  tig: 'Tigre',
  tir: 'Tigrinya',
  tiv: 'Tiv',
  tkl: 'Tokelau',
  tlh: 'Klingon',
  tli: 'Tlingit',
  tmh: 'Tamashek',
  tog: 'Tonga (Nyasa)',
  ton: 'Tonga (Tonga Islands)',
  tpi: 'Tok Pisin',
  tsn: 'Tswana',
  tso: 'Tsonga',
  tuk: 'Turkmen',
  tum: 'Tumbuka',
  tup: 'Tupi languages',
  tur: 'Turkish',
  tut: 'Altaic languages',
  twi: 'Twi',
  tyv: 'Tuvinian',
  udm: 'Udmurt',
  uga: 'Ugaritic',
  uig: 'Uighur',
  ukr: 'Ukrainian',
  umb: 'Umbundu',
  und: 'Undetermined',
  urd: 'Urdu',
  uzb: 'Uzbek',
  vai: 'Vai',
  ven: 'Venda',
  vie: 'Vietnamese',
  vol: 'Volapük',
  vot: 'Votic',
  wak: 'Wakashan languages',
  wal: 'Walamo',
  war: 'Waray',
  was: 'Washo',
  wel: 'Welsh',
  wln: 'Walloon',
  wol: 'Wolof',
  xal: 'Kalmyk',
  xho: 'Xhosa',
  yao: 'Yao',
  yap: 'Yapese',
  yid: 'Yiddish',
  yor: 'Yoruba',
  ypk: 'Yupik languages',
  zap: 'Zapotec',
  zbl: 'Blissymbols',
  zen: 'Zenaga',
  zha: 'Zhuang',
  znd: 'Zande languages',
  zul: 'Zulu',
  zun: 'Zuni',
  zxx: 'No linguistic content',
  zza: 'Zaza',
} as const;

// Business Profile operations
export async function createBusinessProfile(
  userId: number,
  profile: BusinessProfile
): Promise<{ id: number } | null> {
  try {
    const result = await pool.query(
      `INSERT INTO business_profiles (user_id, offer, avatar, problems, desires, tone) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`,
      [userId, profile.offer, profile.avatar, profile.problems, profile.desires, profile.tone]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating business profile:', error);
    return null;
  }
}

export async function getBusinessProfile(userId: number, profileId: number): Promise<BusinessProfile | null> {
  try {
    const result = await pool.query(
      `SELECT offer, avatar, problems, desires, tone 
       FROM business_profiles 
       WHERE id = $1 AND user_id = $2`,
      [profileId, userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching business profile:', error);
    return null;
  }
}

export async function getUserBusinessProfiles(userId: number): Promise<Array<BusinessProfile & { id: number }>> {
  try {
    const result = await pool.query(
      `SELECT id, offer, avatar, problems, desires, tone 
       FROM business_profiles 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching user business profiles:', error);
    return [];
  }
}

export async function updateBusinessProfile(
  userId: number,
  profileId: number,
  profile: BusinessProfile
): Promise<boolean> {
  try {
    const result = await pool.query(
      `UPDATE business_profiles 
       SET offer = $3, avatar = $4, problems = $5, desires = $6, tone = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [profileId, userId, profile.offer, profile.avatar, profile.problems, profile.desires, profile.tone]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error updating business profile:', error);
    return false;
  }
}

// Campaign operations
export async function createCampaign(
  userId: number,
  businessProfileId: number,
  vslTitle: string,
  campaignData: CampaignOutput
): Promise<{ id: number } | null> {
  try {
    const result = await pool.query(
      `INSERT INTO campaigns (
        user_id, business_profile_id, vsl_title, 
        vsl_script_a, vsl_script_b, 
        video_scripts, ad_copy_a, ad_copy_b, 
        headline_a, headline_b, language
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING id`,
      [
        userId,
        businessProfileId,
        vslTitle,
        campaignData.vsl.vslScriptA,
        campaignData.vsl.vslScriptB,
        JSON.stringify(campaignData.ads.videoScripts),
        campaignData.ads.adCopyA,
        campaignData.ads.adCopyB,
        campaignData.ads.headlineA,
        campaignData.ads.headlineB,
        campaignData.metadata?.language || 'en'
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating campaign:', error);
    return null;
  }
}

export async function getCampaign(userId: number, campaignId: number): Promise<CampaignOutput | null> {
  try {
    const result = await pool.query(
      `SELECT c.*, bp.offer, bp.avatar, bp.problems, bp.desires, bp.tone
       FROM campaigns c
       JOIN business_profiles bp ON c.business_profile_id = bp.id
       WHERE c.id = $1 AND c.user_id = $2`,
      [campaignId, userId]
    );
    
    const row = result.rows[0];
    if (!row) return null;

    return {
      vsl: {
        vslScriptA: row.vsl_script_a,
        vslScriptB: row.vsl_script_b
      },
      ads: {
        videoScripts: row.video_scripts,
        adCopyA: row.ad_copy_a,
        adCopyB: row.ad_copy_b,
        headlineA: row.headline_a,
        headlineB: row.headline_b
      },
      metadata: {
        title: row.vsl_title,
        generatedAt: row.created_at.toISOString(),
        businessProfile: {
          offer: row.offer,
          avatar: row.avatar,
          problems: row.problems,
          desires: row.desires,
          tone: row.tone,
          language: row.language || 'en'
        },
        language: row.language || 'en'
      }
    };
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return null;
  }
}

export async function getUserCampaigns(userId: number): Promise<Array<{ id: number; title: string; createdAt: string }>> {
  try {
    const result = await pool.query(
      `SELECT id, vsl_title, created_at 
       FROM campaigns 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      title: row.vsl_title,
      createdAt: row.created_at.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching user campaigns:', error);
    return [];
  }
}

export async function deleteCampaign(userId: number, campaignId: number): Promise<boolean> {
  try {
    const result = await pool.query(
      'DELETE FROM campaigns WHERE id = $1 AND user_id = $2',
      [campaignId, userId]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return false;
  }
}