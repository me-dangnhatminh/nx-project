export const dtuParamsMapper = {
  toDTU: (params: { semester: number; academic: string }) => {
    const { semester, academic } = params;
    const year = academic.split('-').map(Number);
    const startYear = year[0];
    const endYear = year[1];
    if (endYear - startYear !== 1) {
      throw new Error('Invalid year format, eg: 2024-2025');
    }
    const baseYear = 2022;
    const baseId = 78;
    const diff = startYear - baseYear;
    const yearId = baseId + diff * 4;
    const semesterId = yearId + semester;
    return { yearId, semesterId };
  },
  toDomain: (params: { yearId: number; semesterId: number }) => {
    const { semesterId, yearId } = params;
    const semester = semesterId - yearId;
    const startYear = Math.floor(yearId / 4) + 2022;
    const endYear = startYear + 1;
    return { semester, academic: `${startYear}-${endYear}` };
  },
};
