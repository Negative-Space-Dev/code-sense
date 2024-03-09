import { CustomTextSearchMatch } from "./types";

export const countResults = (results: CustomTextSearchMatch[]) => {
  return results.reduce((accumulator, current) => {
    if (!current.outOfUris) return accumulator + current.ranges.length;
    return accumulator + current.outOfUris.filter(entry => entry !== null).length
  }, 0);
};