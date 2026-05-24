/**
 * Philippine delivery zones for Foodie.ph
 *
 * Each zone covers one or more provinces/cities. The `keywords` array is used
 * to detect which zone a free-text address belongs to. Keywords are matched
 * case-insensitively against the full address string.
 */

export type PhRegion = {
  /** Short key stored in the database */
  value: string;
  /** Human-readable label shown in the UI */
  label: string;
  /** Address keywords that map to this region */
  keywords: string[];
};

export const PH_REGIONS: PhRegion[] = [
  {
    value: "NCR",
    label: "NCR – Metro Manila",
    keywords: [
      "manila", "makati", "quezon city", "quezon", "pasig", "taguig",
      "mandaluyong", "marikina", "caloocan", "malabon", "navotas",
      "valenzuela", "las pinas", "las piñas", "parañaque", "paranaque",
      "muntinlupa", "pateros", "pasay", "san juan", "ncr",
      "metro manila", "bgc", "bonifacio global", "ortigas",
    ],
  },
  {
    value: "CAR",
    label: "CAR – Cordillera",
    keywords: [
      "baguio", "benguet", "la union", "la-union", "ifugao",
      "kalinga", "apayao", "mountain province", "abra", "cordillera",
    ],
  },
  {
    value: "R1",
    label: "Region I – Ilocos",
    keywords: [
      "ilocos norte", "ilocos sur", "pangasinan", "la union",
      "vigan", "laoag", "dagupan", "san fernando", "ilocos",
    ],
  },
  {
    value: "R2",
    label: "Region II – Cagayan Valley",
    keywords: [
      "cagayan", "isabela", "quirino", "nueva vizcaya", "batanes",
      "tuguegarao", "ilagan", "cagayan valley",
    ],
  },
  {
    value: "R3",
    label: "Region III – Central Luzon",
    keywords: [
      "pampanga", "bulacan", "angeles", "mabalacat", "san fernando",
      "olongapo", "zambales", "bataan", "nueva ecija", "tarlac",
      "cabanatuan", "clark", "central luzon",
    ],
  },
  {
    value: "R4A",
    label: "Region IV-A – CALABARZON",
    keywords: [
      "cavite", "laguna", "batangas", "rizal", "quezon province",
      "antipolo", "bacoor", "imus", "dasmariñas", "dasmarinas",
      "calamba", "santa rosa", "sta rosa", "lipa", "batangas city",
      "calabarzon",
    ],
  },
  {
    value: "R4B",
    label: "Region IV-B – MIMAROPA",
    keywords: [
      "palawan", "mindoro", "marinduque", "romblon", "occidental mindoro",
      "oriental mindoro", "puerto princesa", "calapan", "mimaropa",
    ],
  },
  {
    value: "R5",
    label: "Region V – Bicol",
    keywords: [
      "albay", "camarines sur", "camarines norte", "catanduanes",
      "masbate", "sorsogon", "legazpi", "naga", "bicol",
    ],
  },
  {
    value: "R6",
    label: "Region VI – Western Visayas",
    keywords: [
      "iloilo", "bacolod", "negros occidental", "aklan", "antique",
      "capiz", "guimaras", "boracay", "western visayas",
    ],
  },
  {
    value: "R7",
    label: "Region VII – Central Visayas (Cebu)",
    keywords: [
      "cebu", "mandaue", "lapu-lapu", "lapu lapu", "lapulapu",
      "bohol", "negros oriental", "siquijor", "tagbilaran",
      "talisay", "carcar", "danao", "central visayas",
    ],
  },
  {
    value: "R8",
    label: "Region VIII – Eastern Visayas",
    keywords: [
      "leyte", "samar", "biliran", "eastern samar", "northern samar",
      "southern leyte", "tacloban", "ormoc", "eastern visayas",
    ],
  },
  {
    value: "R9",
    label: "Region IX – Zamboanga Peninsula",
    keywords: [
      "zamboanga", "zamboanga del sur", "zamboanga del norte",
      "zamboanga sibugay", "isabela city", "zamboanga peninsula",
    ],
  },
  {
    value: "R10",
    label: "Region X – Northern Mindanao",
    keywords: [
      "cagayan de oro", "cdo", "bukidnon", "camiguin", "lanao del norte",
      "misamis occidental", "misamis oriental", "northern mindanao",
    ],
  },
  {
    value: "R11",
    label: "Region XI – Davao Region",
    keywords: [
      "davao", "davao city", "davao del sur", "davao del norte",
      "davao oriental", "davao occidental", "compostela valley",
      "davao de oro", "tagum", "digos", "samal", "davao region",
    ],
  },
  {
    value: "R12",
    label: "Region XII – SOCCSKSARGEN",
    keywords: [
      "south cotabato", "north cotabato", "sultan kudarat", "sarangani",
      "general santos", "koronadal", "kidapawan", "soccsksargen",
    ],
  },
  {
    value: "R13",
    label: "Region XIII – Caraga",
    keywords: [
      "agusan del norte", "agusan del sur", "surigao del norte",
      "surigao del sur", "dinagat islands", "butuan", "caraga",
    ],
  },
  {
    value: "BARMM",
    label: "BARMM – Bangsamoro",
    keywords: [
      "lanao del sur", "maguindanao", "basilan", "sulu", "tawi-tawi",
      "cotabato city", "marawi", "bangsamoro", "barmm",
    ],
  },
];

/** Map of region value → PhRegion for fast lookups */
export const PH_REGION_MAP = new Map<string, PhRegion>(
  PH_REGIONS.map((r) => [r.value, r])
);

/**
 * Try to detect the Philippine delivery zone from a free-text address.
 * Returns the region `value` string (e.g. `"NCR"`, `"R7"`) or `null` when
 * no keyword matches.
 */
export function extractRegionFromAddress(address: string): string | null {
  if (!address) return null;
  const lower = address.toLowerCase();

  for (const region of PH_REGIONS) {
    for (const kw of region.keywords) {
      // Use word-boundary-like check: the keyword must be surrounded by
      // non-alphanumeric characters (or start/end of string) so that e.g.
      // "cagayan" doesn't accidentally match inside another word.
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
      if (pattern.test(lower)) return region.value;
    }
  }

  return null;
}

/**
 * Return the human-readable label for a stored region value.
 * Falls back to the raw value if the region is unknown.
 */
export function regionLabel(value: string | null | undefined): string {
  if (!value) return "Unknown region";
  return PH_REGION_MAP.get(value)?.label ?? value;
}
