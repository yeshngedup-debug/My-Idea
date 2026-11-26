/**
 * Attribution record for every photograph used on the site.
 *
 * All files are Wikimedia Commons images used under CC BY-SA 3.0 or
 * CC BY-SA 4.0, both of which require attribution of the author. The credit
 * strips were removed from the pages and from the footer, so this module is
 * intentionally not rendered anywhere. Keep it as the project's record of
 * author, source file and licence for each image.
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
  valley: {
    subject: "Bhutanese youth at work in Thimphu",
    fileUrl: "https://commons.wikimedia.org/wiki/File:Bhutanese_youth.jpg",
    author: "Doctor 17",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  dzong: {
    subject: "Boys in Bhutanese national dress",
    fileUrl: "https://commons.wikimedia.org/wiki/File:Boys_in_Bhutan_national_dress.jpg",
    author: "Keith Mason",
    licence: "CC BY-SA 3.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
  market: {
    subject: "Bhutanese girls in national dress",
    fileUrl: "https://commons.wikimedia.org/wiki/File:Bhutanese_Girls_in_National_Dress.jpg",
    author: "Christopher J. Fynn",
    licence: "CC BY-SA 3.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
  thimphu: {
    subject: "View across central Thimphu",
    fileUrl: "https://commons.wikimedia.org/wiki/File:View_of_central_Thimphu_2019-07-21.jpg",
    author: "Christopher J. Fynn",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  flags: {
    subject: "Prayer flags across a hillside in Sopsokha",
    fileUrl: "https://commons.wikimedia.org/wiki/File:Prayer_flags,_Sopsokha,_Bhutan.jpg",
    author: "Bernard Gagnon",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  archery: {
    subject: "Students practising archery",
    fileUrl: "https://commons.wikimedia.org/wiki/File:Students_practice_archery_in_Bhutan.jpg",
    author: "Glacierfanclub",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  textile: {
    subject: "Bhutanese woollen textile",
    fileUrl: "https://commons.wikimedia.org/wiki/File:Bhutanese_woollen_textile_01.jpg",
    author: "Christopher J. Fynn",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
} as const;

export const PHOTO_CREDIT_LIST = Object.values(PHOTO_ATTRIBUTIONS);
