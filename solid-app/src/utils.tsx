import { CustomTextSearchMatch } from "./types";

export const countResults = (results: CustomTextSearchMatch[]) => {
  return results.reduce((accumulator, current) => accumulator + current.ranges.length, 0);
};