/**
 * Source record for the photographs currently used on the site.
 *
 * Every active image is a Wikimedia Commons file dedicated under CC0.
 * Credit strips were removed from the pages and the footer, so this module is
 * intentionally not rendered anywhere. Keep it as the project's record of
 * author, source file and licence for each active image.
 */

export type PhotoAttribution = {
  /** Short description of what the photograph shows. */
  subject: string;
  /** Commons file page — the authoritative source for author + licence. */
  fileUrl: string;
  author: string;
  /** Licence as printed by Wikimedia Commons. */
  licence: string;
  licenceUrl: string;
};

export const PHOTO_ATTRIBUTIONS = {
  students: {
    subject: "Two young Bhutanese girls tending a water supply",
    fileUrl:
      "https://commons.wikimedia.org/wiki/File:Two_Bhutanese_girls_take_care_of_the_water_supply.jpg",
    author: "Mussi Katz",
    licence: "CC0",
    licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  thimphu: {
    subject: "Handicraft shops on Norzin Lam road in Thimphu",
    fileUrl:
      "https://commons.wikimedia.org/wiki/File:%27Handicrafts_Bazaar%27_in_Thimphu..JPG",
    author: "Rudolph.A.furtado",
    licence: "CC0",
    licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  street: {
    subject: "A main road in Thimphu",
    fileUrl: "https://commons.wikimedia.org/wiki/File:A_Main_Road_in_Thimphu.jpg",
    author: "Veera.sj",
    licence: "CC0",
    licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  hills: {
    subject: "Main road with hill in the backdrop",
    fileUrl:
      "https://commons.wikimedia.org/wiki/File:Main_Road_with_Hill_in_the_backdrop.jpg",
    author: "Veera.sj",
    licence: "CC0",
    licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  bank: {
    subject: "Bhutan Post office and Bhutan Bank building",
    fileUrl:
      "https://commons.wikimedia.org/wiki/File:%27Bhutan_Post_office_%26_Bhutan_Bank%27_building..JPG",
    author: "Rudolph.A.furtado",
    licence: "CC0",
    licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  housing: {
    subject: "Common public housing in Thimphu",
    fileUrl:
      "https://commons.wikimedia.org/wiki/File:Common_public_housing_in_Thimphu..JPG",
    author: "Rudolph.A.furtado",
    licence: "CC0",
    licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
} as const;

export const PHOTO_CREDIT_LIST = Object.values(PHOTO_ATTRIBUTIONS);
