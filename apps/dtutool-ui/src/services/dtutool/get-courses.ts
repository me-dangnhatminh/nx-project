import axios from "axios";
import * as cheerio from "cheerio";
import { CourseInfo } from "@/lib/types";
import { dtuParamsMapper } from "./mapper";

const isEmpty = (str: string | undefined | null): boolean => {
  return !str || str.trim() === "";
};

export const getCourses = async (params: {
  academic: string;
  semester: number;
  search?: string;
}): Promise<Array<CourseInfo>> => {
  const dtuParams = dtuParamsMapper.toDTU(params);

  const url = `https://courses.duytan.edu.vn/Modules/academicprogram/CourseResultSearch.aspx`;
  const response = await axios.get(url, {
    params: {
      keyword2: `*${params?.search || ""}*`,
      hocky: dtuParams.semesterId,
      // t: new Date().getTime(),
      scope: "1~3~2",
    },
  });

  const data = response.data;
  if (!data || typeof data !== "string") {
    throw new Error("Invalid data received");
  }
  const $ = cheerio.load(data);
  const table = $(".tb-calendar");
  const rows = table.find("tbody tr.lop");
  const courses: Array<CourseInfo> = [];
  rows.each((_index, element) => {
    const row = $(element);
    const td = row.find("td a");
    const href = td.attr("href");
    if (!href) throw new Error("Invalid href received");
    const hrefParams = new URLSearchParams(href.split("?")[1]);
    if (isEmpty(hrefParams.get("courseid"))) {
      throw new Error("Invalid courseId received");
    }
    const courseId = Number(hrefParams.get("courseid"));
    // const semesterId = hrefParams.get("timespan") || "";
    const courseCode = td.first().text().trim();
    const courseName = td.last().text().trim();
    courses.push({ courseCode, courseId, courseName });
  });
  return courses;
};
